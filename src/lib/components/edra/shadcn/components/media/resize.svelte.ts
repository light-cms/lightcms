export interface MediaResizeInput {
  getMediaElement: () => HTMLElement | null | undefined;
  getContainerElement: () => HTMLElement | null | undefined;
  onWidthChange: (widthPercent: number) => void;
}

const MIN_WIDTH_PERCENT = 20;
const MAX_WIDTH_PERCENT = 100;

/**
 * Shared resize interaction for media nodes. Mouse and touch both funnel
 * through `apply(clientX)` so the width math lives in exactly one place.
 */
export function useMediaResize(input: MediaResizeInput) {
  let resizing = $state(false);
  let side = $state<"left" | "right">("left");
  let initialWidthPercent = 0;
  let initialClientX = 0;

  function start(clientX: number, nextSide: "left" | "right") {
    resizing = true;
    side = nextSide;
    initialClientX = clientX;

    const media = input.getMediaElement();
    const container = input.getContainerElement();
    if (media && container) {
      initialWidthPercent = (media.offsetWidth / container.offsetWidth) * 100;
    }
  }

  function apply(clientX: number) {
    const container = input.getContainerElement();
    if (!resizing || !container) return;

    const dx = side === "left" ? initialClientX - clientX : clientX - initialClientX;
    const deltaPercent = (dx / container.offsetWidth) * 100;
    const widthPercent = Math.max(
      Math.min(initialWidthPercent + deltaPercent, MAX_WIDTH_PERCENT),
      MIN_WIDTH_PERCENT,
    );
    input.onWidthChange(widthPercent);
  }

  function end() {
    resizing = false;
    initialClientX = 0;
    initialWidthPercent = 0;
  }

  $effect(() => {
    const onMouseMove = (event: MouseEvent) => apply(event.clientX);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) apply(touch.clientX);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", end);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", end);
    };
  });

  return {
    get resizing() {
      return resizing;
    },
    start,
    end,
  };
}
