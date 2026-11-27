import { Extension } from "@tiptap/core";
import type { Component } from "svelte";
import { SLASH_EXTENSION_NAME } from "./catalog";
import { createSlashPlugin } from "./plugin";
import { SlashPopup } from "./popup";

export default (menuList: Component<any, any, "">): Extension =>
  Extension.create({
    name: SLASH_EXTENSION_NAME,

    priority: 200,

    addStorage() {
      return { popup: null as SlashPopup | null };
    },

    onCreate() {
      this.storage.popup = new SlashPopup();
    },

    onDestroy() {
      this.storage.popup?.destroy();
      this.storage.popup = null;
    },

    addProseMirrorPlugins() {
      const storage = this.storage;

      return [
        createSlashPlugin({
          editor: this.editor,
          menu: menuList,
          getPopup: () => storage.popup,
        }),
      ];
    },
  });
