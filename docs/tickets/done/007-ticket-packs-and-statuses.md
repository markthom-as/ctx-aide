---
id: ticket.context.007
status: done
title: Add canonical ticket statuses and ticket packs
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
parallel_group: ticketing-b
depends_on:
  - ticket.context.005
blocks:
  - ticket.context.009
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
  task: "Add canonical ticket statuses and ticket packs"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run `ctx-aide ticket check --json` and `ctx-aide pack check --json`.
  smoke:
  - Create one sample pack with at least three tickets.
  - Include parallel and dependent tickets.
  - Run `ctx-aide ticket check --json` and `ctx-aide pack check --json`.
  screenshots: []
completion:
  commit: e3d72ee
  completed_at: 2026-06-26
---

# Add canonical ticket statuses and ticket packs

## Outcome

Introduce canonical ticket template, fixed statuses, and ticket packs for milestone-shaped work.

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
  - Maintain `docs/tickets/templates/canonical-ticket.md`.
  - Maintain `docs/ticket-packs/` structure and template.
  - Add fixed ticket and pack status vocabularies.
  - Add pack membership fields to generated tickets.
  - Add `ctx-aide pack check --json`.
- Out:
  - Implement Idvisor plugin dispatch.

## Acceptance Criteria

- Every ticket has status, pack, milestone, parallel group, validation plan, and completion metadata.
- Packs can contain tickets from one or more milestones.
- Packs describe parallel groups, dependencies, shared-file coordination, and validation.

## Validation

- Create one sample pack with at least three tickets.
- Include parallel and dependent tickets.
- Run `ctx-aide ticket check --json` and `ctx-aide pack check --json`.

## Implementation Notes

- Parallel group: `ticketing-b`.
- Dependencies: `ticket.context.005`.
- Expected commit message: `Add canonical ticket packs and statuses`.

## Completion

- Status: done
- Commit: e3d72ee
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-mvp --json`
  - `make validate`
- Follow-up tickets: none
