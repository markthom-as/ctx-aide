---
id: spec.adoption-capability-policy-propagation-2026-06-27
status: done
title: Adoption Capability Policy Propagation
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-27
---

# Adoption Capability Policy Propagation

## Goal

Make capability allow/deny policy travel through target-repo adoption, generated tickets, and implementation plans so production-code agents get usable tool/skill boundaries by default.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, `README.md`.
- Components: none.
- Flows: `flow.ctx-aide-dogfood`.
- Design-system areas: none.

## Existing Context

- `ctx-aide tools list/policy/check` can resolve global and workflow-step capability policy.
- `ctx-aide adoption bootstrap` currently writes target profile config and context directories, but not target capability policy.
- `ctx-aide adoption implementation-plan` currently returns context entries, target paths, validation commands, and stop conditions, but not policy guidance.

## Product Decisions

- Decision: adoption bootstrap should seed a target `docs/config/ctx-aide.tools.json` policy unless it already exists.
- Rationale: agents using ctx-aide in a production repo should not need to remember an extra source-repo command to learn allowed tools and skills.
- Regression risk: target repos may accidentally inherit a policy that is too restrictive for custom workflows.

## Architecture Decisions

- Decision: reuse the existing policy resolver and config shape for target repos.
- Rationale: one policy model should drive source-repo checks, target bootstrap, generated tickets, and implementation plans.
- Rejected alternatives: storing tool policy only in generated ticket prose, because that cannot be linted or reused.

## Design Decisions

- Decision: generated tickets can opt into `capability_policy.workflow` and `capability_policy.step` metadata.
- Components/tokens to use: existing markdown ticket frontmatter and JSON implementation-plan output.
- Anti-patterns to avoid: implicit policy lookup with no ticket-visible workflow/step identity.

## Security and Privacy Decisions

- Data touched: capability ids and repo-local policy only.
- Trust boundaries: target repos may have connector-sensitive workflows, shell access, or paid deployment capabilities.
- Required safeguards: policy output must not include secrets; deny-wins behavior must remain visible in implementation-plan output.

## Open Questions

None for this implementation.

## Hardening Review

- Architecture: keep bootstrap policy file separate from profile config and use the same resolver for implementation-plan.
- Design: generated tickets should show the workflow/step identity and command to re-check policy.
- Security: default target policy denies high-risk connectors and desktop control unless a target repo edits policy deliberately.
- Best practices: adoption status should report whether tools policy exists and validates.
- Testing: fixture adoption flow should cover bootstrap write, status, generated ticket metadata, implementation-plan policy output, and Astrotechne-style pack tickets.
- Parallelization: implementation is sequential because the CLI and fixture test overlap.

## Ticket Plan

- Independent tickets: bootstrap/status policy adoption and implementation-plan propagation are conceptually separate.
- Sequential tickets: implementation-plan propagation depends on target policy files existing in bootstrap fixtures.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `tools/ctx-aide/ctx-aide.test.mjs`, and `README.md`.
