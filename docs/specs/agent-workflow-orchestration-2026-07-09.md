---
id: spec.agent-workflow-orchestration-2026-07-09
status: ready
title: Agent Workflow Orchestration Hardening
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-09
---

# Agent Workflow Orchestration Hardening

## Goal

Make CTX Aide capture the workflow lessons from large agent-authored changes by turning reviewer/fixer roles, destructive-command restrictions, validation failure queues, and cost/resource limits into enforceable ticket-pack and ticket workflows.

## Affected Surfaces

- Routes: none.
- Files/directories: `docs/ticket-packs/templates`, `docs/tickets/templates`, `tools/ctx-aide`, `README.md`, `docs/workflows`.
- Components: none.
- Flows: `flow.ctx-aide-dogfood`, ticket-pack execution, implementation planning, validation failure triage.
- Design-system areas: none.

## Product Decisions

- Decision: CTX Aide should adopt the workflow mechanics, not a language rewrite mandate.
- Rationale: this repo is intentionally a local Node/npm markdown workflow tool, while the useful lesson is making agent work reviewable, bounded, and evidence-backed.
- Regression risk: overfitting to one high-scale rewrite story could add ceremony to normal ticket work.
- Decision: reviewer and fixer roles belong in pack/ticket run policy before implementation starts.
- Rationale: independent adversarial review is useful only if it is a planned role with a scoped artifact and acceptance gate.
- Regression risk: role metadata without validation would become prose-only policy.
- Decision: validation failures should become bounded importable work items.
- Rationale: compiler/test/check output is a better work queue than chat summaries when failures are numerous or parallelizable.
- Regression risk: noisy import could create too many low-value tickets if grouping and deduplication are weak.

## Architecture Decisions

- Decision: extend ticket-pack metadata and validation before adding orchestration runtime behavior.
- Rationale: markdown remains the source of truth; runtime automation should consume explicit repo-local policy later.
- Rejected alternatives: adding a hidden agent harness, remote queue service, or hosted orchestration layer.
- Decision: add a failure importer as a dry-run-first CLI surface.
- Rationale: operators need to inspect grouping before CTX Aide writes ticket markdown.
- Rejected alternatives: automatically writing ready tickets from raw tool output.
- Decision: destructive git and slow/resource-heavy command constraints should be represented as enforceable axiom/run-policy checks where possible.
- Rationale: agents in parallel worktrees need deterministic boundaries, not only style guidance.
- Rejected alternatives: relying on human review to catch `git reset`, `git stash`, skipped tests, or stub-to-green behavior after the fact.

## Design Decisions

- Decision: keep CLI output compact, structured, and source-linked.
- Components/tokens to use: existing JSON output conventions, ticket-pack status vocabulary, and markdown templates.
- Anti-patterns to avoid: dumping full compiler logs into tickets, creating unrelated implementation tickets, or adding in-app explanatory text.
- Decision: failure import should generate draft or needs-hardening tickets unless a future pack explicitly allows ready tickets.
- Components/tokens to use: existing ticket status folders and completion metadata.
- Anti-patterns to avoid: marking generated failure tickets ready without owner files, acceptance criteria, and validation.

## Security and Privacy Decisions

- Data touched: local command output, markdown tickets, ticket packs, workflow docs, and bounded source paths.
- Trust boundaries: tool output may include secrets, local paths, prompts, model responses, stack traces, or private source excerpts.
- Required safeguards:
  - Redact secret-like strings and raw prompt bodies from imported failure tickets.
  - Bound stdout/stderr input size before parsing.
  - Default all failure import commands to dry-run.
  - Keep paid infrastructure and provider execution out of scope.
  - Surface expected infrastructure cost delta before any future workflow adds paid runners, hosted queues, or remote execution.
- Cost delta: `$0/month` for the tickets in this pack.

## Open Questions

None for the initial ticket set. Future automation beyond markdown generation should get a separate spec that names runtime ownership and cost limits.

## Hardening Review

- Architecture: encode reviewer/fixer roles and failure import in markdown contracts before any agent runner consumes them.
- Design: keep outputs inspectable and avoid turning validation logs into unreadable ticket bodies.
- Security: bound and redact imported output; never let importer output include secrets or raw prompt text.
- Best practices: use Semble for behavioral source discovery, exact scans for existing ticket/pack metadata, and structured JSON for import output.
- Testing: cover template validation, pack checks, importer grouping, redaction, duplicate detection, and dry-run/write boundaries.
- Parallelization: policy metadata and failure import can be implemented independently if shared CLI edits are coordinated.

## Ticket Plan

- Independent tickets:
  - `ticket.context.078`: add adversarial review and fixer run-policy metadata plus validation.
  - `ticket.context.079`: import validation failure output into bounded ticket drafts.
- Sequential tickets: none.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `tools/ctx-aide/command-catalog.mjs`, `docs/ticket-packs/templates/ticket-pack.md`, `docs/tickets/templates/canonical-ticket.md`, and `README.md`.
