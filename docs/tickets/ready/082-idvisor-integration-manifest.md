---
id: ticket.context.082
status: ready
title: Add the versioned Idvisor integration manifest
ticket_pack: pack.ctx-aide-harness-research-contracts-and-idvisor-seam-2026-07-20
milestones:
  - milestone.ctx-aide-harness-research-contracts-and-idvisor-seam
source_spec: spec.harness-research-contracts-and-idvisor-seam-2026-07-20
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: idvisor-manifest
depends_on:
  - ticket.context.080
  - ticket.context.081
blocks:
  - ticket.context.083
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - docs/context/schema/idvisor-manifest-v1.schema.json
    - docs/idvisor/ctx-aide-plugin.md
    - README.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "publish a bounded versioned argv-safe CTX Aide manifest for Idvisor"
  generated_at: 2026-07-20
  context_ids:
    - spec.harness-research-contracts-and-idvisor-seam-2026-07-20
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.ctxa-is-the-installed-binary
  - axiom.integration-manifest-does-not-grant-mutation
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs command manifest --json
    - node tools/ctx-aide/ctx-aide.mjs idvisor manifest --json
  smoke:
    - ctxa idvisor manifest --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add The Versioned Idvisor Integration Manifest

## Outcome

`ctxa idvisor manifest --json` returns a bounded
`ctxa.idvisor-manifest/v1` contract that lets Idvisor discover CTX Aide's
portable artifacts and safe command shapes without guessing a binary name,
parsing docs, or granting itself mutation authority.

## Context

CTX Aide currently installs only `ctxa`, but Idvisor Milestone 17 still probes
`ctx`. The current `ctxa idvisor workflow` result is unversioned and returns
shell-like Node command strings. A robust integration needs a compatibility
handshake using executable plus argv templates, explicit schema IDs, output
bounds, and truth declarations.

## Positive Rules

- Preserve `ctxa idvisor workflow --json` as a compatibility helper during the
  migration.
- Reuse the existing command catalog and `command manifest` metadata rather
  than maintaining a second command inventory.
- Advertise only implemented commands and exact schema ID/digest pairs.

## Negative Rules

- Do not advertise `ctx`, `ctx-aide`, a Node source path, shell fragments, or
  host-specific absolute paths as the installed command.
- Do not imply that a manifest entry authorizes network, filesystem mutation,
  provider use, or runtime execution.
- Do not include dynamic repo state, secrets, environment values, or Idvisor
  runtime IDs.
- Stop and escalate if compatibility requires accepting ambiguous/truncated
  JSON or trailing diagnostic text as a valid manifest.

## Axioms

- `axiom.markdown-source-of-truth`: The manifest describes interfaces; it does
  not replace repository markdown.
- `axiom.ticket-done-requires-commit`: Completion requires commit and
  verification evidence.
- `axiom.ctxa-is-the-installed-binary`: Machine integrations invoke exactly
  `ctxa` plus an argv array.
- `axiom.integration-manifest-does-not-grant-mutation`: Mutability metadata is
  a warning/contract, never a capability grant or approval.

## Frozen Decisions

- Decision: command is exactly `ctxa idvisor manifest --json`; output schema is
  exactly `ctxa.idvisor-manifest/v1`; manifest version is numeric `1`.
- Rationale: the integration can fail closed on incompatible versions.
- Decision: every command row has stable ID, executable, argv template,
  mutability, required write flag, output schema, stdout/stderr limits, and
  timeout hint.
- Rationale: Idvisor can spawn safely without shell parsing and can enforce
  complete bounded capture.
- Decision: every supported schema row includes stable schema ID and SHA-256
  of the exact checked-in schema bytes. This ticket advertises the implemented
  harness, research, and manifest schemas; ticket 083 adds the result schema
  and import command only when they are implemented.
- Rationale: a `/v1` label alone cannot prove producer/consumer compatibility,
  and the manifest must never advertise future behavior.
- Decision: normative schema files are package-shipped under
  `docs/context/schema/`; introspection commands are exactly
  `ctxa schema list --json` and `ctxa schema get <schema-id> --json`.
- Rationale: humans and agents can discover, inspect, and mechanically compare
  the same contracts without scraping help or a checkout path.
- Decision: `schema get` returns exact UTF-8 file contents in `schema_text`
  plus `schema_id` and `schema_sha256`; it does not return only a reparsed JSON
  object whose formatting cannot reproduce the byte digest.
- Rationale: callers can decode and independently verify the advertised digest.
- Decision: manifest stdout is at most 64 KiB, stderr at most 8 KiB, and each
  timeout hint is an integer from 100 through 5,000 ms. Idvisor may use only a
  stricter timeout.
- Rationale: process probing remains bounded and no manifest can expand the
  consumer's authority or resource ceiling.
- Decision: schema list/get stdout is also limited to 64 KiB and returns no
  source paths outside the package-relative schema registry.
- Rationale: schema introspection stays agent-safe and package-portable.
- Decision: v1 advertises at most 32 schemas and 128 commands; each command has
  at most 32 argv-template tokens, IDs/tokens are at most 128/256 characters,
  and duplicate IDs are invalid even when rows otherwise match.
- Rationale: structural ceilings remain explicit before the byte limit.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: the manifest is local static JSON.

## Implementation Rules

- Required approach: derive manifest command rows from the canonical command
  catalog, derive the schema registry from exact checked-in schema bytes, then
  add integration-specific compatibility and authority declarations.
- Existing components/helpers to use: `commandManifestResult`, package version,
  command catalog mutability/write metadata, bounded JSON output, and tests.
- Anti-patterns to avoid: duplicated command strings, runtime PATH inspection,
  compatibility inferred from package name/schema ID alone, self-reported
  schema digests not rechecked from bytes, or a manifest that changes according
  to local ticket status.
- Agent-native behavior: top-level and subcommand help expose the manifest and
  schema commands; all are noninteractive and read-only; JSON success is one
  object on stdout with empty stderr and exit 0; JSON failure is one structured
  error object on stdout with stable `error.code`, empty stderr, no partial
  object/ANSI/spinner/prompt, and nonzero exit. Profiles and async job APIs are
  not applicable because the commands are bounded synchronous reads.
- Stable failure codes include `invalid_arguments`, `unknown_schema`,
  `schema_read_failed`, `schema_digest_mismatch`, and `output_too_large`.
- Stop and escalate if: any advertised command lacks a complete parseable JSON
  contract or a truthful mutation boundary.

## Scope

- In: new manifest command, schema list/get, normative manifest schema,
  command-catalog entries, version/schema ID+digest declarations,
  compatibility behavior for the old workflow helper, package contents, docs,
  and tests.
- Out: executing commands for Idvisor, installing Idvisor, probing its daemon,
  changing artifact validators, adding MCP, or enabling mutation.

## Acceptance Criteria

- One invocation emits exactly one complete JSON value and no stderr on
  success.
- The manifest names only `ctxa`, uses argv arrays/templates, and contains no
  shell command strings or Node implementation paths.
- Read-only and write-capable commands are distinguishable; every write-capable
  command names the explicit write flag and dry-run behavior.
- Harness, research, and manifest schema IDs/digests match their exact
  package-shipped documents. Ticket 083 adds the result row; until then it is
  absent rather than speculative.
- `schema list` returns bounded ID/digest metadata; `schema get` returns the
  requested exact `schema_text` and digest, independently rehashes in tests,
  and fails closed for an unknown ID.
- Tests fail if package binary identity, command mutability, schema ID/digest,
  schema package inclusion, timeout/output bounds, or truth-boundary text
  drift.
- A consumer fixture with a known schema ID and wrong digest is rejected, as
  are trailing stdout, any success stderr, an out-of-range hint, and output
  above 64 KiB.
- `ctxa idvisor workflow --json` remains callable and points integrations to
  the authoritative manifest without pretending to be version 1 itself; its
  compatibility response also contains no Node path or shell command string.

## Validation

- Automated: CLI tests; command manifest; Idvisor manifest; `make validate`.
- Smoke: execute the installed/local `ctxa idvisor manifest --json`, parse the
  complete stdout as JSON, and assert stderr is empty.
- Screenshots: none.

## Implementation Notes

Idvisor owns its own conservative child-process timeout. The manifest timeout
is a bounded hint and may only make Idvisor stricter, never less bounded.
Schema compatibility does not establish repository trust or grant mutation.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: Idvisor IDV-2101 consumes this contract;
  `ticket.context.083` consumes its result schema declaration.
