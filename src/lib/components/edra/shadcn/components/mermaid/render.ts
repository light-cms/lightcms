import mermaid from "mermaid";

const MERMAID_ERROR_NOISE = /[\s\S]*?Syntax error in text[\s\S]*?mermaid version[\s\S]*$/m;

/** Delay before re-rendering the inline (non-editing) preview. */
export const MERMAID_INLINE_RENDER_DELAY = 300;

/** Delay before re-rendering the live preview while editing. */
export const MERMAID_EDIT_DEBOUNCE_DELAY = 500;

export interface MermaidRendererCallbacks {
  onRenderingChange?: (isRendering: boolean) => void;
  onErrorChange?: (error: string | null) => void;
}

export function normalizeMermaidError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Failed to render diagram";
  }
  const cleaned = error.message?.replace(MERMAID_ERROR_NOISE, "").trim();
  return cleaned || error.message || "Failed to render diagram";
}

/**
 * Renders Mermaid source into a target element with stale-render protection
 * and debouncing. State transitions are reported through callbacks so callers
 * can keep them reactive.
 */
export function createMermaidRenderer(callbacks: MermaidRendererCallbacks = {}) {
  let renderCounter = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  async function render(target: HTMLDivElement | null, source: string) {
    if (!target || !source.trim()) {
      if (target) target.innerHTML = "";
      callbacks.onErrorChange?.(null);
      return;
    }

    const thisRender = ++renderCounter;
    callbacks.onRenderingChange?.(true);
    const id = `mermaid-${crypto.randomUUID().slice(0, 8)}`;

    try {
      const { svg, bindFunctions } = await mermaid.render(id, source);
      if (thisRender !== renderCounter) return;
      target.innerHTML = svg;
      bindFunctions?.(target);
      callbacks.onErrorChange?.(null);
    } catch (error) {
      if (thisRender !== renderCounter) return;
      callbacks.onErrorChange?.(normalizeMermaidError(error));
      document.getElementById(id)?.remove();
    } finally {
      if (thisRender === renderCounter) {
        callbacks.onRenderingChange?.(false);
      }
    }
  }

  function debouncedRender(target: HTMLDivElement | null, source: string, delay: number): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void render(target, source);
    }, delay);
  }

  function destroy(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    renderCounter++;
  }

  return { render, debouncedRender, destroy };
}
