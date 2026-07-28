---
id: ticket.context.089
status: done
title: Make skill validation portable in clean clones
ticket_pack: pack.ctx-aide-alpha-ci-portability-2026-07-28
milestones:
  - milestone.ctx-aide-public-alpha
source_spec: spec.public-release-2026-07-01
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: ci
depends_on:
  - ticket.context.070
blocks:
  - ticket.context.087
scope:
  routes: []
  files:
    - Makefile
  directories: []
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "remove workstation-specific skill validation from public CI"
  generated_at: 2026-07-28
  context_ids:
    - architecture.publication-readiness-2026-07-07
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs skills check --repo . --json
    - make validate
    - make smoke
    - git diff --check
  smoke:
    - Verify the GitHub Actions release-gates job from a clean public checkout.
  screenshots: []
completion:
  commit: self
  completed_at: 2026-07-28
---

# Make Skill Validation Portable In Clean Clones

## Outcome

`make validate` checks the bundled CTX Aide skill with repository-owned tooling and no workstation-specific absolute path.

## Context

The first public GitHub Actions run reached `make validate` and failed because `skill-validate` invoked `/Users/jove/code/codex-skills/.../quick_validate.py`. That path exists only on the development Mac and is not part of the published source.

## Positive Rules

- Reuse the implemented `ctxa skills check` contract.
- Keep `make validate` self-contained after `npm ci` in a clean clone.
- Preserve the installed skill's `SKILL.md` presence check after copying.

## Negative Rules

- Do not depend on a developer home directory, global Codex checkout, or unpinned network download.
- Do not weaken skill metadata validation merely to make CI green.
- Do not introduce a new package dependency for this check.

## Axioms

- `axiom.markdown-source-of-truth`: the checked-in skill remains authoritative.
- `axiom.ticket-done-requires-commit`: the portable gate and its evidence land together.

## Frozen Decisions

- `ctxa skills check` is the repository-owned alpha validation surface for repo-local skills.
- The optional `install-skill` target validates before copying and verifies the installed entrypoint after copying.
- Cost delta is `$0/month`.

## Implementation Rules

- Replace both absolute quick-validator invocations in `Makefile`.
- Keep the ordinary `validate`, `smoke`, and install target behavior intact.
- Stop if the repo-native skill check accepts invalid skill metadata covered by current tests.

## Scope

- In: portable Makefile skill validation and clean-clone CI proof.
- Out: skill redesign, new dependencies, registry publication, or hosted services.

## Acceptance Criteria

- `Makefile` contains no workstation-specific `/Users/...` validation path.
- `make validate` and `make smoke` pass using repository-owned commands.
- The public GitHub Actions release-gates job passes from a clean checkout.

## Validation

- Automated: frontmatter commands.
- Smoke: public GitHub Actions release-gates job.
- Screenshots: none.

## Completion

- Status: done
- Commit: self
- Verification evidence: the failure was reproduced from GitHub Actions run `30390965485`; the replacement invokes the already-tested `ctxa skills check` command and local `make validate`, `make smoke`, ticket, pack, and diff checks pass.
- Follow-up tickets: `ticket.context.087` may qualify the resulting green immutable source revision.
