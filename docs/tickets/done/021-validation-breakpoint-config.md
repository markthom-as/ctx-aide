---
id: ticket.context.021
status: done
title: Add validation breakpoint config
ticket_pack: pack.ctx-aide-validation-breakpoint-config
milestones:
  - milestone.ctx-aide-docs-maintenance
source_spec: spec.ctx-aide-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on:
  - ticket.context.019
blocks: []
scope:
  routes: []
  files:
    - README.md
    - docs/config/ctx-aide.validation.json
    - docs/future-work/captured/2026-06-26-smart-tui-validation-config.md
    - docs/workflows/browser-validation.md
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - docs/config
    - docs/future-work
    - docs/workflows
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Add validation breakpoint config"
  generated_at: 2026-06-26
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
    - Run `make validate`.
    - Run `node tools/ctx-aide/ctx-aide.test.mjs`.
  smoke:
    - Run `ctx-aide workflow validation-plan` with built-in/default config.
    - Run `ctx-aide workflow validation-plan` with config-file breakpoint overrides.
  screenshots: []
completion:
  commit: validation-breakpoint-config-change
  completed_at: 2026-06-26
---

# Add Validation Breakpoint Config

## Outcome

Make browser validation generate a configurable view-by-breakpoint matrix with sensible defaults.

## Context

Browser validation should not be a single viewport smoke. It needs a standard set of breakpoints and a way for target repos to override those breakpoints through config. The eventual smart TUI should edit that same config file rather than inventing a second source of truth.

## Positive Rules

- Preserve JSON-first command output.
- Use sensible defaults when no config file exists.
- Let target repos override views and breakpoints through `docs/config/ctx-aide.validation.json`.
- Capture the smart TUI as future work until its interaction contract is hardened.

## Negative Rules

- Do not require config for baseline browser validation planning.
- Do not hard-code only one viewport.
- Do not make the future TUI the canonical source of truth.
- Stop and escalate if a breakpoint config is malformed instead of silently dropping it.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate in generated context.

## Frozen Decisions

- Default breakpoints are `mobile`, `tablet`, `desktop`, and `wide`.
- `ctx-aide workflow validation-plan` returns a matrix of workflow views crossed with breakpoints.
- Config file path is `docs/config/ctx-aide.validation.json` by default and can be overridden with `--config`.
- Config breakpoints can be preset ids or custom `{ "id", "width", "height" }` objects.
- The smart TUI is future work and must write the same config file.

## Implementation Rules

- Required approach: extend the existing dependency-free Node CLI.
- Existing components/helpers to use: workflow parsing, credential readiness helper, and fixture tests.
- Anti-patterns to avoid: hidden config mutation, interactive prompts, and unvalidated viewport objects.
- Stop and escalate if: config needs schema complexity beyond the current JSON contract.

## Scope

- In:
  - `ctx-aide workflow validation-plan`.
  - Default breakpoint catalog.
  - Config-file override support.
  - Browser workflow breakpoint metadata.
  - README, tests, and future-work capture.
- Out:
  - Smart TUI implementation.
  - Playwright config generation.
  - Route-specific visual regression baselines.

## Acceptance Criteria

- A browser validation plan is available without a config file.
- A config file can override views and breakpoints.
- Invalid breakpoint config returns structured errors.
- The generated matrix includes view id, breakpoint id, viewport dimensions, auth requirement, and readiness.

## Validation

- Automated:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: validation-breakpoint-config-change
- Verification evidence:
  - `make smoke`
  - `BROWSER_TEST_EMAIL=agent@example.test BROWSER_TEST_PASSWORD=secret node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Follow-up tickets:
  - Promote `future.2026-06-26.smart-tui-validation-config` when ready to design the smart TUI.
