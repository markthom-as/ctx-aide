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
workflow_views:
  - logged-out
  - logged-in
credential_profiles:
  - browser-test-user
validation_breakpoints:
  - mobile
  - tablet
  - desktop
  - wide
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
5. Check the view-state matrix with `ctx workflow views --workflow workflow.browser-validation --repo <repo> --json`.
6. Generate the breakpoint validation matrix with `ctx workflow validation-plan --workflow workflow.browser-validation --repo <repo> --json`; this command fails when any required view is not ready, while still returning the matrix and blockers.
7. For logged-in validation, satisfy the `browser-test-user` profile through environment variables, an untracked env file, or an imported browser storage-state file.
8. Record the dependency check, view-state check, breakpoint matrix, test runner, screenshot output path, CI gates, deploy policy, install command, and browser validation evidence on the ticket.

## Readiness Gates

- Browser validation tickets must name this workflow when they rely on browser automation.
- Required dependencies must be repo-owned and pinned before browser validation is considered deterministic.
- Codex native browser plugins are allowed as interactive fallbacks, but they are not the pinned source of truth for validation.
- A missing or stale lockfile blocks completion until the package manager install has refreshed it.
- Logged-out and logged-in views must both be represented when a feature has different auth states.
- Logged-in validation must not print credential values in stdout, logs, tickets, or generated context.
- Breakpoint validation must use sensible defaults when no config file exists, and target repos may override breakpoints in `docs/config/repo-context.validation.json`.
- Test runner behavior, screenshot save location, CI gates, and deploy policy must be included in the validation plan.
- Validation-plan `ok` must be false when required views lack credentials or storage state.
- Deploy settings must keep `cost_estimate_required: true` whenever deploy is enabled.

## Dependency Policy

- `node` must be available because repo-context and most browser validation tooling run through Node.
- `package-manager-lockfile` must be present so the package graph is reproducible.
- `playwright` maps to `@playwright/test@1.61.1` in `devDependencies`.
- `codex-native-browser-plugin` is optional because repo-context cannot pin external desktop-app plugin bundles inside the target repository.

## View and Credential Policy

- `logged-out` requires no credentials and validates anonymous browser behavior.
- `logged-in` uses the `browser-test-user` credential profile.
- `browser-test-user` can be satisfied by `BROWSER_TEST_EMAIL` and `BROWSER_TEST_PASSWORD`, by `.repo-context/credentials/browser-test-user.env`, or by `.repo-context/browser/browser-test-user.storage-state.json`.
- Browser storage-state imports copy an exported Playwright-compatible state file. Repo-context does not scrape browser password stores.
- `.repo-context/` must stay untracked in target repositories because it can contain live session cookies or local credential files.

## Breakpoint Policy

- Default breakpoints are `mobile` (`390x844`), `tablet` (`820x1180`), `desktop` (`1440x900`), and `wide` (`1920x1080`).
- Target repos can override the validation matrix in `docs/config/repo-context.validation.json`.
- Configured breakpoints may reference default preset ids or define custom `{ "id", "width", "height" }` objects.
- A future smart TUI should edit the same config file instead of introducing a separate source of truth.

## Runtime Policy

- Default test runner is Playwright through `npx playwright test`.
- Default screenshot output directory is `.repo-context/artifacts/screenshots`.
- The validation matrix emits one screenshot path per view and breakpoint.
- CI gates default to workflow dependency checks, view readiness, validation-plan generation, and the configured test runner.
- Deploy defaults to disabled/manual. If enabled, deploy policy must require green CI and a cost estimate before infrastructure or hosted deploy changes.

## Validation

- `ctx workflow deps --workflow workflow.browser-validation --repo <repo> --json`
- `ctx workflow views --workflow workflow.browser-validation --repo <repo> --json`
- `ctx workflow validation-plan --workflow workflow.browser-validation --repo <repo> --json`
- `ctx credentials check --profile browser-test-user --repo <repo> --json`
- `ctx credentials import-browser-state --profile browser-test-user --repo <repo> --from <storage-state.json> --write --json`
- `ctx workflow deps --workflow workflow.browser-validation --repo <repo> --write --json`
- The target repo's package-manager install command.
- The target repo's browser smoke or screenshot command.
