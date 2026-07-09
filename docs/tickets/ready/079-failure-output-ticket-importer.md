---
id: ticket.context.079
status: ready
title: Import validation failures into ticket drafts
ticket_pack: pack.ctx-aide-agent-workflow-orchestration-2026-07-09
milestones:
  - milestone.ctx-aide-agent-workflow-orchestration
source_spec: spec.agent-workflow-orchestration-2026-07-09
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: failure-import
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/tickets/draft
    - docs/tickets/needs-hardening
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "import validation failure output into bounded ticket drafts"
  generated_at: 2026-07-09
  context_ids:
    - spec.agent-workflow-orchestration-2026-07-09
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.failure-import-is-dry-run-first
  - axiom.imported-output-is-redacted-and-bounded
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs failures import --repo . --source-file <fixture> --format ctxa-check --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Import Validation Failures Into Ticket Drafts

## Outcome

`ctxa failures import` can read bounded validation output, group actionable failures, and dry-run or write draft/needs-hardening tickets with source paths, acceptance criteria, and redacted evidence.

## Context

Compiler, lint, test, and CTX Aide check failures are often the best work queue for parallel repair. Today the operator must manually summarize those failures into tickets. This ticket adds a local importer without making raw command output canonical truth.

## Positive Rules

- Default to dry-run JSON with grouped candidate tickets and no filesystem writes.
- Prefer deterministic grouping by tool, file, error code, and owning pack when available.
- Reuse existing canonical ticket sections and status folders.

## Negative Rules

- Do not run expensive validation commands by default; read a supplied source file or stdin.
- Do not generate `ready` tickets unless a future accepted policy explicitly allows it.
- Do not include secrets, raw prompts, credentials, or large source excerpts in generated tickets.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.failure-import-is-dry-run-first`: Importers must preview grouped work before writing tickets.
- `axiom.imported-output-is-redacted-and-bounded`: Imported evidence must be size-limited and secret-redacted.

## Frozen Decisions

- Decision: first slice supports CTX Aide check JSON and a generic line-oriented failure format.
- Rationale: this covers repo-native validation while leaving language-specific parsers for follow-up tickets.
- Decision: written tickets default to `docs/tickets/needs-hardening`.
- Rationale: raw tool output rarely freezes product, architecture, or validation decisions by itself.
- Decision: expected infrastructure cost delta is `$0/month`.
- Rationale: the importer reads local files and writes local markdown only.

## Implementation Rules

- Required approach: add a `failures import` command with `--source-file`, `--format`, `--pack`, `--write`, and `--json` options.
- Existing components/helpers to use: markdown ticket rendering helpers, path normalization, validation helpers, and command catalog metadata.
- Anti-patterns to avoid: running tool commands implicitly, dumping full logs, writing outside the repo, or creating duplicate tickets on repeated imports.
- Stop and escalate if: imported output requires retaining raw secrets or unbounded logs to be actionable.

## Scope

- In: dry-run parser, grouping, redaction, duplicate-safe write mode, docs, tests.
- Out: cargo-specific JSON parsing, hosted queues, Idvisor queue import, automatic commits, and marking generated tickets done.

## Acceptance Criteria

- Dry-run mode returns candidate tickets with title, target status, grouped source paths, short evidence, and redaction counts.
- `--write` creates canonical ticket markdown only under the chosen repo-local ticket status folder.
- Repeated imports can detect existing generated tickets by stable source fingerprint.
- CTX Aide check JSON with multiple file errors groups failures into bounded draft tickets.
- Secret-like strings are redacted from generated body text and JSON output.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`; `node tools/ctx-aide/ctx-aide.mjs ticket check --json`; `node tools/ctx-aide/ctx-aide.mjs pack check --json`; `make validate`.
- Smoke: dry-run import against a checked-in fixture.
- Screenshots: none.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: cargo/Rust JSON import can be added separately after the generic importer lands.
