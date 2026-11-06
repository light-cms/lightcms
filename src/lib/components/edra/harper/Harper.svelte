<script lang="ts">
import { onMount } from "svelte";
import HarperPopover from "./HarperPopover.svelte";
import { primeHarper } from "./harper-client.ts";

onMount(() => {
	primeHarper();
});
</script>

<HarperPopover />
