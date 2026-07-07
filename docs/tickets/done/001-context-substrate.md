---
id: ticket.context.001
status: done
title: Add repo-local context markdown substrate
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
parallel_group: substrate-a
depends_on:
  - ticket.context.000
blocks:
  - ticket.context.002
  - ticket.context.004
phase: 1
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
  task: "Add repo-local context markdown substrate"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run `node tools/ctx-aide/ctx-aide.mjs lint --json`.
  smoke:
  - Run `node tools/ctx-aide/ctx-aide.mjs lint --json`.
  - Review example entries against README schema.
  screenshots: []
completion:
  commit: 408b8b1
  completed_at: 2026-06-26
---

# Add Repo-Local Context Markdown Substrate

## Outcome

Create the committed markdown structure for route, file, directory, component, flow, design, architecture, and feedback context.

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
  - Add `docs/context/` directory structure.
  - Add schemas for context and feedback entries.
  - Add examples for one route, component, flow, and feedback item.
- Out:
  - Implement SQLite indexing.
  - Implement agent-pack export.

## Acceptance Criteria

- Context files use stable ids and frontmatter.
- Feedback entries include status, severity, source, and `applies_to`.
- Markdown remains source of truth and SQLite remains generated.

## Validation

- Run `node tools/ctx-aide/ctx-aide.mjs lint --json`.
- Review example entries against README schema.

## Implementation Notes

- Parallel group: `substrate-a`.
- Dependencies: `ticket.context.000`.
- Expected commit message: `Add ctx-aide markdown substrate`.

## Completion

- Status: done
- Commit: 408b8b1
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs lint --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- Follow-up tickets: none
