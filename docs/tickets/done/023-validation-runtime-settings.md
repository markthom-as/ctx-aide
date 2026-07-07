---
id: ticket.context.023
status: done
title: Add validation runtime settings
ticket_pack: pack.ctx-aide-validation-runtime-settings
milestones:
  - milestone.ctx-aide-docs-maintenance
source_spec: spec.ctx-aide-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on:
  - ticket.context.021
blocks: []
scope:
  routes: []
  files:
    - README.md
    - docs/config/ctx-aide.validation.json
    - docs/workflows/browser-validation.md
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - docs/config
    - docs/workflows
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Add validation runtime settings"
  generated_at: 2026-06-26
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
    - Run `make validate`.
    - Run `node tools/ctx-aide/ctx-aide.test.mjs`.
  smoke:
    - Run `ctx-aide workflow validation-plan` and verify testing, screenshot, CI, and deploy settings in JSON output.
  screenshots: []
completion:
  commit: validation-runtime-settings-change
  completed_at: 2026-06-26
---

# Add Validation Runtime Settings

## Outcome

Make workflow validation plans manage test runner behavior, screenshot output paths, CI gating, and deploy policy in addition to views and breakpoints.

## Context

The validation workflow must be more than viewport coverage. Agents need to know which test runner to call, where screenshots should be saved, what CI must gate, and what deploy policy applies. These settings should have sensible defaults, be configurable through `docs/config/ctx-aide.validation.json`, and later be editable by a smart TUI without creating a second source of truth.

## Positive Rules

- Preserve JSON-first command output.
- Keep runtime behavior in the same validation config as views and breakpoints.
- Include screenshot paths in the validation matrix.
- Require cost-estimate policy when deploy is enabled.

## Negative Rules

- Do not run tests, CI, or deploys from `validation-plan`; it is an introspection/planning command.
- Do not enable deploy by default.
- Do not allow enabled deploy settings to omit the cost-estimate requirement.
- Do not hide screenshot artifact paths in prose-only docs.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate in generated context.

## Frozen Decisions

- Default test runner is Playwright via `npx playwright test`.
- Default screenshot directory is `.ctx-aide/artifacts/screenshots`.
- CI defaults to workflow dependency, view, validation-plan, and test-runner gates.
- Deploy defaults to disabled/manual with `requires_green_ci: true` and `cost_estimate_required: true`.
- Config overrides live under the workflow entry in `docs/config/ctx-aide.validation.json`.

## Implementation Rules

- Required approach: extend `ctx-aide workflow validation-plan`.
- Existing components/helpers to use: validation config parser, workflow view rows, and fixture tests.
- Anti-patterns to avoid: side effects, deploy execution, hidden screenshot paths.
- Stop and escalate if: runtime config needs secrets or paid infrastructure setup.

## Scope

- In:
  - Validation-plan output for testing settings.
  - Screenshot output settings and matrix screenshot paths.
  - CI gate and artifact settings.
  - Deploy policy settings and safety validation.
  - README, workflow docs, config defaults, and tests.
- Out:
  - Running test commands.
  - Creating CI files.
  - Deploying or modifying hosted infrastructure.

## Acceptance Criteria

- Validation plan includes `testing`, `screenshots`, `ci`, and `deploy`.
- Config can override test runner, screenshot path, CI gates, and deploy provider.
- Enabled deploy settings must keep `cost_estimate_required: true`.
- Each matrix row includes a deterministic screenshot path.

## Validation

- Automated:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: validation-runtime-settings-change
- Verification evidence:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs workflow validation-plan --workflow workflow.browser-validation --repo . --json`
- Follow-up tickets:
  - Smart TUI should edit these same settings.
