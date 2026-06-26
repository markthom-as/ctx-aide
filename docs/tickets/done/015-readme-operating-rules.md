---
id: ticket.context.015
status: done
title: Document agent operating rules in README
ticket_pack: pack.repo-context-readme-operating-rules
milestones:
  - milestone.repo-context-docs-maintenance
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: docs-a
depends_on: []
blocks: []
phase: 1
scope:
  routes: []
  files:
    - README.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.spec-to-ticket
context_query:
  task: "Document agent operating rules in README"
  generated_at: 2026-06-26
  context_ids:
    - spec.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - Run `make validate`.
  smoke:
    - Confirm README includes parallel planning, markdown tickets, per-ticket commits, infrastructure cost gating, and Semble-first search.
  screenshots: []
completion:
  commit: docs-operating-rules-change
  completed_at: 2026-06-26
---

# Document Agent Operating Rules in README

## Outcome

Add the agent workflow rules to the README as durable project documentation.

## Context

The user provided updated `AGENTS.md` instructions covering parallel execution, markdown tickets, per-ticket commits, cost review for paid infrastructure, and Semble-first code search. The README is the repo-level entrypoint for the context system, so it should preserve those rules.

## Positive Rules

- Preserve markdown as the source of truth.
- Keep the README aligned with agent workflow contracts.
- Prefer concise operational rules that agents can follow directly.

## Negative Rules

- Do not change CLI behavior for this documentation ticket.
- Avoid expanding this into a broader rewrite.
- Stop and escalate if documenting the rule would conflict with existing ticket or pack invariants.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- The README should document the user-provided operating rules.
- Semble should be documented as the default semantic discovery path when target files are unknown.
- Paid infrastructure changes require a cost delta estimate before implementation.

## Implementation Rules

- Required approach: add a dedicated README section and tighten the existing Semble discovery text.
- Existing components/helpers to use: reuse the canonical ticket and pack structure.
- Anti-patterns to avoid: new CLI behavior, unrelated template changes, and broad README restructuring.
- Stop and escalate if: the README change requires changing validation rules.

## Scope

- In:
  - README operating rules.
  - README Semble wording.
  - Documentation ticket and pack metadata.
- Out:
  - CLI command changes.
  - Skill installer changes.
  - Hosted infrastructure.

## Acceptance Criteria

- README includes parallel execution guidance.
- README states markdown tickets and one clean commit per completed ticket.
- README includes paid infrastructure cost gating.
- README includes Semble-first search and `uvx --from "semble[mcp]" semble` fallback.

## Validation

- Run `make validate`.
- Confirm the new README text is present.

## Implementation Notes

- Parallel group: `docs-a`.
- Dependencies: none.
- Expected commit message: `Document README agent operating rules`.

## Completion

- Status: done
- Commit: docs-operating-rules-change
- Verification evidence:
  - `make validate`
- Follow-up tickets: none
