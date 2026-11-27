<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import type { WithElementRef } from "#lib/utils";

let {
	ref = $bindable(null),
	class: className,
	children,
	...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-description"
	class={
		"text-sm text-balance text-muted-foreground md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground"}
	{...restProps}
>
	{@render children?.()}
</div>
