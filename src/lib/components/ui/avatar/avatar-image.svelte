<script lang="ts">
import { getContext } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import { cn, type WithElementRef } from "#lib/utils";

import { AVATAR_CONTEXT_KEY, type MeltAvatar } from "./context";

type Props = WithElementRef<
	HTMLAttributes<HTMLImageElement>,
	HTMLImageElement
> & {
	src?: string;
	alt?: string;
};

let {
	ref = $bindable(null),
	class: className,
	src,
	alt,
	...restProps
}: Props = $props();

const avatar = getContext<MeltAvatar>(AVATAR_CONTEXT_KEY);

const imageProps = $derived({ ...avatar.image, src: src ?? avatar.image.src });
</script>

<img
	bind:this={ref}
	{...imageProps}
	data-slot="avatar-image"
	alt={alt}
	class={cn("aspect-square size-full", className)}
	{...restProps}
/>
