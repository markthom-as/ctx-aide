---
id: ticket.context.063
status: done
title: Harden install ergonomics and tarball smoke
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: automation
depends_on: []
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - README.md
    - package.json
    - scripts/build.mjs
    - scripts/install-local.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
  directories:
    - scripts
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "harden local install ergonomics tarball install smoke and PATH guidance for ctxa"
  generated_at: 2026-07-07
  context_ids:
    - architecture.publication-readiness-2026-07-07
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - npm run build -- --json
    - npm run install:local -- --from dist/ctx-aide-0.1.0.tgz --prefix .ctx-aide/tarball-install --json
    - .ctx-aide/tarball-install/bin/ctxa --help
    - .ctx-aide/tarball-install/bin/ctxa doctor --json
    - npm run install:local -- --json
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - command -v ctxa remains optional unless the user explicitly installs globally or adds the local prefix to PATH.
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T02:41:00Z
---

# Harden Install Ergonomics And Tarball Smoke

## Outcome

Make local installation proof closer to real package consumption by installing from the generated tarball, documenting PATH options clearly, and preserving the default isolated install path.

## Context

`npm run install:local` works from the checkout and installs into `.ctx-aide/install`, but production-grade package confidence should also prove the tarball artifact can install and run. Users also need clear guidance that local isolated installs are not automatically added to PATH.

## Positive Rules

- Keep the default install smoke isolated under `.ctx-aide`.
- Add a tarball install path that proves `dist/ctx-aide-0.1.0.tgz` is usable.
- Document explicit PATH options without mutating shell startup files by default.
- Preserve the single `ctxa` binary.

## Negative Rules

- Do not edit `~/.zshrc`, `~/.bashrc`, or other user shell files automatically.
- Do not require global npm install for CI or local smoke.
- Do not publish to npm.
- Do not reinstall the old `ctx-aide` command alias.

## Axioms

- `axiom.markdown-source-of-truth`: Setup and install behavior must be documented.
- `axiom.ticket-done-requires-commit`: Completion requires one scoped commit.
- `axiom.public-docs-match-implemented-behavior`: README commands must match script behavior.

## Frozen Decisions

- Decision: PATH mutation is user-controlled.
- Rationale: automatic shell profile edits are surprising and hard to reverse.
- Decision: tarball install smoke should use a separate ignored prefix.
- Rationale: it avoids confusing checkout install proof with artifact install proof.

## Implementation Rules

- Required approach: extend install script or docs as needed to support `--from dist/ctx-aide-0.1.0.tgz`, add tests or smoke coverage, and document PATH choices.
- Existing components/helpers to use: `scripts/build.mjs`, `scripts/install-local.mjs`, `package.json` scripts, and README setup section.
- Anti-patterns to avoid: shell-specific assumptions, profile edits, global mutation, or unversioned artifact names in tests without a clear version source.
- Stop and escalate if: the implementation requires a real npm registry package or mutating user shell config.

## Scope

- In: tarball install smoke, PATH documentation, script help text, focused tests, and package/build validation.
- Out: global install by default, registry publish, Homebrew, Cargo, and shell startup mutation.

## Acceptance Criteria

- A generated tarball can be installed into a fresh ignored prefix and run `ctxa --help`.
- README explains isolated local install, tarball install, global install, and PATH behavior.
- Script JSON output identifies the installed bin and prefix.
- Tests or validation catch accidental installation of a `ctx-aide` binary alias.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

Use the package version from `package.json` when constructing tarball paths if the script needs to avoid hard-coded filenames.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `npm run build -- --json`, `npm run install:local -- --from dist/ctx-aide-0.1.0.tgz --prefix .ctx-aide/tarball-install --json`, `.ctx-aide/tarball-install/bin/ctxa --help`, `.ctx-aide/tarball-install/bin/ctxa doctor --json`, `npm run install:local -- --json`, `node tools/ctx-aide/ctx-aide.test.mjs`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, and `node tools/ctx-aide/ctx-aide.mjs pack check --json` passed. README now documents isolated install, tarball install, explicit PATH behavior, global install posture, and the single `ctxa` binary.
- Follow-up tickets: none
