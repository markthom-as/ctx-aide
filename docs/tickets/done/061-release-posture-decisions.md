---
id: ticket.context.061
status: done
title: Decide release posture and ownership
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: release-decisions
depends_on: []
blocks:
  - ticket.context.066
  - ticket.context.070
scope:
  routes: []
  files:
    - LICENSE
    - package.json
    - package-lock.json
    - README.md
    - docs/context/architecture/publication-readiness-2026-07-07.md
    - docs/context/architecture/github-public-launch-gate-2026-07-05.md
  directories:
    - .github
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "decide CTX Aide release posture owner license and publication authority"
  generated_at: 2026-07-07
  context_ids:
    - architecture.publication-readiness-2026-07-07
    - architecture.github-public-launch-gate-2026-07-05
axioms:
  - axiom.markdown-source-of-truth
  - axiom.no-public-release-without-history-scan
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke:
    - If open-source posture is selected, verify `LICENSE`, `COPYING`, or `NOTICE` exists before unblocking publication.
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Decide Release Posture And Ownership

## Outcome

Record the explicit decisions required before CTX Aide can be made public or published: repository owner/org, npm owner/org, license posture, support posture, and whether package publishing is approved.

## Context

The current repo is intentionally private and local-first. `package.json` has `private: true`, license is `UNLICENSED`, there is no public GitHub remote, and no license file exists. Those are correct safety gates until the owner makes release decisions.

## Positive Rules

- Record decisions in markdown before changing public visibility or package metadata.
- Keep publication blocked until owner/org and license are explicit.
- Separate a public GitHub release from npm and Cargo publication decisions.

## Negative Rules

- Do not remove `private: true`; npm publication is outside the alpha.
- Do not create or mutate the public remote before the final launch gate.
- Do not imply registry publication or support SLAs from the source license.

## Axioms

- `axiom.markdown-source-of-truth`: Release decisions must live in repo-local markdown.
- `axiom.no-public-release-without-history-scan`: Public visibility requires current safety scan evidence.
- `axiom.no-paid-infra-without-cost-estimate`: Any paid service or deployment requires a surfaced cost estimate first.

## Frozen Decisions

- Decision: the public GitHub source owner/repository is
  `markthom-as/ctx-aide`.
- Rationale: the authenticated personal owner is the simplest zero-cost alpha
  home and avoids inventing organization governance.
- Decision: source license is MIT with copyright holder `markthom-as`.
- Rationale: a short OSI-approved permissive license minimizes adoption friction
  for small developer tooling.
- Decision: npm remains private/unpublished and no Cargo package ships for alpha.
- Rationale: the Nix developer package can pin source directly; registries add
  ownership, release, and maintenance work without alpha user value.
- Decision: security uses GitHub private vulnerability reporting after launch;
  ordinary support has no SLA.
- Rationale: this matches the current maintainer capacity without paid services.
- Decision: no publishing or public visibility occurs in this ticket.
- Rationale: this ticket records decisions and unblocks later tickets.

## Implementation Rules

- Required approach: ask for or record the owner decisions, update publication readiness docs, and add license/security/governance artifacts only after the posture is explicit.
- Existing components/helpers to use: publication readiness note, GitHub launch gate, package metadata, and public-release safety audit.
- Anti-patterns to avoid: selecting MIT/Apache/etc. by convention, publishing dry-runs that require removing `private: true`, or creating remote state.
- Stop and escalate if: the decision requires legal review, organization ownership, paid tooling, or external account access.

## Scope

- In: owner/org, license posture, package owner, support/security contact posture, and written publication authority.
- Out: real npm publish, real crates.io publish, public GitHub visibility, paid infrastructure, and package release automation.

## Acceptance Criteria

- A markdown decision record names the repository owner/org and npm owner/org or explicitly delays them.
- License posture is recorded and backed by a license file when open-source reuse is intended.
- `package.json` license/private fields remain aligned with the recorded posture.
- If the chosen posture remains private/no-license, this ticket documents that outcome and leaves publishing tickets blocked.
- Publication readiness docs no longer contain stale or ambiguous release decision language.

## Validation

- Automated: frontmatter commands.
- Smoke: none.
- Screenshots: none.

## Implementation Notes

This ticket is intentionally blocked on user decisions. It should not be implemented by inference.

## Completion

- Status: done.
- Commit: self; resolve with post-commit ticket validation.
- Verification evidence: owner `markthom-as`, repository `ctx-aide`, MIT source
  license, no-npm/no-Cargo alpha, no-SLA support, and `$0/month` posture are
  recorded consistently in LICENSE, package metadata, README, and release docs.
- Follow-up tickets: `ticket.context.067`, `ticket.context.066`,
  `ticket.context.044`, `ticket.context.070`, and `ticket.context.087`.
