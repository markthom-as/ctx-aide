---
id: ticket.context.065
status: done
title: Split CLI module boundaries
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-surface
depends_on:
  - ticket.context.064
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - tools/ctx-aide
    - docs/context/architecture
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "split ctxa monolithic cli into maintainable modules without behavior changes"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/*.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - npm run build -- --dry-run --json
    - node tools/ctx-aide/ctx-aide.mjs lint --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - make validate
  smoke:
    - Compare representative JSON outputs before and after extraction for scan, lint, ticket check, pack status, and adoption status.
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T03:18:00Z
---

# Split CLI Module Boundaries

## Outcome

Define and execute the first safe module-boundary extraction from the monolithic `tools/ctx-aide/ctx-aide.mjs` file without changing command behavior.

## Context

The CLI works, but the main file is over 5k lines. That is acceptable for a prototype and weak for production maintenance. A full rewrite would be risky; the right first ticket is a no-behavior-change extraction with tests and an architecture note.

## Positive Rules

- Preserve command behavior and JSON envelopes.
- Extract one coherent boundary at a time.
- Keep imports simple ESM modules under `tools/ctx-aide/`.
- Capture the intended module map in a short architecture note.

## Negative Rules

- Do not redesign the command API in the same ticket.
- Do not convert to TypeScript, add a bundler, or introduce a framework.
- Do not split unrelated functions just to reduce line count.
- Do not weaken tests or validators to make the refactor pass.

## Axioms

- `axiom.markdown-source-of-truth`: Module-boundary rationale belongs in markdown.
- `axiom.ticket-done-requires-commit`: Refactor work must close as one scoped commit.

## Frozen Decisions

- Decision: first extraction should be behavior-preserving.
- Rationale: production refactors should reduce risk rather than create new product behavior.
- Decision: likely first candidates are help/command catalog, package/build helpers, adoption profile helpers, or markdown validation helpers.
- Rationale: each has a clear boundary and test surface.

## Implementation Rules

- Required approach: write/update an architecture note, pick exactly one extraction boundary, move code, update imports/tests, and compare representative command outputs.
- Existing components/helpers to use: current `ctx-aide.test.mjs`, `npm run build -- --dry-run --json`, and `make validate`.
- Anti-patterns to avoid: sweeping reformat, unrelated command cleanup, or a multi-module extraction without intermediate validation.
- Stop and escalate if: extraction exposes hidden circular dependencies that would require a broader architecture decision.

## Scope

- In: one module-boundary extraction, architecture note, tests, and validation.
- Out: broad CLI rewrite, TypeScript migration, command manifest design, setup behavior, and publishing.

## Acceptance Criteria

- `tools/ctx-aide/ctx-aide.mjs` delegates one coherent responsibility to a new module.
- Representative command outputs remain behaviorally equivalent.
- Tests cover the extracted boundary directly or through existing command smoke.
- Architecture note records the next recommended extraction boundaries.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

Move this ticket to `ready` after `ticket.context.064` lands or after a separate hardening pass chooses a different first extraction target. A good candidate after ticket `064` is extracting help/catalog rendering.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `node --check tools/ctx-aide/ctx-aide.mjs`, `node --check tools/ctx-aide/*.mjs`, `node tools/ctx-aide/ctx-aide.test.mjs`, `npm run build -- --dry-run --json`, `node tools/ctx-aide/ctx-aide.mjs lint --json`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, and `make validate` passed. Representative JSON commands for scan, lint, ticket check, pack status, and adoption status remained parseable after the command-catalog extraction.
- Follow-up tickets: additional module extractions should be separate tickets.
