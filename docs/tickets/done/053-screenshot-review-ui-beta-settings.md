---
id: ticket.context.053
status: done
title: Gate screenshot review UI behind beta settings
ticket_pack: pack.screenshot-review-ui-beta-settings-2026-07-07
milestones:
  - milestone.ctx-aide-feedback-review
source_spec: null
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-settings
depends_on:
  - ticket.context.052
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/screenshot-review-ui.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/workflows/feedback-review.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - workflow.feedback-review
context_query:
  task: "Gate screenshot review UI behind beta settings"
  generated_at: 2026-07-07
  context_ids:
    - workflow.feedback-review
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.beta-features-require-explicit-opt-in
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs settings get --repo . --json
    - node tools/ctx-aide/ctx-aide.mjs settings set --repo . --feature screenshot-feedback-review-ui --enabled true --json
    - node tools/ctx-aide/ctx-aide.mjs feedback review-ui --repo . --plan-only --json
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07
---

# Gate Screenshot Review UI Behind Beta Settings

## Outcome

Make screenshot review UI setup optional, beta-labeled, and configurable through onboarding and repo-local settings.

## Context

The screenshot feedback review UI was added as local tooling. It should not become part of default setup for every target repo until the workflow has hardened further.

## Positive Rules

- Seed screenshot review UI settings during onboarding with the feature disabled by default.
- Provide a settings command that can inspect and update the beta opt-in.
- Require explicit opt-in before `ctxa feedback review-ui` starts in a target repo.

## Negative Rules

- Do not make beta UI setup mandatory.
- Do not silently enable screenshot feedback ticket creation.
- Do not hide the beta label in prose-only docs.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.beta-features-require-explicit-opt-in`: Beta features must be disabled by default and explicitly enabled in repo-local settings before normal use.

## Frozen Decisions

- Settings file: `docs/config/ctx-aide.settings.json`.
- Feature id: `screenshot_feedback_review_ui`.
- Default state: disabled beta.
- Onboarding flag: `--enable-screenshot-feedback-ui`.

## Implementation Rules

- Required approach: add settings helpers, seed settings during adoption bootstrap, add settings get/set commands, and gate the review UI.
- Existing components/helpers to use: `docs/config`, JSON read/write helpers, adoption bootstrap/status, and focused tests.
- Anti-patterns to avoid: global machine state, hidden feature toggles, and default-on beta behavior.
- Stop and escalate if: enabling the feature requires paid infrastructure or external services.

## Scope

- In: settings config, onboarding bootstrap flag, status reporting, review UI gate, docs, tests, and closeout metadata.
- Out: a full interactive `ctxa setup` TUI and hosted settings UI.

## Acceptance Criteria

- Adoption bootstrap writes beta settings with screenshot review UI disabled by default.
- `ctxa settings get` reports the feature as beta and disabled by default.
- `ctxa settings set --feature screenshot-feedback-review-ui --enabled true --write` enables the feature.
- `ctxa feedback review-ui` reports a blocker when the beta feature is disabled.
- The feature can still be one-shot tested with an explicit beta override.

## Validation

- Automated:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node --check tools/ctx-aide/screenshot-review-ui.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs settings get --repo . --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: current-change
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node --check tools/ctx-aide/screenshot-review-ui.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs settings get --repo . --json`
  - `node tools/ctx-aide/ctx-aide.mjs settings set --repo . --feature screenshot-feedback-review-ui --enabled true --json`
  - `node tools/ctx-aide/ctx-aide.mjs feedback review-ui --repo . --plan-only --json` returned the expected disabled-beta blocker.
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `make validate`
- Follow-up tickets: none.
