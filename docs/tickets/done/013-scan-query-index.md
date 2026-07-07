---
id: ticket.context.013
status: done
title: Implement scan and query index
ticket_pack: pack.ctx-aide-mvp
milestones:
  - milestone.ctx-aide-mvp
source_spec: spec.ctx-aide-mvp
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
    - tools/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Implement scan and query index"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
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
  commit: fced959
  completed_at: 2026-06-26
---

# Implement Scan and Query Index

## Outcome

Build the generated manifest and SQLite-backed query index for scoped context lookup.

## Context

This ticket is part of `pack.ctx-aide-mvp` and narrows the CLI work into an independently implementable slice.

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
- Existing components/helpers to use: reuse `tools/ctx-aide/ctx-aide.mjs` patterns.
- Anti-patterns to avoid: prompts in JSON mode, unbounded output, and hidden overwrites.
- Stop and escalate if: schema or command vocabulary conflicts with README.

## Scope

- In:
  - Implement `ctx-aide scan --json`.
  - Generate `docs/context/generated/context-manifest.json`.
  - Generate or refresh local SQLite index.
  - Implement `ctx-aide query --path <path> --task <text> --agent <agent> --budget <tokens> --json`.
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

- Status: done
- Commit: fced959
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs scan --json`
  - `sqlite3 docs/context/generated/context.sqlite '.tables'`
  - `sqlite3 docs/context/generated/context.sqlite 'select id, kind, status from context_entries order by id;'`
  - `node tools/ctx-aide/ctx-aide.mjs query --path tools/ctx-aide/ctx-aide.mjs --task "ctx-aide dogfood rule polarity" --agent codex --budget 1200 --json`
  - `make validate`
- Follow-up tickets: none
