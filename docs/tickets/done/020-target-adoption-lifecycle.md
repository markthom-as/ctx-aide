---
id: ticket.context.020
status: done
title: Add target adoption lifecycle commands
ticket_pack: pack.repo-context-target-adoption-lifecycle
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
  - ticket.context.017
  - ticket.context.018
  - ticket.context.019
blocks: []
scope:
  routes: []
  files:
    - README.md
    - tools/context/ctx.mjs
    - tools/context/ctx.test.mjs
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Use repo-context to manage target repo workflow, context, ticket creation, and implementation planning"
  generated_at: 2026-06-26
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
  - axiom.explicit-context-loading
validation:
  automated:
    - Run `make validate`.
    - Run `node tools/context/ctx.test.mjs`.
  smoke:
    - Run adoption bootstrap, context, ticket, and implementation-plan commands against a fixture target repo.
    - Run workflow validation-plan against the browser validation workflow.
  screenshots: []
completion:
  commit: target-adoption-lifecycle-change
  completed_at: 2026-06-26
---

# Add Target Adoption Lifecycle Commands

## Outcome

Make repo-context usable as the workflow manager for another repo by adding commands that bootstrap target context, create scoped context entries, generate full implementation tickets, and hydrate explicit implementation plans.

## Context

The dependency upgrade proved that `ctx dependency audit` can provide evidence, but the tool did not yet manage the full workflow and context lifecycle around ticket creation and implementation. Daily use for Wetware and Astrotechne needs a target-repo adoption layer that preserves each repo's existing ticket conventions.

## Positive Rules

- Preserve JSON-first command output.
- Keep mutations behind `--write`.
- Keep target repo context loading explicit and bounded.
- Preserve Wetware and Astrotechne ticket roots instead of rewriting historical ticket systems.

## Negative Rules

- Do not bulk-load every markdown file into agent context.
- Do not overwrite target repo files without `--force`.
- Do not make implementation agents infer missing product, design, architecture, or security decisions.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate in generated context.
- `axiom.explicit-context-loading`: Context is loaded by ticket or query command, not implicitly by all markdown.

## Frozen Decisions

- Target lifecycle commands live under `ctx adoption`.
- `adoption bootstrap` creates scaffolding and profile config.
- `adoption context` creates scoped context entries with load rules.
- `adoption ticket` creates full-fat implementation tickets in the target repo's configured ticket root.
- `adoption implementation-plan` is the explicit context-loading boundary before implementation.
- Browser validation plans expose view and breakpoint matrices for ticket validation.

## Implementation Rules

- Required approach: extend the existing dependency-free Node CLI.
- Existing components/helpers to use: markdown frontmatter parser, workflow metadata, bounded output helpers, and fixture tests.
- Anti-patterns to avoid: interactive prompts, unbounded context bodies by default, and destructive target repo rewrites.
- Stop and escalate if: a target repo requires a migration of existing ticket history.

## Scope

- In:
  - `ctx adoption bootstrap`
  - `ctx adoption context`
  - `ctx adoption ticket`
  - `ctx adoption implementation-plan`
  - `ctx workflow validation-plan`
  - README and fixture tests
- Out:
  - Full migration of Astrotechne historical tickets.
  - Hosted services or paid infrastructure.
  - Automatic code implementation dispatch.

## Acceptance Criteria

- A fixture target repo can be bootstrapped in dry-run and write modes.
- A scoped target context entry can be created and later selected by implementation-plan.
- A target ticket can be created with context ids, scoped files, validation commands, and explicit loading instructions.
- Implementation-plan output includes relevant context summaries/rules without full bodies unless requested.
- Workflow validation-plan returns a view-by-breakpoint matrix.

## Validation

- Automated:
  - `make validate`
  - `node tools/context/ctx.test.mjs`
- Smoke:
  - Fixture adoption flow in `ctx.test.mjs`.
  - Browser validation-plan fixture coverage.
- Screenshots:
  - Not required.

## Completion

- Status: done
- Commit: target-adoption-lifecycle-change
- Verification evidence:
  - `node tools/context/ctx.test.mjs`
  - `make validate`
  - `node tools/context/ctx.mjs doctor --json`
  - `make smoke`
- Follow-up tickets:
  - Add target repo ticket-pack generation.
  - Add Astrotechne-specific ticket status adapter once tested against that repo.
