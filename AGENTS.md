### Be strict at code review and always follow the standard code quality guidelines

no sloppy ternary operators use of or operator and operator unnecessaryly
follow all the best practices in code. like all the best practices

[sveltekit](https://mcp.svelte.dev/mcp)
[sveltekit](https://svelte.dev/llms-full.txt)

<!-- [tiptap editor](https://raw.githubusercontent.com/ueberdosis/tiptap/refs/heads/main/skills/tiptap/SKILL.md)
<!-- [better-auth](https://mcp.better-auth.com/mcp)
<!-- [better-auth](https://better-auth.com/llms.txt)
<!-- [drizzle](https://orm.drizzle.team/llms-full.txt)
<!-- [probot](https://gitmcp.io/probot/probot)
<!-- [octokit](https://lobehub.com/skills/agentskillexchange-skills-octokit-javascript-github-sdk-rest-graphql-app-automation/skill.md)
<!-- [octokit](https://deepwiki.com/octokit/octokit.js)
<!-- [github-app](https://market.lobehub.com/s/skills/phrazzld-spellbook-github-app-scaffold)
<!-- [github-app](https://probot-probot.mintlify.app/mcp)

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at <https://viteplus.dev/guide/>.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

Don't look into version control history for code review. Only look into the current code and follow the best practices in code. Do not suggest any code that has been deleted.

Don't assume anything about the code. Always ask for clarification if you are not sure about the code. Do not make any assumptions.
