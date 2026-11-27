/**
 * Single source of truth for speech transcription provider ids.
 *
 * Kept intentionally small and vendor-neutral: the only supported backends are
 * a generic OpenAI-compatible endpoint and Wit.ai.
 */
export const SPEECH_PROVIDERS = {
  openaiCompatible: "openai-compatible",
  wit: "wit",
} as const;

export type SpeechProvider = (typeof SPEECH_PROVIDERS)[keyof typeof SPEECH_PROVIDERS];
