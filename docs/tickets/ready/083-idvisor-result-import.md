---
id: ticket.context.083
status: ready
title: Import bounded Idvisor workflow results
ticket_pack: pack.ctx-aide-harness-research-contracts-and-idvisor-seam-2026-07-20
milestones:
  - milestone.ctx-aide-harness-research-contracts-and-idvisor-seam
source_spec: spec.harness-research-contracts-and-idvisor-seam-2026-07-20
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: result-import
depends_on:
  - ticket.context.082
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - docs/idvisor/ctx-aide-plugin.md
    - README.md
  directories:
    - docs/runs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "validate and dry-run import a bounded source-linked Idvisor workflow result"
  generated_at: 2026-07-20
  context_ids:
    - spec.harness-research-contracts-and-idvisor-seam-2026-07-20
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.idvisor-remains-runtime-truth
  - axiom.result-import-is-dry-run-first
  - axiom.import-does-not-complete-work
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs idvisor result import --source <fixture> --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Import Bounded Idvisor Workflow Results

## Outcome

`ctxa idvisor result import --source <file> --json` validates a
`ctxa.idvisor-result/v1` export, verifies its digest and source references, and
previews a bounded repo-local run snapshot or explicit promotion without
reading Idvisor storage or changing markdown by default.

## Context

Idvisor should integrate CTX Aide while retaining daemon/runtime/event/storage
authority. The return path must therefore be a versioned result view, not
direct markdown writeback or an event dump. CTX Aide owns the explicit decision
to retain a result snapshot or promote an accepted lesson into repo artifacts.

## Positive Rules

- Default to dry-run with a deterministic write/promotion plan.
- Preserve source artifact digests and stable Idvisor project, queue, workflow,
  run, report, review, feedback, accounting, routing, outcome, and event-sequence
  references that are present.
- Reuse existing feedback promotion, repo-contained path, redaction, bounded
  output, duplicate-fingerprint, and markdown rendering helpers.

## Negative Rules

- Do not connect to the Idvisor daemon, open SQLite, replay events, or trust
  display text as a stable ID.
- Do not import raw transcripts, prompts, completions, provider response bodies,
  credentials, headers, or arbitrary attachments.
- Do not mark tickets/packs done, accept claims, or retain interventions merely
  because an Idvisor run completed.
- Stop and escalate if the input schema is incompatible or a source artifact
  digest no longer matches the target repo.

## Axioms

- `axiom.markdown-source-of-truth`: Imported markdown is a bounded snapshot or
  accepted promotion, never a replacement runtime log.
- `axiom.ticket-done-requires-commit`: Completion requires commit and
  verification evidence.
- `axiom.idvisor-remains-runtime-truth`: Run/event/accounting truth stays in
  Idvisor and is referenced by stable IDs and source sequence.
- `axiom.result-import-is-dry-run-first`: No repo write occurs without
  `--write` and an explicit target mode.
- `axiom.import-does-not-complete-work`: Import cannot change ticket/pack
  completion state or human acceptance fields implicitly.

## Frozen Decisions

- Decision: accepted input schema is exactly `ctxa.idvisor-result/v1`.
- Rationale: CTX Aide can reject future incompatible exports instead of
  misreading them.
- Decision: modes are `run-snapshot`, `harness-result`, `claim-verification`,
  and `feedback-candidate`; `run-snapshot` is the dry-run default suggestion.
- Rationale: each write has a named smallest owner and no generic write-anywhere
  escape hatch.
- Decision: `--write` requires `--mode` and `--target` except when creating a
  new uniquely fingerprinted run snapshot under `docs/runs`.
- Rationale: updates to human-authored artifacts must be explicit.
- Decision: cross-repo interoperability targets Idvisor IDV-2105's generic
  workflow-result export with the CTX renderer.
- Rationale: CTX Aide should not force Idvisor to expose a one-off CTX RPC.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: import reads local JSON and writes local markdown only.

## Implementation Rules

- Required approach: validate the complete bounded JSON envelope, schema,
  required IDs, digest, source-event sequence, source artifact paths/digests,
  allowed metrics, and prohibited fields before producing a plan.
- Existing components/helpers to use: bounded file reads, SHA-256, path-inside,
  redaction, dry-run/write patterns, stable source fingerprinting, feedback
  promotion, and canonical run markdown conventions.
- Anti-patterns to avoid: merging arbitrary JSON into frontmatter, copying
  nested provider payloads, writing to a source file with a stale digest, or
  converting all findings into tickets.
- Stop and escalate if: an update would overwrite a human decision, an
  artifact has changed since export, or the result lacks the evidence IDs
  required by its proposed decision.

## Scope

- In: v1 envelope parser/validator, dry-run plan, bounded run snapshot, explicit
  harness/claim/feedback update modes, idempotency, docs, fixtures, and tests.
- Out: daemon/RPC client code, event replay, transcript import, automatic
  promotion, source fetching, runtime execution, or ticket completion.

## Acceptance Criteria

- Valid input returns schema/version, envelope digest, source artifact checks,
  completion state, Idvisor source IDs, proposed mode/target, writes, conflicts,
  warnings, and no raw nested payloads.
- Canonical digest validation excludes only the digest field and
  `generated_at`, includes `source_event_sequence`, and accepts partial/blocked
  snapshots without converting them to success or acceptance.
- Invalid/truncated/trailing-text input, stale source digests, unknown versions,
  missing source sequence, duplicate/conflicting imports, prohibited fields,
  or oversized summaries fail before writes.
- `--write --mode run-snapshot` creates a bounded snapshot with a source-of-truth
  warning and stable Idvisor references; repeated identical import is a no-op.
- Harness/claim updates require matching artifact ID and digest and may update
  only result/evidence reference fields frozen by tickets 080/081.
- Feedback-candidate mode creates reviewable feedback/future-work input, not a
  ready ticket.

## Validation

- Automated: CLI tests; ticket/pack checks; `make validate`.
- Smoke: dry-run a valid fixture, reject a stale-digest fixture, write one run
  snapshot in a temp repo, and repeat it to prove idempotency.
- Screenshots: none.

## Implementation Notes

The ticket can implement against checked-in v1 fixtures before IDV-2105 lands.
The final pack interoperability smoke is deferred until the Idvisor exporter is
available; that dependency does not require a product decision.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: none; changes to the v1 envelope require a new coordinated
  CTX Aide and Idvisor ticket.
