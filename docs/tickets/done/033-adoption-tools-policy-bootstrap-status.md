---
id: ticket.context.033
status: done
title: Add adoption tools policy bootstrap status
ticket_pack: pack.repo-context-adoption-capability-policy-propagation-2026-06-27
milestones:
  - milestone.repo-context-adoption-capability-policy-propagation
source_spec: spec.adoption-capability-policy-propagation-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: bootstrap-status
depends_on: []
blocks:
  - ticket.context.034
  - ticket.context.035
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
  directories: []
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "add target adoption tools policy bootstrap and status"
  generated_at: 2026-06-27
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node --check tools/context/ctx.mjs
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json returns expected bootstrap blockers
  smoke: []
  screenshots: []
completion:
  commit: add-adoption-tools-policy-bootstrap-status
  completed_at: 2026-06-27
---

# Add Adoption Tools Policy Bootstrap Status

## Outcome

`ctx adoption bootstrap` writes a target tools policy file, and `ctx adoption status` reports whether target policy exists and validates.

## Context

The source repo now has `docs/config/repo-context.tools.json`, but target repos do not receive that policy during adoption bootstrap.

## Positive Rules

- Seed target policy as a normal repo-local config file.
- Keep bootstrap dry-run non-mutating.
- Report policy errors as adoption blockers.

## Negative Rules

- Do not overwrite an existing target policy unless `--force` is passed.
- Do not authenticate or probe connectors.
- Do not run target workflow commands.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: adoption bootstrap writes the same default policy shape used by the source repo.
- Rationale: target repos should start from a conservative deny list and can edit policy later.

## Implementation Rules

- Required approach: add a target policy template helper and include it in adoption status path checks.
- Existing components/helpers to use: `defaultAgentToolsConfig`, `readAgentToolsConfig`, `writeFileIfAllowed`, and adoption status helpers.
- Anti-patterns to avoid: copying host-runtime availability into target config.
- Stop and escalate if: target policy generation requires live agent tool discovery.

## Scope

- In: bootstrap write, status output, blocker/warning behavior, fixture tests.
- Out: generated ticket metadata and implementation-plan policy output.

## Acceptance Criteria

- Dry-run bootstrap plans `docs/config/repo-context.tools.json` without writing it.
- Write bootstrap creates `docs/config/repo-context.tools.json`.
- Adoption status reports policy config path, existence, ok state, and validation errors.
- Invalid target policy creates a status blocker.

## Validation

- Automated: frontmatter commands.
- Smoke: Astrotechne adoption status dry-run.
- Screenshots: none.

## Implementation Notes

Keep target status bounded; do not dump the full capability catalog in adoption status.

## Completion

- Status: done
- Commit: add-adoption-tools-policy-bootstrap-status
- Verification evidence:
  - `node --check tools/context/ctx.mjs`
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json` returned expected missing bootstrap/tools policy blockers
- Follow-up tickets: `ticket.context.034`, `ticket.context.035`.
