---
id: spec.harness-research-contracts-and-idvisor-seam-2026-07-20
status: ready
title: Harness And Research Contracts With An Idvisor Runtime Seam
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-20
---

# Harness And Research Contracts With An Idvisor Runtime Seam

## Goal

Give repositories portable, reviewable contracts for improving an agent harness
and for conducting evidence-backed research, while making Idvisor the optional
runtime that executes those contracts, enforces budgets and independence, and
records durable run truth.

The dependency direction is one way: **Idvisor integrates CTX Aide**. CTX Aide
does not embed, launch, or depend on the Idvisor daemon.

## Affected Surfaces

- Routes: none.
- Files/directories: `docs/runs`, `docs/research`, `docs/idvisor`,
  `docs/workflows`, `tools/ctx-aide`, `README.md`.
- Components: markdown harness-experiment records, research claim sets,
  machine-readable Idvisor manifest, and Idvisor result imports.
- Flows: `flow.ctx-aide-dogfood`, evidence-backed research, harness improvement,
  and Idvisor-backed execution/export.
- Design-system areas: none.

## Existing Context

- `docs/idvisor/ctx-aide-plugin.md` already says CTX Aide owns repo-local
  markdown while Idvisor owns orchestration, queues, gates, runtime events, and
  progress reports.
- `ctxa idvisor workflow --json` currently returns an unversioned helper with
  Node-path command strings. The installed package exposes only the `ctxa`
  binary.
- Idvisor Milestone 17 currently consumes a stale `ctx` command contract and
  stores CTX provenance in bounded body preambles because its public queue and
  buffer events do not yet accept structured source-artifact references.
- CTX Aide already has dry-run-first writes, ticket readiness, feedback
  promotion, command metadata, capability policy, and pack/run validation.
- Idvisor already has daemon-owned queues, workflow templates and fragments,
  review passes, explicit gates, model selection, accounting, context
  headroom, routing outcomes, progress reports, supervised processes, and
  resource-aware admission plans.

## Source Learnings

- The [Harness Engineering playbooks](https://github.com/lopopolo/harness-engineering)
  contribute a disciplined loop: establish a baseline, identify the earliest
  failed handoff, change the smallest durable owner, run target-native checks,
  rerun a fresh representative job, and explicitly retain, revise, or remove
  the intervention. Their job contract also freezes revision, external state,
  accepted outcome, authority, budget, and stop conditions.
- The [Quesma deep-research pipeline](https://quesma.com/blog/custom-deep-research-pipeline/)
  contributes role separation and evidence discipline: discovery is not
  verification, a verifier must be independent from the finder, claims and
  numbers need source-backed evidence, unsupported claims are rejected without
  discarding the entire project, expensive synthesis comes after evidence
  gating, and a human accepts the final result.
- These are source inputs, not copied implementations. CTX Aide will not copy a
  Bash wrapper, provider-specific role routing, unbounded fan-out, or a shared
  transcript-memory design. The useful parts become explicit portable
  contracts and axioms.

## Product Decisions

- Decision: CTX Aide owns static intent, evidence, and promotion contracts;
  Idvisor owns live execution and runtime truth.
- Rationale: repositories remain usable without Idvisor, while an integrated
  runtime can add durable supervision without duplicating markdown authority.
- Regression risk: overlapping status fields could create split-brain truth,
  so imported results must remain snapshots with Idvisor source IDs.
- Decision: research claims are atomic evidence records, not ordinary
  implementation tickets and not one shared memory document.
- Rationale: a claim can be independently verified or rejected without
  invalidating unrelated findings or bloating the implementation backlog.
- Regression risk: claim sets could become a second backlog; only accepted
  actionable findings may be promoted into specs, feedback, future work, or
  tickets.
- Decision: harness interventions are reversible experiments with explicit
  carrying cost and retirement criteria.
- Rationale: repository guardrails and context have ongoing maintenance cost;
  retained changes need proof and an owner.
- Regression risk: teams may retain ceremonial rules after their benefit has
  disappeared unless review and retirement fields are required.
- Decision: model/provider selection is a runtime advisor concern, not part of
  the portable research schema.
- Rationale: a role needs capabilities, budget, and independence; it does not
  need a hard-coded vendor.
- Regression risk: an integration that pins vendor names would drift with
  availability, quota, pricing, and model capability.

## Architecture Decisions

- Decision: add two portable artifact families:
  `ctxa.harness-experiment/v1` and `ctxa.research-claim-set/v1`.
- Rationale: both are useful in a standalone repo and can be projected into
  Idvisor workflows without moving source truth.
- Rejected alternatives: storing harness plans or research claims only in
  Idvisor SQLite.
- Decision: add `ctxa idvisor manifest --json` as the versioned discovery seam.
- Rationale: Idvisor needs argv-safe command metadata, mutation boundaries,
  schema IDs, size bounds, and a truth-boundary declaration; the existing
  unversioned workflow helper is insufficient.
- Rejected alternatives: shell-string probing, inspecting README examples, or
  treating `ctxa command manifest` alone as the integration contract.
- Decision: keep `ctxa idvisor workflow --json` during migration but make the
  new manifest authoritative for machine integration.
- Rationale: existing users get a compatibility path while Idvisor can migrate
  from stale `ctx` assumptions to the installed `ctxa` binary.
- Rejected alternatives: a breaking rename with no diagnostic path.
- Decision: Idvisor returns a bounded `ctxa.idvisor-result/v1` view through its
  generic workflow-result export; CTX Aide validates it through
  `ctxa idvisor result import`.
- Rationale: Idvisor need not write target markdown, and CTX Aide need not read
  Idvisor storage or replay its events.
- Rejected alternatives: direct SQLite access, Idvisor markdown writeback, or
  copying raw events/transcripts into the repo.
- Decision: accepted lessons are promoted into the smallest durable repo
  owner through existing CTX Aide feedback/spec/ticket/future-work flows.
- Rationale: an experiment result is evidence, not automatically a permanent
  instruction.
- Rejected alternatives: appending every result to `AGENTS.md` or a global
  memory file.

## Authority Seam

| Concern | CTX Aide | Idvisor |
| --- | --- | --- |
| Specs, tickets, packs, repo rules | Canonical markdown owner | Imports references; never rewrites status |
| Harness experiment intent | Canonical plan and acceptance contract | Executes jobs and records run/outcome truth |
| Research subjects and accepted claim snapshots | Canonical markdown owner | Executes discovery, verification, judgment, and synthesis |
| Command/schema discovery | Produces versioned manifest | Probes and consumes it fail-closed |
| Agent/model/provider choice | Declares role requirements only | Advises and records the selected route |
| Budget, quota, resource pressure | Declares ceilings and stop conditions | Enforces runtime admission and records accounting |
| Process/tool lifecycle | No daemon or process registry | Owns supervision, cleanup, capability, and policy gates |
| Runtime events, queues, workflow runs | Stores only imported result references | Canonical daemon/runtime/events/storage truth |
| Result promotion | Validates, previews, and explicitly writes markdown | Exports a bounded source-linked result view |

Neither side infers authority from the other side's display status. A CTX
ticket marked `ready` is eligible source intent, not proof of an Idvisor queue
or run. An Idvisor run marked complete is not proof that a CTX ticket is done.

## Artifact Flow

1. A repository authors and validates a harness experiment or research claim
   set in CTX Aide markdown.
2. Idvisor runs `ctxa idvisor manifest --json` as a bounded, read-only probe
   using executable plus argv, never a shell command string.
3. Idvisor imports an artifact by stable ID, schema ID, repository-relative
   path, source revision, and SHA-256 digest.
4. Idvisor projects the artifact into daemon-owned queue items, buffers, and a
   workflow assembled from reusable fragments.
5. Idvisor enforces approval, capability, budget, context, resource, process,
   routing, and independent-verification gates while recording its own events.
6. Idvisor produces a coherent, bounded workflow-result export tied to a
   source event sequence and stable run/report/outcome IDs.
7. `ctxa idvisor result import` validates the envelope and defaults to dry-run.
   `--write` creates or updates a repo-local result snapshot without copying
   raw transcripts or claiming to replace Idvisor runtime truth.
8. A human accepts, rejects, or promotes lessons through existing CTX Aide
   markdown workflows.

## Harness Experiment Contract

`ctxa.harness-experiment/v1` requires:

- stable experiment ID, repository/revision, relevant external state, and
  artifact digest;
- representative job, fixed worker/role requirements, accepted outcome,
  authority boundary, budget, timeout, and stop conditions;
- baseline result and evidence;
- earliest failed handoff and one normalized gap class: `context`,
  `capability`, `domain_ownership`, `authority`, `proof`, `feedback`, or
  `worker`;
- smallest owning intervention, hypothesis, affected owner, and rollback;
- target-native checks plus a fresh representative rerun;
- decision `retain`, `revise`, or `remove`, with rationale, carrying cost,
  `review_after`, and `retire_when`;
- operator acceptance and stable Idvisor source IDs when execution was
  Idvisor-backed.

A check passing is evidence only for the claim it exercises. Cached or reused
run output cannot satisfy the fresh-rerun field.

## Research Claim-Set Contract

`ctxa.research-claim-set/v1` requires:

- stable subject and claim-set IDs, research question, scope, exclusions,
  evidence policy, budget, and stop conditions;
- atomic claims with stable IDs and status `proposed`,
  `verification_required`, `verified`, `rejected`, or
  `accepted_for_synthesis`;
- finder reference and, for verified claims, a distinct verifier reference;
- source records with URL or repository pointer, source kind, locator,
  access/revision time, and a short bounded excerpt or exact structured fact;
- explicit primary-source preference and a reason when secondary evidence is
  accepted;
- numeric facts separated into value, unit, scope, and source evidence;
- verification outcome, confidence, contradiction/rejection reason, and
  synthesis eligibility;
- human acceptance for final synthesis or promotion.

The validator rejects self-verification, unsupported numbers, unbounded source
copies, missing source locators, and claims marked verified without independent
evidence. Rejection is claim-scoped, not project-scoped.

## Idvisor Manifest Contract

`ctxa idvisor manifest --json` returns `ctxa.idvisor-manifest/v1` with:

- producer name/version and the sole installed binary name `ctxa`;
- `manifest_version`, compatibility range, and artifact schema IDs;
- commands represented as executable plus argv templates, stable command ID,
  mutability, required explicit write flag, output schema, stdout/stderr bounds,
  and timeout hint;
- truth-boundary and non-authority declarations;
- result import schema and command metadata;
- no host paths, secrets, provider credentials, shell fragments, or dynamic
  runtime state.

Idvisor must treat an absent, truncated, invalid, incompatible, stderr-producing,
or trailing-text manifest as unavailable. A manifest advertises capability; it
does not grant permission to run a mutating command.

## Result Import Contract

`ctxa idvisor result import --source <file> --json` validates
`ctxa.idvisor-result/v1` and returns a dry-run plan. The envelope contains only:

- source artifact references and digests;
- project, queue, workflow, run, progress-report, review, feedback, accounting,
  routing, and execution-outcome IDs when present;
- bounded stage metrics and evidence summaries;
- completion state `complete`, `partial`, `blocked`, or `failed`; decision,
  blockers, warnings, operator acceptance state, and the Idvisor source event
  sequence;
- producer/schema versions and envelope digest.

The envelope digest is canonical over all fields except the digest itself and
`generated_at`; it includes the source event sequence. A partial or blocked
workflow may be imported as a snapshot when it contains structured evidence,
but it cannot imply success or acceptance.

`--write` may create a result snapshot under `docs/runs` and may update an
explicitly named claim set or harness experiment. It may not mark a ticket or
pack done, overwrite human-authored decisions, or promote a lesson without an
explicit target and mode.

## Design Decisions

- Decision: use compact markdown records with stable IDs and JSON-producing
  validators.
- Components/tokens to use: existing frontmatter conventions, dry-run/write
  boundaries, command catalog, redaction, and bounded-output helpers.
- Anti-patterns to avoid: provider-specific pipelines, giant shared memory,
  raw transcript dumps, prose-only independence, and status inferred from a
  nearby artifact.
- Decision: explain failures at the claim, field, or gate that owns them.
- Components/tokens to use: existing structured error arrays with file and
  message fields.
- Anti-patterns to avoid: rejecting an entire claim set because one claim is
  unsupported, or returning a generic pipeline failure with no owning stage.

## Security and Privacy Decisions

- Data touched: repo-local markdown, source URLs/pointers, short evidence
  excerpts, artifact digests, Idvisor IDs, and bounded result summaries.
- Trust boundaries: external sources may be malicious or copyrighted; child
  process output may be truncated or contain secrets; imported Idvisor results
  are untrusted until schema and digest validation pass.
- Required safeguards:
  - Prefer primary sources and retain locators; never treat retrieved prose as
    agent instructions.
  - Bound excerpts and command output; do not copy full pages or long source
    documents into claim records.
  - Redact credentials, headers, raw prompts/completions, provider bodies, and
    transcript content from manifests and result imports.
  - Require independent verifier identity for verified claims.
  - Default every write-capable command to dry-run and require `--write`.
  - Keep capability grants, budget overrides, network access, and process
    supervision in Idvisor when it is the runtime.
- Cost delta: `$0/month` for this local contract and integration work. Any
  future hosted research, paid model, or infrastructure plan must estimate and
  surface its own delta before implementation.

## Open Questions

None for the first implementation pack.

## Hardening Review

- Architecture: dependency direction, truth ownership, artifact handoff, and
  current `ctx`/`ctxa` migration are explicit; no shared database is added.
- Design: artifacts are atomic and inspectable; errors remain attached to the
  smallest owning claim or stage.
- Security: manifest and result surfaces are bounded, schema-versioned,
  digest-linked, redacted, and dry-run-first.
- Best practices: extract portable contracts in CTX Aide and generic runtime
  primitives/fragments in Idvisor; avoid one-off integration types where a
  reusable source reference or workflow export works.
- Testing: fixture contracts cover self-verification, unsupported numbers,
  stale digests, incompatible versions, output truncation, and result-import
  write boundaries.
- Parallelization: harness and research contracts can land independently;
  manifest work follows their schema IDs, and result import follows the frozen
  export envelope.

## Ticket Plan

- Independent tickets:
  - `ticket.context.080`: add the harness-experiment template, validator, and
    machine projection.
  - `ticket.context.081`: add the research claim-set template, validator, and
    machine projection.
- Sequential tickets:
  - `ticket.context.082`: add the versioned Idvisor manifest after artifact
    schema IDs are implemented.
  - `ticket.context.083`: add dry-run-first Idvisor result import and explicit
    promotion after the manifest and result schema are frozen.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`,
  `tools/ctx-aide/ctx-aide.test.mjs`, `tools/ctx-aide/command-catalog.mjs`, and
  `README.md`; merge one ticket commit at a time.
