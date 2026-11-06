import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { Editor } from "../tiptap/Editor.ts";
import { decodeHarperPayload } from "../tiptap/extensions/harper/index.ts";
import type { HarperIssue } from "./types.ts";

export const DEFAULT_OPEN_DELAY_MS = 150;
export const DEFAULT_SWITCH_DELAY_MS = 50;
export const DEFAULT_CLOSE_DELAY_MS = 200;

export interface HarperActiveIssue {
  readonly issue: HarperIssue;
  readonly from: number;
  readonly to: number;
}

export interface HarperHoverControllerOptions {
  readonly editor: Editor;
  readonly getPopoverElement: () => HTMLElement | null;
  readonly openDelayMs?: number;
  readonly switchDelayMs?: number;
  readonly closeDelayMs?: number;
}

export interface HarperHoverController {
  readonly active: HarperActiveIssue | null;
  readonly anchor: HTMLElement | null;
  readonly isOpen: boolean;
  position(): Promise<void>;
  mount(): () => void;
  openForElement(element: HTMLElement): void;
  accept(suggestion: string): void;
  dismiss(): void;
  close(): void;
  handlePointerOver(event: PointerEvent): void;
  handlePointerOut(event: PointerEvent): void;
  handlePopoverPointerEnter(): void;
  handlePopoverPointerLeave(event: PointerEvent): void;
  handleClick(event: MouseEvent): void;
  handleDocumentPointerDown(event: PointerEvent): void;
  handleKeyDown(event: KeyboardEvent): void;
}

export function createHarperHoverController(
  options: HarperHoverControllerOptions,
): HarperHoverController {
  const { editor, getPopoverElement } = options;
  const openDelayMs = options.openDelayMs ?? DEFAULT_OPEN_DELAY_MS;
  const switchDelayMs = options.switchDelayMs ?? DEFAULT_SWITCH_DELAY_MS;
  const closeDelayMs = options.closeDelayMs ?? DEFAULT_CLOSE_DELAY_MS;

  let anchor = $state<HTMLElement | null>(null);
  let active = $state<HarperActiveIssue | null>(null);
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let dismissedId: string | null = null;

  function clearOpenTimer(): void {
    if (openTimer !== null) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  }

  function clearCloseTimer(): void {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function close(): void {
    clearOpenTimer();
    clearCloseTimer();
    active = null;
    anchor = null;
  }

  async function position(): Promise<void> {
    if (anchor === null) {
      return;
    }
    const popover = getPopoverElement();
    if (popover === null) {
      return;
    }
    if (!anchor.isConnected) {
      close();
      return;
    }
    const { x, y } = await computePosition(anchor, popover, {
      placement: "bottom-start",
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    });
    Object.assign(popover.style, { left: `${x}px`, top: `${y}px` });
  }

  function openForElement(element: HTMLElement): void {
    const rawPayload = element.getAttribute("data-harper-payload");
    if (rawPayload === null) {
      close();
      return;
    }
    const payload = decodeHarperPayload(rawPayload);
    if (payload === null) {
      close();
      return;
    }
    const view = editor.view;
    if (view === undefined) {
      close();
      return;
    }
    if (view === null) {
      close();
      return;
    }
    const start = view.posAtDOM(element, 0);
    if (start < 0) {
      close();
      return;
    }
    let length = 0;
    const textContent = element.textContent;
    if (textContent !== null) {
      length = textContent.length;
    }
    const end = start + length;
    anchor = element;
    active = { issue: payload, from: start, to: end };
  }

  function scheduleOpen(element: HTMLElement): void {
    clearOpenTimer();
    let delay = openDelayMs;
    if (active !== null) {
      delay = switchDelayMs;
    }
    openTimer = setTimeout(() => {
      openTimer = null;
      openForElement(element);
    }, delay);
  }

  function scheduleClose(): void {
    clearOpenTimer();
    clearCloseTimer();
    closeTimer = setTimeout(() => {
      closeTimer = null;
      close();
    }, closeDelayMs);
  }

  function handlePointerOver(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target === null) {
      return;
    }
    const idAttr = target.closest<HTMLElement>("[data-harper-id]");
    if (idAttr === null) {
      return;
    }
    const id = idAttr.getAttribute("data-harper-id");
    if (id !== null) {
      if (id === dismissedId) {
        return;
      }
    }
    if (anchor === idAttr) {
      clearCloseTimer();
      return;
    }
    clearCloseTimer();
    scheduleOpen(idAttr);
  }

  function handlePointerOut(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target === null) {
      return;
    }
    const idAttr = target.closest<HTMLElement>("[data-harper-id]");
    if (idAttr === null) {
      return;
    }
    const related = event.relatedTarget as Node | null;
    if (related !== null) {
      if (idAttr.contains(related)) {
        return;
      }
      const popover = getPopoverElement();
      if (popover !== null) {
        if (popover.contains(related)) {
          return;
        }
      }
    }
    const id = idAttr.getAttribute("data-harper-id");
    if (id !== null) {
      if (id === dismissedId) {
        dismissedId = null;
      }
    }
    clearOpenTimer();
    if (active !== null) {
      scheduleClose();
    }
  }

  function handlePopoverPointerEnter(): void {
    clearCloseTimer();
  }

  function handlePopoverPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      return;
    }
    const related = event.relatedTarget as Node | null;
    if (related !== null) {
      if (anchor !== null) {
        if (anchor.contains(related)) {
          return;
        }
      }
    }
    scheduleClose();
  }

  function handleClick(event: MouseEvent): void {
    const popover = getPopoverElement();
    if (popover !== null) {
      if (popover.contains(event.target as Node)) {
        return;
      }
    }
    const target = event.target as HTMLElement | null;
    if (target === null) {
      return;
    }
    const idAttr = target.closest<HTMLElement>("[data-harper-id]");
    if (idAttr === null) {
      close();
      return;
    }
    dismissedId = null;
    clearOpenTimer();
    clearCloseTimer();
    openForElement(idAttr);
  }

  function handleDocumentPointerDown(event: PointerEvent): void {
    if (active === null) {
      return;
    }
    const target = event.target as Node | null;
    if (target === null) {
      return;
    }
    const popover = getPopoverElement();
    if (popover !== null) {
      if (popover.contains(target)) {
        return;
      }
    }
    if (anchor !== null) {
      if (anchor.contains(target)) {
        return;
      }
    }
    close();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      if (active !== null) {
        close();
      }
    }
  }

  function accept(suggestion: string): void {
    if (active === null) {
      return;
    }
    let from = active.from;
    let to = active.to;
    if (anchor !== null) {
      if (anchor.isConnected) {
        const view = editor.view;
        if (view !== undefined) {
          if (view !== null) {
            const start = view.posAtDOM(anchor, 0);
            if (start >= 0) {
              let length = 0;
              const textContent = anchor.textContent;
              if (textContent !== null) {
                length = textContent.length;
              }
              if (length > 0) {
                from = start;
                to = start + length;
              }
            }
          }
        }
      }
    }
    editor.chain().focus().insertContentAt({ from, to }, suggestion).run();
    close();
  }

  function dismiss(): void {
    if (active !== null) {
      dismissedId = active.issue.id;
    }
    close();
  }

  function mount(): () => void {
    const view = editor.view;
    if (view === undefined) {
      return () => {};
    }
    if (view === null) {
      return () => {};
    }
    const dom = view.dom;
    dom.addEventListener("pointerover", handlePointerOver);
    dom.addEventListener("pointerout", handlePointerOut);
    dom.addEventListener("click", handleClick);
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      dom.removeEventListener("pointerover", handlePointerOver);
      dom.removeEventListener("pointerout", handlePointerOut);
      dom.removeEventListener("click", handleClick);
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      clearOpenTimer();
      clearCloseTimer();
    };
  }

  return {
    get active() {
      return active;
    },
    get anchor() {
      return anchor;
    },
    get isOpen() {
      return active !== null;
    },
    position,
    mount,
    openForElement,
    accept,
    dismiss,
    close,
    handlePointerOver,
    handlePointerOut,
    handlePopoverPointerEnter,
    handlePopoverPointerLeave,
    handleClick,
    handleDocumentPointerDown,
    handleKeyDown,
  };
}
