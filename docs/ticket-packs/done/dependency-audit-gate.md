---
id: pack.repo-context-dependency-audit-gate
status: done
title: Dependency Audit Gate
milestones:
  - milestone.repo-context-docs-maintenance
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.017
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.017
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
---

# Dependency Audit Gate

## Outcome

Add a machine-checkable dependency audit gate so dependency-upgrade tickets cannot be closed on implementation evidence alone.

## Scope

- Included:
  - `ctx dependency audit` command.
  - `work_type: dependency-upgrade` done-ticket validation.
  - Tests and README documentation.
- Excluded:
  - Package-manager-specific remediation logic.
  - Hosted vulnerability dashboards.

## Tickets

- `ticket.context.017`: done - Add dependency audit gate

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
  - `node tools/context/ctx.mjs dependency audit --repo . --command "node -e 'process.exit(0)'" --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - `ctx ticket check` fails a done dependency-upgrade ticket that lacks cleared audit metadata.

## Completion

- Completed tickets: ticket.context.017.
- Remaining tickets: none.
- Final validation: `make validate`.
