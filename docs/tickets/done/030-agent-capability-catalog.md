---
id: ticket.context.030
status: done
title: Add agent capability catalog config
ticket_pack: pack.repo-context-agent-capability-policy-2026-06-27
milestones:
  - milestone.repo-context-agent-capability-policy
source_spec: spec.agent-capability-policy-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: catalog
depends_on: []
blocks:
  - ticket.context.031
  - ticket.context.032
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
  directories:
    - docs/config
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "add agent capability catalog and global policy config"
  generated_at: 2026-06-27
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs tools list --json
  smoke: []
  screenshots: []
completion:
  commit: add-agent-capability-catalog
  completed_at: 2026-06-27
---

# Add Agent Capability Catalog Config

## Outcome

Add a built-in capability catalog and a repo-local config shape for global allow/deny policy.

## Context

Agent tools and skills are supplied by the host runtime, not by target repos. Repo-context should make expected capabilities explicit without claiming they are installed or authenticated.

## Positive Rules

- Preserve dependency catalog semantics for installable repo requirements.
- Prefer namespaced capability ids such as `tool.semble`, `skill.playwright`, and `app.github`.
- Treat `custom.*` ids as deliberate repo-local extensions.

## Negative Rules

- Do not execute or authenticate external tools.
- Do not store secrets or connector credentials in policy config.
- Do not mark unknown capability ids as valid unless they use `custom.*`.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: add `docs/config/repo-context.tools.json` as the default policy path.
- Rationale: agent capability policy is separate from workflow dependency installation.

## Implementation Rules

- Required approach: add built-in catalog/default policy helpers and a `ctx tools list --json` command.
- Existing components/helpers to use: JSON parsing helpers, `argValue`, existing `printResult` command dispatch.
- Anti-patterns to avoid: broad runtime probing, shell execution, and connector calls.
- Stop and escalate if: implementation requires live Codex host APIs.

## Scope

- In: catalog, default global policy, config loading, list command, fixture tests.
- Out: workflow-step resolver and docs closeout.

## Acceptance Criteria

- `ctx tools list --json` returns catalog entries and effective global policy metadata.
- Missing config falls back to built-in defaults.
- A valid policy file can extend defaults with `custom.*` capability ids.

## Validation

- Automated: `node tools/context/ctx.test.mjs`.
- Smoke: `node tools/context/ctx.mjs tools list --json`.
- Screenshots: none.

## Implementation Notes

Keep response size bounded by default and include a `--capability` filter if needed.

## Completion

- Status: done
- Commit: add-agent-capability-catalog
- Verification evidence:
  - `node --check tools/context/ctx.mjs`
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs tools list --json`
- Follow-up tickets: `ticket.context.031`, `ticket.context.032`.
