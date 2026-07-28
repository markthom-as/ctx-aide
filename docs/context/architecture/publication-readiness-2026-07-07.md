---
id: architecture.publication-readiness-2026-07-07
kind: architecture
context_scan: true
status: active
title: Publication Readiness
files:
  - README.md
  - package.json
  - package-lock.json
  - scripts/build.mjs
  - scripts/install-local.mjs
  - docs/ticket-packs/done/public-release-2026-07-01.md
flows:
  - flow.ctx-aide-dogfood
tags:
  - public-release
  - npm
  - cargo
  - package-readiness
positive_rules:
  - Keep package publication claims tied to dry-run evidence and explicit registry checks.
  - Keep accidental registry publishing blocked; public source does not imply registry publication.
negative_rules:
  - Do not claim npm or crates.io publish readiness while package.json is private or no Cargo.toml exists.
  - Do not publish to npm, crates.io, or GitHub from this repo without a fresh launch ticket and validation evidence.
load_when:
  path_matches:
    - README.md
    - package.json
    - package-lock.json
    - docs/ticket-packs/done/public-release-2026-07-01.md
  task_terms:
    - publish
    - npm
    - cargo
    - crates.io
    - hacker news
    - public criticism
updated: 2026-07-28
---

# Publication Readiness

## Purpose

Record the current public-readiness state for CTX Aide so outside-facing docs, package metadata, and launch gates do not overclaim.

## Current Decisions

- Public display name: `CTX Aide`.
- CLI command: `ctxa`.
- Source repository namespace: `ctx-aide`.
- Intended npm package name: `ctx-aide`.
- Intended installed binary name: `ctxa`.
- GitHub owner/repository: `markthom-as/ctx-aide`.
- Source license: MIT, recorded in `LICENSE` and package metadata.
- Source posture: public GitHub alpha after the final cutover gate.
- Package status: local package metadata is prepared; `private: true` remains
  intentional because npm publication is not part of the alpha.
- npm owner/publication: no npm package for alpha; ownership and publication are
  intentionally deferred.
- Build/install status: `npm run build` verifies the package payload and writes a local tarball; `npm run install:local` installs `ctxa` into an ignored local prefix for smoke testing.
- Cargo status: no Cargo target for alpha. Nix packages the Node CLI directly;
  a Rust shim or rewrite requires a future product/architecture ticket.
- Support posture: community issue discussion and private GitHub vulnerability
  reporting after launch, with no response-time or support SLA.
- Cost delta: `$0/month`. This work changes docs and local package metadata only.

## Positive Rules

- Keep package publication claims tied to dry-run evidence and explicit registry checks.
- Keep accidental registry publishing blocked; public source does not imply npm
  or crates.io publication.
- Recheck registry state immediately before claiming name availability.

## Negative Rules

- Do not claim npm or crates.io publish readiness while `package.json` is
  private or no `Cargo.toml` exists.
- Do not publish to npm, crates.io, or GitHub from this repo without a fresh launch ticket and validation evidence.
- Do not turn the public-source decision into registry publication authority.

## Implementation Rules

- Use `npm pack --dry-run --json` as the bounded package-payload proof for the Node CLI.
- Use `npm publish --dry-run` only if a later owner-approved ticket reopens npm
  publication and intentionally removes `private: true`.
- Use `cargo package --list` and `cargo publish --dry-run` only after a Cargo crate exists.
- Record expected non-zero registry-observation commands as observations, not green validation gates.

## Registry Observations

Last checked on 2026-07-07:

- `npm view ctx-aide name version description --json` returned npm 404, which indicates no public package was visible to this environment at check time.
- `npm view ctxa name version description --json` returned npm 404, which indicates no public package was visible to this environment at check time.
- `cargo search ctx-aide --limit 5` returned no matches.
- `cargo search ctxa --limit 5` returned no matches.
- `cargo publish --dry-run --allow-dirty` failed before packaging because this repository has no `Cargo.toml`.

Registry state can change. Recheck immediately before any publishing ticket claims name availability.

## What Is Ready

- The README now explains purpose, why the project exists, what it does, what it is not, setup, configuration, proof surfaces, and status.
- The repository now includes MIT licensing and public hygiene docs:
  `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, GitHub issue
  templates, and a pull request template.
- `.github/workflows/ci.yml` records the CI release gate for Node 20, package dry-run, local install smoke, markdown checks, repo validation, smoke checks, and diff cleanliness.
- `package.json` uses the intended npm package name `ctx-aide`.
- The npm package payload is constrained with an explicit `files` allowlist instead of relying on `.gitignore` fallback.
- `npm run build -- --json` runs syntax checks, unit tests, context checks, ticket/pack checks, and `npm pack` for the Node CLI package.
- `npm run install:local -- --json` installs the package into `.ctx-aide/install` and verifies the installed `ctxa --help` surface without publishing.
- `npm pack --dry-run --json` is the packaging proof surface for the current Node CLI.
- `npm link --dry-run` proves the local package can install a single `ctxa` binary without publishing.
- Existing `ctxa` checks cover docs, tickets, packs, future-work, LOC policy, skill validation, and local smoke behavior.
- The 2026-07-08 safety refresh found no live credentials, no generated-artifact blocker, no production dependency vulnerabilities, and no package-payload blocker.

## What Is Not Ready

- `package.json` intentionally keeps `private: true`; npm publication is an
  explicit alpha non-goal.
- There is no `Cargo.toml`, Rust crate, or crates.io package target by explicit
  alpha decision. This is a non-goal, not a release blocker.
- There is no public GitHub remote in this checkout. Public URLs, badges, repository metadata, and external profile links remain blocked by the GitHub launch gate.
- CI is checked in but not enabled on any public remote from this checkout. Public repositories are free for ordinary GitHub Actions usage; private repositories may consume included account minutes.
- The final public-release cutover remains blocked until the no-Cargo/no-npm
  alpha decisions are closed in their owning tickets and the launch safety gate
  passes.

## Public Criticism Checklist

Before posting publicly or publishing packages, rerun and record these registry observations. They are not all green gates: for example, npm returns a non-zero 404 when a package name is not visible.

```sh
npm view ctx-aide name version description --json
npm view ctxa name version description --json
cargo search ctx-aide --limit 5
cargo search ctxa --limit 5
cargo publish --dry-run --allow-dirty
```

Then rerun the green validation gates:

```sh
npm run build -- --dry-run --json
npm run install:local -- --json
npm pack --dry-run --json
npm link --dry-run
node tools/ctx-aide/ctx-aide.mjs scan --json
node tools/ctx-aide/ctx-aide.mjs spec check --json
node tools/ctx-aide/ctx-aide.mjs ticket check --json
node tools/ctx-aide/ctx-aide.mjs pack check --json
make validate
make smoke
```

Also rerun the public-release safety scans listed in `docs/context/architecture/public-release-safety-audit-2026-07-05.md`.

## Future Publishing Ticket Requirements

If npm publication is proposed after alpha, its ticket must include:

- License decision and file.
- Package owner or npm organization.
- Confirmed `ctx-aide` package-name and `ctxa` binary/crate-name registry availability immediately before publish.
- Package payload review from `npm pack --dry-run --json`.
- Decision to remove `private: true`.
- `npm publish --dry-run` evidence before any real publish.

If Cargo distribution is proposed after alpha, its ticket must first justify a
real Rust implementation or an explicit Node-runtime shim. Its publication
ticket must then include:

- Crate purpose: Rust implementation, Rust shim, or no Cargo target.
- `Cargo.toml`, package files, version policy, license metadata, and README mapping.
- crates.io name check immediately before publish.
- `cargo package --list` and `cargo publish --dry-run` evidence before any real publish.

## Stop Conditions

Stop and escalate if a future ticket expands beyond the approved public GitHub
source into registry publication, a different owner, or any paid service.
