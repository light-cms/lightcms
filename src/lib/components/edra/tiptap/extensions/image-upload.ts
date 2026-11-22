import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface ImageUploadOptions {
  onUpload?: (file: File) => Promise<string>;
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: "imageUpload",

  addOptions() {
    return { onUpload: undefined };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const onUpload = this.options.onUpload;
    if (!onUpload) return [];

    const handleFiles = (files: File[]) => {
      const mediaFiles = files.filter(
        (file) =>
          file.type.startsWith("image/") ||
          file.type.startsWith("video/") ||
          file.type.startsWith("audio/"),
      );
      if (mediaFiles.length === 0) return false;

      for (const file of mediaFiles) {
        void onUpload(file)
          .then((src) => {
            if (file.type.startsWith("video/")) {
              editor.commands.setVideo({ src });
            } else if (file.type.startsWith("audio/")) {
              editor.commands.setAudio({ src });
            } else {
              editor.commands.setImage({ src });
            }
          })
          .catch((error) => {
            console.error("Failed to upload media:", error);
          });
      }
      return true;
    };

    return [
      new Plugin({
        key: new PluginKey("imageUpload"),
        props: {
          handlePaste(_view, event) {
            const files = Array.from(event.clipboardData?.files ?? []);
            if (files.length === 0) return false;
            const handled = handleFiles(files);
            if (handled) event.preventDefault();
            return handled;
          },
          handleDrop(_view, event, _slice, moved) {
            if (moved) return false;
            const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
            if (files.length === 0) return false;
            const handled = handleFiles(files);
            if (handled) event.preventDefault();
            return handled;
          },
        },
      }),
    ];
  },
});
