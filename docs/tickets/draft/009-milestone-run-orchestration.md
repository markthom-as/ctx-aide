---
id: ticket.context.009
status: draft
title: Add milestone run orchestration
phase: 4
depends_on:
  - ticket.context.007
---

# Add Milestone Run Orchestration

## Goal

Support long milestone-level runs with parallel agents, worktree isolation, agent leases, heartbeats, stale-agent detection, dead-agent cleanup, merge queues, and pack-level validation.

## Scope

- Add `docs/runs/` conventions for repo-local milestone run state.
- Add run statuses and agent lease statuses.
- Add run frontmatter and markdown template.
- Extend ticket packs with run policy fields.
- Define coordinator-owned merge queue behavior.
- Define stale-agent recovery and cleanup behavior.
- Define command surface for run start, status, assign, heartbeat, stale, recover, requeue, merge-next, validate, and finish.
- Define when Idvisor should own the durable run truth instead of markdown.

## Acceptance Criteria

- A pack can declare max parallel agents, stale lease threshold, worktree strategy, and merge strategy.
- A milestone run records active agents, assigned tickets, worktrees, branches, lease expiry, last heartbeat, merge queue, blocked tickets, and completed tickets.
- Stale agents can be detected without guessing from prose.
- Dead-agent cleanup requires an explicit salvage, preserve-patch, requeue, discard, or block decision.
- Parallel agents do not merge directly into the main branch.
- Pack-level validation runs after ticket branches merge.

## Verification

- Create a sample run for a pack with three tickets and two parallel agents.
- Mark one agent stale and demonstrate the required recovery fields.
- Requeue one ticket after preserving the stale worktree state.
- Add one ticket to the merge queue and show pack validation remains pending.

## Commit

One commit when complete: `Add milestone run orchestration`
