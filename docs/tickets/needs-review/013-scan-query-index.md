---
id: ticket.context.013
status: needs-review
title: Implement scan and query index
ticket_pack: pack.repo-context-mvp
milestones:
  - milestone.repo-context-mvp
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
  - claude-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-index-a
depends_on:
  - ticket.context.001
  - ticket.context.002
blocks:
  - ticket.context.003
  - ticket.context.005
  - ticket.context.006
  - ticket.context.010
phase: 1
scope:
  routes: []
  files: []
  directories:
    - docs
    - tools/context
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Implement scan and query index"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Unit test scan exclusion.
  - Unit test query ranking.
  - Snapshot test query output.
  smoke:
  - Unit test scan exclusion.
  - Unit test query ranking.
  - Snapshot test query output.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Implement Scan and Query Index

## Outcome

Build the generated manifest and SQLite-backed query index for scoped context lookup.

## Context

This ticket is part of `pack.repo-context-mvp` and narrows the CLI work into an independently implementable slice.

## Positive Rules

- Preserve markdown as the source of truth.
- Keep command output deterministic and parseable.
- Prefer idempotent behavior for bootstrap and generated artifacts.

## Negative Rules

- Do not overwrite user files without explicit force behavior.
- Do not make generated SQLite or manifests canonical truth.
- Stop and harden if command behavior would require a new status or schema decision.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate.

## Frozen Decisions

- Commands used by agents must support JSON output.
- Generated artifacts are rebuildable.

## Implementation Rules

- Required approach: implement only this command slice.
- Existing components/helpers to use: reuse `tools/context/ctx.mjs` patterns.
- Anti-patterns to avoid: prompts in JSON mode, unbounded output, and hidden overwrites.
- Stop and escalate if: schema or command vocabulary conflicts with README.

## Scope

- In:
  - Implement `ctx scan --json`.
  - Generate `docs/context/generated/context-manifest.json`.
  - Generate or refresh local SQLite index.
  - Implement `ctx query --path <path> --task <text> --agent <agent> --budget <tokens> --json`.
- Out:
  - Implement agent-pack export.
  - Implement run orchestration.

## Acceptance Criteria

- Ignored markdown is excluded.
- Positive and negative rules remain separate in query output.
- Query returns bounded summaries and file pointers.
- SQLite is generated and markdown remains canonical.

## Validation

- Unit test scan exclusion.
- Unit test query ranking.
- Snapshot test query output.

## Implementation Notes

- Parallel group: `cli-index-a`.
- Expected commit message: `Implement scan query index`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs scan --json`
  - `sqlite3 docs/context/generated/context.sqlite '.tables'`
  - `sqlite3 docs/context/generated/context.sqlite 'select id, kind, status from context_entries order by id;'`
  - `node tools/context/ctx.mjs query --path tools/context/ctx.mjs --task "repo context dogfood rule polarity" --agent codex --budget 1200 --json`
  - `make validate`
- Follow-up tickets: pending
