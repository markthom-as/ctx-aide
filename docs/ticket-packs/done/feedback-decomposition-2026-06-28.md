---
id: pack.feedback-decomposition-2026-06-28
status: done
title: Feedback Decomposition
milestones:
  - milestone.ctx-aide-feedback-review
source_specs:
  - spec.feedback-decomposition-2026-06-28
tickets:
  - ticket.context.037
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.037
blocked_by: []
created: 2026-06-28
completion:
  completed_at: 2026-06-28
  final_validation:
    - make validate
    - node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json
---

# Feedback Decomposition

## Outcome

Add a planning step that decomposes natural operator feedback into candidate ticket and acceptance-criteria actions.

## Scope

- Included:
  - `ctx-aide feedback plan`.
  - Capture response decomposition metadata.
  - Feedback review workflow guidance.
  - Fixture coverage.
- Excluded:
  - LLM-backed semantic classification inside the CLI.
  - Bulk ticket creation without agent review.

## Tickets

- `ticket.context.037`: done - Add feedback decomposition planning

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: none.
- Shared-file coordination: one coordinated CLI/doc/test slice.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable.
- Requeue rules: return to questions if decomposition cannot infer the intended outcome.

## Pack Validation

- Smoke tests:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture tests cover multi-point feedback planning and subpoint split suggestions.

## Completion

- Completed tickets: `ticket.context.037`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/037-feedback-decomposition.md --body "Spacing is tight. Copy is wrong." --json`
