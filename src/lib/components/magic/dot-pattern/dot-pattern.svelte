<script lang="ts">
import { onMount } from "svelte";
import type { SVGAttributes } from "svelte/elements";

interface DotPatternProps extends SVGAttributes<SVGSVGElement> {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	cx?: number;
	cy?: number;
	cr?: number;
	class?: string;
	glow?: boolean;
}

let {
	width = 16,
	height = 16,
	x = 0,
	y = 0,
	cx = 1,
	cy = 1,
	cr = 1,
	class: className,
	glow = false,
	...props
}: DotPatternProps = $props();

const _id = $props.id();
let containerRef = $state<SVGSVGElement | null>(null);
let dimensions = $state({ width: 0, height: 0 });

onMount(() => {
	const updateDimensions = () => {
		if (containerRef) {
			const rect = containerRef.getBoundingClientRect();
			dimensions = { width: rect.width, height: rect.height };
		}
	};

	updateDimensions();
	window.addEventListener("resize", updateDimensions);
	return () => window.removeEventListener("resize", updateDimensions);
});

const _dots = $derived(
	dimensions.width && dimensions.height
		? Array.from(
				{
					length:
						Math.ceil(dimensions.width / width) *
						Math.ceil(dimensions.height / height),
				},
				(_, i) => {
					const cols = Math.ceil(dimensions.width / width);
					const col = i % cols;
					const row = Math.floor(i / cols);
					return {
						x: col * width + cx,
						y: row * height + cy,
						delay: Math.random() * 5,
						duration: Math.random() * 3 + 2,
					};
				},
			)
		: [],
);
</script>

<svg
  bind:this={containerRef}
  aria-hidden="true"
  class="pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80"
  {...props}
>
  <defs>
    {#if glow}
      <radialGradient id={`${_id}-gradient`}>
        <stop offset="0%" stop-color="currentColor" stop-opacity="1" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
      </radialGradient>
    {/if}
  </defs>

  {#if glow}
    {#each _dots as dot (`${dot.x}-${dot.y}`)}
      <circle
        cx={dot.x}
        cy={dot.y}
        r={cr}
        fill={`url(#${_id}-gradient)`}
        class="animate-pulse"
        style={`animation-duration: ${dot.duration}s; animation-delay: ${dot.delay}s;`}
      />
    {/each}
  {:else}
    <pattern
      id={`${_id}-pattern`}
      {width}
      {height}
      patternUnits="userSpaceOnUse"
      patternContentUnits="userSpaceOnUse"
      {x}
      {y}
    >
      <circle id={`${_id}-img`} {cx} {cy} r={cr} fill="currentColor" />
    </pattern>
    <rect
      width="100%"
      height="100%"
      stroke-width="0"
      fill={`url(#${_id}-pattern)`}
    />
  {/if}
</svg>
