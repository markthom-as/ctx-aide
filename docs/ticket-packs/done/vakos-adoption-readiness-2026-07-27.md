---
id: pack.vakos-adoption-readiness-2026-07-27
status: done
title: vakOS Adoption Readiness
milestones:
  - milestone.vakos-adoption-readiness
source_specs:
  - spec.vakos-adoption-readiness-2026-07-27
tickets:
  - ticket.context.084
  - ticket.context.085
  - ticket.context.086
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  command-contract:
    tickets:
      - ticket.context.084
  target-profile:
    tickets:
      - ticket.context.085
  query-provenance:
    tickets:
      - ticket.context.086
blocked_by: []
created: 2026-07-27
completion:
  completed_at: 2026-07-27
  final_validation:
    - npm test
    - make validate
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - npm pack --dry-run --json
---

# vakOS Adoption Readiness

## Outcome

CTX Aide exposes a pipe-safe, strict, explicit-write command surface whose
target profiles preserve vakOS's root sources/tickets and whose context results
are bounded and revision-linked.

## Scope

- Included: CLI output/argument registry, explicit atomic generated writes,
  profile-defined roots and command policy, flat legacy/canonical ticket
  support, source references, query provenance, cache freshness, tests, and
  package-shipped schemas/config.
- Excluded: choosing a public/private source remote or license, modifying
  vakOS's flake, CTX Aide runtime inclusion in an ISO, Idvisor manifest/result
  implementation, screenshot UI changes, hosted services, and paid
  infrastructure.

## Tickets

- `ticket.context.084`: done; command contracts, strict argv, pipe-safe output,
  and atomic explicit generated writes are implemented.
- `ticket.context.085`: done; authoritative data-driven target profiles,
  vakOS root truth, migration-safe tickets, and enforced command policy ship.
- `ticket.context.086`: done; exact provenance, real budget accounting,
  revision-bound cursors, secret/path exclusion, and compare-before-replace
  generated caches ship.

## Execution Plan

- Parallel groups: the three groups are logically separate but execute
  sequentially because they share command and test files.
- Sequential dependencies: 084 -> 085 -> 086.
- Shared-file coordination: commit and validate one ticket before opening the
  next shared CLI slice.
- Worktree strategy: one clean active checkout; no concurrent writers.
- Merge queue strategy: one completed ticket and focused commit at a time.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: no agent subprocesses or extra worktrees are used.
- Requeue rules: stop if a slice requires distribution authority, an Idvisor
  runtime change, a hosted service, or weakening complete-output/path/write
  guarantees.

## Pack Validation

- Smoke tests: parse commands through real pipes with detached stdin; adopt a
  flat-root vakOS fixture; query clean/dirty/stale sources; repeat generated
  writes; reject unknown flags, path escape, stale plans, and disabled commands.
- Screenshots: none.
- Full regression checks: `node --check`, focused CLI tests, `npm test`,
  `ctxa lint/ticket check/pack check/spec check`, `npm pack --dry-run`, and
  `make validate` after the final ticket.

## Completion

- Completed tickets: `ticket.context.084`, `ticket.context.085`,
  `ticket.context.086`.
- Remaining tickets: none.
- Final validation: `npm test`, `make validate`, spec/ticket/pack checks,
  package dry-run, syntax checks, and `git diff --check` all pass.
