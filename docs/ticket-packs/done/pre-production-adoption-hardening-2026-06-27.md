---
id: pack.repo-context-pre-production-adoption-hardening-2026-06-27
status: done
title: Pre-Production Adoption Hardening
milestones:
  - milestone.repo-context-pre-production-adoption-hardening
source_specs:
  - spec.pre-production-adoption-hardening-2026-06-27
tickets:
  - ticket.context.027
  - ticket.context.028
  - ticket.context.029
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  adoption-status:
    tickets:
      - ticket.context.027
  adoption-pack:
    tickets:
      - ticket.context.028
  adoption-ticket:
    tickets:
      - ticket.context.029
blocked_by: []
created: 2026-06-27
completion:
  completed_at: 2026-06-27
  final_validation:
    - make validate
    - make smoke
    - node tools/context/ctx.mjs adoption bootstrap --repo /Users/jove/code/astrotechne.com --profile auto --json
    - node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json
    - node tools/context/ctx.mjs adoption pack --repo /Users/jove/code/astrotechne.com --profile auto --title 'Repo Context Dogfood' --slug repo-context-dogfood --json
---

# Pre-Production Adoption Hardening

## Outcome

Make repo-context safer and more complete for target-repo dogfooding before it is used on Astrotechne production code.

## Scope

- Included: read-only adoption preflight, target-native pack creation, pack-aware generated ticket placement, tests, and docs.
- Excluded: editing Astrotechne production code, paid infrastructure, TUI work, and hosted services.

## Tickets

- `ticket.context.027`: done
- `ticket.context.028`: done
- `ticket.context.029`: done

## Execution Plan

- Parallel groups: listed for ownership, but implementation is sequential because the CLI and tests overlap.
- Sequential dependencies: `ticket.context.028` depends on `ticket.context.027`; `ticket.context.029` depends on both.
- Shared-file coordination: read `tools/context/ctx.mjs` and `tools/context/ctx.test.mjs` before every edit.
- Worktree strategy: current clean worktree; one commit per ticket.
- Merge queue strategy: no queue required.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: check `git status --short` before staging.
- Requeue rules: move a ticket back to needs-hardening if profile semantics need a new product decision.

## Pack Validation

- Smoke tests: target fixture adoption flow, target Astrotechne dry-run, and `ctx adoption status`.
- Screenshots: not applicable.
- Full regression checks: `make validate` and `make smoke`.

## Completion

- Completed tickets: `ticket.context.027`, `ticket.context.028`, `ticket.context.029`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `make smoke`
  - Astrotechne bootstrap/status/pack dry-runs.
