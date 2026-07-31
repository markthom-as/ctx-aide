---
id: ticket.context.099
status: done
title: Move CTX Aide repository ownership to Opertus Systems
ticket_pack: pack.ctx-aide-opertus-ownership-2026-07-31
milestones:
  - milestone.ctx-aide-opertus-ownership
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: ownership
depends_on:
  - ticket.context.070
blocks: []
scope:
  routes: []
  files:
    - package.json
    - README.md
    - SECURITY.md
    - docs/distribution/ctx-aide-source.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "move public CTX Aide package provenance to the Opertus Systems GitHub organization"
  generated_at: 2026-07-31
  context_ids:
    - architecture.github-public-launch-gate-2026-07-05
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - npm test
    - npm pack --dry-run --json
    - node tools/ctx-aide/ctx-aide.mjs lint --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - git diff --check
  smoke:
    - gh repo view opertus-systems/ctx-aide --json nameWithOwner,url,isPrivate,defaultBranchRef
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-31
---

# Move CTX Aide Repository Ownership To Opertus Systems

## Outcome

The public CTX Aide source and package provenance are owned by the Opertus
Systems GitHub organization rather than a maintainer account.

## Context

The user explicitly selected Opertus Systems as the GitHub owner. The existing
repository is public, MIT licensed, and npm-private; transferring it changes no
package publication or infrastructure billing posture.

## Positive Rules

- Preserve public visibility, immutable history, tags, issues, and release evidence.
- Point active package, clone, issue, security, and distribution links at the organization.
- Keep historical audits as historical evidence of the original launch owner.

## Negative Rules

- Do not publish to npm or Cargo.
- Do not rewrite commits or tags.
- Do not change repository visibility or introduce paid infrastructure.

## Axioms

- `axiom.markdown-source-of-truth`: The ownership cutover and validation evidence are recorded here.
- `axiom.ticket-done-requires-commit`: Active provenance changes land in one commit.
- `axiom.no-paid-infra-without-cost-estimate`: The verified delta is `$0/month`.

## Frozen Decisions

- GitHub owner: `opertus-systems`.
- Repository: `ctx-aide`.
- Visibility: public.
- Package publication: unchanged; npm remains private and unpublished.

## Implementation Rules

- Transfer the existing repository rather than creating a disconnected copy.
- Update only active package-facing links; retain historical launch records.
- Stop if the transfer would change visibility, lose repository history, or
  require a paid GitHub plan change.

## Scope

- In: GitHub ownership and active source, clone, issue, security, and package links.
- Out: npm publication, releases, tags, license ownership, and historical audits.

## Acceptance Criteria

- GitHub resolves the repository as `opertus-systems/ctx-aide`.
- Active package-facing links contain no `markthom-as/ctx-aide` reference.
- Existing package and CTX validation passes.

## Validation

- Automated: `npm test`, `npm pack --dry-run --json`, CTX lint/ticket/pack checks,
  and `git diff --check`.
- Smoke: query `opertus-systems/ctx-aide` through GitHub and verify public `main`.
- Screenshots: none.

## Completion

- Status: done.
- Commit: self.
- Verification evidence: GitHub reports the organization-owned public repository; package and CTX checks pass.
- Follow-up tickets: none.
