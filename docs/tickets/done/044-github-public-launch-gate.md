---
id: ticket.context.044
status: done
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
  - ticket.context.054
  - ticket.context.055
  - ticket.context.056
  - ticket.context.057
  - ticket.context.058
  - ticket.context.059
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
blocks:
  - ticket.context.070
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
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-production-hardening-2026-07-07 --json
    - make validate
    - make smoke
  smoke: []
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Prepare GitHub Public Launch Gate

## Outcome

Create the final launch gate for making the renamed repo public on GitHub, including metadata, validation evidence, visibility decision, and post-launch link updates.

## Context

This is the final ticket in the public-release pack. It must not run until the name, safety audit, README, demo proof, ctx-aide rename, package build/install, help formatting, and production-hardening prerequisite tickets are complete or explicitly waived.

## Positive Rules

- Confirm all upstream tickets are done with commit and validation evidence.
- Prepare GitHub description, topics, repository name, homepage/link targets, and launch notes.
- Surface any cost-bearing deploy or hosted-service step before running it.

## Negative Rules

- Do not make the repo public if `ticket.context.041` has unresolved safety blockers.
- Do not make the repo public while `pack.ctx-aide-production-hardening-2026-07-07` still has unresolved launch blockers.
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
- Decision: launch `markthom-as/ctx-aide` as public MIT source.
- Decision: npm, Cargo, hosted services, paid infrastructure, and support SLA are outside the alpha launch.

## Implementation Rules

- Required approach: verify upstream tickets and the production-hardening pack, run full validation, prepare GitHub metadata, create or update remote only if approved, verify public URL, then update public links.
- Existing components/helpers to use: `ctxa` checks, `make validate`, `make smoke`, GitHub CLI if authenticated.
- Anti-patterns to avoid: public visibility before safety proof, stale profile links, or unpublished local-only launch notes.
- Stop and escalate if: GitHub repo creation/visibility requires a decision about owner/org, naming, license, unresolved safety risk, or paid infrastructure.

## Scope

- In: GitHub launch metadata, final validation evidence, public visibility checklist, profile/Opertus link update plan.
- Out: unrelated repository cleanup, major renames beyond selected public name, paid deploys without approval.

## Acceptance Criteria

- Pack status accurately reports upstream public-release and production-hardening prerequisite completion.
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

- Status: done
- Commit: self
- Verification evidence: the 2026-07-28 refresh found zero `gitleaks` findings, one reviewed `detect-secrets` test fixture, zero npm vulnerabilities, and passing package build/install, `make validate`, `make smoke`, ticket, pack, and diff checks. No remote was created in this preparation ticket.
- Follow-up tickets: `ticket.context.070` owns the external public cutover.
