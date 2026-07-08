---
id: ticket.context.046
status: ready
title: Add guided ctxa setup onboarding
ticket_pack: pack.user-friendly-adoption-onboarding-2026-07-05
milestones:
  - milestone.user-friendly-adoption-onboarding
source_spec: spec.user-friendly-adoption-onboarding-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: setup
depends_on:
  - ticket.context.045
  - ticket.context.047
blocks:
  - ticket.context.048
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - README.md
  directories: []
  components: []
  flows:
    - workflow.astrotechne-adoption
context_query:
  task: "add guided ctxa setup onboarding command"
  generated_at: 2026-07-05
  context_ids:
    - workflow.astrotechne-adoption
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.explicit-context-loading
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs setup --help
    - node tools/ctx-aide/ctx-aide.mjs setup --help --json
    - node tools/ctx-aide/ctx-aide.mjs setup --repo <fixture> --profile auto --no-input --json
  smoke:
    - node tools/ctx-aide/ctx-aide.mjs setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Add Guided ctxa Setup Onboarding

## Outcome

Add `ctxa setup` as the user-friendly adoption command that detects target state, previews or writes bootstrap changes, and returns next steps.

## Context

Existing adoption primitives are usable but require several commands. Users should be able to run one setup command first, then choose whether to seed context/pack/ticket work.

## Positive Rules

- Compose existing adoption status/bootstrap/context/pack helpers instead of duplicating behavior.
- Keep `--json` output stable and parseable.
- Make guided prompts available only when stdin/stdout are TTYs and `--no-input` is not set.

## Negative Rules

- Do not prompt in `--json`, `--no-input`, or detached-stdin mode.
- Do not write unless `--write`, `--yes`, or an explicit TTY confirmation is present.
- Do not run target validation commands by default.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.explicit-context-loading`: Context is loaded by command, not by bulk prompt stuffing.

## Frozen Decisions

- Decision: top-level command is `ctxa setup`.
- Rationale: setup is easier for first-time users than `ctxa adoption bootstrap`.
- Decision: `--no-input --json` is the required agent mode.
- Rationale: agents and automations need deterministic behavior.
- Decision: setup should return the exact low-level commands it ran or recommends.
- Rationale: users can learn the system without losing transparency.

## Implementation Rules

- Required approach: add command routing, shared setup orchestration, tests for dry-run/write/idempotency, and help text.
- Existing components/helpers to use: `adoptionStatus`, `adoptionBootstrap`, `adoptionContext`, `adoptionPack`, `writeFileIfAllowed`, and profile detection helpers.
- Anti-patterns to avoid: readline prompts in JSON mode, unbounded target scans, or hidden target validation.
- Stop and escalate if: setup needs registry publishing, hosted auth, or paid infrastructure.

## Scope

- In: `ctxa setup --repo <target> --profile auto`, `--write`, `--yes`, `--no-input`, `--json`, readable human output, and structured next commands.
- Out: full TUI, package registry publish, target code edits, and automatic test/build execution in target repos.

## Acceptance Criteria

- `ctxa setup --repo <fixture> --profile auto --no-input --json` exits nonzero when setup would require confirmation and reports planned changes.
- `ctxa setup --repo <fixture> --profile auto --write --no-input --json` bootstraps the fixture and is idempotent on rerun.
- TTY mode summarizes detected profile, dirty worktree warnings, planned writes, and next commands.
- JSON mode includes `ok`, `profile`, `status_before`, `changes`, `warnings`, `next_commands`, and `errors`.
- Detached stdin never hangs.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

If a confirmation flag name already exists in local convention, prefer it over adding a second synonym. Otherwise use `--yes` for setup confirmation and keep `--force` for overwrite behavior.

Audit note: this ticket is fully specified but should run after `ticket.context.047`; do not start it until Astrotechne web/engine profile behavior is in place.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: none
