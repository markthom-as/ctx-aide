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
    - docs/context/schema/idvisor-result-v1.schema.json
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

`ctxa idvisor result import --source <file|-> --json` validates a
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
  run, report, review, decision, feedback, accounting, routing, outcome, and
  event-sequence references that are present.
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
- Decision: compatibility requires the exact checked-in
  `docs/context/schema/idvisor-result-v1.schema.json` ID/digest pair; ticket 083
  adds that pair and its command row to the manifest from ticket 082.
- Rationale: result import is not advertised until its validator exists, and
  `/v1` alone cannot detect contract drift.
- Decision: modes are `run-snapshot`, `harness-result`, `claim-verification`,
  and `feedback-candidate`; `run-snapshot` is the dry-run default suggestion.
- Rationale: each write has a named smallest owner and no generic write-anywhere
  escape hatch.
- Decision: `--write` requires `--mode` and `--target` except when creating a
  new uniquely fingerprinted run snapshot under `docs/runs`. Harness-result and
  claim-verification updates additionally require
  `--new-artifact-revision <positive-integer>` greater than the matched target
  revision and write `supersedes_artifact_revision`.
- Rationale: updates to human-authored artifacts must be explicit.
- Decision: cross-repo interoperability targets Idvisor IDV-2105's generic
  workflow-result export with the CTX renderer.
- Rationale: CTX Aide should not force Idvisor to expose a one-off CTX RPC.
- Decision: envelope canonicalization is RFC 8785 over all fields except
  `envelope_sha256` and `generated_at`; every schema numeric field is an
  integer within `-9007199254740991..9007199254740991`, decimals/costs/ratios
  are strings with units, and source-file digests remain SHA-256 of exact bytes.
- Rationale: Node and Rust must compute the same digest without normalizing or
  reparsing the source markdown.
- Decision: `--source -` reads bounded stdin; file and stdin inputs are each
  limited to 1 MiB. Detached stdin never prompts and file/stdin cannot be
  supplied together.
- Rationale: agents can stream results safely without hidden interactive
  behavior or unbounded buffering.
- Decision: a schema-valid result envelope is at most 256 KiB; source artifacts
  at most 32; each queue/run/review/decision/related-ID list at most 1,024;
  stage metrics at most 128; blockers/warnings/next-actions at most 100 each
  with 1 KiB entries; and summary/evidence/decision rationale at most 4 KiB.
- Rationale: the 1 MiB parser ceiling safely rejects diagnostic junk while the
  interoperable contract matches Idvisor's stricter export ceiling.
- Decision: result snapshots are immutable by envelope digest. An exact retry
  against the same target artifact revision is a no-op; a different envelope
  for the same import identity is a conflict.
- Rationale: safe retry must not duplicate snapshots or overwrite a different
  result.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: import reads local JSON and writes local markdown only.

## Implementation Rules

- Required approach: validate the complete bounded JSON envelope, schema,
  schema digest, required IDs, RFC 8785 digest, source-event sequence, exact
  source artifact ID/revision/path/digest, allowed metrics, durable decision
  references, typed decision actors, and prohibited fields before producing a
  plan.
- Existing components/helpers to use: bounded file reads, SHA-256, path-inside,
  redaction, dry-run/write patterns, stable source fingerprinting, feedback
  promotion, and canonical run markdown conventions.
- Anti-patterns to avoid: merging arbitrary JSON into frontmatter, copying
  nested provider payloads, writing to a source file with a stale digest, or
  converting all findings into tickets; never infer a claim or harness
  decision from queue status, completion text, or a timestamp.
- Human acceptance is valid only when the envelope references a durable
  `operator_command` decision plus the separate Idvisor manual-approval source.
  A run decision may propose or verify an outcome but cannot satisfy human
  acceptance. A `recorded_by` label is display-only and does not attest human
  identity.
- JSON behavior: success is one object on stdout, empty stderr, and exit 0;
  failure is one structured error object with a stable `error.code`, no partial
  plan/ANSI/spinner/prompt, empty stderr, and nonzero exit. Stable codes are
  `invalid_arguments`, `input_too_large`, `invalid_json`,
  `unsupported_schema`, `schema_digest_mismatch`,
  `envelope_digest_mismatch`, `source_artifact_stale`, `target_conflict`,
  `prohibited_field`, and `write_failed`.
- `--write --mode run-snapshot` uses atomic create-new/no-overwrite semantics,
  requires an existing parent directory, cleans temporary files on failure,
  and never silently replaces a path. Update modes parse and hash the same
  bounded bytes once, then recheck target revision/digest immediately before
  an atomic compare-and-swap. They produce the explicit higher revision and
  never mutate the imported old identity in place. Harness updates write
  `prior_phase`/`revision_reason`; claim updates write the exact
  `status_changes` rows and `revision_reason` required by tickets 080/081.
- Stop and escalate if: an update would overwrite a human decision, an
  artifact has changed since export, or the result lacks the evidence IDs
  required by its proposed decision.

## Scope

- In: normative v1 schema plus manifest row, envelope parser/validator,
  dry-run plan, bounded stdin/file input, bounded run snapshot, explicit
  harness/claim/feedback update modes, idempotency, docs, fixtures, and tests.
- Out: daemon/RPC client code, event replay, transcript import, automatic
  promotion, source fetching, runtime execution, or ticket completion.

## Acceptance Criteria

- Valid input returns schema/version, envelope digest, source artifact checks,
  exact target artifact revision, completion state, Idvisor source and decision
  IDs, proposed mode/target, writes, conflicts, warnings, and no raw nested
  payloads.
- Canonical digest validation excludes only the digest field and
  `generated_at`, includes `source_event_sequence`, and accepts partial/blocked
  snapshots without converting them to success or acceptance.
- Invalid/truncated/trailing-text input, stale source digests, unknown versions,
  missing source sequence, duplicate/conflicting imports, prohibited fields,
  or oversized summaries fail before writes.
- `--write --mode run-snapshot` creates a bounded snapshot with a source-of-truth
  warning and stable Idvisor references; repeated identical import is a no-op.
- Harness/claim updates require matching artifact ID, artifact revision,
  schema digest, and source-file digest and may update only result/evidence
  reference fields frozen by tickets 080/081. They require an explicit higher
  new revision and supersedes reference; the old imported identity is never
  silently changed.
- Feedback-candidate mode creates reviewable feedback/future-work input, not a
  ready ticket.
- Shared Node/Rust RFC 8785 golden vectors cover Unicode, escaping, nested
  arrays/objects, key order, omitted digest/time fields, and event sequence;
  interoperability is not claimed until both implementations pass them.
- Tests cover bounded stdin, detached stdin, existing-output refusal,
  temporary-file cleanup, exact retry no-op, conflicting retry, stale
  artifact revision, compare-and-swap race, invalid/non-higher superseding
  revision, retry after the superseding revision already exists, wrong
  known-schema digest, operator-command plus manual-approval acceptance, and
  untrusted `recorded_by` label behavior.
- `npm pack --dry-run` includes the result schema and the installed manifest
  advertises the command only after implementation.

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
