---
id: ticket.context.008
status: needs-review
title: Define Idvisor repo-context plugin integration
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
parallel_group: idvisor-a
depends_on:
  - ticket.context.002
  - ticket.context.003
  - ticket.context.005
  - ticket.context.007
  - ticket.context.009
blocks:
  []
phase: 5
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
  task: "Define Idvisor repo-context plugin integration"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run workflow against fixture repo.
  smoke:
  - Create sample Idvisor workflow template.
  - Run workflow against fixture repo.
  - Confirm blocked states prevent dispatch.
  - Confirm ready tickets assign to Codex implementation runs.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Define Idvisor repo-context plugin integration

## Outcome

Define how repo-context runs as an Idvisor plugin or workflow pack while markdown remains source of truth.

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
  - Define repo-context plugin responsibilities versus `ctx`.
  - Add Idvisor workflow template for describe/spec/questions/harden/tickets/implementation/validation/report.
  - Define plugin commands for init, scan, harden, pack create/status, and dispatch.
  - Define concrete event, gate, lease, and progress-report expectations.
- Out:
  - Move app-specific context truth into Idvisor core.

## Acceptance Criteria

- Plugin treats target repo markdown as source of truth.
- Idvisor records workflow runs, gates, progress reports, and audit events.
- Initial implementation can shell out to `ctx` as governed local tool.
- Tickets dispatch only when ready.

## Validation

- Create sample Idvisor workflow template.
- Run workflow against fixture repo.
- Confirm blocked states prevent dispatch.
- Confirm ready tickets assign to Codex implementation runs.

## Implementation Notes

- Parallel group: `idvisor-a`.
- Dependencies: `ticket.context.002`, `ticket.context.003`, `ticket.context.005`, `ticket.context.007`, `ticket.context.009`.
- Expected commit message: `Define Idvisor repo context plugin`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.mjs idvisor workflow --json`
  - `node tools/context/ctx.mjs lint --json`
  - `make validate`
- Follow-up tickets: pending
