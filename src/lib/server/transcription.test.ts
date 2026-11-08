import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { SPEECH_PROVIDERS } from "$lib/speech-providers";
import {
  getDefaultSpeechProvider,
  isSpeechTranscriptionConfigured,
  transcribeAudio,
} from "./transcription.js";

vi.mock("ai", () => {
  return {
    transcribe: vi.fn(async (_params: { model: unknown; audio: unknown }) => {
      return {
        text: "AI SDK unified speech transcription",
        language: "en",
        durationInSeconds: 4.1,
      };
    }),
  };
});

vi.mock("$lib/server/ai-observability", () => ({
  flushAiObservability: vi.fn(async () => undefined),
}));

vi.mock("./wit-ai.js", () => {
  return {
    getWitAiToken: () => process.env.WIT_AI_TOKEN,
    isWitAiConfigured: () => Boolean(process.env.WIT_AI_TOKEN),
    transcribeAudioWithWitAi: vi.fn(async () => ({
      text: "Wit.ai speech transcription",
      isFinal: true,
    })),
  };
});

import * as witModule from "./wit-ai.js";

describe("Unified Speech Transcription Dispatcher", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPEECH_API_KEY;
    delete process.env.SPEECH_ENDPOINT;
    delete process.env.SPEECH_MODEL;
    delete process.env.OPEN_AI_APIKEY;
    delete process.env.OPEN_AI_ENDPOINT;
    delete process.env.WIT_AI_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getDefaultSpeechProvider and isSpeechTranscriptionConfigured", () => {
    it("returns null and configured false when neither provider is set", () => {
      expect(getDefaultSpeechProvider()).toBeNull();

      const status = isSpeechTranscriptionConfigured();
      expect(status.configured).toBe(false);
      expect(status.openaiCompatible).toBe(false);
      expect(status.wit).toBe(false);
      expect(status.defaultProvider).toBeNull();
    });

    it("does not enable OpenAI-compatible transcription without a speech model", () => {
      process.env.SPEECH_API_KEY = "speech-key";

      expect(getDefaultSpeechProvider()).toBeNull();
      expect(isSpeechTranscriptionConfigured().openaiCompatible).toBe(false);
    });

    it("prefers OpenAI-compatible when it is fully configured", () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";
      process.env.WIT_AI_TOKEN = "wit_test";

      expect(getDefaultSpeechProvider()).toBe(SPEECH_PROVIDERS.openaiCompatible);

      const status = isSpeechTranscriptionConfigured();
      expect(status.configured).toBe(true);
      expect(status.openaiCompatible).toBe(true);
      expect(status.wit).toBe(true);
      expect(status.defaultProvider).toBe(SPEECH_PROVIDERS.openaiCompatible);
    });

    it("falls back to Wit.ai when only Wit is configured", () => {
      process.env.WIT_AI_TOKEN = "wit_test";

      expect(getDefaultSpeechProvider()).toBe(SPEECH_PROVIDERS.wit);

      const status = isSpeechTranscriptionConfigured();
      expect(status.configured).toBe(true);
      expect(status.openaiCompatible).toBe(false);
      expect(status.wit).toBe(true);
      expect(status.defaultProvider).toBe(SPEECH_PROVIDERS.wit);
    });
  });

  describe("transcribeAudio", () => {
    it("throws when no provider is configured and none requested", async () => {
      await expect(transcribeAudio(new Uint8Array([1, 2, 3]))).rejects.toThrow(
        "No speech transcription provider is configured",
      );
    });

    it("dispatches to the OpenAI-compatible AI SDK provider when requested", async () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      const result = await transcribeAudio(new Uint8Array([1, 2, 3]), {
        provider: SPEECH_PROVIDERS.openaiCompatible,
      });

      expect(result.provider).toBe(SPEECH_PROVIDERS.openaiCompatible);
      expect(result.text).toBe("AI SDK unified speech transcription");
    });

    it("falls back to the configured OpenAI-compatible provider", async () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      const result = await transcribeAudio(new Uint8Array([1, 2, 3]));

      expect(result.provider).toBe(SPEECH_PROVIDERS.openaiCompatible);
      expect(result.text).toBe("AI SDK unified speech transcription");
    });

    it("dispatches to Wit.ai when requested", async () => {
      process.env.WIT_AI_TOKEN = "wit_test";

      const result = await transcribeAudio(new Uint8Array([1, 2, 3]), {
        provider: SPEECH_PROVIDERS.wit,
      });

      expect(witModule.transcribeAudioWithWitAi).toHaveBeenCalled();
      expect(result.provider).toBe(SPEECH_PROVIDERS.wit);
      expect(result.text).toBe("Wit.ai speech transcription");
    });

    it("falls back to Wit.ai when an unconfigured OpenAI-compatible provider is requested", async () => {
      process.env.WIT_AI_TOKEN = "wit_test";

      const result = await transcribeAudio(new Uint8Array([1, 2, 3]), {
        provider: SPEECH_PROVIDERS.openaiCompatible,
      });

      expect(result.provider).toBe(SPEECH_PROVIDERS.wit);
      expect(result.text).toBe("Wit.ai speech transcription");
    });
  });
});
