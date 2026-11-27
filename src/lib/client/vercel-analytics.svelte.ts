import { type AnalyticsProps, inject, pageview } from "@vercel/analytics";
import { page } from "$app/state";

/**
 * Same behaviour as `injectAnalytics` from `@vercel/analytics/sveltekit`, but
 * reads the route from `$app/state` so it does not subscribe to a store that
 * SvelteKit 3 removed (which threw `app_stores_removed` and broke hydration).
 *
 * Call it during component initialisation.
 */
export function injectAnalytics(props: AnalyticsProps = {}): void {
	inject(
		{
			...props,
			basePath: import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH,
			disableAutoTrack: true,
			framework: "sveltekit",
		},
		import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG,
	);

	$effect(() => {
		const route = page.route.id;
		if (route) {
			pageview({ route, path: page.url.pathname });
		}
	});
}
