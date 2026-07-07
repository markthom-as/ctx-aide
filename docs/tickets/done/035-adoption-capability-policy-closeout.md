---
id: ticket.context.035
status: done
title: Document adoption capability policy propagation
ticket_pack: pack.ctx-aide-adoption-capability-policy-propagation-2026-06-27
milestones:
  - milestone.ctx-aide-adoption-capability-policy-propagation
source_spec: spec.adoption-capability-policy-propagation-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: closeout
depends_on:
  - ticket.context.033
  - ticket.context.034
blocks: []
scope:
  routes: []
  files:
    - README.md
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "document and close out adoption capability policy propagation"
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
    - node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json returns expected bootstrap blockers
  smoke: []
  screenshots: []
completion:
  commit: document-adoption-capability-policy-propagation
  completed_at: 2026-06-27
---

# Document Adoption Capability Policy Propagation

## Outcome

Document the target adoption capability policy flow and close the pack with full validation evidence.

## Context

The feature is not adoption-ready unless README and command usage tell agents how bootstrap, generated tickets, implementation-plan, and `ctx-aide tools check` fit together.

## Positive Rules

- Document that policy is deterministic repo guidance, not live host-runtime auth.
- Keep examples copy-pasteable.
- Close pack and tickets only after full validation.

## Negative Rules

- Do not imply policy can enforce host tool availability.
- Do not leave pack completion metadata pending.
- Do not skip Astrotechne dry-run evidence.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: docs show adoption policy as part of pre-production bootstrap, not as a production-code change.
- Rationale: this is preparation for safer target repo work.

## Implementation Rules

- Required approach: update README, usage text if needed, run full validation, and update metadata.
- Existing components/helpers to use: existing README Adoption and Agent Capability sections.
- Anti-patterns to avoid: new commands without docs or docs without tests.
- Stop and escalate if: Astrotechne status would require writes or paid infra.

## Scope

- In: README, usage, final validation, ticket/pack/spec metadata.
- Out: new policy behavior beyond tickets 033 and 034.

## Acceptance Criteria

- README describes target bootstrap/status and implementation-plan capability policy output.
- `make validate` and `make smoke` pass.
- Astrotechne adoption status remains read-only.
- Pack completion metadata is truthful.

## Validation

- Automated: frontmatter commands.
- Smoke: Astrotechne adoption status dry-run.
- Screenshots: none.

## Implementation Notes

Use exact command examples that match the implemented CLI.

## Completion

- Status: done
- Commit: document-adoption-capability-policy-propagation
- Verification evidence:
  - `make validate`
  - `make smoke`
  - `node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json` returned expected bootstrap/tools policy blockers
- Follow-up tickets: none.
