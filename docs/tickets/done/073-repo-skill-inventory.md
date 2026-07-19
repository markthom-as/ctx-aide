---
id: ticket.context.073
status: done
title: Add repo-local skill inventory
ticket_pack: pack.ctx-aide-repo-skill-task-discovery-2026-07-08
milestones:
  - milestone.ctx-aide-repo-skill-task-discovery
source_spec: spec.repo-skill-task-discovery-2026-07-08
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: inventory
depends_on: []
blocks:
  - ticket.context.074
  - ticket.context.077
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - skills
    - docs/config
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "inventory repo-local skills and validate skill manifests"
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
    - node tools/ctx-aide/ctx-aide.mjs skills inventory --repo . --json
    - node tools/ctx-aide/ctx-aide.mjs skills check --repo . --json
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-19T10:04:45Z
---

# Add Repo-Local Skill Inventory

## Outcome

`ctxa skills inventory` lists repo-local skills and `ctxa skills check` validates skill manifest shape without installing, authenticating, or publishing anything.

## Context

The capability catalog already knows about generic `skill.*` ids, but CTX Aide cannot yet inspect repo-local `skills/<name>/SKILL.md` files as first-class planning inputs.

## Positive Rules

- Preserve the existing capability catalog and deny-wins policy behavior.
- Prefer structured JSON with bounded fields: skill id, path, name, description, source, status, risk, and validation warnings.
- Reuse the existing command catalog, argument parsing, and test fixture style.

## Negative Rules

- Do not install skills globally or mutate host Codex configuration.
- Do not treat inventory as proof that the host agent has loaded or activated a skill.
- Do not read arbitrary user-level skill folders in this ticket.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: inventory reads only repo-local `skills/*/SKILL.md` by default.
- Rationale: this pack is about skill fit within the repo, not machine-wide skill management.
- Decision: `ctxa skills check` validates metadata and structural sections but does not enforce content style beyond bounded safety rules.
- Rationale: exact skill content should remain reviewable and domain-specific.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: add a `skills` command group with `inventory` and `check`; parse skill frontmatter with existing markdown helpers where possible.
- Existing components/helpers to use: command dispatch, `printResult`, JSON parsing helpers, repo path display helpers, and `command-catalog.mjs`.
- Anti-patterns to avoid: broad filesystem scans, global skill installation, connector calls, and hidden runtime probing.
- Stop and escalate if: implementation requires changing the public skill file format.

## Scope

- In: repo-local inventory, validation warnings, command catalog entries, tests, README snippets.
- Out: candidate scoring, skill materialization, implementation-plan recommendations, and global installation.

## Acceptance Criteria

- `ctxa skills inventory --repo . --json` returns repo-local skills with stable ids and relative paths.
- `ctxa skills check --repo . --json` fails on missing frontmatter name/description, duplicate skill ids, or unreadable skill files.
- Missing `skills/` returns an empty inventory with `ok: true`.
- Policy output remains separate from inventory and deny-wins behavior is unchanged.

## Validation

- Automated: frontmatter commands.
- Smoke: run inventory and check against this repo.
- Screenshots: none.

## Implementation Notes

Keep output bounded and avoid embedding full skill bodies.

## Completion

- Status: done
- Commit: current-change
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs skills inventory --repo . --json`
  - `node tools/ctx-aide/ctx-aide.mjs skills check --repo . --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- Follow-up tickets: `ticket.context.074`, `ticket.context.077`.
