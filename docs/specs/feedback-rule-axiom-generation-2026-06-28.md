---
id: spec.feedback-rule-axiom-generation-2026-06-28
status: done
title: Feedback Rule and Axiom Generation
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - workflow.feedback-review
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-28
---

# Feedback Rule and Axiom Generation

## Goal

Use operator feedback to suggest durable positive rules, negative rules, and axioms when the wording indicates a reusable preference, prohibition, or invariant.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/context/ctx.mjs`, `tools/context/ctx.test.mjs`, `docs/workflows/feedback-review.md`.
- Components: none.
- Flows: feedback planning, feedback capture, feedback promotion.
- Design-system areas: none.

## Existing Context

- Feedback planning already splits natural feedback into ticket candidates.
- Context entries and tickets already separate positive rules, negative rules, and axioms.
- Follow-up tickets generated from feedback already carry source feedback metadata.

## Product Decisions

- Decision: durable feedback should generate rule and axiom candidates when appropriate.
- Rationale: user feedback often encodes reusable operating preferences, not only one-off defects.
- Regression risk: over-promoting casual comments into rules could create noisy constraints.

## Architecture Decisions

- Decision: keep rule and axiom generation as suggestions in JSON and markdown, not automatic accepted policy.
- Rationale: the agent can show candidates to the user and confirm before treating them as durable constraints.
- Rejected alternatives: silently converting every feedback sentence into an axiom.

## Design Decisions

- Decision: detect durable modal language such as "always", "never", "must", "do not", and "should not".
- Components/tokens to use: none.
- Anti-patterns to avoid: blank-ended confirmation and hidden rules.

## Security and Privacy Decisions

- Data touched: operator feedback text and local markdown.
- Trust boundaries: repo-local command execution.
- Required safeguards: no external service calls.

## Open Questions

None.

## Hardening Review

- Architecture: suggestions remain structured data until captured/promoted.
- Design: candidates are visible in plan, capture, and follow-up ticket output.
- Security: local-only processing.
- Best practices: preserves positive and negative rule polarity.
- Testing: fixture tests cover rule and axiom suggestions through plan, capture, and promote.
- Parallelization: single CLI/doc/test slice.

## Ticket Plan

- Independent tickets: `ticket.context.038`.
- Sequential tickets: none.
- Shared files that require coordination: feedback workflow docs and CLI feedback helpers.
