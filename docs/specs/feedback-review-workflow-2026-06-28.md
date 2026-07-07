---
id: spec.feedback-review-workflow-2026-06-28
status: done
title: Feedback Review Workflow
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - workflow.spec-to-ticket
  - workflow.browser-validation
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-28
---

# Feedback Review Workflow

## Goal

Add a guided ticket feedback loop that summarizes review context, captures operator feedback as markdown, and promotes that feedback into follow-up tickets or current-ticket acceptance criteria.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `docs/workflows/`, `docs/context/feedback/`, `docs/tickets/`, `docs/ticket-packs/`.
- Components: none.
- Flows: ticket lifecycle, browser validation, feedback review.
- Design-system areas: none.

## Existing Context

- Browser validation already owns screenshot output policy and validation matrices.
- Spec-to-ticket already requires readiness gates before implementation.
- Feedback entries already exist as context entries under `docs/context/feedback/`.

## Product Decisions

- Decision: feedback review is a first-class workflow command surface.
- Rationale: operators need review packets that show URLs, scoped files, changed files, screenshot sizes, and screenshot dimensions without manually gathering context.
- Regression risk: feedback could become another unstructured note store unless promotion is explicit.

## Architecture Decisions

- Decision: implement JSON-first commands under `ctxa feedback`.
- Rationale: agents and future UIs can consume the same non-interactive packet and markdown mutation commands.
- Rejected alternatives: a separate hosted review app or a screenshot-only folder convention.

## Design Decisions

- Decision: no UI is added in this slice.
- Components/tokens to use: none.
- Anti-patterns to avoid: blocking prompts, hidden state, and feedback that bypasses markdown source of truth.

## Security and Privacy Decisions

- Data touched: local ticket metadata, screenshot paths, URLs, feedback text, and local git status.
- Trust boundaries: repo-local files and local artifacts.
- Required safeguards: no credential capture, no browser cookie inspection, no hosted infrastructure changes.

## Open Questions

None.

## Hardening Review

- Architecture: command output is parseable JSON and write commands require `--write`.
- Design: review packet is ready for a future guided UI without requiring one now.
- Security: local artifact metadata only; screenshot contents are not uploaded.
- Best practices: ambiguous feedback returns clarifying questions.
- Testing: fixture tests cover review, capture, acceptance-criteria promotion, and follow-up ticket promotion.
- Parallelization: single shared CLI/doc slice.

## Ticket Plan

- Independent tickets: `ticket.context.036`.
- Sequential tickets: none.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, workflow docs.
