---
id: ticket.context.090
status: done
title: Freeze the alpha runtime package inventory
ticket_pack: pack.vakos-integration-prerequisites-2026-07-28
milestones:
  - milestone.vakos-integration-prerequisites
source_spec: spec.vakos-adoption-readiness-2026-07-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: distribution
depends_on:
  - ticket.context.089
blocks:
  - ticket.context.087
scope:
  routes: []
  files:
    - package.json
    - scripts/build.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "freeze a minimal testable ctxa runtime package inventory"
  generated_at: 2026-07-28
  context_ids:
    - spec.vakos-adoption-readiness-2026-07-27
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.generated-cache-is-not-truth
validation:
  automated:
    - npm test
    - npm run build -- --dry-run --json
    - npm pack --dry-run --json
    - make validate
    - git diff --check
  smoke:
    - Install the generated tarball into an isolated prefix and run ctxa help, command manifest, and schema list.
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Freeze The Alpha Runtime Package Inventory

## Outcome

The package payload contains only the executable modules and static config, schema, and template inputs needed by the alpha CLI.

## Context

The public-release package allowlist used broad globs that included the test suite, build/install scripts, skills, release-planning architecture, workflow examples, and repository governance docs. That payload was safe but was not the minimal downstream runtime contract required by `ticket.context.087` and vakOS.

## Positive Rules

- Keep all static files read through `toolRoot` available at runtime.
- Make the expanded tarball inventory deterministic and build-gated.
- Preserve exactly one installed executable, `ctxa`.

## Negative Rules

- Do not package tests, Git data, generated caches, credentials, release-planning tickets, or unrelated documentation.
- Do not add install-time scripts or network downloads.
- Do not remove schemas or templates used by `schema`, `init`, or adoption commands.

## Axioms

- `axiom.markdown-source-of-truth`: the package allowlist and build inventory are reviewed source.
- `axiom.ticket-done-requires-commit`: payload changes and validation land together.
- `axiom.generated-cache-is-not-truth`: no generated context artifact enters the package.

## Frozen Decisions

- npm remains a local packaging mechanism, not a published alpha channel.
- npm's automatic `README.md`, `LICENSE`, and `package.json` entries remain in the payload.
- The build fails closed when the expanded 15-file inventory changes.
- Cost delta is `$0/month`.

## Implementation Rules

- Replace broad package globs with explicit runtime paths.
- Validate the expanded `npm pack` paths after every build.
- Keep tests in source and run them before packaging, but exclude them from the artifact.

## Scope

- In: package allowlist, build inventory gate, focused tests, isolated install proof.
- Out: npm publication, Nix derivation, source tagging, CLI behavior changes, or hosted caches.

## Acceptance Criteria

- The packed inventory has exactly 15 reviewed files.
- No file path contains test, generated, credential, ticket completion, or Git metadata content.
- An isolated install runs help, command manifest, and packaged schema discovery.
- Existing build, validation, and smoke behavior remains green.

## Validation

- Automated: frontmatter commands.
- Smoke: install the real tarball into a temporary prefix and run the three runtime probes.
- Screenshots: none.

## Completion

- Status: done
- Commit: self
- Verification evidence: the package allowlist and expanded inventory are asserted in code; unit, build, pack, validation, diff, and isolated runtime probes pass.
- Follow-up tickets: `ticket.context.087` pins the resulting immutable public revision.
