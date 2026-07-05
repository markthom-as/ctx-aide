---
id: pack.pull-request-review-workflow-2026-07-05
status: done
title: Pull Request Review Workflow
milestones:
  - milestone.repo-context-pr-review
source_specs:
  - spec.pull-request-review-workflow-2026-07-05
tickets:
  - ticket.context.049
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  workflow:
    tickets:
      - ticket.context.049
blocked_by: []
created: 2026-07-05
completion:
  completed_at: 2026-07-05
  final_validation:
    - node tools/context/ctx.mjs lint --json blocked by pre-existing docs/context/architecture/public-name-generation-2026-07-05.md section errors
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs spec check --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json
    - node tools/context/ctx.mjs tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json
    - node tools/context/ctx.mjs tools check --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json
    - node tools/context/ctx.mjs pack check --json
---

# Pull Request Review Workflow

## Outcome

Added a repo-local PR review workflow that guides agents through `git` and `gh` based review, comments, fix commits, pushes, re-review, and merge gates.

## Scope

- Included: workflow doc, dependency catalog entries for `git` and `gh`, workflow tool policy, README command examples, and a completed ticket.
- Excluded: live PR mutation, GitHub connector usage, hosted infrastructure, and changes to public launch gates.

## Tickets

- `ticket.context.049`: done

## Execution Plan

- Single shared-docs/code slice because the dependency catalog, policy config, README, and workflow markdown must stay aligned.
- Keep the completed ticket and pack metadata truthful with validation evidence.
- Do not touch generated context artifacts unless validation requires regeneration.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect `git status --short` before staging.
- Requeue rules: reopen the ticket if the workflow needs live GitHub connector integration instead of `git`/`gh` CLI guidance.

## Pack Validation

- `node tools/context/ctx.mjs lint --json` is currently blocked by pre-existing section errors in `docs/context/architecture/public-name-generation-2026-07-05.md`.
- `node tools/context/ctx.test.mjs`
- `node tools/context/ctx.mjs spec check --json`
- `node tools/context/ctx.mjs ticket check --json`
- `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
- `node tools/context/ctx.mjs tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json`
- `node tools/context/ctx.mjs tools check --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json`
- `node tools/context/ctx.mjs pack check --json`

## Completion

- Completed tickets: `ticket.context.049`.
- Remaining tickets: none.
- Final validation: see frontmatter.
