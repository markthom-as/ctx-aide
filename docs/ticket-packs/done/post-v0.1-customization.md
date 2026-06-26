---
id: pack.repo-context-post-v0.1
status: done
title: Repo Context Post-v0.1 Customization
milestones:
  - milestone.post-v0.1-customization
source_specs:
  - spec.agent-driven-customization
tickets:
  - ticket.context.014
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: true
parallel_groups:
  customization-a:
    tickets:
      - ticket.context.014
blocked_by:
  - pack.repo-context-mvp
created: 2026-06-25
completion:
  completed_at: 2026-06-26
  final_validation: []
---

# Repo Context Post-v0.1 Customization

## Outcome

Add an agent-guided customization process that lets users tune optional repo-context workflow behavior through profiles and toggles.

## Scope

- Included:
  - Profile and toggle model.
  - Skill-guided questionnaire.
  - Future CLI dry-run surface.
  - Validation rules that prevent disabling required axioms.
- Excluded:
  - Blocking v0.1 MVP.
  - Hosted profile sync.
  - Storing secrets.

## Tickets

- `ticket.context.014`: done - Add agent-driven workflow customization

## Execution Plan

- Parallel groups: `customization-a`.
- Sequential dependencies: start after `pack.repo-context-mvp`.
- Shared-file coordination: README, skill, and CLI docs.
- Worktree strategy: one worktree is sufficient.
- Merge queue strategy: coordinator-owned.

## Run Policy

- Max parallel agents: 2.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: preserve patch or requeue.
- Requeue rules: requeue only after recording cleanup decision.

## Pack Validation

- Smoke tests:
  - `node tools/context/ctx.mjs lint --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Required axioms cannot be disabled by customization.

## Completion

- Completed tickets: ticket.context.014.
- Remaining tickets: none.
- Final validation: `make validate`; `node tools/context/ctx.mjs pack status pack.repo-context-post-v0.1 --json`.
