---
id: ticket.context.049
status: done
title: Add pull request review workflow
ticket_pack: pack.pull-request-review-workflow-2026-07-05
milestones:
  - milestone.repo-context-pr-review
source_spec: spec.pull-request-review-workflow-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: workflow
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - docs/workflows/pull-request-review.md
    - docs/config/repo-context.tools.json
    - README.md
  directories:
    - docs/specs
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.repo-context-dogfood
    - workflow.pull-request-review
context_query:
  task: "add pull request review workflow using gh and git"
  generated_at: 2026-07-05
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.pr-merge-requires-review-and-green-gates
validation:
  automated:
    - node tools/context/ctx.mjs lint --json
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json
    - node tools/context/ctx.mjs tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json
    - node tools/context/ctx.mjs tools check --workflow workflow.pull-request-review --step pr-fix --capability tool.shell --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
  smoke:
    - git status --short --branch
    - gh --version
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-05
---

# Add Pull Request Review Workflow

## Outcome

Add a first-class markdown workflow for agents to review PRs with `git` and `gh`, leave feedback, make scoped fix commits, push those fixes, and merge only after review and validation gates pass.

## Context

Repo-context already validates workflow docs, workflow dependencies, and workflow-step capability policy. The missing artifact is a PR lifecycle workflow that tells agents how to move from PR inspection through comments, fixes, and merge without hiding decisions in chat.

## Positive Rules

- Preserve markdown as the canonical workflow and ticket surface.
- Use `git` for local branch, diff, status, commit, and push state.
- Use `gh` for GitHub PR metadata, comments, reviews, checks, and merges when authenticated.
- Record review feedback, fix commits, validation evidence, and merge outcome in the ticket or run log.

## Negative Rules

- Do not stage unrelated worktree changes.
- Do not comment, push, or merge through GitHub unless `gh auth status` passes.
- Do not merge while required checks or reviews are unresolved unless the ticket records an accepted exception.
- Do not use paid infrastructure or deployment-connected changes without surfacing cost delta first.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.pr-merge-requires-review-and-green-gates`: A PR merge requires settled review state, green required checks, and recorded validation evidence unless an explicit exception is captured.

## Frozen Decisions

- Decision: default PR workflow uses `git` and `gh` commands, not the GitHub connector.
- Rationale: the requested agent path is command-line driven and should be reproducible from local shell evidence.
- Decision: `git` is a required workflow dependency and `github-cli` is optional at dependency-check time.
- Rationale: local review can inspect with `git`, while GitHub mutation stages separately require `gh auth status`.

## Implementation Rules

- Required approach: add workflow documentation, checkable command dependencies, workflow tool policy, and README examples in one scoped slice.
- Existing components/helpers to use: workflow dependency catalog, `ctx tools policy`, `ctx tools check`, ticket and pack validation.
- Anti-patterns to avoid: connector-only PR mutation, informal merge instructions, or broad GitHub launch changes.
- Stop and escalate if: the workflow requires a live GitHub connector, repository admin policy changes, or paid infrastructure.

## Scope

- In: `workflow.pull-request-review`, dependency catalog entries for `git` and `github-cli`, workflow-step tool policy, README usage, and closeout artifacts.
- Out: performing a live PR review, creating a GitHub remote, changing repository visibility, deployment, and public launch metadata.

## Acceptance Criteria

- `docs/workflows/pull-request-review.md` documents PR identification, checkout, review, comments, fixes, push, re-review, and merge.
- `ctx workflow deps --workflow workflow.pull-request-review --repo . --json` can evaluate local `git` and `gh` command availability.
- `ctx tools check` allows `tool.shell` for PR review/fix/merge steps while inherited denied connectors remain denied.
- Ticket and pack validation accept the new workflow and closeout metadata.

## Validation

- Automated:
  - `node tools/context/ctx.mjs lint --json`
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
  - `node tools/context/ctx.mjs tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json`
  - `node tools/context/ctx.mjs tools check --workflow workflow.pull-request-review --step pr-fix --capability tool.shell --json`
  - `node tools/context/ctx.mjs ticket check --json`
  - `node tools/context/ctx.mjs pack check --json`
- Smoke:
  - `git status --short --branch`
  - `gh --version`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: current-change
- Verification evidence:
  - `node --check tools/context/ctx.mjs`
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs spec check --json`
  - `node tools/context/ctx.mjs ticket check --json`
  - `node tools/context/ctx.mjs pack check --json`
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
  - `node tools/context/ctx.mjs tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json`
  - `node tools/context/ctx.mjs tools check --workflow workflow.pull-request-review --step pr-fix --capability tool.shell --json`
  - `git status --short --branch`
  - `gh --version`
  - `node tools/context/ctx.mjs lint --json` blocked on pre-existing section errors in `docs/context/architecture/public-name-generation-2026-07-05.md`.
- Follow-up tickets: none.
