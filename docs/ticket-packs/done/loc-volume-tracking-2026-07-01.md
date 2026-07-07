---
id: pack.2026-07-loc-volume-tracking
status: done
title: LOC Volume Tracking
milestones:
  - milestone.ctx-aide-cli-hardening
source_specs: []
tickets:
  - ticket.2026-07-01.loc-volume-tracking
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: single-ticket-commit
  worktree_required: false
parallel_groups:
  default:
    tickets:
      - ticket.2026-07-01.loc-volume-tracking
blocked_by: []
created: 2026-07-01
completion:
  completed_at: 2026-07-01
  final_validation:
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs loc check --json
    - make validate
---

# LOC Volume Tracking

## Outcome

CTX Aide can measure and enforce path-scoped LOC volume targets through the local `ctx-aide` command surface.

## Scope

- Included: LOC measurement, configured targets, inline target checks, validation wiring, and documentation.
- Excluded: Hosted dashboards, paid infrastructure, and historical trend storage beyond command output.

## Tickets

- `ticket.2026-07-01.loc-volume-tracking`: done

## Execution Plan

- Parallel groups: one CLI-and-docs ticket.
- Sequential dependencies: none.
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `Makefile`, and docs.
- Worktree strategy: main checkout is sufficient.
- Merge queue strategy: one clean commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable for the single local slice.
- Requeue rules: rerun validation before commit if files change.

## Pack Validation

- Smoke tests: `ctx-aide loc --json` and `ctx-aide loc check --json`.
- Screenshots: not applicable.
- Full regression checks: `make validate`.

## Completion

- Completed tickets: `ticket.2026-07-01.loc-volume-tracking`.
- Remaining tickets: none.
- Final validation: `make validate` passed on 2026-07-01.
