<script lang="ts">
import GitBranch from "@lucide/svelte/icons/git-branch";
import Heart from "@lucide/svelte/icons/heart";
import Mail from "@lucide/svelte/icons/mail";
import MessageCircle from "@lucide/svelte/icons/message-circle";
import ShieldCheck from "@lucide/svelte/icons/shield-check";
import { Button } from "$lib/components/ui/button";
import { localizeHref } from "$lib/i18n";
import * as m from "$lib/i18n/messages";
import { SITE } from "$lib/seo";

type FooterAction = {
	href: string;
	label: () => string;
	icon: typeof GitBranch;
	external: boolean;
};

const footerActions: FooterAction[] = [
	{
		href: SITE.repository,
		label: m.about_action_github,
		icon: GitBranch,
		external: true,
	},
	{
		href: SITE.sponsorUrl,
		label: m.about_action_sponsor,
		icon: Heart,
		external: true,
	},
	{
		href: SITE.contactFormUrl,
		label: m.about_action_contact,
		icon: MessageCircle,
		external: true,
	},
	{
		href: `mailto:${SITE.contactEmail}`,
		label: m.about_action_email,
		icon: Mail,
		external: false,
	},
	{
		href: "/privacy",
		label: m.about_action_privacy,
		icon: ShieldCheck,
		external: false,
	},
];
</script>

<section class="mx-auto max-w-3xl px-4 py-8 sm:py-12" aria-labelledby="about-title">
  <p class="eyebrow font-semibold text-primary">{m.about_eyebrow()}</p>

  <article
    class="mt-6 space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground leading-7 shadow-xs sm:p-8"
  >
    <header class="space-y-2">
      <h1 id="about-title" class="text-2xl font-bold tracking-tight sm:text-3xl">
        {m.about_title()}
      </h1>
      <h2 class="text-base font-medium text-muted-foreground sm:text-lg">
        {m.about_subtitle()}
      </h2>
    </header>

    <p>{m.about_p1()}</p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_why_title()}</h2>

    <p>{m.about_why_p1()}</p>

    <p>{m.about_why_p2()}</p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_ssg_title()}</h2>

    <p>{m.about_ssg_p1()}</p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_jamstack_title()}</h2>

    <p>
      {m.about_jamstack_p1()}{" "}
      <a href={localizeHref("/docs/building-a-greener-web")} class="underline hover:text-foreground">
        {m.about_jamstack_link()}
      </a>.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_version_title()}</h2>

    <p>{m.about_version_p1()}</p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_opensource_title()}</h2>

    <p>
      {m.about_opensource_p1()}{" "}
      <a href={localizeHref("/docs/self-hosting-lightcms")} class="underline hover:text-foreground">
        {m.about_opensource_guide_link()}
      </a>{" "}
      {m.about_opensource_p2()}
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{m.about_touch_title()}</h2>

    <ul class="list-disc space-y-2 pl-5">
      <li>Source code: <a href="https://github.com/light-cms/lightcms" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">github.com/light-cms/lightcms</a></li>
      <li>Contact form: <a href="https://app.youform.com/forms/smwrhikc" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">send us a message</a></li>
      <li>Email: <a href="mailto:hello@lightcms.me" class="underline hover:text-foreground">hello@lightcms.me</a></li>
      <li>Support the project: <a href="https://upi.pratyay.online/" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">upi.pratyay.online</a></li>
      <li><a href="/privacy" class="underline hover:text-foreground">{m.about_action_privacy()}</a></li>
    </ul>

    <footer class="space-y-4 border-t border-border pt-6">
      <nav class="flex flex-wrap gap-3" aria-label="About page links">
        {#each footerActions as action (action.href)}
          <Button
            href={action.href}
            variant="outline"
            class="gap-2"
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
          >
            <action.icon size={15} />
            {action.label()}
          </Button>
        {/each}
      </nav>

      <p class="text-xs text-muted-foreground">
        Source code:
        <a
          href={SITE.repository}
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-foreground"
        >
          {SITE.repository.replace("https://", "")}
        </a>
      </p>
    </footer>
  </article>
</section>
