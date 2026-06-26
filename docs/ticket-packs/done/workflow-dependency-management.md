---
id: pack.repo-context-workflow-dependency-management
status: done
title: Workflow Dependency Management
milestones:
  - milestone.repo-context-docs-maintenance
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.018
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.018
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - node tools/context/ctx.test.mjs
---

# Workflow Dependency Management

## Outcome

Add a workflow dependency contract so repo-context can check and write repo-local pins for workflow runtimes such as browser validation.

## Scope

- Included:
  - `ctx workflow deps`.
  - Browser-validation workflow dependency declaration.
  - README and tests.
- Excluded:
  - Package installation.
  - Browser binary installation.
  - Codex desktop plugin version management.

## Tickets

- `ticket.context.018`: done - Add workflow dependency management

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: none.
- Shared-file coordination: README and `tools/context/ctx.mjs`.
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
  - `node tools/context/ctx.test.mjs`
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture test verifies missing browser workflow pins, `--write`, and lockfile readiness.

## Completion

- Completed tickets: ticket.context.018.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.browser-validation --repo . --json` reports the expected missing browser-app package pins for this repo.
