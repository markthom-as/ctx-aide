---
id: ticket.context.040
status: ready
title: Choose and document public name
ticket_pack: pack.repo-context-public-release-2026-07-01
milestones:
  - milestone.repo-context-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: naming
depends_on: []
blocks:
  - ticket.context.042
  - ticket.context.043
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/active/public-release-2026-07-01.md
  directories:
    - docs/context
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "choose public name for repo-context public release"
  generated_at: 2026-07-01
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-name-precedes-public-copy
validation:
  automated:
    - node tools/context/ctx.mjs spec check --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Choose and Document Public Name

## Outcome

Choose a public name for repo-context and document the decision so downstream public docs, examples, and GitHub metadata can use one stable name.

## Context

`repo-context` is accurate as an internal working name, but it reads like an implementation detail. The public release needs a name that can carry the broader promise: repo-local context, markdown tickets, agent instructions, validation loops, and implementation handoff.

`Concordat` is already an existing separate project in `/Users/jove/code/concordat`; do not reuse that name or create brand confusion between these projects.

## Positive Rules

- Prefer a name that communicates durable agent workflow, repo-local context, or engineering coordination.
- Preserve the internal ability to refer to the repository as `repo-context` until a rename is implemented.
- Document rejected names and the reason they were rejected.

## Negative Rules

- Do not rename commands, packages, files, or repository remotes in this ticket unless the chosen name explicitly requires a small doc-only reference update.
- Do not reuse `Concordat`.
- Stop and escalate if the preferred name collides with an existing local project, public GitHub project, package ecosystem name, or trademark concern.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-name-precedes-public-copy`: Naming-dependent public copy must wait until the public name decision is recorded.

## Frozen Decisions

- Decision: this ticket resolves naming before README/public-demo work begins.
- Rationale: downstream copy and GitHub metadata should not churn across multiple names.
- Decision: `Concordat` is unavailable for this project.
- Rationale: it is already a separate local product with its own public-launch surface.

## Implementation Rules

- Required approach: create or update a repo-local markdown decision note under `docs/context` or the public-release spec with the chosen name, candidate shortlist, rejected names, and rename implications.
- Existing components/helpers to use: spec/pack/ticket metadata and `ctx` checks.
- Anti-patterns to avoid: choosing a name only because it sounds good without checking collision risk.
- Stop and escalate if: the name decision requires legal/trademark review or the user wants a personal brand direction.

## Scope

- In: name shortlist, chosen public name, rejected alternatives, collision review notes, downstream rename implications.
- Out: full code/package/command rename, GitHub repo creation, public launch.

## Acceptance Criteria

- A chosen public name is documented in canonical markdown.
- Rejected candidates include at least `repo-context` and `Concordat` with rationale.
- Downstream tickets can implement public copy and launch metadata without reopening the naming question.

## Validation

- Automated: frontmatter `ctx` checks listed above.
- Smoke: no runtime smoke required.
- Screenshots: none.

## Implementation Notes

Possible name criteria: short, searchable, not over-AI-branded, credible for developer tooling, and broad enough to cover context, tickets, validation, and agent handoff.

## Completion

- Status: pending
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: none
