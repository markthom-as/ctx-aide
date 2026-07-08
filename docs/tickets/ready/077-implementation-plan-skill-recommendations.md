---
id: ticket.context.077
status: ready
title: Recommend skills in implementation plans
ticket_pack: pack.ctx-aide-repo-skill-task-discovery-2026-07-08
milestones:
  - milestone.ctx-aide-repo-skill-task-discovery
source_spec: spec.repo-skill-task-discovery-2026-07-08
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: planning
depends_on:
  - ticket.context.073
  - ticket.context.074
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/tickets
    - docs/ticket-packs
    - docs/config
    - skills
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "surface skill recommendations in implementation plans"
  generated_at: 2026-07-08
  context_ids:
    - spec.repo-skill-task-discovery-2026-07-08
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs adoption implementation-plan --repo <fixture> --ticket <fixture-ticket> --json
    - node tools/ctx-aide/ctx-aide.mjs tools check --repo <fixture> --workflow workflow.target-implementation --step implementation --capability <fixture-skill-capability> --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Recommend Skills In Implementation Plans

## Outcome

`ctxa adoption implementation-plan` includes policy-aware skill recommendations for the ticket being planned, using repo-local inventory and candidate scoring.

## Context

Implementation-plan output already includes capability policy. The next step is to tell the agent which existing skills are relevant to the ticket and which missing skills might be worth creating later.

## Positive Rules

- Preserve current implementation-plan behavior for legacy tickets.
- Prefer bounded recommendations with skill id, path, reason, policy decision, and check command.
- Reuse candidate scoring from `ticket.context.074`.

## Negative Rules

- Do not block implementation solely because an optional skill recommendation is missing.
- Do not recommend denied skills as usable.
- Do not create skill files or candidate markdown in implementation-plan.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: implementation plans may include `recommended_skills` and `missing_skill_candidates`.
- Rationale: agents need immediate guidance for available skills and a clean future-work path for skill-worthy gaps.
- Decision: missing skill candidates are advisory and do not write files from implementation-plan.
- Rationale: skill creation remains a ticketed authoring workflow.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: enrich implementation-plan output after loading ticket context, resolving capability policy, and inventorying repo-local skills.
- Existing components/helpers to use: adoption implementation-plan code, policy resolver, skill inventory, candidate scorer, and command catalog.
- Anti-patterns to avoid: mutating planning commands, hidden prompts, and suggestions that bypass deny-wins policy.
- Stop and escalate if: implementation-plan output becomes too large for bounded agent handoff.

## Scope

- In: implementation-plan recommendations, policy annotations, fixture tests, README snippets.
- Out: materializing skills, writing candidates, and changing ticket status.

## Acceptance Criteria

- Tickets with matching repo-local skills include `recommended_skills`.
- Denied skills show a denied policy decision and do not appear as usable.
- Tickets with repeated skill-worthy patterns but no matching skill include `missing_skill_candidates`.
- Legacy tickets without enough evidence preserve existing implementation-plan output plus an empty recommendation envelope.
- Output includes a command to re-run `ctxa skills candidates` for deeper review.

## Validation

- Automated: frontmatter commands.
- Smoke: fixture implementation-plan output includes a recommended skill and a denied-skill case.
- Screenshots: none.

## Implementation Notes

Keep this ticket read-only. Writing candidates belongs to `ticket.context.075`.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: none.
