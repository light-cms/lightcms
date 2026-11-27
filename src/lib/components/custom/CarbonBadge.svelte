<script lang="ts">
import { onMount } from "svelte";
import { browser } from "$app/env";

interface Props {
	dark?: boolean;
}

let { dark = undefined }: Props = $props();

let isDark = $state<boolean>(false);

onMount(() => {
	let mediaQuery: MediaQueryList | null = null;

	function handleChange(event: MediaQueryListEvent): void {
		isDark = event.matches;
	}

	if (dark === undefined) {
		if (window.matchMedia) {
			mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			isDark = mediaQuery.matches;
			mediaQuery.addEventListener("change", handleChange);
		}
	} else {
		isDark = dark;
	}

	return () => {
		if (mediaQuery !== null) {
			mediaQuery.removeEventListener("change", handleChange);
		}
	};
});

let scriptLoaded = $state(false);

function loadBadgeScript(): void {
	if (!browser || scriptLoaded) return;

	const existingScript = document.querySelector(
		'script[src*="website-carbon-badges"]',
	);
	if (existingScript) {
		scriptLoaded = true;
		return;
	}

	const script = document.createElement("script");
	script.src =
		"https://cdn.jsdelivr.net/npm/website-carbon-badges@1.1.3/b.min.js";
	script.defer = true;
	script.onload = () => {
		scriptLoaded = true;
	};
	document.head.appendChild(script);
}

$effect(() => {
	loadBadgeScript();
});
</script>

<div id="wcb" class="carbonbadge" class:wcb-d={isDark}></div>
