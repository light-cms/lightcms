<script lang="ts">
import type { Snippet } from "svelte";
import { getContext } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import { cn, type WithElementRef } from "#lib/utils";

import { AVATAR_CONTEXT_KEY, type MeltAvatar } from "./context.ts";

type Props = WithElementRef<
	HTMLAttributes<HTMLSpanElement>,
	HTMLSpanElement
> & {
	children?: Snippet;
};

let {
	ref = $bindable(null),
	class: className,
	children,
	...restProps
}: Props = $props();

const avatar = getContext<MeltAvatar>(AVATAR_CONTEXT_KEY);

const fallbackProps = $derived(avatar.fallback);
</script>

<span
	bind:this={ref}
	{...fallbackProps}
	data-slot="avatar-fallback"
	class={cn(
		"flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>