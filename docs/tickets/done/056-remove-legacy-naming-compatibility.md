---
id: ticket.context.056
status: done
title: Remove legacy naming compatibility
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
  - ticket.context.055
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - .gitignore
    - docs/ticket-packs/active/public-release-2026-07-01.md
  directories:
    - docs
    - tools/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "remove legacy repo and command naming compatibility so all tracked text and paths align with ctx-aide"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - architecture.public-name-decision-2026-07-05
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - search gate for the retired short command token
    - search gate for retired namespace, paths, profile key, doubled names, and old sentinel
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/ctx-aide.test.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - make validate
    - make smoke
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T11:06:03-0600
---

# Remove Legacy Naming Compatibility

## Outcome

Remove the old naming compatibility path and align tracked repo text, command examples, ids, config references, ignored-local-state paths, and remaining filename stems to `ctx-aide`.

## Context

`ticket.context.055` renamed the main repo and tool surfaces but intentionally kept a scan-ignore compatibility alias. The user clarified that compatibility is not needed and asked for everything to align with the new naming.

## Positive Rules

- Use `CTX Aide` for the display name.
- Use `ctx-aide` for package names, config names, skill names, filenames, and markdown metadata ids. `ticket.context.057` later changes the installed command to `ctxa`.
- Treat `<!-- ctx-aide: ignore -->` as the only first-line scan-ignore sentinel.

## Negative Rules

- Do not keep legacy command aliases.
- Do not keep legacy scan-ignore sentinel support.
- Do not leave tracked filenames or current docs with the old namespace.
- Do not publish to npm, crates.io, GitHub, or paid infrastructure.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public docs must describe the implemented tool names and paths.

## Frozen Decisions

- Only the `ctxa` command/bin is supported.
- Only `<!-- ctx-aide: ignore -->` is recognized as the first-line scan-ignore sentinel.
- Historical markdown ids and evidence text are normalized to `ctx-aide` for public consistency.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: remove the parser alias, sweep tracked text for old names, rename remaining legacy-named markdown files, regenerate context artifacts, and validate.
- Existing components/helpers to use: `tools/ctx-aide/ctx-aide.mjs`, repo markdown validators, and exact-string search gates.
- Stop and escalate if: publication, license selection, external repository mutation, or paid infrastructure becomes necessary.

## Scope

- In: parser sentinel support, tracked markdown, generated context artifacts, docs, ticket metadata, pack metadata, and filename stems.
- Out: external publication, registry reservation, GitHub remote creation, license selection, and paid infrastructure.

## Acceptance Criteria

- The parser recognizes `<!-- ctx-aide: ignore -->` only.
- Exact search finds no old repository namespace, old tool path, old skill path, old local-state path, or doubled capability names.
- A strict standalone-token search finds no retired short command token.
- Canonical validators and smoke checks pass.

## Validation

- Search gate for the retired short command token returned no matches.
- Search gate for retired namespace, paths, profile key, doubled names, and old sentinel returned no matches.
- `node --check tools/ctx-aide/ctx-aide.mjs`
- `node --check tools/ctx-aide/ctx-aide.test.mjs`
- `node --check tools/ctx-aide/screenshot-review-ui.mjs`
- `node tools/ctx-aide/ctx-aide.test.mjs`
- `node tools/ctx-aide/ctx-aide.mjs scan --json`
- `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json`
- `make validate`
- `make smoke`

## Completion

- Status: done
- Commit: current-change
- Verification evidence: naming search gates, syntax checks, unit tests, repo validators, package dry-runs, `make validate`, and `make smoke` passed.
- Follow-up tickets: `ticket.context.044` remains blocked on GitHub owner/org, license, and publication decisions.
