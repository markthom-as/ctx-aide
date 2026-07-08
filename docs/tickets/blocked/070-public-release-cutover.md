---
id: ticket.context.070
status: blocked
title: Run final public release cutover
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
  - ticket.context.044
  - ticket.context.060
  - ticket.context.061
  - ticket.context.062
  - ticket.context.063
  - ticket.context.064
  - ticket.context.065
  - ticket.context.066
  - ticket.context.067
  - ticket.context.068
  - ticket.context.069
blocks: []
scope:
  routes: []
  files:
    - README.md
    - package.json
    - docs/context/architecture/github-public-launch-gate-2026-07-05.md
    - docs/context/architecture/publication-readiness-2026-07-07.md
  directories:
    - .github
    - docs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "run final CTX Aide public release cutover after production hardening gates"
  generated_at: 2026-07-07
  context_ids:
    - architecture.github-public-launch-gate-2026-07-05
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.no-public-release-without-history-scan
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-production-hardening-2026-07-07 --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - npm run build -- --dry-run --json
    - npm run install:local -- --json
    - npm audit --omit=dev --json
    - npm pack --dry-run --json
    - npm publish --dry-run
    - make validate
    - make smoke
  smoke:
    - Verify public GitHub URL only after owner-approved visibility change.
    - Verify npm package page only after owner-approved publish.
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Run Final Public Release Cutover

## Outcome

Execute the final owner-approved public release cutover after all production-hardening, launch, license, safety, npm, Cargo, and documentation gates are closed.

## Context

This is not an implementation ticket yet. It is the final cutover gate and should remain blocked until every prerequisite is complete and the owner explicitly approves public visibility or package publication.

## Positive Rules

- Require fresh validation immediately before public visibility or publish actions.
- Make public links and package pages verifiable after release.
- Keep cost-bearing or account-mutating steps explicit.
- Record exact commit hash, package version, public URL, and package URL.

## Negative Rules

- Do not make a repository public without owner/org and license decisions.
- Do not publish to npm or crates.io without a fresh dry-run and explicit approval.
- Do not create paid infrastructure.
- Do not update external profiles before the public URL exists and is verified.

## Axioms

- `axiom.markdown-source-of-truth`: Cutover evidence belongs in markdown.
- `axiom.no-public-release-without-history-scan`: Public visibility requires fresh safety evidence.
- `axiom.no-paid-infra-without-cost-estimate`: Cost-bearing steps require surfaced estimates and approval.

## Frozen Decisions

- Decision: this ticket is blocked by design.
- Rationale: public release is an irreversible external-state change relative to local docs.
- Decision: npm and Cargo publication are independent approvals.
- Rationale: GitHub visibility, npm package publication, and crates.io publication can ship separately.

## Implementation Rules

- Required approach: verify all prerequisites, rerun final validation, request explicit approval for each external mutation, perform only approved actions, verify resulting public surfaces, and update docs.
- Existing components/helpers to use: GitHub launch gate, publication readiness note, production hardening pack status, npm build/install scripts, and safety audit.
- Anti-patterns to avoid: batch-publishing multiple channels without separate approval, stale registry checks, or launch notes that omit known limitations.
- Stop and escalate if: any validation fails, approval is incomplete, cost is introduced, or an external account action is ambiguous.

## Scope

- In: final local validation, public GitHub visibility if approved, npm publish if approved, link updates, and release evidence.
- Out: implementation of unresolved hardening tickets, Cargo implementation, paid infrastructure, and broad feature work.

## Acceptance Criteria

- Every production-hardening prerequisite ticket is done or explicitly waived in markdown by the owner.
- Fresh final validation passes.
- Public GitHub URL is verified if GitHub release is approved.
- npm package URL is verified if npm publish is approved.
- README/publication readiness docs reflect the actual released channels and remaining limitations.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: optional GitHub/package page screenshots after launch.

## Implementation Notes

This ticket should be the last step. If any prerequisite is still blocked, keep this ticket blocked and report the blocker instead of partially launching.

## Completion

- Status: blocked
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: post-release fixes only after launch evidence exists.
