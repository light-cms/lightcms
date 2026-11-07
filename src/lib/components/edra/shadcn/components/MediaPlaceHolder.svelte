<script lang="ts">
import CloudUpload from "@lucide/svelte/icons/cloud-upload";
import Loader2 from "@lucide/svelte/icons/loader-2";
import type { NodeViewProps } from "@tiptap/core";
import { toast } from "svelte-sonner";
import { cn } from "$lib/utils.js";
import { NodeViewWrapper } from "../../tiptap/index.js";

const { editor, node, getPos }: NodeViewProps = $props();

const mediaType = $derived(node.attrs.mediaType ?? "image");
let isDragging = $state(false);
let isUploading = $state(false);
let uploadStatus = $state("");
let fileInputRef = $state<HTMLInputElement | null>(null);

function triggerFileInput() {
	if (isUploading) return;
	fileInputRef?.click();
}

async function handleFiles(fileList: FileList | File[] | null | undefined) {
	if (!fileList) return;
	const filesArray = Array.from(fileList);
	if (filesArray.length === 0) return;

	if (filesArray.length > 3) {
		toast.error("Maximum 3 files allowed.");
		return;
	}

	for (const file of filesArray) {
		if (file.size > 5 * 1024 * 1024) {
			toast.error(`"${file.name}" exceeds 5MB size limit.`);
			return;
		}
	}

	const validFiles = filesArray.filter((f) => f.type.startsWith("image/"));

	if (validFiles.length === 0) {
		toast.error(`Please select valid ${mediaType} file(s).`);
		return;
	}

	isUploading = true;
	uploadStatus = validFiles.length > 1
		? `Uploading ${validFiles.length} files...`
		: "Uploading...";

	try {
		const onUpload = editor.storage.mediaPlaceholder?.onUpload;
		const uploadedUrls: string[] = [];

		for (const file of validFiles) {
			let src = "";
			if (onUpload) {
				src = await onUpload(file);
			} else {
				src = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(String(reader.result));
					reader.onerror = () => reject(reader.error ?? new Error("Upload failed"));
					reader.readAsDataURL(file);
				});
			}
			if (src) {
				uploadedUrls.push(src);
			}
		}

		if (uploadedUrls.length > 0) {
			insertUploadedMedia(uploadedUrls);
		}
	} catch (error: any) {
		console.error("Upload error:", error);
		toast.error(error?.message ?? "Failed to upload file");
	} finally {
		isUploading = false;
		uploadStatus = "";
		if (fileInputRef) {
			fileInputRef.value = "";
		}
	}
}

function insertUploadedMedia(urls: string[]) {
	const pos = typeof getPos === "function" ? getPos() : undefined;
	const nodeSize = node?.nodeSize ?? 1;

	const targetType = mediaType === "audio" ? "audio" : "image";

	if (typeof pos === "number") {
		const contentNodes = urls.map((src) => ({
			type: targetType,
			attrs: { src },
		}));

		editor
			.chain()
			.focus()
			.deleteRange({ from: pos, to: pos + nodeSize })
			.insertContentAt(pos, contentNodes)
			.run();
	} else {
		for (const src of urls) {
			if (mediaType === "audio") {
				editor.chain().focus().setAudio({ src }).run();
			} else {
				editor.chain().focus().setImage({ src }).run();
			}
		}
	}
}

function handleDrop(event: DragEvent) {
	event.preventDefault();
	isDragging = false;
	const files = event.dataTransfer?.files;
	void handleFiles(files);
}

function handleDragOver(event: DragEvent) {
	event.preventDefault();
	isDragging = true;
}

function handleDragLeave(event: DragEvent) {
	event.preventDefault();
	isDragging = false;
}
</script>

<NodeViewWrapper class="my-3 w-full!">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex={0}
		onclick={triggerFileInput}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		class={cn(
			"group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed py-8 sm:py-10 px-6 text-center transition-all duration-200 select-none",
			isDragging
				? "border-[#8b5cf6] bg-[#8b5cf6]/10 ring-2 ring-[#8b5cf6]/20 scale-[1.005]"
				: "border-zinc-700/60 dark:border-zinc-700/50 bg-transparent hover:border-zinc-500 hover:bg-zinc-900/30"
		)}
	>
		<input
			type="file"
			bind:this={fileInputRef}
			accept="image/*"
			multiple
			onchange={(e) => void handleFiles(e.currentTarget.files)}
			class="hidden"
		/>

		{#if isUploading}
			<div class="flex flex-col items-center gap-2.5 py-3">
				<Loader2 class="size-8 animate-spin text-[#8b5cf6]" />
				<span class="text-sm font-medium text-foreground">{uploadStatus}</span>
			</div>
		{:else}
			<!-- Icon Graphic with purple circular CloudUpload badge -->
			<div class="relative mb-3 flex items-center justify-center">
				<!-- Document outline with dog-ear fold and subtle translucent fill -->
				<svg
					class="h-14 w-11 text-zinc-600 transition-transform duration-200 group-hover:scale-105"
					viewBox="0 0 44 56"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4 1C2.34315 1 1 2.34315 1 4V52C1 53.6569 2.34315 55 4 55H40C41.6569 55 43 53.6569 43 52V14.5L29.5 1H4Z"
						fill="#27272a"
						fill-opacity="0.3"
						stroke="#52525b"
						stroke-width="1.75"
						stroke-linejoin="round"
					/>
					<path
						d="M29 1V14.5H42.5"
						stroke="#52525b"
						stroke-width="1.75"
						stroke-linejoin="round"
					/>
				</svg>

				<!-- Purple circular badge overlapping bottom-right with cloud-upload icon -->
				<div class="absolute -bottom-1 -right-2 flex size-7 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-md ring-2 ring-background">
					<CloudUpload class="size-4 stroke-[2.2]" />
				</div>
			</div>

			<!-- Main label -->
			<div class="text-sm font-medium leading-normal">
				<span class="text-foreground underline underline-offset-4 decoration-muted-foreground/60 group-hover:decoration-foreground cursor-pointer transition-colors">
					Click to upload
				</span>
				<span class="text-muted-foreground font-normal"> or drag and drop</span>
			</div>

			<!-- Constraints subtext -->
			<p class="mt-1.5 text-xs text-muted-foreground">Maximum 3 files, 5MB each.</p>
		{/if}
	</div>
</NodeViewWrapper>
