---
id: ticket.context.044
status: blocked
title: Prepare GitHub public launch gate
ticket_pack: pack.ctx-aide-public-release-2026-07-01
milestones:
  - milestone.ctx-aide-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: launch
depends_on:
  - ticket.context.040
  - ticket.context.041
  - ticket.context.042
  - ticket.context.043
blocks: []
scope:
  routes: []
  files:
    - README.md
  directories:
    - docs
    - .github
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "prepare GitHub public launch gate for ctx-aide"
  generated_at: 2026-07-01
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.no-public-release-without-history-scan
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - make validate
    - make smoke
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Prepare GitHub Public Launch Gate

## Outcome

Create the final launch gate for making the renamed repo public on GitHub, including metadata, validation evidence, visibility decision, and post-launch link updates.

## Context

This is the final ticket in the public-release pack. It must not run until the name, safety audit, README, and demo proof are complete.

## Positive Rules

- Confirm all upstream tickets are done with commit and validation evidence.
- Prepare GitHub description, topics, repository name, homepage/link targets, and launch notes.
- Surface any cost-bearing deploy or hosted-service step before running it.

## Negative Rules

- Do not make the repo public if `ticket.context.041` has unresolved safety blockers.
- Do not push/deploy to paid infrastructure without an explicit cost estimate and user confirmation.
- Do not update external profile/Opertus links until the public URL exists and is verified.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.no-public-release-without-history-scan`: Public release is blocked until git history has been scanned or a documented replacement control is accepted.
- `axiom.no-paid-infra-without-cost-estimate`: Any paid infrastructure or hosted deployment change requires a surfaced cost estimate before implementation.

## Frozen Decisions

- Decision: this ticket owns the public visibility gate, not earlier docs or audit tickets.
- Rationale: visibility should happen only after all release inputs are complete and reviewed.

## Implementation Rules

- Required approach: verify upstream tickets, run full validation, prepare GitHub metadata, create or update remote if approved, verify public URL, then update public links.
- Existing components/helpers to use: `ctxa` checks, `make validate`, `make smoke`, GitHub CLI if authenticated.
- Anti-patterns to avoid: public visibility before safety proof, stale profile links, or unpublished local-only launch notes.
- Stop and escalate if: GitHub repo creation/visibility requires a decision about owner/org, naming, license, unresolved safety risk, or paid infrastructure.

## Scope

- In: GitHub launch metadata, final validation evidence, public visibility checklist, profile/Opertus link update plan.
- Out: unrelated repository cleanup, major renames beyond selected public name, paid deploys without approval.

## Acceptance Criteria

- Pack status accurately reports upstream ticket completion.
- Full validation passes or blockers are documented.
- GitHub launch checklist identifies exact owner, repo name, description, topics, visibility, license, and public URL.
- Public links are updated only after verified launch.

## Validation

- Automated: frontmatter commands.
- Smoke: verify public URL with GitHub API or browser after launch if launch is approved.
- Screenshots: optional profile/Opertus screenshot only if external surfaces are updated.

## Implementation Notes

If the user wants the public launch performed in this ticket, confirm owner/org and any deploy/build cost implications before changing visibility or pushing to a deployment-connected remote.

## Completion

- Status: blocked
- Commit: pending
- Verification evidence: launch gate prepared in `docs/context/architecture/github-public-launch-gate-2026-07-05.md`; no remote is configured; owner/org and license decisions are required before public visibility changes.
- Follow-up tickets: none
