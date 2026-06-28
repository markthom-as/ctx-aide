---
id: pack.feedback-review-workflow-2026-06-28
status: done
title: Feedback Review Workflow
milestones:
  - milestone.repo-context-feedback-review
source_specs:
  - spec.feedback-review-workflow-2026-06-28
tickets:
  - ticket.context.036
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.036
blocked_by: []
created: 2026-06-28
completion:
  completed_at: 2026-06-28
  final_validation:
    - make validate
    - node tools/context/ctx.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json
---

# Feedback Review Workflow

## Outcome

Add a repo-local feedback review loop for ticket validation artifacts and operator notes.

## Scope

- Included:
  - `ctx feedback review` review packets.
  - `ctx feedback capture` markdown feedback entries.
  - `ctx feedback promote` acceptance-criteria and follow-up-ticket promotion.
  - Workflow docs and fixture tests.
- Excluded:
  - Hosted review UI.
  - Browser automation execution.
  - Infrastructure or paid service changes.

## Tickets

- `ticket.context.036`: done - Add feedback review workflow

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: none.
- Shared-file coordination: CLI and tests are edited in one coordinated slice.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable.
- Requeue rules: return to hardening if feedback promotion semantics require product decisions.

## Pack Validation

- Smoke tests:
  - `make validate`
  - `node tools/context/ctx.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json`
- Screenshots:
  - Not required for this CLI workflow slice.
- Full regression checks:
  - Fixture tests cover review packet metadata, feedback capture, acceptance-criteria promotion, and follow-up ticket promotion.

## Completion

- Completed tickets: `ticket.context.036`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `node tools/context/ctx.mjs feedback review --repo . --ticket docs/tickets/done/036-feedback-review-workflow.md --json`
