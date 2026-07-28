---
id: pack.vakos-integration-prerequisites-2026-07-28
status: active
title: vakOS Integration Prerequisites
milestones:
  - milestone.vakos-integration-prerequisites
source_specs:
  - spec.vakos-adoption-readiness-2026-07-27
tickets:
  - ticket.context.090
  - ticket.context.087
  - ticket.context.088
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: false
parallel_groups:
  distribution:
    tickets:
      - ticket.context.090
      - ticket.context.087
  screenshot-security:
    tickets:
      - ticket.context.088
blocked_by: []
created: 2026-07-28
completion:
  completed_at: null
  final_validation:
    - npm test
    - make validate
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - npm pack --dry-run --json
---

# vakOS Integration Prerequisites

## Outcome

CTX Aide supplies the two remaining upstream prerequisites for complete vakOS
adoption: a qualified immutable distribution source and a hardened local
screenshot-feedback lifecycle.

## Scope

- Included: source and distribution qualification, runtime-file inventory,
  screenshot server request and asset containment, explicit lifecycle receipts,
  and regression coverage.
- Excluded: vakOS flake changes, ISO/runtime inclusion, Idvisor manifest/result
  work, hosted services, publication without owner approval, and paid
  infrastructure.

## Tickets

- ticket.context.090 freezes and tests the minimal alpha runtime package
  inventory before a source revision is qualified.
- ticket.context.087 decides and records the source, terms, caching posture, and
  package runtime inventory required for a reproducible Nix pin.
- ticket.context.088 hardens the optional screenshot review UI before vakOS can
  enable its graphical feedback pilot.

## Execution Plan

- The two tickets may proceed independently because their implementation files
  do not overlap materially.
- Ticket 090 precedes ticket 087 so the qualified source already contains the
  frozen runtime inventory.
- Ticket 087 can proceed because public MIT source authority is now recorded.
- Ticket 088 may land without waiting for publication or Nix packaging.
- Keep each completed ticket in one focused commit and rerun full validation
  after both land.

## Run Policy

- Max parallel agents: 2.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect the checkout and stop any screenshot listener
  before reassigning work.
- Requeue rules: stop if distribution authority is absent, a security guarantee
  would be weakened, or a paid/hosted dependency would be introduced.

## Pack Validation

- Run the full CLI and package validation listed in frontmatter.
- For ticket 087, verify the exact packaged runtime inventory from an immutable
  source revision without lifecycle network access.
- For ticket 088, exercise Host, Origin, nonce, CSP, containment, size, timeout,
  interrupt, and listener-cleanup cases.

## Completion

- Completed tickets: ticket.context.090.
- Remaining tickets: ticket.context.087 and ticket.context.088.
- Final validation: pending.
