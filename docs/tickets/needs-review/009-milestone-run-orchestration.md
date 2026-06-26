---
id: ticket.context.009
status: needs-review
title: Add milestone run orchestration
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
parallel_group: runs-a
depends_on:
  - ticket.context.007
blocks:
  - ticket.context.008
phase: 4
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
  task: "Add milestone run orchestration"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  []
  smoke:
  - Create sample run with three tickets and two agents.
  - Mark one agent stale and demonstrate recovery fields.
  - Requeue one ticket after preserving stale worktree state.
  - Show pack validation remains pending while merge queue has work.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add milestone run orchestration

## Outcome

Support long milestone-level runs with parallel agents, worktrees, leases, heartbeats, cleanup, merge queues, and validation.

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
  - Add `docs/runs/` conventions.
  - Add run statuses and lease statuses.
  - Add run frontmatter and markdown template.
  - Extend ticket packs with run policy fields.
  - Define coordinator merge queue behavior and stale-agent recovery.
- Out:
  - Implement hosted orchestration infrastructure.

## Acceptance Criteria

- Packs declare max parallel agents, stale threshold, worktree strategy, and merge strategy.
- Runs record agents, tickets, worktrees, branches, leases, heartbeat, merge queue, blocked tickets, and completed tickets.
- Dead-agent cleanup requires explicit salvage, preserve-patch, requeue, discard, or block decision.

## Validation

- Create sample run with three tickets and two agents.
- Mark one agent stale and demonstrate recovery fields.
- Requeue one ticket after preserving stale worktree state.
- Show pack validation remains pending while merge queue has work.

## Implementation Notes

- Parallel group: `runs-a`.
- Dependencies: `ticket.context.007`.
- Expected commit message: `Add milestone run orchestration`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.mjs run status docs/runs/repo-context-mvp.md --json`
  - `node tools/context/ctx.mjs lint --json`
  - `make validate`
- Follow-up tickets: pending
