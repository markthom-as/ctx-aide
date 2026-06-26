---
id: ticket.context.025
status: ready
title: Make validation plan readiness truthful
ticket_pack: pack.repo-context-staff-review-hardening-2026-06-26
milestones:
  - milestone.repo-context-staff-review-hardening
source_spec: spec.staff-review-hardening-2026-06-26
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: validation-truth
depends_on:
  - ticket.context.024
blocks:
  - ticket.context.026
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - docs/workflows/browser-validation.md
  directories: []
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "make validation-plan readiness truthful"
  generated_at: 2026-06-26
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Make Validation Plan Readiness Truthful

## Outcome

Ensure workflow validation plans fail clearly when required views or matrix entries are not ready.

## Context

A review gate that emits `ok: true` while its required validation matrix is unready creates false confidence.

## Positive Rules

- Keep validation-plan output useful for planning and CI gating.
- Return structured errors for every unready required view.
- Preserve the existing matrix output so callers can see exactly what is blocked.

## Negative Rules

- Do not hide credential readiness failures behind a green top-level status.
- Do not remove `workflow views`; validation-plan should complement it.
- Stop and escalate if a workflow needs optional views that should not gate readiness.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Validation-plan is allowed to be a CI gate.
- Required workflow views must be ready for validation-plan to report `ok: true`.
- Matrix and error output should both be present when a plan is blocked.

## Implementation Rules

- Required approach: adjust readiness semantics and add fixture coverage.
- Existing components/helpers to use: `workflowViewRows`, validation-plan matrix generation, and fixture credential setup.
- Anti-patterns to avoid: changing credentials storage behavior.
- Stop and escalate if: the CLI needs a new concept of optional validation views.

## Scope

- In: validation-plan status semantics, readiness errors, tests, docs if needed.
- Out: browser automation implementation, credential import redesign.

## Acceptance Criteria

- Missing credentials for a required logged-in view make validation-plan return `ok: false`.
- Output still includes the matrix, view readiness, and blocking error details.
- Existing ready validation-plan tests continue to pass.

## Validation

- Automated: `node tools/context/ctx.test.mjs`.
- Smoke: `node tools/context/ctx.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`.
- Screenshots: none.

## Implementation Notes

This ticket intentionally makes a stricter gate; any caller that wants planning-only output can still inspect the JSON payload.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: none.
