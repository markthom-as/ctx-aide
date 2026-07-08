---
id: ticket.context.047
status: done
title: Split Astrotechne web and engine adoption profiles
ticket_pack: pack.user-friendly-adoption-onboarding-2026-07-05
milestones:
  - milestone.user-friendly-adoption-onboarding
source_spec: spec.user-friendly-adoption-onboarding-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: profiles
depends_on: []
blocks:
  - ticket.context.046
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - docs/workflows/astrotechne-adoption.md
  directories: []
  components: []
  flows:
    - workflow.astrotechne-adoption
context_query:
  task: "split Astrotechne web and engine adoption profiles"
  generated_at: 2026-07-05
  context_ids:
    - workflow.astrotechne-adoption
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - bash -lc "node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne.com --profile auto --json || true"
    - bash -lc "node tools/ctx-aide/ctx-aide.mjs adoption status --repo /Users/jove/code/astrotechne-engine --profile auto --json || true"
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T01:24:00Z
---

# Split Astrotechne Web and Engine Adoption Profiles

## Outcome

Make profile auto-detection distinguish Astrotechne web from Astrotechne engine so setup chooses the right ticket root and validation guidance.

## Context

`/Users/jove/code/astrotechne.com` uses `docs/domain-redesign/tickets` and `npm run tickets:status`. `/Users/jove/code/astrotechne-engine` has `docs/tickets`, a Rust workspace, and a narrow npm validation script.

## Positive Rules

- Preserve current web-app behavior for `astrotechne.com`.
- Make `astrotechne-web` and `astrotechne-engine` the canonical explicit profile ids.
- Add explicit engine behavior for `astrotechne-engine`.

## Negative Rules

- Do not create `docs/domain-redesign/tickets` in the engine repo.
- Do not force the web app into the default `docs/tickets` profile.
- Do not run validation commands during status/setup.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision: profile ids should include `astrotechne-web` and `astrotechne-engine`.
- Rationale: the two repos share a family name but have different ticket and validation conventions.
- Decision: no hidden profile alias is required.
- Rationale: the public CLI should prefer explicit profile ids over old aliases unless an implementation ticket documents an intentional shorthand.
- Decision: engine recommended validation should include Rust checks and the existing semantic-map npm script.
- Rationale: the engine is Rust-first with a small Node validation surface.

## Implementation Rules

- Required approach: update profile detection, profile metadata, tests, and Astrotechne adoption workflow docs.
- Existing components/helpers to use: `detectAdoptionProfile`, `readPackageJson`, and fixture adoption tests.
- Anti-patterns to avoid: name-only detection that ignores existing ticket roots, or status output that recommends unavailable commands.
- Stop and escalate if: the engine repo needs a new canonical ticket convention decision beyond preserving `docs/tickets`.

## Scope

- In: profile metadata, auto-detection, validation recommendations, tests, and adoption workflow docs.
- Out: target repo writes, historical ticket migration, and engine code changes.

## Acceptance Criteria

- Auto-detection for `/Users/jove/code/astrotechne.com` reports web profile and `docs/domain-redesign/tickets`.
- Auto-detection for `/Users/jove/code/astrotechne-engine` reports engine profile and `docs/tickets`.
- `--profile astrotechne-web` reports the web profile and `--profile astrotechne-engine` reports the engine profile.
- Status output for engine no longer recommends `npm run tickets:status`.
- Fixture tests cover both Astrotechne profiles.
- No target repo files are written by `adoption status`.

## Validation

- Automated: frontmatter commands. Target-repo status commands are expected to return nonzero until bootstrap blockers are resolved; their JSON output is the profile proof.
- Smoke: none.
- Screenshots: none.

## Implementation Notes

Recommended engine validation should start with `cargo fmt --all --check`, `cargo test --workspace`, and `npm run validate:traditional-semantic-map` when available.

Audit note: this remains the next executable onboarding ticket because it has no unresolved dependencies and unblocks `ticket.context.046`.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `node --check tools/ctx-aide/ctx-aide.mjs` and `node tools/ctx-aide/ctx-aide.test.mjs` passed. `adoption status --profile auto` reported `astrotechne-web` with `docs/domain-redesign/tickets` for `/Users/jove/code/astrotechne.com` and `astrotechne-engine` with `docs/tickets` plus Rust/npm validation for `/Users/jove/code/astrotechne-engine`; both target statuses still report expected bootstrap blockers.
- Follow-up tickets: none
