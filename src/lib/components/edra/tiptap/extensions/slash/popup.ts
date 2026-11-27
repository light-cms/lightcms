import { autoUpdate, computePosition, flip, offset, type Placement } from "@floating-ui/dom";

const POPUP_MAX_WIDTH = "16rem";

type RectProvider = () => DOMRect | null;

/**
 * Owns the floating popup used by the slash menu: DOM container creation,
 * floating-ui positioning, auto-update on scroll/resize, and teardown.
 */
export class SlashPopup {
  readonly element: HTMLElement;

  private getRect: RectProvider | null = null;

  private contextElement: Element | null = null;

  private stopAutoUpdate: (() => void) | null = null;

  constructor() {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.zIndex = "9999";
    element.style.maxWidth = POPUP_MAX_WIDTH;
    element.style.visibility = "hidden";
    element.style.pointerEvents = "none";
    element.className = "slash-command-popup";
    document.body.appendChild(element);
    this.element = element;
  }

  /** Attach a freshly rendered menu and start tracking its anchor. */
  show(
    componentElement: HTMLElement,
    getRect: RectProvider | null,
    contextElement: Element | null,
  ): void {
    this.element.replaceChildren(componentElement);
    this.setVisible(true);
    this.getRect = getRect;
    this.contextElement = contextElement;
    this.reposition();
    this.startAutoUpdate();
  }

  /** Point the popup at a new anchor rect (query changed / cursor moved). */
  update(getRect: RectProvider | null, contextElement: Element | null): void {
    this.getRect = getRect;
    this.contextElement = contextElement;
    this.setVisible(true);
    this.reposition();
  }

  /** Hide without tearing down the mounted menu (used on Escape). */
  conceal(): void {
    this.setVisible(false);
  }

  /** Hide and unmount the menu DOM, stopping auto-update. */
  clear(): void {
    this.setVisible(false);
    this.element.replaceChildren();
    this.stopTracking();
  }

  destroy(): void {
    this.stopTracking();
    this.element.remove();
  }

  private startAutoUpdate(): void {
    this.stopTracking();
    this.stopAutoUpdate = autoUpdate(
      {
        getBoundingClientRect: () => this.getRect?.() ?? new DOMRect(),
        ...(this.contextElement ? { contextElement: this.contextElement } : {}),
      },
      this.element,
      () => this.reposition(),
    );
  }

  private stopTracking(): void {
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = null;
  }

  private setVisible(visible: boolean): void {
    this.element.style.visibility = visible ? "visible" : "hidden";
    this.element.style.pointerEvents = visible ? "auto" : "none";
  }

  private reposition(): void {
    const rect = this.getRect?.();
    if (!rect) return;

    const referenceElement = {
      getBoundingClientRect: () => rect,
      ...(this.contextElement ? { contextElement: this.contextElement } : {}),
    };

    void computePosition(referenceElement, this.element, {
      placement: "bottom-start" as Placement,
      strategy: "fixed",
      middleware: [
        offset({ mainAxis: 8, crossAxis: 16 }),
        flip({ fallbackPlacements: ["top-start", "bottom-start"] }),
      ],
    }).then(({ x, y }) => {
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    });
  }
}
