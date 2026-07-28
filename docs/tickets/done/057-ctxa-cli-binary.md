---
id: ticket.context.057
status: done
title: Make ctxa the canonical CLI binary
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
  - ticket.context.056
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - package.json
    - package-lock.json
    - docs/context/architecture/public-name-decision-2026-07-05.md
    - docs/context/architecture/public-name-generation-2026-07-05.md
    - docs/context/architecture/publication-readiness-2026-07-07.md
    - docs/ticket-packs/done/public-release-2026-07-01.md
  directories:
    - docs
    - tools/ctx-aide
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "make ctxa the single installed CLI command while keeping ctx-aide as the package and repo namespace"
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
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node --check tools/ctx-aide/ctx-aide.test.mjs
    - node --check tools/ctx-aide/screenshot-review-ui.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent codex --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent claude --json
    - node tools/ctx-aide/ctx-aide.mjs export-agent --agent cursor --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - npm view ctx-aide name version description --json
    - npm view ctxa name version description --json
    - npm pack --dry-run --json
    - npm link --dry-run
    - cargo search ctx-aide --limit 5
    - cargo search ctxa --limit 5
    - cargo publish --dry-run --allow-dirty
    - make validate
    - make smoke
  smoke:
    - ctxa --help after local npm link dry-run surface is valid
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T12:57:32-0600
---

# Make ctxa the Canonical CLI Binary

## Outcome

Make `ctxa` the only installed executable command while keeping `ctx-aide` as the package-facing, repository, config, skill, and path namespace.

## Context

After `ticket.context.056`, the user asked whether the CLI should be `ctxa` and then approved making that change. The command surface should be short for daily use, but the package and repo names should remain readable before public release.

## Positive Rules

- Use `ctxa` for installed CLI examples, help output, command validation, and agent tool capability ids.
- Use `ctx-aide` for the npm package name, repository directory, config files, skill directory, generated rule filename, and source paths.
- Keep exactly one installed binary in package metadata.
- Keep Cargo publication claims blocked until a Rust crate shape exists.

## Negative Rules

- Do not keep a second executable alias.
- Do not rename the package, repository directory, config files, or skill directory to `ctxa`.
- Do not publish to npm, crates.io, GitHub, or paid infrastructure.
- Do not claim Cargo publication readiness without a `Cargo.toml`.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public docs must describe the implemented tool names and paths.
- `axiom.no-paid-infra-without-cost-estimate`: Cost-bearing infrastructure work requires an estimate and explicit approval first.

## Frozen Decisions

- Installed executable command: `ctxa`.
- Npm package name: `ctx-aide`.
- Tool capability id: `tool.ctxa`.
- Local skill namespace: `skill.ctx-aide`.
- Cargo status: no Rust crate exists in this repository.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: update package bin metadata, help output, command examples, capability policy ids, naming docs, generated context artifacts, and focused tests.
- Existing components/helpers to use: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, package dry-runs, and repo markdown validators.
- Stop and escalate if: Cargo crate creation, license selection, external repository mutation, registry publication, or paid infrastructure becomes necessary.

## Scope

- In: local Node package bin metadata, command docs, help output, capability ids, generated context artifacts, and Cargo preflight assessment.
- Out: npm publish, crates.io publish, Rust crate implementation, package rename, repository rename, license selection, GitHub remote changes, and paid infrastructure.

## Acceptance Criteria

- `package.json` exposes exactly one bin, `ctxa`, backed by `tools/ctx-aide/ctx-aide.mjs`.
- `ctxa --help` is the documented installed smoke command.
- Help output and README command examples use `ctxa` for installed usage.
- The test suite asserts there is no `ctx-aide` bin.
- Cargo preflight records that publish dry-run is blocked by the absence of `Cargo.toml`.
- Canonical validators and smoke checks pass.

## Validation

- `node --check tools/ctx-aide/ctx-aide.mjs`
- `node --check tools/ctx-aide/ctx-aide.test.mjs`
- `node --check tools/ctx-aide/screenshot-review-ui.mjs`
- `node tools/ctx-aide/ctx-aide.test.mjs`
- `node tools/ctx-aide/ctx-aide.mjs scan --json`
- `node tools/ctx-aide/ctx-aide.mjs export-agent --agent codex --json`
- `node tools/ctx-aide/ctx-aide.mjs export-agent --agent claude --json`
- `node tools/ctx-aide/ctx-aide.mjs export-agent --agent cursor --json`
- `node tools/ctx-aide/ctx-aide.mjs lint --json`
- `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json`
- `npm install --package-lock-only --ignore-scripts`
- `npm view ctx-aide name version description --json` returned npm 404.
- `npm view ctxa name version description --json` returned npm 404.
- `npm pack --dry-run --json`
- `npm link --dry-run`
- Temp-prefix `npm install -g . --ignore-scripts` exposed `ctxa --help` and no `ctx-aide` bin.
- `cargo search ctx-aide --limit 5` returned no matches.
- `cargo search ctxa --limit 5` returned no matches.
- `cargo publish --dry-run --allow-dirty` failed because no `Cargo.toml` exists.
- `make validate`
- `make smoke`
- `git diff --check`

## Test Coverage Assessment

- Current coverage is sufficient for the CLI rename: the test suite asserts `package.json` exposes only `ctxa`, verifies help output contains `ctxa lint --json`, and verifies help output does not contain the old executable command form.
- More test coverage is not required before committing this naming slice.
- More test coverage is required before any Cargo publish claim, because the repository has no Rust crate, no Rust package tests, no `cargo package --list` proof, and no `cargo publish --dry-run` proof.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: command-name gates, package-bin test coverage, npm dry-runs, registry observations, Cargo preflight blocker, `make validate`, and `make smoke` passed or were recorded as expected blockers.
- Follow-up tickets: `ticket.context.044` remains blocked on GitHub owner/org, license, Cargo crate shape, and publication decisions.
