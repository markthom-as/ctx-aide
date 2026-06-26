---
id: ticket.context.000
status: needs-review
title: Define high-effort spec to ticket workflow
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
parallel_group: planning-a
depends_on:
  []
blocks:
  - ticket.context.001
  - ticket.context.005
phase: 0
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
  task: "Define high-effort spec to ticket workflow"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  []
  smoke:
  - Review README workflow sections.
  - Create at least one sample spec in a fixture or follow-up ticket.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Define High-Effort Spec to Ticket Workflow

## Outcome

Define the spec-to-ticket workflow that turns rough intent into hardened implementation-ready tickets.

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
  - Define `docs/specs/` conventions and spec sections.
  - Document question-pass and hardening rules.
  - Define Codex and Claude planning roles.
- Out:
  - Implement CLI commands.
  - Create production app context entries.

## Acceptance Criteria

- Specs distinguish assumptions, frozen decisions, open questions, and blockers.
- Question passes only ask about gaps that change implementation behavior.
- Tickets generated from a hardened spec can be implemented without design decisions.

## Validation

- Review README workflow sections.
- Create at least one sample spec in a fixture or follow-up ticket.

## Implementation Notes

- Parallel group: `planning-a`.
- Dependencies: none.
- Expected commit message: `Define spec to ticket workflow`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.mjs spec check --json`
  - `make validate`
- Follow-up tickets: pending
