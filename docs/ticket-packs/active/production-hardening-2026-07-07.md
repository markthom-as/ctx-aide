---
id: pack.ctx-aide-production-hardening-2026-07-07
status: active
title: Production Hardening
milestones:
  - milestone.ctx-aide-production-hardening
source_specs:
  - spec.public-release-2026-07-01
  - spec.user-friendly-adoption-onboarding-2026-07-05
tickets:
  - ticket.context.060
  - ticket.context.061
  - ticket.context.062
  - ticket.context.063
  - ticket.context.064
  - ticket.context.065
  - ticket.context.066
  - ticket.context.067
  - ticket.context.068
  - ticket.context.069
  - ticket.context.070
  - ticket.context.071
  - ticket.context.072
run_policy:
  max_parallel_agents: 4
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  onboarding:
    tickets:
      - ticket.context.060
  audit:
    tickets:
      - ticket.context.071
      - ticket.context.072
  release-decisions:
    tickets:
      - ticket.context.061
      - ticket.context.067
  automation:
    tickets:
      - ticket.context.062
      - ticket.context.063
      - ticket.context.069
  cli-surface:
    tickets:
      - ticket.context.064
      - ticket.context.065
  public-repo:
    tickets:
      - ticket.context.068
  publishing:
    tickets:
      - ticket.context.066
      - ticket.context.070
blocked_by:
  - License, repository owner/org, and package owner decisions are required before publication or public launch.
  - Cargo distribution requires an explicit product decision before any crates.io readiness claim.
created: 2026-07-07
completion:
  completed_at: null
  final_validation: []
---

# Production Hardening

## Outcome

Close the remaining gaps between a locally working CTX Aide CLI and a production-grade public release candidate that can withstand outside review, CI scrutiny, local install smoke, package preflight, and launch-gate checks.

## Scope

- Included: setup/onboarding closeout, CI and release gates, local install ergonomics, help/introspection, maintainability refactor planning, npm/Cargo publication gates, public-repo hygiene, safety scan refresh, and final release cutover.
- Excluded: paid infrastructure, hosted product backend, registry publication without owner/license approval, crates.io implementation without a Cargo posture decision, and unrelated feature work.

## Tickets

- `ticket.context.060`: blocked
- `ticket.context.061`: blocked
- `ticket.context.062`: ready
- `ticket.context.063`: ready
- `ticket.context.064`: done
- `ticket.context.065`: ready, next executable slice
- `ticket.context.066`: blocked
- `ticket.context.067`: needs-questions
- `ticket.context.068`: ready
- `ticket.context.069`: ready
- `ticket.context.070`: blocked
- `ticket.context.071`: done
- `ticket.context.072`: done

## Execution Plan

- Parallel groups: `automation`, `cli-surface`, and `public-repo` can proceed independently once the worktree is clean, except where a ticket declares an explicit dependency.
- Sequential dependencies: `ticket.context.060` is blocked until onboarding tickets `047`, `046`, and `048` are done; `ticket.context.065` can now proceed after `ticket.context.064`; `ticket.context.066` depends on `061`; `ticket.context.070` depends on every other ticket plus `ticket.context.044`.
- Shared-file coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `README.md`, and package metadata need sequential commits if multiple agents run.
- Worktree strategy: use separate worktrees for CI/docs tickets and CLI refactor tickets when running in parallel.
- Merge queue strategy: one scoped commit per completed ticket; blocked tickets stay in blocked/needs-questions until their decisions are made.

## Run Policy

- Max parallel agents: 4.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging; never absorb unrelated user changes.
- Requeue rules: move a ticket back to `needs-hardening` when it requires an unresolved legal, package ownership, Cargo architecture, or public-visibility decision.

## Pack Validation

- Smoke tests: `npm run build -- --dry-run --json`, `npm run install:local -- --json`, `.ctx-aide/install/bin/ctxa --help`, and `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-production-hardening-2026-07-07 --json`.
- Screenshots: not required unless a browser-visible artifact or hosted docs surface is added.
- Full regression checks: `npm audit --omit=dev --json`, `node tools/ctx-aide/ctx-aide.mjs scan --json`, `node tools/ctx-aide/ctx-aide.mjs spec check --json`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, `make validate`, and `make smoke`.

## Completion

- Completed tickets: `ticket.context.071`, `ticket.context.072`, `ticket.context.064`.
- Remaining tickets: `ticket.context.060`, `ticket.context.061`, `ticket.context.062`, `ticket.context.063`, `ticket.context.065`, `ticket.context.066`, `ticket.context.067`, `ticket.context.068`, `ticket.context.069`, `ticket.context.070`.
- Final validation: pending.
