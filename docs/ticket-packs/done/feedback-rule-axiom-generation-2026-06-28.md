---
id: pack.feedback-rule-axiom-generation-2026-06-28
status: done
title: Feedback Rule and Axiom Generation
milestones:
  - milestone.ctx-aide-feedback-review
source_specs:
  - spec.feedback-rule-axiom-generation-2026-06-28
tickets:
  - ticket.context.038
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  cli-a:
    tickets:
      - ticket.context.038
blocked_by: []
created: 2026-06-28
completion:
  completed_at: 2026-06-28
  final_validation:
    - make validate
    - node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json
---

# Feedback Rule and Axiom Generation

## Outcome

Generate candidate rules and axioms from durable operator feedback wording.

## Scope

- Included:
  - Rule and axiom candidates in `ctxa feedback plan`.
  - Rule and axiom candidates in `ctxa feedback capture`.
  - Rule and axiom carry-through into generated follow-up tickets.
  - Workflow docs and fixture tests.
- Excluded:
  - Automatically accepting candidate rules globally.
  - Rewriting generated agent packs.

## Tickets

- `ticket.context.038`: done - Generate rules and axioms from feedback

## Execution Plan

- Parallel groups: `cli-a`.
- Sequential dependencies: none.
- Shared-file coordination: one CLI/doc/test slice.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable.
- Requeue rules: return to questions if a candidate rule would materially change workflow policy.

## Pack Validation

- Smoke tests:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Fixture tests cover plan, capture, and follow-up ticket rule/axiom propagation.

## Completion

- Completed tickets: `ticket.context.038`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs feedback plan --repo . --ticket docs/tickets/done/038-feedback-rule-axiom-generation.md --body "Never ship visual tickets without mobile and desktop screenshots." --json`
