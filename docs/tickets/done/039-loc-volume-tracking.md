---
id: ticket.2026-07-01.loc-volume-tracking
status: done
title: Add LOC volume tracking
ticket_pack: pack.2026-07-loc-volume-tracking
milestones:
  - milestone.repo-context-cli-hardening
source_spec: []
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: default
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - docs/config/repo-context.loc.json
    - docs/config/customization.md
    - README.md
    - Makefile
  directories: []
  components: []
  flows: []
context_query:
  task: "target and track LOC volume"
  generated_at: 2026-07-01
  context_ids: []
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.loc-tracking-local-first
validation:
  automated:
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs loc check --json
    - make validate
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-01
---

# Add LOC Volume Tracking

## Outcome

Add a local `ctx loc` surface that can measure LOC volume and enforce configured or inline path-scoped targets.

## Context

Repo-context uses markdown and local JSON config as canonical workflow truth. LOC volume tracking should follow the same pattern: local config, parseable command output, and validation-friendly checks.

## Positive Rules

- Preserve JSON output for agent-readable measurement and enforcement.
- Prefer repo-local config under `docs/config/`.
- Reuse existing CLI argument and validation patterns.

## Negative Rules

- Do not add paid infrastructure, hosted telemetry, or external services.
- Avoid counting dependency folders, VCS data, generated context packs, or common build outputs by default.
- Stop and escalate if LOC tracking needs historical trend storage or external reporting.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical planning and ticketing surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.loc-tracking-local-first`: LOC volume tracking must work from repo-local files and config.

## Frozen Decisions

- Decision: `ctx loc` measures and reports without failing.
- Decision: `ctx loc check` enforces targets and fails only when a target is under or over its configured range.
- Rationale: inspection and enforcement should be separate so agents can audit volume without triggering false negatives.

## Implementation Rules

- Required approach: implement LOC measurement in `tools/context/ctx.mjs` with config from `docs/config/repo-context.loc.json`.
- Existing components/helpers to use: `targetRepoPath`, `displayPath`, argument parsing helpers, and fixture tests.
- Anti-patterns to avoid: shelling out to `wc` for portability-critical logic or adding dependencies for simple traversal.
- Stop and escalate if binary parsing, language-specific semantic LOC, or trend persistence becomes required.

## Scope

- In: local LOC totals, largest tracked files, extension/top-level breakdowns, config targets, inline check targets, docs, tests, and validation wiring.
- Out: dashboards, historical trend databases, hosted metrics, and paid services.

## Acceptance Criteria

- `ctx loc --json` returns totals, breakdowns, largest files, and target status.
- `ctx loc check --json` fails when an enforced LOC target is violated.
- Configured targets can be scoped to path prefixes and line kinds.
- Generated context output, dependency folders, VCS data, and common build output are ignored by default.

## Validation

- Automated: `node tools/context/ctx.test.mjs`.
- Automated: `node tools/context/ctx.mjs loc check --json`.
- Automated: `make validate`.
- Smoke: no browser or screenshot smoke is needed for this CLI-only ticket.
- Screenshots: not applicable.

## Implementation Notes

The first config records broad repo-source and `tools/context` targets. Future tickets can add trend capture if the project needs historical LOC deltas over time.

## Completion

- Status: done.
- Commit: current-change.
- Verification evidence: `node tools/context/ctx.test.mjs`, `node tools/context/ctx.mjs loc check --json`, and `make validate` passed on 2026-07-01.
- Follow-up tickets: none.
