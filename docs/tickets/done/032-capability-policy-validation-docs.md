---
id: ticket.context.032
status: done
title: Validate and document capability policy
ticket_pack: pack.ctx-aide-agent-capability-policy-2026-06-27
milestones:
  - milestone.ctx-aide-agent-capability-policy
source_spec: spec.agent-capability-policy-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: closeout
depends_on:
  - ticket.context.030
  - ticket.context.031
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - README.md
  directories:
    - docs/config
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "validate and document agent capability policy"
  generated_at: 2026-06-27
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - make validate
    - make smoke
    - node tools/ctx-aide/ctx-aide.mjs tools list --json
    - node tools/ctx-aide/ctx-aide.mjs tools check --capability tool.semble --json
  smoke: []
  screenshots: []
completion:
  commit: validate-and-document-capability-policy
  completed_at: 2026-06-27
---

# Validate And Document Capability Policy

## Outcome

Make capability policy enforceable through lint/doctor and documented enough for repo adoption.

## Context

Policy is not production-ready unless malformed config fails checks and the command surface is discoverable from README and usage output.

## Positive Rules

- Add lint/doctor validation for malformed policy, overlapping allow/deny entries, and unknown ids.
- Document that policy is repo-local guidance, not live host-runtime enforcement.
- Close the ticket pack only after full validation passes.

## Negative Rules

- Do not document capabilities as guaranteed available at runtime.
- Do not allow conflicting allow/deny entries to pass checks.
- Do not leave pack completion metadata pending.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: lint validates policy shape and known ids; it does not probe external auth or paid services.
- Rationale: ctx-aide remains local, deterministic, and non-invasive.

## Implementation Rules

- Required approach: wire validation into existing checks and update usage/README.
- Existing components/helpers to use: `runChecks`, `doctor`, command usage list.
- Anti-patterns to avoid: docs-only behavior and brittle string parsing.
- Stop and escalate if: validation needs network access or paid infrastructure.

## Scope

- In: validation, docs, usage output, final pack/ticket metadata.
- Out: new hosting, connector auth, and target repo production-code changes.

## Acceptance Criteria

- `ctx-aide lint --json` reports invalid policy ids and allow/deny overlaps.
- README shows global and workflow-step policy examples.
- `make validate` and `make smoke` pass.
- Pack and ticket completion metadata are updated truthfully.

## Validation

- Automated: frontmatter commands.
- Smoke: `ctx-aide tools list` and `ctx-aide tools check`.
- Screenshots: none.

## Implementation Notes

This ticket performs closeout after the first two implementation commits.

## Completion

- Status: done
- Commit: validate-and-document-capability-policy
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs lint --json`
  - `node tools/ctx-aide/ctx-aide.mjs tools list --json`
  - `node tools/ctx-aide/ctx-aide.mjs tools check --capability tool.semble --json`
  - `make validate`
  - `make smoke`
- Follow-up tickets: none.
