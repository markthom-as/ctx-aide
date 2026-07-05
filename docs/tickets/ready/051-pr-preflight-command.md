---
id: ticket.context.051
status: ready
title: Add pull request preflight command
ticket_pack: pack.pull-request-review-usability-2026-07-05
milestones:
  - milestone.repo-context-pr-review-usability
source_spec: spec.pull-request-review-workflow-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli
depends_on:
  - ticket.context.050
blocks: []
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - README.md
    - docs/workflows/pull-request-review.md
    - docs/workflows/pull-request-review-runbook.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - workflow.pull-request-review
context_query:
  task: "add ctx pr preflight command"
  generated_at: 2026-07-05
  context_ids:
    - workflow.pull-request-review
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.pr-preflight-blocks-unsafe-mutation
validation:
  automated:
    - node --check tools/context/ctx.mjs
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs pr preflight --repo . --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add Pull Request Preflight Command

## Outcome

Add `ctx pr preflight` so agents can machine-check git worktree state, `gh` availability/auth, optional PR metadata, and merge readiness blockers before comments, pushes, or merges.

## Context

The runbook gives a manual command path. A preflight command should return one JSON envelope that agents can use before PR mutation steps.

## Positive Rules

- Return JSON with `ok`, `blockers`, `warnings`, `git`, `gh`, and optional `pr` fields.
- Support `--repo <path>` and optional `--pr <number-or-url>`.
- Treat dirty worktrees as blockers by default.
- Include status-check and review-decision summaries when PR metadata is available.

## Negative Rules

- Do not mutate the worktree or GitHub state.
- Do not require network access when `--pr` is omitted.
- Do not print secrets or tokens from `gh auth status`.
- Do not mark merge-ready while checks are failing, pending, or review is blocking.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.pr-preflight-blocks-unsafe-mutation`: PR mutation should not proceed when preflight reports blockers.

## Frozen Decisions

- Decision: `ctx pr preflight` is read-only.
- Rationale: preflight should be safe to run before any PR action.
- Decision: `--pr` is optional.
- Rationale: agents often need local readiness before selecting a PR.

## Implementation Rules

- Required approach: add a CLI command, fixture tests with fake `gh`, README usage, and workflow/runbook references.
- Existing components/helpers to use: `spawnSync`, `gitStatusSummary`, command dispatch, and JSON output helpers.
- Anti-patterns to avoid: shelling through unescaped user input or requiring live GitHub in tests.
- Stop and escalate if: line-comment creation or merge execution becomes part of this command.

## Scope

- In: read-only preflight command, tests, docs, ticket/pack closeout.
- Out: `gh pr review`, `git push`, `gh pr merge`, line-comment API helpers.

## Acceptance Criteria

- `ctx pr preflight --repo . --json` returns git and gh readiness without requiring a PR.
- `ctx pr preflight --repo . --pr <pr> --json` includes PR metadata when `gh pr view` succeeds.
- Dirty worktree, missing `gh` auth, draft PRs, failing/pending checks, and blocking reviews produce blockers.
- Tests cover clean local readiness and PR metadata blocker parsing with fake `gh`.

## Validation

- Automated:
  - `node --check tools/context/ctx.mjs`
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs pr preflight --repo . --json`
  - `node tools/context/ctx.mjs ticket check --json`
  - `node tools/context/ctx.mjs pack check --json`
- Smoke: none.
- Screenshots: none.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: none.
