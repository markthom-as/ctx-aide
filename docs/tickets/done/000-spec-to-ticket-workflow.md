---
id: ticket.context.000
status: done
title: Define high-effort spec to ticket workflow
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
    - skills/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Define high-effort spec to ticket workflow"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
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
  commit: 0ac461b
  completed_at: 2026-06-26
---

# Define High-Effort Spec to Ticket Workflow

## Outcome

Define the spec-to-ticket workflow that turns rough intent into hardened implementation-ready tickets.

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

- Status: done
- Commit: 0ac461b
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs spec check --json`
  - `make validate`
- Follow-up tickets: none
