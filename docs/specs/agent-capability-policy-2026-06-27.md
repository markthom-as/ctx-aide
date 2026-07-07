---
id: spec.agent-capability-policy-2026-06-27
status: done
title: Agent Capability Policy
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-27
---

# Agent Capability Policy

## Goal

Make ctx-aide aware of agent runtime tools and skills, with repo-local policy for global and workflow-step allow/deny decisions.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `docs/config`, `README.md`.
- Components: none.
- Flows: `flow.ctx-aide-dogfood`.
- Design-system areas: none.

## Existing Context

- `ctxa workflow deps/views/validation-plan` already exposes workflow readiness as structured JSON.
- Workflow dependencies describe repo-pinned runtime prerequisites, while agent capabilities are supplied by the invoking agent environment and should be policy-gated rather than installed.
- Staff-review hardening requires parseable output, non-interactive commands, and lint-enforced config.

## Product Decisions

- Decision: capability policy is advisory and enforceable at planning/check time; it does not attempt to control the host agent runtime directly.
- Rationale: ctx-aide can make allowed tools explicit and testable without claiming ownership over Codex, Claude, browser, or connector availability.
- Regression risk: agents may over-trust policy if the output does not distinguish catalog awareness from live runtime availability.

## Architecture Decisions

- Decision: add a dedicated `docs/config/ctx-aide.tools.json` policy file with built-in defaults and a built-in capability catalog.
- Rationale: tools/skills policy has different semantics than package dependencies, browser views, or validation breakpoints.
- Rejected alternatives: overloading `workflow_dependencies`, because dependencies are installability/readiness checks and capabilities are authorization/context decisions.

## Design Decisions

- Decision: expose `ctxa tools list`, `ctxa tools policy`, and `ctxa tools check` JSON commands.
- Components/tokens to use: existing CLI output helpers and command naming.
- Anti-patterns to avoid: human-only prose policy, prompts, shell execution, and unbounded capability dumps.

## Security and Privacy Decisions

- Data touched: repo-local config and capability identifiers only.
- Trust boundaries: external connectors and host tools may touch private data or paid infrastructure.
- Required safeguards: deny wins over allow, unknown capability ids fail lint unless explicitly namespaced as `custom.*`, and policy output must not include secrets.

## Open Questions

None for this implementation.

## Hardening Review

- Architecture: separate policy from dependency installation to preserve clear responsibility.
- Design: command names match existing CLI verbs and return machine-readable JSON.
- Security: global deny can block connectors, browser control, shell, paid infrastructure, or generated-media tools before workflow-specific allowlists are applied.
- Best practices: lint catches invalid ids and conflicting allow/deny entries.
- Testing: fixture tests cover defaults, workflow-step overrides, deny precedence, unknown ids, and malformed policy.
- Parallelization: catalog/default config and resolver docs can be reviewed independently, but implementation touches shared CLI/test files and should commit sequentially.

## Ticket Plan

- Independent tickets: catalog/config and docs can be reasoned about independently.
- Sequential tickets: command resolver depends on catalog/config helpers; validation/docs depends on command behavior.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, and `README.md`.
