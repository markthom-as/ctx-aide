---
id: architecture.public-name-decision-2026-07-05
kind: architecture
context_scan: true
status: active
title: Public Name Decision
files:
  - README.md
  - docs/specs/public-release-2026-07-01.md
flows:
  - flow.ctx-aide-dogfood
tags:
  - public-release
  - naming
  - positioning
positive_rules:
  - Use CTX Aide as the public display name for the public-release pack.
  - Use ctx-aide as the repo, CLI, package-facing, config-prefix, generated-rule, and local skill namespace.
negative_rules:
  - Do not reuse Concordat for this project.
  - Do not publish, reserve a package, choose a license, or mutate an external remote as part of the name decision.
  - Do not use Repo Charter as the public display name.
load_when:
  path_matches:
    - README.md
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/**
  task_terms:
    - public name
    - public release
    - CTX Aide
    - ctx-aide
updated: 2026-07-07
---

# Public Name Decision

## Purpose

Record the public display name that downstream README, demo, and launch-gate work should use.

## Current Decisions

Use **CTX Aide** as the public display name for this release.

Use `ctx-aide` as the repository directory, CLI command, package-facing name, config-prefix, generated-rule, and local skill namespace.

`ticket.context.055` supersedes the earlier deferral that preserved the old repository/tool namespace until a later rename ticket. Registry publishing and external remote changes are still separate launch decisions.

## Positive Rules

- Use CTX Aide as the public display name in public-facing release copy.
- Use `ctx-aide` for package-facing, command, path, config, skill, and generated-rule references.
- Keep publication claims gated until owner, license, registry, and GitHub decisions are explicit.

## Negative Rules

- Do not reuse Concordat for this project.
- Do not publish packages, mutate remotes, or choose a license in this release pack.
- Do not use Repo Charter as the public display name.

## Rationale

CTX Aide describes the system as a practical context aide for coding agents: it keeps markdown context, specs, tickets, validation, and handoff rules beside the code so agents can implement from durable repo truth.

The name is simple, agent-adjacent, and pragmatic. It keeps the `ctx-aide` machine-facing identity aligned with the public display name, avoids governance language, and is broad enough to cover markdown context, generated agent packs, validation gates, adoption workflows, and future workflow hardening without implying a hosted service or paid control plane.

## Candidate Review

- `CTX Aide`: selected. It is direct, pragmatic, and names the product as a context aide for coding-agent work.
- `ctx-aide`: selected as the package-facing name if a later publishing ticket proceeds.
- `Repo Charter`: rejected because the user disliked it and because the `Charter` adjacency made the name feel too formal and governance-oriented for public copy.
- `repo-context`: rejected as the public name because it describes an implementation mechanism rather than the broader workflow.
- `Concordat`: rejected because `/Users/jove/code/concordat` is a separate local project and should not carry this product surface.
- `Workmark`: rejected because live search surfaced a scoped npm package and workspace-tooling description using the same name.
- `Context Accord`: rejected because search results surfaced the existing Accord Project ecosystem and related package/project names.
- `Agent Loom` / `Context Loom`: rejected because search results surfaced an existing Agent Loom project in the same agent-workflow space.
- `Context Ledger`: rejected because search results surfaced adjacent AI context ledger usage and projects.
- `Agent Rail` / `AgentRail`: rejected because same-category agent framework, edge-layer, npm, PyPI, and GitHub collisions were found.
- `Agent Smith` / `AgentSmith`: rejected because package registries, GitHub, AI-security projects, and Matrix-related usage are heavily occupied.
- `ag-ctx-aide`: rejected because adjacent `agent-ctx-aide` and `agentctx` projects already occupy the same agent-context category.
- `ctx-aide-rail`: rejected because an adjacent same-category GitHub project already uses the command shape.
- `ctx-aide-kit`: rejected because `ctxkit` and `ContextKit` are occupied in AI coding-agent context-management categories.
- `ctx-aide-pack`: rejected because `ctx-aide-pack`, `ctxpack`, and `context-pack` are occupied in context-bundling categories.
- `Trailmark`: rejected because Trail of Bits has `trailmark` for source-code graph querying, and npm/PyPI package names are already occupied.
- `Specrail`: rejected because search results surfaced an existing `specrail` project description in the same spec-first agent-workflow space.

## Collision Notes

Live checks on 2026-07-05 did not surface an exact package collision for `ctx-aide` or `ctxaide` in npm, PyPI, or crates.io. The nearby variants `context-aide`, `contextaide`, `aide-ctx-aide`, and `aidectx` also did not surface exact npm, PyPI, or crates.io package collisions in that pass.

GitHub search did not surface exact `ctxaide` hits, and exact `ctx-aide`/`CTX Aide` results were low-signal or unrelated. Web search surfaced broader `Aide` usage in AI support and coding-assistant products, plus irrelevant French legal-result noise for `CTX aide sociale`. That makes `CTX Aide` acceptable as a public display name and `ctx-aide` acceptable as a package-facing name candidate, but this decision does not claim trademark clearance, domain availability, or package-name availability beyond the checked package names.

If a future ticket turns CTX Aide into a published package, domain, or commercial mark, that ticket should perform a fresh package-registry, GitHub, domain, and trademark review before publishing artifacts.

## Rename Implications

- README and public docs should lead with `CTX Aide`.
- Command examples should use `node tools/ctx-aide/ctx-aide.mjs` and `ctx-aide`.
- Generated artifacts under `docs/context/generated/` remain cache/build artifacts and do not need a rename.
- The GitHub repository should use `ctx-aide` if the launch gate proceeds, with `CTX Aide` as the display title and description.
- A later publishing/onboarding ticket may use `ctx-aide` for package-manager install instructions only after owner, license, registry, and publish decisions are explicit.

## Implementation Rules

- README and launch metadata can introduce CTX Aide as the public name.
- Technical documentation should use `ctx-aide` when it refers to the current repository, command namespace, paths, config files, skill, or generated artifacts.
- Future package, domain, or trademark work must run a fresh collision review before publishing under the selected name.

## Validation

- `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`
