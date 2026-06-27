---
id: pack.repo-context-adoption-capability-policy-propagation-2026-06-27
status: done
title: Adoption Capability Policy Propagation
milestones:
  - milestone.repo-context-adoption-capability-policy-propagation
source_specs:
  - spec.adoption-capability-policy-propagation-2026-06-27
tickets:
  - ticket.context.033
  - ticket.context.034
  - ticket.context.035
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  bootstrap-status:
    tickets:
      - ticket.context.033
  implementation-plan:
    tickets:
      - ticket.context.034
  closeout:
    tickets:
      - ticket.context.035
blocked_by: []
created: 2026-06-27
completion:
  completed_at: 2026-06-27
  final_validation:
    - make validate
    - make smoke
    - node tools/context/ctx.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json returned expected bootstrap blockers
---

# Adoption Capability Policy Propagation

## Outcome

Target adoption flows seed, report, and consume capability policy so agents get tool/skill boundaries in implementation plans.

## Scope

- Included: adoption bootstrap/status policy file handling, generated ticket workflow/step metadata, implementation-plan policy output, tests, and docs.
- Excluded: host-runtime enforcement, connector auth probing, and paid infrastructure changes.

## Tickets

- `ticket.context.033`: done
- `ticket.context.034`: done
- `ticket.context.035`: done

## Execution Plan

- Parallel groups: listed for review only; implementation is sequential due to shared CLI/test files.
- Sequential dependencies: `ticket.context.034` depends on `ticket.context.033`; `ticket.context.035` depends on both.
- Shared-file coordination: re-read adoption bootstrap/status and implementation-plan sections before each edit.
- Worktree strategy: current clean worktree; one commit per ticket.
- Merge queue strategy: no queue required.

## Run Policy

- Max parallel agents: 1.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: check `git status --short` before staging.
- Requeue rules: move back to needs-hardening if target policy needs live host-runtime enforcement.

## Pack Validation

- Smoke tests: adoption bootstrap/status, generated ticket implementation-plan, and Astrotechne target dry-runs.
- Screenshots: none.
- Full regression checks: `make validate` and `make smoke`.

## Completion

- Completed tickets: `ticket.context.033`, `ticket.context.034`, `ticket.context.035`.
- Remaining tickets: none.
- Final validation:
  - `make validate`
  - `make smoke`
  - Astrotechne adoption status dry-run returned expected bootstrap/tools policy blockers.
