---
id: spec.agent-driven-customization
status: draft
title: Agent-Driven Workflow Customization
owner_agent: codex-high-effort
source_feedback:
  - future.2026-06-25.agent-driven-customization
context_ids:
  - flow.workflow-customization
target_agents:
  spec:
    - codex-high-effort
    - claude-high-effort
  ui_design_review: claude-high-effort
  implementation: codex
created: 2026-06-25
---

# Agent-Driven Workflow Customization

## Goal

Define post-v0.1 customization that lets users choose ctx-aide workflow profiles and toggles through an agent-guided process without weakening required validation gates.

## Affected Surfaces

- Routes: none.
- Files/directories: `README.md`, `skills/ctx-aide/SKILL.md`, `tools/ctx-aide`, `docs/future-work`, `docs/ticket-packs`.
- Components: none.
- Flows: workflow customization, profile selection, dry-run validation.
- Design-system areas: none.

## Existing Context

The customization idea was captured as future work and promoted into `pack.ctx-aide-post-v0.1` with `ticket.context.014`. It should remain post-v0.1 so the baseline workflow can stabilize first.

## Product Decisions

- Decision: customization is optional and never required for basic ctx-aide use.
- Decision: profiles and toggles must be reviewable in repo-local markdown or config.
- Decision: a dry-run questionnaire should precede mutating CLI commands.
- Regression risk: customization could fragment the workflow or silently disable critical axioms.

## Architecture Decisions

- Decision: model profiles as explicit local configuration consumed by the skill and CLI.
- Decision: required axioms cannot be disabled by profile selection.
- Rejected alternatives: global-only user preferences, hidden agent memory settings, and hosted profile sync for v0.1.

## Design Decisions

- Decision: customization should be presented as a small set of named profiles plus explicit toggles.
- Components/tokens to use: not applicable for v0.1 documentation.
- Anti-patterns to avoid: preference sprawl, unclear defaults, and toggle names that hide behavioral consequences.

## Security and Privacy Decisions

- Data touched: local workflow preferences and generated context configuration.
- Trust boundaries: customization must not write secrets or expand scan scope without review.
- Required safeguards: validate that required axioms and scan exclusions remain active.

## Open Questions

- Which profiles ship first: `minimal`, `web-app`, `ui-heavy`, `idvisor-orchestrated`, or `strict`?
- Should persisted configuration use markdown, JSON, TOML, or generated agent packs?
- Which options are required axioms versus optional preferences?

## Hardening Review

- Architecture: keep the default path stable and make customization additive.
- Design: expose tradeoffs plainly through profile names and dry-run output.
- Security: prevent customization from disabling scan exclusions or required validation.
- Best practices: use JSON-first CLI output for agents and human-readable markdown for review.
- Testing: run profile dry-runs and prove required axioms cannot be disabled.
- Parallelization: implement after the MVP pack completes; one customization lane is sufficient.

## Ticket Plan

- Independent tickets: `ticket.context.014` after the MVP pack.
- Sequential tickets: profile model before mutating CLI commands.
- Shared files that require coordination: `README.md`, `skills/ctx-aide/SKILL.md`, and `tools/ctx-aide/ctx-aide.mjs`.
