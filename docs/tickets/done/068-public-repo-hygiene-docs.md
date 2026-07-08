---
id: ticket.context.068
status: done
title: Add public repository hygiene docs
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: public-repo
depends_on: []
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - README.md
    - SECURITY.md
    - CONTRIBUTING.md
    - CHANGELOG.md
  directories:
    - .github
    - docs
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add public repository hygiene documentation for ctx-aide without choosing a license"
  generated_at: 2026-07-07
  context_ids:
    - architecture.publication-readiness-2026-07-07
    - architecture.github-public-launch-gate-2026-07-05
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - test -f SECURITY.md
    - test -f CONTRIBUTING.md
    - test -f CHANGELOG.md
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs lint --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - make validate
  smoke:
    - Review top-level docs for no unsupported license or publication claims.
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T02:27:00Z
---

# Add Public Repository Hygiene Docs

## Outcome

Add the non-license public repository files needed for a credible public release: contribution guidance, security reporting posture, changelog, and GitHub issue/PR templates.

## Context

The README is substantially hardened, but the repository lacks public-project hygiene files. These can be added without choosing a license or publishing anything, as long as they preserve the current `UNLICENSED`/private gate.

## Positive Rules

- Keep docs blunt about current private/unpublished status.
- Preserve markdown-ticket workflow as the contribution model.
- Include security reporting instructions that do not expose private contact details unless approved.
- Add issue/PR templates that nudge contributors toward tickets, validation, and no-secrets reports.

## Negative Rules

- Do not add `LICENSE` unless `ticket.context.061` resolves license posture.
- Do not imply external support SLAs.
- Do not include personal email, phone, or private contact details without explicit approval.
- Do not add GitHub automation that requires secrets.
- Do not add `CODE_OF_CONDUCT.md` unless maintainer/contact and enforcement posture are explicit.

## Axioms

- `axiom.markdown-source-of-truth`: Public contribution flow should point to markdown tickets and packs.
- `axiom.ticket-done-requires-commit`: Hygiene docs need one scoped commit.
- `axiom.public-docs-match-implemented-behavior`: Templates should match actual validation commands.

## Frozen Decisions

- Decision: this ticket excludes the license file.
- Rationale: license is an owner/legal decision.
- Decision: security reporting can use GitHub Security Advisories or issue-private guidance only after public remote exists.
- Rationale: current repo has no public GitHub remote.

## Implementation Rules

- Required approach: add `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and GitHub issue/PR templates with current commands and publication caveats.
- Existing components/helpers to use: README, publication readiness note, public-release safety audit, and ticket templates.
- Anti-patterns to avoid: generic boilerplate that contradicts repo workflow, personal contact leaks, or license claims.
- Stop and escalate if: user wants a specific code of conduct, support contact, or security disclosure channel not already known.

## Scope

- In: public hygiene docs and templates.
- Out: license file, public remote creation, npm publish, security advisory setup requiring GitHub UI, and paid services.

## Acceptance Criteria

- `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md` exist and match current repo behavior.
- `.github/ISSUE_TEMPLATE` and `.github/pull_request_template.md` exist if `.github` is introduced.
- Docs instruct contributors to run the correct validation gates.
- Docs preserve the current unpublished/no-license posture.
- `CODE_OF_CONDUCT.md` is either intentionally omitted or added with explicit owner-approved contact/enforcement details.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

If `CODE_OF_CONDUCT.md` needs a named maintainer/contact, leave it out or keep it minimal until owner details are explicit.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `test -f SECURITY.md`, `test -f CONTRIBUTING.md`, `test -f CHANGELOG.md`, `node tools/ctx-aide/ctx-aide.mjs scan --json`, `node tools/ctx-aide/ctx-aide.mjs lint --json`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, and `make validate` passed. Docs preserve the unpublished, private, no-license posture and intentionally omit `CODE_OF_CONDUCT.md`.
- Follow-up tickets: license file after `ticket.context.061`
