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
  - docs/ticket-packs/active/public-release-2026-07-01.md
flows:
  - flow.ctx-aide-dogfood
tags:
  - public-release
  - npm
  - cargo
  - package-readiness
positive_rules:
  - Keep package publication claims tied to dry-run evidence and explicit registry checks.
  - Keep accidental registry publishing blocked until owner, license, and Cargo crate decisions are explicit.
negative_rules:
  - Do not claim npm or crates.io publish readiness while package.json is private, no license file exists, or no Cargo.toml exists.
  - Do not publish to npm, crates.io, or GitHub from this repo without a fresh launch ticket and validation evidence.
load_when:
  path_matches:
    - README.md
    - package.json
    - package-lock.json
    - docs/ticket-packs/active/public-release-2026-07-01.md
  task_terms:
    - publish
    - npm
    - cargo
    - crates.io
    - hacker news
    - public criticism
updated: 2026-07-07
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
- Package status: local package metadata is prepared, but `private: true` remains the safety gate.
- Cargo status: no Rust crate exists in this repository. crates.io publication is blocked until a Cargo package shape is designed and implemented.
- Cost delta: `$0/month`. This work changes docs and local package metadata only.

## Positive Rules

- Keep package publication claims tied to dry-run evidence and explicit registry checks.
- Keep accidental registry publishing blocked until owner, license, and Cargo crate decisions are explicit.
- Recheck registry state immediately before claiming name availability.

## Negative Rules

- Do not claim npm or crates.io publish readiness while `package.json` is private, no license file exists, or no `Cargo.toml` exists.
- Do not publish to npm, crates.io, or GitHub from this repo without a fresh launch ticket and validation evidence.
- Do not choose a license, registry owner, GitHub owner, or Cargo crate shape by implication.

## Implementation Rules

- Use `npm pack --dry-run --json` as the bounded package-payload proof for the Node CLI.
- Use `npm publish --dry-run` only after `private: true` is intentionally removed by a publishing ticket.
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
- `package.json` uses the intended npm package name `ctx-aide`.
- The npm package payload is constrained with an explicit `files` allowlist instead of relying on `.gitignore` fallback.
- `npm pack --dry-run --json` is the packaging proof surface for the current Node CLI.
- `npm link --dry-run` proves the local package can install a single `ctxa` binary without publishing.
- Existing `ctxa` checks cover docs, tickets, packs, future-work, LOC policy, skill validation, and local smoke behavior.

## What Is Not Ready

- There is no `LICENSE`, `COPYING`, or `NOTICE` file. Open-source reuse and registry publication remain blocked until the user chooses a license or explicit no-license posture.
- `package.json` intentionally keeps `private: true`; `npm publish` should remain blocked until the publication gate is reopened.
- There is no `Cargo.toml`, Rust crate, or crates.io package target. A future ticket must decide whether Cargo should publish a Rust implementation, a Rust shim that invokes Node, or no Cargo package at all.
- There is no public GitHub remote in this checkout. Public URLs, badges, repository metadata, and external profile links remain blocked by the GitHub launch gate.

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

An npm publishing ticket must include:

- License decision and file.
- Package owner or npm organization.
- Confirmed `ctx-aide` package-name and `ctxa` binary/crate-name registry availability immediately before publish.
- Package payload review from `npm pack --dry-run --json`.
- Decision to remove `private: true`.
- `npm publish --dry-run` evidence before any real publish.

A Cargo publishing ticket must include:

- Crate purpose: Rust implementation, Rust shim, or no Cargo target.
- `Cargo.toml`, package files, version policy, license metadata, and README mapping.
- crates.io name check immediately before publish.
- `cargo package --list` and `cargo publish --dry-run` evidence before any real publish.

## Stop Conditions

Stop and escalate if publishing requires choosing a license, reserving a registry name, creating a public remote, setting package ownership, or creating any paid service.
