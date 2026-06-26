---
id: ticket.context.003
status: draft
title: Generate Codex Claude and Cursor context packs
phase: 2
depends_on:
  - ticket.context.002
---

# Generate Codex, Claude, and Cursor Context Packs

## Goal

Make the same repo-local context available to Codex, Claude, and Cursor without hand-maintaining three divergent instruction sets.

## Scope

- Add `ctx export-agent --agent codex`.
- Add `ctx export-agent --agent claude`.
- Add `ctx export-agent --agent cursor`.
- Add `AGENTS.md` bootstrap instructions.
- Add `CLAUDE.md` bootstrap instructions.
- Add generated `.cursor/rules/generated/*.mdc` summaries.

## Acceptance Criteria

- Codex instructions emphasize ticket hydration and implementation-time context queries.
- Claude instructions point to a concise generated pack.
- Cursor rules are summary-oriented and do not try to embed the full context database.
- Generated packs include timestamps and source manifest hash.
- `ctx lint` fails when packs are stale.

## Verification

- Run exports from clean markdown source.
- Confirm generated outputs are deterministic.
- Confirm `ctx lint --json` passes after generation and fails after source mutation.

## Commit

One commit when complete: `Generate agent context packs`
