import {
  mergeAttributes,
  type Node,
  type NodeViewProps,
  nodeInputRule,
  nodePasteRule,
} from "@tiptap/core";
import Image, { type ImageOptions } from "@tiptap/extension-image";
import type { Component } from "svelte";
import { SvelteNodeViewRenderer } from "../../renderers/SvelteNodeViewRenderer.ts";

const LINKED_IMAGE_INPUT_REGEX =
  /(?:^|\s)(\[!\[(.+|:?)]\((\S+?)(?:(?:\s+)["']([^"']+)["'])?\)]\((\S+?)(?:(?:\s+)["']([^"']+)["'])?\))$/;

const LINKED_IMAGE_PASTE_REGEX =
  /(?:^|\s)\[!\[(.+|:?)]\((\S+?)(?:(?:\s+)["']([^"']+)["'])?\)]\((\S+?)(?:(?:\s+)["']([^"']+)["'])?\)/g;

export const ImageExtended = (component: Component<NodeViewProps>): Node<ImageOptions, unknown> => {
  return Image.extend({
    addAttributes() {
      return {
        src: {
          default: null,
        },
        alt: {
          default: null,
        },
        title: {
          default: null,
        },
        width: {
          default: "100%",
        },
        height: {
          default: null,
        },
        align: {
          default: "left",
        },
        href: {
          default: null,
        },
        linkTitle: {
          default: null,
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: "a[href] img",
          getAttrs: (dom) => {
            const img = dom as HTMLElement;
            const anchor = img.closest("a");
            return {
              src: img.getAttribute("src"),
              alt: img.getAttribute("alt"),
              title: img.getAttribute("title"),
              width: img.getAttribute("width") ?? img.style?.width ?? "100%",
              height: img.getAttribute("height") ?? img.style?.height ?? null,
              align: img.style?.textAlign ?? "left",
              href: anchor?.getAttribute("href") ?? null,
              linkTitle: anchor?.getAttribute("title") ?? null,
            };
          },
        },
        {
          tag: this.options.allowBase64 ? "img[src]" : 'img[src]:not([src^="data:"])',
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      const { href, linkTitle, ...rest } = HTMLAttributes;
      const imgAttrs = mergeAttributes(this.options.HTMLAttributes, rest);

      if (href) {
        const linkAttrs: Record<string, string> = {
          href,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        };
        if (linkTitle) {
          linkAttrs.title = linkTitle;
        }
        return ["a", linkAttrs, ["img", imgAttrs]];
      }

      return ["img", imgAttrs];
    },

    parseMarkdown(token, helpers) {
      return helpers.createNode("image", {
        src: token.href,
        title: token.title,
        alt: token.text,
      });
    },

    renderMarkdown(node) {
      const src = node.attrs?.src ?? "";
      const alt = node.attrs?.alt ?? "";
      const title = node.attrs?.title ?? "";
      const imageMd = title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;

      const href = node.attrs?.href;
      if (href) {
        const linkTitle = node.attrs?.linkTitle;
        if (linkTitle) {
          return `[${imageMd}](${href} "${linkTitle}")`;
        }
        return `[${imageMd}](${href})`;
      }

      const linkMark = node.marks?.find((mark: { type: string }) => mark.type === "link");
      if (linkMark?.attrs?.href) {
        const markHref = linkMark.attrs.href as string;
        const markTitle = linkMark.attrs.title as string | undefined;
        if (markTitle) {
          return `[${imageMd}](${markHref} "${markTitle}")`;
        }
        return `[${imageMd}](${markHref})`;
      }

      return imageMd;
    },

    addInputRules() {
      return [
        nodeInputRule({
          find: LINKED_IMAGE_INPUT_REGEX,
          type: this.type,
          getAttributes: (match) => {
            const [, , alt, src, title, href, linkTitle] = match;
            return {
              src,
              alt,
              title: title ?? null,
              href,
              linkTitle: linkTitle ?? null,
            };
          },
        }),
        ...(this.parent?.() ?? []),
      ];
    },

    addPasteRules() {
      return [
        nodePasteRule({
          find: LINKED_IMAGE_PASTE_REGEX,
          type: this.type,
          getAttributes: (match) => {
            const [, alt, src, title, href, linkTitle] = match;
            return {
              src,
              alt,
              title: title ?? null,
              href,
              linkTitle: linkTitle ?? null,
            };
          },
        }),
        ...(this.parent?.() ?? []),
      ];
    },

    addNodeView: () => {
      return SvelteNodeViewRenderer(component);
    },
  }).configure({
    allowBase64: false,
  });
};
