---
id: ticket.context.036
status: done
title: Add feedback review workflow
ticket_pack: pack.feedback-review-workflow-2026-06-28
milestones:
  - milestone.ctx-aide-feedback-review
source_spec: spec.feedback-review-workflow-2026-06-28
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/workflows/feedback-review.md
    - docs/workflows/spec-to-ticket.md
    - docs/workflows/browser-validation.md
  directories:
    - docs/context/feedback
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - workflow.feedback-review
context_query:
  task: "Add feedback review workflow"
  generated_at: 2026-06-28
  context_ids:
    - workflow.spec-to-ticket
    - workflow.browser-validation
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.feedback-review-promotes-actionable-work
validation:
  automated:
    - make validate
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json
  screenshots: []
completion:
  commit: feedback-review-workflow-change
  completed_at: 2026-06-28
---

# Add Feedback Review Workflow

## Outcome

Add a guided ticket feedback lifecycle that can show review context, capture feedback as markdown, and promote that feedback into follow-up tickets or acceptance criteria.

## Context

The existing lifecycle already has specs, tickets, ticket packs, browser validation matrices, screenshot paths, and feedback context entries. The missing workflow is the bridge from screenshot review to structured ticket changes.

## Positive Rules

- Preserve markdown as the canonical feedback and ticket source.
- Use JSON output for review packets and promotion commands.
- Include URL, scoped files, changed files, screenshot size, and image dimensions in review context.
- Ask clarifying questions when feedback lacks enough detail for implementation.

## Negative Rules

- Do not require an interactive prompt for agent-facing commands.
- Do not upload screenshots or inspect browser credentials.
- Do not mark ambiguous feedback as implementation-ready.
- Do not hide follow-up work outside the ticket lifecycle.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.feedback-review-promotes-actionable-work`: Operator feedback becomes either acceptance criteria or follow-up tickets.

## Frozen Decisions

- Command namespace: `ctxa feedback`.
- Feedback source of truth: `docs/context/feedback/`.
- Promotion modes: `acceptance-criteria` and `follow-up-ticket`.
- Follow-up tickets start in a non-done status and must be hardened before implementation when clarifying questions remain.

## Implementation Rules

- Required approach: add non-interactive CLI commands and fixture coverage.
- Existing components/helpers to use: ticket parsing, context feedback validation, write-path safety, git status summary, and workflow docs.
- Anti-patterns to avoid: prompts, hidden global state, hosted infrastructure, and direct screenshot content mutation.
- Stop and escalate if: the command design requires a paid hosted review surface.

## Scope

- In:
  - `ctxa feedback review`
  - `ctxa feedback capture`
  - `ctxa feedback promote`
  - Workflow docs and command usage.
  - Fixture tests for capture and promotion.
- Out:
  - A visual review UI.
  - Running browser tests.
  - Committing local screenshot artifacts.

## Acceptance Criteria

- Review packets include ticket metadata, URL, scoped files, changed files, and screenshot metadata.
- Captured feedback writes a valid `kind: feedback` context entry.
- Acceptance-criteria promotion appends a concrete criterion to the target ticket.
- Follow-up promotion creates a canonical ticket outside `done`.
- Ambiguous feedback returns clarifying questions.

## Validation

- Automated:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: feedback-review-workflow-change
- Verification evidence:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json`
- Follow-up tickets:
  - Build an interactive TUI or browser-hosted review surface on top of the JSON commands if needed.
