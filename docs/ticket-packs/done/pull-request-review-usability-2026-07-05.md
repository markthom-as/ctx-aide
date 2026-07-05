---
id: pack.pull-request-review-usability-2026-07-05
status: done
title: Pull Request Review Usability
milestones:
  - milestone.repo-context-pr-review-usability
source_specs:
  - spec.pull-request-review-workflow-2026-07-05
tickets:
  - ticket.context.050
  - ticket.context.051
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  docs:
    tickets:
      - ticket.context.050
  cli:
    tickets:
      - ticket.context.051
blocked_by: []
created: 2026-07-05
completion:
  completed_at: 2026-07-05
  final_validation:
    - node --check tools/context/ctx.mjs
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs pr preflight --repo . --allow-dirty --json
    - node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
---

# Pull Request Review Usability

## Outcome

Make `workflow.pull-request-review` immediately usable through copy-paste docs, templates, and a machine-checkable PR preflight.

## Scope

- Included: PR review runbook, review templates, `ctx pr preflight`, tests, README usage, and workflow docs.
- Excluded: live GitHub PR mutation, connector-based PR review, hosted services, and paid infrastructure.

## Tickets

- `ticket.context.050`: done
- `ticket.context.051`: done

## Execution Plan

- Complete documentation templates first so agents can use the workflow manually.
- Add the preflight command as a separate CLI ticket with tests.
- Keep one completed ticket per commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short --branch` before staging.
- Requeue rules: stop if PR mutation requires live GitHub connector integration or repository admin decisions.

## Pack Validation

- `node --check tools/context/ctx.mjs`
- `node tools/context/ctx.test.mjs`
- `node tools/context/ctx.mjs pr preflight --repo . --allow-dirty --json`
- `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
- `node tools/context/ctx.mjs ticket check --json`
- `node tools/context/ctx.mjs pack check --json`
- `node tools/context/ctx.test.mjs` after CLI changes.

## Completion

- Completed tickets: `ticket.context.050`, `ticket.context.051`.
- Remaining tickets: none.
- Final validation: see frontmatter.
