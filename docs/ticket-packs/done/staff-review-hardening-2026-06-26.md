---
id: pack.ctx-aide-staff-review-hardening-2026-06-26
status: done
title: Staff Review Hardening
milestones:
  - milestone.ctx-aide-staff-review-hardening
source_specs:
  - spec.staff-review-hardening-2026-06-26
tickets:
  - ticket.context.024
  - ticket.context.025
  - ticket.context.026
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  cli-safety:
    tickets:
      - ticket.context.024
  validation-truth:
    tickets:
      - ticket.context.025
  dogfood-closeout:
    tickets:
      - ticket.context.026
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - make smoke
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-staff-review-hardening-2026-06-26 --json
---

# Staff Review Hardening

## Outcome

Prepare ctx-aide for staff-engineering review and harsh public scrutiny by hardening command safety, validation truthfulness, and dogfood evidence.

## Scope

- Included: CLI guardrails, validation status semantics, tests, docs, tickets, and pack closeout.
- Excluded: paid infrastructure, hosted services, broad rewrites, new runtime dependencies, and target-repo migrations.

## Tickets

- `ticket.context.024`: done
- `ticket.context.025`: done
- `ticket.context.026`: done

## Execution Plan

- Parallel groups: three logical audit lanes are listed, but implementation is sequential because the write sets overlap.
- Sequential dependencies: `ticket.context.025` depends on `ticket.context.024`; `ticket.context.026` depends on both prior tickets.
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs` and `tools/ctx-aide/ctx-aide.test.mjs` must be read before each edit.
- Worktree strategy: use the current clean worktree; do not create paid infrastructure or deploy anything.
- Merge queue strategy: one commit per completed ticket.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` and avoid reverting unrelated changes.
- Requeue rules: if a ticket needs uncaptured architecture or security decisions, move it back to needs-hardening.

## Pack Validation

- Smoke tests: `node tools/ctx-aide/ctx-aide.mjs doctor --json`, `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-staff-review-hardening-2026-06-26 --json`, and targeted fixture tests.
- Screenshots: not applicable.
- Full regression checks: `make validate` and `make smoke`.

## Completion

- Completed tickets: `ticket.context.024`, `ticket.context.025`, `ticket.context.026`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `make smoke`
  - `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-staff-review-hardening-2026-06-26 --json`
