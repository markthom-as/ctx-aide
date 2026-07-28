---
id: ticket.context.087
status: done
title: Qualify the immutable source and distribution contract
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
  - ticket.context.090
blocks: []
scope:
  routes: []
  files:
    - package.json
    - package-lock.json
    - LICENSE
    - README.md
    - docs/distribution/ctx-aide-source.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "qualify an immutable reachable CTX Aide source and explicit development distribution terms"
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
    - npm pack --dry-run --json
    - make validate
  smoke:
    - Build the package from the chosen immutable source in a clean temporary directory with lifecycle network access disabled.
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Qualify The Immutable Source And Distribution Contract

## Outcome

CTX Aide has a repository-owner-approved immutable source and explicit
distribution contract that vakOS and CI can pin reproducibly without vendoring
the checkout or guessing at license and cache permissions.

## Context

The public MIT source and repository now exist. This ticket records an exact
green revision, its content identity, the tag and cache policy, and the minimal
runtime inventory so vakOS does not have to infer a distribution contract.

## Positive Rules

- Record the exact source URL, revision/tag policy, content identity, license,
  private-access rules, and binary-cache permissions.
- Keep the package runtime inventory minimal, explicit, and testable.
- Preserve exactly one executable identity: ctxa.

## Negative Rules

- Do not publish, change repository visibility, choose a license, or grant
  redistribution rights without explicit owner authority.
- Do not use an absolute local path, mutable branch archive, global npm install,
  or unreviewed lifecycle hook as the integration contract.
- Do not add hosted infrastructure or a paid registry requirement.

## Axioms

- axiom.markdown-source-of-truth: the checked-in source contract records the
  approved distribution facts.
- axiom.ticket-done-requires-commit: completion requires source and package
  evidence in one focused commit.
- axiom.generated-cache-is-not-truth: a package tarball or cache is derived from
  the qualified source and never replaces it.

## Frozen Decisions

- Package name remains ctx-aide and the only executable remains ctxa.
- The runtime supports Node 20 or newer and requires no install-time download.
- Expected infrastructure cost delta is $0/month unless a later, separately
  approved ticket chooses a paid registry or cache.
- Public source is `markthom-as/ctx-aide` under MIT.
- The authoritative alpha pin is full commit
  `d440a524b52a9e5e5b624ffd937331bae659a937`; `v0.1.0-alpha.1` is discovery metadata only.
- Downstream Nix caches are permitted under MIT, but no hosted cache is required or operated by CTX Aide.

## Implementation Rules

- Required approach: record the owner decision, immutable source identity,
  source/cache access, and the reviewable runtime-file inventory.
- Reuse npm pack dry-run and the current command/schema manifest tests.
- Stop and escalate before any new registry publication, hosted service, paid
  cache, visibility change, or license change not explicitly authorized by the owner.

## Scope

- In: repository/license metadata, immutable-source documentation, runtime
  inventory, and reproducible clean-source package proof.
- Out: vakOS flake changes, npm publication, hosted cache setup, Idvisor, or
  product runtime integration.

## Acceptance Criteria

- An intended developer and CI can fetch one immutable revision through the
  documented source contract.
- Distribution and binary-cache permissions are explicit and consistent with
  package and Nix license metadata.
- The packed runtime inventory contains every required schema/template and no
  tests, Git data, credentials, generated artifacts, or unrelated docs.
- Clean-source help, command manifest, schema digests, and vakOS profile probes
  pass without install-time network access.
- The owner decision and any intentionally private access boundary are recorded
  without storing credentials.

## Validation

- Automated: npm test, npm pack dry-run, make validate, and diff checks.
- Smoke: fetch/build from the qualified immutable revision in a clean temporary
  directory with lifecycle network access disabled.
- Screenshots: none.

## Completion

- Status: done.
- Commit: self.
- Verification evidence: the public source commit, tree, annotated tag, raw archive hash, derived package hash, MIT/cache terms, 15-file runtime inventory, green GitHub Actions run `30391660122`, and offline clean-clone build/install probes are recorded in `docs/distribution/ctx-aide-source.md`.
- Follow-up tickets: vakOS Nix package and development-shell integration.
