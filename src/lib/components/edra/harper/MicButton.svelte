<script lang="ts">
import Loader2Icon from "@lucide/svelte/icons/loader-2";
import Mic from "@lucide/svelte/icons/mic";
import MicAudioLines from "@lucide/svelte/icons/mic-audio-lines";
import MicOff from "@lucide/svelte/icons/mic-off";
import { Portal } from "bits-ui";
import { toast } from "svelte-sonner";
import {
	type ButtonSize,
	type ButtonVariant,
	buttonVariants,
} from "$lib/components/ui/button";
import { cn } from "$lib/utils.js";
import Tooltip from "../shadcn/components/Tooltip.svelte";
import {
	DICTATION_SHORTCUT_LABEL,
	isDictationShortcut,
	isEditableTarget,
} from "./dictation-shortcut.js";
import { createDraggableWidget } from "./draggable-widget.svelte.js";
import MicWidgetPanel from "./MicWidgetPanel.svelte";
import { SPEECH_PROVIDERS, type SpeechProvider } from "./speech-recognition.js";
import { untrack } from "svelte";
import { createSpeechRecognition } from "./speech-recognition.svelte";

interface Props {
	onTranscript: (text: string) => void;
	onInterim?: (text: string) => void;
	lang?: string;
	provider?: SpeechProvider;
	class?: string;
	size?: ButtonSize;
	variant?: ButtonVariant;
	tooltip?: string;
	/**
	 * Listens for the editor-scoped dictation shortcut. Only one mounted
	 * instance should enable this, otherwise a single keypress would toggle
	 * two simultaneous recording sessions.
	 */
	shortcut?: boolean;
}

let {
	onTranscript,
	onInterim,
	lang,
	provider = SPEECH_PROVIDERS.openaiCompatible,
	class: className = "",
	size = "icon",
	variant = "ghost",
	tooltip = "Dictate (live speech to text)",
	shortcut = false,
}: Props = $props();

let selectedProvider = $state<SpeechProvider>(untrack(() => provider));

const speech = createSpeechRecognition({
	get lang() {
		return lang;
	},
	get provider() {
		return selectedProvider;
	},
	onTranscript(finalChunk) {
		onTranscript(finalChunk);
	},
	onInterim(interimChunk) {
		if (onInterim) {
			onInterim(interimChunk);
		}
	},
	onError(err) {
		toast.error(err.message);
	},
});

let anchorEl = $state<HTMLButtonElement | null>(null);
let panelEl = $state<HTMLDivElement | null>(null);

const widget = createDraggableWidget({ getElement: () => panelEl });

$effect(() => {
	return () => {
		widget.reset();
		speech.destroy();
	};
});

const isWidgetOpen = $derived(speech.isListening || speech.isTranscribing);

$effect(() => {
	if (!isWidgetOpen || !anchorEl || !panelEl) {
		return;
	}
	void widget.place(anchorEl);
});

$effect(() => {
	if (!isWidgetOpen) {
		widget.reset();
	}
});

const activeLang = $derived(
	lang ??
		(typeof navigator !== "undefined" && navigator.language
			? navigator.language
			: "en-US"),
);

const providerDisplayName = $derived.by(() => {
	switch (selectedProvider) {
		case SPEECH_PROVIDERS.wit:
			return "Wit.ai";
		default:
			return "OpenAI-compatible";
	}
});

const buttonAriaLabel = $derived(
	speech.isTranscribing
		? `Transcribing audio with ${providerDisplayName}...`
		: speech.isListening
			? "Stop dictation"
			: "Start dictation",
);

const handleClick = () => {
	if (!speech.isSupported) {
		toast.error("Speech recognition is not supported in this browser.");
		return;
	}
	if (speech.isTranscribing) {
		return;
	}
	speech.toggle();
};

const handleProviderChange = (nextProvider: SpeechProvider) => {
	selectedProvider = nextProvider;
	speech.setProvider(nextProvider);
};

const handleStop = () => {
	void speech.stop();
};

const handleShortcutKeydown = (event: KeyboardEvent) => {
	if (
		!shortcut ||
		!isDictationShortcut(event) ||
		!isEditableTarget(event.target)
	) {
		return;
	}
	event.preventDefault();
	handleClick();
};
</script>

<svelte:document onkeydown={handleShortcutKeydown} />

<svelte:window onresize={() => widget.clampIntoView()} />

<div class="inline-flex items-center">
	{#if isWidgetOpen}
		<button
			bind:this={anchorEl}
			type="button"
			onclick={handleClick}
			disabled={speech.isTranscribing}
			class={cn(
				buttonVariants({ variant, size }),
				'relative text-red-500 hover:text-red-600 dark:text-red-400',
				className
			)}
			aria-label={buttonAriaLabel}
			aria-pressed={true}
			data-state="active"
		>
			{#if speech.isTranscribing}
				<Loader2Icon class="size-4 animate-spin text-primary" />
			{:else if speech.isSpeaking}
				<MicAudioLines class="size-4 animate-pulse" />
			{:else}
				<MicOff class="size-4" />
			{/if}
			{#if !speech.isTranscribing}
				<span class="absolute -top-0.5 -right-0.5 flex size-2">
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
					<span class="relative inline-flex size-2 rounded-full bg-red-500"></span>
				</span>
			{/if}
		</button>
	{:else}
		<Tooltip
			tooltip={speech.isSupported ? tooltip : 'Speech recognition not supported in this browser'}
			shortCut={shortcut ? DICTATION_SHORTCUT_LABEL : ''}
		>
			<button
				type="button"
				onclick={handleClick}
				disabled={!speech.isSupported}
				class={cn(
					buttonVariants({ variant, size }),
					!speech.isSupported && 'cursor-not-allowed opacity-40',
					className
				)}
				aria-label={buttonAriaLabel}
				aria-pressed={false}
				data-state="idle"
			>
				<Mic class="size-4" />
			</button>
		</Tooltip>
	{/if}
</div>

{#if isWidgetOpen}
	<Portal>
		<MicWidgetPanel
			bind:element={panelEl}
			{speech}
			{widget}
			{activeLang}
			{selectedProvider}
			onProviderChange={handleProviderChange}
			onStop={handleStop}
		/>
	</Portal>
{/if}
