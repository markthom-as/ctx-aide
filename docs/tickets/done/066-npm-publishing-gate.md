---
id: ticket.context.066
status: done
title: Keep npm publication closed for alpha
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
    - npm audit --omit=dev --json
    - node -e "const p=require('./package.json'); if (!p.private || p.license !== 'MIT') process.exit(1)"
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - npm install -g ./dist/ctx-aide-0.1.0.tgz --prefix <temp-prefix> --ignore-scripts
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Prepare npm Publishing Gate

## Outcome

Keep npm publication intentionally closed for alpha while preserving a bounded,
installable local package and an explicit future reopening gate.

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
- Decision: `private: true` remains and no npm owner/package is established for
  alpha.
- Rationale: public immutable Git source plus Nix satisfies alpha distribution
  without registry ownership, 2FA, provenance, or release automation.

## Implementation Rules

- Required approach: after release posture is decided, update package metadata, run registry checks, review package payload, run `npm publish --dry-run`, and record exact evidence.
- Existing components/helpers to use: `scripts/build.mjs`, `scripts/install-local.mjs`, publication readiness note, and CI gates.
- Anti-patterns to avoid: real publish, stale name claims, missing license metadata, or package payload drift.
- Stop and escalate if: registry ownership, 2FA/provenance, package scope, license, or account access is unresolved.

## Scope

- In: npm metadata readiness, registry observations, dry-run publish proof, package payload review, and docs.
- Out: real npm publish, GitHub release, Cargo publish, public remote creation, and paid infrastructure.

## Acceptance Criteria

- `package.json` remains private, MIT-licensed, and exposes only `ctxa`.
- `npm pack --dry-run --json` payload is reviewed and bounded.
- Local tarball install remains the only npm-based distribution proof.
- Publication readiness docs record npm as an alpha non-goal and define the
  future reopening gate.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

If `private: true` remains the chosen posture, this ticket should stay blocked or close as a documented no-publish decision instead of forcing publication readiness.

## Completion

- Status: done.
- Commit: self; resolve with post-commit ticket validation.
- Verification evidence: package metadata remains private and MIT-licensed;
  package dry-run, local build/install, production audit, ticket, and pack
  checks pass without a publish action.
- Follow-up tickets: create a new npm publication ticket only after explicit
  post-alpha approval.
