---
id: ticket.context.004
status: needs-review
title: Add lightweight component and design catalog
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
parallel_group: component-catalog-a
depends_on:
  - ticket.context.001
  - ticket.context.002
blocks:
  - ticket.context.006
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
  task: "Add lightweight component and design catalog"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - CLI component list/get tests.
  smoke:
  - CLI component list/get tests.
  - Visual smoke for catalog route if implemented.
  - Query test showing route pulls component context.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add lightweight component and design catalog

## Outcome

Create a repo-local inventory of reusable components, variants, composition rules, design tokens, examples, and anti-patterns.

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
  - Add component context entries under `docs/context/components/`.
  - Add design-system entries under `docs/context/design/`.
  - Add `ctx components list --json` and `ctx components get <id> --json`.
  - Optionally add local context-lab examples.
- Out:
  - Adopt full Storybook as a dependency.

## Acceptance Criteria

- Core components have ids, import paths, variants, and composition rules.
- Component entries include positive and negative rules.
- Agent queries for affected routes include relevant component contracts.

## Validation

- CLI component list/get tests.
- Visual smoke for catalog route if implemented.
- Query test showing route pulls component context.

## Implementation Notes

- Parallel group: `component-catalog-a`.
- Dependencies: `ticket.context.001`, `ticket.context.002`.
- Expected commit message: `Add component context catalog`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.mjs components list --json`
  - `node tools/context/ctx.mjs components get component.ContextEntryCard --json`
  - `node tools/context/ctx.mjs query --path docs/context/components/context-entry-card.md --task "component catalog design token" --agent codex --budget 1200 --json`
  - `make validate`
- Follow-up tickets: pending
