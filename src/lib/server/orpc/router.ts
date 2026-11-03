import { createOpenAI } from "@ai-sdk/openai";
import { ORPCError, os, type } from "@orpc/server";
import { streamText } from "ai";
import { emitPostHogLog, flushAiObservability } from "$lib/server/ai-observability";
import {
  isSpeechTranscriptionConfigured,
  type SpeechProvider,
  transcribeAudio,
} from "$lib/server/transcription";
import { cmsRouter } from "./cms-router";
import { publicProcedure } from "./context";

const generateContent = publicProcedure
  .input(type<{ prompt: string }>())
  .handler(async ({ input, signal, context }) => {
    const prompt = input.prompt?.trim();
    if (!prompt) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Enter a prompt before generating content.",
      });
    }

    const apiKey = process.env.OPEN_AI_APIKEY!;
    const baseURL = process.env.OPEN_AI_ENDPOINT!;
    const modelName = process.env.OPEN_AI_MODEL!;

    const openai = createOpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });

    const result = streamText({
      model: openai(modelName),
      prompt,
      abortSignal: signal,
      runtimeContext: context.session
        ? {
            distinctId: context.session.userId,
            sessionId: context.session.id,
            traceName: "cms_editor_content_generation",
          }
        : undefined,
      telemetry: {
        functionId: "cms_editor_content_generation",
        includeRuntimeContext: {
          distinctId: true,
          sessionId: true,
          traceName: true,
        },
        recordInputs: true,
        recordOutputs: true,
      },
    });

    return (async function* () {
      let completed = false;
      emitPostHogLog("CMS AI content generation started", {
        log_event: "cms_ai_content_generation",
        outcome: "started",
      });

      try {
        for await (const chunk of result.textStream) yield chunk;
        completed = true;
      } finally {
        emitPostHogLog("CMS AI content generation finished", {
          log_event: "cms_ai_content_generation",
          outcome: completed ? "completed" : "interrupted",
        });
        await flushAiObservability();
      }
    })();
  });

const transcribeSpeech = os
  .input(
    type<{
      audio: string;
      contentType?: string;
      language?: string;
      prompt?: string;
      provider?: SpeechProvider;
      endpoint?: string;
      apiKey?: string;
      model?: string;
      temperature?: number;
    }>(),
  )
  .handler(async ({ input }) => {
    const { audio, contentType, language, prompt, provider, endpoint, apiKey, model, temperature } =
      input;
    if (!audio) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Audio data is required for transcription.",
      });
    }

    const binary = atob(audio);
    const audioBuffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      audioBuffer[i] = binary.charCodeAt(i);
    }
    if (audioBuffer.length === 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Audio data is empty.",
      });
    }

    try {
      const result = await transcribeAudio(audioBuffer, {
        contentType,
        language,
        prompt,
        provider,
        endpoint,
        apiKey,
        model,
        temperature,
      });
      return result;
    } catch (err) {
      console.error(err);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Audio transcription failed.",
      });
    }
  });

export const router = {
  ai: {
    generateContent,
  },
  speech: {
    transcribe: transcribeSpeech,
    isConfigured: os.handler(async () => {
      return isSpeechTranscriptionConfigured();
    }),
  },
  cms: cmsRouter,
};
