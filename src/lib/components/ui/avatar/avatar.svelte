<script lang="ts">
import type { ComponentProps } from "melt";
import { type AvatarProps, Avatar as MeltAvatar } from "melt/builders";
import type { Snippet } from "svelte";
import { setContext } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import { cn, type WithElementRef } from "#lib/utils";

import { AVATAR_CONTEXT_KEY } from "./context";

type Props = ComponentProps<AvatarProps> & {
	children?: Snippet;
};

let {
	ref = $bindable(null),
	class: className,
	children,
	src,
	delayMs,
}: WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> &
	Props = $props();

const avatar = new MeltAvatar({
	src: () => src,
	delayMs: () => delayMs,
});

setContext(AVATAR_CONTEXT_KEY, avatar);
</script>

<span
	bind:this={ref}
	data-slot="avatar"
	class={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
>
	{@render children?.()}
</span>
