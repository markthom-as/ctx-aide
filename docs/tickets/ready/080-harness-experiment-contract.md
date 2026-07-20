---
id: ticket.context.080
status: ready
title: Add the portable harness experiment contract
ticket_pack: pack.ctx-aide-harness-research-contracts-and-idvisor-seam-2026-07-20
milestones:
  - milestone.ctx-aide-harness-research-contracts-and-idvisor-seam
source_spec: spec.harness-research-contracts-and-idvisor-seam-2026-07-20
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: portable-contracts
depends_on: []
blocks:
  - ticket.context.082
scope:
  routes: []
  files:
    - docs/runs/templates/harness-experiment.md
    - docs/context/schema/harness-experiment-v1.schema.json
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/runs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add a portable baseline intervention fresh-rerun harness experiment contract"
  generated_at: 2026-07-20
  context_ids:
    - spec.harness-research-contracts-and-idvisor-seam-2026-07-20
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.harness-change-requires-baseline-and-fresh-rerun
  - axiom.harness-intervention-has-one-durable-owner
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs harness experiment check <fixture> --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add The Portable Harness Experiment Contract

## Outcome

`ctxa harness experiment check <file> --json` validates a repo-local
`ctxa.harness-experiment/v1` record and returns a bounded machine projection
that a human or Idvisor can consume without treating CTX Aide as a runtime.

## Context

The harness-engineering source material is useful because it frames repository
guidance and tooling as an experiment: reproduce a representative failure,
locate the earliest failed handoff, change the smallest durable owner, verify
the native target, and rerun fresh. CTX Aide currently has run and ticket
records but no artifact that distinguishes baseline evidence from the outcome
of a harness intervention.

## Positive Rules

- Preserve markdown as the canonical experiment plan and accepted snapshot.
- Prefer one representative job, one earliest gap, and the smallest owning
  intervention per experiment.
- Reuse existing frontmatter parsing, structured errors, bounded output,
  redaction helpers, and command-catalog metadata.

## Negative Rules

- Do not execute agents, validation commands, or reruns from the check command.
- Do not accept a cached or pre-intervention run as fresh-rerun evidence.
- Do not turn every failure into a permanent instruction or guardrail.
- Stop and escalate if implementation requires a new live run coordinator or
  another runtime truth store.

## Axioms

- `axiom.markdown-source-of-truth`: The experiment record is canonical repo
  intent; generated JSON is a projection.
- `axiom.ticket-done-requires-commit`: Completion requires commit and
  verification evidence.
- `axiom.harness-change-requires-baseline-and-fresh-rerun`: Retain or revise is
  invalid without baseline evidence, target-native checks, and a distinct
  fresh representative rerun.
- `axiom.harness-intervention-has-one-durable-owner`: Every intervention names
  the smallest repository owner and a rollback/retirement condition.

## Frozen Decisions

- Decision: schema ID is exactly `ctxa.harness-experiment/v1`.
- Rationale: the version is explicit in machine projections and can evolve
  without silently changing old markdown meaning.
- Decision: repository-scoped artifact identity is
  `(producer, schema_id, experiment_id, artifact_revision)` where
  `artifact_revision` is a positive integer; a
  higher revision may name `supersedes_artifact_revision`, but the same
  identity with a different digest is a conflict.
- Rationale: retries remain idempotent while accepted experiment updates keep
  prior evidence immutable.
- Decision: artifact revision and every projected integer are at most
  `9007199254740991`.
- Rationale: Node/Rust JSON remains inside the RFC 8785/I-JSON interoperable
  integer range.
- Decision: lifecycle phases are exactly `planned`, `baseline_recorded`,
  `intervention_recorded`, and `decided`.
- Rationale: a plan must validate before a run exists, without weakening the
  evidence required for a final retain/revise/remove decision.
- Decision: normalized gap classes are exactly `context`, `capability`,
  `domain_ownership`, `authority`, `proof`, `feedback`, and `worker`.
- Rationale: they separate missing information from missing execution ability,
  ownership, permission, evidence, feedback, or worker capability.
- Decision: final decisions are exactly `retain`, `revise`, and `remove`.
- Rationale: a completed experiment must say what happens to the intervention.
- Decision: the normative projection schema is
  `docs/context/schema/harness-experiment-v1.schema.json`; validators return
  its exact `schema_sha256`, and package builds must ship it.
- Rationale: consumers can reject a drifted `/v1` contract mechanically.
- Decision: input and projected JSON are each limited to 256 KiB; evidence
  summaries are limited to 4 KiB each, lists to 100 entries, IDs to 128
  characters, and repository-relative paths to 1,024 characters.
- Rationale: local artifacts remain useful while every parser and integration
  surface has a deterministic resource ceiling.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: this ticket adds local templates, parsing, validation, and docs.

## Implementation Rules

- Required approach: add the template and a read-only `harness experiment
  check` command that parses one repo-contained markdown file and returns the
  schema ID/digest, stable ID/revision, normalized fields, validation state,
  and exact source-file digest.
- Existing components/helpers to use: markdown/frontmatter parsing, path-inside
  checks, SHA-256 helper or Node crypto, bounded output, redaction, command
  manifest/catalog conventions, and fixture temp repos.
- Anti-patterns to avoid: shelling out, interpreting command strings, accepting
  free-form phase/gap/decision values, normalizing source bytes before hashing,
  or copying full validation logs.
- Conditional validation:
  - `planned` requires the frozen job, authority, budget, stop, hypothesis,
    intervention owner, rollback, review, and retirement contract only;
  - `baseline_recorded` additionally requires baseline evidence and earliest
    failed handoff;
  - `intervention_recorded` additionally requires target-native checks and a
    fresh rerun whose run ID differs from baseline;
  - `decided` additionally requires decision, rationale, carrying cost, and
    operator acceptance; `retain`/`revise` require passing target-native checks
    and fresh-rerun evidence.
- Any phase change is represented by a higher artifact revision with an
  explicit supersedes reference, bounded `revision_reason`, and `prior_phase`.
  Phase may stay unchanged or advance
  `planned -> baseline_recorded -> intervention_recorded -> decided`, skipping
  only when all target-phase fields exist. `decided` can supersede only as
  `decided`. Live Idvisor progress never edits the source revision.
- CLI behavior: the command is noninteractive, accepts exactly one file, emits
  one JSON object and no stderr on JSON success, emits no ANSI/spinner output,
  and on JSON failure emits exactly one bounded structured error/result object
  on stdout, empty stderr, and a nonzero exit. Bound errors to 100 entries with
  512-character messages and report `errors_omitted_count` when necessary.
- Stop and escalate if: a required field cannot be expressed without adding a
  runtime status that competes with Idvisor run truth.

## Scope

- In: template, parser, validator, JSON projection, command discovery, docs,
  passing/failing fixtures, and tests.
- Out: executing the experiment, launching a harness, Idvisor RPC, automatic
  lesson promotion, modifying `AGENTS.md`, or storing transcripts.

## Acceptance Criteria

- The template covers artifact revision/supersession, lifecycle phase, target
  revision/external state, job, worker requirements, accepted outcome,
  authority, budget/stop, baseline, earliest gap, hypothesis, intervention
  owner/rollback, native checks, fresh rerun, decision, carrying cost,
  review/retirement, and operator acceptance.
- A valid `planned` artifact contains no fabricated result fields; each later
  phase enforces the exact conditional requirements frozen above.
- `check` rejects missing baseline/fresh-rerun evidence for retain/revise,
  unknown gap/decision values, identical baseline and fresh-run IDs, path
  escape, unbounded evidence, and secret-like content.
- A valid record returns one complete JSON value with schema ID/digest,
  artifact ID/revision, supersession reference, relative source path,
  exact-byte SHA-256 digest, normalized phase/decision, and errors array.
- The command remains read-only and does not create run files or invoke tools.
- Fixtures prove deterministic identity/digest projection, rejection of an
  invalid same-or-higher superseded revision, valid higher revision shape, and
  256 KiB bounds. Cross-file import conflicts belong to tickets 083/IDV-2102,
  not this one-file read-only checker.
- `npm pack --dry-run` includes the normative schema, and a test parses the
  packed/installed schema rather than relying only on the checkout.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`; `node
  tools/ctx-aide/ctx-aide.mjs ticket check --json`; `node
  tools/ctx-aide/ctx-aide.mjs pack check --json`; `make validate`.
- Smoke: run `harness experiment check` against one retained experiment and one
  invalid cached-rerun fixture.
- Screenshots: none.

## Implementation Notes

This artifact may reference Idvisor IDs, but the checker must not require
Idvisor. Standalone evidence can use stable local run/evidence IDs.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: `ticket.context.082` advertises the schema to Idvisor.
