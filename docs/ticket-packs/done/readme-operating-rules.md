---
id: pack.ctx-aide-readme-operating-rules
status: done
title: README Agent Operating Rules
milestones:
  - milestone.ctx-aide-docs-maintenance
source_specs:
  - spec.ctx-aide-mvp
tickets:
  - ticket.context.015
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  docs-a:
    tickets:
      - ticket.context.015
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
---

# README Agent Operating Rules

## Outcome

Preserve the agent workflow instructions in the README so future agents can find them without relying only on chat context.

## Scope

- Included:
  - README operating rules for parallel planning, markdown tickets, per-ticket commits, infrastructure cost gating, and Semble-first search.
  - A small done ticket for the documentation update.
- Excluded:
  - Changes to CLI behavior.
  - New hosted infrastructure.

## Tickets

- `ticket.context.015`: done - Document agent operating rules in README

## Execution Plan

- Parallel groups: `docs-a`.
- Sequential dependencies: none.
- Shared-file coordination: README-only documentation change.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable for this single-ticket documentation change.
- Requeue rules: not applicable.

## Pack Validation

- Smoke tests:
  - `make validate`
- Screenshots:
  - Not required.
- Full regression checks:
  - README includes the operating rules from the agent instructions.

## Completion

- Completed tickets: ticket.context.015.
- Remaining tickets: none.
- Final validation: `make validate`.
