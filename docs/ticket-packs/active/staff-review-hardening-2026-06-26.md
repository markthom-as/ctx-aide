---
id: pack.repo-context-staff-review-hardening-2026-06-26
status: active
title: Staff Review Hardening
milestones:
  - milestone.repo-context-staff-review-hardening
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
  completed_at: null
  final_validation: []
---

# Staff Review Hardening

## Outcome

Prepare repo-context for staff-engineering review and harsh public scrutiny by hardening command safety, validation truthfulness, and dogfood evidence.

## Scope

- Included: CLI guardrails, validation status semantics, tests, docs, tickets, and pack closeout.
- Excluded: paid infrastructure, hosted services, broad rewrites, new runtime dependencies, and target-repo migrations.

## Tickets

- `ticket.context.024`: done
- `ticket.context.025`: done
- `ticket.context.026`: ready

## Execution Plan

- Parallel groups: three logical audit lanes are listed, but implementation is sequential because the write sets overlap.
- Sequential dependencies: `ticket.context.025` depends on `ticket.context.024`; `ticket.context.026` depends on both prior tickets.
- Shared-file coordination: `tools/context/ctx.mjs` and `tools/context/ctx.test.mjs` must be read before each edit.
- Worktree strategy: use the current clean worktree; do not create paid infrastructure or deploy anything.
- Merge queue strategy: one commit per completed ticket.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` and avoid reverting unrelated changes.
- Requeue rules: if a ticket needs uncaptured architecture or security decisions, move it back to needs-hardening.

## Pack Validation

- Smoke tests: `node tools/context/ctx.mjs doctor --json`, `node tools/context/ctx.mjs pack status pack.repo-context-staff-review-hardening-2026-06-26 --json`, and targeted fixture tests.
- Screenshots: not applicable.
- Full regression checks: `make validate` and `make smoke`.

## Completion

- Completed tickets: `ticket.context.024`, `ticket.context.025`.
- Remaining tickets: `ticket.context.026`.
- Final validation: pending.
