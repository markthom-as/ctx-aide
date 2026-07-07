---
id: pack.ctx-aide-astrotechne-adoption
status: done
title: Astrotechne Adoption Profile
milestones:
  - milestone.ctx-aide-docs-maintenance
source_specs:
  - spec.ctx-aide-mvp
tickets:
  - ticket.context.016
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: coordinator-queue
  worktree_required: false
parallel_groups:
  docs-a:
    tickets:
      - ticket.context.016
blocked_by: []
created: 2026-06-26
completion:
  completed_at: 2026-06-26
  final_validation:
    - make validate
---

# Astrotechne Adoption Profile

## Outcome

Document how ctx-aide should be introduced into Astrotechne without disrupting its existing ticket and packet workflow.

## Scope

- Included:
  - Astrotechne customization profile.
  - README adoption notes.
  - Workflow note describing status mapping, rollout, and gaps.
- Excluded:
  - Editing the Astrotechne repository.
  - Migrating historical Astrotechne tickets.
  - Implementing the full legacy ticket adapter.

## Tickets

- `ticket.context.016`: done - Add Astrotechne adoption profile

## Execution Plan

- Parallel groups: `docs-a`.
- Sequential dependencies: none.
- Shared-file coordination: README, CLI profile, workflow note.
- Worktree strategy: current worktree is sufficient.
- Merge queue strategy: one local commit.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: not applicable for this single-ticket documentation change.
- Requeue rules: not applicable.

## Pack Validation

- Smoke tests:
  - `make validate`
  - `node tools/ctx-aide/ctx-aide.mjs customize --profile astrotechne --dry-run --json`
- Screenshots:
  - Not required.
- Full regression checks:
  - Existing customization profiles still work.

## Completion

- Completed tickets: ticket.context.016.
- Remaining tickets: none.
- Final validation: `make validate`.
