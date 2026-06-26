---
id: ticket.context.012
status: needs-review
title: Implement ctx init bootstrap
ticket_pack: pack.repo-context-mvp
milestones:
  - milestone.repo-context-mvp
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
  - claude-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-bootstrap-a
depends_on:
  - ticket.context.001
  - ticket.context.011
blocks:
  - ticket.context.003
  - ticket.context.005
phase: 1
scope:
  routes: []
  files: []
  directories:
    - docs
    - tools/context
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Implement ctx init bootstrap"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run init against fixture repo.
  - Run init twice and prove second run is no-op.
  - Run lint after init.
  smoke:
  - Run init against fixture repo.
  - Run init twice and prove second run is no-op.
  - Run lint after init.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Implement Ctx Init Bootstrap

## Outcome

Create the target-repo bootstrap command that installs the repo-context directory structure, templates, and agent snippets.

## Context

This ticket is part of `pack.repo-context-mvp` and narrows the CLI work into an independently implementable slice.

## Positive Rules

- Preserve markdown as the source of truth.
- Keep command output deterministic and parseable.
- Prefer idempotent behavior for bootstrap and generated artifacts.

## Negative Rules

- Do not overwrite user files without explicit force behavior.
- Do not make generated SQLite or manifests canonical truth.
- Stop and harden if command behavior would require a new status or schema decision.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate.

## Frozen Decisions

- Commands used by agents must support JSON output.
- Generated artifacts are rebuildable.

## Implementation Rules

- Required approach: implement only this command slice.
- Existing components/helpers to use: reuse `tools/context/ctx.mjs` patterns.
- Anti-patterns to avoid: prompts in JSON mode, unbounded output, and hidden overwrites.
- Stop and escalate if: schema or command vocabulary conflicts with README.

## Scope

- In:
  - Add `ctx init --json`.
  - Create missing context/spec/ticket/pack/run directories.
  - Copy canonical templates.
  - Emit AGENTS, CLAUDE, and Cursor snippet instructions without overwriting by default.
- Out:
  - Implement scan/query ranking.
  - Implement Idvisor plugin dispatch.

## Acceptance Criteria

- Command is non-interactive in JSON mode.
- Command is idempotent for existing directories.
- Command refuses overwrites unless explicitly forced.
- Output lists created, skipped, and blocked paths.

## Validation

- Run init against fixture repo.
- Run init twice and prove second run is no-op.
- Run lint after init.

## Implementation Notes

- Parallel group: `cli-bootstrap-a`.
- Expected commit message: `Implement ctx init bootstrap`.

## Completion

- Status: needs-review
- Commit: pending
- Verification evidence:
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs init --json`
  - `make validate`
- Follow-up tickets: pending
