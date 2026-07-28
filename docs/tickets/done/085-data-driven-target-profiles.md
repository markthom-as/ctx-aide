---
id: ticket.context.085
status: done
title: Make target profiles authoritative
ticket_pack: pack.vakos-adoption-readiness-2026-07-27
milestones:
  - milestone.vakos-adoption-readiness
source_spec: spec.vakos-adoption-readiness-2026-07-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: target-profile
depends_on:
  - ticket.context.084
blocks:
  - ticket.context.086
scope:
  routes: []
  files:
    - tools/ctx-aide/command-catalog.mjs
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/config/ctx-aide.adoption-profiles.json
  directories:
    - docs/context/schema
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "make vakOS root specs tickets and command policy authoritative across ctxa"
  generated_at: 2026-07-27
  context_ids:
    - spec.vakos-adoption-readiness-2026-07-27
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.target-profile-owns-roots
  - axiom.profile-command-policy-is-enforced
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs adoption status --repo <fixture> --profile vakos --json
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-27
---

# Make Target Profiles Authoritative

## Outcome

A checked-in vakOS profile consistently controls context, root tickets, flat
layout, normative root specs, generated paths, command availability, and legacy
read-only ticket migration across every adopted command.

## Context

Current profiles are hard-coded in the main CLI, checked-in target config is
mostly descriptive, and canonical validators still read `docs/tickets` from the
CTX Aide source root.

## Positive Rules

- Load package-owned profile definitions from `toolRoot` and target config from
  the resolved repo.
- Preserve current built-in profile behavior through data.
- Support vakOS root `tickets/` and repo-relative normative source files.

## Negative Rules

- Do not add basename conditionals to individual handlers.
- Do not use symlinks or copy root specs/tickets into CTX-shaped directories.
- Do not let environment/global config override vakOS repository semantics.

## Axioms

- `axiom.markdown-source-of-truth`: target repository files remain canonical.
- `axiom.ticket-done-requires-commit`: completion requires one focused commit.
- `axiom.target-profile-owns-roots`: every profile-aware command resolves the
  same normalized roots.
- `axiom.profile-command-policy-is-enforced`: disabled commands fail closed.

## Frozen Decisions

- Decision: precedence is explicit profile, checked-in repo profile, package
  profile, then default; vakOS has no env/user-global override.
- Rationale: host state cannot silently reinterpret a repository.
- Decision: vakOS source specs are allowlisted repo-relative files, not copied
  internal spec IDs.
- Rationale: root architecture documents retain authority.
- Decision: legacy tickets are read-only; new tickets use canonical flat
  frontmatter and support historical hashes or same-commit `self` completion.
- Rationale: migration preserves history without blocking new work.

## Implementation Rules

- Required approach: define/version the package profile schema, resolve once,
  pass the resolved object to every handler/validator, and test a target fixture.
- Existing components/helpers to use: adoption status/bootstrap and existing
  target profile detection.
- Anti-patterns to avoid: target cwd leakage, implicit root fallback after a
  checked-in profile error, or command-policy advice without enforcement.
- Stop and escalate if: preserving an existing profile requires changing its
  canonical ticket/source truth.

## Scope

- In: profile registry/schema/loader, vakOS profile, root-aware validation and
  adoption commands, flat legacy/canonical ticket adapter, command policy.
- Out: query digest/cursor behavior, migrating real vakOS files, Nix packaging.

## Acceptance Criteria

- A vakOS fixture adopts without moving root specs or `tickets/`.
- All listed commands report the same roots/profile digest.
- Disabled and feature-gated commands fail with structured reasons.
- Existing wetware/Astrotechne/default fixture behavior remains compatible.
- Path traversal, symlink escape, invalid schema, and conflicting profile
  selection fail before writes.

## Validation

- Automated: full CLI tests and profile schema fixtures.
- Smoke: adoption status/bootstrap plus root ticket checks in a vakOS fixture.
- Screenshots: none.

## Implementation Notes

Profile-defined roots belong to the target repo; package-owned profile registry
and schemas resolve from `toolRoot`.

## Completion

- Status: done.
- Commit: current-change.
- Verification evidence: syntax checks, full CLI regression suite, package
  spec/ticket/pack checks, and the vakOS target fixture all pass. The fixture
  proves one semantic profile digest/root map across manifest/schema/ticket
  commands; legacy and canonical ticket validation; root normative-source
  hydration; pre-effect command denial and feature gates; and fail-closed
  conflict, version, traversal, and symlink handling.
- Follow-up tickets: 086.
