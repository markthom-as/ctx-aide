---
id: ticket.context.016
status: done
title: Add Astrotechne adoption profile
ticket_pack: pack.repo-context-astrotechne-adoption
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
    - tools/context/ctx.mjs
    - docs/workflows/astrotechne-adoption.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.spec-to-ticket
context_query:
  task: "Add Astrotechne adoption profile"
  generated_at: 2026-06-26
  context_ids:
    - spec.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - Run `make validate`.
    - Run `node tools/context/ctx.mjs customize --profile astrotechne --dry-run --json`.
  smoke:
    - Confirm README describes Astrotechne overlay adoption.
  screenshots: []
completion:
  commit: astrotechne-adoption-profile-change
  completed_at: 2026-06-26
---

# Add Astrotechne Adoption Profile

## Outcome

Make repo-context ready to start as an overlay for Astrotechne's existing ticket and packet workflow.

## Context

Astrotechne already has a mature markdown ticket tree, packet README convention, and `npm run tickets:status` validation command. Repo-context should learn from that workflow instead of requiring a disruptive historical-ticket migration.

## Positive Rules

- Preserve markdown as the source of truth.
- Treat Astrotechne's existing tickets as source material and workflow examples.
- Prefer read-only bootstrap and context capture before schema normalization.

## Negative Rules

- Do not edit the Astrotechne repository in this ticket.
- Do not require migration of historical Astrotechne tickets.
- Stop and harden if implementation requires changing repo-context status invariants.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Astrotechne adoption should be an overlay first.
- Existing Astrotechne packet README and `npm run tickets:status` conventions should be preserved.
- Legacy tickets should be indexed as references unless explicitly promoted.

## Implementation Rules

- Required approach: add a customization profile and documentation only.
- Existing components/helpers to use: reuse customization profile patterns and canonical ticket/pack structure.
- Anti-patterns to avoid: broad migration requirements and hidden status mapping.
- Stop and escalate if: adopting Astrotechne requires mutating paid infrastructure or production configuration.

## Scope

- In:
  - `astrotechne` customization profile.
  - README adoption guidance.
  - Workflow note with Astrotechne status mapping.
- Out:
  - Full legacy-ticket adapter implementation.
  - Astrotechne repo edits.

## Acceptance Criteria

- `ctx customize --profile astrotechne --dry-run --json` returns a valid profile.
- README documents the Astrotechne overlay adoption path.
- Workflow note captures Astrotechne ticket root, statuses, packet convention, and rollout steps.

## Validation

- Run `make validate`.
- Run `node tools/context/ctx.mjs customize --profile astrotechne --dry-run --json`.

## Implementation Notes

- Parallel group: `docs-a`.
- Dependencies: none.
- Expected commit message: `Add Astrotechne adoption profile`.

## Completion

- Status: done
- Commit: astrotechne-adoption-profile-change
- Verification evidence:
  - `make validate`
  - `node tools/context/ctx.mjs customize --profile astrotechne --dry-run --json`
- Follow-up tickets:
  - Legacy ticket adapter.
  - Completion metadata finalizer.
