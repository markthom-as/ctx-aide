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
  - flow.repo-context-dogfood
tags:
  - public-release
  - naming
  - positioning
positive_rules:
  - Use Repo Charter as the public display name for the public-release pack.
  - Preserve repo-context as the internal repository and command name until a dedicated rename ticket exists.
negative_rules:
  - Do not reuse Concordat for this project.
  - Do not rename commands, remotes, package names, or generated artifact paths as part of the public name decision.
load_when:
  path_matches:
    - README.md
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/**
  task_terms:
    - public name
    - public release
    - Repo Charter
    - repo-context
updated: 2026-07-05
---

# Public Name Decision

## Decision

Use **Repo Charter** as the public display name for this release.

`repo-context` remains the internal repository name, CLI namespace, local skill name, and file-path prefix until a separate rename ticket decides otherwise.

## Rationale

Repo Charter describes the system as a repo-local agreement between humans and coding agents: context, specs, tickets, packs, validation, and handoff rules live beside the code and become the charter for agent work.

The name is broad enough to cover markdown context, generated agent packs, validation gates, adoption workflows, and future workflow hardening without implying a hosted service or paid control plane.

## Candidate Review

- `Repo Charter`: selected. It is concrete, readable, and maps to the repo-local workflow contract.
- `repo-context`: rejected as the public name because it describes an implementation mechanism rather than the broader workflow.
- `Concordat`: rejected because `/Users/jove/code/concordat` is a separate local project and should not carry this product surface.
- `Context Accord`: rejected because search results surfaced the existing Accord Project ecosystem and related package/project names.
- `Agent Loom` / `Context Loom`: rejected because search results surfaced an existing Agent Loom project in the same agent-workflow space.
- `Context Ledger`: rejected because search results surfaced adjacent AI context ledger usage and projects.
- `Specrail`: rejected because search results surfaced an existing `specrail` project description in the same spec-first agent-workflow space.

## Collision Notes

Searches on 2026-07-05 did not surface an exact `Repo Charter` project/package collision in the same developer-tooling category. Adjacent terms exist around `charter`, `code charter`, and repo charter concepts, so this decision is appropriate for a public display name but does not claim trademark clearance or package-name availability.

If a future ticket turns Repo Charter into a package, command, domain, or commercial mark, that ticket should perform a fresh package-registry, GitHub, domain, and trademark review before renaming code or publishing artifacts.

## Rename Implications

- README and public docs should lead with `Repo Charter`.
- Command examples should continue to use `node tools/context/ctx.mjs` and `ctx` because no CLI rename is in scope.
- Generated artifacts under `docs/context/generated/` remain cache/build artifacts and do not need a rename.
- The GitHub repository may remain `repo-context` for the first public release, with `Repo Charter` as the display title and description.

## Validation

- `node tools/context/ctx.mjs spec check --json`
- `node tools/context/ctx.mjs ticket check --json`
- `node tools/context/ctx.mjs pack check --json`
