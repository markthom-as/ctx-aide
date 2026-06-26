---
id: ticket.context.011
status: needs-review
title: Add daily usability tooling
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
parallel_group: tooling-a
depends_on:
  - ticket.context.000
blocks:
  []
phase: 1
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
  task: "Add daily usability tooling"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run `make validate`.
  - Run skill validator.
  - Run `node tools/context/ctx.mjs lint --json`.
  smoke:
  - Run `make validate`.
  - Run skill validator.
  - Run `node tools/context/ctx.mjs lint --json`.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add Daily Usability Tooling

## Outcome

Make the repo usable every day with validation, skill install, and smoke commands.

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
  - Add `make validate`.
  - Add `make install-skill`.
  - Add fixture smoke command.
  - Ensure skill validation is part of daily validation.
- Out:
  - Implement full `ctx query` ranking.

## Acceptance Criteria

- A clean checkout can run `make validate`.
- The Codex skill can be installed into `~/.codex/skills`.
- Validation fails on malformed canonical tickets or packs.

## Validation

- Run `make validate`.
- Run skill validator.
- Run `node tools/context/ctx.mjs lint --json`.

## Implementation Notes

- Parallel group: `tooling-a`.
- Dependencies: `ticket.context.000`.
- Expected commit message: `Add daily usability tooling`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `make validate`
  - `make smoke`
  - `node tools/context/ctx.mjs doctor --json`
- Follow-up tickets: pending
