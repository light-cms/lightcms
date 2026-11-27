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
	data-slot="alert-title"
	class={
		"font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground"}
	{...restProps}
>
	{@render children?.()}
</div>
