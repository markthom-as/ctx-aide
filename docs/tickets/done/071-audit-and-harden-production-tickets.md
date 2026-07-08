---
id: ticket.context.071
status: done
title: Audit and harden production tickets
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: onboarding
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - docs/ticket-packs/active/user-friendly-adoption-onboarding-2026-07-05.md
    - docs/ticket-packs/active/production-hardening-2026-07-07.md
    - docs/tickets/blocked/044-github-public-launch-gate.md
    - docs/tickets/ready/046-guided-ctxa-setup-onboarding.md
    - docs/tickets/ready/047-astrotechne-web-engine-profiles.md
    - docs/tickets/ready/048-onboarding-docs-smoke-proof.md
    - docs/tickets/blocked/061-release-posture-decisions.md
    - docs/tickets/ready/064-subcommand-help-command-manifest.md
    - docs/tickets/needs-hardening/065-cli-module-boundary-plan.md
    - docs/tickets/needs-questions/067-cargo-distribution-posture.md
    - docs/tickets/ready/069-final-safety-history-scan.md
  directories:
    - docs/tickets
    - docs/ticket-packs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "audit and harden all open CTX Aide production tickets"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-production-hardening-2026-07-07 --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.user-friendly-adoption-onboarding-2026-07-05 --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - make validate
    - git diff --check
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T18:50:56-0600
---

# Audit And Harden Production Tickets

## Outcome

Audit the open CTX Aide production/onboarding/public-launch tickets and harden their statuses, dependencies, validation language, and execution ordering so the next implementation agents can work from a coherent backlog.

## Context

The production-hardening pack was created from a broad release-readiness audit. This follow-up pass checks the resulting tickets against the existing onboarding and public-release packs, then corrects stale or ambiguous ticket text before implementation begins.

## Positive Rules

- Keep executable tickets clearly separated from blocked decision tickets.
- Preserve existing ticket ids and pack ownership.
- Use dependencies for sequencing, not hidden prose.
- Keep validation commands truthful about expected nonzero observation commands.

## Negative Rules

- Do not implement product behavior in this audit ticket.
- Do not unblock publication, Cargo, npm, or GitHub launch tickets without owner decisions.
- Do not mark downstream setup/docs tickets as complete without command evidence.

## Axioms

- `axiom.markdown-source-of-truth`: Ticket markdown remains the backlog source of truth.
- `axiom.ticket-done-requires-commit`: This hardening pass closes with one commit.
- `axiom.public-docs-match-implemented-behavior`: Ticket validations should describe commands that future implementers can actually run.

## Frozen Decisions

- Decision: `ticket.context.047` remains the next executable onboarding ticket.
- Rationale: it has no unresolved dependencies and unblocks `ctxa setup`.
- Decision: `ticket.context.070` remains blocked.
- Rationale: public release cutover still requires owner/license/Cargo/npm/GitHub decisions and fresh safety evidence.

## Implementation Rules

- Required approach: update ticket/pack markdown only, then run repo-native validators.
- Existing components/helpers to use: `ctxa ticket check`, `ctxa pack check`, pack status commands, and `make validate`.
- Anti-patterns to avoid: changing code, moving tickets without a status reason, or adding vague "TBD" blockers.
- Stop and escalate if: audit uncovers a missing legal/product decision that cannot be expressed as a blocker.

## Scope

- In: ticket text, pack text, dependency clarity, validation wording, and audit evidence.
- Out: code changes, CI implementation, setup implementation, publication, Cargo crate work, and public launch.

## Acceptance Criteria

- Open ticket graph validates.
- Onboarding pack text reflects `ticket.context.045` as done and `047 -> 046 -> 048` as the remaining order.
- Public launch ticket references the production-hardening pack.
- Release/Cargo/npm tickets do not contain unconditional validation that contradicts blocked decisions.
- Secret scan ticket treats grep/rg matches as reviewed observations.

## Validation

- Automated: frontmatter commands.
- Smoke: none.
- Screenshots: none.

## Implementation Notes

This ticket is intentionally documentation-only.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `ctxa ticket check`, `ctxa pack check`, production/onboarding/public-release pack status checks, `ctxa spec check`, `make validate`, `make smoke`, and `git diff --check` passed.
- Follow-up tickets: implement ready tickets starting with `ticket.context.047`.
