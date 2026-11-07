export interface WitAiTranscriptionResult {
  text: string;
  isFinal: boolean;
}

export interface TranscribeAudioOptions {
  contentType?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
}

const WIT_AI_API_VERSION = "20240304";
const WIT_AI_DICTATION_URL = `https://api.wit.ai/dictation?v=${WIT_AI_API_VERSION}`;

export function getWitAiToken(): string | undefined {
  const token = process.env.WIT_AI_TOKEN;

  if (!token) {
    return undefined;
  }

  const trimmed = token.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

export function isWitAiConfigured(): boolean {
  return getWitAiToken() !== undefined;
}

export function getAudioExtension(contentType?: string): string {
  if (!contentType) {
    return "wav";
  }
  const cleanType = contentType.split(";")[0]?.trim().toLowerCase();
  switch (cleanType) {
    case "audio/wav":
    case "audio/x-wav":
    case "audio/wave":
      return "wav";
    case "audio/ogg":
    case "application/ogg":
      return "ogg";
    case "audio/mpeg":
    case "audio/mpeg3":
    case "audio/mp3":
      return "mp3";
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
      return "m4a";
    case "audio/flac":
      return "flac";
    case "audio/webm":
      return "webm";
    default:
      return "wav";
  }
}

export function normalizeLanguageCode(lang?: string): string | undefined {
  if (!lang) {
    return undefined;
  }
  const trimmed = lang.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const parts = trimmed.split(/[-_]/);
  const primary = parts[0]?.toLowerCase();
  if (primary && primary.length >= 2 && primary.length <= 3) {
    return primary;
  }
  return undefined;
}

export function parseWitAiResponse(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return "";
  }
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedLines: Array<Record<string, unknown>> = [];
  for (const line of lines) {
    try {
      parsedLines.push(JSON.parse(line) as Record<string, unknown>);
    } catch {
      // Continue to next line or fallback scanner
    }
  }

  if (parsedLines.length > 0) {
    for (let i = parsedLines.length - 1; i >= 0; i -= 1) {
      const item = parsedLines[i];
      if (
        (item?.is_final === true || item?.type === "FINAL_TRANSCRIPTION") &&
        typeof item?.text === "string" &&
        item.text.trim().length > 0
      ) {
        return item.text.trim();
      }
    }

    for (let i = parsedLines.length - 1; i >= 0; i -= 1) {
      const item = parsedLines[i];
      if (typeof item?.text === "string" && item.text.trim().length > 0) {
        return item.text.trim();
      }
    }
  }

  // 2. Fallback to scanning balanced braces in case response was concatenated without newlines
  const parsedObjects: Array<Record<string, unknown>> = [];
  let depth = 0;
  let startIndex = -1;

  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (char === "{") {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && startIndex !== -1) {
        const chunk = trimmed.slice(startIndex, i + 1);
        try {
          parsedObjects.push(JSON.parse(chunk) as Record<string, unknown>);
        } catch {
          // Skip invalid chunk
        }
        startIndex = -1;
      }
    }
  }

  for (let i = parsedObjects.length - 1; i >= 0; i -= 1) {
    const item = parsedObjects[i];
    if (
      (item?.is_final === true || item?.type === "FINAL_TRANSCRIPTION") &&
      typeof item?.text === "string" &&
      item.text.trim().length > 0
    ) {
      return item.text.trim();
    }
  }

  for (let i = parsedObjects.length - 1; i >= 0; i -= 1) {
    const item = parsedObjects[i];
    if (item && typeof item.text === "string" && item.text.trim().length > 0) {
      return item.text.trim();
    }
  }

  return "";
}

export async function transcribeAudioWithWitAi(
  audioData: ArrayBuffer | Uint8Array | Buffer,
  options?: TranscribeAudioOptions,
): Promise<WitAiTranscriptionResult> {
  const token = getWitAiToken();
  if (!token) {
    throw new Error(
      "WIT_AI_TOKEN is not configured on the server. Please set WIT_AI_TOKEN in your environment.",
    );
  }

  let buffer: Buffer;
  if (Buffer.isBuffer(audioData)) {
    buffer = audioData;
  } else if (audioData instanceof Uint8Array) {
    buffer = Buffer.from(audioData.buffer, audioData.byteOffset, audioData.byteLength);
  } else {
    buffer = Buffer.from(audioData as ArrayBuffer);
  }

  if (buffer.length === 0) {
    return { text: "", isFinal: true };
  }
  const requestedContentType = options?.contentType?.split(";")[0]?.trim().toLowerCase();
  const uploadContentType =
    requestedContentType && requestedContentType.length > 0 ? requestedContentType : "audio/wav";

  const response = await fetch(WIT_AI_DICTATION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": uploadContentType,
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Wit.ai transcription failed with HTTP ${response.status}`;

    try {
      const errorJson = JSON.parse(errorBody) as Record<string, unknown>;
      if (typeof errorJson.error === "string") {
        errorMessage = `Wit.ai error: ${errorJson.error}`;
      } else if (typeof errorJson.message === "string") {
        errorMessage = `Wit.ai error: ${errorJson.message}`;
      }
    } catch {
      if (errorBody.trim().length > 0) {
        errorMessage = `Wit.ai error: ${errorBody.trim()}`;
      }
    }

    throw new Error(errorMessage);
  }

  const responseBody = await response.text();
  const text = parseWitAiResponse(responseBody);

  return { text, isFinal: true };
}
