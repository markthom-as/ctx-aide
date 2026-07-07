---
id: pack.screenshot-feedback-review-ui-2026-07-07
status: done
title: Screenshot Feedback Review UI
milestones:
  - milestone.repo-context-feedback-review
source_specs: []
tickets:
  - ticket.context.052
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  cli-ui:
    tickets:
      - ticket.context.052
blocked_by: []
created: 2026-07-07
completion:
  completed_at: 2026-07-07
  final_validation:
    - make validate
---

# Screenshot Feedback Review UI

## Outcome

Add a local screenshot feedback review UI that turns reviewed screenshot notes into canonical repo-context tickets.

## Scope

- Included: `ctx feedback review-ui`, feedback autosave, draft preview, confirmed ticket writing, tests, and workflow docs.
- Excluded: hosted review infrastructure, screenshot capture execution, and implementation of generated tickets.

## Tickets

- `ticket.context.052`: Add screenshot feedback review UI.

## Execution Plan

- Add the local UI server and command entrypoint.
- Reuse repo-context ticket structure for confirmed generated tickets.
- Validate with focused tests and repo ticket/pack checks.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect git status before staging.
- Requeue rules: stop if implementation needs hosted infrastructure or external screenshot storage.

## Pack Validation

- `node --check tools/context/ctx.mjs`
- `node --check tools/context/screenshot-review-ui.mjs`
- `node tools/context/ctx.test.mjs`
- `node tools/context/ctx.mjs ticket check --json`
- `node tools/context/ctx.mjs pack check --json`

## Completion

- Completed tickets: `ticket.context.052`.
- Remaining tickets: none.
- Final validation: `make validate`.
