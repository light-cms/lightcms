import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { lintText } from "../../../harper/harper-client.ts";
import type { HarperIssue } from "../../../harper/types.ts";

const HARPER_PLUGIN_KEY = new PluginKey("harper");

const DEBOUNCE_MS = 250;

const SKIPPED_NODE_TYPES = new Set([
  "codeBlock",
  "code_block",
  "image",
  "mermaid",
  "iframe",
  "video",
  "audio",
  "callout",
  "tableCell",
  "tableHeader",
  "tableRow",
  "mathInline",
  "mathBlock",
  "mathematics",
  "horizontalRule",
  "tableOfContents",
]);

interface IssueMeta {
  from: number;
  to: number;
  issue: HarperIssue;
}

interface RawTextSegment {
  from: number;
  to: number;
  text: string;
}

interface MappedSegment {
  docFrom: number;
  docTo: number;
  plainFrom: number;
  plainTo: number;
}

interface PreparedPlainText {
  plainText: string;
  segments: MappedSegment[];
}

const collectTextSegments = (doc: PMNode): RawTextSegment[] => {
  const segments: RawTextSegment[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText) {
      return true;
    }

    const hasCodeMark = node.marks.some((mark) => mark.type.name === "code");
    if (hasCodeMark) {
      return false;
    }

    let textContent = "";
    if (typeof node.text === "string") {
      textContent = node.text;
    }

    segments.push({
      from: pos,
      to: pos + node.nodeSize,
      text: textContent,
    });

    return true;
  });

  return segments;
};

const preparePlainText = (rawSegments: RawTextSegment[]): PreparedPlainText => {
  let plainText = "";
  const segments: MappedSegment[] = [];

  for (let i = 0; i < rawSegments.length; i += 1) {
    const raw = rawSegments[i];
    if (i > 0) {
      plainText += "\n\n";
    }

    const plainFrom = plainText.length;
    plainText += raw.text;
    const plainTo = plainText.length;

    segments.push({
      docFrom: raw.from,
      docTo: raw.to,
      plainFrom,
      plainTo,
    });
  }

  return { plainText, segments };
};

const remapIssuesToDoc = (segments: MappedSegment[], issues: HarperIssue[]): IssueMeta[] => {
  if (segments.length === 0 || issues.length === 0) {
    return [];
  }

  const mapped: IssueMeta[] = [];

  for (const issue of issues) {
    if (issue.from < 0 || issue.to <= issue.from) {
      continue;
    }

    for (const segment of segments) {
      const overlapPlainFrom = Math.max(issue.from, segment.plainFrom);
      const overlapPlainTo = Math.min(issue.to, segment.plainTo);

      if (overlapPlainFrom < overlapPlainTo) {
        const docFrom = segment.docFrom + (overlapPlainFrom - segment.plainFrom);
        const docTo = segment.docFrom + (overlapPlainTo - segment.plainFrom);

        mapped.push({ from: docFrom, to: docTo, issue });
      }
    }
  }

  return mapped;
};

const encodePayload = (issue: HarperIssue): string => {
  const safe = {
    id: issue.id,
    problem: issue.problem,
    message: issue.message,
    suggestions: issue.suggestions,
  };
  return encodeURIComponent(JSON.stringify(safe));
};

export const decodeHarperPayload = (raw: string | null): HarperIssue | null => {
  if (raw === null || raw.length === 0) {
    return null;
  }

  try {
    const json = JSON.parse(decodeURIComponent(raw));
    if (typeof json !== "object" || json === null) {
      return null;
    }

    let id = "";
    if (typeof json.id === "string") {
      id = json.id;
    }
    if (id.length === 0) {
      return null;
    }

    let message = "";
    if (typeof json.message === "string") {
      message = json.message;
    }

    let problem: string | undefined = undefined;
    if (typeof json.problem === "string") {
      problem = json.problem;
    }

    let suggestions: string[] = [];
    if (Array.isArray(json.suggestions)) {
      suggestions = json.suggestions.filter(
        (value: unknown): value is string => typeof value === "string",
      );
    }

    return {
      id,
      from: 0,
      to: 0,
      message,
      suggestions,
      problem,
    };
  } catch {
    return null;
  }
};

const buildDecorations = (doc: PMNode, metas: IssueMeta[]): DecorationSet => {
  const decorations: Decoration[] = [];

  for (const meta of metas) {
    const payload = encodePayload(meta.issue);
    decorations.push(
      Decoration.inline(meta.from, meta.to, {
        class: "harper-issue",
        "data-harper-id": meta.issue.id,
        "data-harper-payload": payload,
      }),
    );
  }

  return DecorationSet.create(doc, decorations);
};

export const Harper = Extension.create({
  name: "harper",

  addProseMirrorPlugins() {
    const editor = this.editor;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;

    const schedule = () => {
      pending = true;
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        void runLint();
      }, DEBOUNCE_MS);
    };

    const runLint = async () => {
      if (!pending) {
        return;
      }
      pending = false;

      try {
        const doc = editor.state.doc;
        const rawSegments = collectTextSegments(doc).filter((segment) => {
          const $pos = doc.resolve(segment.from);
          for (let d = $pos.depth; d >= 0; d -= 1) {
            if (SKIPPED_NODE_TYPES.has($pos.node(d).type.name)) {
              return false;
            }
          }
          return true;
        });

        const { plainText, segments } = preparePlainText(rawSegments);
        const issues = await lintText(plainText);
        const metas = remapIssuesToDoc(segments, issues);
        const view = editor.view;

        if (!view || view.isDestroyed) {
          return;
        }

        view.dispatch(view.state.tr.setMeta(HARPER_PLUGIN_KEY, { metas }));
      } catch (error) {
        console.error("[harper] lint failed:", error);
      }
    };

    return [
      new Plugin({
        key: HARPER_PLUGIN_KEY,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, oldState, _oldEditorState, newEditorState) {
            if (tr.docChanged) {
              schedule();
            }
            const meta = tr.getMeta(HARPER_PLUGIN_KEY) as { metas: IssueMeta[] } | undefined;
            if (meta !== undefined) {
              return buildDecorations(newEditorState.doc, meta.metas);
            }
            return oldState.map(tr.mapping, newEditorState.doc);
          },
        },
        props: {
          decorations(state) {
            return HARPER_PLUGIN_KEY.getState(state) as DecorationSet;
          },
        },
        view() {
          schedule();
          return {
            destroy() {
              if (timer !== null) {
                clearTimeout(timer);
                timer = null;
              }
            },
          };
        },
      }),
    ];
  },
});

export type { HarperIssue };
