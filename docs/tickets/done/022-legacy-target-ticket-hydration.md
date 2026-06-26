---
id: ticket.context.022
status: done
title: Hydrate legacy target tickets
ticket_pack: pack.repo-context-legacy-target-ticket-hydration
milestones:
  - milestone.repo-context-daily-use
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on:
  - ticket.context.020
blocks: []
scope:
  routes: []
  files:
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Hydrate legacy target tickets that use ticket_id, source_docs, and Verification sections"
  generated_at: 2026-06-26
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.explicit-context-loading
validation:
  automated:
    - Run `node tools/context/ctx.test.mjs`.
    - Run `make validate`.
  smoke:
    - Hydrate a Wetware-style dependency ticket with `ticket_id`, `source_docs`, and `## Verification`.
  screenshots: []
completion:
  commit: legacy-target-ticket-hydration-change
  completed_at: 2026-06-26
---

# Hydrate Legacy Target Tickets

## Outcome

Make `ctx adoption implementation-plan` produce useful output for target repos that already have non-canonical markdown tickets.

## Context

Dogfooding against Wetware showed that older tickets can use `ticket_id`, omit `context_query`, and put validation commands under `## Verification`. The adoption command needs to support those tickets so repo-context can be layered onto Astrotechne and Wetware without migrating historical tickets first.

## Positive Rules

- Preserve existing target repo ticket formats.
- Infer title from the first markdown heading when frontmatter title is absent.
- Read `ticket_id` as the durable ticket id when canonical `id` is absent.
- Treat `source_docs` as scoped target paths for context selection.
- Include `## Verification` commands in implementation plans.

## Negative Rules

- Do not require historical ticket migrations before adoption.
- Do not silently discard validation commands just because a target repo uses `## Verification`.
- Do not bulk-load context bodies by default.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical planning artifact.
- `axiom.ticket-done-requires-commit`: Each completed ticket should have a clean commit.
- `axiom.explicit-context-loading`: Context is loaded by command, not by scanning every markdown file into the prompt.

## Frozen Decisions

- Legacy support is implemented in `adoption implementation-plan`, not in the canonical repo-context validator.
- Compatibility covers `ticket_id`, first `#` heading title inference, `source_docs`, and `## Verification`.

## Implementation Rules

- Required approach: extend the existing parser and fixture tests.
- Existing components/helpers to use: `nestedFrontmatterList`, body section extraction, and target adoption fixtures.
- Anti-patterns to avoid: schema rewrites of target repo tickets.
- Stop and escalate if: a target repo needs a fundamentally different ticket parser.

## Scope

- In:
  - Target ticket id/title inference.
  - Target path inference from `source_docs`.
  - Verification command extraction.
  - Fixture tests.
- Out:
  - Full Astrotechne ticket migration.
  - Canonical validation of target repo tickets.

## Acceptance Criteria

- A legacy target ticket with `ticket_id` hydrates that id.
- A first markdown heading hydrates the ticket title.
- `source_docs` become target paths.
- `## Verification` commands appear in `validation_commands`.

## Validation

- Automated:
  - `node tools/context/ctx.test.mjs`
  - `make validate`
- Smoke:
  - Wetware dependency ticket hydration.
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: legacy-target-ticket-hydration-change
- Verification evidence:
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs doctor --json`
  - `make validate`
- Follow-up tickets:
  - Add an Astrotechne status adapter after the first Astrotechne dogfood run.
