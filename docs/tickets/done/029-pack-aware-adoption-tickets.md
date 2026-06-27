---
id: ticket.context.029
status: done
title: Make adoption tickets pack-aware
ticket_pack: pack.repo-context-pre-production-adoption-hardening-2026-06-27
milestones:
  - milestone.repo-context-pre-production-adoption-hardening
source_spec: spec.pre-production-adoption-hardening-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: adoption-ticket
depends_on:
  - ticket.context.027
  - ticket.context.028
blocks: []
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
    - README.md
    - docs/ticket-packs/done/pre-production-adoption-hardening-2026-06-27.md
  directories: []
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "make adoption tickets pack-aware"
  generated_at: 2026-06-27
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - make validate
    - make smoke
    - node tools/context/ctx.mjs adoption bootstrap --repo /Users/jove/code/astrotechne.com --profile auto --json
    - node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json
  smoke: []
  screenshots: []
completion:
  commit: pack-aware-adoption-tickets
  completed_at: 2026-06-27
---

# Make Adoption Tickets Pack-Aware

## Outcome

Make generated target tickets land inside selected target packs and close the pre-production adoption hardening pack.

## Context

Native pack creation is only useful if tickets can be generated into the pack path and reference the pack consistently.

## Positive Rules

- Support `--pack-slug` on adoption tickets.
- For Astrotechne, write tickets inside `docs/domain-redesign/tickets/<pack-slug>/`.
- Keep default behavior compatible when no pack slug is supplied.

## Negative Rules

- Do not edit Astrotechne production code.
- Do not mark this pack complete until full validation passes.
- Do not make generated ticket paths ambiguous.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Pack-aware ticket placement is opt-in through `--pack-slug`.
- Existing standalone adoption ticket behavior remains available.

## Implementation Rules

- Required approach: add path resolution helpers and fixture tests.
- Existing components/helpers to use: adoption profile detection, `writeFileIfAllowed`, `implementationPlan`.
- Anti-patterns to avoid: hidden migrations of existing target ticket files.
- Stop and escalate if: target pack path resolution becomes ambiguous.

## Scope

- In: pack-aware ticket pathing, docs, final validation, pack closeout.
- Out: production Astrotechne implementation work.

## Acceptance Criteria

- Adoption tickets can be created inside a target pack directory.
- Implementation-plan can hydrate pack-scoped generated tickets.
- The pre-production hardening pack reports all tickets done.

## Validation

- Automated: `make validate`; `make smoke`; Astrotechne adoption dry-runs.
- Smoke: `ctx pack status pack.repo-context-pre-production-adoption-hardening-2026-06-27 --json`.
- Screenshots: none.

## Implementation Notes

This is the closeout ticket for the hardening cycle.

## Completion

- Status: done
- Commit: pack-aware-adoption-tickets
- Verification evidence:
  - `make validate`
  - `make smoke`
  - `node tools/context/ctx.mjs adoption bootstrap --repo /Users/jove/code/astrotechne.com --profile auto --json`
  - `node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json` returned expected bootstrap/context blockers
  - `node tools/context/ctx.mjs adoption pack --repo /Users/jove/code/astrotechne.com --profile auto --title 'Repo Context Dogfood' --slug repo-context-dogfood --json`
- Follow-up tickets: none.
