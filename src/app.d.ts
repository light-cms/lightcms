import type { Session, User } from "better-auth";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="vite/client" />
declare global {
  interface Window {
    Supademo?: {
      open: (id: string) => void;
    };
  }

  namespace App {
    interface Locals {
      user?: User;
      session?: Session;
    }

    interface Error {}
    interface PageData {}
    interface PageState {}
    interface Platform {}
  }
}
