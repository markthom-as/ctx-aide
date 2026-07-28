---
id: ticket.context.088
status: ready
title: Harden screenshot review security and lifecycle
ticket_pack: pack.vakos-integration-prerequisites-2026-07-28
milestones:
  - milestone.vakos-integration-prerequisites
source_spec: spec.vakos-adoption-readiness-2026-07-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: screenshot-security
depends_on:
  - ticket.context.084
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/screenshot-review-ui.mjs
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/context/schema
  components: []
  flows:
    - flow.ctx-aide-feedback-review
context_query:
  task: "harden the local screenshot feedback server request asset and owned process lifecycle"
  generated_at: 2026-07-28
  context_ids:
    - spec.vakos-adoption-readiness-2026-07-27
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.feedback-review-promotes-actionable-work
validation:
  automated:
    - npm test
    - make validate
  smoke:
    - Start one ephemeral loopback review session, verify its readiness receipt, stop it gracefully, and prove the listener is gone.
  screenshots:
    - Use bounded synthetic image fixtures only; no vakOS product screenshot is required upstream.
completion:
  commit: pending
  completed_at: null
---

# Harden Screenshot Review Security And Lifecycle

## Outcome

The optional screenshot review UI can be enabled by a target repository with a
bounded local-only request, asset, mutation, and process lifecycle that is
machine-testable and leaves no listener or session material behind.

## Context

Loopback binding is useful but does not by itself prevent hostile Host headers,
DNS rebinding, cross-origin mutation, symlink escape, oversized assets, or
orphaned listeners. vakOS keeps the feature disabled until these guarantees are
implemented and exposed through a structured lifecycle receipt.

## Positive Rules

- Reuse the existing feedback plan/review commands and local review UI.
- Expose exact bind address, ephemeral port, readiness, bounded idle timeout,
  and graceful-stop behavior in the command registry.
- Promote accepted feedback only through explicit checked-in Markdown writes.

## Negative Rules

- Do not bind beyond loopback, fetch remote assets, load remote scripts, emit
  telemetry, or accept credentials/browser state.
- Do not trust loopback alone for Host, Origin, or mutation authorization.
- Do not leave a listener, temporary nonce, or partial markdown file after
  interrupt, timeout, validation failure, or test completion.

## Axioms

- axiom.markdown-source-of-truth: screenshots and UI state are evidence;
  explicitly accepted Markdown is the durable result.
- axiom.ticket-done-requires-commit: completion requires a focused commit and
  post-commit validation.
- axiom.feedback-review-promotes-actionable-work: draft feedback becomes a
  draft or needs-questions ticket, never ready or done automatically.

## Frozen Decisions

- Bind only to loopback on an ephemeral port.
- Every mutation requires the per-session nonce plus strict same-origin Host
  and Origin validation.
- Serve a restrictive CSP and only bounded declared image/metadata types from a
  realpath-contained source directory.
- The nonce is ephemeral and never enters tickets, screenshots, packs, or logs.
- Infrastructure cost delta is $0/month.

## Implementation Rules

- Centralize request validation and asset containment before route handlers.
- Use structured startup/readiness/shutdown receipts and a bounded idle timeout.
- Use synthetic fixtures for traversal, symlink, content-type, size, nonce,
  Host, Origin, CSP, interrupt, and cleanup tests.
- Stop if the implementation would require remote authentication, a hosted
  service, or weakening the explicit-write contract.

## Scope

- In: local server hardening, command metadata, lifecycle receipts, cleanup,
  tests, and operator documentation.
- Out: vakOS feature enablement, product UI changes, browser automation
  credentials, remote review, or Idvisor.

## Acceptance Criteria

- Invalid Host, Origin, nonce, method, content type, oversized input, traversal,
  and symlink escape fail before reading or writing sensitive bytes.
- Valid static responses include the frozen CSP and no remote executable
  content.
- Only the selected realpath-contained directory is readable.
- Startup returns bounded readiness data and shutdown/timeout/interrupt proves
  the listener and temporary session state are gone.
- Feedback writes are explicit, atomic, repo-confined, and produce only draft or
  needs-questions markdown.
- Full CLI tests remain noninteractive with empty success stderr in JSON mode.

## Validation

- Automated: focused server security/lifecycle fixtures, npm test, make
  validate, and diff checks.
- Smoke: one owned ephemeral session from readiness through verified shutdown.
- Screenshots: bounded synthetic fixtures only.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: vakOS graphical feedback pilot.
