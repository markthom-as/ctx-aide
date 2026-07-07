---
id: ticket.context.034
status: done
title: Add capability policy to implementation plans
ticket_pack: pack.ctx-aide-adoption-capability-policy-propagation-2026-06-27
milestones:
  - milestone.ctx-aide-adoption-capability-policy-propagation
source_spec: spec.adoption-capability-policy-propagation-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: implementation-plan
depends_on:
  - ticket.context.033
blocks:
  - ticket.context.035
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add capability policy to generated tickets and implementation plans"
  generated_at: 2026-06-27
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke: []
  screenshots: []
completion:
  commit: add-capability-policy-to-implementation-plans
  completed_at: 2026-06-27
---

# Add Capability Policy To Implementation Plans

## Outcome

Generated adoption tickets can declare capability workflow/step metadata, and implementation-plan output includes the resolved policy for that ticket.

## Context

Agents currently need to call `ctx-aide tools policy` separately and infer which workflow/step applies to a ticket.

## Positive Rules

- Prefer explicit ticket metadata over task inference.
- Include a re-check command in the implementation-plan output.
- Keep policy output structured, bounded, and secret-free.

## Negative Rules

- Do not block legacy target tickets that lack capability metadata.
- Do not treat policy as live proof that a host connector is authenticated.
- Do not add prose-only policy that tests cannot assert.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: adoption ticket accepts `--capability-workflow` and `--capability-step`; implementation-plan also accepts command-line overrides.
- Rationale: generated tickets can be explicit, and legacy tickets can still be planned without editing.

## Implementation Rules

- Required approach: add ticket frontmatter metadata and reuse `resolveAgentPolicy` for implementation-plan output.
- Existing components/helpers to use: `nestedFrontmatterValue`, `readAgentToolsConfig`, `mergedCapabilityCatalog`, and `capabilityPolicyDecision`.
- Anti-patterns to avoid: guessing workflow ids from ticket titles.
- Stop and escalate if: policy output would need live runtime capability discovery.

## Scope

- In: generated ticket metadata, implementation-plan output, tests for generated and legacy tickets.
- Out: target policy bootstrap/status and docs closeout.

## Acceptance Criteria

- `ctx-aide adoption ticket --capability-workflow ... --capability-step ...` writes metadata into the ticket.
- `ctx-aide adoption implementation-plan` returns capability workflow, step, policy, and check command.
- Legacy tickets without metadata still return a global/default policy envelope.
- Command-line workflow/step overrides work without editing a ticket.

## Validation

- Automated: frontmatter commands.
- Smoke: fixture implementation-plan output includes policy.
- Screenshots: none.

## Implementation Notes

Do not make denied capabilities fail implementation-plan; planning should show policy, while `ctx-aide tools check` remains the failing guard.

## Completion

- Status: done
- Commit: add-capability-policy-to-implementation-plans
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs tools check --repo . --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json`
- Follow-up tickets: `ticket.context.035`.
