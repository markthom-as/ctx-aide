---
id: ticket.context.019
status: done
title: Add browser auth view management
ticket_pack: pack.ctx-aide-browser-auth-view-management
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
  - ticket.context.018
blocks: []
scope:
  routes: []
  files:
    - .gitignore
    - README.md
    - docs/workflows/browser-validation.md
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - docs/workflows
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Add browser auth view management"
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
    - Run the fixture-backed credential and browser storage-state tests in `node tools/ctx-aide/ctx-aide.test.mjs`.
  smoke:
    - Run env-backed `ctxa workflow views` and confirm logged-in readiness without printing secret values.
    - Run `ctxa credentials import-browser-state` against a temp storage-state file and confirm redacted output.
  screenshots: []
completion:
  commit: browser-auth-view-management-change
  completed_at: 2026-06-26
---

# Add Browser Auth View Management

## Outcome

Make browser validation distinguish logged-out and logged-in views, and provide redacted credential/session management commands for logged-in validation.

## Context

Browser validation needs more than pinned Playwright dependencies. A target app can render different logged-out and logged-in surfaces, and agents need a deterministic way to know whether logged-in validation has usable credentials or session state. Credential handling must not leak secret values into stdout, tickets, generated context, or commits.

## Positive Rules

- Preserve JSON-first command output.
- Keep view-state declarations in workflow markdown.
- Treat env variables, untracked env files, and imported browser storage-state files as valid credential sources.
- Redact all credential and cookie values from command output.

## Negative Rules

- Do not scrape browser password stores.
- Do not commit `.ctx-aide/` credential or storage-state artifacts.
- Do not mark logged-in browser validation ready unless a credential source or storage-state file exists.
- Stop and escalate if a workflow needs credentials from a source that cannot be checked non-interactively.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate in generated context.

## Frozen Decisions

- `workflow.browser-validation` declares `logged-out` and `logged-in` view states.
- `logged-in` uses the `browser-test-user` credential profile.
- `browser-test-user` is satisfied by `BROWSER_TEST_EMAIL` and `BROWSER_TEST_PASSWORD`, `.ctx-aide/credentials/browser-test-user.env`, or `.ctx-aide/browser/browser-test-user.storage-state.json`.
- Browser state import accepts Playwright-compatible storage-state JSON and copies it only when `--write` is passed.
- `.ctx-aide/` is ignored because it may contain local secrets or session cookies.

## Implementation Rules

- Required approach: extend the existing dependency-free Node CLI.
- Existing components/helpers to use: workflow markdown parsing, `printResult`, `argValue`, and fixture tests.
- Anti-patterns to avoid: secret printing, browser password scraping, hidden interactive prompts.
- Stop and escalate if: credential import would need direct access to a browser password database.

## Scope

- In:
  - `ctxa workflow views`.
  - `ctxa credentials check`.
  - `ctxa credentials import-browser-state`.
  - Browser workflow view and credential metadata.
  - README, `.gitignore`, and tests.
- Out:
  - Real browser automation to generate storage-state files.
  - Browser password-store integration.
  - Hosted secret storage.

## Acceptance Criteria

- `ctxa workflow views` reports logged-out and logged-in readiness separately.
- `ctxa credentials check` reports source readiness without printing secret values.
- `ctxa credentials import-browser-state` validates and copies storage-state JSON with redacted output.
- `.ctx-aide/` is ignored.

## Validation

- Automated:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
- Smoke:
  - `BROWSER_TEST_EMAIL=agent@example.test BROWSER_TEST_PASSWORD=secret node tools/ctx-aide/ctx-aide.mjs workflow views --workflow workflow.browser-validation --repo . --json`
  - `node tools/ctx-aide/ctx-aide.mjs credentials import-browser-state --profile browser-test-user --from <temp-storage-state.json> --repo . --out <temp-out.json> --write --force --json`
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: browser-auth-view-management-change
- Verification evidence:
  - `make validate`
  - Env-backed logged-in workflow view smoke passed with redacted output.
  - Browser storage-state import smoke passed with redacted output.
- Follow-up tickets:
  - Add Playwright helper generation for producing storage-state files from target app login flows.
