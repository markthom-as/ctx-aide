---
id: ticket.context.028
status: done
title: Add native target adoption pack creation
ticket_pack: pack.ctx-aide-pre-production-adoption-hardening-2026-06-27
milestones:
  - milestone.ctx-aide-pre-production-adoption-hardening
source_spec: spec.pre-production-adoption-hardening-2026-06-27
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: adoption-pack
depends_on:
  - ticket.context.027
blocks:
  - ticket.context.029
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/workflows/astrotechne-adoption.md
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "add native target adoption pack creation"
  generated_at: 2026-06-27
  context_ids:
    - flow.ctx-aide-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.test.mjs
  smoke: []
  screenshots: []
completion:
  commit: native-target-adoption-pack
  completed_at: 2026-06-27
---

# Add Native Target Adoption Pack Creation

## Outcome

Add `ctx-aide adoption pack` so target repos can get a reviewable pack artifact before generated tickets are created.

## Context

Astrotechne uses packet directories with `README.md`. Creating standalone tickets without the packet README loses the pack-level truth surface.

## Positive Rules

- Preserve target profile conventions.
- Create Astrotechne packs as `docs/domain-redesign/tickets/<slug>/README.md`.
- Keep default and Wetware packs as ctx-aide-style markdown under `docs/ticket-packs`.

## Negative Rules

- Do not rewrite existing packs unless `--force` is supplied.
- Do not require production code changes.
- Do not hide planned writes in dry-run mode.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- `adoption pack` is a target-repo write command behind `--write`.
- Astrotechne directory packs should include `README.md` because that is the local convention.

## Implementation Rules

- Required approach: generate compact pack markdown with status, validation commands, and ticket placeholders.
- Existing components/helpers to use: `detectAdoptionProfile`, `writeFileIfAllowed`, `slugify`, and `yamlKeyList`.
- Anti-patterns to avoid: migrating historical packs.
- Stop and escalate if: profile conventions require target-specific migrations.

## Scope

- In: pack command, tests, usage text, Astrotechne workflow doc update.
- Out: ticket completion finalizer and historical import.

## Acceptance Criteria

- `ctx-aide adoption pack --repo <target> --profile astrotechne --slug <slug> --write --json` creates a packet README path.
- Dry-run reports planned path without writing.
- Fixture tests verify no overwrite without `--force`.

## Validation

- Automated: `node tools/ctx-aide/ctx-aide.test.mjs`.
- Smoke: target fixture pack creation.
- Screenshots: none.

## Implementation Notes

This ticket prepares the target repo for generated tickets but does not change ticket placement yet.

## Completion

- Status: done
- Commit: native-target-adoption-pack
- Verification evidence:
  - `node --check tools/ctx-aide/ctx-aide.mjs`
  - `node tools/ctx-aide/ctx-aide.test.mjs`
  - `node tools/ctx-aide/ctx-aide.mjs adoption pack --repo /Users/jove/code/astrotechne.com --profile auto --title 'CTX Aide Dogfood' --slug ctx-aide-dogfood --json`
  - `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
  - `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- Follow-up tickets: none.
