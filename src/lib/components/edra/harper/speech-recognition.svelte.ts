import { createLightCmsClient } from "$lib/orpc-client";
import {
  arrayBufferToBase64,
  concatFloat32Arrays,
  convertBlobToWav,
  downsampleFloat32,
  encodeFloat32ToWav,
  getSupportedAudioMimeType,
  isSpeechRecognitionSupported,
  normalizeLanguageCode,
  SPEECH_PROVIDERS,
  type SpeechProvider,
  type SpeechRecognitionError,
} from "./speech-recognition.js";

export interface SpeechRecognitionOptions {
  lang?: string;
  token?: string;
  provider?: SpeechProvider;
  model?: string;
  maxDurationSeconds?: number;
  onTranscript: (text: string, isFinal: boolean, provider?: SpeechProvider) => void;
  onInterim?: (text: string) => void;
  onError?: (err: SpeechRecognitionError) => void;
}

export interface SpeechRecognitionInstance {
  readonly isListening: boolean;
  readonly isSpeaking: boolean;
  readonly isSupported: boolean;
  readonly isTranscribing: boolean;
  readonly interimTranscript: string;
  readonly provider: SpeechProvider;
  setProvider(provider: SpeechProvider): void;
  toggle(): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): void;
}

export function createSpeechRecognition(
  options: SpeechRecognitionOptions,
): SpeechRecognitionInstance {
  let isListening = $state(false);
  let isSpeaking = $state(false);
  let isTranscribing = $state(false);
  let isSupported = $state(isSpeechRecognitionSupported());
  let interimTranscript = $state("");
  let currentProvider = $state<SpeechProvider>(
    options.provider ?? SPEECH_PROVIDERS.openaiCompatible,
  );

  let audioStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let audioWorkletNode: AudioWorkletNode | null = null;
  let audioWorkletHandler: ((event: MessageEvent<Float32Array>) => void) | null = null;
  let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  let muteGainNode: GainNode | null = null;
  let audioBuffers: Float32Array[] = [];

  // MediaRecorder fallback state
  let mediaRecorder: MediaRecorder | null = null;
  let fallbackAudioChunks: Blob[] = [];

  const targetSampleRate = 16000;
  const maxDuration = options.maxDurationSeconds ?? 15;
  const maxSamples = targetSampleRate * maxDuration;

  function cleanupAudioNodes(): void {
    if (audioWorkletNode) {
      try {
        audioWorkletNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      if (audioWorkletHandler) {
        audioWorkletNode.port.removeEventListener("message", audioWorkletHandler);
        audioWorkletHandler = null;
      }
      audioWorkletNode = null;
    }

    if (muteGainNode) {
      try {
        muteGainNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      muteGainNode = null;
    }

    if (mediaStreamSource) {
      try {
        mediaStreamSource.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      mediaStreamSource = null;
    }

    if (audioContext) {
      try {
        void audioContext.close();
      } catch {
        // Ignore close errors
      }
      audioContext = null;
    }
  }

  function stopMediaStream(): void {
    if (audioStream) {
      for (const track of audioStream.getTracks()) {
        track.stop();
      }
      audioStream = null;
    }
  }

  async function transcribeWithDirectWitAi(wavBlob: Blob, token: string): Promise<void> {
    const url = "https://api.wit.ai/dictation?v=20240304";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
        Authorization: `Bearer ${token}`,
      },
      body: wavBlob,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Wit.ai dictation failed (${response.status}): ${errorText}`);
    }

    const responseText = await response.text();
    const lines = responseText
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let latestText = "";
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as {
          text?: string;
          is_final?: boolean;
        };
        if (typeof parsed.text === "string" && parsed.text.length > 0) {
          latestText = parsed.text;
          if (parsed.is_final) {
            options.onTranscript(parsed.text, true);
          } else {
            options.onInterim?.(parsed.text);
          }
        }
      } catch {
        // Skip unparseable lines
      }
    }

    if (latestText.length > 0) {
      options.onTranscript(latestText, true);
    }
  }

  async function transcribeWithOrpcBackend(wavBuffer: ArrayBuffer): Promise<void> {
    const base64Audio = arrayBufferToBase64(wavBuffer);
    if (base64Audio.length === 0) {
      return;
    }

    const client = createLightCmsClient();
    const result = await client.speech.transcribe({
      audio: base64Audio,
      contentType: "audio/wav",
      language: normalizeLanguageCode(options.lang),
      provider: currentProvider,
      model: options.model,
    });

    const cleanText = result.text.trim();
    if (cleanText.length > 0) {
      options.onTranscript(cleanText, true, result.provider);
    }
  }

  async function processAndSendAudio(wavBuffer: ArrayBuffer): Promise<void> {
    try {
      interimTranscript = "Transcribing…";
      options.onInterim?.(interimTranscript);

      const directToken = options.token?.trim();
      if (currentProvider === SPEECH_PROVIDERS.wit && directToken && directToken.length > 0) {
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        await transcribeWithDirectWitAi(wavBlob, directToken);
      } else {
        await transcribeWithOrpcBackend(wavBuffer);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to transcribe audio.";
      options.onError?.({ message });
    } finally {
      interimTranscript = "";
      isTranscribing = false;
    }
  }

  async function startListening(): Promise<void> {
    if (!isSupported) {
      options.onError?.({
        message: "Speech recognition is not supported in this browser.",
      });
      return;
    }

    if (isListening || isTranscribing) {
      return;
    }

    try {
      const mediaDevices = navigator.mediaDevices;
      const policy =
        typeof document !== "undefined"
          ? (
              document as Document & {
                permissionsPolicy?: { allowsFeature: (f: string) => boolean };
              }
            ).permissionsPolicy
          : undefined;
      if (policy && !policy.allowsFeature("microphone")) {
        throw new Error("Microphone is blocked by the site's permissions policy.");
      }
      if (typeof navigator === "undefined" || !mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser.");
      }

      audioStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        try {
          audioContext = new AudioContextClass({
            sampleRate: targetSampleRate,
          });
          mediaStreamSource = audioContext.createMediaStreamSource(audioStream);
          audioBuffers = [];

          const workletSource = `
            class AudioCaptureProcessor extends AudioWorkletProcessor {
              process(inputs) {
                const input = inputs[0]?.[0];
                if (input) {
                  this.port.postMessage(new Float32Array(input));
                }
                return true;
              }
            }
            registerProcessor("audio-capture-processor", AudioCaptureProcessor);
          `;
          const workletUrl = URL.createObjectURL(
            new Blob([workletSource], { type: "application/javascript" }),
          );
          try {
            await audioContext.audioWorklet.addModule(workletUrl);
          } finally {
            URL.revokeObjectURL(workletUrl);
          }
          audioWorkletNode = new AudioWorkletNode(audioContext, "audio-capture-processor", {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          });

          muteGainNode = audioContext.createGain();
          muteGainNode.gain.value = 0;

          mediaStreamSource.connect(audioWorkletNode);
          audioWorkletNode.connect(muteGainNode);
          muteGainNode.connect(audioContext.destination);

          audioWorkletHandler = (event: MessageEvent<Float32Array>) => {
            if (!isListening) {
              return;
            }

            const channelData = event.data;
            let sumSquares = 0;
            for (let i = 0; i < channelData.length; i += 1) {
              const s = channelData[i] ?? 0;
              sumSquares += s * s;
            }
            const rms = Math.sqrt(sumSquares / channelData.length);
            isSpeaking = rms > 0.015;

            const currentTotalLen = audioBuffers.reduce((acc, b) => acc + b.length, 0);
            if (currentTotalLen >= maxSamples) {
              void stopListening();
              return;
            }

            const toCopy = Math.min(channelData.length, maxSamples - currentTotalLen);
            if (toCopy > 0) {
              audioBuffers.push(new Float32Array(channelData.subarray(0, toCopy)));
            }
          };
          audioWorkletNode.port.addEventListener("message", audioWorkletHandler);

          isListening = true;
          return;
        } catch {
          // If AudioContext fails, continue to MediaRecorder fallback below
          cleanupAudioNodes();
        }
      }

      // Fallback: MediaRecorder
      fallbackAudioChunks = [];
      const supportedMime = getSupportedAudioMimeType();
      const recorderOptions: MediaRecorderOptions = {};
      if (supportedMime.length > 0) {
        recorderOptions.mimeType = supportedMime;
      }

      mediaRecorder = new MediaRecorder(audioStream, recorderOptions);
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          fallbackAudioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder?.mimeType ?? supportedMime ?? "audio/webm";
        const recordedBlob = new Blob(fallbackAudioChunks, { type: mimeType });
        fallbackAudioChunks = [];

        if (recordedBlob.size === 0) {
          isTranscribing = false;
          return;
        }

        const wavData = await convertBlobToWav(recordedBlob);
        if (wavData) {
          const wavBuffer = await wavData.blob.arrayBuffer();
          await processAndSendAudio(wavBuffer);
        } else {
          options.onError?.({
            message: "Unable to process recorded audio format.",
          });
          isTranscribing = false;
        }
      };

      mediaRecorder.start(250);
      isListening = true;
    } catch (err) {
      destroy();
      const message = err instanceof Error ? err.message : "Failed to access microphone.";
      options.onError?.({ message });
    }
  }

  async function stopListening(): Promise<void> {
    if (!isListening) {
      return;
    }

    isListening = false;
    isSpeaking = false;
    isTranscribing = true;

    if (audioWorkletNode && audioContext) {
      const recordedSampleRate = audioContext.sampleRate;
      cleanupAudioNodes();
      stopMediaStream();

      const combinedSamples = concatFloat32Arrays(audioBuffers, maxSamples);
      audioBuffers = [];

      if (combinedSamples.length === 0) {
        isTranscribing = false;
        return;
      }

      const pcm16k = downsampleFloat32(combinedSamples, recordedSampleRate, targetSampleRate);
      const wavBuffer = encodeFloat32ToWav(pcm16k, targetSampleRate, maxSamples);
      await processAndSendAudio(wavBuffer);
      return;
    }

    cleanupAudioNodes();

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    stopMediaStream();
  }

  function toggle(): void {
    if (!isSupported) {
      options.onError?.({
        message: "Speech recognition is not supported in this browser.",
      });
      return;
    }
    if (isTranscribing) {
      return;
    }
    if (isListening) {
      void stopListening();
    } else {
      void startListening();
    }
  }

  function destroy(): void {
    cleanupAudioNodes();
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      try {
        mediaRecorder.stop();
      } catch {
        // Ignore error on destroy
      }
    }
    mediaRecorder = null;
    stopMediaStream();
    audioBuffers = [];
    fallbackAudioChunks = [];
    isListening = false;
    isSpeaking = false;
    isTranscribing = false;
    interimTranscript = "";
  }

  return {
    get isListening() {
      return isListening;
    },
    get isSpeaking() {
      return isSpeaking;
    },
    get isSupported() {
      return isSupported;
    },
    get isTranscribing() {
      return isTranscribing;
    },
    get interimTranscript() {
      return interimTranscript;
    },
    get provider() {
      return currentProvider;
    },
    setProvider(provider: SpeechProvider) {
      currentProvider = provider;
    },
    toggle,
    start: startListening,
    stop: stopListening,
    destroy,
  };
}
