---
id: ticket.context.038
status: done
title: Generate rules and axioms from feedback
ticket_pack: pack.feedback-rule-axiom-generation-2026-06-28
milestones:
  - milestone.repo-context-feedback-review
source_spec: spec.feedback-rule-axiom-generation-2026-06-28
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
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - docs/workflows/feedback-review.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - workflow.feedback-review
context_query:
  task: "Generate rules and axioms from feedback"
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
    - node tools/context/ctx.test.mjs
  smoke:
    - node tools/context/ctx.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json
  screenshots: []
completion:
  commit: feedback-rule-axiom-generation-change
  completed_at: 2026-06-28
---

# Generate Rules and Axioms From Feedback

## Outcome

Make feedback planning, capture, and promotion suggest positive rules, negative rules, and axioms when user feedback encodes durable constraints.

## Context

Feedback can be a one-off implementation request or a reusable operating rule. The workflow should preserve that distinction and surface candidates for user confirmation.

## Positive Rules

- Preserve positive and negative rule polarity.
- Generate `axiom.feedback.*` candidates only from durable wording.
- Carry rule and axiom candidates into captured feedback and promoted follow-up tickets.

## Negative Rules

- Do not silently accept generated rules as global policy.
- Do not generate axioms from every casual feedback sentence.
- Do not hide rule candidates in prose-only output.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.feedback-review-promotes-actionable-work`: Operator feedback becomes either acceptance criteria or follow-up tickets.

## Frozen Decisions

- Durable wording detector includes terms like `always`, `never`, `must`, `do not`, and `should not`.
- Candidate axiom ids use the `axiom.feedback.*` namespace.
- Generated candidates require normal user/agent confirmation before becoming accepted context.

## Implementation Rules

- Required approach: add bounded candidate generation to feedback plan, capture, and promote.
- Existing components/helpers to use: feedback planner, title/slug helpers, and ticket markdown generator.
- Anti-patterns to avoid: external LLM dependency inside the CLI and global-policy mutation.
- Stop and escalate if: generated rules need to modify repository-wide policy automatically.

## Scope

- In:
  - Candidate rules and axioms in feedback planning.
  - Candidate rules and axioms in captured feedback markdown.
  - Candidate rules and axioms in generated follow-up tickets.
  - Tests and workflow docs.
- Out:
  - Automatically editing generated agent packs.
  - Automatically accepting candidate rules in context entries.

## Acceptance Criteria

- `ctx feedback plan` returns candidate rules and `axiom.feedback.*` ids for durable wording.
- `ctx feedback capture` writes a Suggested Rules and Axioms section.
- `ctx feedback promote --mode follow-up-ticket` carries candidates into ticket Positive Rules, Negative Rules, and Axioms.
- Existing feedback commands remain JSON-first and write only with `--write`.

## Validation

- Automated:
  - `make validate`
  - `node tools/context/ctx.test.mjs`
- Smoke:
  - `node tools/context/ctx.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: feedback-rule-axiom-generation-change
- Verification evidence:
  - `make validate`
  - `node tools/context/ctx.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json`
- Follow-up tickets:
  - Consider a later command to accept selected `axiom.feedback.*` candidates into scoped context entries.
