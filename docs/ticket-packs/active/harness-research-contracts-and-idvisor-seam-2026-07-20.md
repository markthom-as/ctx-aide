---
id: pack.ctx-aide-harness-research-contracts-and-idvisor-seam-2026-07-20
status: active
title: Harness And Research Contracts With An Idvisor Runtime Seam
milestones:
  - milestone.ctx-aide-harness-research-contracts-and-idvisor-seam
source_specs:
  - spec.harness-research-contracts-and-idvisor-seam-2026-07-20
tickets:
  - ticket.context.080
  - ticket.context.081
  - ticket.context.082
  - ticket.context.083
run_policy:
  max_parallel_agents: 2
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: true
parallel_groups:
  portable-contracts:
    tickets:
      - ticket.context.080
      - ticket.context.081
  idvisor-manifest:
    tickets:
      - ticket.context.082
  result-import:
    tickets:
      - ticket.context.083
blocked_by: []
created: 2026-07-20
completion:
  completed_at: null
  final_validation: []
---

# Harness And Research Contracts With An Idvisor Runtime Seam

## Outcome

CTX Aide repositories can author and validate portable harness experiments and
evidence-backed research claim sets, advertise those contracts through a
versioned Idvisor manifest, and safely import bounded Idvisor workflow results
without moving markdown or runtime authority across the seam.

## Scope

- Included: harness-experiment and research claim-set templates/checks,
  immutable artifact revisions, package-shipped schema ID/digest contracts,
  machine projections, a versioned `ctxa` Idvisor manifest, dry-run-first
  result import, explicit result promotion, docs, fixtures, and tests.
- Excluded: an agent runner, provider/model routing, live fan-out, hosted
  research services, Idvisor daemon/RPC code, raw transcript storage, direct
  Idvisor SQLite access, automatic ticket completion, and paid infrastructure.

## Tickets

- `ticket.context.080`: ready.
- `ticket.context.081`: ready.
- `ticket.context.082`: ready; depends on 080 and 081.
- `ticket.context.083`: ready; depends on 082 and the frozen
  `ctxa.idvisor-result/v1` envelope, adds that implemented schema/command to the
  manifest, and exercises cross-repo interoperability after Idvisor IDV-2105
  lands.

## Execution Plan

- Parallel groups: 080 and 081 may run in separate worktrees. The manifest and
  result-import groups are sequential.
- Sequential dependencies: 082 follows 080 and 081; 083 follows 082.
- Shared-file coordination: every implementation ticket touches the CLI,
  tests, command catalog, or README; merge one ticket commit before starting
  the next shared-file change.
- Worktree strategy: use one worktree per concurrent portable-contract ticket;
  inspect repository dirt before staging.
- Merge queue strategy: one scoped commit per completed ticket, with ticket
  completion metadata and verification evidence in that commit.

## Run Policy

- Max parallel agents: 2.
- Stale lease threshold: 20 minutes.
- Dead-agent cleanup: inspect processes and worktrees; never use broad stash,
  reset, checkout, or unscoped deletion to recover a lane.
- Requeue rules: return a ticket to hardening if implementation needs a new
  artifact status, truth owner, event/RPC name, paid service, provider pin, or
  automatic markdown write not frozen in the source spec.
- Compatibility rules: a schema ID without its checked-in digest is
  incompatible; an exact artifact identity with a changed digest is a
  conflict; a legitimate edit requires a higher superseding revision.
- Independence claim: v1 proves only distinct durable run IDs. Requeue any
  implementation that claims different actor/account/provider/model identity
  without adding and separately hardening durable identity evidence.

## Pack Validation

- Smoke tests:
  - validate one passing and one failing harness-experiment fixture;
  - validate independent and self-verified research claim fixtures;
  - parse `ctxa idvisor manifest --json` as one complete bounded JSON value;
  - list/get each package-installed schema and match its manifest digest;
  - dry-run one valid and one stale-digest Idvisor result import from file and
    bounded stdin;
  - run shared RFC 8785 golden vectors in Node and, after IDV-2105, Rust;
  - prove exact retries are no-ops, conflicting identities fail closed, and a
    superseding artifact revision preserves the old snapshot.
- Screenshots: not required.
- Full regression checks:
  - `node tools/ctx-aide/ctx-aide.mjs scan --json`
  - `node tools/ctx-aide/ctx-aide.mjs spec check --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `npm pack --dry-run`
  - `make validate`

## Completion

- Completed tickets: none.
- Remaining tickets: `ticket.context.080`, `ticket.context.081`,
  `ticket.context.082`, `ticket.context.083`.
- Final validation: pending.
