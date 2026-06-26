---
id: ticket.context.002
status: draft
title: Implement ctx scan query lint CLI
phase: 1
depends_on:
  - ticket.context.001
---

# Implement `ctx` Scan, Query, and Lint CLI

## Goal

Provide an agent-native local CLI that indexes markdown context into SQLite and returns bounded, ranked context for a target path, route, or ticket.

## Scope

- Implement `ctx scan --json`.
- Implement `ctx query --path <path> --task <text> --agent <agent> --budget <tokens> --json`.
- Implement `ctx lint --json`.
- Implement `ctx pack check --json`.
- Generate `docs/context/generated/context-manifest.json`.
- Generate or refresh local SQLite index.

## Acceptance Criteria

- CLI is non-interactive by default.
- `--json` writes parseable data to stdout.
- Diagnostics and errors go to stderr.
- Query ranking handles exact file, route, directory ancestor, component, flow, feedback, design, and architecture matches.
- Lint catches missing ids, stale file references, unscoped feedback, stale generated packs, and malformed ticket-pack references.
- Scanner excludes markdown files with first-line `<!-- repo-context: ignore -->`.
- Scanner excludes markdown files whose frontmatter has `context_scan: false`.
- Excluded files do not appear in SQLite, generated manifests, FTS search, agent packs, ticket hydration, or context query results.

## Verification

- Unit tests for frontmatter parsing and ranking.
- Unit tests for first-line sentinel and `context_scan: false` exclusion.
- CLI tests with stdin detached.
- Snapshot test for query output on the example context set.

## Commit

One commit when complete: `Implement repo context CLI`
