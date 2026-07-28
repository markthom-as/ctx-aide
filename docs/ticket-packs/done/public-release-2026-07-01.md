---
id: pack.ctx-aide-public-release-2026-07-01
status: done
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
  - ticket.context.056
  - ticket.context.057
  - ticket.context.058
  - ticket.context.059
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
      - ticket.context.056
      - ticket.context.057
      - ticket.context.058
      - ticket.context.059
  launch:
    tickets:
      - ticket.context.044
blocked_by: []
created: 2026-07-01
completion:
  completed_at: 2026-07-28
  final_validation:
    - make validate
    - make smoke
    - gitleaks git . --no-banner --redact
    - uvx detect-secrets scan tracked files
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
- `ticket.context.044`: done
- `ticket.context.054`: done
- `ticket.context.055`: done
- `ticket.context.056`: done
- `ticket.context.057`: done
- `ticket.context.058`: done
- `ticket.context.059`: done

## Execution Plan

- Completed sequence: `ticket.context.040` through `043` and `054` through `059` are done, including public name, safety audit, README/demo proof, ctx-aide namespace rename, removal of legacy naming aliases, `ctxa` as the single installed binary, build/install scripts, and formatted top-level help.
- All preparation tickets are done. The separate production-hardening ticket
  `ticket.context.070` owns public repository creation and verification.
- Shared-file coordination: `README.md`, release docs, and repo metadata must be coordinated by a single agent if the launch gate is later executed.
- Worktree strategy: use a clean worktree for any future launch-gate execution so public-visibility changes cannot absorb unrelated local edits.
- Merge queue strategy: keep the launch gate as one scoped commit after every prerequisite is done or explicitly waived in markdown.

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

- Completed tickets: `ticket.context.040`, `ticket.context.041`, `ticket.context.042`, `ticket.context.043`, `ticket.context.044`, `ticket.context.054`, `ticket.context.055`, `ticket.context.056`, `ticket.context.057`, `ticket.context.058`, `ticket.context.059`.
- Remaining tickets: none.
- Blocked tickets: none.
- Final validation: passed on 2026-07-28; external cutover remains isolated in `ticket.context.070`.
