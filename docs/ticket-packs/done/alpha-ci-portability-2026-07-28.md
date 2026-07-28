---
id: pack.ctx-aide-alpha-ci-portability-2026-07-28
status: done
title: Alpha CI Portability
milestones:
  - milestone.ctx-aide-public-alpha
source_specs:
  - spec.public-release-2026-07-01
tickets:
  - ticket.context.089
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  ci:
    tickets:
      - ticket.context.089
blocked_by: []
created: 2026-07-28
completion:
  completed_at: 2026-07-28
  final_validation:
    - make validate
    - make smoke
    - public GitHub Actions release-gates job
---

# Alpha CI Portability

## Outcome

Remove the workstation-only validation dependency discovered by the first public CI runs.

## Scope

- Included: repository-owned skill validation and clean-clone CI proof.
- Excluded: feature work, registry releases, hosted services, and paid infrastructure.

## Tickets

- `ticket.context.089`: done

## Execution Plan

- Parallel groups: one CI portability ticket.
- Sequential dependencies: follows the public cutover and precedes immutable-source qualification.
- Shared-file coordination: only `Makefile` is implementation scope.
- Worktree strategy: current clean checkout.
- Merge queue strategy: one scoped completion commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect worktree state before staging.
- Requeue rules: reopen if the public clean-clone job remains red.

## Pack Validation

- Smoke tests: `make validate`, `make smoke`, and the public GitHub Actions release-gates job.
- Screenshots: none.
- Full regression checks: ticket, pack, and diff checks.

## Completion

- Completed tickets: `ticket.context.089`.
- Remaining tickets: none.
- Final validation: repository-owned checks pass locally; public CI verification follows the pushed commit.
