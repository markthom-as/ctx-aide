---
id: ticket.context.050
status: done
title: Add pull request review runbook and templates
ticket_pack: pack.pull-request-review-usability-2026-07-05
milestones:
  - milestone.repo-context-pr-review-usability
source_spec: spec.pull-request-review-workflow-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: docs
depends_on:
  - ticket.context.049
blocks:
  - ticket.context.051
scope:
  routes: []
  files:
    - docs/workflows/pull-request-review.md
    - docs/workflows/pull-request-review-runbook.md
    - docs/workflows/pull-request-review-templates.md
  directories:
    - docs/ticket-packs
    - docs/tickets
  components: []
  flows:
    - workflow.pull-request-review
context_query:
  task: "add pull request review runbook and templates"
  generated_at: 2026-07-05
  context_ids:
    - workflow.pull-request-review
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-05
---

# Add Pull Request Review Runbook And Templates

## Outcome

Add copy-paste PR review commands and reusable review body templates so agents can use the workflow immediately without inventing comment structure.

## Context

`ticket.context.049` created the workflow contract. The next usability gap is a concrete command sequence and review body templates for the common paths.

## Positive Rules

- Keep commands shell-copyable and parameterized with clear placeholders.
- Preserve the `git`/`gh` command-line workflow.
- Include closeout evidence fields that map back to ticket completion.

## Negative Rules

- Do not require live GitHub access to read the docs.
- Do not add hosted services or connector-only flows.
- Do not imply merge is allowed when checks or reviews are unresolved.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision: runbook and templates live as workflow markdown so they are validated with the rest of the workflow surface.
- Rationale: agents already discover workflow docs under `docs/workflows`.

## Implementation Rules

- Required approach: add docs only, plus pack/ticket metadata for the next CLI ticket.
- Existing components/helpers to use: workflow markdown validation and ticket/pack checks.
- Anti-patterns to avoid: broad CLI changes in this docs ticket.
- Stop and escalate if: line-comment automation requires a live GitHub API design decision.

## Scope

- In: runbook, templates, active usability pack, and ready preflight ticket.
- Out: implementing the preflight command.

## Acceptance Criteria

- Runbook includes orient, checkout, review, comment, fix, re-review, merge, and closeout commands.
- Templates cover summary comment, request changes, approval, fix closeout, merge closeout, and line-comment fallback.
- Pack and ticket checks accept the new docs.

## Validation

- Automated:
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
  - `node tools/context/ctx.mjs ticket check --json`
  - `node tools/context/ctx.mjs pack check --json`
- Smoke: none.
- Screenshots: none.

## Completion

- Status: done
- Commit: current-change
- Verification evidence:
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.pull-request-review --repo . --json`
  - `node tools/context/ctx.mjs ticket check --json`
  - `node tools/context/ctx.mjs pack check --json`
- Follow-up tickets: `ticket.context.051`.
