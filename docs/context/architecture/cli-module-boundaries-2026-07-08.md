---
id: architecture.cli-module-boundaries-2026-07-08
kind: architecture
context_scan: true
status: active
title: CLI Module Boundaries
files:
  - tools/ctx-aide/ctx-aide.mjs
  - tools/ctx-aide/command-catalog.mjs
  - tools/ctx-aide/ctx-aide.test.mjs
flows:
  - flow.ctx-aide-dogfood
tags:
  - cli
  - maintainability
  - module-boundary
positive_rules:
  - Extract one coherent CLI responsibility at a time.
  - Preserve command JSON envelopes and human help text during refactors.
negative_rules:
  - Do not combine module extraction with command behavior redesign.
  - Do not add bundlers, TypeScript, or frameworks as part of boundary cleanup.
load_when:
  path_matches:
    - tools/ctx-aide/**
  task_terms:
    - module boundary
    - command catalog
    - cli refactor
updated: 2026-07-08
---

# CLI Module Boundaries

## Purpose

Record the first production-maintainability boundary extracted from the `ctxa` CLI and the next safe extraction candidates.

## Current Decisions

- `tools/ctx-aide/command-catalog.mjs` is the first extracted module boundary.
- Help rendering and command manifest construction should stay catalog-driven.
- `tools/ctx-aide/ctx-aide.mjs` remains the command dispatcher until future tickets extract one boundary at a time.

## Current Boundary

`tools/ctx-aide/command-catalog.mjs` owns command catalog data, top-level help rendering, group help rendering, group lookup, and the machine-readable command manifest.

`tools/ctx-aide/ctx-aide.mjs` now delegates help and manifest introspection to that module while retaining command dispatch and command implementations.

This is the first extraction boundary because it has a narrow responsibility, low side-effect risk, and clear validation through `ctxa --help`, `ctxa help <group> --json`, and `ctxa command manifest --json`.

## Behavior Contract

- `ctxa --help --json` keeps the existing flat `usage` array.
- `ctxa help <group>` renders human-readable help from the same catalog.
- `ctxa help <group> --json` returns structured command entries.
- `ctxa command manifest --json` returns a versioned manifest with command ids, examples, required flags, mutation boundaries, and JSON support.

Representative no-behavior-change checks:

- `ctxa scan --json`
- `ctxa lint --json`
- `ctxa ticket check --json`
- `ctxa pack status pack.ctx-aide-production-hardening-2026-07-07 --json`
- `ctxa adoption status --repo . --profile auto --json`

## Positive Rules

- Extract one coherent CLI responsibility at a time.
- Preserve command JSON envelopes and human help text during refactors.
- Validate extracted boundaries through public CLI behavior rather than private implementation assumptions.

## Negative Rules

- Do not combine module extraction with command behavior redesign.
- Do not add bundlers, TypeScript, or frameworks as part of boundary cleanup.
- Do not split multiple command families in one ticket unless a circular dependency forces it.

## Implementation Rules

- Prefer a small ESM module under `tools/ctx-aide/` with explicit imports and no side effects at import time.
- Add or keep tests that exercise the extracted behavior through detached-stdin CLI calls.
- Compare representative JSON outputs before and after extraction when command behavior is meant to be unchanged.

## Next Boundaries

Extract future boundaries one at a time:

1. Markdown validation helpers for tickets, packs, specs, and future-work.
2. Adoption profile detection and target bootstrap helpers.
3. Package/build/install command helpers shared with `scripts/build.mjs` and `scripts/install-local.mjs`.
4. Workflow policy and validation-plan catalog helpers.

Do not split multiple boundaries in one ticket unless the existing module graph forces it.

## Non-Goals

- No command renames.
- No JSON contract changes.
- No TypeScript migration.
- No package publishing.
- No broad rewrite of `ctx-aide.mjs`.
