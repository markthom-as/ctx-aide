---
id: spec.repo-skill-task-discovery-2026-07-08
status: ready
title: Repo Skill Task Discovery And Authoring
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-08
---

# Repo Skill Task Discovery And Authoring

## Goal

Give CTX Aide a repo-local system that identifies backlog, ticket, workflow, and future-work tasks that are a good fit for existing skills or are strong candidates to become new repo-local skills, then guides the agent through ticketed skill creation.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide`, `skills`, `docs/config`, `docs/skill-candidates`, `docs/tickets`, `docs/ticket-packs`, `README.md`.
- Components: none.
- Flows: `flow.ctx-aide-dogfood`, target-repo adoption, implementation planning, skill authoring.
- Design-system areas: none.

## Existing Context

- CTX Aide already has a built-in capability catalog with `skill.*`, `tool.*`, and `app.*` ids.
- Capability policy is repo-local and advisory; it gates planning output without claiming control over the host agent runtime.
- Adoption tickets and implementation plans already carry capability workflow/step metadata.
- `ctxa discover --backend semble` exists for bounded semantic discovery when task files are unknown.
- Repo-local skills live under `skills/<skill-name>/SKILL.md` and should remain explicit, reviewable artifacts.
- Markdown tickets and packs remain the source of truth for work assignment and completion.

## Product Decisions

- Decision: the first version detects both "use an existing skill" and "create a new repo-local skill" opportunities.
- Rationale: agents need immediate guidance for available skills, while repeated repo-specific work should become durable repo-local skill guidance.
- Regression risk: over-eager generation could turn one-off tasks into brittle skills or hide product decisions inside generated instructions.
- Decision: generated skills are never written directly from loose chat intent.
- Rationale: skill authoring changes future agent behavior and needs the same markdown/ticket review discipline as code.
- Regression risk: requiring tickets adds ceremony, but avoids unreviewed agent-instruction drift.
- Decision: the system defaults to dry-run JSON and candidate markdown before mutating `skills/`.
- Rationale: operators and agents can inspect evidence, score, and risk before accepting a skill draft.
- Regression risk: users may expect "make the skill" to be one step; the CLI should show the exact follow-up command.

## Architecture Decisions

- Decision: add a `ctxa skills` command group with `inventory`, `candidates`, `promote`, `materialize`, and `check` subcommands.
- Rationale: skill discovery and authoring are related to capability policy but deserve a distinct workflow surface.
- Rejected alternatives: overloading `ctxa tools`, because tools policy answers authorization, not whether a repo task should use or become a skill.
- Decision: keep candidate records in markdown under `docs/skill-candidates/`.
- Rationale: candidate evidence is reviewable, diffable, and can be promoted into ticket packs without making generated JSON canonical.
- Rejected alternatives: storing candidates only in a cache or SQLite index.
- Decision: score tasks with explicit evidence fields rather than opaque model confidence.
- Rationale: reviewers need to see why a task is skill-worthy, what source markdown supports it, and what risks block generation.
- Rejected alternatives: binary classification or hidden prompts.
- Decision: materialization writes only skill drafts and supporting local templates/scripts/assets declared by the approved ticket.
- Rationale: the first slice should not install global skills, mutate Codex user config, or publish plugin bundles.
- Rejected alternatives: automatic global skill installation, hosted skill registry publication, or connector-backed skill sync.

## Design Decisions

- Decision: candidate output separates `recommended_existing_skills` from `new_skill_candidates`.
- Components/tokens to use: existing CLI JSON conventions, markdown templates, and pack/ticket status vocabulary.
- Anti-patterns to avoid: prose-only recommendations, unbounded source excerpts, hidden memory-derived evidence, and skill generation without validation commands.
- Decision: a candidate can be `candidate`, `needs-review`, `ready-for-ticket`, `rejected`, or `materialized`.
- Components/tokens to use: candidate status field in markdown frontmatter.
- Anti-patterns to avoid: reusing ticket status for candidate state, because candidate review is not implementation progress.

## Security and Privacy Decisions

- Data touched: repo-local markdown, skill manifests, command metadata, bounded source excerpts, and generated skill draft files.
- Trust boundaries: skills may guide agents toward shell tools, browser control, connectors, paid deployment tools, or private repo paths.
- Required safeguards:
  - Do not copy secrets, credentials, personal contact data, or proprietary long-form source text into generated skills.
  - Apply existing capability policy to recommended skills before implementation-plan output.
  - Require explicit ticket approval before writing `skills/<name>/SKILL.md`.
  - Require cost-delta language in any candidate whose validation, deployment, or infrastructure path could spend money.
  - Treat connector-backed or paid-infrastructure skills as high-risk and keep deny-wins policy visible.
- Cost delta: `$0/month` for this system as specified; it uses local markdown and CLI commands only.

## Open Questions

None for the initial implementation. If the user meant "make matching tickets" rather than "make repo-local skills," keep the same discovery layer and change only the `materialize` ticket before implementation.

## Hardening Review

- Architecture: split inventory, scoring, candidate promotion, materialization, and implementation-plan recommendations so each command has a narrow contract.
- Design: make every recommendation explainable with source paths, source task ids, score factors, and next commands.
- Security: keep all writes repo-local, deny connector-sensitive skills by policy, and refuse to materialize candidates with secret-like evidence.
- Best practices: use Semble for behavioral source discovery, exact scans for known markdown fields, and structured frontmatter for review gates.
- Testing: fixture repos should cover existing skills, repeated ticket themes, rejected one-off tasks, paid-infrastructure warnings, secret redaction, and dry-run/write behavior.
- Parallelization: inventory and candidate schema can land before scoring; materialization and implementation-plan recommendations depend on inventory/scoring but can be implemented as separate tickets if shared CLI edits are coordinated.

## Ticket Plan

- Independent tickets:
  - `ticket.context.073`: inventory repo-local skills and validate skill manifests.
- Sequential tickets:
  - `ticket.context.074`: score tasks against existing and proposed skills after inventory exists.
  - `ticket.context.075`: promote reviewed candidates into ticketed skill authoring artifacts after scoring exists.
  - `ticket.context.076`: materialize approved skill drafts after candidate promotion exists.
  - `ticket.context.077`: surface skill recommendations in implementation plans after inventory and scoring exist.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `tools/ctx-aide/command-catalog.mjs`, `README.md`.
