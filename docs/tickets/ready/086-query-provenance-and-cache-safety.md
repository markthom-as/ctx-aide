---
id: ticket.context.086
status: ready
title: Bind queries and caches to source provenance
ticket_pack: pack.vakos-adoption-readiness-2026-07-27
milestones:
  - milestone.vakos-adoption-readiness
source_spec: spec.vakos-adoption-readiness-2026-07-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: query-provenance
depends_on:
  - ticket.context.085
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/command-catalog.mjs
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - docs/context/schema
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "return revision digest budget and freshness provenance from ctxa queries"
  generated_at: 2026-07-27
  context_ids:
    - spec.vakos-adoption-readiness-2026-07-27
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.query-provenance-is-exact
  - axiom.generated-cache-is-not-truth
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs query --repo <fixture> --profile vakos --path flake.nix --task "change Nix development tooling" --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Bind Queries And Caches To Source Provenance

## Outcome

Query, impact, and implementation-plan results identify the exact repository,
profile, index, and source bytes they used, enforce real budgets, and reject
stale continuations or generated-cache replacement.

## Context

Current query output ranks summaries but omits source revision, dirty relevant
files, exact digests, index freshness, estimator identity, and continuation
state. Generated caches can be replaced without rechecking their source set.

## Positive Rules

- Preserve deterministic ranking and current agent-specific summaries.
- Return repo-relative paths and exact-byte SHA-256 values.
- Let unrelated worktree dirt coexist with digest-scoped operations.

## Negative Rules

- Do not return absolute home paths, secrets, credentials, provider payloads,
  build output, model weights, or ignored generated sources.
- Do not continue a cursor or replace a cache after relevant source changes.
- Do not claim token budgets without a versioned estimator and usage fields.

## Axioms

- `axiom.markdown-source-of-truth`: query/index output is derived evidence.
- `axiom.ticket-done-requires-commit`: completion requires one focused commit.
- `axiom.query-provenance-is-exact`: every returned source has exact path/digest
  provenance.
- `axiom.generated-cache-is-not-truth`: stale or missing caches degrade safely.

## Frozen Decisions

- Decision: query provenance includes HEAD/unborn state, relevant dirty source
  state, profile and index digests, per-entry digests, deterministic query
  digest, estimator/version, requested/used budget, omitted count, and cursor.
- Rationale: agents can recheck the governing bytes before mutation.
- Decision: cursors are opaque and bound to normalized query/profile/source
  digests.
- Rationale: pagination cannot cross source versions.
- Decision: generated JSON/SQLite writes recheck the normalized source-set
  digest immediately before atomic replacement.
- Rationale: a slow scan cannot overwrite a newer cache.

## Implementation Rules

- Required approach: centralize canonical digest/provenance helpers, extend
  query/impact/plan envelopes, then harden cache generation.
- Existing components/helpers to use: context manifest, source-entry parser,
  Git status helper, profile resolver, atomic writer from ticket 084.
- Anti-patterns to avoid: whole-worktree blocking, raw Git output, hidden
  fallback to stale SQLite, or mutable cursor server state.
- Stop and escalate if: a required source cannot be represented as normalized
  UTF-8 repo-relative bytes.

## Scope

- In: provenance/digests, relevant dirt, estimator/budget fields, opaque cursor,
  secret/path exclusions, cache freshness/concurrency, tests.
- Out: semantic embedding search, hosted index, background watcher, Idvisor.

## Acceptance Criteria

- Clean and relevant-dirty fixtures return truthful distinct provenance.
- Unrelated dirt does not block a scoped query/write.
- Cursors reject query/profile/source drift.
- Generated JSON/SQLite output is deterministic and atomic; stale concurrent
  replacement fails or converges as an exact no-op.
- Bounded secret/generated paths never enter output.

## Validation

- Automated: full CLI tests plus clean/dirty/stale/concurrent fixtures.
- Smoke: vakOS-shaped query and repeated scan/write.
- Screenshots: none.

## Implementation Notes

Prefer stateless base64url cursor payload plus digest/MAC-free integrity digest;
the cursor is not an authorization token and source digests are revalidated.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: vakOS adoption/Nix packaging after source qualification.
