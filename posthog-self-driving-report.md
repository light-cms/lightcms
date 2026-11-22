# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for LightCMS. Session Replay, Error Tracking, and Support were already enabled; the native responders, connected-tool responders, focused scout troop, one custom CMS scout, and two Replay Vision monitors are now set up.

Findings will begin appearing in the [Self-driving inbox](https://us.posthog.com/project/672435/inbox) within about 30 minutes as fresh recordings, events, and scheduled scout runs are processed.

## AI data processing

Approved.

## GitHub

Connected before this run. GitHub Issues was selected and its warehouse source was verified as healthy.

## Products enabled

| Product                 | Result          | Integration check                                                                                                                |
| ----------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Session Replay          | Already enabled | This is a web app. The `posthog.init` configuration does not disable session recording.                                          |
| Error Tracking          | Already enabled | This is a web app. Browser exception capture is enabled and server exception capture is configured.                              |
| Support (Conversations) | Already enabled | Its ticket responder is enabled. Tickets require an inbound Support channel (email, inbox, or Slack) to be connected in PostHog. |

## Signal sources

| Signal source                                 | Action                    | Notes                                                                                              |
| --------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| `health_checks` / `health_issue`              | Already enabled           | Setup-health findings can reach the inbox.                                                         |
| `error_tracking` / `issue_created`            | Already enabled           | Native Error Tracking coverage.                                                                    |
| `error_tracking` / `issue_reopened`           | Already enabled           | Native Error Tracking coverage.                                                                    |
| `error_tracking` / `issue_spiking`            | Already enabled           | Native Error Tracking coverage.                                                                    |
| `conversations` / `ticket`                    | Already enabled           | Receives Support tickets once an inbound channel is connected.                                     |
| `logs` / `alert_state_change`                 | Enabled in this setup     | LightCMS emits PostHog browser and server logs.                                                    |
| `signals_scout` / `cross_source_issue`        | On by default             | No opt-out source row exists, so scout reports are admitted to the inbox.                          |
| `endpoints` / both endpoint responders        | Skipped                   | Endpoint usage could not be verified because the current MCP connection lacks endpoint-read scope. |
| `session_replay` / `session_analysis_cluster` | Intentionally not created | Replay Vision monitors below are the supported route for session-replay findings.                  |

## Connected tools

| Tool                  | Result                                                              | Responder                                                           |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| GitHub Issues         | Verified already connected; the GitHub warehouse source is healthy. | `github` / `issue` was already enabled.                             |
| Google Search Console | Verified already connected; the warehouse source is healthy.        | `google_search_console` / `search_opportunity` was already enabled. |

## Scout troop

### Active product scouts

| Scout                 | Why it remains active                                                     |
| --------------------- | ------------------------------------------------------------------------- |
| General               | Cross-product connections and surfaces without a specialist.              |
| AI observability      | LightCMS captures AI activity and uses AI observability.                  |
| Logs                  | The application sends PostHog logs from browser and server code.          |
| Product analytics     | The project has active product-event instrumentation.                     |
| Web analytics         | The project captures pageviews and web-vital activity.                    |
| AI cache optimization | Existing custom check for avoidable AI prompt-cache spend.                |
| AI costly users       | Existing custom check for anomalous AI usage or cost.                     |
| AI daily digest       | Existing custom daily AI health summary.                                  |
| AI error patterns     | Existing custom check for new or growing AI failure modes.                |
| CMS publishing health | Created in this setup; watches the GitHub-backed content-publishing loop. |

### Operational scout

`inbox-validation` remains enabled. It runs follow-up checks for resolved inbox reports and sits outside the focused troop ceiling.

### Disabled built-in specialists

| Scout              | Reason                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Anomaly detection  | Kept the troop selective; turn on later if saved-insight anomaly monitoring becomes a priority.              |
| APM                | No active distributed-tracing evidence ranked it above the selected surfaces.                                |
| Billing            | Not a primary LightCMS product surface for this setup.                                                       |
| Conversations      | Support tickets reach the inbox through the native responder.                                                |
| CSP violations     | No CSP-reporting evidence was found.                                                                         |
| Customer analytics | No account/group analytics surface was confirmed.                                                            |
| Data pipelines     | Pipeline monitoring was not among the most active product surfaces.                                          |
| Data warehouse     | Warehouse monitoring was not among the most active product surfaces.                                         |
| Error tracking     | Covered by the native Error Tracking responder.                                                              |
| Experiments        | No active experiment was found.                                                                              |
| Feature flags      | Existing flags only support surveys and did not rank as a primary product surface.                           |
| Insight alerts     | No enabled insight alerts were found.                                                                        |
| MCP tool calls     | No meaningful MCP-tool-call activity was found.                                                              |
| Observability gaps | Kept the troop selective in favor of active product surfaces.                                                |
| PR follow-up       | Kept the troop selective; enable later if deployment-outcome monitoring is needed.                           |
| Replay Vision      | No prior self-driving Replay Vision fleet was retained; the monitors below provide recording-level coverage. |
| Revenue analytics  | No payment or revenue implementation was found.                                                              |
| Session replay     | Covered by the Replay Vision monitors below.                                                                 |
| Skills store       | Kept the troop focused on product behavior rather than skill hygiene.                                        |
| Surveys            | Surveys are active but have lower observed volume than the selected surfaces.                                |
| Tasks              | No meaningful task-run activity was found.                                                                   |
| Unused features    | Kept the troop selective in favor of the higher-value product surfaces.                                      |
| Web vitals         | Kept the troop selective; enable later if per-page performance monitoring becomes a priority.                |
| Workflows          | The existing workflow does not need a dedicated scout at this time.                                          |

The verified scout budget is **100 runs/day**; **25** had been used today and **75** remained when configured. The enabled-scout cap is **250**. One operational scout plus four existing custom scouts occupied five protected slots, leaving **245** project slots; the focused product troop is held to ten for signal quality rather than the platform cap.

> Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.

## Custom scouts

### Created: CMS publishing health

- **Surface:** LightCMS collection, entry, file, folder, repository, and branch publishing operations.
- **Discriminator:** A sustained publishing-activity drop while web use continues, with a second corroborating signal from traffic, Error Tracking, or GitHub connection health.
- **Why it is not duplicated:** The general scout is broad, Error Tracking owns exception findings, and Replay Vision owns recording-level UI defects. This scout specifically tests the domain publishing loop at aggregate level.

The candidate was approved and created as `signals-scout-cms-publishing-health`.

### Considered and ruled out

- **Error bursts:** Covered by the native Error Tracking responder.
- **Replay friction:** Covered by the two Replay Vision monitors.
- **AI reliability and cost:** Already covered by the retained AI observability scout and the four existing custom AI scouts.
- **Additional CMS scouts:** Not proposed because the focused troop reached its ten active product-scout ceiling after the approved publishing-health scout.

If this custom scout becomes noisy, set its `emit` setting to `false` in PostHog to make it a dry run without disabling the scheduled check.

## Replay Vision scanners

A Replay Vision scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed defects to the inbox. It is the only part of this setup that spends Replay Vision quota. Scanner findings arrive at half weight and need independent corroboration before Self-driving promotes them into a report.

| Scanner                                 | Result  | What it watches                                                                      | Query scope                                                                                                                                                | Sampling |                                    Estimated monthly spend |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------------------------------------------------------: |
| LightCMS CMS flow breakage monitor      | Created | Visible blocked or contradictory CMS publishing workflows.                           | Recordings that visited `/cms`; this is the completion flow for repository selection, branch selection, collections, entries, repository files, and saves. |     100% |                              30 observations / 150 credits |
| LightCMS rage-click frustration monitor | Created | Visible controls that fail or leave a person unable to continue after rage clicking. | Recordings containing `$rageclick`, without page scoping. The small residual overlap with the CMS-flow monitor is acceptable.                              |     100% | 26 observations / 130 credits from the pre-create estimate |

The organization has no enforced Replay Vision credit limit and was not exhausted. The two estimates are small relative to the 2,253 free monthly credits then available. An existing general session summarizer remains unchanged with `emits_signals: false`; it does not feed the Self-driving inbox.

## Follow-ups

- [ ] Connect or confirm an inbound Support channel (email, inbox, or Slack) in PostHog so Conversations tickets can arrive through the enabled responder.
- [ ] Reauthorize the MCP connection with `endpoint:read` if you want Endpoint responders considered on a future setup run.
- [ ] Rate early Replay Vision observations with thumbs up or down in each scanner to improve their prompts and results.
- [ ] Enable a disabled specialist later if its product surface becomes a priority, particularly Surveys, Web Vitals, Data Warehouse, or PR follow-up.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Scout runs draw from the daily project budget, then findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/672435/inbox); immediately actionable reports can start coding tasks.

This work is billed to the PostHog organization and governed by its Self-driving billing limit. Review the organization’s terms and limit at [PostHog billing](https://us.posthog.com/organization/billing).

## Files modified or created

- Created `posthog-self-driving-report.md`.

No application source files were modified.
