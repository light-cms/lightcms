import type { Component } from "svelte";
import { render } from "svelte/server";

export const mailTemplate = (component: Component<Record<string, unknown>>) => {
  return (props: Record<string, unknown>) => {
    return render(component, { props }).body;
  };
};
