---
id: spec.feedback-decomposition-2026-06-28
status: done
title: Feedback Decomposition
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

# Feedback Decomposition

## Goal

Make natural operator feedback decomposable into multiple candidate tickets or acceptance-criteria updates, with suggested clarification questions when the split is unclear.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `docs/workflows/feedback-review.md`.
- Components: none.
- Flows: feedback review, ticket promotion.
- Design-system areas: none.

## Existing Context

- `workflow.feedback-review` already defines review, capture, and promote stages.
- `ctxa feedback capture` writes markdown feedback entries.
- `ctxa feedback promote` creates follow-up tickets or updates acceptance criteria.

## Product Decisions

- Decision: natural responses should be planned before durable writes when they contain multiple points.
- Rationale: operators often give several separate observations in one response.
- Regression risk: a single broad ticket can hide unrelated work or unclear acceptance criteria.

## Architecture Decisions

- Decision: add a side-effect-free `ctxa feedback plan` command and include decomposition metadata in `ctxa feedback capture`.
- Rationale: agents can inspect the split plan before writing markdown, while capture remains useful when called directly.
- Rejected alternatives: require the operator to pre-split feedback manually.

## Design Decisions

- Decision: the command returns suggested ticket titles, promotion modes, subpoints, and user prompts.
- Components/tokens to use: none.
- Anti-patterns to avoid: blank-ended clarification questions with no suggested path.

## Security and Privacy Decisions

- Data touched: operator feedback text and local ticket paths.
- Trust boundaries: repo-local command execution.
- Required safeguards: no external services and no paid infrastructure.

## Open Questions

None.

## Hardening Review

- Architecture: no-write planning command keeps mutation boundaries explicit.
- Design: suggested prompts let the agent ask targeted questions.
- Security: no external data transfer.
- Best practices: tests cover multi-point and subpoint decomposition.
- Testing: fixture tests exercise `ctxa feedback plan` and capture decomposition.
- Parallelization: single CLI/doc slice because the files are shared.

## Ticket Plan

- Independent tickets: `ticket.context.037`.
- Sequential tickets: none.
- Shared files that require coordination: feedback CLI helpers and workflow docs.
