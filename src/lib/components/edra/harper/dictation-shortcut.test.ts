import { describe, expect, it } from "vite-plus/test";
import { isDictationShortcut, isEditableTarget } from "./dictation-shortcut";

/** `KeyboardEvent` is not a Node global, so the fields the matcher reads are assigned directly. */
function keyEvent(init: Partial<KeyboardEventInit>): KeyboardEvent {
  const event = new Event("keydown") as KeyboardEvent;
  Object.assign(event, {
    key: "",
    code: "",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  });
  return event;
}

/** `isEditableTarget` feature-detects with `instanceof`, so fakes must inherit from it. */
class FakeHtmlElement {}

class FakeElement extends FakeHtmlElement {
  constructor(
    private readonly editable: boolean,
    private readonly closestHit: unknown = null,
  ) {
    super();
  }

  get isContentEditable(): boolean {
    return this.editable;
  }

  closest(): unknown {
    return this.closestHit;
  }
}

Object.assign(globalThis, { HTMLElement: FakeHtmlElement });

describe("isDictationShortcut", () => {
  it("matches Alt+S", () => {
    expect(isDictationShortcut(keyEvent({ key: "s", altKey: true }))).toBe(true);
  });

  it("matches regardless of case", () => {
    expect(isDictationShortcut(keyEvent({ key: "S", altKey: true }))).toBe(true);
  });

  it("matches on layouts where the modifier rewrites the key", () => {
    expect(isDictationShortcut(keyEvent({ key: "ß", code: "KeyS", altKey: true }))).toBe(true);
  });

  it("ignores the chord without Alt", () => {
    expect(isDictationShortcut(keyEvent({ key: "s" }))).toBe(false);
    expect(isDictationShortcut(keyEvent({ key: "s", ctrlKey: true }))).toBe(false);
    expect(isDictationShortcut(keyEvent({ key: "s", metaKey: true }))).toBe(false);
  });

  it("ignores Alt combined with another modifier", () => {
    expect(isDictationShortcut(keyEvent({ key: "s", altKey: true, ctrlKey: true }))).toBe(false);
    expect(isDictationShortcut(keyEvent({ key: "s", altKey: true, metaKey: true }))).toBe(false);
    expect(isDictationShortcut(keyEvent({ key: "s", altKey: true, shiftKey: true }))).toBe(false);
  });

  it("ignores Alt with other keys", () => {
    expect(isDictationShortcut(keyEvent({ key: "d", altKey: true }))).toBe(false);
  });
});

describe("isEditableTarget", () => {
  it("accepts a content editable element", () => {
    expect(isEditableTarget(new FakeElement(true) as unknown as EventTarget)).toBe(true);
  });

  it("accepts a descendant of a content editable ancestor", () => {
    expect(isEditableTarget(new FakeElement(false, {}) as unknown as EventTarget)).toBe(true);
  });

  it("rejects regular inputs", () => {
    expect(isEditableTarget(new FakeElement(false) as unknown as EventTarget)).toBe(false);
  });

  it("rejects targets that are not elements", () => {
    expect(isEditableTarget(null)).toBe(false);
  });
});
