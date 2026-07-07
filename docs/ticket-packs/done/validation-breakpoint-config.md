---
id: pack.ctx-aide-validation-breakpoint-config
status: done
title: Validation Breakpoint Config
milestones:
  - milestone.ctx-aide-docs-maintenance
source_specs:
  - spec.ctx-aide-mvp
tickets:
  - ticket.context.021
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.021
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - node tools/ctx-aide/ctx-aide.test.mjs
---

# Validation Breakpoint Config

## Outcome

Add configurable browser validation breakpoints with defaults and a generated validation matrix.

## Scope

- Included:
  - `ctx-aide workflow validation-plan`.
  - Default breakpoint catalog.
  - `docs/config/ctx-aide.validation.json`.
  - Browser workflow breakpoint metadata.
  - Future-work capture for the smart TUI.
- Excluded:
  - Smart TUI implementation.
  - Playwright config generation.
  - Visual regression baseline storage.

## Tickets

- `ticket.context.021`: done - Add validation breakpoint config

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: `ticket.context.019`.
- Shared-file coordination: README, browser workflow docs, and `tools/ctx-aide/ctx-aide.mjs`.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable.
- Requeue rules: not applicable.

## Pack Validation

- Smoke tests:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture tests cover default breakpoints and config-file breakpoint overrides.

## Completion

- Completed tickets: ticket.context.021.
- Remaining tickets: none.
- Final validation:
  - `make smoke`
  - `BROWSER_TEST_EMAIL=agent@example.test BROWSER_TEST_PASSWORD=secret node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
