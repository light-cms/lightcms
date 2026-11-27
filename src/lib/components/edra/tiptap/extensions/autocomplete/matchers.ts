import { BLOCK_TRIGGERS, INLINE_PAIRS } from "./catalog";
import { lookupEmoji } from "./emoji";
import type {
	AutocompleteOptions,
	BlockTrigger,
	InlinePair,
	TextMatch,
} from "./types";

const EMOJI_PATTERN = /:([a-z0-9_+-]{2,})$/;

export function matchBlockTrigger(
	before: string,
	triggers: readonly BlockTrigger[],
): TextMatch | null {
	for (const trigger of triggers) {
		if (!trigger.match.test(before)) continue;
		return {
			length: before.length,
			ghost: trigger.ghost,
			apply: (editor, range) => {
				editor.chain().focus().deleteRange(range).run();
				trigger.apply(editor);
			},
		};
	}
	return null;
}

export function matchInlinePair(
	before: string,
	pairs: readonly InlinePair[],
): TextMatch | null {
	for (const pair of pairs) {
		if (!before.endsWith(pair.trigger)) continue;
		return {
			length: pair.trigger.length,
			ghost: pair.closing,
			apply: (editor, range) => {
				editor
					.chain()
					.focus()
					.insertContentAt(range.to, pair.closing)
					.setTextSelection(range.to)
					.run();
			},
		};
	}
	return null;
}

export function matchEmoji(before: string): TextMatch | null {
	const match = EMOJI_PATTERN.exec(before);
	if (!match) return null;

	const emoji = lookupEmoji(match[1]);
	if (!emoji) return null;

	return {
		length: match[0].length,
		ghost: emoji,
		apply: (editor, range) => {
			editor.chain().focus().deleteRange(range).insertContent(emoji).run();
		},
	};
}

/**
 * Resolve the single completion for the text before the cursor. Block
 * shortcuts take priority (so `*` at the start of a line bullets rather than
 * italicises), then emoji shortcodes, then inline pairs.
 */
export function matchCompletion(
	before: string,
	options: AutocompleteOptions = {
		blockTriggers: BLOCK_TRIGGERS,
		inlinePairs: INLINE_PAIRS,
		emoji: true,
	},
): TextMatch | null {
	const block = matchBlockTrigger(before, options.blockTriggers);
	if (block) return block;

	if (options.emoji) {
		const emoji = matchEmoji(before);
		if (emoji) return emoji;
	}

	return matchInlinePair(before, options.inlinePairs);
}
