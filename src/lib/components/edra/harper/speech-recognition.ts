import { SPEECH_PROVIDERS, type SpeechProvider } from "$lib/speech-providers";

export type { SpeechProvider };
export { SPEECH_PROVIDERS };

export type SpeechTranscriptionResult = {
  text: string;
  provider?: SpeechProvider;
  model?: string;
  isFinal: boolean;
};

export type WitAiTranscriptionResult = SpeechTranscriptionResult;
export type TranscriptionResult = SpeechTranscriptionResult;

export type SpeechRecognitionError = {
  message: string;
};

export type SpeechRecognitionHandler = (text: string, isFinal: boolean) => void;
export type SpeechRecognitionInterimHandler = (text: string) => void;
export type SpeechRecognitionErrorHandler = (err: SpeechRecognitionError) => void;

export function isMicrophoneAllowed(): boolean {
  if (typeof document === "undefined") {
    return true;
  }
  const policy = (
    document as Document & { permissionsPolicy?: { allowsFeature: (f: string) => boolean } }
  ).permissionsPolicy;
  if (!policy) {
    return true;
  }
  return policy.allowsFeature("microphone");
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (!isMicrophoneAllowed()) {
    return false;
  }
  const hasMediaDevices =
    typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
  const hasAudioContext =
    typeof window.AudioContext !== "undefined" ||
    typeof (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext !==
      "undefined";
  const hasMediaRecorder = typeof MediaRecorder !== "undefined";
  return hasMediaDevices && (hasAudioContext || hasMediaRecorder);
}

export function encodeFloat32ToWav(
  float32Data: Float32Array,
  sampleRate = 16000,
  maxSamples?: number,
): ArrayBuffer {
  let len = float32Data.length;
  if (typeof maxSamples === "number" && maxSamples > 0 && maxSamples < len) {
    len = maxSamples;
  }

  const buf = new ArrayBuffer(44 + len * 2);
  const view = new DataView(buf);

  function writeAscii(offset: number, text: string) {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + len * 2, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono (1 channel)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sampleRate * 1 channel * 2 bytes/sample)
  view.setUint16(32, 2, true); // Block align (1 channel * 2 bytes/sample)
  view.setUint16(34, 16, true); // 16-bit
  writeAscii(36, "data");
  view.setUint32(40, len * 2, true);

  for (let i = 0; i < len; i += 1) {
    const raw = float32Data[i] ?? 0;
    const s = Math.max(-1, Math.min(1, raw));
    const intSample = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
    view.setInt16(44 + i * 2, intSample, true);
  }

  return buf;
}

export const encodeWAV = encodeFloat32ToWav;

export function concatFloat32Arrays(arrays: Float32Array[], maxSamples?: number): Float32Array {
  let totalLen = 0;
  for (const arr of arrays) {
    totalLen += arr.length;
  }
  if (typeof maxSamples === "number" && maxSamples > 0 && maxSamples < totalLen) {
    totalLen = maxSamples;
  }

  const result = new Float32Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    const toCopy = Math.min(arr.length, totalLen - offset);
    if (toCopy <= 0) {
      break;
    }
    result.set(arr.subarray(0, toCopy), offset);
    offset += toCopy;
  }
  return result;
}

export function downsampleFloat32(
  data: Float32Array,
  sourceRate: number,
  targetRate = 16000,
): Float32Array {
  if (sourceRate === targetRate || sourceRate <= 0 || targetRate <= 0) {
    return data;
  }
  const ratio = sourceRate / targetRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i += 1) {
    const originIndex = i * ratio;
    const lower = Math.floor(originIndex);
    const upper = Math.min(lower + 1, data.length - 1);
    const weight = originIndex - lower;
    const lowerSample = data[lower] ?? 0;
    const upperSample = data[upper] ?? 0;
    result[i] = lowerSample * (1 - weight) + upperSample * weight;
  }
  return result;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }
  const candidateTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
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

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1;
  const targetSampleRate = 16000;
  const inputChannelData = buffer.getChannelData(0);

  let samples: Float32Array;
  if (buffer.sampleRate === targetSampleRate) {
    samples = inputChannelData;
  } else {
    const ratio = buffer.sampleRate / targetSampleRate;
    const newLength = Math.round(inputChannelData.length / ratio);
    samples = new Float32Array(newLength);
    for (let i = 0; i < newLength; i += 1) {
      const originIndex = i * ratio;
      const lower = Math.floor(originIndex);
      const upper = Math.min(lower + 1, inputChannelData.length - 1);
      const weight = originIndex - lower;
      const lowerSample = inputChannelData[lower] ?? 0;
      const upperSample = inputChannelData[upper] ?? 0;
      samples[i] = lowerSample * (1 - weight) + upperSample * weight;
    }
  }

  const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(wavBuffer);

  function writeAscii(offset: number, text: string) {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true); // Mono
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, targetSampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeAscii(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
  }

  return wavBuffer;
}

export async function convertBlobToWav(
  blob: Blob,
): Promise<{ blob: Blob; mimeType: string } | null> {
  if (typeof window === "undefined") {
    return null;
  }
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  const ctx = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const wavArrayBuffer = audioBufferToWav(audioBuffer);
    return {
      blob: new Blob([wavArrayBuffer], { type: "audio/wav" }),
      mimeType: "audio/wav",
    };
  } catch {
    return null;
  } finally {
    try {
      void ctx.close();
    } catch {
      // Ignore cleanup error
    }
  }
}
