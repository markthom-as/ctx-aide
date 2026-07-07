---
id: pack.screenshot-review-ui-beta-settings-2026-07-07
status: done
title: Screenshot Review UI Beta Settings
milestones:
  - milestone.ctx-aide-feedback-review
source_specs: []
tickets:
  - ticket.context.053
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  cli-settings:
    tickets:
      - ticket.context.053
blocked_by: []
created: 2026-07-07
completion:
  completed_at: 2026-07-07
  final_validation:
    - make validate
---

# Screenshot Review UI Beta Settings

## Outcome

Keep screenshot review UI optional during setup and configurable through repo-local settings.

## Scope

- Included: beta settings defaults, adoption bootstrap opt-in, settings commands, review UI gate, docs, and tests.
- Excluded: full interactive setup UI and hosted settings surfaces.

## Tickets

- `ticket.context.053`: Gate screenshot review UI behind beta settings.

## Execution Plan

- Add repo-local settings defaults and commands.
- Seed the settings file during adoption bootstrap.
- Gate `ctx-aide feedback review-ui` unless the beta feature is enabled.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect target git status before staging.
- Requeue rules: stop if beta settings would require paid infrastructure or global machine state.

## Pack Validation

- `node --check tools/ctx-aide/ctx-aide.mjs`
- `node --check tools/ctx-aide/screenshot-review-ui.mjs`
- `node tools/ctx-aide/ctx-aide.test.mjs`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`

## Completion

- Completed tickets: `ticket.context.053`.
- Remaining tickets: none.
- Final validation: `make validate`.
