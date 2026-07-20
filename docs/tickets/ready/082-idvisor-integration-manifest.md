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
- Advertise only implemented commands and schema versions.

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
- Decision: schema IDs include `ctxa.harness-experiment/v1`,
  `ctxa.research-claim-set/v1`, and `ctxa.idvisor-result/v1`.
- Rationale: the producer and consumer agree on artifact boundaries before
  import/export.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: the manifest is local static JSON.

## Implementation Rules

- Required approach: derive manifest command rows from the canonical command
  catalog, then add integration-specific schema and authority declarations.
- Existing components/helpers to use: `commandManifestResult`, package version,
  command catalog mutability/write metadata, bounded JSON output, and tests.
- Anti-patterns to avoid: duplicated command strings, runtime PATH inspection,
  compatibility inferred from package name alone, or a manifest that changes
  according to local ticket status.
- Stop and escalate if: any advertised command lacks a complete parseable JSON
  contract or a truthful mutation boundary.

## Scope

- In: new manifest command, command-catalog entry, version/schema declarations,
  compatibility behavior for the old workflow helper, docs, and tests.
- Out: executing commands for Idvisor, installing Idvisor, probing its daemon,
  changing artifact validators, adding MCP, or enabling mutation.

## Acceptance Criteria

- One invocation emits exactly one complete JSON value and no stderr on
  success.
- The manifest names only `ctxa`, uses argv arrays/templates, and contains no
  shell command strings or Node implementation paths.
- Read-only and write-capable commands are distinguishable; every write-capable
  command names the explicit write flag and dry-run behavior.
- Artifact and result schema IDs match tickets 080, 081, and 083.
- Tests fail if package binary identity, command mutability, schema versions,
  output bounds, or truth-boundary text drift.
- `ctxa idvisor workflow --json` remains callable and points integrations to
  the authoritative manifest without pretending to be version 1 itself.

## Validation

- Automated: CLI tests; command manifest; Idvisor manifest; `make validate`.
- Smoke: execute the installed/local `ctxa idvisor manifest --json`, parse the
  complete stdout as JSON, and assert stderr is empty.
- Screenshots: none.

## Implementation Notes

Idvisor owns its own conservative child-process timeout. The manifest timeout
is a hint and may only make Idvisor stricter, never less bounded.

## Completion

- Status: ready.
- Commit: pending.
- Verification evidence: pending.
- Follow-up tickets: Idvisor IDV-2101 consumes this contract;
  `ticket.context.083` consumes its result schema declaration.
