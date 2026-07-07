---
id: ticket.context.014
status: done
title: Add agent-driven workflow customization
ticket_pack: pack.ctx-aide-post-v0.1
milestones:
  - milestone.post-v0.1-customization
source_spec: spec.agent-driven-customization
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
  - claude-high-effort
ui_review_agent: claude-high-effort
parallel_group: customization-a
depends_on:
  - ticket.context.012
  - ticket.context.013
blocks: []
phase: post-v0.1
scope:
  routes: []
  files: []
  directories:
    - docs
    - skills/ctx-aide
    - tools/ctx-aide
  components: []
  flows:
    - flow.workflow-customization
context_query:
  task: "Add agent-driven workflow customization"
  generated_at: 2026-06-25
  context_ids:
    - spec.agent-driven-customization
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.rule-polarity-preserved
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs lint --json
  smoke:
    - Run a dry-run customization questionnaire against a fixture repo.
    - Verify generated config toggles only documented settings.
  screenshots: []
completion:
  commit: 40e0375
  completed_at: 2026-06-26
---

# Add Agent-Driven Workflow Customization

## Outcome

Let users customize ctxa workflow behavior through an agent-guided setup flow, with persisted profiles and toggles that the skill and CLI can honor.

## Context

This is future, post-v0.1 work. The MVP should first prove canonical tickets, packs, context scanning, discovery, and validation. Customization should build on a stable baseline rather than expanding the initial surface area.

## Positive Rules

- Preserve a conservative default profile that works without customization.
- Prefer explicit toggles and named profiles over hidden behavior.
- Keep customization output as reviewable repo-local markdown or config.

## Negative Rules

- Do not make customization required for basic use.
- Do not let agent preferences silently weaken validation or readiness gates.
- Do not store secrets in customization config.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.rule-polarity-preserved`: Positive and negative rules remain separate.

## Frozen Decisions

- This is post-v0.1 work.
- Customization should be available through both the Codex skill workflow and the CLI once config support exists.
- Profiles should be repo-local and reviewable.

## Implementation Rules

- Required approach: start with documented profiles and a dry-run questionnaire before adding mutating commands.
- Existing components/helpers to use: reuse the canonical validator and generated config conventions.
- Anti-patterns to avoid: one-off untracked preferences, global-only state, or silent validation bypasses.
- Stop and escalate if: a proposed customization would undermine canonical ticket readiness or pack validation.

## Scope

- In:
  - Define `docs/context/config.md` or `ctx-aide.config.*` conventions.
  - Add `ctxa customize --profile <name> --dry-run --json` concept.
  - Add skill instructions for agent-guided setup questions.
  - Define toggles for optional features such as Semble discovery, Cursor export, Claude UI audit, Idvisor orchestration, screenshots, and strict pack gates.
- Out:
  - Implementing a full interactive TUI.
  - Adding hosted profile sync.
  - Storing private provider credentials.

## Acceptance Criteria

- Users can choose a profile such as `minimal`, `web-app`, `ui-heavy`, `idvisor-orchestrated`, or `strict`.
- Customization produces a diffable config or markdown change.
- The skill can ask a bounded set of questions and recommend a profile.
- CLI dry-run output shows exactly which rules, commands, exports, and gates would change.
- Validation reports when customization disables optional checks and refuses to disable required axioms.

## Validation

- Run a dry-run customization questionnaire against a fixture repo.
- Verify generated config toggles only documented settings.
- Confirm required axioms cannot be disabled.

## Implementation Notes

- Parallel group: `customization-a`.
- Expected commit message: `Add agent-driven workflow customization`.

## Completion

- Status: done
- Commit: 40e0375
- Verification evidence:
  - `node tools/ctx-aide/ctx-aide.mjs customize --profile strict --dry-run --json`
  - `node tools/ctx-aide/ctx-aide.mjs customize --profile web-app --dry-run --json`
  - `node tools/ctx-aide/ctx-aide.mjs lint --json`
  - `make validate`
- Follow-up tickets: none
