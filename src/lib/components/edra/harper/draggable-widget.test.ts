import { describe, expect, it, vi } from "vite-plus/test";
import type { WidgetPointerEvent } from "./draggable-widget.svelte";

/**
 * Floating UI is a third-party dependency, so it is stubbed out here: these tests
 * cover the widget's own placement clamping, dragging and teardown behaviour.
 */
const computePositionMock = vi.fn(async () => ({
  x: 0,
  y: 0,
  placement: "top-end",
  strategy: "fixed",
  middlewareData: {},
}));

vi.mock("@floating-ui/dom", () => ({
  computePosition: computePositionMock,
  flip: () => ({ name: "flip", options: {}, fn: () => ({}) }),
  offset: () => ({ name: "offset", options: {}, fn: () => ({}) }),
  shift: () => ({ name: "shift", options: {}, fn: () => ({}) }),
}));

const { createDraggableWidget } = await import("./draggable-widget.svelte");

class FakeElement {
  readonly listeners = new Map<string, Set<(event: Event) => void>>();

  constructor(private readonly rect: { width: number; height: number }) {}

  getBoundingClientRect(): DOMRect {
    return {
      width: this.rect.width,
      height: this.rect.height,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: this.rect.width,
      bottom: this.rect.height,
      toJSON: () => ({}),
    } as DOMRect;
  }

  setPointerCapture(): void {}

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

  contains(): boolean {
    return false;
  }

  closest(): unknown {
    return null;
  }
}

/** A widget surface whose `closest()` reports a hit, mimicking a control under the pointer. */
class FakeWidgetElement extends FakeElement {
  hit: unknown = null;

  override closest(): unknown {
    return this.hit;
  }
}

function setViewport(width: number, height: number): void {
  Object.assign(globalThis, {
    Element: FakeElement,
    window: { innerWidth: width, innerHeight: height },
    document: { getSelection: () => null },
  });
}

function pointerEvent(
  target: FakeElement,
  pointerId: number,
  clientX: number,
  clientY: number,
): WidgetPointerEvent {
  const event = new Event("pointer") as WidgetPointerEvent;
  Object.assign(event, { pointerId, clientX, clientY, button: 0 });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });
  return event;
}

function asElement(node: FakeElement): HTMLElement {
  return node as unknown as HTMLElement;
}

/**
 * Mirrors what `MicWidgetPanel.svelte` does in its template: the widget surface
 * forwards every pointer press on itself to `startDrag`.
 */
function mountWidget(node: FakeElement, viewportPadding?: number) {
  const widget = createDraggableWidget({
    getElement: () => asElement(node),
    ...(viewportPadding === undefined ? {} : { viewportPadding }),
  });
  node.addEventListener("pointerdown", (event) => widget.startDrag(event as WidgetPointerEvent));
  return widget;
}

function placedAt(x: number, y: number) {
  computePositionMock.mockResolvedValueOnce({
    x,
    y,
    placement: "top-end",
    strategy: "fixed",
    middlewareData: {},
  });
}

describe("createDraggableWidget", () => {
  it("has no position until it is placed", () => {
    setViewport(1200, 900);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node);

    expect(widget.position).toBeNull();
    expect(widget.isDragging).toBe(false);
    expect(computePositionMock).not.toHaveBeenCalled();
  });

  it("clamps the placement returned by floating ui into the viewport", async () => {
    setViewport(1200, 900);
    placedAt(5, 5);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node, 8);

    await widget.place(asElement(node));

    expect(widget.position).toEqual({ x: 8, y: 8 });
  });

  it("moves with the pointer while dragging and stops on release", async () => {
    setViewport(1200, 900);
    placedAt(400, 300);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node);
    await widget.place(asElement(node));

    node.dispatch("pointerdown", pointerEvent(node, 1, 410, 310));
    expect(widget.isDragging).toBe(true);

    node.dispatch("pointermove", pointerEvent(node, 1, 460, 340));
    expect(widget.position).toEqual({ x: 450, y: 330 });

    node.dispatch("pointerup", pointerEvent(node, 1, 460, 340));
    expect(widget.isDragging).toBe(false);
    expect(widget.position).toEqual({ x: 450, y: 330 });
  });

  it("ignores moves from a different pointer", async () => {
    setViewport(1200, 900);
    placedAt(400, 300);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node);
    await widget.place(asElement(node));

    node.dispatch("pointerdown", pointerEvent(node, 1, 410, 310));
    node.dispatch("pointermove", pointerEvent(node, 2, 900, 900));

    expect(widget.position).toEqual({ x: 400, y: 300 });
  });

  it("clamps the widget inside the viewport while dragging", async () => {
    setViewport(400, 300);
    placedAt(20, 20);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node, 8);
    await widget.place(asElement(node));

    node.dispatch("pointerdown", pointerEvent(node, 1, 25, 25));
    node.dispatch("pointermove", pointerEvent(node, 1, 5000, 5000));

    expect(widget.position).toEqual({ x: 400 - 288 - 8, y: 300 - 160 - 8 });
  });

  it("ignores drags that start on interactive controls", async () => {
    setViewport(1200, 900);
    placedAt(400, 300);
    const node = new FakeWidgetElement({ width: 288, height: 160 });
    const widget = mountWidget(node);
    await widget.place(asElement(node));

    node.hit = { nodeName: "BUTTON" };
    node.dispatch("pointerdown", pointerEvent(node, 1, 405, 305));

    expect(widget.isDragging).toBe(false);
    expect(widget.position).toEqual({ x: 400, y: 300 });
  });

  it("pulls the widget back inside the viewport on resize", async () => {
    setViewport(1200, 900);
    placedAt(900, 700);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node, 8);
    await widget.place(asElement(node));

    setViewport(500, 400);
    widget.clampIntoView();

    const { x, y } = widget.position!;
    expect(x + 288).toBeLessThanOrEqual(500 - 8);
    expect(y + 160).toBeLessThanOrEqual(400 - 8);
  });

  it("forgets its position and drag listeners on reset", async () => {
    setViewport(1200, 900);
    placedAt(400, 300);
    const node = new FakeElement({ width: 288, height: 160 });
    const widget = mountWidget(node);
    await widget.place(asElement(node));

    node.dispatch("pointerdown", pointerEvent(node, 1, 405, 305));
    widget.reset();

    expect(widget.position).toBeNull();
    expect(widget.isDragging).toBe(false);
    expect(node.listeners.get("pointermove")?.size ?? 0).toBe(0);
    expect(node.listeners.get("pointerup")?.size ?? 0).toBe(0);
  });
});
