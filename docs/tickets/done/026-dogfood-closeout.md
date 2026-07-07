---
id: ticket.context.026
status: done
title: Close the staff review dogfood path
ticket_pack: pack.ctx-aide-staff-review-hardening-2026-06-26
milestones:
  - milestone.ctx-aide-staff-review-hardening
source_spec: spec.staff-review-hardening-2026-06-26
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: dogfood-closeout
depends_on:
  - ticket.context.024
  - ticket.context.025
blocks: []
scope:
  routes: []
  files:
    - README.md
    - docs/ticket-packs/done/staff-review-hardening-2026-06-26.md
    - docs/tickets/done/026-dogfood-closeout.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "close staff review dogfood path"
  generated_at: 2026-06-26
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - make validate
    - make smoke
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-staff-review-hardening-2026-06-26 --json
  smoke: []
  screenshots: []
completion:
  commit: staff-review-dogfood-closeout
  completed_at: 2026-06-26
---

# Close the Staff Review Dogfood Path

## Outcome

Update the repo-facing evidence so the hardening run is inspectable as a complete milestone and ticket pack.

## Context

The ctx-aide dogfood flow requires context-aware tickets, validation evidence, and pack status metadata rather than chat-only claims.

## Positive Rules

- Record the three audit passes in markdown.
- Keep pack status consistent with ticket status.
- Run the full validation path before marking the pack complete.

## Negative Rules

- Do not mark the pack done before all tickets are done.
- Do not bury failed validation as a passing result.
- Stop and escalate if final validation requires paid infrastructure.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Final validation is local only and has zero infrastructure cost.
- The pack closeout commit may include README guidance and pack metadata.

## Implementation Rules

- Required approach: update docs and pack metadata after earlier tickets are committed.
- Existing components/helpers to use: `ctxa pack status`, `make validate`, and `make smoke`.
- Anti-patterns to avoid: a prose-only closeout without command evidence.
- Stop and escalate if: any hardening ticket remains open.

## Scope

- In: README guidance, pack metadata, ticket completion metadata.
- Out: new CLI features unrelated to this hardening run.

## Acceptance Criteria

- README names the staff-review hardening gates.
- Pack status shows all three tickets done.
- `make validate` and `make smoke` pass.

## Validation

- Automated: `make validate`; `make smoke`; `ctxa pack status`.
- Smoke: inspect final git status and pack status output.
- Screenshots: none.

## Implementation Notes

This ticket should be the final commit in the hardening pack.

## Completion

- Status: done
- Commit: staff-review-dogfood-closeout
- Verification evidence:
  - `make validate`
  - `make smoke`
  - `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-staff-review-hardening-2026-06-26 --json`
- Follow-up tickets: none.
