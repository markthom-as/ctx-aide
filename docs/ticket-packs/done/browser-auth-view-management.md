---
id: pack.repo-context-browser-auth-view-management
status: done
title: Browser Auth View Management
milestones:
  - milestone.repo-context-docs-maintenance
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.019
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.019
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
    - node tools/context/ctx.test.mjs
---

# Browser Auth View Management

## Outcome

Add logged-out/logged-in browser view-state management and redacted credential/session checks for browser validation workflows.

## Scope

- Included:
  - `ctx workflow views`.
  - `ctx credentials check`.
  - `ctx credentials import-browser-state`.
  - Browser workflow view and credential metadata.
  - `.repo-context/` ignore rule.
- Excluded:
  - Browser password-store scraping.
  - Hosted secret storage.
  - Login-flow automation generation.

## Tickets

- `ticket.context.019`: done - Add browser auth view management

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: `ticket.context.018`.
- Shared-file coordination: README, browser workflow docs, and `tools/context/ctx.mjs`.
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
  - Env-backed `ctx workflow views` ready state.
  - Redacted `ctx credentials import-browser-state` command.
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture tests verify missing credentials, env credentials, storage-state import, redaction, and logged-in readiness.

## Completion

- Completed tickets: ticket.context.019.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - Env-backed logged-in workflow view smoke passed.
  - Browser storage-state import smoke passed.
