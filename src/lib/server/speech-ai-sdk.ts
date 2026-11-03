import { createOpenAI } from "@ai-sdk/openai";
import { transcribe } from "ai";
import { flushAiObservability } from "$lib/server/ai-observability";

export interface TranscribeAiSdkOptions {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
}

export interface AiSdkTranscriptionResult {
  text: string;
  model: string;
  isFinal: boolean;
  language?: string;
  durationInSeconds?: number;
}

export interface ResolvedSpeechConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
}

export function resolveSpeechConfig(_options?: TranscribeAiSdkOptions): ResolvedSpeechConfig {
  const apiKey = process.env.SPEECH_API_KEY!;
  const model = process.env.SPEECH_MODEL!;

  let baseURL = process.env.SPEECH_ENDPOINT?.trim() || undefined;
  if (baseURL) {
    baseURL = baseURL.replace(/\/audio\/transcriptions\/?$/i, "").replace(/\/+$/, "");
    if (baseURL === "") baseURL = undefined;
  }

  return {
    apiKey,
    baseURL,
    model,
  };
}

export function isAiSdkSpeechConfigured(): boolean {
  return resolveSpeechConfig() !== null;
}

export async function transcribeWithAiSdk(
  audio: Uint8Array | Buffer | ArrayBuffer,
  options?: TranscribeAiSdkOptions,
): Promise<AiSdkTranscriptionResult> {
  const config = resolveSpeechConfig(options);
  if (!config) {
    throw new Error(
      "OpenAI-compatible speech is not configured. Please set SPEECH_API_KEY and SPEECH_MODEL.",
    );
  }

  const byteLength = audio instanceof ArrayBuffer ? audio.byteLength : audio.length;
  if (byteLength === 0) {
    return {
      text: "",
      model: config.model,
      isFinal: true,
    };
  }

  const openai = createOpenAI({
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });

  const providerOptions: Record<string, string | number> = {};
  if (options?.language) {
    providerOptions.language = options.language;
  }
  if (options?.prompt) {
    providerOptions.prompt = options.prompt;
  }
  if (typeof options?.temperature === "number") {
    providerOptions.temperature = options.temperature;
  }

  const audioPayload = audio instanceof ArrayBuffer ? new Uint8Array(audio) : audio;

  try {
    const result = await transcribe({
      model: openai.transcription(config.model),
      audio: audioPayload,
      providerOptions: {
        openai: providerOptions,
      },
      telemetry: {
        functionId: "cms_speech_transcription",
        recordInputs: true,
        recordOutputs: true,
      },
    });

    return {
      text: result.text.trim(),
      model: config.model,
      isFinal: true,
      language: result.language,
      durationInSeconds: result.durationInSeconds,
    };
  } finally {
    await flushAiObservability();
  }
}
