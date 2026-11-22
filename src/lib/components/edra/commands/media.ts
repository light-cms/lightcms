import Audio from "@lucide/svelte/icons/audio-lines";
import IFrame from "@lucide/svelte/icons/code-xml";
import Image from "@lucide/svelte/icons/image";
import Video from "@lucide/svelte/icons/video";
import strings from "../strings.js";
import type { EdraCommand } from "./types.js";

export const mediaCommands: EdraCommand[] = [
  {
    icon: Image,
    name: "image-placeholder",
    tooltip: strings.command.imagePlaceholder,
    onClick: (editor) => {
      editor.chain().focus().insertMediaPlaceholder({ mediaType: "image" }).run();
    },
    isActive: (editor) => editor.isActive("mediaPlaceholder", { mediaType: "image" }),
  },
  {
    icon: Video,
    name: "video-placeholder",
    tooltip: strings.command.videoPlaceholder,
    onClick: (editor) => {
      editor.chain().focus().insertMediaPlaceholder({ mediaType: "video" }).run();
    },
    isActive: (editor) => editor.isActive("mediaPlaceholder", { mediaType: "video" }),
  },
  {
    icon: Audio,
    name: "audio-placeholder",
    tooltip: strings.command.audioPlaceholder,
    onClick: (editor) => {
      editor.chain().focus().insertMediaPlaceholder({ mediaType: "audio" }).run();
    },
    isActive: (editor) => editor.isActive("mediaPlaceholder", { mediaType: "audio" }),
  },
  {
    icon: IFrame,
    name: "iframe-placeholder",
    tooltip: strings.command.iframePlaceholder,
    onClick: (editor) => {
      editor.chain().focus().insertMediaPlaceholder({ mediaType: "iframe" }).run();
    },
    isActive: (editor) => editor.isActive("mediaPlaceholder", { mediaType: "iframe" }),
  },
];
