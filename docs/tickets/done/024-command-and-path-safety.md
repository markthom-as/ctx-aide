---
id: ticket.context.024
status: done
title: Harden command execution and write paths
ticket_pack: pack.ctx-aide-staff-review-hardening-2026-06-26
milestones:
  - milestone.ctx-aide-staff-review-hardening
source_spec: spec.staff-review-hardening-2026-06-26
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-safety
depends_on: []
blocks:
  - ticket.context.025
  - ticket.context.026
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "harden command execution and write paths"
  generated_at: 2026-06-26
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket hydrate docs/tickets/ready/024-command-and-path-safety.md --json
  smoke: []
  screenshots: []
completion:
  commit: command-and-path-safety-hardening
  completed_at: 2026-06-26
---

# Harden Command Execution and Write Paths

## Outcome

Make local command execution and generated output writes defensible under security review.

## Context

The CLI currently exposes local-agent conveniences that a reviewer can reasonably challenge: shell-evaluated command strings and output paths that can point outside the active repository.

## Positive Rules

- Prefer argument-vector process execution for local audit commands.
- Keep repo writes inside the active repo or declared target repo by default.
- Preserve explicit escape hatches only when they are named in command output.

## Negative Rules

- Do not remove the ability to run a normal dependency audit command.
- Do not add a new runtime dependency for command parsing.
- Stop and escalate if the implementation needs a cross-platform shell parser.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Dependency audit command text may still be provided by the caller.
- Shell evaluation should require an explicit flag.
- Output writes should remain in-repo unless an explicit outside-repo flag is provided.

## Implementation Rules

- Required approach: add small local helpers with fixture tests.
- Existing components/helpers to use: `spawnSync`, `argValue`, fixture `run`, and repo-root path helpers.
- Anti-patterns to avoid: broad CLI rewrite and undocumented behavioral breakage.
- Stop and escalate if: existing documented command examples cannot be preserved.

## Scope

- In: dependency audit command execution, output path resolution, tests.
- Out: target-repo migration, package manager changes, hosted security scanning.

## Acceptance Criteria

- `dependency audit` runs simple commands without `shell: true` by default.
- `dependency audit --shell` remains available for shell-only commands.
- Generated `--out` writes refuse outside-repo paths unless explicitly allowed.
- Fixture tests cover allowed and rejected paths.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`.
- Smoke: hydrate this ticket with `ctxa ticket hydrate`.
- Screenshots: none.

## Implementation Notes

Run this ticket before the other hardening tickets because later validation evidence may write generated output.

## Completion

- Status: done
- Commit: command-and-path-safety-hardening
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs ticket hydrate docs/tickets/ready/024-command-and-path-safety.md --json`
- Follow-up tickets: none.
