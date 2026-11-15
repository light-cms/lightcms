import { SPEECH_PROVIDERS, type SpeechProvider } from "$lib/speech-providers";
import { isAiSdkSpeechConfigured, transcribeWithAiSdk } from "./speech-ai-sdk.js";
import { isWitAiConfigured, transcribeAudioWithWitAi } from "./wit-ai.js";

export type { SpeechProvider };

export interface TranscribeSpeechOptions {
  provider?: SpeechProvider;
  endpoint?: string;
  apiKey?: string;
  model?: string;
  contentType?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
}

export interface SpeechTranscriptionResult {
  text: string;
  provider: SpeechProvider;
  model?: string;
  isFinal: boolean;
  language?: string;
  durationInSeconds?: number;
}

export function isSpeechProviderConfigured(provider: SpeechProvider): boolean {
  if (provider === SPEECH_PROVIDERS.wit) {
    return isWitAiConfigured();
  }
  return isAiSdkSpeechConfigured();
}

/**
 * The OpenAI-compatible backend is chosen when both its API key and speech model
 * are configured.
 */
export function getDefaultSpeechProvider(): SpeechProvider | null {
  if (isAiSdkSpeechConfigured()) {
    return SPEECH_PROVIDERS.openaiCompatible;
  }
  if (isWitAiConfigured()) {
    return SPEECH_PROVIDERS.wit;
  }
  return null;
}

export function isSpeechTranscriptionConfigured(): {
  configured: boolean;
  openaiCompatible: boolean;
  wit: boolean;
  defaultProvider: SpeechProvider | null;
} {
  const openaiCompatible = isAiSdkSpeechConfigured();
  const wit = isWitAiConfigured();

  return {
    configured: openaiCompatible || wit,
    openaiCompatible,
    wit,
    defaultProvider: getDefaultSpeechProvider(),
  };
}

export async function transcribeAudio(
  audio: Uint8Array | Buffer | ArrayBuffer,
  options?: TranscribeSpeechOptions,
): Promise<SpeechTranscriptionResult> {
  const requested = options?.provider;
  let targetProvider: SpeechProvider | null = null;

  if (requested === SPEECH_PROVIDERS.wit && isWitAiConfigured()) {
    targetProvider = SPEECH_PROVIDERS.wit;
  }
  if (requested === SPEECH_PROVIDERS.openaiCompatible && isAiSdkSpeechConfigured(options)) {
    targetProvider = SPEECH_PROVIDERS.openaiCompatible;
  }
  if (!targetProvider && isAiSdkSpeechConfigured(options)) {
    targetProvider = SPEECH_PROVIDERS.openaiCompatible;
  }
  if (!targetProvider && isWitAiConfigured()) {
    targetProvider = SPEECH_PROVIDERS.wit;
  }

  if (!targetProvider) {
    throw new Error(
      "No speech transcription provider is configured. Please set SPEECH_API_KEY and SPEECH_MODEL (OpenAI-compatible), or WIT_AI_TOKEN (Wit.ai).",
    );
  }

  if (targetProvider === SPEECH_PROVIDERS.wit) {
    const witResult = await transcribeAudioWithWitAi(audio, {
      contentType: options?.contentType,
      language: options?.language,
      prompt: options?.prompt,
      temperature: options?.temperature,
    });
    return {
      text: witResult.text,
      provider: SPEECH_PROVIDERS.wit,
      isFinal: witResult.isFinal,
    };
  }

  const result = await transcribeWithAiSdk(audio, {
    endpoint: options?.endpoint,
    apiKey: options?.apiKey,
    model: options?.model,
    language: options?.language,
    prompt: options?.prompt,
    temperature: options?.temperature,
  });

  return {
    text: result.text,
    provider: SPEECH_PROVIDERS.openaiCompatible,
    model: result.model,
    isFinal: result.isFinal,
    language: result.language,
    durationInSeconds: result.durationInSeconds,
  };
}
