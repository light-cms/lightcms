import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	getAudioExtension,
	getWitAiToken,
	isWitAiConfigured,
	normalizeLanguageCode,
	parseWitAiResponse,
	transcribeAudioWithWitAi,
} from "./wit-ai";

describe("Wit.ai server module", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	describe("isWitAiConfigured", () => {
		it("returns false when WIT_AI_TOKEN is not set", () => {
			delete process.env.WIT_AI_TOKEN;
			delete process.env.WIT_AI_API_KEY;
			delete process.env.WIT_TOKEN;
			delete process.env.WIT_ACCESS_TOKEN;
			expect(isWitAiConfigured()).toBe(false);
		});

		it("returns false when WIT_AI_TOKEN is empty whitespace", () => {
			process.env.WIT_AI_TOKEN = "   ";
			expect(isWitAiConfigured()).toBe(false);
		});

		it("returns true when WIT_AI_TOKEN is set", () => {
			process.env.WIT_AI_TOKEN = "test-token";
			expect(isWitAiConfigured()).toBe(true);
		});
	});

	describe("getWitAiToken", () => {
		it("returns undefined when no token is set", () => {
			delete process.env.WIT_AI_TOKEN;
			delete process.env.WIT_AI_API_KEY;
			delete process.env.WIT_TOKEN;
			delete process.env.WIT_ACCESS_TOKEN;
			expect(getWitAiToken()).toBeUndefined();
		});

		it("returns the token when WIT_AI_TOKEN is set", () => {
			process.env.WIT_AI_TOKEN = "test-token";
			expect(getWitAiToken()).toBe("test-token");
		});
	});

	describe("getAudioExtension", () => {
		it("returns wav by default when contentType is undefined", () => {
			expect(getAudioExtension()).toBe("wav");
		});

		it("returns wav for audio/wav", () => {
			expect(getAudioExtension("audio/wav")).toBe("wav");
		});

		it("returns ogg for audio/ogg with codecs", () => {
			expect(getAudioExtension("audio/ogg;codecs=opus")).toBe("ogg");
		});

		it("returns mp3 for audio/mpeg", () => {
			expect(getAudioExtension("audio/mpeg")).toBe("mp3");
		});

		it("returns m4a for audio/mp4", () => {
			expect(getAudioExtension("audio/mp4")).toBe("m4a");
		});

		it("returns webm for audio/webm with codecs", () => {
			expect(getAudioExtension("audio/webm;codecs=opus")).toBe("webm");
		});
	});

	describe("normalizeLanguageCode", () => {
		it("returns undefined when lang is undefined or empty", () => {
			expect(normalizeLanguageCode(undefined)).toBeUndefined();
			expect(normalizeLanguageCode("")).toBeUndefined();
			expect(normalizeLanguageCode("   ")).toBeUndefined();
		});

		it("normalizes locale to 2-letter language code", () => {
			expect(normalizeLanguageCode("en-US")).toBe("en");
			expect(normalizeLanguageCode("fr_FR")).toBe("fr");
			expect(normalizeLanguageCode("ES")).toBe("es");
			expect(normalizeLanguageCode("de-DE")).toBe("de");
		});
	});

	describe("parseWitAiResponse", () => {
		it("returns empty string for empty input", () => {
			expect(parseWitAiResponse("")).toBe("");
			expect(parseWitAiResponse("   ")).toBe("");
		});

		it("parses single JSON object with text", () => {
			const response = JSON.stringify({
				text: "Hello world from single object",
			});
			expect(parseWitAiResponse(response)).toBe(
				"Hello world from single object",
			);
		});

		it("parses newline-delimited streaming dictation response and extracts FINAL_TRANSCRIPTION", () => {
			const response = [
				JSON.stringify({ type: "PARTIAL_TRANSCRIPTION", text: "Hello" }),
				JSON.stringify({
					type: "FINAL_TRANSCRIPTION",
					text: "Hello world final",
				}),
			].join("\n");
			expect(parseWitAiResponse(response)).toBe("Hello world final");
		});

		it("parses concatenated JSON chunks without newlines", () => {
			const response =
				'{"type":"PARTIAL_TRANSCRIPTION","text":"Hello"}{"type":"FINAL_TRANSCRIPTION","text":"Hello concatenated"}';
			expect(parseWitAiResponse(response)).toBe("Hello concatenated");
		});

		it("returns empty string when no text field exists in response", () => {
			const response = JSON.stringify({ error: "Something went wrong" });
			expect(parseWitAiResponse(response)).toBe("");
		});
	});

	describe("transcribeAudioWithWitAi", () => {
		it("throws when WIT_AI_TOKEN is missing", async () => {
			delete process.env.WIT_AI_TOKEN;
			delete process.env.WIT_AI_API_KEY;
			delete process.env.WIT_TOKEN;
			delete process.env.WIT_ACCESS_TOKEN;

			await expect(
				transcribeAudioWithWitAi(new Uint8Array([1, 2, 3])),
			).rejects.toThrow("WIT_AI_TOKEN is not configured");
		});

		it("returns empty text for empty buffer", async () => {
			process.env.WIT_AI_TOKEN = "test-token";
			const result = await transcribeAudioWithWitAi(new Uint8Array([]));
			expect(result).toEqual({ text: "", isFinal: true });
		});

		it("successfully sends audio to Wit.ai and returns transcription", async () => {
			process.env.WIT_AI_TOKEN = "test-token";

			const mockResponse = JSON.stringify({
				type: "FINAL_TRANSCRIPTION",
				text: "Transcribed speech text",
			});

			const fetchMock = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => mockResponse,
			});
			globalThis.fetch = fetchMock;

			// Fake WAV bytes
			const wavHeader = Buffer.from("RIFF....WAVEfmt ", "ascii");
			const result = await transcribeAudioWithWitAi(wavHeader, {
				contentType: "audio/wav",
			});

			expect(result).toEqual({
				text: "Transcribed speech text",
				isFinal: true,
			});
			expect(fetchMock).toHaveBeenCalledTimes(1);
			const call = fetchMock.mock.calls[0];
			expect(call?.[0]).toContain("https://api.wit.ai/dictation");
			expect(call?.[1]?.headers?.Authorization).toBe("Bearer test-token");
			expect(call?.[1]?.headers?.["Content-Type"]).toBe("audio/wav");
		});

		it("throws clear error when Wit.ai returns non-200", async () => {
			process.env.WIT_AI_TOKEN = "test-token";

			const fetchMock = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				text: async () => JSON.stringify({ error: "Bad auth token" }),
			});
			globalThis.fetch = fetchMock;

			const wavHeader = Buffer.from("RIFF....WAVEfmt ", "ascii");
			await expect(
				transcribeAudioWithWitAi(wavHeader, { contentType: "audio/wav" }),
			).rejects.toThrow("Wit.ai error: Bad auth token");
		});
	});
});
