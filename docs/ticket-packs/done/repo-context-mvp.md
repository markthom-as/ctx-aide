---
id: pack.repo-context-mvp
status: done
title: Repo Context MVP
milestones:
  - milestone.repo-context-mvp
source_specs:
  - spec.repo-context-mvp
tickets:
  - ticket.context.013
  - ticket.context.012
  - ticket.context.000
  - ticket.context.001
  - ticket.context.002
  - ticket.context.003
  - ticket.context.004
  - ticket.context.005
  - ticket.context.006
  - ticket.context.007
  - ticket.context.008
  - ticket.context.009
  - ticket.context.010
  - ticket.context.011
run_policy:
  max_parallel_agents: 4
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: true
parallel_groups:
  cli-index-a:
    tickets:
      - ticket.context.013
  cli-bootstrap-a:
    tickets:
      - ticket.context.012
  planning-a:
    tickets:
      - ticket.context.000
  substrate-a:
    tickets:
      - ticket.context.001
  cli-a:
    tickets:
      - ticket.context.002
  tooling-a:
    tickets:
      - ticket.context.011
  discovery-a:
    tickets:
      - ticket.context.010
  component-catalog-a:
    tickets:
      - ticket.context.004
  agent-packs-a:
    tickets:
      - ticket.context.003
  ticketing-a:
    tickets:
      - ticket.context.005
  ticketing-b:
    tickets:
      - ticket.context.007
  impact-a:
    tickets:
      - ticket.context.006
  runs-a:
    tickets:
      - ticket.context.009
  idvisor-a:
    tickets:
      - ticket.context.008
blocked_by: []
created: 2026-06-25
completion:
  completed_at: 2026-06-26
  final_validation: []
---

# Repo Context MVP

## Outcome

Make this repository its own first usable fixture for repo-local context, canonical tickets, ticket packs, validation, Codex skill use, Semble-backed discovery, and long-running milestone orchestration.

## Scope

- Included:
  - Canonicalize all draft tickets.
  - Scaffold documented directories.
  - Add daily validation and skill install commands.
  - Add initial validator checks.
  - Define CLI, discovery, pack, run, and Idvisor implementation tickets.
- Excluded:
  - Hosted infrastructure.
  - Replacing markdown with SQLite as source of truth.
  - Full Idvisor plugin implementation before local ctx behavior stabilizes.

## Tickets

- `ticket.context.013`: done - Implement scan and query index
- `ticket.context.012`: done - Implement ctx init bootstrap
- `ticket.context.000`: done - Define high-effort spec to ticket workflow
- `ticket.context.001`: done - Add repo-local context markdown substrate
- `ticket.context.002`: done - Implement ctx scan query lint CLI foundation
- `ticket.context.003`: done - Generate Codex Claude and Cursor context packs
- `ticket.context.004`: done - Add lightweight component and design catalog
- `ticket.context.005`: done - Hydrate markdown tickets with scoped context
- `ticket.context.006`: done - Add impact and regression checks
- `ticket.context.007`: done - Add canonical ticket statuses and ticket packs
- `ticket.context.008`: done - Define Idvisor repo-context plugin integration
- `ticket.context.009`: done - Add milestone run orchestration
- `ticket.context.010`: done - Add Semble-backed code discovery
- `ticket.context.011`: done - Add daily usability tooling

## Execution Plan

- Parallel groups: see frontmatter.
- Sequential dependencies: substrate and validation tooling come before generated packs, hydration, and impact checks.
- Shared-file coordination: README, templates, and skill files should merge through a coordinator queue.
- Worktree strategy: use one worktree per parallel implementation agent for long runs.
- Merge queue strategy: coordinator-owned, pack-level validation after merges.

## Run Policy

- Max parallel agents: 4.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect worktree, salvage commit or patch when useful, record requeue/discard/block decision.
- Requeue rules: requeue only after cleanup log records the stale lease outcome.

## Pack Validation

- Smoke tests:
  - `node tools/context/ctx.mjs lint --json`
  - `make validate`
- Screenshots:
  - Not required for this documentation/tooling pack.
- Full regression checks:
  - Skill validation must pass.
  - Pack and ticket checks must pass.

## Completion

- Completed tickets: ticket.context.013, ticket.context.012, ticket.context.000, ticket.context.001, ticket.context.002, ticket.context.003, ticket.context.004, ticket.context.005, ticket.context.006, ticket.context.007, ticket.context.008, ticket.context.009, ticket.context.010, ticket.context.011.
- Remaining tickets: none.
- Final validation: `make validate`; `node tools/context/ctx.mjs pack status pack.repo-context-mvp --json`.
