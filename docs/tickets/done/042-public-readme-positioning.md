---
id: ticket.context.042
status: done
title: Polish public README and positioning
ticket_pack: pack.ctx-aide-public-release-2026-07-01
milestones:
  - milestone.ctx-aide-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: public-docs
depends_on:
  - ticket.context.040
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
  directories:
    - docs/context
    - docs/workflows
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "polish README for public ctx-aide release"
  generated_at: 2026-07-01
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-05
---

# Polish Public README and Positioning

## Outcome

Make the README and primary docs understandable to an outside engineer evaluating the project as an agentic developer-productivity tool.

## Context

The public release should quickly explain what the project does, why it exists, how it works, how to try it, and how markdown, generated indexes, tickets, packs, and agent instructions fit together.

## Positive Rules

- Use the chosen public name from `ticket.context.040`.
- Prefer concrete workflow examples over abstract claims.
- Include exact validation commands an outside reader can run locally.

## Negative Rules

- Do not make claims that exceed implemented behavior.
- Do not leave stale `ctx-aide` branding in prominent public-facing copy unless it is intentionally described as the internal/legacy working name.
- Stop and escalate if the README requires behavior that does not exist.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public copy must be backed by implemented commands, docs, or examples.

## Frozen Decisions

- Decision: public docs emphasize repo-local workflow and validation, not a hosted product.
- Rationale: the project is valuable as local developer-productivity infrastructure.

## Implementation Rules

- Required approach: revise README structure for public consumption while preserving existing operational truth.
- Existing components/helpers to use: existing README sections, workflow docs, `ctxa` command list, and generated context model.
- Anti-patterns to avoid: marketing-only README with no quickstart or proof.
- Stop and escalate if: public docs require a package/command rename not resolved by `ticket.context.040`.

## Scope

- In: README public positioning, quickstart, architecture summary, examples index, validation commands.
- Out: code behavior changes, GitHub repo visibility, Opertus/profile updates.

## Acceptance Criteria

- README answers: what it is, why it exists, install/run, workflow, validation, and status.
- README clearly states markdown is canonical and generated SQLite/agent packs are artifacts.
- README links to demo/example proof from `ticket.context.043` if it exists.

## Validation

- Automated: frontmatter `ctxa` checks.
- Smoke: follow the README quickstart commands against the local repo.
- Screenshots: none.

## Implementation Notes

Assume the reader is an engineering leader or staff/platform engineer looking for proof that AI coding agents can work against structured repo-local context.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: README now introduces CTX Aide as the public display name, documents the local quickstart, identifies canonical markdown and generated-cache boundaries, and links current proof surfaces; `node tools/ctx-aide/ctx-aide.mjs scan --json`, README query smoke, pack status, spec check, ticket check, pack check, and `make validate` passed on 2026-07-05.
- Follow-up tickets: none
