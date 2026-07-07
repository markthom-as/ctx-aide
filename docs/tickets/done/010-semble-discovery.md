---
id: ticket.context.010
status: done
title: Add Semble-backed code discovery
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
parallel_group: discovery-a
depends_on:
  - ticket.context.002
blocks:
  - ticket.context.005
  - ticket.context.006
phase: 2
scope:
  routes: []
  files: []
  directories:
    - docs
    - skills/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "Add Semble-backed code discovery"
  generated_at: 2026-06-25
  context_ids:
    - pack.ctx-aide-mvp
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
  - Run discovery against a fixture repo.
  smoke:
  - Run discovery against a fixture repo.
  - Test PATH and uvx fallback behavior.
  - Confirm ticket hydration stores only bounded discovery metadata.
  screenshots: []
completion:
  commit: 494758c
  completed_at: 2026-06-26
---

# Add Semble-backed code discovery

## Outcome

Integrate Semble as an optional code-discovery backend for behavioral tasks and ticket hydration.

## Context

This ticket is part of `pack.ctx-aide-mvp` and is scoped to the ctx-aide MVP dogfood milestone. Use the README, templates, and ctx-aide skill as source context before implementation.

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
  - Add `ctx-aide discover --backend semble --task <text> --repo <path> --json`.
  - Fall back to `uvx --from "semble[mcp]" semble` when `semble` is not on PATH.
  - Persist bounded code discovery metadata in ticket hydration.
  - Document when agents should use Semble versus exact path context queries.
- Out:
  - Treat Semble as canonical product/design truth.
  - Paste large Semble result bodies into tickets.

## Acceptance Criteria

- Discovery returns bounded file/line/reason/query metadata.
- Ticket hydration can include a compact Code Discovery section.
- Agents inspect files before changing code.
- Semble failures degrade to explicit no-discovery output, not silent success.

## Validation

- Run discovery against a fixture repo.
- Test PATH and uvx fallback behavior.
- Confirm ticket hydration stores only bounded discovery metadata.

## Implementation Notes

- Parallel group: `discovery-a`.
- Dependencies: `ticket.context.002`.
- Expected commit message: `Add Semble code discovery integration`.

## Completion

- Status: done
- Commit: 494758c
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs discover --backend none --task "known path" --repo . --out docs/context/generated/discovery.none.json --json`
  - `node tools/ctx-aide/ctx-aide.mjs discover --backend semble --task "ctx-aide dogfood" --repo . --limit 2 --json`
  - `make validate`
- Follow-up tickets: none
