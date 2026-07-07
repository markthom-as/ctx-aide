---
id: ticket.context.031
status: done
title: Resolve workflow step capability policy
ticket_pack: pack.ctx-aide-agent-capability-policy-2026-06-27
milestones:
  - milestone.ctx-aide-agent-capability-policy
source_spec: spec.agent-capability-policy-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: resolver
depends_on:
  - ticket.context.030
blocks:
  - ticket.context.032
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - docs/config
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "resolve global workflow and workflow step tool policy"
  generated_at: 2026-06-27
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs tools policy --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json
    - node tools/ctx-aide/ctx-aide.mjs tools policy --workflow workflow.browser-validation --step browser-smoke --capability tool.computer-use --json
  smoke: []
  screenshots: []
completion:
  commit: resolve-workflow-step-tool-policy
  completed_at: 2026-06-27
---

# Resolve Workflow Step Capability Policy

## Outcome

Resolve global, workflow-level, and workflow-step allow/deny policy for agent capabilities.

## Context

The user needs both global policy and workflow-step policy. Agents should be able to ask whether a capability is allowed before choosing a tool or skill.

## Positive Rules

- Preserve deny-wins semantics.
- Include reason strings that identify the layer that allowed or denied a capability.
- Keep JSON output stable and parseable.

## Negative Rules

- Do not make policy depend on live connector authentication state.
- Do not hide unknown workflow ids or malformed config.
- Do not output secrets from env or credential files.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: allowlists are restrictive only when at least one allow entry applies after layering.
- Rationale: this supports both blacklist-only and whitelist-style policies.

## Implementation Rules

- Required approach: add `ctx-aide tools policy` and `ctx-aide tools check` commands with optional `--workflow`, `--step`, and required-or-optional `--capability`.
- Existing components/helpers to use: workflow selection helpers and JSON config parsing.
- Anti-patterns to avoid: ambiguous boolean-only answers and non-deterministic ordering.
- Stop and escalate if: workflow steps need a new markdown workflow schema before policy can be useful.

## Scope

- In: policy resolution, check command, tests for layer precedence and workflow/step scope.
- Out: markdown workflow schema migration and host-runtime enforcement.

## Acceptance Criteria

- Global deny blocks a capability even if workflow or step allow includes it.
- Step deny blocks a capability even if global allow includes it.
- Workflow/step allow can approve a capability not globally listed when there is no deny.
- `ctx-aide tools check` exits non-zero when a requested capability is denied.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`.
- Smoke: listed frontmatter commands.
- Screenshots: none.

## Implementation Notes

Return the layered policy and a decision envelope so agents can explain why a capability was or was not available.

## Completion

- Status: done
- Commit: resolve-workflow-step-tool-policy
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs tools policy --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json`
  - `node tools/ctx-aide/ctx-aide.mjs tools check --workflow workflow.browser-validation --step browser-smoke --capability tool.computer-use --json` returned the expected denial
- Follow-up tickets: `ticket.context.032`.
