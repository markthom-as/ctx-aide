---
id: ticket.context.048
status: done
title: Document and smoke the install-to-setup path
ticket_pack: pack.user-friendly-adoption-onboarding-2026-07-05
milestones:
  - milestone.user-friendly-adoption-onboarding
source_spec: spec.user-friendly-adoption-onboarding-2026-07-05
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: docs-proof
depends_on:
  - ticket.context.045
  - ticket.context.046
  - ticket.context.047
blocks: []
scope:
  routes: []
  files:
    - README.md
    - docs/workflows/astrotechne-adoption.md
    - docs/ticket-packs/active/user-friendly-adoption-onboarding-2026-07-05.md
  directories:
    - examples
  components: []
  flows:
    - workflow.astrotechne-adoption
context_query:
  task: "document and smoke install to setup onboarding path"
  generated_at: 2026-07-05
  context_ids:
    - workflow.astrotechne-adoption
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - node tools/ctx-aide/ctx-aide.mjs spec check --json
    - node tools/ctx-aide/ctx-aide.mjs ticket check --json
    - node tools/ctx-aide/ctx-aide.mjs pack check --json
    - make validate
  smoke:
    - .ctx-aide/install/bin/ctxa --help
    - .ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json
    - .ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne-engine --profile auto --no-input --json
  screenshots: []
completion:
  commit: current-change
  completed_at: 2026-07-08T02:55:00Z
---

# Document And Smoke The Install-To-Setup Path

## Outcome

Close the onboarding pack with outside-reader documentation and verified smoke output for installing `ctx-aide` and setting up Astrotechne repos.

## Context

The implementation tickets add packaging, setup, and profile behavior. This ticket makes the user path discoverable and proves it works against the intended Astrotechne repos without writing production-code changes.

## Positive Rules

- Document the shortest happy path first.
- Show dry-run/no-input commands for agents and setup/write commands for humans.
- Keep registry publishing clearly out of scope until public-release blockers are resolved.

## Negative Rules

- Do not claim npm registry availability unless it exists.
- Do not mark the pack complete without smoke evidence.
- Do not write to Astrotechne target repos as part of documentation smoke unless explicitly required and isolated in a separate commit.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision: README should present `ctxa setup` as the first adoption command.
- Rationale: this matches the desired user-friendly process.
- Decision: Astrotechne workflow docs should keep advanced low-level commands after the happy path.
- Rationale: the low-level commands remain useful for agents and troubleshooting.

## Implementation Rules

- Required approach: update docs after implementation behavior exists, run smoke commands, and update pack completion metadata.
- Existing components/helpers to use: README adoption sections, `docs/workflows/astrotechne-adoption.md`, and pack closeout format.
- Anti-patterns to avoid: aspirational docs without command proof, hidden target writes, and stale command examples.
- Stop and escalate if: smoke requires global install mutation that cannot be performed safely on this machine.

## Scope

- In: README install/setup docs, Astrotechne workflow docs, smoke proof, and pack completion metadata.
- Out: npm publish, GitHub launch, paid infrastructure, and target repo production-code changes.

## Acceptance Criteria

- README has a concise install-and-setup section.
- Astrotechne adoption workflow starts with the new setup path.
- Smoke commands prove the installed or linked `ctxa` command can run setup for web and engine targets in no-input JSON mode.
- Pack completion metadata lists final validation evidence.

## Validation

- Automated: frontmatter commands.
- Smoke: frontmatter commands. The Astrotechne setup smoke commands are expected to exit nonzero when missing bootstrap files produce planned writes in `--no-input` dry-run mode; the required artifact is parseable JSON with the correct profile, planned changes, and no target writes.
- Screenshots: none.

## Implementation Notes

If global linking is not appropriate during validation, use `npm exec -- <command>` or the package-local bin path and document the exact proof.

Audit note: this ticket is correctly detailed but must stay after `ticket.context.046` and `ticket.context.047`; do not implement docs before the setup command and split profiles exist.

## Completion

- Status: done
- Commit: current-change
- Verification evidence: `node tools/ctx-aide/ctx-aide.mjs spec check --json`, `node tools/ctx-aide/ctx-aide.mjs ticket check --json`, `node tools/ctx-aide/ctx-aide.mjs pack check --json`, and `make validate` passed. `.ctx-aide/install/bin/ctxa --help` passed. `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json` returned expected non-mutating setup JSON for profile `astrotechne-web`. `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne-engine --profile auto --no-input --json` returned expected non-mutating setup JSON for profile `astrotechne-engine`.
- Follow-up tickets: registry publishing can be a later public-release ticket after owner/license decisions.
