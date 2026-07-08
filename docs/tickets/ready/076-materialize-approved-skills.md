---
id: ticket.context.076
status: ready
title: Materialize approved repo skills
ticket_pack: pack.ctx-aide-repo-skill-task-discovery-2026-07-08
milestones:
  - milestone.ctx-aide-repo-skill-task-discovery
source_spec: spec.repo-skill-task-discovery-2026-07-08
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: authoring
depends_on:
  - ticket.context.075
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/skill-candidates
    - skills
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "materialize approved skill candidates into repo-local skill drafts"
  generated_at: 2026-07-08
  context_ids:
    - spec.repo-skill-task-discovery-2026-07-08
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs skills materialize --repo <fixture> --candidate <fixture-candidate-id> --dry-run --json
    - node tools/ctx-aide/ctx-aide.mjs skills check --repo <fixture> --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Materialize Approved Repo Skills

## Outcome

`ctxa skills materialize` turns an approved candidate into a repo-local `skills/<slug>/SKILL.md` draft with validation evidence, while keeping dry-run behavior as the default.

## Context

The system should "make" skills only after candidate scoring and ticket promotion have frozen the evidence, scope, risk, and validation plan.

## Positive Rules

- Preserve candidate evidence and stop conditions in the generated skill.
- Prefer a compact skill body with when-to-use, workflow, inputs, validation, and escalation sections.
- Reuse repo-local templates if the candidate declares scripts, examples, or assets.

## Negative Rules

- Do not install generated skills into user-level Codex directories.
- Do not materialize candidates that are not approved by a ready or in-progress ticket.
- Do not include secrets, credentials, or long proprietary excerpts in skill files.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision: materialization writes repo-local skill drafts only.
- Rationale: global installation and plugin publication are separate distribution decisions.
- Decision: the generated skill must be valid inventory input immediately.
- Rationale: `ctxa skills check` should become the feedback loop for generated skill quality.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: add `ctxa skills materialize --candidate <id> --dry-run|--write --json`; default to dry-run and require `--write` for filesystem changes.
- Existing components/helpers to use: candidate parser, skill inventory/check, write helpers, path safety helpers, and command catalog.
- Anti-patterns to avoid: hidden global writes, unreviewed templates, broad source copying, and skill bodies that repeat entire tickets.
- Stop and escalate if: materialization would need an unapproved external connector, paid service, or global installation.

## Scope

- In: materialization command, generated skill template, collision handling, safety checks, tests, README snippets.
- Out: global skill installation, plugin packaging, hosted distribution, and connector authentication.

## Acceptance Criteria

- Dry-run output shows the target skill path, generated frontmatter, sections, validation commands, and write blockers.
- `--write` creates `skills/<slug>/SKILL.md` only for approved candidates.
- Existing skill paths are not overwritten without `--force`.
- `ctxa skills check --repo <fixture> --json` passes after materialization.
- Secret-like evidence blocks materialization.

## Validation

- Automated: frontmatter commands.
- Smoke: materialize a fixture skill and re-run skill inventory/check.
- Screenshots: none.

## Implementation Notes

Generated skills should remain concise; put longer examples under `skills/<slug>/examples/` only when the candidate explicitly includes them.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: none.
