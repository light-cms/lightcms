<script lang="ts">
import GitBranch from "@lucide/svelte/icons/git-branch";
import Heart from "@lucide/svelte/icons/heart";
import Mail from "@lucide/svelte/icons/mail";
import MessageCircle from "@lucide/svelte/icons/message-circle";
import ShieldCheck from "@lucide/svelte/icons/shield-check";
import { Button } from "$lib/components/ui/button";
import { SITE } from "$lib/seo";

type FooterAction = {
	href: string;
	label: string;
	icon: typeof GitBranch;
	external: boolean;
};

const footerActions: FooterAction[] = [
	{
		href: SITE.repository,
		label: "Contribute on GitHub",
		icon: GitBranch,
		external: true,
	},
	{
		href: SITE.sponsorUrl,
		label: "Support financially",
		icon: Heart,
		external: true,
	},
	{
		href: SITE.contactFormUrl,
		label: "Contact form",
		icon: MessageCircle,
		external: true,
	},
	{
		href: `mailto:${SITE.contactEmail}`,
		label: "Email Us",
		icon: Mail,
		external: false,
	},
	{
		href: "/privacy",
		label: "Privacy policy",
		icon: ShieldCheck,
		external: false,
	},
];
</script>

<section class="mx-auto max-w-3xl px-4 py-8 sm:py-12" aria-labelledby="about-title">
  <p class="eyebrow font-semibold text-primary">About LightCMS</p>

  <article
    class="mt-6 space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground leading-7 shadow-xs sm:p-8"
  >
    <header class="space-y-2">
      <h1 id="about-title" class="text-2xl font-bold tracking-tight sm:text-3xl">
        A Git-based headless CMS that stays out of your way
      </h1>
      <h2 class="text-base font-medium text-muted-foreground sm:text-lg">
        Built with SvelteKit, TypeScript, and viteplus
      </h2>
    </header>

    <p>
      LightCMS is a Git-based content workspace for people who want to publish writing, not babysit infrastructure. It pairs a fast, distraction-free editor with storage you already own: every post is a Markdown file with frontmatter, committed to your own repository, reviewed like any other change, and deployed by the pipeline you already trust.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Why it exists</h2>

    <p>
      Most publishing tools ask you to trade ownership for convenience. Your words end up in someone else's database, behind someone else's login, exported — if you're lucky — through someone else's format. LightCMS takes the opposite position: the editor is the product, the content stays yours.
    </p>

    <p>
      The goal is to close the gap between people who have something worth sharing and the complexity that normally stands in the way. You shouldn't need to understand rebase flags, Markdown linters, frontmatter validators or GitHub token scopes to publish three paragraphs. And you shouldn't hand your archive to a platform to avoid learning them.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Works with the static site generator you already use</h2>

    <p>
      If your SSG reads frontmatter, LightCMS is a companion to it — Hugo, Astro, Zola, Jekyll, Eleventy, SvelteKit, and anything else in that family. Content is stored as plain Markdown files with a structured frontmatter schema, so nothing is smuggled in a proprietary format. Ready-made templates get you from empty repository to published site quickly, and you can hand any template to an LLM and reshape it.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Built the Jamstack way</h2>

    <p>
      Pages are prerendered and served from an edge CDN. There is no database answering a query per visitor and no application server idling between requests. That means faster pages for readers, nothing to patch for you, and a fraction of the energy a database-driven site burns. Read more in <a href="/docs/building-a-greener-web" class="underline hover:text-foreground">Static Sites and CO2: Building a Greener Web</a>.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Version history, not a revision guess</h2>

    <p>
      Every publish is a commit. You get a reviewable diff, an author, a timestamp, and a rollback that actually reverts. Collaborate through pull requests instead of shared passwords, and clone the repository at any time — there is no export step, because there is nothing to export it from.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Open source, and self-hostable</h2>

    <p>
      LightCMS is built with SvelteKit, TypeScript and Vite, released as open source. Run it hosted, or follow the <a href="/docs/self-hosting-lightcms" class="underline hover:text-foreground">self-hosting guide</a> to deploy your own instance with your own GitHub App, PostgreSQL database and optional AI endpoints.
    </p>

    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">Get in touch</h2>

    <ul class="list-disc space-y-2 pl-5">
      <li>Source code: <a href="https://github.com/light-cms/lightcms" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">github.com/light-cms/lightcms</a></li>
      <li>Contact form: <a href="https://app.youform.com/forms/smwrhikc" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">send us a message</a></li>
      <li>Email: <a href="mailto:hello@lightcms.me" class="underline hover:text-foreground">hello@lightcms.me</a></li>
      <li>Support the project: <a href="https://upi.pratyay.online/" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">upi.pratyay.online</a></li>
      <li><a href="/privacy" class="underline hover:text-foreground">Privacy policy</a></li>
    </ul>

    <footer class="space-y-4 border-t border-border pt-6">
      <nav class="flex flex-wrap gap-3" aria-label="About page links">
        {#each footerActions as action (action.label)}
          <Button
            href={action.href}
            variant="outline"
            class="gap-2"
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
          >
            <action.icon size={15} />
            {action.label}
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
