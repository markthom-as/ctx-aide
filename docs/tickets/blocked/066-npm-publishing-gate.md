---
id: ticket.context.066
status: blocked
title: Prepare npm publishing gate
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: publishing
depends_on:
  - ticket.context.061
  - ticket.context.062
  - ticket.context.063
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - package.json
    - package-lock.json
    - README.md
    - docs/context/architecture/publication-readiness-2026-07-07.md
  directories:
    - scripts
    - .github
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "prepare npm publishing dry-run gate for ctx-aide without publishing"
  generated_at: 2026-07-07
  context_ids:
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - npm view ctx-aide name version description --json
    - npm view ctxa name version description --json
    - npm run build -- --dry-run --json
    - npm pack --dry-run --json
    - npm publish --dry-run
    - npm audit --omit=dev --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - npm install -g ./dist/ctx-aide-0.1.0.tgz --prefix <temp-prefix> --ignore-scripts
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Prepare npm Publishing Gate

## Outcome

Prepare the npm publish dry-run gate for `ctx-aide` so the package can be published later only after owner, license, CI, and payload requirements are satisfied.

## Context

The local Node package builds and installs. Actual npm publication remains intentionally blocked by `private: true`, missing owner/org decisions, and license posture. This ticket should create evidence for readiness without performing a real publish.

## Positive Rules

- Keep real publish out of scope.
- Recheck npm registry state immediately before claims.
- Review the package payload from `npm pack --dry-run --json`.
- Preserve `ctxa` as the single installed binary.

## Negative Rules

- Do not run `npm publish` without `--dry-run`.
- Do not remove `private: true` until `ticket.context.061` is resolved.
- Do not claim name availability from stale registry observations.
- Do not publish under a personal or organization account by implication.

## Axioms

- `axiom.markdown-source-of-truth`: Publishing gates must be recorded in markdown.
- `axiom.ticket-done-requires-commit`: Dry-run gate work closes as one scoped commit.
- `axiom.no-paid-infra-without-cost-estimate`: Any paid package or registry service must be surfaced before use.

## Frozen Decisions

- Decision: npm package name remains `ctx-aide`.
- Rationale: this is the selected package-facing namespace.
- Decision: installed binary remains `ctxa`.
- Rationale: it is the canonical CLI command.

## Implementation Rules

- Required approach: after release posture is decided, update package metadata, run registry checks, review package payload, run `npm publish --dry-run`, and record exact evidence.
- Existing components/helpers to use: `scripts/build.mjs`, `scripts/install-local.mjs`, publication readiness note, and CI gates.
- Anti-patterns to avoid: real publish, stale name claims, missing license metadata, or package payload drift.
- Stop and escalate if: registry ownership, 2FA/provenance, package scope, license, or account access is unresolved.

## Scope

- In: npm metadata readiness, registry observations, dry-run publish proof, package payload review, and docs.
- Out: real npm publish, GitHub release, Cargo publish, public remote creation, and paid infrastructure.

## Acceptance Criteria

- `package.json` metadata is complete for the chosen release posture.
- `npm pack --dry-run --json` payload is reviewed and bounded.
- `npm publish --dry-run` succeeds or produces a documented blocker tied to owner/license/private status.
- Publication readiness docs record the exact command evidence and date.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

If `private: true` remains the chosen posture, this ticket should stay blocked or close as a documented no-publish decision instead of forcing publication readiness.

## Completion

- Status: blocked
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: real publish ticket only after explicit approval.
