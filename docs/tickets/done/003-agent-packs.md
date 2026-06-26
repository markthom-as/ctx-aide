---
id: ticket.context.003
status: done
title: Generate Codex Claude and Cursor context packs
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
parallel_group: agent-packs-a
depends_on:
  - ticket.context.002
blocks:
  []
phase: 2
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
  task: "Generate Codex Claude and Cursor context packs"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run exports from clean markdown source.
  smoke:
  - Run exports from clean markdown source.
  - Confirm deterministic outputs.
  - Confirm lint fails after source mutation and passes after regeneration.
  screenshots: []
completion:
  commit: 0147ebc
  completed_at: 2026-06-26
---

# Generate Codex Claude and Cursor context packs

## Outcome

Generate agent-specific context packs without maintaining divergent instructions by hand.

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
  - Add `ctx export-agent --agent codex`.
  - Add `ctx export-agent --agent claude`.
  - Add `ctx export-agent --agent cursor`.
  - Add generated `.cursor/rules/generated/*.mdc` summaries.
- Out:
  - Implement Idvisor plugin orchestration.

## Acceptance Criteria

- Codex pack emphasizes ticket hydration and implementation-time context queries.
- Claude pack emphasizes design intent and critique checklists.
- Cursor rules are summary-oriented.
- Generated packs include source manifest hash.

## Validation

- Run exports from clean markdown source.
- Confirm deterministic outputs.
- Confirm lint fails after source mutation and passes after regeneration.

## Implementation Notes

- Parallel group: `agent-packs-a`.
- Dependencies: `ticket.context.002`.
- Expected commit message: `Generate agent context packs`.

## Completion

- Status: done
- Commit: 0147ebc
- Verification evidence:
  - `node tools/context/ctx.mjs export-agent --agent codex --json`
  - `node tools/context/ctx.mjs export-agent --agent claude --json`
  - `node tools/context/ctx.mjs export-agent --agent cursor --json`
  - `make validate`
- Follow-up tickets: none
