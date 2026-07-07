---
id: pack.user-friendly-adoption-onboarding-2026-07-05
status: active
title: User-Friendly Adoption Onboarding
milestones:
  - milestone.user-friendly-adoption-onboarding
source_specs:
  - spec.user-friendly-adoption-onboarding-2026-07-05
tickets:
  - ticket.context.045
  - ticket.context.046
  - ticket.context.047
  - ticket.context.048
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  packaging:
    tickets:
      - ticket.context.045
  profiles:
    tickets:
      - ticket.context.047
  setup:
    tickets:
      - ticket.context.046
  docs-proof:
    tickets:
      - ticket.context.048
blocked_by: []
created: 2026-07-05
completion:
  completed_at: null
  final_validation: []
---

# User-Friendly Adoption Onboarding

## Outcome

Deliver a normal developer onboarding path for ctx-aide: install `ctx-aide`, run one setup command, bootstrap a target repo safely, and get clear next commands for first context/pack/ticket work.

## Scope

- Included: local CLI packaging, setup command UX, non-interactive setup mode, Astrotechne web/engine profile handling, docs, and smoke proof.
- Excluded: npm registry publishing, GitHub public launch, paid infrastructure, hosted onboarding, and production-code changes in target repos.

## Tickets

- `ticket.context.045`: ready
- `ticket.context.046`: ready
- `ticket.context.047`: ready
- `ticket.context.048`: ready

## Execution Plan

- Parallel groups: `packaging` and `profiles` can run in parallel.
- Sequential dependencies: `ticket.context.046` depends on `ticket.context.045` and `ticket.context.047`; `ticket.context.048` depends on all implementation tickets.
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs` and `tools/ctx-aide/ctx-aide.test.mjs` need sequential merges if multiple agents run.
- Worktree strategy: current worktree is acceptable for serial work; use separate worktrees for parallel `packaging` and `profiles` slices.
- Merge queue strategy: one clean commit per ticket, then a final docs/proof commit.

## Run Policy

- Max parallel agents: 2.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging and never absorb unrelated user changes.
- Requeue rules: move a ticket back to hardening if it needs registry publish, package scope, license, or hosted infrastructure decisions.

## Pack Validation

- Smoke tests:
  - `node tools/ctx-aide/ctx-aide.mjs setup --repo <fixture> --profile auto --no-input --json`
  - `ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json`
  - `ctxa setup --repo /Users/jove/code/astrotechne-engine --profile auto --no-input --json`
- Screenshots: not required.
- Full regression checks:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs spec check --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `make validate`

## Completion

- Completed tickets: none.
- Remaining tickets: `ticket.context.045`, `ticket.context.046`, `ticket.context.047`, `ticket.context.048`.
- Final validation: pending.
