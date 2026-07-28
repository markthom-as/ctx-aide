---
id: ticket.context.067
status: done
title: Decide Cargo distribution posture
ticket_pack: pack.ctx-aide-production-hardening-2026-07-07
milestones:
  - milestone.ctx-aide-production-hardening
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: release-decisions
depends_on: []
blocks:
  - ticket.context.070
scope:
  routes: []
  files:
    - README.md
    - docs/context/architecture/publication-readiness-2026-07-07.md
    - package.json
  directories:
    - crates
    - src
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "decide whether ctx-aide should have a Cargo crate Rust shim Rust implementation or no Cargo target"
  generated_at: 2026-07-07
  context_ids:
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.public-docs-match-implemented-behavior
validation:
  automated:
    - test -f Cargo.toml && cargo package --list || true
    - cargo search ctx-aide --limit 5
    - cargo search ctxa --limit 5
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
  smoke: []
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Decide Cargo Distribution Posture

## Outcome

Decide whether CTX Aide should ship on Cargo as no crate, a Rust shim that invokes the Node CLI, or a real Rust implementation.

## Context

The repository currently has no `Cargo.toml` and no Rust crate. It is runnable through Node/npm only. Claims about Cargo readiness are blocked until this product and architecture decision is explicit.

## Positive Rules

- Keep Cargo claims truthful.
- Prefer no Cargo target if npm is the intended distribution path.
- If a Cargo target is chosen, define its purpose, maintenance cost, and user value before implementation.
- Record registry name checks as time-sensitive observations.

## Negative Rules

- Do not add a placeholder crate solely to satisfy a launch checklist.
- Do not publish a Rust shim that hides a Node runtime dependency without clear docs.
- Do not claim crates.io readiness without `cargo package --list` and `cargo publish --dry-run`.

## Axioms

- `axiom.markdown-source-of-truth`: Cargo posture must be recorded before implementation.
- `axiom.public-docs-match-implemented-behavior`: README must not imply Rust support without a crate.

## Frozen Decisions

- Decision: the alpha has no Cargo target.
- Rationale: CTX Aide is a working Node CLI, Nix can package its immutable
  source directly, and a Rust shim would hide rather than remove the Node
  runtime.
- Decision: a real Rust implementation or explicit shim requires a future
  product/architecture ticket with measurable user value.
- Rationale: crates.io presence is not itself an alpha capability.

## Implementation Rules

- Required approach: write an architecture decision comparing no Cargo target, Rust shim, and Rust implementation; update README/publication readiness; create follow-up implementation tickets only if a Cargo target is chosen.
- Existing components/helpers to use: publication readiness note, package build/install scripts, and registry observation commands.
- Anti-patterns to avoid: drive-by `Cargo.toml`, stale name availability claims, or a shim without runtime/version policy.
- Stop and escalate if: crate ownership, license, support, or implementation language decision is unresolved.

## Scope

- In: Cargo posture decision, docs updates, registry observations, and follow-up ticket creation if needed.
- Out: implementing a crate, crates.io publish, rewriting the CLI in Rust, and npm publication.

## Acceptance Criteria

- A markdown decision states one of: no Cargo package, Rust shim, or Rust implementation.
- README and publication readiness docs match the decision.
- If no Cargo package is chosen, Cargo publish checklists are removed or explicitly marked non-goals.
- If a Cargo package is chosen, follow-up tickets define `Cargo.toml`, packaging, tests, and dry-run publish proof.
- If no Cargo package is chosen, `ticket.context.070` can proceed with Cargo explicitly documented as a non-goal rather than a blocker.

## Validation

- Automated: frontmatter commands.
- Smoke: none.
- Screenshots: none.

## Implementation Notes

This ticket needs a user/owner answer before implementation. The safest default remains "no Cargo target" until contradicted.

## Completion

- Status: done.
- Commit: self; resolve with post-commit ticket validation.
- Verification evidence: README, publication readiness, launch gate, and pack
  status consistently record no Cargo target for alpha; no Cargo.toml or Rust
  shim was added.
- Follow-up tickets: none for alpha; a future Cargo implementation requires a
  new product/architecture ticket.
