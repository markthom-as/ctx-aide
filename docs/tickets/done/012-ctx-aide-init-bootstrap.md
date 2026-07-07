---
id: ticket.context.012
status: done
title: Implement ctx-aide init bootstrap
ticket_pack: pack.ctx-aide-mvp
milestones:
  - milestone.ctx-aide-mvp
source_spec: spec.ctx-aide-mvp
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
    - tools/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Implement ctx-aide init bootstrap"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
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
  commit: 54ea012
  completed_at: 2026-06-26
---

# Implement Ctx Init Bootstrap

## Outcome

Create the target-repo bootstrap command that installs the ctx-aide directory structure, templates, and agent snippets.

## Context

This ticket is part of `pack.ctx-aide-mvp` and narrows the CLI work into an independently implementable slice.

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
- Existing components/helpers to use: reuse `tools/ctx-aide/ctx-aide.mjs` patterns.
- Anti-patterns to avoid: prompts in JSON mode, unbounded output, and hidden overwrites.
- Stop and escalate if: schema or command vocabulary conflicts with README.

## Scope

- In:
  - Add `ctx-aide init --json`.
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
- Expected commit message: `Implement ctx-aide init bootstrap`.

## Completion

- Status: done
- Commit: 54ea012
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs init --json`
  - `make validate`
- Follow-up tickets: none
