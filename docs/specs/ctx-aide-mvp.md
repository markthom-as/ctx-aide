---
id: spec.ctx-aide-mvp
status: draft
title: CTX Aide MVP
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.spec-to-ticket
  - flow.ticket-pack-execution
target_agents:
  spec:
    - codex-high-effort
    - claude-high-effort
  ui_design_review: claude-high-effort
  implementation: codex
created: 2026-06-25
---

# CTX Aide MVP

## Goal

Create a repo-local context system that uses markdown as the canonical source of truth, supports generated indexes and agent packs, and produces atomic implementation tickets that can be executed without design decisions.

## Affected Surfaces

- Routes: none for v0.1.
- Files/directories: `README.md`, `AGENTS.md`, `docs/context`, `docs/specs`, `docs/tickets`, `docs/ticket-packs`, `docs/runs`, `tools/ctx-aide`, `skills/ctx-aide`.
- Components: lightweight component catalog documentation only.
- Flows: spec hardening, ticket hardening, ticket pack execution, context discovery, future-work capture.
- Design-system areas: component and token catalog conventions.

## Existing Context

The initial repository is intentionally self-hosting. Its README, templates, tickets, ticket packs, future-work notes, validator, and Codex skill are the first fixture set for daily use.

## Product Decisions

- Decision: markdown remains canonical; SQLite and generated packs are rebuildable artifacts.
- Decision: tickets belong to packs and stay atomic enough for separate commits and parallel work where practical.
- Decision: context must be loaded explicitly by route, file, directory, component, flow, query, or ticket scope.
- Regression risk: unvalidated markdown drift could make agents load stale or contradictory instructions.

## Architecture Decisions

- Decision: ship a dependency-free Node CLI first, with SQLite/index generation as implementation work.
- Decision: keep Semble as an optional discovery backend with `uvx` fallback.
- Decision: dogfood the workflow in this repository before extracting an Idvisor plugin.
- Rejected alternatives: hosted-first context service, SQLite as the authoring source of truth, and mandatory Storybook adoption for v0.1.

## Design Decisions

- Decision: the component catalog is markdown-first and lightweight.
- Components/tokens to use: existing project components and tokens should be named in context entries before new ones are introduced.
- Anti-patterns to avoid: duplicated local design systems, prose-only negative rules, and unbounded context bundles.

## Security and Privacy Decisions

- Data touched: repo-local markdown, generated indexes, and optional generated agent packs.
- Trust boundaries: do not scan files marked with `context_scan: false` or `<!-- ctx-aide: ignore -->`.
- Required safeguards: avoid secrets in context files, generated packs, future-work notes, and customization config.

## Open Questions

- Which Idvisor plugin boundary should own multi-agent worktree orchestration after the local CLI stabilizes?
- Which SQLite schema should be considered stable enough for generated cache compatibility?

## Hardening Review

- Architecture: validate spec, ticket, pack, future-work, and run references as a graph.
- Design: require explicit positive and negative rules for context and tickets.
- Security: preserve scan exclusions and avoid secret-bearing generated artifacts.
- Best practices: keep commands JSON-first and non-interactive for agents.
- Testing: validate with `node tools/ctx-aide/ctx-aide.mjs lint --json` and `make validate`.
- Parallelization: use ticket packs, parallel groups, worktrees, leases, stale-agent cleanup, and merge queues.

## Ticket Plan

- Independent tickets: context substrate, component catalog, agent packs, discovery, and daily tooling.
- Sequential tickets: scan/query index before hydration and impact checks.
- Shared files that require coordination: `README.md`, templates, `tools/ctx-aide/ctx-aide.mjs`, and `skills/ctx-aide/SKILL.md`.
