---
id: ticket.context.043
status: done
title: Create public demo proof
ticket_pack: pack.ctx-aide-public-release-2026-07-01
milestones:
  - milestone.ctx-aide-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: public-docs
depends_on:
  - ticket.context.040
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
  directories:
    - docs
    - examples
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "create public demo proof for ctx-aide release"
  generated_at: 2026-07-01
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-demo-is-runnable
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs scan --json
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
    - make smoke
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-05
---

# Create Public Demo Proof

## Outcome

Add a small public-safe demo or walkthrough that proves the core workflow: context, spec, ticket, pack, validation, and agent handoff.

## Context

A public repo needs proof beyond README copy. The demo should be safe, lightweight, and understandable without private user data or access to real client/work repos.

## Positive Rules

- Use synthetic or already-public-safe examples.
- Keep the demo small enough to run or inspect quickly.
- Link the demo from the README after `ticket.context.042`.

## Negative Rules

- Do not include private client data, personal notes, actual secrets, private screenshots, or machine-local workflow traces.
- Do not require paid infrastructure or external accounts.
- Do not create a demo that only works on the user's machine.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-demo-is-runnable`: Public demo claims require a runnable command or inspectable artifact checked into the repo.

## Frozen Decisions

- Decision: the demo should prove the existing local workflow rather than introduce a new UI.
- Rationale: release readiness should be low-risk and focused on proof.

## Implementation Rules

- Required approach: create or update a demo/walkthrough using public-safe fixtures and run the relevant `ctx-aide` validation commands.
- Existing components/helpers to use: existing templates, `ctxa scan`, `ctxa pack status`, and `make smoke`.
- Anti-patterns to avoid: a demo that depends on private repositories or missing credentials.
- Stop and escalate if: meaningful proof requires exposing private repo content.

## Scope

- In: synthetic demo files, walkthrough docs, commands, validation output summary.
- Out: hosted demos, screenshots unless needed, product UI, external integrations.

## Acceptance Criteria

- Demo/walkthrough shows the spec-to-ticket-to-pack flow with public-safe content.
- Demo can be run or inspected from a fresh checkout.
- README links to the demo once public README work lands.

## Validation

- Automated: frontmatter commands.
- Smoke: run the documented demo command or inspect generated artifacts if no executable demo is appropriate.
- Screenshots: none unless a visual artifact is added.

## Implementation Notes

Prefer a single `examples/public-release-demo/` fixture or a concise `docs/public-demo.md` if that better matches the current repo structure.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: added `examples/public-release-demo/README.md`, linked it from `README.md`, and ran the documented scan, query, pack status, ticket check, pack check, and `make smoke` commands on 2026-07-05.
- Follow-up tickets: none
