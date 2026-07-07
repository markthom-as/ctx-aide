---
id: ticket.context.054
status: done
title: Harden publication readiness docs
ticket_pack: pack.repo-context-public-release-2026-07-01
milestones:
  - milestone.repo-context-public-release
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: public-docs
depends_on:
  - ticket.context.040
  - ticket.context.041
  - ticket.context.042
  - ticket.context.043
blocks:
  - ticket.context.044
scope:
  routes: []
  files:
    - README.md
    - package.json
    - package-lock.json
  directories:
    - docs/context/architecture
    - docs/ticket-packs/active
  components: []
  flows:
    - flow.repo-context-dogfood
context_query:
  task: "harden CTX Aide public docs and package readiness for Hacker News level criticism and npm/Cargo publication review"
  generated_at: 2026-07-07
  context_ids:
    - flow.repo-context-dogfood
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.public-docs-match-implemented-behavior
  - axiom.no-paid-infra-without-cost-estimate
validation:
  automated:
    - npm install --package-lock-only --ignore-scripts
    - npm pack --dry-run --json
    - node --check tools/context/ctx.mjs
    - node --check tools/context/screenshot-review-ui.mjs
    - node tools/context/ctx.test.mjs
    - node tools/context/ctx.mjs scan --json
    - node tools/context/ctx.mjs spec check --json
    - node tools/context/ctx.mjs ticket check --json
    - node tools/context/ctx.mjs pack check --json
    - node tools/context/ctx.mjs pack status pack.repo-context-public-release-2026-07-01 --json
    - make validate
    - make smoke
  smoke: []
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-07T10:41:25-0600
---

# Harden Publication Readiness Docs

## Outcome

Make the public README and package metadata more credible under outside criticism while preserving explicit stop gates for npm, Cargo, GitHub, owner, and license decisions.

## Context

The project already had public-release README, demo, and safety-audit tickets. This follow-on slice responds to publication-readiness criticism: the README needed clearer purpose/why/setup/config/non-goal framing, and `npm pack --dry-run` showed the package would rely on `.gitignore` fallback while using the taken `repo-context` npm name.

## Positive Rules

- Keep public docs blunt about what works and what is blocked.
- Prefer package metadata that supports a future dry-run review without allowing accidental publishing.
- Record npm and Cargo registry observations as time-sensitive evidence, not permanent claims.

## Negative Rules

- Do not publish to npm, crates.io, or GitHub.
- Do not choose a license on the user's behalf.
- Do not claim Cargo readiness without a `Cargo.toml` and crate-shape decision.
- Stop and escalate before any paid infrastructure or external publication action.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.public-docs-match-implemented-behavior`: Public copy must be backed by implemented commands, docs, or examples.
- `axiom.no-paid-infra-without-cost-estimate`: Any paid infrastructure or hosted deployment change requires a surfaced cost estimate before implementation.

## Frozen Decisions

- Decision: rename the local package metadata to `ctx-aide`, but keep `private: true`.
- Rationale: `repo-context` is taken on npm by an unrelated package, while `ctx-aide` is the existing package-facing public name.
- Decision: document Cargo publication as blocked instead of adding a Rust crate in this slice.
- Rationale: publishing to crates.io requires a separate crate-shape decision, not just README copy.

## Implementation Rules

- Required approach: update README top-level public explanation, add a context-scanned publication readiness note, constrain npm package payload with `files`, update package lock metadata, and keep the public-release pack truthful.
- Existing components/helpers to use: `ctx` checks, `npm pack --dry-run`, npm registry checks, Cargo search, and the public-release pack.
- Anti-patterns to avoid: overclaiming publish readiness, packaging the entire ticket history by accident, or hiding unresolved license/Cargo blockers.
- Stop and escalate if: publication requires legal, registry-owner, or crate-architecture decisions.

## Scope

- In: README framing, package metadata, package payload allowlist, publication readiness context note, public-release pack metadata.
- Out: real npm publish, real crates.io publish, public GitHub launch, license selection, Rust crate implementation, paid infrastructure.

## Acceptance Criteria

- README answers purpose, why, what it does, what it is not, setup, configuration, proof surfaces, and publication status.
- `package.json` uses `ctx-aide`, preserves `private: true`, and constrains the npm package payload with explicit `files`.
- Publication readiness docs state npm, Cargo, license, and GitHub blockers without implying they are complete.
- Public-release pack includes this completed follow-on ticket and still records the launch blockers.

## Validation

- Automated: frontmatter commands.
- Smoke: inspect `npm pack --dry-run --json` output for a bounded package payload.
- Screenshots: none.

## Implementation Notes

The registry observations were checked on 2026-07-07 and can change. A publishing ticket must repeat them immediately before claiming availability or publishing.

Registry observation evidence for this slice: `npm view ctx-aide name version description --json` returned npm 404, `npm view repo-context name version description --json` returned an unrelated `repo-context@1.0.0`, `cargo search ctx-aide --limit 5` returned no matches, and `cargo search repo-context --limit 5` returned related but non-identical crates.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: README, package metadata, package payload boundaries, publication readiness context note, and public-release pack were updated; package and repo validation commands passed on 2026-07-07.
- Follow-up tickets: license selection, Cargo crate-shape decision, and final GitHub launch remain blocked under `ticket.context.044`.
