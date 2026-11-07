import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  getSupportedAudioMimeType,
  isSpeechRecognitionSupported,
  normalizeLanguageCode,
} from "./speech-recognition.js";

const originalWindow = (globalThis as Record<string, unknown>).window;
const originalNavigator = (globalThis as Record<string, unknown>).navigator;
const originalMediaRecorder = (globalThis as Record<string, unknown>).MediaRecorder;

function stubGlobal(key: string, value: unknown) {
  if (typeof vi.stubGlobal === "function") {
    vi.stubGlobal(key, value);
  } else {
    (globalThis as Record<string, unknown>)[key] = value;
  }
}

function unstubAllGlobals() {
  if (typeof vi.unstubAllGlobals === "function") {
    vi.unstubAllGlobals();
  } else {
    (globalThis as Record<string, unknown>).window = originalWindow;
    (globalThis as Record<string, unknown>).navigator = originalNavigator;
    (globalThis as Record<string, unknown>).MediaRecorder = originalMediaRecorder;
  }
}

describe("speech-recognition utilities", () => {
  describe("normalizeLanguageCode", () => {
    it("returns undefined for empty or undefined input", () => {
      expect(normalizeLanguageCode()).toBeUndefined();
      expect(normalizeLanguageCode("")).toBeUndefined();
      expect(normalizeLanguageCode("   ")).toBeUndefined();
    });

    it("normalizes locale strings to 2-letter codes", () => {
      expect(normalizeLanguageCode("en-US")).toBe("en");
      expect(normalizeLanguageCode("en_GB")).toBe("en");
      expect(normalizeLanguageCode("es-ES")).toBe("es");
      expect(normalizeLanguageCode("FR")).toBe("fr");
      expect(normalizeLanguageCode("de")).toBe("de");
    });
  });

  describe("isSpeechRecognitionSupported", () => {
    afterEach(() => {
      unstubAllGlobals();
    });

    it("returns false when window is undefined", () => {
      stubGlobal("window", undefined);
      expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it("returns true when getUserMedia and MediaRecorder are available", () => {
      stubGlobal("window", { permissionsPolicy: undefined });
      stubGlobal("navigator", {
        mediaDevices: { getUserMedia: () => Promise.resolve() },
      });
      stubGlobal("MediaRecorder", class {});
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it("returns false when MediaRecorder is missing", () => {
      stubGlobal("window", {});
      stubGlobal("navigator", {
        mediaDevices: { getUserMedia: () => Promise.resolve() },
      });
      stubGlobal("MediaRecorder", undefined);
      expect(isSpeechRecognitionSupported()).toBe(false);
    });
  });

  describe("getSupportedAudioMimeType", () => {
    afterEach(() => {
      unstubAllGlobals();
    });

    it("returns empty string when MediaRecorder is undefined", () => {
      stubGlobal("MediaRecorder", undefined);
      expect(getSupportedAudioMimeType()).toBe("");
    });

    it("returns the first supported mime type", () => {
      stubGlobal("MediaRecorder", {
        isTypeSupported: (type: string) => type.includes("webm"),
      });
      expect(getSupportedAudioMimeType()).toBe("audio/webm;codecs=opus");
    });
  });

  describe("encodeFloat32ToWav and encodeWAV", () => {
    it("encodes Float32Array to 16-bit mono PCM WAV format", async () => {
      const { encodeFloat32ToWav, encodeWAV } = await import("./speech-recognition.js");
      const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
      const wavBuffer = encodeFloat32ToWav(samples, 16000);

      expect(wavBuffer.byteLength).toBe(44 + samples.length * 2);
      const riff = Buffer.from(wavBuffer.slice(0, 4)).toString("ascii");
      const wave = Buffer.from(wavBuffer.slice(8, 12)).toString("ascii");
      const fmt = Buffer.from(wavBuffer.slice(12, 16)).toString("ascii");
      const data = Buffer.from(wavBuffer.slice(36, 40)).toString("ascii");

      expect(riff).toBe("RIFF");
      expect(wave).toBe("WAVE");
      expect(fmt).toBe("fmt ");
      expect(data).toBe("data");

      // Verify sample rate and format
      const view = new DataView(wavBuffer);
      expect(view.getUint16(20, true)).toBe(1); // PCM
      expect(view.getUint16(22, true)).toBe(1); // Mono
      expect(view.getUint32(24, true)).toBe(16000); // 16kHz
      expect(view.getUint16(34, true)).toBe(16); // 16-bit

      // Check alias
      const aliasBuffer = encodeWAV(samples, 16000);
      expect(aliasBuffer.byteLength).toBe(wavBuffer.byteLength);
    });

    it("respects maxSamples clamp", async () => {
      const { encodeFloat32ToWav } = await import("./speech-recognition.js");
      const samples = new Float32Array(100);
      const wavBuffer = encodeFloat32ToWav(samples, 16000, 20);

      expect(wavBuffer.byteLength).toBe(44 + 20 * 2);
      const view = new DataView(wavBuffer);
      expect(view.getUint32(40, true)).toBe(20 * 2);
    });
  });

  describe("concatFloat32Arrays", () => {
    it("concatenates multiple Float32Arrays", async () => {
      const { concatFloat32Arrays } = await import("./speech-recognition.js");
      const chunk1 = new Float32Array([1, 2]);
      const chunk2 = new Float32Array([3, 4, 5]);
      const result = concatFloat32Arrays([chunk1, chunk2]);

      expect(result.length).toBe(5);
      expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
    });

    it("clamps output to maxSamples", async () => {
      const { concatFloat32Arrays } = await import("./speech-recognition.js");
      const chunk1 = new Float32Array([1, 2, 3]);
      const chunk2 = new Float32Array([4, 5, 6]);
      const result = concatFloat32Arrays([chunk1, chunk2], 4);

      expect(result.length).toBe(4);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });
  });

  describe("downsampleFloat32", () => {
    it("returns same array if rates match", async () => {
      const { downsampleFloat32 } = await import("./speech-recognition.js");
      const input = new Float32Array([0.1, 0.2]);
      const output = downsampleFloat32(input, 16000, 16000);
      expect(output).toBe(input);
    });

    it("downsamples from 32000 to 16000", async () => {
      const { downsampleFloat32 } = await import("./speech-recognition.js");
      const input = new Float32Array([0, 0.5, 1, 0.5]);
      const output = downsampleFloat32(input, 32000, 16000);
      expect(output.length).toBe(2);
    });
  });

  describe("arrayBufferToBase64", () => {
    it("encodes buffer to base64 correctly", async () => {
      const { arrayBufferToBase64 } = await import("./speech-recognition.js");
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      expect(arrayBufferToBase64(buffer)).toBe("SGVsbG8=");
    });
  });

  describe("audioBufferToWav", () => {
    it("converts audio buffer to standard WAV format", async () => {
      const { audioBufferToWav } = await import("./speech-recognition.js");
      const fakeAudioBuffer = {
        sampleRate: 16000,
        numberOfChannels: 1,
        length: 160,
        duration: 0.01,
        getChannelData: () => new Float32Array(160),
      } as unknown as AudioBuffer;

      const wavBuffer = audioBufferToWav(fakeAudioBuffer);
      expect(wavBuffer.byteLength).toBe(44 + 160 * 2);

      const header = Buffer.from(wavBuffer.slice(0, 4));
      expect(header.toString("ascii")).toBe("RIFF");
      const wave = Buffer.from(wavBuffer.slice(8, 12));
      expect(wave.toString("ascii")).toBe("WAVE");
    });
  });
});
