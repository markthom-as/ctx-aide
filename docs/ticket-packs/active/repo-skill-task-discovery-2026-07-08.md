---
id: pack.ctx-aide-repo-skill-task-discovery-2026-07-08
status: active
title: Repo Skill Task Discovery And Authoring
milestones:
  - milestone.ctx-aide-repo-skill-task-discovery
source_specs:
  - spec.repo-skill-task-discovery-2026-07-08
tickets:
  - ticket.context.073
  - ticket.context.074
  - ticket.context.075
  - ticket.context.076
  - ticket.context.077
run_policy:
  max_parallel_agents: 3
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  inventory:
    tickets:
      - ticket.context.073
  scoring:
    tickets:
      - ticket.context.074
  authoring:
    tickets:
      - ticket.context.075
      - ticket.context.076
  planning:
    tickets:
      - ticket.context.077
blocked_by: []
created: 2026-07-08
completion:
  completed_at: null
  final_validation: []
---

# Repo Skill Task Discovery And Authoring

## Outcome

CTX Aide can inventory repo-local skills, identify tasks that should use or become skills, promote strong candidates into ticketed artifacts, materialize approved skill drafts, and include skill recommendations in implementation plans.

## Scope

- Included: local skill inventory, candidate scoring, candidate markdown, ticketed skill creation, dry-run materialization, policy-aware implementation-plan recommendations, docs, fixtures, and validation.
- Excluded: global Codex skill installation, plugin publication, hosted skill registry sync, connector authentication, paid infrastructure, and automatic materialization from loose chat intent.

## Tickets

- `ticket.context.073`: ready
- `ticket.context.074`: ready
- `ticket.context.075`: ready
- `ticket.context.076`: ready
- `ticket.context.077`: ready

## Execution Plan

- Parallel groups: `inventory` starts first; `scoring` follows inventory; `authoring` and `planning` can proceed in parallel after scoring if edits to shared CLI files are coordinated.
- Sequential dependencies: `ticket.context.074` depends on `073`; `075` depends on `074`; `076` depends on `075`; `077` depends on `073` and `074`.
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `tools/ctx-aide/command-catalog.mjs`, and `README.md` need one ticket commit at a time.
- Worktree strategy: use separate worktrees for `authoring` and `planning` only after `073` and `074` are merged; otherwise keep the sequence in one checkout to avoid command-dispatch conflicts.
- Merge queue strategy: one scoped commit per ticket, with ticket status and completion metadata updated in the same commit as implementation.

## Run Policy

- Max parallel agents: 3.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging and keep unrelated local changes out of ticket commits.
- Requeue rules: move a ticket to `needs-hardening` if implementation requires hidden prompts, global skill installation, hosted registry decisions, or paid-infrastructure behavior.

## Pack Validation

- Smoke tests:
  - `node tools/ctx-aide/ctx-aide.mjs skills inventory --repo . --json`
  - `node tools/ctx-aide/ctx-aide.mjs skills candidates --repo . --from tickets,workflows,future-work --json`
  - `node tools/ctx-aide/ctx-aide.mjs skills check --repo . --json`
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
- Remaining tickets: `ticket.context.073`, `ticket.context.074`, `ticket.context.075`, `ticket.context.076`, `ticket.context.077`.
- Final validation: pending.
