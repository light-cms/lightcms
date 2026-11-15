import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  isAiSdkSpeechConfigured,
  resolveSpeechConfig,
  transcribeWithAiSdk,
} from "./speech-ai-sdk.js";

vi.mock("ai", () => {
  return {
    transcribe: vi.fn(async (_params: { model: unknown; audio: unknown }) => {
      return {
        text: "Transcribed audio via AI SDK",
        language: "en",
        durationInSeconds: 3.2,
      };
    }),
  };
});

vi.mock("$lib/server/ai-observability", () => ({
  flushAiObservability: vi.fn(async () => undefined),
}));

describe("Vendor-neutral Speech AI SDK", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPEECH_API_KEY;
    delete process.env.SPEECH_ENDPOINT;
    delete process.env.SPEECH_MODEL;
    delete process.env.OPEN_AI_APIKEY;
    delete process.env.OPEN_AI_ENDPOINT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("resolveSpeechConfig", () => {
    it("returns null when no key is available", () => {
      expect(resolveSpeechConfig()).toBeNull();
    });

    it("returns null when a key is set but no model is configured", () => {
      process.env.SPEECH_API_KEY = "speech-key";
      expect(resolveSpeechConfig()).toBeNull();
    });

    it("resolves an OpenAI-compatible config from SPEECH_* variables", () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_ENDPOINT = "https://speech.example.com/v1";
      process.env.SPEECH_MODEL = "custom-whisper";

      expect(resolveSpeechConfig()).toEqual({
        apiKey: "speech-key",
        baseURL: "https://speech.example.com/v1",
        model: "custom-whisper",
      });
    });

    it("falls back to OPEN_AI_APIKEY for the key", () => {
      process.env.OPEN_AI_APIKEY = "openai-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      expect(resolveSpeechConfig()?.apiKey).toBe("openai-key");
    });

    it("lets explicit options override environment values", () => {
      process.env.SPEECH_API_KEY = "env-key";
      process.env.SPEECH_MODEL = "env-model";

      const config = resolveSpeechConfig({
        apiKey: "explicit-key",
        endpoint: "https://explicit.example.com/v1",
        model: "explicit-model",
      });

      expect(config?.apiKey).toBe("explicit-key");
      expect(config?.baseURL).toBe("https://explicit.example.com/v1");
      expect(config?.model).toBe("explicit-model");
    });

    it("leaves baseURL undefined when no endpoint is configured", () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      expect(resolveSpeechConfig()?.baseURL).toBeUndefined();
    });

    it("ignores whitespace-only values", () => {
      process.env.SPEECH_API_KEY = "   ";
      process.env.SPEECH_MODEL = "   ";
      expect(resolveSpeechConfig()).toBeNull();
    });
  });

  describe("isAiSdkSpeechConfigured", () => {
    it("is false without a key or model, and true when both are present", () => {
      expect(isAiSdkSpeechConfigured()).toBe(false);

      process.env.SPEECH_API_KEY = "speech-key";
      expect(isAiSdkSpeechConfigured()).toBe(false);

      process.env.SPEECH_MODEL = "custom-whisper";
      expect(isAiSdkSpeechConfigured()).toBe(true);
    });
  });

  describe("transcribeWithAiSdk", () => {
    it("throws when unconfigured", async () => {
      await expect(transcribeWithAiSdk(new Uint8Array([1, 2, 3]))).rejects.toThrow(
        "OpenAI-compatible speech is not configured",
      );
    });

    it("returns empty text for empty buffer", async () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      const res = await transcribeWithAiSdk(new Uint8Array([]));
      expect(res.text).toBe("");
      expect(res.isFinal).toBe(true);
    });

    it("transcribes audio and returns the resolved model", async () => {
      process.env.SPEECH_API_KEY = "speech-key";
      process.env.SPEECH_MODEL = "custom-whisper";

      const res = await transcribeWithAiSdk(new Uint8Array([1, 2, 3]), {
        language: "en",
      });

      expect(res.text).toBe("Transcribed audio via AI SDK");
      expect(res.model).toBe("custom-whisper");
      expect(res.isFinal).toBe(true);
      expect(res.durationInSeconds).toBe(3.2);
    });
  });
});
