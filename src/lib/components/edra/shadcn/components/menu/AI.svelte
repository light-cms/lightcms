<script lang="ts">
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import {
	AIState,
	CONTINUE_WRITING_PROMPT,
	EXPLAIN_PROMPT,
	FIX_GRAMMAR_PROMPT,
	IMPROVE_WRITING_PROMPT,
	MAKE_LONGER_PROMPT,
	MAKE_SHORTER_PROMPT,
	SIMPLIFY_LANGUAGE_PROMPT,
	SOLVE_PROBLEM_PROMPT,
	SUMMARIZE_PROMPT,
} from "../../../commands/index.js";
import {
	BubbleMenu,
	getEditor,
	removeAIHighlight,
	useEditorTransaction,
} from "../../../tiptap/index.js";
import AiActionBar from "./ai/AiActionBar.svelte";
import AiPromptForm from "./ai/AiPromptForm.svelte";
import AiQuickActions from "./ai/AiQuickActions.svelte";
import AiStreamingIndicator from "./ai/AiStreamingIndicator.svelte";
import { resolveAiKeydown } from "./ai/keyboard.js";
import {
	type AiActionId,
	EMPTY_QUICK_ACTIONS,
	type QuickAction,
	SELECTION_QUICK_ACTIONS,
} from "./ai/quick-actions.js";
import { createAIContentManager } from "./ai-content-manager.js";

const editor = getEditor();
const manager = createAIContentManager(editor);
const transaction = useEditorTransaction(editor);

const PROMPT_BUILDERS: Record<AiActionId, (text: string) => string> = {
	improve: IMPROVE_WRITING_PROMPT,
	grammer: FIX_GRAMMAR_PROMPT,
	shorter: MAKE_SHORTER_PROMPT,
	longer: MAKE_LONGER_PROMPT,
	simplify: SIMPLIFY_LANGUAGE_PROMPT,
	summarize: SUMMARIZE_PROMPT,
	continue: CONTINUE_WRITING_PROMPT,
	solve: SOLVE_PROBLEM_PROMPT,
	explain: EXPLAIN_PROMPT,
};

let inputTag = $state<HTMLInputElement | null>(null);
let inputValue = $state("");
let isOpen = $state(false);
let hasSelection = $state(false);
let aiState = $state(AIState.Idle);
let aiResponse = $state("");
let activeOptionIndex = $state(0);
let generating = $state(false);

const activeCallAI = $derived(
	editor.extensionManager.extensions.find((e) => e.name === "ai-highlight")
		?.options?.callAI,
);

const currentActions = $derived(
	hasSelection ? SELECTION_QUICK_ACTIONS : EMPTY_QUICK_ACTIONS,
);

onMount(() => {
	const onOpenAI = (payload?: { prompt?: string }) => {
		const { from, to } = editor.state.selection;
		const resolvedFrom = editor.state.doc.resolve(from);
		const isBlockEmpty = resolvedFrom.parent.textContent.trim().length === 0;
		hasSelection = from !== to && !isBlockEmpty;

		isOpen = true;
		aiState = AIState.Idle;
		inputValue = payload?.prompt ?? "";
		activeOptionIndex = 0;
		setTimeout(() => inputTag?.focus(), 40);
	};

	const onCloseAI = () => {
		closeAI();
	};

	editor.on("openAI", onOpenAI);
	editor.on("closeAI", onCloseAI);

	return () => {
		editor.off("openAI", onOpenAI);
		editor.off("closeAI", onCloseAI);
	};
});

function isAIActive(): boolean {
	void transaction.version;
	return isOpen || editor.isActive("ai-highlight");
}

function getAIHighlightedText(): string | undefined {
	void transaction.version;
	let range = { from: -1, to: -1 };
	editor.state.doc.descendants((node, pos) => {
		if (node.marks.some((mark) => mark.type.name === "ai-highlight")) {
			if (range.from === -1) range.from = pos;
			range.to = pos + node.nodeSize;
		}
	});
	if (range.from === -1 || range.to === -1) {
		const { from, to } = editor.state.selection;
		if (from !== to) {
			return editor.state.doc.textBetween(from, to);
		}
		return undefined;
	}
	const slice = editor.view.state.doc.cut(range.from, range.to);
	if (editor.markdown) {
		return editor.markdown.serialize(slice.toJSON());
	}
	return editor.state.doc.textBetween(range.from, range.to);
}

async function generateAIContent(prompt: string, isRetry = false) {
	generating = true;
	manager.initGeneration(prompt, isRetry);
	aiResponse = "";

	try {
		const onChunk = (chunk: string) => {
			aiResponse += chunk;
			manager.state.aiResponse = aiResponse;
			manager.scheduleEditorUpdate(() => manager.flushEditorUpdate());
		};
		const onError = (error: Error) => {
			toast.error("Something went wrong when calling AI.", {
				description: error.message,
			});
			console.error(error);
			manager.cleanupAIContent();
			removeAIHighlight(editor);
			aiState = AIState.Idle;
			isOpen = false;
			aiResponse = "";
			generating = false;
		};

		if (activeCallAI) {
			await activeCallAI(prompt, onChunk, onError);
		}
		manager.flushEditorUpdate();
	} finally {
		generating = false;
	}
}

async function processAction(action: AiActionId) {
	try {
		isOpen = false;
		aiState = AIState.Confirmation;

		if (action === "continue") {
			const { from } = editor.state.selection;
			const preText = editor.state.doc.textBetween(Math.max(0, from - 1000), from);
			await generateAIContent(CONTINUE_WRITING_PROMPT(preText));
			return;
		}

		if (action === "explain") {
			const selected = getAIHighlightedText() ?? "";
			await generateAIContent(EXPLAIN_PROMPT(selected.trim() ? selected : "Explain this"));
			return;
		}

		if (action === "summarize") {
			const selected = getAIHighlightedText();
			const text = selected && selected.trim()
				? selected
				: editor.state.doc.textBetween(0, editor.state.doc.content.size);
			await generateAIContent(SUMMARIZE_PROMPT(text));
			return;
		}

		const selectedText = getAIHighlightedText();
		if (!selectedText || selectedText.trim().length === 0) {
			toast.error("Please select text to apply this action");
			aiState = AIState.Idle;
			isOpen = true;
			return;
		}

		await generateAIContent(PROMPT_BUILDERS[action](selectedText));
	} catch (error) {
		aiState = AIState.Idle;
		isOpen = false;
		console.error(error);
		toast.error("Something went wrong! Check console.");
	}
}

async function handleSubmit() {
	const prompt = inputValue.trim();
	if (!prompt) return;
	inputValue = "";
	isOpen = false;
	aiState = AIState.Confirmation;

	const selected = getAIHighlightedText();
	const fullPrompt = selected && selected.trim()
		? `Context:\n${selected}\n\nInstruction:\n${prompt}\n\nOutput:`
		: prompt;

	try {
		await generateAIContent(fullPrompt);
	} catch (error) {
		aiState = AIState.Idle;
		isOpen = false;
		console.error(error);
		toast.error("Something went wrong! Check console.");
	}
}

async function handleFollowUp(followUpPrompt: string) {
	const currentResponse = manager.state.aiResponse;
	aiState = AIState.Confirmation;
	const prompt = `Previous content:\n${currentResponse}\n\nFollow-up instruction:\n${followUpPrompt}\n\nRewrite the content according to the follow-up instruction. Output ONLY the rewritten content:`;
	await generateAIContent(prompt, true);
}

function acceptChanges() {
	manager.accept();
	aiState = AIState.Idle;
	isOpen = false;
	aiResponse = "";
	editor.commands.focus();
}

function discardChanges() {
	manager.discardChanges();
	aiState = AIState.Idle;
	isOpen = false;
	aiResponse = "";
	editor.commands.focus();
}

function retry() {
	manager.retry((prompt) => {
		void generateAIContent(prompt, true);
	});
}

function closeAI() {
	manager.closeAI(() => {
		generating = false;
	});
	aiState = AIState.Idle;
	isOpen = false;
	aiResponse = "";
}

function scrollActiveOptionIntoView() {
	setTimeout(() => {
		const activeEl = document.querySelector(".quick-action-active");
		if (activeEl) {
			activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, 0);
}

function handleKeydown(event: KeyboardEvent) {
	if (!isOpen && aiState !== AIState.Confirmation) return;

	const result = resolveAiKeydown(event, {
		aiActive: isAIActive(),
		aiState,
		hasInput: inputValue.trim().length > 0,
		actionCount: currentActions.length,
		activeIndex: activeOptionIndex,
	});
	if (!result) return;

	event.preventDefault();

	if (result.type === "close") {
		if (aiState === AIState.Confirmation) {
			discardChanges();
		} else {
			closeAI();
		}
		return;
	}
	if (result.type === "submit") {
		void handleSubmit();
		return;
	}
	if (result.type === "move") {
		activeOptionIndex = result.index;
		scrollActiveOptionIntoView();
		return;
	}
	const action = currentActions[result.index];
	if (action) {
		void processAction(action.id);
	}
}
</script>

<svelte:document onkeydown={handleKeydown} />

<BubbleMenu
	{editor}
	pluginKey="ai-bubble-menu"
	shouldShow={(props) => {
		const { editor: propsEditor, view } = props;
		if (!propsEditor?.isEditable || propsEditor?.isDestroyed) return false;
		if (!view || propsEditor.view.dragging) return false;

		if (isOpen) return true;
		if (aiState === AIState.Confirmation) return true;
		if (propsEditor.isActive('ai-highlight')) {
			isOpen = true;
			return true;
		}

		return false;
	}}
	class="absolute z-100 flex max-h-120 max-w-3xl flex-col p-0 transition-[height] duration-500"
	options={{
		strategy: 'absolute',
		placement: 'bottom-start',
		flip: {
			fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
		},
		shift: {
			padding: 8,
		},
		offset: 8,
		scrollTarget: editor.view.dom.parentElement ?? window,
		onShow() {
			activeOptionIndex = 0;
			setTimeout(() => inputTag?.focus({ preventScroll: true }), 40);
		},
		onHide() {
			inputTag?.blur();
		}
	}}
>
	{#if isOpen && aiState === AIState.Idle}
		<div class="flex w-80 sm:w-96 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-2xl">
			<AiPromptForm
				bind:value={inputValue}
				bind:inputRef={inputTag}
				{hasSelection}
				onSubmit={handleSubmit}
			/>

			{#if !inputValue.trim()}
				<AiQuickActions
					actions={currentActions}
					activeIndex={activeOptionIndex}
					onSelect={(action: QuickAction) => void processAction(action.id)}
					onHover={(index: number) => (activeOptionIndex = index)}
				/>
			{/if}
		</div>
	{:else if aiState === AIState.Confirmation}
		{#if generating}
			<AiStreamingIndicator />
		{:else}
			<AiActionBar
				onAccept={acceptChanges}
				onDiscard={discardChanges}
				onRetry={retry}
				onFollowUp={handleFollowUp}
			/>
		{/if}
	{/if}
</BubbleMenu>
