import type { Reroute } from "@sveltejs/kit";
import { deLocalizeUrl } from "$lib/i18n";

export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;
