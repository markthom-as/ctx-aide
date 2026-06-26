---
id: pack.repo-context-validation-runtime-settings
status: done
title: Validation Runtime Settings
milestones:
  - milestone.repo-context-docs-maintenance
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.023
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.023
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - node tools/context/ctx.test.mjs
---

# Validation Runtime Settings

## Outcome

Add managed testing, screenshot, CI, and deploy settings to workflow validation plans.

## Scope

- Included:
  - `testing` settings in validation config and plan output.
  - `screenshots` settings and per-matrix screenshot paths.
  - `ci` gates and artifact paths.
  - `deploy` policy with cost-estimate safety validation.
  - README, workflow docs, config defaults, and tests.
- Excluded:
  - Running tests or deploys.
  - Generating CI provider files.
  - Hosted infrastructure changes.

## Tickets

- `ticket.context.023`: done - Add validation runtime settings

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: `ticket.context.021`.
- Shared-file coordination: README, browser workflow docs, validation config, and `tools/context/ctx.mjs`.
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
  - `node tools/context/ctx.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture tests cover default runtime settings, config overrides, screenshot paths, CI gates, and deploy cost-estimate validation.

## Completion

- Completed tickets: ticket.context.023.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `node tools/context/ctx.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
