---
id: spec.pre-production-adoption-hardening-2026-06-27
status: ready
title: Pre-Production Adoption Hardening
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-27
---

# Pre-Production Adoption Hardening

## Goal

Build out ctx-aide's target-repo adoption workflow enough to dogfood safely before using it on production code.

## Affected Surfaces

- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `README.md`, `docs/workflows/astrotechne-adoption.md`, `docs/specs`, `docs/tickets`, and `docs/ticket-packs`.
- Runtime behavior: target repo adoption bootstrap, generated pack creation, generated ticket placement, and read-only readiness reporting.
- Target profile: Astrotechne first, while keeping the default and Wetware profiles usable.

## Product Decisions

- Decision: target adoption must be inspectable before any production-code edit.
- Decision: target repo preflight is read-only by default and must not execute validation commands unless explicitly asked in a later ticket.
- Decision: Astrotechne-generated tickets should live inside a packet directory when a packet is selected.

## Architecture Decisions

- Decision: add `ctx-aide adoption status` as the read-only preflight surface.
- Rationale: users need one JSON report that says whether bootstrap/config/context/pack/ticket prerequisites are present.
- Rejected alternatives: infer readiness from chat history or require a target repo commit before inspection.
- Decision: add `ctx-aide adoption pack` and make `ctx-aide adoption ticket --pack-slug` write into that pack for directory-based profiles.
- Rationale: Astrotechne's packet README is part of the truth surface for completed work.

## Design Decisions

- Decision: no UI or TUI changes are in scope.
- Components/tokens to use: none.
- Anti-patterns to avoid: making generated tickets look ready when the pack/readiness preflight is missing.

## Security and Privacy Decisions

- Data touched: target repo markdown, local git status output, profile config, context entry metadata, and generated ticket/pack paths.
- Trust boundaries: ctx-aide checkout, target repo checkout, shell commands embedded in target profile config, and generated markdown.
- Required safeguards: read-only status by default, no paid infrastructure changes, no production validation execution, and repo-bound writes.

## Open Questions

None.

## Hardening Review

- Architecture: adoption commands should preserve target-specific conventions instead of normalizing them into ctx-aide's own tree.
- Design: generated markdown should be reviewable and compact.
- Security: preflight should inspect but not mutate or run costly operations.
- Best practices: tests should use fixture target repos for both flat and directory-pack profiles.
- Testing: run focused fixture tests, `make validate`, `make smoke`, and target adoption dry-run against Astrotechne.
- Parallelization: the CLI/test write sets overlap, so implement sequentially with one commit per ticket.

## Ticket Plan

- Independent tickets: none; all tickets touch target adoption code.
- Sequential tickets:
  - `ticket.context.027`: add target adoption status preflight.
  - `ticket.context.028`: add native target adoption pack creation.
  - `ticket.context.029`: make adoption tickets pack-aware and close the pack.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, and adoption docs.
