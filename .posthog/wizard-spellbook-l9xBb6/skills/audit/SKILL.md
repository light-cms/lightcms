---
name: audit
description: Audit an existing PostHog integration for correctness and best practices
metadata:
  author: PostHog
  version: 1.59.0
---

# PostHog Audit

This skill audits an existing PostHog integration for **data integrity** in event capture and identification, then folds in what PostHog has already flagged for the project server-side. **Read-only** — the only file you create is the final audit report.

Perform the checks described in the referenced skills and only the events referenced in the skills.

## Workflow

The audit runs as a step chain: Installation (SDK + version) → init correctness → identification → event capture → live data → report (which also uploads the report to a PostHog notebook). **The chain is defined by the step files themselves, not by any count written down here** — each one ends with a `next_step:` pointer, and the last has `next_step: null`. Follow them in the order they point. You must resolve them in order before any source-tree exploration.

The early steps read the project's source tree. The live-data step reads the project's PostHog data instead — the recommendations and health issues PostHog computed itself — because a source scan can't tell you whether stack frames actually resolve or whether a sync keeps failing. The report step renders both into one document.

The audit ledger arrives pre-seeded with a pending row per check: the source-tree checks, the `live-data-findings` sweep, and the workflow rows (`write-report`, and `upload-notebook`, which the report step resolves after mirroring the markdown into a PostHog notebook). Read the ledger to see what you were given rather than assuming a fixed set — the wizard seeds it, and the wizard and this skill release independently. Use `mcp__wizard-tools__audit_resolve_checks` to patch each one as you finish it.

**Start by reading the path relative to this file at `references/1-version.md`.** Do not Glob, ls, or find the skill directory. Do not preload future steps. Do not re-read a step file once you've moved past it. Do not re-read SKILL.md.

`ToolSearch` is only for loading a tool by exact name when the SDK has it deferred (e.g. `select:Grep`). Do **not** use it to browse for other tools — every tool the audit needs (`Glob`, `Grep`, `Read`, `Write`, `Bash`, and the named `mcp__wizard-tools__audit_*` tools) is already named in this skill. The live-data step additionally reaches PostHog through its single `exec` tool, described in that step.

**Do not call `TaskCreate` / `TaskUpdate` / `TaskGet` / `TaskList`.** The audit doesn't track its own task list — progress comes from the audit ledger plus `[STATUS]` lines.

## Live activity — `[STATUS]`

The "Working on …" banner reads from `[STATUS]` lines you emit in plain text. Whenever you start a new sub-step, write a line like:

```
[STATUS] Scanning manifests
```

The wizard intercepts these and updates the spinner. Use them freely — they are cheap. Each step file lists the exact `[STATUS]` strings to emit at each sub-step.

## Audit checks ledger

The ledger lives at `.posthog-audit-checks.json` and is rendered live in the "Audit plan" tab. It is owned by MCP tools — **never `Write` this file directly**:

- `mcp__wizard-tools__audit_resolve_checks({ updates })` — patch one or more checks by `id`. Each `update` is `{ id, status, file?, details? }`. Batch updates from the same step into a single call.
- `mcp__wizard-tools__audit_add_checks({ checks })` — append new pending rows. Only the live-data step uses this, for findings that don't exist until the run reads them from PostHog. Every other step resolves rows the wizard already seeded. Duplicate ids reject the whole batch, so prefix appended ids as that step instructs.

All audit ledger calls are atomic and serialize internally — **concurrent calls from parallel subagents cannot lose updates**, so feel free to fan out runtime checks across `Agent` subagents when a step says so.

### Check entry shape

- `id` — stable kebab-case slug. Reuse the existing seeded ids exactly when calling `audit_resolve_checks`.
- `area` — short group name. The current core workflow uses `Installation`, `Identification`, `Event Capture`, and `Live Data`.
- `label` — short human name.
- `status` — `pending` | `pass` | `error` | `warning` | `suggestion`.
- `file` — optional `path:line` for findings tied to a location.
- `details` — optional one-line explanation.

After the report is written, delete `.posthog-audit-checks.json`.

## Severity levels

- `error`: Must fix. Broken functionality, data corruption, or security issue.
- `warning`: Should fix. Pattern that causes subtle bugs or data-quality problems.
- `suggestion`: Nice to have. Best-practice improvement.

## Key principles

- **Read-only**: Do not edit project source files. The only file you create is the audit report.
- **Evidence-based**: Reference specific `file:line` for every non-pass finding.
- **Actionable**: Every finding states what to fix and how.

## Abort statuses

Report abort states with `[ABORT]` prefixed messages. The wizard catches these and terminates the run — do not halt yourself.

- No PostHog SDK found

## Framework guidelines

- A missing PostHog configuration must never break the app — read keys optionally (never a required setting), guard init and capture behind their presence, and keep build and boot working with no PostHog environment set — but never silently: in development or debug builds fail loudly, using the language's idiomatic error, with the message "<VAR> variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once <VAR> is configured" (substituting the actual variable name); production stays a no-op
