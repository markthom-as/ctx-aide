---
id: pack.ctx-aide-legacy-target-ticket-hydration
status: done
title: Legacy Target Ticket Hydration
milestones:
  - milestone.ctx-aide-daily-use
source_specs:
  - spec.ctx-aide-mvp
tickets:
  - ticket.context.022
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.022
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - node tools/ctx-aide/ctx-aide.test.mjs
    - make validate
---

# Legacy Target Ticket Hydration

## Outcome

Allow adoption implementation plans to hydrate useful context from existing target repo ticket formats.

## Scope

- Included:
  - `ticket_id` compatibility.
  - Markdown heading title inference.
  - `source_docs` target paths.
  - `## Verification` command extraction.
- Excluded:
  - Historical ticket migration.
  - Target repo schema enforcement.

## Tickets

- `ticket.context.022`: done

## Execution Plan

- Parallel groups: `cli-a`
- Sequential dependencies: `ticket.context.020`
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs` and `tools/ctx-aide/ctx-aide.test.mjs`.
- Worktree strategy: not required.
- Merge queue strategy: direct local commit.

## Run Policy

- Max parallel agents: 1
- Stale lease threshold: 20 minutes
- Dead-agent cleanup: not applicable.
- Requeue rules: rerun fixture tests if hydration output regresses.

## Pack Validation

- Smoke tests: legacy target ticket fixture.
- Screenshots: not required.
- Full regression checks: `make validate`.

## Completion

- Completed tickets:
  - `ticket.context.022`
- Remaining tickets:
  - None.
- Final validation:
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs doctor --json`
  - `make validate`
