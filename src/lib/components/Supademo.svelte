<script>
import { onMount } from "svelte";

function openDemo() {
	if (window.Supademo) {
		window.Supademo.open("cmvvdyema01exqmwtg0adiw7p");
	}
}

onMount(() => {
	const script = document.createElement("script");
	script.src = "https://script.supademo.com/supademo.js";
	script.onload = () => {
		console.log("Supademo script loaded");
	};
	document.head.appendChild(script);
});
</script>
<button
  class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition-transform hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
  on:click={openDemo}
>
    Try the tour
</button>
