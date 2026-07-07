---
id: ticket.context.055
status: done
title: Rename repo and tools to ctx-aide
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
  - ticket.context.040
  - ticket.context.054
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - package.json
    - package-lock.json
    - AGENTS.md
    - Makefile
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/active/public-release-2026-07-01.md
  directories:
    - tools/ctx-aide
    - skills/ctx-aide
    - docs/config
    - docs/context
    - docs/workflows
    - .cursor/rules/generated
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "rename CTX Aide repo directory, CLI, skill, config files, generated rules, and public docs to ctx-aide"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - architecture.public-name-decision-2026-07-05
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - npm install --package-lock-only --ignore-scripts
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/ctx-aide.test.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - npm pack --dry-run --json
    - npm link --dry-run
    - make validate
    - make smoke
  smoke:
    - ctx-aide --help after local npm link dry-run surface is valid
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T10:54:37-0600
---

# Rename Repo and Tools to ctx-aide

## Outcome

Rename the current public and local tooling namespace to `ctx-aide` before publication review, including the Node CLI, package bin, skill directory, config filenames, generated Cursor rule, current public-release docs, and local checkout directory.

## Context

`ticket.context.040` selected CTX Aide as the public display name and `ctx-aide` as the package-facing name, but deferred code and path renames. The current user request promotes that deferred rename from future work into the publication-readiness slice.

## Positive Rules

- Use `CTX Aide` for the public display name.
- Use `ctx-aide` for the repository directory, executable command, package-facing name, local skill name, config filenames, generated rule filename, and current validation commands.
- Keep generated SQLite and agent packs rebuildable from markdown.
- Preserve compatibility for adopted repos that still contain the old `<!-- repo-context: ignore -->` scan sentinel.

## Negative Rules

- Do not publish to npm, crates.io, or GitHub.
- Do not choose a license, registry owner, GitHub owner, or Cargo crate shape in this ticket.
- Do not change paid infrastructure or deploy anything.
- Do not rewrite unrelated historical tickets only to remove old evidence text.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public docs must describe the implemented tool names and paths.
- `axiom.no-paid-infra-without-cost-estimate`: Cost-bearing infrastructure work requires an estimate and explicit approval first.

## Frozen Decisions

- Public display name: `CTX Aide`.
- Repo/tool namespace: `ctx-aide`.
- CLI command: `ctx-aide`; no legacy `ctx` bin is kept in this package.
- Compatibility alias: `<!-- repo-context: ignore -->` remains accepted as an old scan-ignore sentinel.
- Cost delta: `$0/month`; this ticket changes local files and the local checkout directory only.

## Implementation Rules

- Required approach: rename tracked paths with `git mv` where possible, update current docs and config references, regenerate generated artifacts, update package lock metadata, then move the local checkout directory to `/Users/jove/code/ctx-aide`.
- Existing components/helpers to use: `tools/ctx-aide/ctx-aide.mjs`, markdown validators, npm dry-run packaging, and the active public-release pack.
- Stop and escalate if: publishing, license choice, external repository mutation, or paid infrastructure becomes necessary.

## Scope

- In: repo/tool namespace rename, local path rename, package metadata, current public-release docs, first-party config filenames, generated Cursor rule, skill path, and validation evidence.
- Out: npm publish, Cargo crate creation, public GitHub remote changes, paid infrastructure, and broad historical-ticket rewrites.

## Acceptance Criteria

- `package.json` exposes a `ctx-aide` bin backed by `tools/ctx-aide/ctx-aide.mjs`.
- First-party current docs and validation commands use `ctx-aide`.
- Active public-release ticket/pack/spec metadata is coherent after the rename.
- The scanner accepts the new `<!-- ctx-aide: ignore -->` sentinel and the old `<!-- repo-context: ignore -->` compatibility sentinel.
- Generated agent artifacts are refreshed from the renamed sources.
- The local checkout directory is renamed to `/Users/jove/code/ctx-aide`.

## Validation

- `npm install --package-lock-only --ignore-scripts`
- `node --check tools/ctx-aide/ctx-aide.mjs`
- `node --check tools/ctx-aide/ctx-aide.test.mjs`
- `node --check tools/ctx-aide/screenshot-review-ui.mjs`
- `node tools/ctx-aide/ctx-aide.test.mjs`
- `node tools/ctx-aide/ctx-aide.mjs scan --json`
- `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json`
- `npm pack --dry-run --json`
- `npm link --dry-run`
- `make validate`
- `make smoke`

## Completion

- Status: done
- Commit: current-change
- Verification evidence: validation commands listed above passed on 2026-07-07 after the rename.
- Follow-up tickets: `ticket.context.044` remains blocked on GitHub owner/org, license, and publication decisions.
