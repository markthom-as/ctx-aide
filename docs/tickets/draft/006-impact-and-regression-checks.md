---
id: ticket.context.006
status: draft
title: Add impact and regression checks
ticket_pack: pack.repo-context-mvp
milestones:
  - milestone.repo-context-mvp
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
  - claude-high-effort
ui_review_agent: claude-high-effort
parallel_group: impact-a
depends_on:
  - ticket.context.002
  - ticket.context.004
  - ticket.context.005
blocks:
  []
phase: 4
scope:
  routes: []
  files: []
  directories:
    - docs
    - skills/repo-context
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Add impact and regression checks"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run changed-context against a synthetic branch.
  smoke:
  - Test impact output for route, shared component, and design-token changes.
  - Run changed-context against a synthetic branch.
  - Confirm CI command works from clean checkout.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add impact and regression checks

## Outcome

Show affected routes, components, flows, feedback, and design rules for proposed changes.

## Context

This ticket is part of `pack.repo-context-mvp` and is scoped to the repo-context MVP dogfood milestone. Use the README, templates, and repo-context skill as source context before implementation.

## Positive Rules

- Preserve markdown as the source of truth.
- Keep outputs deterministic and reviewable in git.
- Prefer small, independently committable changes.

## Negative Rules

- Do not make SQLite the canonical authoring surface.
- Do not flatten positive and negative rules into undifferentiated guidance.
- Stop and harden this ticket if implementation requires a product, architecture, security, or workflow decision not captured here.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate.

## Frozen Decisions

- Codex is the default implementation agent.
- Claude is preferred for UI/design audit passes.
- Ticket completion requires validation evidence and a commit hash.

## Implementation Rules

- Required approach: implement only the scope listed in this ticket.
- Existing components/helpers to use: reuse the canonical ticket and pack templates.
- Anti-patterns to avoid: broad rewrites, undocumented status changes, and unbounded generated context.
- Stop and escalate if: this ticket conflicts with the pack plan or requires changing status vocabulary.

## Scope

- In:
  - Add `ctx impact --path <file> --json`.
  - Add `ctx changed-context --base main --json`.
  - Generate PR or ticket summaries listing affected context ids.
  - Add CI checks for malformed or stale context.
- Out:
  - Replace project test suites.

## Acceptance Criteria

- Impact output is bounded and parseable.
- Changed files map to affected context ids.
- CI can fail without network access.
- PR summaries list context ids reviewers should inspect.

## Validation

- Test impact output for route, shared component, and design-token changes.
- Run changed-context against a synthetic branch.
- Confirm CI command works from clean checkout.

## Implementation Notes

- Parallel group: `impact-a`.
- Dependencies: `ticket.context.002`, `ticket.context.004`, `ticket.context.005`.
- Expected commit message: `Add context impact checks`.

## Completion

- Status: draft
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: pending
