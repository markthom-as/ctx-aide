---
id: ticket.context.027
status: done
title: Add target adoption status preflight
ticket_pack: pack.ctx-aide-pre-production-adoption-hardening-2026-06-27
milestones:
  - milestone.ctx-aide-pre-production-adoption-hardening
source_spec: spec.pre-production-adoption-hardening-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: adoption-status
depends_on: []
blocks:
  - ticket.context.028
  - ticket.context.029
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
  task: "add target adoption status preflight"
  generated_at: 2026-06-27
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json
  smoke: []
  screenshots: []
completion:
  commit: adoption-status-preflight
  completed_at: 2026-06-27
---

# Add Target Adoption Status Preflight

## Outcome

Add a read-only `ctx-aide adoption status` command that reports target-repo adoption readiness before any production-code work begins.

## Context

Bootstrap dry-runs show planned writes, but there is no single command that reports whether a target repo has profile config, context entries, pack/ticket roots, generated artifacts, and dirty worktree risk.

## Positive Rules

- Keep the command read-only.
- Report missing prerequisites as structured errors or blockers.
- Include target profile detection and git status summary.

## Negative Rules

- Do not run target validation commands.
- Do not modify the target repo.
- Do not require the target repo to already be bootstrapped.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- `adoption status` is preflight only.
- Dirty target worktrees are warnings, not hard failures.
- Missing bootstrap config is a blocker for production-code use but not for dry-run planning.

## Implementation Rules

- Required approach: add a compact JSON command and fixture tests.
- Existing components/helpers to use: `detectAdoptionProfile`, `targetContextEntries`, `spawnSync`, and existing path helpers.
- Anti-patterns to avoid: shell execution and broad target repo scans.
- Stop and escalate if: status needs to execute paid infrastructure commands.

## Scope

- In: CLI command, tests, usage text.
- Out: target repo edits, validation execution, UI.

## Acceptance Criteria

- `ctx-aide adoption status --repo <target> --json` reports profile, config, context counts, ticket root, pack roots, generated artifacts, and git dirty summary.
- Missing config/context entries produce blockers.
- Fixture tests cover unbootstrapped and bootstrapped target repos.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`.
- Smoke: `node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json`.
- Screenshots: none.

## Implementation Notes

Keep this as a prerequisite for target production-code use.

## Completion

- Status: done
- Commit: adoption-status-preflight
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json` returned expected bootstrap/context blockers
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- Follow-up tickets: none.
