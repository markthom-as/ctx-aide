---
id: ticket.context.017
status: done
title: Add dependency audit gate
ticket_pack: pack.repo-context-dependency-audit-gate
milestones:
  - milestone.repo-context-docs-maintenance
source_spec: spec.repo-context-mvp
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-a
depends_on: []
blocks: []
phase: 1
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
    - flow.spec-to-ticket
context_query:
  task: "Add dependency audit gate"
  generated_at: 2026-06-26
  context_ids:
    - spec.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - Run `make validate`.
    - Run `node tools/context/ctx.mjs dependency audit --repo . --command "node -e 'process.exit(0)'" --json`.
  smoke:
    - Confirm `ctx ticket check` fails a done dependency-upgrade ticket without cleared audit metadata.
  screenshots: []
completion:
  commit: dependency-audit-gate-change
  completed_at: 2026-06-26
---

# Add Dependency Audit Gate

## Outcome

Make repo-context distinguish dependency implementation evidence from actual dependency-audit clearance.

## Context

The Wetware Gallery dependency work showed that "sweep findings implemented" and "production dependency audit cleared" can drift. The CLI should produce parseable audit evidence and ticket validation should prevent dependency-upgrade tickets from being marked done while the audit is still red.

## Positive Rules

- Preserve JSON-first command output.
- Keep audit evidence bounded.
- Prefer explicit ticket opt-in through `work_type` over heuristic title matching.

## Negative Rules

- Do not run package-manager remediation automatically.
- Do not require non-dependency documentation tickets to include audit metadata.
- Stop and harden if a package manager requires interactive prompts.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Dependency tickets opt into the gate with `work_type: dependency-upgrade` or `work_type: dependency-sweep`.
- `ctx dependency audit` runs a caller-provided audit command and records bounded evidence.
- A done dependency-upgrade ticket must record cleared audit metadata in frontmatter.

## Implementation Rules

- Required approach: add the command and validator rule in the existing dependency-free Node CLI.
- Existing components/helpers to use: reuse `printResult`, `argValue`, markdown validators, and fixture tests.
- Anti-patterns to avoid: broad package-manager abstraction and unbounded audit output.
- Stop and escalate if: the command would need to mutate dependencies rather than audit them.

## Scope

- In:
  - `ctx dependency audit`.
  - Dependency-upgrade ticket completion validation.
  - README and tests.
- Out:
  - Automatic dependency upgrades.
  - Registry advisories database.

## Acceptance Criteria

- A passing audit command returns `audit_cleared: true`.
- A failing audit command returns vulnerability counts when parseable and exits non-zero.
- `ctx ticket check` rejects a done dependency-upgrade ticket without cleared audit metadata.

## Validation

- Run `make validate`.
- Run `node tools/context/ctx.mjs dependency audit --repo . --command "node -e 'process.exit(0)'" --json`.

## Implementation Notes

- Parallel group: `cli-a`.
- Dependencies: none.
- Expected commit message: `Add dependency audit gate`.

## Completion

- Status: done
- Commit: dependency-audit-gate-change
- Verification evidence:
  - `make validate`
  - `node tools/context/ctx.mjs dependency audit --repo . --command "node -e 'process.exit(0)'" --json`
- Follow-up tickets:
  - Optional package-manager profile presets.
