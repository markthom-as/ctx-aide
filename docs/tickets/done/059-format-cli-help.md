---
id: ticket.context.059
status: done
title: Format top-level CLI help
ticket_pack: pack.ctx-aide-public-release-2026-07-01
milestones:
  - milestone.ctx-aide-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: public-docs
depends_on:
  - ticket.context.058
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/ticket-packs/active/public-release-2026-07-01.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "format ctxa top-level help output for human readers without breaking JSON help usage"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs --help
    - node tools/ctx-aide/ctx-aide.mjs --help --json
    - npm run build -- --json
    - npm run install:local -- --json
    - .ctx-aide/install/bin/ctxa --help
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - git diff --check
  smoke:
    - installed `ctxa --help` shows grouped sections instead of a flat command dump
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T15:52:39-0600
---

# Format Top-Level CLI Help

## Outcome

Make `ctxa --help` readable for humans by grouping commands into named sections with short descriptions, while preserving the flat `usage` array in `ctxa --help --json` for agent and test consumers.

## Context

The installed `ctxa --help` output was a raw newline-joined command list. That is usable for tests, but it is poor first-contact CLI behavior and weak for public scrutiny.

## Positive Rules

- Keep top-level human help grouped and scannable.
- Keep `ctxa --help --json` stable as a flat machine-readable `usage` list.
- Keep examples using the canonical `ctxa` binary name.

## Negative Rules

- Do not add ANSI styling, tables, prompts, or pager behavior.
- Do not remove command examples from JSON help.
- Do not reintroduce the old `ctx-aide` executable name.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: CLI help should match implemented commands.

## Frozen Decisions

- Human help includes a short product description, usage block, grouped command sections, and command descriptions.
- JSON help remains a flat `usage` array of command examples.

## Implementation Rules

- Required approach: build the flat usage list from the same grouped help data that formats human output.
- Existing components/helpers to use: existing top-level help branch and `ctx-aide.test.mjs` help assertions.
- Anti-patterns to avoid: duplicating command lists in separate data structures or changing command behavior outside help rendering.

## Scope

- In: top-level `ctxa --help` formatting, JSON help preservation, tests, and ticket pack metadata.
- Out: subcommand-specific help redesign, command renames, new commands, publishing, or install-path changes.

## Acceptance Criteria

- `ctxa --help` starts with `CTX Aide (ctxa)`, includes a usage block, and groups command examples under named sections.
- `ctxa --help --json` still returns `ok: true` and a flat `usage` array with existing command examples.
- Tests assert the human and JSON help shapes.

## Validation

- Automated: frontmatter commands.
- Smoke: installed `ctxa --help`.
- Screenshots: none.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: syntax checks, focused help output checks, unit tests, ticket/pack checks, `npm run build -- --json`, `npm run install:local -- --json`, installed `.ctx-aide/install/bin/ctxa --help`, pack status, `make validate`, and `git diff --check` passed.
- Follow-up tickets: subcommand-specific help can be improved separately if needed.
