---
id: spec.public-release-2026-07-01
status: ready
title: Public Release Preparation
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.repo-context-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-01
---

# Public Release Preparation

## Goal

Prepare repo-context, under a better public name, for a credible public GitHub release as evidence of practical agentic developer-productivity work.

## Affected Surfaces

- Files/directories: `README.md`, repo metadata, `docs/context`, `docs/specs`, `docs/tickets`, `docs/ticket-packs`, examples, validation scripts, and generated context artifacts.
- Components: markdown context system, ticket/pack workflow, generated agent-pack surfaces, CLI documentation, public examples.
- Flows: spec-to-ticket workflow, ticket-pack execution, agent context export, validation checks, public release review.
- Design-system areas: none.

## Existing Context

- `flow.repo-context-dogfood`: repo-context should prove its own workflow through specs, packs, tickets, and validation.
- Existing public positioning work identified this repo as the strongest next public artifact for AI developer productivity, repo-local context, agent instructions, and validation workflows.
- `/Users/jove/code/concordat` is an existing separate project name and should not be reused for this release.

## Product Decisions

- Decision: do not flip repository visibility until naming, safety audit, public docs, demo evidence, and launch metadata are complete.
- Rationale: a half-prepared public repo weakens the portfolio signal and increases risk of leaking private workflow traces or confusing readers.
- Regression risk: delaying visibility can slow application support; mitigate by keeping the release pack atomic and parallelizable.

- Decision: `Repo Charter` is the public display name for this release, while `repo-context` remains the internal repository and command name until a dedicated rename ticket exists.
- Rationale: `repo-context` describes a mechanism, while `Repo Charter` describes the repo-local agreement that gives agents context, tickets, decisions, validation, and handoff rules.
- Regression risk: renaming can break command references and docs; mitigate with an explicit naming ticket before downstream copy changes.

- Decision: the public story should emphasize practical engineering workflow leverage, not AI hype.
- Rationale: the target audience is engineering leaders and platform/dev productivity teams evaluating whether the system would help real repositories.
- Regression risk: overly broad positioning can make the project look unfocused; keep examples anchored to specific repo-local workflows.

## Architecture Decisions

- Decision: this pack prepares the current architecture for public release; it does not redesign the CLI, storage model, or markdown schema.
- Rationale: release readiness should prove the existing system before larger product extraction work.
- Rejected alternatives: use the public-release milestone to rewrite the architecture or extract a shared workflow kernel.

- Decision: generated SQLite indexes and generated agent packs remain cache/build artifacts and must be documented as non-canonical.
- Rationale: markdown source of truth is the core system invariant.
- Rejected alternatives: present generated artifacts as authoritative public surfaces.

## Design Decisions

- Decision: no visual UI work is in scope.
- Components/tokens to use: none.
- Anti-patterns to avoid: marketing copy without runnable examples or validation evidence.

## Security and Privacy Decisions

- Data touched: local markdown, generated indexes, git history, examples, screenshots if any, GitHub metadata, and public documentation.
- Trust boundaries: local repo, git history, generated artifacts, future public GitHub repo, linked profile/Opertus surfaces.
- Required safeguards: full working-tree and history secret scan, private/client data review, generated artifact review, license/dependency review, and explicit stop conditions before public visibility changes.

## Open Questions

None at spec level. `ticket.context.040` resolved the public display name as `Repo Charter` on 2026-07-05.

## Hardening Review

- Architecture: public docs must explain markdown source-of-truth, generated cache boundaries, and the relationship between specs, tickets, packs, and agent surfaces.
- Design: the README and examples must be scannable for an outside engineer who has never seen the user's workflow.
- Security: do not make any repository public until history scanning and private-data review complete.
- Best practices: include license, validation commands, examples, and GitHub metadata before launch.
- Testing: run `ctx` markdown checks, `make validate`, `make smoke`, and release-specific scans where tools are available.
- Parallelization: naming and safety audit can start in parallel; docs and demo depend on naming; launch depends on all prior tickets.

## Ticket Plan

- Independent tickets:
  - `ticket.context.040`: choose and document the public name.
  - `ticket.context.041`: complete public-release safety and history audit.
- Sequential tickets:
  - `ticket.context.042`: polish outside-reader README and public positioning after the name decision.
  - `ticket.context.043`: create demo/example proof after the name decision.
  - `ticket.context.044`: prepare GitHub launch metadata and public visibility gate after all prior tickets.
- Shared files that require coordination: `README.md`, release docs, ticket/pack metadata, and any repo metadata touched by the final name.
