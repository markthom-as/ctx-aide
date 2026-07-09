---
id: pack.ctx-aide-agent-workflow-orchestration-2026-07-09
status: active
title: Agent Workflow Orchestration Hardening
milestones:
  - milestone.ctx-aide-agent-workflow-orchestration
source_specs:
  - spec.agent-workflow-orchestration-2026-07-09
tickets:
  - ticket.context.078
  - ticket.context.079
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: true
parallel_groups:
  run-policy:
    tickets:
      - ticket.context.078
  failure-import:
    tickets:
      - ticket.context.079
blocked_by: []
created: 2026-07-09
completion:
  completed_at: null
  final_validation: []
---

# Agent Workflow Orchestration Hardening

## Outcome

CTX Aide can express independent implementer, adversarial reviewer, and fixer roles in ticket-pack policy, and it can turn bounded validation failure output into reviewable ticket drafts without hiding decisions in chat.

## Scope

- Included: pack/ticket run-policy metadata, deterministic validation of reviewer/fixer role contracts, dry-run failure import, bounded grouping, redaction, docs, and tests.
- Excluded: hosted queues, paid runners, live subagent orchestration, automatic global skill installation, automatic commits, and direct mutation of target repos beyond explicit `--write` ticket creation.

## Tickets

- `ticket.context.078`: ready
- `ticket.context.079`: ready

## Execution Plan

- Parallel groups: `run-policy` and `failure-import` can be developed in parallel in separate worktrees because the behavioral surfaces are independent.
- Sequential dependencies: none.
- Shared-file coordination: both tickets may touch `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, and `tools/ctx-aide/command-catalog.mjs`; merge one ticket commit at a time.
- Worktree strategy: use separate worktrees if parallel agents run; otherwise implement in ticket order in the main checkout.
- Merge queue strategy: one scoped commit per completed ticket, with ticket status and completion metadata updated in the same commit as implementation.

## Run Policy

- Max parallel agents: 2.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging and do not absorb unrelated local changes.
- Requeue rules: move a ticket to `needs-hardening` if implementation needs paid infrastructure, hosted orchestration, a new runtime agent harness, or product decisions not frozen here.

## Pack Validation

- Smoke tests:
  - `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-agent-workflow-orchestration-2026-07-09 --json`
  - `node tools/ctx-aide/ctx-aide.mjs failures import --repo . --source-file <fixture> --format ctxa-check --json`
- Screenshots: not required.
- Full regression checks:
  - `node tools/ctx-aide/ctx-aide.mjs scan --json`
  - `node tools/ctx-aide/ctx-aide.mjs spec check --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `make validate`

## Completion

- Completed tickets: none.
- Remaining tickets: `ticket.context.078`, `ticket.context.079`.
- Final validation: pending.
