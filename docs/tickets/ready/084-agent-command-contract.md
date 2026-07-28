---
id: ticket.context.084
status: ready
title: Harden the agent command contract
ticket_pack: pack.vakos-adoption-readiness-2026-07-27
milestones:
  - milestone.vakos-adoption-readiness
source_spec: spec.vakos-adoption-readiness-2026-07-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: command-contract
depends_on: []
blocks:
  - ticket.context.085
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
  task: "make ctxa pipe-safe strict introspectable and explicit-write for agents"
  generated_at: 2026-07-27
  context_ids:
    - spec.vakos-adoption-readiness-2026-07-27
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.complete-json-before-exit
  - axiom.mutations-require-write
validation:
  automated:
    - node --check tools/ctx-aide/command-catalog.mjs
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs command manifest --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Harden The Agent Command Contract

## Outcome

Every registered `ctxa` invocation validates its argv before effects, emits
complete JSON through pipes, exposes truthful command metadata, and requires
explicit `--write` for generated files.

## Context

The current emitter calls `process.exit` immediately after `stdout.write`,
unknown flags are ignored, command facts are incomplete/duplicated, and scan/
agent-pack generation writes without an explicit boundary.

## Positive Rules

- Preserve existing stable command IDs and user-facing vocabulary.
- Derive validation and machine metadata from the command catalog.
- Preserve human help and current read-only results where compatible.

## Negative Rules

- Do not accept unknown or duplicate singleton flags.
- Do not emit a partial JSON prefix or diagnostics on JSON-mode stderr.
- Do not let `scan` or `export-agent` write without `--write`.

## Axioms

- `axiom.markdown-source-of-truth`: command metadata describes but does not
  replace repository source truth.
- `axiom.ticket-done-requires-commit`: completion requires one focused commit.
- `axiom.complete-json-before-exit`: success/failure output drains fully before
  the process exits.
- `axiom.mutations-require-write`: no file mutation is implicit.

## Frozen Decisions

- Decision: JSON mode is one object plus LF on stdout and empty stderr.
- Rationale: agents parse the whole result deterministically.
- Decision: catalog entries declare allowed options, effects, bounds, and exit
  behavior; static tests reject drift and duplicate IDs.
- Rationale: dispatch/help/manifests cannot remain separate truth surfaces.
- Decision: `scan` and `export-agent` are dry-run by default and atomically
  write only after `--write`.
- Rationale: retry and failure cannot corrupt or unexpectedly change caches.

## Implementation Rules

- Required approach: add catalog-backed invocation validation and shared emit/
  atomic-write helpers before changing command dispatch behavior.
- Existing components/helpers to use: command groups, `resolveRepoWritePath`,
  current JSON-mode tests, and generated cache paths.
- Anti-patterns to avoid: parsing usage text at runtime, a global allow-any flag
  set, immediate `process.exit`, or generic overwrite force.
- Stop and escalate if: an existing command requires interactive input or an
  undocumented outside-repo write to remain compatible.

## Scope

- In: main CLI commands, JSON output, registry metadata, strict argv, scan and
  export-agent explicit atomic writes, regression tests.
- Out: profile root semantics, query provenance, Idvisor schemas, build/install
  helper scripts, screenshot server lifecycle.

## Acceptance Criteria

- Real shell pipes parse complete success and failure JSON above buffer sizes.
- Unknown/duplicate flags and invalid values fail before effects.
- Command manifest reports option/effect/write/output metadata consistently.
- Scan/export dry-runs do not write; `--write` writes atomically; exact retries
  are deterministic.
- Existing CLI regression tests remain green after intentional expectation
  updates.

## Validation

- Automated: syntax checks and full CLI tests.
- Smoke: command manifest through a separate-process JSON parser.
- Screenshots: none.

## Implementation Notes

Set `process.exitCode` and return after writes; do not rely on a timer to keep a
pipe alive.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: 085 and 086.
