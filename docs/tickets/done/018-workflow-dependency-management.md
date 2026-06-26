---
id: ticket.context.018
status: done
title: Add workflow dependency management
ticket_pack: pack.repo-context-workflow-dependency-management
milestones:
  - milestone.repo-context-docs-maintenance
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - README.md
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - docs/workflows/browser-validation.md
  directories:
    - docs/workflows
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Add workflow dependency management"
  generated_at: 2026-06-26
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
    - Run `make validate`.
    - Run the fixture-backed workflow dependency tests in `node tools/context/ctx.test.mjs`.
  smoke:
    - Confirm `ctx workflow deps --write` pins `@playwright/test` exactly in a fixture package.json.
  screenshots: []
completion:
  commit: workflow-dependency-management-change
  completed_at: 2026-06-26
---

# Add Workflow Dependency Management

## Outcome

Make workflow runtime dependencies explicit, checkable, and fixable through repo-context, starting with browser validation.

## Context

Browser validation can fail locally when Playwright versions, local installs, or Codex native browser plugin availability drift. Repo-context should let a workflow declare its required runtime dependencies and should provide an agent-safe command that checks and writes package pins without relying on external plugin state.

## Positive Rules

- Preserve JSON-first command output.
- Keep workflow dependency declarations in markdown workflows.
- Prefer repo-owned package pins for deterministic validation.

## Negative Rules

- Do not install packages automatically.
- Do not treat Codex native browser plugins as a package-manager-pinned dependency.
- Stop and escalate if a dependency fix would require paid infrastructure or interactive setup.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate in generated context.

## Frozen Decisions

- Workflow files may declare `workflow_dependencies` and `optional_workflow_dependencies`.
- `workflow.browser-validation` requires Node, a package-manager lockfile, and exact `@playwright/test@1.61.1`.
- `codex-native-browser-plugin` is optional because it is supplied by the agent runtime, not the target repo.
- `ctx workflow deps --write` may update `package.json`, but it does not run installs or write lockfiles.

## Implementation Rules

- Required approach: extend the existing dependency-free Node CLI.
- Existing components/helpers to use: `readDoc`, markdown validators, `argValue`, `printResult`, and fixture tests.
- Anti-patterns to avoid: broad package-manager orchestration or hidden network installs.
- Stop and escalate if: a workflow dependency cannot be represented as a repo-local check or explicit external fallback.

## Scope

- In:
  - `ctx workflow deps`.
  - Browser-validation workflow dependency declaration.
  - Workflow validation for declared dependency ids.
  - README and tests.
- Out:
  - Running package-manager installs.
  - Installing browser binaries.
  - Managing Codex app plugin versions.

## Acceptance Criteria

- `ctx workflow deps` reports missing workflow dependencies as structured JSON.
- `ctx workflow deps --write` pins `@playwright/test` exactly in `package.json` when requested.
- Browser validation docs distinguish repo-owned Playwright from optional Codex native plugin fallback.
- Workflow dependency ids declared in markdown are validated.

## Validation

- Automated:
  - `make validate`
  - `node tools/context/ctx.test.mjs`
- Smoke:
  - Fixture test covers missing pins, `--write`, and lockfile readiness.
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: workflow-dependency-management-change
- Verification evidence:
  - `make validate`
  - `node tools/context/ctx.mjs workflow deps --workflow workflow.browser-validation --repo . --json` reports the expected missing browser-app package pins for this repo.
- Follow-up tickets:
  - Add workflow-specific browser binary install checks if a target repo needs them.
