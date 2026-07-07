---
id: ticket.context.052
status: done
title: Add screenshot feedback review UI
ticket_pack: pack.screenshot-feedback-review-ui-2026-07-07
milestones:
  - milestone.ctx-aide-feedback-review
source_spec: null
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-ui
depends_on:
  - ticket.context.036
  - ticket.context.037
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
  task: "Add screenshot feedback review UI"
  generated_at: 2026-07-07
  context_ids:
    - workflow.feedback-review
    - workflow.browser-validation
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.feedback-review-promotes-actionable-work
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs feedback review-ui --repo . --help
    - temporary screenshot live-server API smoke
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07
---

# Add Screenshot Feedback Review UI

## Outcome

Add a local browser UI that lets operators review screenshot artifacts, record per-screenshot feedback, preview proposed ticket splits, and write canonical ctxa ticket markdown only after confirmation.

## Context

Astrotechne added a local screenshot review UI for screenshot feedback and ticket drafting. CTX Aide already has CLI feedback review, decomposition, capture, and promotion commands, but does not yet provide the visual review surface that bridges screenshots to new tickets.

## Positive Rules

- Keep screenshot review local-only and bind the server to `127.0.0.1`.
- Reuse ctxa ticket readiness discipline when writing ticket markdown.
- Preview draft ticket candidates before writing files.
- Support both screenshot run `summary.json` files and plain screenshot directories.

## Negative Rules

- Do not upload screenshots or use hosted infrastructure.
- Do not write files before explicit confirmation.
- Do not mark screenshot feedback tickets as `ready` automatically.
- Do not serve arbitrary local files through the review server.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.feedback-review-promotes-actionable-work`: Operator feedback becomes either acceptance criteria or follow-up tickets.

## Frozen Decisions

- Command: `ctxa feedback review-ui`.
- Server bind address: `127.0.0.1`.
- Generated ticket status: `needs-questions`.
- Cost delta: `$0/month`; this is local-only tooling.

## Implementation Rules

- Required approach: add a small local HTTP server and a self-contained browser UI backed by repo-local JSON feedback.
- Existing components/helpers to use: feedback workflow rules, screenshot artifact conventions, ticket validation schema, and decomposition heuristics.
- Anti-patterns to avoid: external AI services, hosted review state, broad target-repo assumptions, and direct implementation-ready ticket creation.
- Stop and escalate if: the UI requires paid infrastructure or browser credential access.

## Scope

- In: review UI command, screenshot discovery, feedback autosave, draft-ticket preview, confirmed canonical ticket writes, tests, and workflow docs.
- Out: screenshot capture execution, production deployment, external sharing, and implementation of generated tickets.

## Acceptance Criteria

- `ctxa feedback review-ui` starts a local-only screenshot review UI.
- The UI records per-screenshot status, severity, title, tags, and feedback notes.
- Draft planning splits structured multi-issue feedback before writing files.
- No ticket markdown is written until the draft review stop is confirmed.
- Confirmed tickets are canonical ctx-aide markdown in `needs-questions`.
- The server only serves discovered screenshot image files.

## Validation

- Automated:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node --check tools/ctx-aide/screenshot-review-ui.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- Smoke:
  - `node tools/ctx-aide/ctx-aide.mjs feedback review-ui --repo . --help`
- Screenshots:
  - Not required; this is local tooling validated through focused API tests.

## Completion

- Status: done
- Commit: current-change
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node --check tools/ctx-aide/screenshot-review-ui.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `node tools/ctx-aide/ctx-aide.mjs feedback review-ui --repo . --help --json`
  - Temporary screenshot live-server API smoke returned `{"ok":true,"screenshots":1,"bind":true}`.
  - `make validate`
- Follow-up tickets: none.
