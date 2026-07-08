---
id: ticket.context.064
status: ready
title: Add subcommand help and command manifest
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: cli-surface
depends_on: []
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - README.md
  directories:
    - docs/context/schema
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add subcommand help and machine-readable command manifest for ctxa"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs --help
    - node tools/ctx-aide/ctx-aide.mjs --help --json
    - node tools/ctx-aide/ctx-aide.mjs help adoption
    - node tools/ctx-aide/ctx-aide.mjs help adoption --json
    - node tools/ctx-aide/ctx-aide.mjs command manifest --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - .ctx-aide/install/bin/ctxa help adoption
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add Subcommand Help And Command Manifest

## Outcome

Add production-quality CLI introspection: human-readable help for command groups and a machine-readable command manifest that agents can inspect without scraping text.

## Context

Top-level `ctxa --help` is now grouped and readable, but subcommand help is still uneven. Agent-native CLI quality wants three layers: human help, machine-readable command context, and workflow docs.

## Positive Rules

- Keep `--json` outputs parseable and stable.
- Generate human help and JSON manifest from the same command catalog.
- Cover mutation boundaries, required flags, and examples in the manifest.
- Keep top-level help concise enough for terminal use.

## Negative Rules

- Do not duplicate command lists by hand in multiple structures.
- Do not add prompts, ANSI styling, pagers, or TTY-only behavior.
- Do not remove the existing flat `usage` array until a compatibility decision is made.

## Axioms

- `axiom.markdown-source-of-truth`: Workflow docs and command manifest should agree.
- `axiom.ticket-done-requires-commit`: Completion requires one scoped commit.
- `axiom.public-docs-match-implemented-behavior`: Help must describe real commands only.

## Frozen Decisions

- Decision: top-level JSON help remains backward compatible for now.
- Rationale: current tests and agents may consume `usage`.
- Decision: add a manifest command rather than asking agents to parse human help.
- Rationale: command discovery should be structured.

## Implementation Rules

- Required approach: introduce a command catalog data structure, render top-level/group help from it, expose `ctxa command manifest --json`, and test both human and JSON outputs.
- Existing components/helpers to use: current top-level help formatter and `ctx-aide.test.mjs` help assertions.
- Anti-patterns to avoid: broad command behavior changes, missing tests for detached stdin, or hidden breaking changes in JSON help.
- Stop and escalate if: manifest design becomes a larger schema/versioning discussion than this ticket can safely close.

## Scope

- In: command catalog, group help, manifest JSON, tests, and README mention.
- Out: command renames, setup implementation, OpenAPI-style schema generation, MCP tool generation, and workflow execution changes.

## Acceptance Criteria

- `ctxa help <group>` shows readable help for at least core, context, adoption, feedback, and markdown gates.
- `ctxa help <group> --json` returns structured command entries.
- `ctxa command manifest --json` returns a versioned manifest with command ids, examples, mutating/read-only classification, JSON support, and short descriptions.
- Existing `ctxa --help --json` remains compatible.
- Setup-specific help is included only if `ctxa setup` exists when this ticket is implemented; otherwise adoption setup remains represented by existing adoption commands.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

Prefer a small manifest schema committed under `docs/context/schema/` only if it helps validators; otherwise keep the first slice focused in code and tests.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: manifest-driven MCP/tool metadata can come later.
