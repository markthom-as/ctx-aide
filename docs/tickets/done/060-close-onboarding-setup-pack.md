---
id: ticket.context.060
status: done
title: Close production onboarding setup flow
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.user-friendly-adoption-onboarding-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: onboarding
depends_on:
  - ticket.context.046
  - ticket.context.047
  - ticket.context.048
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - README.md
    - docs/ticket-packs/done/user-friendly-adoption-onboarding-2026-07-05.md
    - docs/workflows/astrotechne-adoption.md
  directories:
    - examples
    - tools/ctx-aide
  components: []
  flows:
    - workflow.astrotechne-adoption
context_query:
  task: "close the ctxa setup onboarding path for production readiness"
  generated_at: 2026-07-07
  context_ids:
    - flow.ctx-aide-dogfood
    - workflow.astrotechne-adoption
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs pack status pack.user-friendly-adoption-onboarding-2026-07-05 --json
    - node tools/ctx-aide/ctx-aide.mjs setup --repo <fixture> --profile auto --no-input --json
    - node tools/ctx-aide/ctx-aide.mjs setup --repo <fixture> --profile auto --write --no-input --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - make validate
  smoke:
    - .ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json
    - .ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne-engine --profile auto --no-input --json
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T03:07:00Z
---

# Close Production Onboarding Setup Flow

## Outcome

Close the existing user-friendly onboarding pack so a new user can install CTX Aide, run one `ctxa setup` command, and get deterministic next steps for target repo context, packs, and tickets.

## Context

The remaining runnable-product gap is onboarding. Existing ready tickets `ticket.context.047`, `ticket.context.046`, and `ticket.context.048` already define the implementation slices: split Astrotechne web/engine profiles, add `ctxa setup`, and document/smoke the install-to-setup path. This ticket is the production closeout gate for that pack.

## Positive Rules

- Preserve the existing detailed tickets instead of duplicating their implementation work.
- Treat setup as the first user-facing adoption command.
- Verify no-input JSON mode for agents and TTY-friendly help for humans.
- Prove setup against fixtures before any real target-repo smoke.

## Negative Rules

- Do not mark production onboarding complete while `046`, `047`, or `048` remain open.
- Do not write to Astrotechne target repos during smoke unless an implementation ticket explicitly isolates and approves the write.
- Do not run target repo validation commands by default from setup.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: README/setup docs must match the installed CLI behavior.

## Frozen Decisions

- Decision: this is a closeout gate, not a replacement for tickets `046`, `047`, and `048`.
- Rationale: those tickets already contain the implementation detail and dependency order.
- Decision: production readiness requires installed `ctxa setup` smoke, not only direct `node tools/ctx-aide/ctx-aide.mjs` smoke.
- Rationale: real users enter through the installed binary.

## Implementation Rules

- Required approach: finish tickets `047`, `046`, and `048`, then update the onboarding pack completion metadata and run the installed-binary smoke path.
- Existing components/helpers to use: `adoptionStatus`, `adoptionBootstrap`, profile detection helpers, `install:local`, and the existing onboarding pack.
- Anti-patterns to avoid: aspirational README commands, target writes hidden in smoke commands, or setup behavior that prompts in `--json` or `--no-input` mode.
- Stop and escalate if: setup requires npm registry publishing, hosted auth, paid infrastructure, or target repo production changes.

## Scope

- In: onboarding pack closeout, installed-binary setup smoke, README/workflow consistency, and final validation evidence.
- Out: npm publish, GitHub launch, paid infrastructure, target repo code changes, and Cargo packaging.

## Acceptance Criteria

- `ticket.context.047`, `ticket.context.046`, and `ticket.context.048` are done with commits and validation evidence.
- `ctxa setup --repo <fixture> --profile auto --no-input --json` returns deterministic JSON without prompting.
- `ctxa setup --repo <fixture> --profile auto --write --no-input --json` is idempotent on rerun.
- Installed `.ctx-aide/install/bin/ctxa setup` smoke works against Astrotechne web and engine paths in no-input JSON mode without writing target code.
- `docs/ticket-packs/active/user-friendly-adoption-onboarding-2026-07-05.md` completion metadata is accurate.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands.
- Screenshots: none.

## Implementation Notes

This closeout ticket was blocked until `047`, `046`, and `048` were complete. It should remain a gate around the onboarding pack rather than a substitute for implementation tickets.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `node --check tools/ctx-aide/ctx-aide.mjs`, `node tools/ctx-aide/ctx-aide.test.mjs`, `node tools/ctx-aide/ctx-aide.mjs pack status pack.user-friendly-adoption-onboarding-2026-07-05 --json`, fixture setup dry-run/write/rerun smokes, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, and `make validate` passed. Installed `.ctx-aide/install/bin/ctxa setup` returned expected no-input dry-run JSON for Astrotechne web and engine without target writes.
- Follow-up tickets: none
