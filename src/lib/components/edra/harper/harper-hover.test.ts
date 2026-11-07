import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { Editor } from "../tiptap/Editor.ts";
import {
  DEFAULT_CLOSE_DELAY_MS,
  DEFAULT_OPEN_DELAY_MS,
  DEFAULT_SWITCH_DELAY_MS,
  createHarperHoverController,
} from "./harper-hover.svelte.ts";

const computePositionMock = vi.fn(
  async (_reference?: unknown, _floating?: unknown, _options?: unknown) => ({
    x: 10,
    y: 20,
    middlewareData: {},
  }),
);

vi.mock("@floating-ui/dom", () => ({
  computePosition: (reference: unknown, floating: unknown, options?: unknown) =>
    computePositionMock(reference, floating, options),
  flip: () => ({ name: "flip" }),
  offset: () => ({ name: "offset" }),
  shift: () => ({ name: "shift" }),
  inline: () => ({ name: "inline" }),
  hide: () => ({ name: "hide" }),
}));

class FakeNode {
  readonly listeners = new Map<string, Set<(event: Event) => void>>();
  readonly attributes = new Map<string, string>();
  style: Record<string, string> = {};
  textContent: string | null = "sample text";
  isConnected = true;
  parentNode: FakeNode | null = null;

  getAttribute(name: string): string | null {
    const value = this.attributes.get(name);
    if (value === undefined) {
      return null;
    }
    return value;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  closest<T extends HTMLElement>(selector: string): T | null {
    if (selector === "[data-harper-id]") {
      if (this.attributes.has("data-harper-id")) {
        return this as unknown as T;
      }
    }
    return null;
  }

  contains(other: Node | null): boolean {
    return other === (this as unknown as Node);
  }

  addEventListener(type: string, handler: (event: Event) => void): void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(handler);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, handler: (event: Event) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatch(type: string, event: Event): void {
    for (const handler of this.listeners.get(type) ?? []) {
      handler(event);
    }
  }
}

function createFakePointerEvent(
  type: string,
  target: FakeNode | null,
  relatedTarget: FakeNode | null = null,
  pointerType = "mouse",
): PointerEvent {
  const event = new Event(type) as PointerEvent;
  Object.assign(event, { pointerType });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "relatedTarget", { value: relatedTarget });
  return event;
}

function createFakeMouseEvent(type: string, target: FakeNode | null): MouseEvent {
  const event = new Event(type) as MouseEvent;
  Object.defineProperty(event, "target", { value: target });
  return event;
}

function createFakeKeyboardEvent(key: string): KeyboardEvent {
  const event = new Event("keydown") as KeyboardEvent;
  Object.assign(event, { key });
  return event;
}

function createMockEditor() {
  const insertContentAt = vi.fn().mockReturnThis();
  const run = vi.fn().mockReturnThis();
  const focus = vi.fn().mockReturnThis();
  const chain = vi.fn(() => ({
    focus,
    insertContentAt,
    run,
  }));

  const dom = new FakeNode();
  const view = {
    dom: dom as unknown as HTMLElement,
    posAtDOM: vi.fn(() => 10),
  };

  const editor = {
    view,
    chain,
  } as unknown as Editor;

  return {
    editor,
    dom,
    view,
    chain,
    insertContentAt,
  };
}

describe("harper-hover controller", () => {
  let fakeDocument: FakeNode;

  beforeEach(() => {
    vi.useFakeTimers();
    fakeDocument = new FakeNode();
    Object.assign(globalThis, {
      document: fakeDocument,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function createIssueElement(id = "harper-1", suggestions = ["fixed"]): FakeNode {
    const el = new FakeNode();
    el.setAttribute("data-harper-id", id);
    const payload = encodeURIComponent(
      JSON.stringify({
        id,
        message: "Spelling error",
        suggestions,
        problem: "typo",
      }),
    );
    el.setAttribute("data-harper-payload", payload);
    el.textContent = "wrong";
    return el;
  }

  it("opens popover on hover after open delay", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    const overEvent = createFakePointerEvent("pointerover", issueEl);
    dom.dispatch("pointerover", overEvent);

    expect(controller.isOpen).toBe(false);

    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS - 1);
    expect(controller.isOpen).toBe(false);

    vi.advanceTimersByTime(1);
    expect(controller.isOpen).toBe(true);
    expect(controller.active?.issue.id).toBe("issue-1");
    expect(controller.anchor).toBe(issueEl as unknown as HTMLElement);

    unmount();
  });

  it("cancels scheduled open if pointer leaves before delay expires", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(50);

    dom.dispatch("pointerout", createFakePointerEvent("pointerout", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);

    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("ignores touch pointerover events", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl, null, "touch"));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);

    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("closes after close delay when leaving anchor, unless hovering popover", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);
    expect(controller.isOpen).toBe(true);

    // Pointer leaves anchor
    dom.dispatch("pointerout", createFakePointerEvent("pointerout", issueEl));
    vi.advanceTimersByTime(DEFAULT_CLOSE_DELAY_MS - 1);
    expect(controller.isOpen).toBe(true);

    // Enters popover before close delay expires
    controller.handlePopoverPointerEnter();
    vi.advanceTimersByTime(100);
    expect(controller.isOpen).toBe(true);

    // Leaves popover
    controller.handlePopoverPointerLeave(createFakePointerEvent("pointerleave", popover));
    vi.advanceTimersByTime(DEFAULT_CLOSE_DELAY_MS - 1);
    expect(controller.isOpen).toBe(true);

    vi.advanceTimersByTime(1);
    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("does not close when moving from popover back to anchor", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);

    controller.handlePopoverPointerEnter();

    // Move from popover to anchor
    controller.handlePopoverPointerLeave(createFakePointerEvent("pointerleave", popover, issueEl));

    vi.advanceTimersByTime(DEFAULT_CLOSE_DELAY_MS);
    expect(controller.isOpen).toBe(true);

    unmount();
  });

  it("switches quickly between issues when one is already open", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issue1 = createIssueElement("issue-1");
    const issue2 = createIssueElement("issue-2");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issue1));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);
    expect(controller.active?.issue.id).toBe("issue-1");

    // Move to issue 2
    dom.dispatch("pointerout", createFakePointerEvent("pointerout", issue1));
    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issue2));

    vi.advanceTimersByTime(DEFAULT_SWITCH_DELAY_MS);
    expect(controller.active?.issue.id).toBe("issue-2");

    unmount();
  });

  it("dismisses the issue and suppresses hover re-trigger until pointer leaves", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);
    expect(controller.isOpen).toBe(true);

    controller.dismiss();
    expect(controller.isOpen).toBe(false);

    // Hover again on the same element immediately
    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);
    expect(controller.isOpen).toBe(false);

    // Leave the element
    dom.dispatch("pointerout", createFakePointerEvent("pointerout", issueEl));

    // Now re-entering allows opening
    dom.dispatch("pointerover", createFakePointerEvent("pointerover", issueEl));
    vi.advanceTimersByTime(DEFAULT_OPEN_DELAY_MS);
    expect(controller.isOpen).toBe(true);

    unmount();
  });

  it("opens immediately on click", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("click", createFakeMouseEvent("click", issueEl));
    expect(controller.isOpen).toBe(true);
    expect(controller.active?.issue.id).toBe("issue-1");

    unmount();
  });

  it("closes on Escape key press", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("click", createFakeMouseEvent("click", issueEl));
    expect(controller.isOpen).toBe(true);

    fakeDocument.dispatch("keydown", createFakeKeyboardEvent("Escape"));
    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("closes when clicking outside", () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");

    dom.dispatch("click", createFakeMouseEvent("click", issueEl));
    expect(controller.isOpen).toBe(true);

    const outsideEl = new FakeNode();
    fakeDocument.dispatch("pointerdown", createFakePointerEvent("pointerdown", outsideEl));
    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("accepts a suggestion and inserts it into the editor", () => {
    const { editor, dom, insertContentAt } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1", ["replacement"]);
    issueEl.textContent = "wrong";

    dom.dispatch("click", createFakeMouseEvent("click", issueEl));
    expect(controller.isOpen).toBe(true);

    controller.accept("replacement");
    expect(insertContentAt).toHaveBeenCalledWith({ from: 10, to: 15 }, "replacement");
    expect(controller.isOpen).toBe(false);

    unmount();
  });

  it("positions popover with strategy: fixed and updates coordinates", async () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");
    dom.dispatch("click", createFakeMouseEvent("click", issueEl));
    expect(controller.isOpen).toBe(true);

    computePositionMock.mockResolvedValueOnce({
      x: 120,
      y: 340,
      middlewareData: {},
    });

    await controller.position();

    expect(computePositionMock).toHaveBeenCalledWith(
      issueEl,
      popover,
      expect.objectContaining({
        strategy: "fixed",
        placement: "bottom-start",
      }),
    );
    expect(popover.style.position).toBe("fixed");
    expect(popover.style.left).toBe("120px");
    expect(popover.style.top).toBe("340px");
    expect(popover.style.visibility).toBe("visible");

    unmount();
  });

  it("hides popover when referenceHidden is true in middlewareData", async () => {
    const { editor, dom } = createMockEditor();
    const popover = new FakeNode();
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    const unmount = controller.mount();
    const issueEl = createIssueElement("issue-1");
    dom.dispatch("click", createFakeMouseEvent("click", issueEl));

    computePositionMock.mockResolvedValueOnce({
      x: 120,
      y: 340,
      middlewareData: {
        hide: {
          referenceHidden: true,
        },
      },
    });

    await controller.position();

    expect(popover.style.visibility).toBe("hidden");

    unmount();
  });

  it("gracefully ignores position if anchor or popover is null", async () => {
    const { editor } = createMockEditor();
    let popover: FakeNode | null = null;
    const controller = createHarperHoverController({
      editor,
      getPopoverElement: () => popover as unknown as HTMLElement,
    });

    computePositionMock.mockClear();
    await controller.position();
    expect(computePositionMock).not.toHaveBeenCalled();
  });
});
