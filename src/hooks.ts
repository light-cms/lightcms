import type { Reroute } from "@sveltejs/kit/hooks";
import { deLocalizeUrl } from "$lib/i18n";

export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;
