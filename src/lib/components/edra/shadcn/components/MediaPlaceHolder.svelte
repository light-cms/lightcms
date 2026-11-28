<script lang="ts">
import AudioLines from "@lucide/svelte/icons/audio-lines";
import CloudUpload from "@lucide/svelte/icons/cloud-upload";
import Image from "@lucide/svelte/icons/image";
import Link2 from "@lucide/svelte/icons/link-2";
import Loader2 from "@lucide/svelte/icons/loader-2";
import Play from "@lucide/svelte/icons/play";
import StickyNotePlus from "@lucide/svelte/icons/sticky-note-plus";
import Video from "@lucide/svelte/icons/video";
import type { NodeViewProps } from "@tiptap/core";
import { toast } from "svelte-sonner";
import { Button } from "#lib/components/ui/button";
import { Input } from "#lib/components/ui/input";
import { cn } from "#lib/utils";
import {
	extractYouTubeId,
	getYouTubeThumbnailUrl,
	getYouTubeWatchUrl,
} from "#lib/utils/youtube";
import { NodeViewWrapper } from "../../tiptap/index";

const { editor, node, getPos }: NodeViewProps = $props();

const mediaType = $derived(node.attrs.mediaType ?? "image");
const isYoutubeType = $derived(mediaType === "youtube");

let activeTab = $state<"upload" | "embed">("upload");
$effect(() => {
	if (isYoutubeType) {
		activeTab = "embed";
	}
});

let embedUrl = $state("");
let embedTitle = $state("");
let isDragging = $state(false);
let isUploading = $state(false);
let uploadStatus = $state("");
let fileInputRef = $state<HTMLInputElement | null>(null);

const detectedYouTubeId = $derived.by(() => {
	return extractYouTubeId(embedUrl);
});

const youtubeThumbnailPreview = $derived.by(() => {
	if (detectedYouTubeId) {
		return getYouTubeThumbnailUrl(detectedYouTubeId, "maxres");
	}
	return null;
});

const ACCEPT_MAP: Record<string, string> = {
	audio: "audio/*",
	video: "video/*",
	image: "image/*",
	youtube: "video/*",
};

const acceptTypes = $derived(ACCEPT_MAP[mediaType] ?? "image/*");

const MAX_SIZE_MAP: Record<string, { bytes: number; label: string }> = {
	video: { bytes: 50 * 1024 * 1024, label: "50MB" },
	audio: { bytes: 20 * 1024 * 1024, label: "20MB" },
	image: { bytes: 10 * 1024 * 1024, label: "10MB" },
	youtube: { bytes: 50 * 1024 * 1024, label: "50MB" },
};

const mediaConstraint = $derived(
	MAX_SIZE_MAP[mediaType] ?? { bytes: 10 * 1024 * 1024, label: "10MB" },
);

function triggerFileInput() {
	if (isUploading) return;
	fileInputRef?.click();
}

function isValidFileType(file: File, type: string): boolean {
	if (type === "audio") {
		return file.type.startsWith("audio/");
	}
	if (type === "video" || type === "youtube") {
		return file.type.startsWith("video/");
	}
	return file.type.startsWith("image/");
}

function getTargetNodeType(type: string): string {
	if (type === "audio") {
		return "audio";
	}
	if (type === "video") {
		return "video";
	}
	return "image";
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
		if (file.size > mediaConstraint.bytes) {
			toast.error(
				`"${file.name}" exceeds ${mediaConstraint.label} size limit.`,
			);
			return;
		}
	}

	const validFiles = filesArray.filter((file) =>
		isValidFileType(file, mediaType),
	);

	if (validFiles.length === 0) {
		toast.error(`Please select valid ${mediaType} file(s).`);
		return;
	}

	isUploading = true;
	if (validFiles.length > 1) {
		uploadStatus = `Uploading ${validFiles.length} files...`;
	} else {
		uploadStatus = "Uploading...";
	}

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
					reader.onerror = () => {
						if (reader.error) {
							reject(reader.error);
						} else {
							reject(new Error("Upload failed"));
						}
					};
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
	} catch (error: unknown) {
		console.error("Upload error:", error);
		const msg =
			error instanceof Error ? error.message : "Failed to upload file";
		toast.error(msg);
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
	const targetType = getTargetNodeType(mediaType);

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
			} else if (mediaType === "video") {
				editor.chain().focus().setVideo({ src }).run();
			} else {
				editor.chain().focus().setImage({ src }).run();
			}
		}
	}
}

function _handleInsertEmbed() {
	const trimmedUrl = embedUrl.trim();
	if (trimmedUrl.length === 0) {
		toast.error("Please enter a valid URL.");
		return;
	}

	const ytId = extractYouTubeId(trimmedUrl);
	const pos = typeof getPos === "function" ? getPos() : undefined;
	const nodeSize = node?.nodeSize ?? 1;

	if (ytId) {
		const thumbnailUrl = getYouTubeThumbnailUrl(ytId, "maxres");
		const watchUrl = getYouTubeWatchUrl(ytId);
		let finalTitle = "YouTube video";
		if (embedTitle.trim().length > 0) {
			finalTitle = embedTitle.trim();
		}

		if (typeof pos === "number") {
			editor
				.chain()
				.focus()
				.deleteRange({ from: pos, to: pos + nodeSize })
				.insertContentAt(pos, {
					type: "image",
					attrs: {
						src: thumbnailUrl,
						alt: finalTitle,
						title: finalTitle,
						href: watchUrl,
					},
				})
				.run();
		} else {
			editor
				.chain()
				.focus()
				.setImage({
					src: thumbnailUrl,
					alt: finalTitle,
					title: finalTitle,
				})
				.run();
		}
		toast.success("Embedded YouTube video via CDN thumbnail.");
		return;
	}

	if (mediaType === "video") {
		if (typeof pos === "number") {
			editor
				.chain()
				.focus()
				.deleteRange({ from: pos, to: pos + nodeSize })
				.insertContentAt(pos, {
					type: "video",
					attrs: { src: trimmedUrl, title: embedTitle.trim() },
				})
				.run();
		} else {
			editor.chain().focus().setVideo({ src: trimmedUrl }).run();
		}
	} else if (mediaType === "audio") {
		if (typeof pos === "number") {
			editor
				.chain()
				.focus()
				.deleteRange({ from: pos, to: pos + nodeSize })
				.insertContentAt(pos, {
					type: "audio",
					attrs: { src: trimmedUrl },
				})
				.run();
		} else {
			editor.chain().focus().setAudio({ src: trimmedUrl }).run();
		}
	} else {
		if (typeof pos === "number") {
			editor
				.chain()
				.focus()
				.deleteRange({ from: pos, to: pos + nodeSize })
				.insertContentAt(pos, {
					type: "image",
					attrs: {
						src: trimmedUrl,
						alt: embedTitle.trim(),
						title: embedTitle.trim(),
					},
				})
				.run();
		} else {
			editor.chain().focus().setImage({ src: trimmedUrl }).run();
		}
	}
	toast.success("Embedded media successfully.");
}

function _handleDragLeave(event: DragEvent) {
	event.preventDefault();
	isDragging = false;
}

function _handleDrop(event: DragEvent) {
	event.preventDefault();
	isDragging = false;
	void handleFiles(event.dataTransfer?.files);
}
</script>

<NodeViewWrapper class="my-3 w-full!">
	<div class="rounded-2xl border border-zinc-700/60 dark:border-zinc-700/50 bg-card p-4 sm:p-5 shadow-xs select-none space-y-4">
		<!-- Tabs header if not solely youtube type -->
		<div class="flex items-center justify-between border-b border-border/60 pb-3">
			<div class="flex items-center gap-2">
				{#if !isYoutubeType}
					<button
						type="button"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer {activeTab === 'upload' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
						onclick={() => (activeTab = "upload")}
					>
						<CloudUpload class="size-3.5" />
						<span>Upload File</span>
					</button>
				{/if}
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer {activeTab === 'embed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
					onclick={() => (activeTab = "embed")}
				>
					<Link2 class="size-3.5" />
					<span>{isYoutubeType ? 'Embed YouTube Video (CDN)' : 'Embed URL / YouTube'}</span>
				</button>
			</div>
			<span class="text-[11px] font-mono text-muted-foreground uppercase">
				{mediaType}
			</span>
		</div>

		{#if activeTab === "upload"}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				role="button"
				tabindex={0}
				onclick={triggerFileInput}
				ondragover={_handleDragLeave}
				ondragleave={_handleDragLeave}
				ondrop={_handleDrop}
				class={cn(
					"group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed py-8 sm:py-10 px-6 text-center transition-all duration-200 select-none",
					isDragging
						? "border-[#8b5cf6] bg-[#8b5cf6]/10 ring-2 ring-[#8b5cf6]/20 scale-[1.005]"
						: "border-zinc-700/60 dark:border-zinc-700/50 bg-transparent hover:border-zinc-500 hover:bg-zinc-900/30"
				)}
			>
				<input
					type="file"
					bind:this={fileInputRef}
					accept={acceptTypes}
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
					<div class="relative mb-3 flex items-center justify-center">
						<StickyNotePlus />
						<div class="absolute inset-0 flex items-center justify-center pr-1 pb-1 text-zinc-400 group-hover:text-zinc-200 transition-colors">
							{#if mediaType === "video"}
								<Video class="size-5" />
							{:else if mediaType === "audio"}
								<AudioLines class="size-5" />
							{:else}
								<Image class="size-5" />
							{/if}
						</div>

						<div class="absolute -bottom-1 -right-2 flex size-7 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-md ring-2 ring-background">
							<CloudUpload class="size-4 stroke-[2.2]" />
						</div>
					</div>

					<div class="text-sm font-medium leading-normal">
						<span class="text-foreground underline underline-offset-4 decoration-muted-foreground/60 group-hover:decoration-foreground cursor-pointer transition-colors">
							Click to upload {mediaType}
						</span>
						<span class="text-muted-foreground font-normal"> or drag and drop</span>
					</div>

					<p class="mt-1.5 text-xs text-muted-foreground">Maximum 3 files, {mediaConstraint.label} each.</p>
				{/if}
			</div>
		{:else}
			<!-- Embed Tab UI -->
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="embed-media-url" class="text-xs font-semibold text-foreground">
						{isYoutubeType ? 'YouTube Video URL or ID' : 'Media URL or YouTube Video'}
					</label>
					<div class="relative">
						<Input
							id="embed-media-url"
							bind:value={embedUrl}
							placeholder={isYoutubeType ? 'https://www.youtube.com/watch?v=JLMbpiywVxQ' : 'https://...'}
							class="text-xs font-mono pr-20"
						/>
						{#if detectedYouTubeId}
							<span class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-red-600/90 text-[10px] font-bold text-white px-1.5 py-0.5">
								YouTube
							</span>
						{/if}
					</div>
					<p class="text-[11px] text-muted-foreground">
						Embeds via YouTube CDN thumbnail (<code class="font-mono">img.youtube.com</code>) without storage overhead.
					</p>
				</div>

				<div class="space-y-2">
					<label for="embed-media-title" class="text-xs font-semibold text-foreground">
						Title / Alt text (optional)
					</label>
					<Input
						id="embed-media-title"
						bind:value={embedTitle}
						placeholder="e.g. Final video of fixing issues in your code in VS Code"
						class="text-xs"
					/>
				</div>

				<!-- Live CDN Thumbnail Preview when YouTube video is detected -->
				{#if detectedYouTubeId && youtubeThumbnailPreview}
					<div class="relative overflow-hidden rounded-xl border border-border bg-black/40 aspect-video max-w-md mx-auto group/preview">
						<img
							src={youtubeThumbnailPreview}
							alt={embedTitle || 'YouTube Video Preview'}
							class="size-full object-cover"
						/>
						<div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/preview:bg-black/10 transition-colors">
							<div class="flex items-center justify-center size-12 rounded-xl bg-red-600 text-white shadow-lg">
								<Play class="size-5 fill-white ml-0.5" />
							</div>
						</div>
						<div class="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white">
							ID: {detectedYouTubeId}
						</div>
					</div>
				{/if}

				<div class="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						size="sm"
						ondragleave={_handleDragLeave}
						ondrop={_handleDrop}
						ondragover={_handleDragOver}
						onclick={_handleInsertEmbed}
						disabled={embedUrl.trim().length === 0}
						class="gap-1.5 text-xs font-semibold"
					>
						<Play class="size-3.5 fill-current" />
						<span>{detectedYouTubeId ? 'Embed YouTube Video' : 'Insert Media'}</span>
					</Button>
				</div>
			</div>
		{/if}
	</div>
</NodeViewWrapper>
