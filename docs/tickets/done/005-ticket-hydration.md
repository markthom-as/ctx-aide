---
id: ticket.context.005
status: done
title: Hydrate markdown tickets with scoped context
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
parallel_group: ticketing-a
depends_on:
  - ticket.context.002
  - ticket.context.007
blocks:
  - ticket.context.006
  - ticket.context.008
phase: 3
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
  task: "Hydrate markdown tickets with scoped context"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run ticket check before and after completion metadata is filled.
  smoke:
  - Create a ticket from example feedback.
  - Hydrate it with route/component/design context.
  - Run ticket check before and after completion metadata is filled.
  screenshots: []
completion:
  commit: 1abf9c1
  completed_at: 2026-06-26
---

# Hydrate markdown tickets with scoped context

## Outcome

Ensure each implementation ticket starts with relevant context ids, rules, decisions, scope, and validation requirements.

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
  - Add `ctxa ticket create --from-feedback <id> --json`.
  - Add `ctxa ticket hydrate <ticket-path> --agent codex --json`.
  - Add `ctxa ticket check --json`.
  - Populate canonical ticket fields from query results.
- Out:
  - Implement code changes from hydrated tickets.

## Acceptance Criteria

- Tickets include context snapshots generated from `ctxa query`.
- Tickets preserve source ids rather than untraceable prose only.
- Ticket check fails on missing or stale context ids.
- Completion records final commit hash.

## Validation

- Create a ticket from example feedback.
- Hydrate it with route/component/design context.
- Run ticket check before and after completion metadata is filled.

## Implementation Notes

- Parallel group: `ticketing-a`.
- Dependencies: `ticket.context.002`, `ticket.context.007`.
- Expected commit message: `Hydrate tickets with ctxa context`.

## Completion

- Status: done
- Commit: 1abf9c1
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs ticket hydrate docs/tickets/done/005-ticket-hydration.md --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `make validate`
- Follow-up tickets: none
