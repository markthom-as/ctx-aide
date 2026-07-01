---
id: ticket.context.041
status: ready
title: Complete public-release safety audit
ticket_pack: pack.repo-context-public-release-2026-07-01
milestones:
  - milestone.repo-context-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: safety
depends_on: []
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - .gitignore
  directories:
    - docs
    - tools
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "audit repo-context for public release safety"
  generated_at: 2026-07-01
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.no-public-release-without-history-scan
validation:
  automated:
    - rg -n "(api_key|secret|token|password|private key|OPENAI_API_KEY|ANTHROPIC_API_KEY|DATABASE_URL|refresh_token|access_token)" .
    - git log --all --name-only --pretty=format: | sort -u
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Complete Public-Release Safety Audit

## Outcome

Prove the repository is safe to prepare for public release by auditing secrets, private workflow traces, generated artifacts, license/dependency surfaces, and git history risk.

## Context

The public-release pack must not rely on a shallow working-tree scan. This project contains generated context artifacts, previous tickets, and local workflow conventions that may include paths or implementation details unsuitable for public release.

## Positive Rules

- Prefer dedicated scanners such as `gitleaks`, `trufflehog`, or `detect-secrets` when available.
- Preserve generated artifacts only when they are intentionally public-safe and documented as caches/build artifacts.
- Record evidence and unresolved risks in canonical markdown.

## Negative Rules

- Do not make the repo public from this ticket.
- Do not delete evidence blindly; if history contains real secrets, stop and plan history rewrite/remediation.
- Do not claim a scanner passed if the tool was not installed or did not scan git history.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.no-public-release-without-history-scan`: Public release is blocked until git history has been scanned or a documented replacement control is accepted.

## Frozen Decisions

- Decision: public visibility is blocked until safety findings are closed or explicitly accepted.
- Rationale: this repo is intended as portfolio evidence; avoid avoidable privacy/security mistakes.

## Implementation Rules

- Required approach: run available secret/history scans, inspect generated artifacts, review license/dependency surfaces, and write a concise audit note with commands and findings.
- Existing components/helpers to use: `ctx` checks, `rg`, `git log`, and any installed secret scanners.
- Anti-patterns to avoid: relying only on a current working-tree grep.
- Stop and escalate if: real credentials, client/private data, or sensitive personal workflow traces are discovered in current files or history.

## Scope

- In: working tree, git history, generated artifacts, docs, examples, package/dependency metadata, local paths.
- Out: renaming, README rewrite, GitHub visibility changes.

## Acceptance Criteria

- Public-release audit note records commands, scanner availability, findings, and release blockers.
- Any sensitive findings are removed, remediated, or escalated with a documented blocker.
- Final safety status is clear enough for `ticket.context.044` to decide whether public visibility can proceed.

## Validation

- Automated: frontmatter commands plus any available dedicated scanner.
- Smoke: inspect representative generated artifacts for private paths or secrets.
- Screenshots: none.

## Implementation Notes

If no dedicated history scanner is installed, document that limitation and either install/use one or mark launch blocked until a real history scan is completed.

## Completion

- Status: pending
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: none
