---
id: pack.ctx-aide-agent-capability-policy-2026-06-27
status: done
title: Agent Capability Policy
milestones:
  - milestone.ctx-aide-agent-capability-policy
source_specs:
  - spec.agent-capability-policy-2026-06-27
tickets:
  - ticket.context.030
  - ticket.context.031
  - ticket.context.032
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  catalog:
    tickets:
      - ticket.context.030
  resolver:
    tickets:
      - ticket.context.031
  closeout:
    tickets:
      - ticket.context.032
blocked_by: []
created: 2026-06-27
completion:
  completed_at: 2026-06-27
  final_validation:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs lint --json
    - node tools/ctx-aide/ctx-aide.mjs tools list --json
    - node tools/ctx-aide/ctx-aide.mjs tools check --capability tool.semble --json
    - make validate
    - make smoke
---

# Agent Capability Policy

## Outcome

CTX Aide can describe agent tools/skills and resolve repo-local allow/deny policy globally and for workflow steps.

## Scope

- Included: built-in capability catalog, repo-local policy config, CLI policy commands, lint/doctor validation, tests, and docs.
- Excluded: runtime enforcement inside external agent hosts, paid connector operations, and infrastructure changes.

## Tickets

- `ticket.context.030`: done
- `ticket.context.031`: done
- `ticket.context.032`: done

## Execution Plan

- Parallel groups: logical groups are listed for review, but implementation is sequential because all tickets touch the CLI.
- Sequential dependencies: `ticket.context.031` depends on `ticket.context.030`; `ticket.context.032` depends on both.
- Shared-file coordination: re-read CLI/test command sections before each ticket edit.
- Worktree strategy: current worktree, one commit per ticket.
- Merge queue strategy: no queue required.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: check `git status --short` before staging.
- Requeue rules: move back to needs-hardening if policy needs live host-runtime enforcement or paid connector changes.

## Pack Validation

- Smoke tests: `ctx-aide tools list`, `ctx-aide tools policy`, and `ctx-aide tools check`.
- Screenshots: none.
- Full regression checks: `make validate` and `make smoke`.

## Completion

- Completed tickets: `ticket.context.030`, `ticket.context.031`, `ticket.context.032`.
- Remaining tickets: none.
- Final validation:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs lint --json`
  - `node tools/ctx-aide/ctx-aide.mjs tools list --json`
  - `node tools/ctx-aide/ctx-aide.mjs tools check --capability tool.semble --json`
  - `make validate`
  - `make smoke`
