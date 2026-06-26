---
id: ticket.context.004
status: draft
title: Add lightweight component and design catalog
phase: 2
depends_on:
  - ticket.context.001
  - ticket.context.002
---

# Add Lightweight Component and Design Catalog

## Goal

Give agents and developers a repo-local inventory of reusable components, variants, composition rules, design tokens, examples, and anti-patterns.

## Scope

- Add component context entries under `docs/context/components/`.
- Add design-system entries under `docs/context/design/`.
- Add `ctx components list --json`.
- Add `ctx components get <id> --json`.
- Optionally add a local `context-lab` page or static catalog that renders examples.

## Acceptance Criteria

- Core shared components have ids, import paths, variants, and composition rules.
- Component entries list common anti-patterns.
- Design entries describe tokens and layout conventions in implementation terms.
- Agent queries for affected routes include relevant component contracts.
- Optional local catalog renders examples without requiring hosted infrastructure.

## Verification

- CLI component list/get tests.
- Visual smoke for catalog route if implemented.
- Query test showing a route pulls its component context.

## Commit

One commit when complete: `Add component context catalog`
