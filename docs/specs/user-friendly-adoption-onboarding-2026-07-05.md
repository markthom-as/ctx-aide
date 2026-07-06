---
id: spec.user-friendly-adoption-onboarding-2026-07-05
status: ready
title: User-Friendly Adoption Onboarding
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - workflow.astrotechne-adoption
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-05
---

# User-Friendly Adoption Onboarding

## Goal

Make repo-context adoption feel like a normal developer tool: install the `ctx` CLI, run one setup command, review the planned changes, and end with a bootstrapped target repo plus clear next commands.

## Affected Surfaces

- Files/directories: `package.json`, `tools/context/ctx.mjs`, `tools/context/ctx.test.mjs`, `README.md`, `docs/workflows/astrotechne-adoption.md`, `docs/specs`, `docs/tickets`, and `docs/ticket-packs`.
- Components: CLI command routing, target adoption profiles, bootstrap/status/setup output, install documentation, fixture tests.
- Flows: install CLI, run setup, dry-run target adoption, write bootstrap files, seed first context entries, create first pack, verify adoption status.
- Design-system areas: none.

## Existing Context

- `ctx adoption status`, `ctx adoption bootstrap`, `ctx adoption context`, `ctx adoption pack`, `ctx adoption ticket`, and `ctx adoption implementation-plan` already exist as low-level non-interactive primitives.
- `docs/workflows/astrotechne-adoption.md` documents the desired Astrotechne overlay approach and says production-code use should start with adoption status and bootstrap.
- The current `astrotechne` profile fits `/Users/jove/code/astrotechne.com` but misclassifies `/Users/jove/code/astrotechne-engine`, which has `docs/tickets` and Rust-first validation.
- There is no `package.json`, so users currently run the tool through `node tools/context/ctx.mjs` instead of installing `ctx`.

## Product Decisions

- Decision: the primary happy path should be `ctx setup --repo <target> --profile auto`.
- Rationale: setup is the user-facing word; the existing `adoption` subcommands remain lower-level building blocks for agents and advanced users.
- Regression risk: hiding the lower-level commands can make automation less explicit; mitigate by keeping setup output structured and listing the exact underlying commands it ran or would run.

- Decision: `ctx setup` must support both guided TTY mode and deterministic agent mode.
- Rationale: humans benefit from prompts and summaries, while agents need non-interactive JSON.
- Regression risk: prompts can break automation; mitigate with `--json`, `--no-input`, `--yes`, and tests with stdin detached.

- Decision: initial install support should be local/package-manager installable, not registry publishing.
- Rationale: public repo owner, package scope, license, and registry publishing are still gated by the public-release pack.
- Regression risk: users may expect `npm install -g ctx-aide` immediately; docs should say local install/link is supported now and registry publish is a later launch task.

- Decision: no paid infrastructure is in scope.
- Rationale: setup writes local repo files only.
- Regression risk: future hosted onboarding or registry automation could introduce cost; keep this pack local-only.

## Architecture Decisions

- Decision: add a thin orchestration command over existing adoption primitives instead of duplicating bootstrap logic.
- Rationale: status/bootstrap/context/pack/ticket behavior is already tested and should remain the source of truth.
- Rejected alternatives: a shell script wrapper, a TUI-first app, or a separate installer repo.

- Decision: create distinct profile behavior for Astrotechne web and Astrotechne engine while preserving `--profile astrotechne` as the web-compatible alias.
- Rationale: the engine's ticket root and validation stack differ from the web app.
- Rejected alternatives: force the engine into the web ticket root or require users to remember `--profile default`.

- Decision: setup writes only repo-local scaffold/config/context/pack files and never runs target validation by default.
- Rationale: validation can be slow, environment-sensitive, or blocked by secrets; setup should prepare the repo, not mutate production code.
- Rejected alternatives: run build/test/ticket status automatically as part of every setup.

## Design Decisions

- Decision: human output should be short, staged, and explicit: detected profile, planned changes, warnings, prompts, writes, and next commands.
- Components/tokens to use: CLI text only.
- Anti-patterns to avoid: spinner-heavy output, hidden writes, and prompts that lack a `--yes` equivalent.

## Security and Privacy Decisions

- Data touched: target repo paths, git status summaries, local markdown scaffolding, profile config, tool policy config, and generated context/pack markdown.
- Trust boundaries: source repo CLI, target repo checkout, local filesystem, package-manager local/global bin path.
- Required safeguards: dry-run by default where writes are consequential, explicit `--write` or `--yes` for mutation, no shell-evaluated install scripts, repo-bound writes, no paid infrastructure changes, and no target validation execution unless a later command explicitly asks for it.

## Open Questions

None for the MVP. Registry publishing, public package scope, and remote install instructions remain blocked by the separate public-release owner/license decisions.

## Hardening Review

- Architecture: setup should compose existing adoption helpers and expose structured output for agents.
- Design: the human setup path should reduce command-count and explain next steps without hiding file writes.
- Security: no scripts should curl-pipe-shell or write outside the target repo without an explicit flag.
- Best practices: preserve `--json`, deterministic outputs, actionable errors, idempotent writes, and detached-stdin tests.
- Testing: fixture install/link smoke, setup dry-run/write/idempotency tests, profile detection tests for Astrotechne web and engine, and README command smoke.
- Parallelization: packaging and profile detection can start independently; setup depends on both for the full happy path; docs/proof depends on all implementation tickets.

## Ticket Plan

- Independent tickets:
  - `ticket.context.045`: create installable local CLI packaging.
  - `ticket.context.047`: split Astrotechne web and engine adoption profiles.
- Sequential tickets:
  - `ticket.context.046`: add guided `ctx setup` onboarding after packaging and profile behavior are available.
  - `ticket.context.048`: document and smoke the install-to-setup path after the implementation tickets land.
- Shared files that require coordination: `tools/context/ctx.mjs`, `tools/context/ctx.test.mjs`, `README.md`, and `docs/workflows/astrotechne-adoption.md`.
