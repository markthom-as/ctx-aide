---
id: ticket.context.006
status: done
title: Add impact and regression checks
ticket_pack: pack.ctx-aide-mvp
milestones:
  - milestone.ctx-aide-mvp
source_spec: spec.ctx-aide-mvp
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
    - skills/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Add impact and regression checks"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
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
  commit: 8dc9b97
  completed_at: 2026-06-26
---

# Add impact and regression checks

## Outcome

Show affected routes, components, flows, feedback, and design rules for proposed changes.

## Context

This ticket is part of `pack.ctx-aide-mvp` and is scoped to the ctx-aide MVP dogfood milestone. Use the README, templates, and ctx-aide skill as source context before implementation.

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
  - Add `ctxa impact --path <file> --json`.
  - Add `ctx-aide changed-context --base main --json`.
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

- Status: done
- Commit: 8dc9b97
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs impact --path docs/context/components/context-entry-card.md --json`
  - `node tools/ctx-aide/ctx-aide.mjs impact --path tools/ctx-aide/ctx-aide.mjs --json`
  - `make validate`
- Follow-up tickets: none
