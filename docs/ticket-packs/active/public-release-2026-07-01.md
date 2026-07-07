---
id: pack.ctx-aide-public-release-2026-07-01
status: blocked
title: Public Release Preparation
milestones:
  - milestone.ctx-aide-public-release
source_specs:
  - spec.public-release-2026-07-01
tickets:
  - ticket.context.040
  - ticket.context.041
  - ticket.context.042
  - ticket.context.043
  - ticket.context.044
  - ticket.context.054
  - ticket.context.055
run_policy:
  max_parallel_agents: 3
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  naming:
    tickets:
      - ticket.context.040
  safety:
    tickets:
      - ticket.context.041
  public-docs:
    tickets:
      - ticket.context.042
      - ticket.context.043
      - ticket.context.054
      - ticket.context.055
  launch:
    tickets:
      - ticket.context.044
blocked_by:
  - GitHub owner/org decision required before creating or publishing a remote.
  - Repository license decision required before claiming open-source reuse rights.
  - Cargo publishing decision required before claiming crates.io readiness.
created: 2026-07-01
completion:
  completed_at: null
  final_validation: []
---

# Public Release Preparation

## Outcome

Prepare CTX Aide, under the `ctx-aide` repo and tooling namespace, for a credible public GitHub release that demonstrates repo-local context, markdown ticketing, agent guidance, validation, and AI developer-productivity workflow design.

## Scope

- Included: public naming decision, safety/history scan, outside-reader README polish, demo/example proof, launch metadata, and final visibility gate.
- Excluded: paid infrastructure, hosted deployments, major CLI redesign, shared workflow-kernel extraction, and making risky adjacent repos public.

## Tickets

- `ticket.context.040`: done
- `ticket.context.041`: done
- `ticket.context.042`: done
- `ticket.context.043`: done
- `ticket.context.044`: blocked
- `ticket.context.054`: done
- `ticket.context.055`: done

## Execution Plan

- Parallel groups: `naming` and `safety` can start immediately in parallel.
- Sequential dependencies: `ticket.context.042` and `ticket.context.043` depend on `ticket.context.040`; `ticket.context.044` depends on all prior tickets; `ticket.context.054` is a follow-on documentation hardening slice; `ticket.context.055` performs the repo/tool namespace rename requested before publication.
- Shared-file coordination: `README.md`, release docs, and repo metadata must be coordinated by a single agent after the name decision lands.
- Worktree strategy: use separate worktrees for independent naming and safety work if parallel agents run concurrently.
- Merge queue strategy: one clean commit per completed ticket; merge naming before docs/demo copy changes.

## Run Policy

- Max parallel agents: 3.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging; do not revert unrelated user changes.
- Requeue rules: move a ticket back to `needs-hardening` if it uncovers unresolved product naming, security, licensing, or privacy decisions.

## Pack Validation

- Smoke tests: `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json`.
- Screenshots: not required unless a public visual/demo artifact is added.
- Full regression checks: `node tools/ctx-aide/ctx-aide.mjs scan --json`, `node tools/ctx-aide/ctx-aide.mjs spec check --json`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, `make validate`, and `make smoke`.

## Completion

- Completed tickets: `ticket.context.040`, `ticket.context.041`, `ticket.context.042`, `ticket.context.043`, `ticket.context.054`, `ticket.context.055`.
- Remaining tickets: none ready.
- Blocked tickets: `ticket.context.044` pending GitHub owner/org, license, and Cargo/package publication decisions.
- Final validation: pending.
