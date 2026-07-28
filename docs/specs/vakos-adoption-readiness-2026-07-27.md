---
id: spec.vakos-adoption-readiness-2026-07-27
status: done
title: vakOS Adoption Readiness
owner_agent: codex-high-effort
source_feedback: []
context_ids: []
target_agents:
  spec:
    - codex-high-effort
  ui_design_review: claude-high-effort
  implementation: codex
created: 2026-07-27
---

# vakOS Adoption Readiness

## Goal

Make the installed `ctxa` command reliable enough for vakOS to pin as
development-only tooling: complete machine output, strict invocations, explicit
atomic writes, authoritative target-repository profiles, and revision-linked
bounded context.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide`, package-shipped schemas and config,
  generated context caches, target-repository adoption files.
- Components: command catalog, dispatcher, output writer, profile resolver,
  ticket adapter, context query/index.
- Flows: `command manifest`, adoption status/bootstrap, lint, scan, query,
  impact, export-agent, ticket/pack checks, implementation-plan.
- Design-system areas: human CLI help and structured agent output only.

## Existing Context

- vakOS `CTX_AIDE_SPEC.md` version 0.2 at implementation request commit
  `afec4b8`.
- `AGENTS.md`, `tools/ctx-aide/ctx-aide.mjs`,
  `tools/ctx-aide/command-catalog.mjs`, and the current CLI tests.
- Existing target adoption profiles and capability-policy configuration.
- Existing Idvisor manifest/result tickets remain a separate optional pack.

## Product Decisions

- Decision: preserve display name `CTX Aide`, package `ctx-aide`, and executable
  exactly `ctxa`.
- Rationale: vakOS and the pending Idvisor contract already freeze that identity.
- Regression risk: aliases or source-tree Node commands could become accidental
  integration surfaces; tests must reject them in installed manifests.
- Decision: vakOS adoption is repository development tooling and never implies
  product-runtime or ISO inclusion.
- Rationale: the target product has a separate runtime authority boundary.

## Architecture Decisions

- Decision: one command registry owns dispatch validation, help, machine
  metadata, mutability, bounds, and examples.
- Rationale: duplicated hand-authored command facts already drifted.
- Rejected alternatives: permissive unknown flags, parsing help text, or a
  second Idvisor-only inventory.
- Decision: all generated writes are dry-run-first and require `--write`; all
  files are written atomically within the target repo.
- Rationale: a command named `scan` or `export-agent` must not mutate by surprise.
- Rejected alternatives: direct `writeFileSync` replacement and generic force.
- Decision: target profile files are authoritative for roots, formats, command
  policy, and normative repo-relative sources.
- Rationale: basename-only built-ins cannot preserve vakOS's root `tickets/`.
- Rejected alternatives: symlinks, copied ticket trees, or vakOS conditionals
  scattered through handlers.
- Decision: query results carry exact source/profile/index provenance, budget
  accounting, and revision-bound continuation state.
- Rationale: an agent must know which bytes governed its plan.

## Design Decisions

- Decision: preserve compact human help while JSON mode emits one documented
  object and no terminal decoration.
- Components/tokens to use: existing command groups and stable IDs.
- Anti-patterns to avoid: tables/spinners in JSON, shell-string next commands,
  raw stack traces, and host-specific absolute paths.

## Security and Privacy Decisions

- Data touched: repo-local Markdown/config and ignored generated caches.
- Trust boundaries: command argv, target repo paths, symlinks, dirty source
  bytes, generated indexes, and agent-consumed JSON.
- Required safeguards: reject unknown/duplicate flags; validate before writes;
  realpath containment; atomic create/replace; exact digests; bounded reads and
  responses; secret/generated path exclusion; no environment/global profile
  override for vakOS.

## Open Questions

- No open question changes tickets 084 through 086.
- A future cross-repository packaging ticket remains blocked on a qualified
  immutable source location and explicit distribution terms. This repository
  currently has no Git remote and package metadata says `UNLICENSED`.

## Hardening Review

- Architecture: split command/output, profile/ticket, and provenance/cache work
  into sequential commits because they share the CLI and tests.
- Design: preserve current vocabulary; add no new interactive surface.
- Security: fail closed on invocation/profile/path/provenance ambiguity.
- Best practices: set exit status without abandoning buffered output; generate
  machine facts from registry data; exact retries are no-ops.
- Testing: detached stdin, real shell pipes, unknown/duplicate flags, atomic
  failures, target fixtures, dirty sources, stale indexes, and cursor mismatch.
- Parallelization: documentation and fixture design can overlap conceptually,
  but shared CLI files require sequential commits.

## Ticket Plan

- Independent tickets: none after planning; shared files make implementation
  sequential.
- Sequential tickets: 084 command/output, 085 profiles/tickets, 086 provenance/
  caches.
- Shared files that require coordination: `ctx-aide.mjs`,
  `command-catalog.mjs`, and `ctx-aide.test.mjs`.
