---
id: ticket.context.045
status: ready
title: Create installable local CLI packaging
ticket_pack: pack.user-friendly-adoption-onboarding-2026-07-05
milestones:
  - milestone.user-friendly-adoption-onboarding
source_spec: spec.user-friendly-adoption-onboarding-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: packaging
depends_on: []
blocks:
  - ticket.context.046
scope:
  routes: []
  files:
    - package.json
    - tools/context/ctx.mjs
    - README.md
  directories: []
  components: []
  flows:
    - workflow.astrotechne-adoption
context_query:
  task: "create installable local CLI packaging for ctx"
  generated_at: 2026-07-05
  context_ids:
    - workflow.astrotechne-adoption
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - node --check tools/context/ctx.mjs
    - npm install --package-lock-only --ignore-scripts
    - npm pack --dry-run
    - node tools/context/ctx.test.mjs
  smoke:
    - npm link --dry-run
    - node tools/context/ctx.mjs --help
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Create Installable Local CLI Packaging

## Outcome

Make the existing `ctx` CLI installable through normal Node package tooling without publishing to a registry.

## Context

The CLI already has a Node shebang in `tools/context/ctx.mjs`, but the repo has no `package.json`, so users must call `node tools/context/ctx.mjs`.

## Positive Rules

- Preserve the `ctx` command name.
- Prefer local/package-manager installation paths such as `npm link` or `npm install -g <repo-path>`.
- Keep install support local-only until public owner, license, and package scope decisions are resolved.

## Negative Rules

- Do not publish to npm or configure registry release automation.
- Do not add install scripts that execute shell commands during package install.
- Do not rename the repository or command.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.no-paid-infra-without-cost-estimate`: Any paid infrastructure or hosted service change requires a surfaced estimate first.

## Frozen Decisions

- Decision: package metadata should expose `ctx` as a bin that points at `tools/context/ctx.mjs`.
- Rationale: the command is already executable and should remain the single CLI entrypoint.
- Decision: registry publishing is out of scope.
- Rationale: public-release owner, license, and package-scope decisions are separate blockers.

## Implementation Rules

- Required approach: add minimal package metadata and documentation for local install/link.
- Existing components/helpers to use: existing `ctx.mjs` shebang and command routing.
- Anti-patterns to avoid: postinstall scripts, global filesystem writes during tests, or package metadata that claims public registry availability.
- Stop and escalate if: implementation requires a package name/scope, license, or registry ownership decision.

## Scope

- In: `package.json`, optional lockfile from package-lock-only, README install section, and packaging smoke tests.
- Out: npm publish, GitHub release artifacts, Homebrew formula, and command rename.

## Acceptance Criteria

- `npm pack --dry-run` includes the CLI and required docs without generated caches.
- `npm link --dry-run` identifies a `ctx` bin without mutating global state.
- README shows a local install command and the first setup command.
- Existing direct invocation through `node tools/context/ctx.mjs` still works.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

Use `private: true` if needed to prevent accidental registry publishing during this slice.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: none
