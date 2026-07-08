---
id: ticket.context.074
status: ready
title: Score tasks for skill fit
ticket_pack: pack.ctx-aide-repo-skill-task-discovery-2026-07-08
milestones:
  - milestone.ctx-aide-repo-skill-task-discovery
source_spec: spec.repo-skill-task-discovery-2026-07-08
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: scoring
depends_on:
  - ticket.context.073
blocks:
  - ticket.context.075
  - ticket.context.077
scope:
  routes: []
  files:
    - tools/ctx-aide/ctx-aide.mjs
    - tools/ctx-aide/ctx-aide.test.mjs
    - tools/ctx-aide/command-catalog.mjs
    - README.md
  directories:
    - docs/tickets
    - docs/ticket-packs
    - docs/future-work
    - docs/workflows
    - skills
  components: []
  flows:
    - flow.ctx-aide-dogfood
context_query:
  task: "identify tasks that should use or become repo-local skills"
  generated_at: 2026-07-08
  context_ids:
    - spec.repo-skill-task-discovery-2026-07-08
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.capability-policy-deny-wins
validation:
  automated:
    - node --check tools/ctx-aide/ctx-aide.mjs
    - node tools/ctx-aide/ctx-aide.test.mjs
    - node tools/ctx-aide/ctx-aide.mjs skills candidates --repo . --from tickets,workflows,future-work --json
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Score Tasks For Skill Fit

## Outcome

`ctxa skills candidates` scans bounded repo-local work sources and returns explainable recommendations for existing skill use and new skill creation candidates.

## Context

Skill-worthy work is usually repeated, multi-step, validation-heavy, and specific enough to benefit from durable instructions. One-off product decisions, unclear tickets, and secret-bearing workflows should not become skills.

## Positive Rules

- Preserve source evidence with relative paths, ids, and short excerpts or summaries.
- Prefer explainable score factors over opaque confidence.
- Reuse repo-local skill inventory from `ticket.context.073`.

## Negative Rules

- Do not generate or write skill files in this ticket.
- Do not paste long source bodies or secrets into candidate output.
- Do not recommend a denied skill as usable without showing the policy decision.

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.
- `axiom.capability-policy-deny-wins`: Deny entries override allow entries at every policy level.

## Frozen Decisions

- Decision: score factors include repeatability, repo specificity, multi-step procedure, validation value, evidence count, risk level, existing skill fit, and materialization readiness.
- Rationale: these fields explain why the task should use an existing skill or become a new one.
- Decision: output separates `recommended_existing_skills` from `new_skill_candidates`.
- Rationale: "use a skill" and "make a skill" have different risk and review gates.
- Cost delta: `$0/month`.

## Implementation Rules

- Required approach: scan ticket, pack, workflow, and future-work markdown by default; support `--from` to restrict sources; use Semble only when `--discover` is explicitly supplied.
- Existing components/helpers to use: repo skill inventory, markdown validators/parsers, discovery helpers, policy resolver, and command catalog.
- Anti-patterns to avoid: hidden prompts, broad git history mining, machine-wide memory lookup, and unbounded snippets.
- Stop and escalate if: scoring requires product-specific heuristics that should live in target-repo config.

## Scope

- In: dry-run candidate scoring, evidence envelopes, score factors, policy-aware existing-skill recommendations, tests, README snippets.
- Out: writing candidate markdown, creating tickets, and writing `skills/` files.

## Acceptance Criteria

- `ctxa skills candidates --repo . --from tickets,workflows,future-work --json` returns bounded candidate arrays and deterministic score fields.
- Tasks that match an existing repo-local skill include `recommended_existing_skills`.
- Repeated, procedural tasks without a matching skill include `new_skill_candidates`.
- One-off, unclear, blocked, or secret-bearing tasks are rejected or flagged `needs-review` with reasons.
- Denied capabilities remain visible in output and never appear as silently approved.

## Validation

- Automated: frontmatter commands.
- Smoke: run candidates against this repo and a fixture with repeated task patterns.
- Screenshots: none.

## Implementation Notes

Keep thresholds configurable later, but hard-code conservative defaults for the first slice.

## Completion

- Status: ready
- Commit: pending
- Verification evidence: pending.
- Follow-up tickets: `ticket.context.075`, `ticket.context.077`.
