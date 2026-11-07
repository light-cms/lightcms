<script lang="ts">
import GripHorizontal from "@lucide/svelte/icons/grip-horizontal";
import Loader2Icon from "@lucide/svelte/icons/loader-2";
import MicAudioLines from "@lucide/svelte/icons/mic-audio-lines";
import type { DraggableWidget } from "./draggable-widget.svelte.js";
import { SPEECH_PROVIDERS, type SpeechProvider } from "./speech-recognition.js";
import type { SpeechRecognitionInstance } from "./speech-recognition.svelte.js";

interface Props {
	/** The positioned root element, handed back so the parent can measure and clamp it. */
	element?: HTMLDivElement | null;
	speech: SpeechRecognitionInstance;
	widget: DraggableWidget;
	activeLang: string;
	selectedProvider: SpeechProvider;
	onProviderChange: (provider: SpeechProvider) => void;
	onStop: () => void;
}

let {
	element = $bindable(null),
	speech,
	widget,
	activeLang,
	selectedProvider,
	onProviderChange,
	onStop,
}: Props = $props();

const position = $derived(widget.position);

const handleProviderChange = (event: Event) => {
	const target = event.currentTarget;
	if (!(target instanceof HTMLSelectElement)) {
		return;
	}
	onProviderChange(target.value as SpeechProvider);
};
</script>

<div
	bind:this={element}
	role="dialog"
	aria-label="Speech dictation"
	aria-live="polite"
	aria-modal="false"
	tabindex="-1"
	data-slot="mic-widget"
	data-placed={position !== null}
	data-dragging={widget.isDragging}
	onpointerdown={widget.startDrag}
	style="left:{position?.x ?? 0}px;top:{position?.y ?? 0}px;"
	class="pointer-events-auto fixed z-200 w-72 max-w-[calc(100vw-1rem)] cursor-grab overflow-hidden rounded-lg border border-border bg-popover/95 text-xs text-popover-foreground opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-150 select-none data-[dragging=true]:cursor-grabbing data-[dragging=true]:shadow-xl data-[placed=true]:opacity-100"
>
	<div class="flex items-center gap-2 border-b border-border/50 px-3 py-2">
		<GripHorizontal class="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
		{#if speech.isTranscribing}
			<Loader2Icon class="size-3.5 shrink-0 animate-spin text-primary" aria-hidden="true" />
			<!-- <span class="font-medium">Transcribing…</span> -->
		{:else}
			<span class="relative flex size-2 shrink-0" aria-hidden="true">
				<span class="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75"
				></span>
				<span class="relative inline-flex size-2 rounded-full bg-red-500"></span>
			</span>
			<span class="font-medium">{speech.isSpeaking ? 'Speaking…' : 'Listening…'}</span>
		{/if}
		<span
			class="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase"
		>
			{activeLang}
		</span>
	</div>

	<div class="px-3 py-2.5">
		{#if speech.isTranscribing}
			<p class="leading-relaxed text-muted-foreground">Transcribing…</p>
		{:else if speech.interimTranscript.length > 0}
			<div
				data-no-drag
				class="max-h-24 cursor-text overflow-y-auto rounded-md border border-border/40 bg-muted/60 p-2 font-mono text-xs wrap-break-word text-foreground italic select-text"
			>
				&ldquo;{speech.interimTranscript}&rdquo;
			</div>
		{:else}
			<p class="leading-relaxed text-muted-foreground">
				{#if speech.isSpeaking}
					<MicAudioLines class="mr-1 inline size-3" aria-hidden="true" />
				{/if}
				Speak into your microphone…
			</p>
		{/if}
	</div>

	<div
		class="flex items-center justify-between border-t border-border/40 px-3 py-2 text-[11px] text-muted-foreground"
	>
		<select
			value={selectedProvider}
			onchange={handleProviderChange}
			disabled={speech.isTranscribing}
			class="cursor-pointer rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-foreground transition-colors hover:bg-muted focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Speech provider"
		>
			<option value={SPEECH_PROVIDERS.openaiCompatible}>OpenAI</option>
			<option value={SPEECH_PROVIDERS.wit}>Wit.ai</option>
		</select>
		<button
			type="button"
			onclick={onStop}
			disabled={speech.isTranscribing}
			class="cursor-pointer rounded px-2 py-0.5 font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
		>
			Stop
		</button>
	</div>
</div>
