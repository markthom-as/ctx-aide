---
id: spec.staff-review-hardening-2026-06-26
status: ready
title: Staff Review Hardening
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-26
---

# Staff Review Hardening

## Goal

Harden the ctxa CLI and workflow artifacts before using the project as a serious daily planning system for larger repositories.

## Affected Surfaces

- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `README.md`, `docs/workflows`, `docs/config`, `docs/specs`, `docs/tickets`, and `docs/ticket-packs`.
- Runtime behavior: local CLI commands that read, write, validate, and execute target-repo workflow steps.
- Review model: three explicit audit passes for staff-engineering scrutiny and hostile public feedback.

## Product Decisions

- Decision: ctx-aide remains a local, repo-owned markdown workflow system rather than a hosted service.
- Decision: generated indexes are caches; markdown specs, context entries, tickets, and packs are the canonical review surface.
- Decision: hardening should preserve the current dependency-free Node CLI unless a safety issue clearly requires a new dependency.

## Architecture Decisions

- Decision: local command execution should default to argument-vector execution rather than shell evaluation.
- Rationale: shell evaluation is difficult to reason about in a CLI meant to be copied into target repositories.
- Rejected alternatives: leave command execution unconstrained and document that users should be careful.
- Decision: write targets should stay inside the active repo or selected target repo by default.
- Rationale: a repo-local context tool should not silently write outside its declared repository boundary.

## Design Decisions

- Decision: no UI surface changes are in scope.
- Components/tokens to use: none.
- Anti-patterns to avoid: hiding guardrail failures in prose while JSON reports `ok: true`.

## Security and Privacy Decisions

- Data touched: local markdown, local JSON config, storage-state metadata, generated indexes, and local command output excerpts.
- Trust boundaries: local checkout, target repo checkout, shell command text, browser storage-state files, and generated artifacts.
- Required safeguards: bounded output, redacted credential reporting, non-shell command execution by default, path containment for writes, and truthful readiness failures.

## Open Questions

None.

## Hardening Review

- Pass 1, staff engineering: command execution and filesystem writes must have explicit boundaries and tests.
- Pass 2, hostile public feedback: validation commands must not report success while declaring required validation views unready.
- Pass 3, adoption dogfood: docs and workflow artifacts must make the milestone, pack, ticket, and validation path reproducible.
- Security: do not add paid infrastructure or secret-handling expansion.
- Testing: extend fixture tests for every behavior change and run `make validate`, `make smoke`, and focused `ctxa` commands.
- Parallelization: tickets touch overlapping CLI/test files, so implementation should run sequentially while preserving atomic commits.

## Ticket Plan

- Independent tickets: none, because all three hardening passes touch `tools/ctx-aide/ctx-aide.mjs` and `tools/ctx-aide/ctx-aide.test.mjs`.
- Sequential tickets:
  - `ticket.context.024`: harden command execution and write paths.
  - `ticket.context.025`: make validation-plan readiness truthful.
  - `ticket.context.026`: close the adoption dogfood review path.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `README.md`, and hardening pack metadata.
