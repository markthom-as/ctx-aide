---
id: ticket.context.037
status: done
title: Add feedback decomposition planning
ticket_pack: pack.feedback-decomposition-2026-06-28
milestones:
  - milestone.ctx-aide-feedback-review
source_spec: spec.feedback-decomposition-2026-06-28
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
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - workflow.feedback-review
context_query:
  task: "Add feedback decomposition planning"
  generated_at: 2026-06-28
  context_ids:
    - workflow.feedback-review
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.feedback-review-promotes-actionable-work
validation:
  automated:
    - make validate
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json
  screenshots: []
completion:
  commit: feedback-decomposition-change
  completed_at: 2026-06-28
---

# Add Feedback Decomposition Planning

## Outcome

Add a no-write feedback planning command so agents can split a natural response into multiple ticket or acceptance-criteria candidates before creating durable markdown.

## Context

Operators often give several separate feedback points in one chat response. The workflow should preserve that natural chat UX while still producing atomic follow-up work.

## Positive Rules

- Split natural feedback into distinct points before promotion.
- Suggest ticket titles, promotion modes, and clarification prompts.
- Split mixed points again when they combine separate concerns.
- Include decomposition metadata when feedback is captured directly.

## Negative Rules

- Do not force the operator to pre-format feedback.
- Do not create broad tickets from mixed feedback when subpoints are obvious.
- Do not ask blank-ended questions when a suggested path can be offered.
- Do not perform writes from the planning command.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.feedback-review-promotes-actionable-work`: Operator feedback becomes either acceptance criteria or follow-up tickets.

## Frozen Decisions

- Command: `ctxa feedback plan`.
- Mutation boundary: planning is read-only; capture and promote still require `--write`.
- Agent behavior: ask clarifying questions with suggested interpretations before implementation when the plan is ambiguous.

## Implementation Rules

- Required approach: add a bounded heuristic planner for agent consumption.
- Existing components/helpers to use: feedback clarification helper, slug/title helpers, and fixture tests.
- Anti-patterns to avoid: LLM dependency inside the CLI, interactive prompts, and hidden ticket writes.
- Stop and escalate if: planning requires external services.

## Scope

- In:
  - No-write `ctxa feedback plan`.
  - Split metadata in `ctxa feedback capture`.
  - Feedback workflow documentation.
  - Tests for multi-point feedback and further-split suggestions.
- Out:
  - Automatic batch creation of all tickets without agent review.
  - Hosted UI.

## Acceptance Criteria

- `ctxa feedback plan` splits bullet-list feedback into separate points.
- The plan suggests promotion modes and ticket titles.
- The plan flags mixed points for further splitting.
- The plan includes suggested user prompts for clarification.
- `ctxa feedback capture` returns decomposition metadata.

## Validation

- Automated:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: feedback-decomposition-change
- Verification evidence:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json`
- Follow-up tickets:
  - Consider a batch promote command only after the agent-reviewed split plan proves useful.
