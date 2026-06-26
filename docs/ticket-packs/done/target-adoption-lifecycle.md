---
id: pack.repo-context-target-adoption-lifecycle
status: done
title: Target Adoption Lifecycle
milestones:
  - milestone.repo-context-daily-use
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.020
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.020
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - make smoke
---

# Target Adoption Lifecycle

## Outcome

Add the missing target-repo lifecycle layer so repo-context can manage context capture, ticket creation, and implementation planning for daily use.

## Scope

- Included:
  - Target repo bootstrap.
  - Scoped target context creation.
  - Target ticket creation.
  - Explicit implementation-plan hydration.
  - Browser validation matrix planning.
- Excluded:
  - Historical ticket migrations.
  - Hosted services.
  - Automated multi-agent dispatch.

## Tickets

- `ticket.context.020`: done

## Execution Plan

- Parallel groups: `cli-a`
- Sequential dependencies: depends on existing audit, workflow dependency, and browser view management commands.
- Shared-file coordination: `tools/context/ctx.mjs` and `tools/context/ctx.test.mjs` only.
- Worktree strategy: not required.
- Merge queue strategy: direct local commit after validation.

## Run Policy

- Max parallel agents: 2
- Stale lease threshold: 20 minutes
- Dead-agent cleanup: not applicable for this single-ticket pack.
- Requeue rules: rerun validation and re-open ticket if adoption fixture fails.

## Pack Validation

- Smoke tests: fixture adoption flow and validation-plan coverage.
- Screenshots: not required.
- Full regression checks: `make validate`.

## Completion

- Completed tickets:
  - `ticket.context.020`
- Remaining tickets:
  - None.
- Final validation:
  - `node tools/context/ctx.test.mjs`
  - `make validate`
  - `node tools/context/ctx.mjs doctor --json`
  - `make smoke`
