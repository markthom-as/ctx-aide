---
id: ticket.context.075
status: ready
title: Promote skill candidates into tickets
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
  - ticket.context.074
blocks:
  - ticket.context.076
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/skill-candidates
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "promote skill candidates into markdown and implementation tickets"
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
    - node tools/ctx-aide/ctx-aide.mjs skills promote --repo . --candidate <fixture-candidate-id> --dry-run --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Promote Skill Candidates Into Tickets

## Outcome

Reviewed candidates can be written as `docs/skill-candidates/*.md` and promoted into ready skill-authoring tickets without directly mutating `skills/`.

## Context

Candidate scoring is advisory. Skill creation changes future agent behavior, so a candidate must become reviewable markdown and a normal implementation ticket before materialization.

## Positive Rules

- Preserve evidence, score factors, source task ids, proposed skill slug, risk level, validation commands, and stop conditions in candidate markdown.
- Prefer dry-run output and explicit `--write` for mutations.
- Reuse canonical ticket and pack conventions.

## Negative Rules

- Do not write `skills/<name>/SKILL.md` in this ticket.
- Do not mark generated skill-authoring tickets `done`.
- Do not promote candidates whose evidence contains secrets or unresolved paid-infrastructure behavior.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision: candidate markdown lives under `docs/skill-candidates/`.
- Rationale: candidates are durable planning artifacts but are not implementation tickets.
- Decision: promotion can create a skill-authoring ticket with status `ready` only when the candidate has no unresolved product, architecture, security, or cost questions.
- Rationale: materialization should not require new decisions.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: add `ctxa skills promote --candidate <id> --dry-run|--write --json`; generate candidate markdown first, then an optional ticket when criteria are satisfied.
- Existing components/helpers to use: markdown write helpers, ticket template conventions, status validators, and pack status helpers.
- Anti-patterns to avoid: direct skill writes, generated tickets without acceptance criteria, and candidate ids that drift between dry-run and write.
- Stop and escalate if: candidate promotion needs human answers not present in the candidate evidence.

## Scope

- In: candidate markdown schema, promote command, dry-run/write behavior, generated ticket metadata, tests, README snippets.
- Out: skill file materialization, global install, and implementation-plan recommendations.

## Acceptance Criteria

- `ctxa skills promote --repo <fixture> --candidate <id> --dry-run --json` previews candidate markdown and ticket output without writing.
- `--write` creates candidate markdown and, when ready, a ticket linked to the active skill-discovery pack.
- Promotion refuses candidates with unresolved security, privacy, cost, or product questions.
- Generated tickets include validation commands and stop/escalation conditions.

## Validation

- Automated: frontmatter commands.
- Smoke: promote a fixture candidate in dry-run and write modes.
- Screenshots: none.

## Implementation Notes

Use deterministic filenames based on candidate slug and avoid overwriting unless `--force` is supplied.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: `ticket.context.076`.
