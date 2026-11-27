import { computePosition, flip, offset, shift } from "@floating-ui/dom";

const DEFAULT_VIEWPORT_PADDING = 8;
const ANCHOR_OFFSET = 8;

const INTERACTIVE_SELECTOR =
  'button, a[href], input, select, textarea, label, [role="button"], [data-no-drag]';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type WidgetPointerEvent = PointerEvent & {
  currentTarget: EventTarget & HTMLElement;
};

interface DragOrigin {
  readonly pointerId: number;
  readonly pointer: Point;
  readonly widget: Point;
}

export interface DraggableWidget {
  /** Viewport coordinates of the widget, or `null` while it is not placed yet. */
  readonly position: Point | null;
  readonly isDragging: boolean;
  /** Snaps the widget next to `anchor`, staying inside the viewport. */
  place(anchor: HTMLElement): Promise<void>;
  /** Starts a drag from a pointer press anywhere on the widget surface. */
  startDrag(event: WidgetPointerEvent): void;
  /** Pulls the widget back inside the viewport, e.g. after a window resize. */
  clampIntoView(): void;
  /** Forgets the current position and releases any in-flight drag. */
  reset(): void;
}

export interface DraggableWidgetOptions {
  /** Resolves the mounted widget element. Must be reactive for reads to stay current. */
  readonly getElement: () => HTMLElement | null;
  readonly viewportPadding?: number;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export function createDraggableWidget(options: DraggableWidgetOptions): DraggableWidget {
  const { getElement } = options;
  const viewportPadding = options.viewportPadding ?? DEFAULT_VIEWPORT_PADDING;

  let position = $state<Point | null>(null);
  let isDragging = $state(false);

  let dragElement: HTMLElement | null = null;
  let dragOrigin: DragOrigin | null = null;

  function clampPoint(point: Point): Point {
    const element = getElement();
    if (!element) {
      return point;
    }
    const { width, height } = element.getBoundingClientRect();
    return {
      x: clamp(point.x, viewportPadding, window.innerWidth - width - viewportPadding),
      y: clamp(point.y, viewportPadding, window.innerHeight - height - viewportPadding),
    };
  }

  function isTextSelectedInside(element: HTMLElement): boolean {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) {
      return false;
    }
    const anchorNode = selection.anchorNode;
    return anchorNode !== null && element.contains(anchorNode);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) {
      return;
    }
    position = clampPoint({
      x: dragOrigin.widget.x + (event.clientX - dragOrigin.pointer.x),
      y: dragOrigin.widget.y + (event.clientY - dragOrigin.pointer.y),
    });
  }

  function endDrag(): void {
    dragElement = null;
    dragOrigin = null;
    isDragging = false;
  }

  function handlePointerEnd(event: PointerEvent): void {
    if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) {
      return;
    }
    endDrag();
  }

  function startDrag(event: WidgetPointerEvent): void {
    if (event.button !== 0 || !position) {
      return;
    }

    const element = event.currentTarget;
    const target = event.target;
    if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }
    if (isTextSelectedInside(element)) {
      return;
    }

    dragElement = element;
    dragOrigin = {
      pointerId: event.pointerId,
      pointer: { x: event.clientX, y: event.clientY },
      widget: position,
    };
    isDragging = true;

    element.setPointerCapture(event.pointerId);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerEnd);
    element.addEventListener("pointercancel", handlePointerEnd);
    element.addEventListener("lostpointercapture", handlePointerEnd);
  }

  async function place(anchor: HTMLElement): Promise<void> {
    const element = getElement();
    if (!element) {
      return;
    }

    const { x, y } = await computePosition(anchor, element, {
      strategy: "fixed",
      placement: "top-end",
      middleware: [offset(ANCHOR_OFFSET), flip(), shift({ padding: viewportPadding })],
    });
    position = clampPoint({ x, y });
  }

  function clampIntoView(): void {
    if (position) {
      position = clampPoint(position);
    }
  }

  function reset(): void {
    if (dragElement) {
      dragElement.removeEventListener("pointermove", handlePointerMove);
      dragElement.removeEventListener("pointerup", handlePointerEnd);
      dragElement.removeEventListener("pointercancel", handlePointerEnd);
      dragElement.removeEventListener("lostpointercapture", handlePointerEnd);
    }
    endDrag();
    position = null;
  }

  return {
    get position() {
      return position;
    },
    get isDragging() {
      return isDragging;
    },
    place,
    startDrag,
    clampIntoView,
    reset,
  };
}
