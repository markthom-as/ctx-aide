---
id: ticket.context.062
status: ready
title: Add CI release gates
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
    - package.json
    - package-lock.json
    - Makefile
  directories:
    - .github
    - scripts
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add CI gates for CTX Aide package build install validation and repo checks"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - npm ci
    - npm audit --omit=dev --json
    - npm run build -- --dry-run --json
    - npm run install:local -- --json
    - npm pack --dry-run --json
    - npm link --dry-run
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - make validate
    - make smoke
    - git diff --check
  smoke:
    - Run the new workflow locally with an equivalent command sequence.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add CI Release Gates

## Outcome

Add a checked-in CI workflow that proves CTX Aide builds, tests, audits, packages, and installs cleanly on a fresh Node 20+ checkout before any public release or package publishing claim.

## Context

Local validation is currently strong, but there is no `.github` workflow and no public remote. CI should be added as repo-local automation now, while public GitHub visibility remains separately blocked.

## Positive Rules

- Use deterministic non-interactive commands.
- Keep CI free of paid infrastructure; if the target remote is private, document the GitHub Actions minute assumption before enabling the workflow.
- Include package payload and local install smoke, not only unit tests.
- Fail on changed tracked files after generated validation commands.

## Negative Rules

- Do not publish artifacts to npm, GitHub Releases, or external services.
- Do not require secrets.
- Do not rely on globally installed `ctxa`.
- Do not add a matrix broader than the project can support and maintain.
- Do not add paid runners, third-party CI services, secrets, caches, or release uploads in this first gate.

## Axioms

- `axiom.markdown-source-of-truth`: CI must validate markdown tickets, specs, and packs.
- `axiom.ticket-done-requires-commit`: This automation ticket needs one scoped commit.
- `axiom.public-docs-match-implemented-behavior`: CI should run documented build/install commands.

## Frozen Decisions

- Decision: first CI target is Node 20+ on Ubuntu.
- Rationale: package metadata already declares `node >=20`, and Ubuntu is the default public CI baseline.
- Decision: CI does not publish artifacts.
- Rationale: publication requires owner/license decisions.

## Implementation Rules

- Required approach: add `.github/workflows/ci.yml` with checkout, Node setup, `npm ci`, audit, build dry-run, install-local smoke, repo checks, and diff cleanliness.
- Existing components/helpers to use: `npm run build`, `npm run install:local`, `make validate`, `make smoke`, and `ctxa` validators.
- Anti-patterns to avoid: secrets, registry publish steps, hidden global installs, or skipping package payload checks.
- Stop and escalate if: workflow requires paid CI minutes beyond ordinary GitHub Actions assumptions or external credentials.

## Scope

- In: CI workflow, optional Makefile/package script alias if it reduces duplication, and docs mention of the CI gate.
- Out: release publishing, branch protection setup, GitHub repository creation, and deployment.

## Acceptance Criteria

- `.github/workflows/ci.yml` exists and runs the documented validation gates.
- Workflow uses Node 20+ and `npm ci`.
- Workflow includes `npm audit --omit=dev --json`, `npm run build -- --dry-run --json`, `npm run install:local -- --json`, `make validate`, and `make smoke`.
- Workflow does not contain publish, deploy, secret, or paid-infra steps.
- Workflow comments or docs state the expected cost posture: public GitHub Actions is free for ordinary public repos; private repos may consume included account minutes, so no paid runner/service is introduced.

## Validation

- Automated: frontmatter commands.
- Smoke: inspect workflow command order and run the equivalent local command sequence.
- Screenshots: none.

## Implementation Notes

If local `make smoke` mutates generated artifacts, rerun the generator intentionally or restore ignored artifacts before `git diff --check`.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: branch protection can be added after a public GitHub remote exists.
