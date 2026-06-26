---
id: workflow.browser-validation
status: active
title: Browser Validation Workflow
workflow_dependencies:
  - node
  - package-manager-lockfile
  - playwright
optional_workflow_dependencies:
  - codex-native-browser-plugin
updated: 2026-06-26
---

# Browser Validation Workflow

## Purpose

Run browser validation from repo-owned, pinned dependencies so local agents, CI jobs, and desktop app sessions do not depend on whichever browser plugin or Playwright version happens to be active.

## Stages

1. Check workflow dependencies with `ctx workflow deps --workflow workflow.browser-validation --repo <repo> --json`.
2. If required package pins are missing, run the same command with `--write` to update `package.json`.
3. Install dependencies with the target repo's package manager so the lockfile records the exact resolved tree.
4. Run the workflow's browser smoke or screenshot validation command from the repo, not from an agent plugin.
5. Record the dependency check, install command, and browser validation evidence on the ticket.

## Readiness Gates

- Browser validation tickets must name this workflow when they rely on browser automation.
- Required dependencies must be repo-owned and pinned before browser validation is considered deterministic.
- Codex native browser plugins are allowed as interactive fallbacks, but they are not the pinned source of truth for validation.
- A missing or stale lockfile blocks completion until the package manager install has refreshed it.

## Dependency Policy

- `node` must be available because repo-context and most browser validation tooling run through Node.
- `package-manager-lockfile` must be present so the package graph is reproducible.
- `playwright` maps to `@playwright/test@1.61.1` in `devDependencies`.
- `codex-native-browser-plugin` is optional because repo-context cannot pin external desktop-app plugin bundles inside the target repository.

## Validation

- `ctx workflow deps --workflow workflow.browser-validation --repo <repo> --json`
- `ctx workflow deps --workflow workflow.browser-validation --repo <repo> --write --json`
- The target repo's package-manager install command.
- The target repo's browser smoke or screenshot command.
