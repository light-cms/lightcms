import { type AnalyticsProps, inject, pageview } from "@vercel/analytics";
import { page } from "$app/state";

/**
 * Same behaviour as `injectAnalytics` from `@vercel/analytics/sveltekit`, but
 * reads the route from `$app/state`. The packaged version subscribes to the
 * `page` store from `$app/stores`, which SvelteKit 3 removed: the subscribe call
 * throws `app_stores_removed` and breaks hydration of the root layout.
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
