---
kind: milestone-run
id: run.ctx-aide-mvp
status: planning
ticket_pack: pack.ctx-aide-mvp
coordinator: codex
max_parallel_agents: 4
stale_after_minutes: 20
agents:
  ids:
    - agent.codex.cli-index-a
    - agent.codex.cli-bootstrap-a
stale_agents:
  ids: []
merge_queue:
  items: []
created: 2026-06-26
updated: 2026-06-26
---

# CTX Aide MVP Run

## Purpose

Coordinate long milestone-level work for `pack.ctx-aide-mvp` while keeping ticket commits atomic and reviewable.

## Agent Lanes

- `agent.codex.cli-index-a`: scan/query/index work.
- `agent.codex.cli-bootstrap-a`: bootstrap and daily tooling work.

## Lease Rules

- Each active agent records a heartbeat at least every 20 minutes.
- A stale agent is inspected before requeueing work.
- Useful work is salvaged as a commit or patch before cleanup.

## Merge Queue

- Coordinator merges ticket commits one at a time.
- Shared files include `README.md`, `tools/ctx-aide/ctx-aide.mjs`, generated context packs, and ticket pack metadata.
- Pack validation: pending until all ticket commits are merged and `make validate` passes.

## Cleanup Log

- No stale-agent cleanup has been required for the initial local implementation run.
