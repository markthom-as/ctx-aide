---
id: ticket.context.081
status: ready
title: Add the portable research claim-set contract
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
    - docs/research/templates/claim-set.md
    - docs/context/schema/research-claim-set-v1.schema.json
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/research
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add atomic independently verified research claim records with source evidence"
  generated_at: 2026-07-20
  context_ids:
    - spec.harness-research-contracts-and-idvisor-seam-2026-07-20
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.finder-cannot-verify-own-claim
  - axiom.numbers-require-exact-source-evidence
  - axiom.claim-rejection-is-atomic
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs research claims check <fixture> --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add The Portable Research Claim-Set Contract

## Outcome

`ctxa research claims check <file> --json` validates atomic research claims,
their evidence, independent verification, synthesis eligibility, and human
acceptance as `ctxa.research-claim-set/v1`.

## Context

The useful Quesma lesson is the role and evidence pipeline, not its particular
provider wrapper. CTX Aide needs a portable artifact that keeps discovery,
verification, judgment, synthesis, and acceptance distinct, and that rejects
one unsupported claim without discarding unrelated valid findings.

## Positive Rules

- Preserve stable subject, claim-set, claim, source, finder, and verifier IDs.
- Prefer primary sources and require a reason for accepting secondary evidence.
- Keep exact numbers as structured value/unit/scope fields linked to evidence.
- Reuse bounded text, redaction, source-pointer, digest, and structured-error
  helpers.

## Negative Rules

- Do not allow a finder reference to satisfy independent verification.
- Do not store whole pages, raw provider responses, prompts, completions, or
  shared transcript memory in a claim set.
- Do not turn proposed/rejected claims into implementation tickets.
- Stop and escalate if claim truth would depend on an unversioned opaque model
  judgment rather than named evidence and acceptance.

## Axioms

- `axiom.markdown-source-of-truth`: Accepted claim snapshots are canonical
  repo artifacts; runtime projections remain external references.
- `axiom.ticket-done-requires-commit`: Completion requires commit and
  verification evidence.
- `axiom.finder-cannot-verify-own-claim`: A verified claim has distinct finder
  and verifier references.
- `axiom.numbers-require-exact-source-evidence`: Every number includes value,
  unit, scope, and a source/evidence ID that supports it.
- `axiom.claim-rejection-is-atomic`: One rejected claim does not invalidate or
  mutate unrelated claims in the set.

## Frozen Decisions

- Decision: schema ID is exactly `ctxa.research-claim-set/v1`.
- Rationale: integrations can negotiate compatibility explicitly.
- Decision: repository-scoped artifact identity is
  `(producer, schema_id, claim_set_id, artifact_revision)` where
  `artifact_revision` is a positive integer; a
  higher revision may name `supersedes_artifact_revision`, but the same
  identity with a different digest is a conflict.
- Rationale: a corrected claim set preserves the evidence and judgments of the
  revision it supersedes.
- Decision: claim statuses are exactly `proposed`, `verification_required`,
  `verified`, `rejected`, and `accepted_for_synthesis`.
- Rationale: discovery is not verification, and verification is not human
  acceptance for synthesis.
- Decision: source kinds are `primary` and `secondary`; a secondary source
  requires `secondary_source_reason` for verified/accepted claims.
- Rationale: the validator can enforce the preference without pretending every
  question has a primary public source.
- Decision: excerpts default to a 240-character maximum and remain
  configurable only downward in the first slice.
- Rationale: locators and paraphrase carry provenance without copying source
  documents.
- Decision: numeric facts use source-preserving `value_text` plus `unit`,
  `scope`, and evidence ID; confidence is exactly `low`, `medium`, or `high`.
  JSON floating-point values are prohibited, and projected integers are within
  `-9007199254740991..9007199254740991`.
- Rationale: the source's exact number remains auditable and Node/Rust RFC 8785
  hashing cannot diverge through float or unsafe-integer serialization.
- Decision: v1 verification independence is exactly
  `independence_level: distinct_run`; finder and verifier run IDs must differ.
- Rationale: the current Idvisor run record cannot prove a different actor,
  account, provider, or model, so the portable contract must not overclaim.
- Decision: the normative projection schema is
  `docs/context/schema/research-claim-set-v1.schema.json`; validators return its
  exact `schema_sha256`, and package builds must ship it.
- Rationale: schema compatibility is an ID/digest pair, not a version label
  alone.
- Decision: a claim set is limited to 500 claims and 1 MiB exact input and
  projected JSON bytes; each claim is limited to 20 sources and 50 numeric
  facts, IDs/value text to 128 characters, units to 64, URLs to 2,048,
  paths/locators to 1,024, statements/reasons to 4,096, and excerpts to 240
  characters.
- Rationale: fan-out and evidence capture remain deterministically bounded.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: this ticket performs local validation only.

## Implementation Rules

- Required approach: add a template plus read-only `research claims check`
  command that validates each claim independently and returns aggregate counts
  without collapsing claim-specific errors; return schema ID/digest,
  artifact ID/revision, supersession, and exact source-file digest.
- Existing components/helpers to use: repo-contained path checks,
  markdown/frontmatter parsing, SHA-256, bounded/redacted text, command catalog,
  and existing fixture style.
- Anti-patterns to avoid: a single free-form research memo, hidden confidence
  scoring, URLs without locators, or accepting a number merely because it
  appears in finder prose.
- Status never changes inside one revision. Across declared superseding
  revisions, allow unchanged status; `proposed` to
  `verification_required|verified|rejected`; `verification_required` to
  `verified|rejected`; and `verified` to
  `accepted_for_synthesis|rejected`. Direct advancement requires all target
  evidence. A terminal `rejected`/`accepted_for_synthesis` claim may reopen only
  through a higher revision with `reopens_claim_from_artifact_revision` and a
  bounded `reopen_reason`, returning to `verification_required`.
- A superseding set includes a `status_changes` array (maximum 500) with one
  `claim_id/from/to` row per changed existing claim. A newly introduced claim
  instead declares `introduced_in_artifact_revision` equal to the current
  revision. Every superseding set has a bounded `revision_reason`. The checker
  validates the ledger shape/transition; result import performs the cross-file
  compare-and-swap against the actual prior snapshot.
- Finder and verifier references are typed run references in the machine
  projection. They may use the same harness/model, but must be different run
  IDs and must not assert shared transcript or private-reasoning state.
- CLI behavior: the command is noninteractive, accepts exactly one file, emits
  one JSON object and no stderr on JSON success, emits no ANSI/spinner output,
  and on JSON failure emits exactly one bounded structured error/result object
  on stdout, empty stderr, and a nonzero exit. Bound errors to 20 per claim and
  1,000 total with 512-character messages; report `errors_omitted_count` rather
  than exceeding the projection cap.
- Stop and escalate if: implementation needs network fetching or live model
  execution; those belong to an execution runtime.

## Scope

- In: claim-set template, status/evidence schema, validator, per-claim errors,
  JSON projection, command discovery, docs, fixtures, and tests.
- Out: browsing, agent fan-out, provider routing, full-text source storage,
  automatic synthesis, ticket generation, Idvisor events, and paid services.

## Acceptance Criteria

- A claim set freezes artifact revision/supersession, question,
  scope/exclusions, evidence policy, budget/stop, subject ID, and human
  acceptance state.
- Each claim contains statement, status, finder, sources/evidence, numeric
  facts, verification result, confidence, rejection/contradiction reason, and
  synthesis eligibility as applicable.
- The checker rejects same-run verification, unsupported numbers, verified
  claims without source locators, overlong excerpts, missing secondary-source
  reasons, invalid status transitions, duplicate IDs, path escape, and claims
  that assert stronger identity independence than `distinct_run` can prove.
- The JSON projection includes per-claim validity/errors plus aggregate counts
  for proposed, verification-required, verified, rejected, and
  accepted-for-synthesis claims.
- A rejected claim does not make valid unrelated claims disappear from output.
- Fixtures prove deterministic identity/digest projection, rejection of an
  invalid same-or-higher superseded revision, terminal-state correction shape
  through a higher revision, and all frozen size/count bounds. Cross-file
  import conflicts belong to tickets 083/IDV-2102, not this one-file checker.
- `npm pack --dry-run` includes the normative schema, and a test parses the
  packed/installed schema rather than relying only on the checkout.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`; `node
  tools/ctx-aide/ctx-aide.mjs ticket check --json`; `node
  tools/ctx-aide/ctx-aide.mjs pack check --json`; `make validate`.
- Smoke: validate one mixed claim set containing verified and rejected claims,
  plus one self-verification failure fixture.
- Screenshots: none.

## Implementation Notes

Stronger actor/account/provider/model independence is a v2 concern blocked on
durable Idvisor actor identity. It is not implied by differently named local
strings or by two display labels.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: `ticket.context.082` advertises the schema to Idvisor.
