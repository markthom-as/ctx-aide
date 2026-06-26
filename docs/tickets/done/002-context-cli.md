---
id: ticket.context.002
status: done
title: Implement ctx scan query lint CLI foundation
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
parallel_group: cli-a
depends_on:
  - ticket.context.001
blocks:
  - ticket.context.003
  - ticket.context.005
  - ticket.context.006
phase: 1
scope:
  routes: []
  files: []
  directories:
    - docs
    - skills/repo-context
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "Implement ctx scan query lint CLI foundation"
  generated_at: 2026-06-25
  context_ids:
    - pack.repo-context-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Unit tests for frontmatter parsing, ranking, scan exclusion, and rule polarity.
  - CLI tests with stdin detached.
  smoke:
  - CLI tests with stdin detached.
  - Snapshot test for query output.
  screenshots: []
completion:
  commit: 5059008
  completed_at: 2026-06-26
---

# Implement Ctx Scan Query Lint CLI Foundation

## Outcome

Provide an agent-native local CLI foundation for scan, query, lint, and checks.

## Context

This ticket is part of `pack.repo-context-mvp` and is scoped to the repo-context MVP dogfood milestone. Use the README, templates, and repo-context skill as source context before implementation.

## Positive Rules

- Preserve markdown as the source of truth.
- Keep outputs deterministic and reviewable in git.
- Prefer small, independently committable changes.

## Negative Rules

- Do not make SQLite the canonical authoring surface.
- Do not flatten positive and negative rules into undifferentiated guidance.
- Stop and harden this ticket if implementation requires a product, architecture, security, or workflow decision not captured here.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate.

## Frozen Decisions

- Codex is the default implementation agent.
- Claude is preferred for UI/design audit passes.
- Ticket completion requires validation evidence and a commit hash.

## Implementation Rules

- Required approach: implement only the scope listed in this ticket.
- Existing components/helpers to use: reuse the canonical ticket and pack templates.
- Anti-patterns to avoid: broad rewrites, undocumented status changes, and unbounded generated context.
- Stop and escalate if: this ticket conflicts with the pack plan or requires changing status vocabulary.

## Scope

- In:
  - Implement `ctx scan --json`.
  - Implement `ctx query --path <path> --task <text> --agent <agent> --budget <tokens> --json`.
  - Implement `ctx lint --json`, `ctx ticket check --json`, and `ctx pack check --json`.
  - Generate `docs/context/generated/context-manifest.json`.
  - Preserve positive and negative rule polarity.
- Out:
  - Implement run orchestration commands.
  - Implement Idvisor plugin.

## Acceptance Criteria

- CLI is non-interactive by default.
- JSON mode writes parseable stdout and diagnostics to stderr.
- Scanner excludes ignored markdown files.
- Query, hydration, and agent-pack export keep positive and negative rules separate.

## Validation

- Unit tests for frontmatter parsing, ranking, scan exclusion, and rule polarity.
- CLI tests with stdin detached.
- Snapshot test for query output.

## Implementation Notes

- Parallel group: `cli-a`.
- Dependencies: `ticket.context.001`.
- Expected commit message: `Implement repo context CLI foundation`.

## Completion

- Status: done
- Commit: 5059008
- Verification evidence:
  - `node tools/context/ctx.test.mjs`
  - `node tools/context/ctx.mjs scan --json`
  - `node tools/context/ctx.mjs query --path tools/context/ctx.mjs --task "repo context dogfood rule polarity" --agent codex --budget 1200 --json`
  - `make validate`
- Follow-up tickets: none
