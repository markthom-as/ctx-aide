---
id: ticket.context.058
status: done
title: Add explicit build and install scripts
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
  - ticket.context.057
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - Makefile
    - package.json
    - package-lock.json
    - scripts/build.mjs
    - scripts/install-local.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/context/architecture/publication-readiness-2026-07-07.md
    - docs/ticket-packs/active/public-release-2026-07-01.md
  directories:
    - scripts
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add explicit CTX Aide build and install scripts for local npm package preflight without publishing"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - node --check scripts/build.mjs
    - node --check scripts/install-local.mjs
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/ctx-aide.test.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - npm run build -- --dry-run --json
    - npm run build -- --json
    - npm run install:local -- --json
    - npm install --package-lock-only --ignore-scripts
    - npm pack --dry-run --json
    - npm link --dry-run
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent codex --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent claude --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent cursor --json
    - node tools/ctx-aide/ctx-aide.mjs lint --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - make package-build
    - make package-install-smoke
    - make validate
    - make smoke
    - git diff --check
  smoke:
    - .ctx-aide/install/bin/ctxa --help after local script install
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T15:29:59-0600
---

# Add Explicit Build And Install Scripts

## Outcome

Add public, documented package scripts that let a reviewer build the local Node package artifact and install the `ctxa` CLI locally without publishing to npm or mutating a global npm prefix.

## Context

CTX Aide already had package metadata and local install proof, but the reviewer path still required knowing the raw `npm pack` and `npm install -g <path>` commands. The public-release surface should have obvious script names that encode the intended safe workflow.

## Positive Rules

- Prefer `npm run build` for package preflight and tarball creation.
- Prefer `npm run install:local` for isolated local CLI smoke tests.
- Keep the installed command as `ctxa` and the package/repo namespace as `ctx-aide`.
- Keep publication blocked until owner, license, registry, and Cargo decisions are explicit.

## Negative Rules

- Do not publish to npm, crates.io, GitHub, or paid infrastructure.
- Do not add npm lifecycle install hooks or postinstall behavior.
- Do not claim Rust/Cargo runnable support while no `Cargo.toml` exists.
- Do not reintroduce a `ctx-aide` executable alias.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public docs must match implemented scripts and command names.
- `axiom.no-paid-infra-without-cost-estimate`: Cost-bearing infrastructure work requires an estimate and explicit approval first.

## Frozen Decisions

- `npm run build` runs syntax checks, unit tests, context scan/lint, ticket/pack checks, and `npm pack`.
- `npm run install:local` installs from the checkout into `.ctx-aide/install` by default and verifies the installed `ctxa --help` surface.
- `npm run install:global` exists only as an explicit opt-in wrapper around the install script's `--global` mode.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: add Node scripts under `scripts/`, expose them through package scripts, document usage in README and publication readiness notes, and keep tests focused on script entrypoints and package metadata.
- Existing components/helpers to use: `ctxa` validation commands, `npm pack`, local npm prefix install, and public-release pack validation.
- Anti-patterns to avoid: shell-only install scripts, lifecycle hooks, unbounded package payloads, or global mutation in default smoke paths.
- Stop and escalate if: real registry publishing, license selection, Cargo crate creation, or paid infrastructure becomes necessary.

## Scope

- In: build script, local/global install script wrapper, package script metadata, README setup docs, publication readiness docs, Makefile convenience targets, and focused tests.
- Out: npm publish, crates.io publish, Rust crate implementation, public GitHub launch, license selection, package owner/org selection, and paid infrastructure.

## Acceptance Criteria

- `npm run build -- --json` creates a local package artifact after running local validation gates.
- `npm run build -- --dry-run --json` performs the same package preflight without writing a tarball.
- `npm run install:local -- --json` installs a local `ctxa` binary under `.ctx-aide/install` and confirms the old `ctx-aide` bin is absent.
- README setup docs show the build and isolated local install path.
- `ctxa` tests assert the script metadata and script help entrypoints remain present.

## Validation

- Automated: frontmatter commands.
- Smoke: `.ctx-aide/install/bin/ctxa --help`.
- Screenshots: none.

## Implementation Notes

The build script writes package artifacts to `dist/` by default. The install script writes to `.ctx-aide/install` by default. Both paths are ignored local outputs.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: script syntax checks, unit tests, package-lock refresh, dry-run and real `npm run build`, isolated `npm run install:local`, `.ctx-aide/install/bin/ctxa --help`, `npm pack --dry-run --json`, `npm link --dry-run`, context export, ticket/pack checks, `make package-build`, `make package-install-smoke`, `make validate`, `make smoke`, and `git diff --check` passed.
- Follow-up tickets: `ticket.context.044` remains blocked on GitHub owner/org, license, Cargo crate shape, and publication decisions.
