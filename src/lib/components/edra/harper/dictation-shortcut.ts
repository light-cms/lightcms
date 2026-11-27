/**
 * Keyboard handling for the dictation widget.
 *
 * Kept as pure functions so the matching rules can be tested without a DOM.
 */

/**
 * Human-readable form of the shortcut, shown next to the mic button tooltip.
 */
export const DICTATION_SHORTCUT_LABEL = "Alt+S";

/**
 * Matches `Alt/Option + S`.
 *
 * Both `key` and `code` are checked: `key` is what the user actually types, while
 * `code` keeps the match working on layouts where a modifier rewrites the key.
 */
export function isDictationShortcut(event: KeyboardEvent): boolean {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }
  return event.key.toLowerCase() === "s" || event.code === "KeyS";
}

/**
 * The shortcut is scoped to the rich-text editor so it never hijacks the same
 * chord from regular inputs, dialogs, or the AI prompt textarea.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || target.closest('[contenteditable="true"]') !== null;
}
