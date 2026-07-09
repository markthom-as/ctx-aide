---
id: ticket.context.078
status: ready
title: Add adversarial review run policy
ticket_pack: pack.ctx-aide-agent-workflow-orchestration-2026-07-09
milestones:
  - milestone.ctx-aide-agent-workflow-orchestration
source_spec: spec.agent-workflow-orchestration-2026-07-09
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: run-policy
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - docs/ticket-packs/templates/ticket-pack.md
    - docs/tickets/templates/canonical-ticket.md
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add adversarial reviewer and fixer role policy to ticket packs"
  generated_at: 2026-07-09
  context_ids:
    - spec.agent-workflow-orchestration-2026-07-09
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.independent-review-context
  - axiom.no-destructive-git-in-parallel-runs
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-agent-workflow-orchestration-2026-07-09 --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add Adversarial Review Run Policy

## Outcome

Ticket packs can declare implementer, adversarial reviewer, and fixer roles with enforceable validation rules for independent review context, destructive-command denial, and merge sequencing.

## Context

Large agent-authored changes need more than one implementation context. CTX Aide already models pack run policy and parallel groups; this ticket extends that model so review/fix loops are explicit repo-local markdown instead of chat-only process.

## Positive Rules

- Preserve existing pack and ticket compatibility unless a migration is explicitly documented.
- Prefer additive frontmatter fields and defaults that keep existing packs valid.
- Reuse the current `pack check`, `pack status`, and command-catalog patterns.

## Negative Rules

- Do not add a live subagent runner or hosted queue.
- Do not require every pack to use adversarial review roles.
- Do not allow role metadata to imply permission to run destructive git commands.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.independent-review-context`: Reviewer roles must receive the diff and source contract, not the implementer's private reasoning.
- `axiom.no-destructive-git-in-parallel-runs`: Parallel agent instructions must deny destructive git operations unless a human explicitly grants them.

## Frozen Decisions

- Decision: role policy is pack-level metadata with ticket-level override support only when needed.
- Rationale: packs own parallelization, leases, and merge policy.
- Decision: existing packs without role policy remain valid.
- Rationale: the feature should improve high-risk work without breaking older local workflows.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: this ticket adds local markdown validation only.

## Implementation Rules

- Required approach: extend templates, parser validation, pack status output, and tests for optional `review_policy` or equivalent additive metadata.
- Existing components/helpers to use: `validatePacks`, `packStatus`, command catalog entries, and existing fixture-writing tests.
- Anti-patterns to avoid: hidden defaults that launch agents, broad command-policy changes outside pack validation, and prose-only role descriptions without validator coverage.
- Stop and escalate if: the implementation requires a new hosted runner, persistent lease service, or non-local state.

## Scope

- In: template fields, validation rules, status output, docs, tests.
- Out: spawning agents, assigning worktrees, applying reviewer feedback, committing code, or importing failure output.

## Acceptance Criteria

- Existing packs continue to pass `ctxa pack check --json`.
- A pack can declare implementer, reviewer, and fixer roles with minimum review counts.
- `pack check` rejects destructive-git allowance in default parallel policy unless an explicit human-approved exception field is present.
- `pack status` exposes role policy in bounded JSON.
- Tests cover missing/valid/invalid role metadata and old-pack compatibility.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`; `node tools/ctx-aide/ctx-aide.mjs pack check --json`; `make validate`.
- Smoke: inspect `pack status` output for this pack.
- Screenshots: none.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: none.
