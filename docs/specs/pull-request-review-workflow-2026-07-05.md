---
id: spec.pull-request-review-workflow-2026-07-05
status: done
title: Pull Request Review Workflow
owner_agent: codex-high-effort
source_feedback: []
context_ids:
  - flow.ctx-aide-dogfood
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-07-05
---

# Pull Request Review Workflow

## Goal

Add a first-class workflow for agents to review GitHub pull requests with `git` and `gh`, leave feedback, make scoped fix commits, push them to the PR branch, and merge only after validation and review gates pass.

## Affected Surfaces

- Routes: none.
- Files/directories: `tools/ctx-aide/ctx-aide.mjs`, `docs/workflows/`, `docs/config/ctx-aide.tools.json`, `docs/specs/`, `docs/tickets/`, `docs/ticket-packs/`, and `README.md`.
- Components: none.
- Flows: ctx-aide dogfood, ticket completion, feedback review.
- Design-system areas: none.

## Existing Context

- Workflow markdown files are validated by `ctx-aide lint`.
- Tool policy can resolve workflow and step-level capability decisions.
- Feedback review already defines how agent review feedback becomes ticket acceptance criteria or follow-up tickets.
- Tickets remain the source of truth for scoped fixes and completion metadata.

## Product Decisions

- Decision: PR review is an explicit workflow, not an informal agent habit.
- Rationale: reviewing, commenting, fixing, pushing, and merging are high-impact steps that need durable gates and command-level evidence.
- Regression risk: without a workflow, agents may skip comment/fix/merge boundaries or merge before checks and reviews are settled.

## Architecture Decisions

- Decision: model `git` and `github-cli` as workflow dependencies.
- Rationale: `ctx-aide workflow deps` should prove whether the local command surface exists before an agent attempts PR work.
- Rejected alternatives: using the GitHub connector as the default PR mutation path, or leaving `gh` availability as prose-only guidance.

## Design Decisions

- Decision: no UI is added in this slice.
- Components/tokens to use: none.
- Anti-patterns to avoid: broad review dashboards, hosted services, and hidden connector state.

## Security and Privacy Decisions

- Data touched: local git metadata, PR metadata, review comments, validation output, and ticket completion metadata.
- Trust boundaries: local repository state, authenticated `gh` session, and GitHub PR state.
- Required safeguards: check `gh auth status` before mutation, do not stage unrelated changes, do not merge failing checks unless the ticket records an accepted exception, and surface cost deltas for infrastructure changes.

## Open Questions

None.

## Hardening Review

- Architecture: dependency catalog keeps command checks deterministic and the workflow remains markdown-first.
- Design: not applicable.
- Security: mutation gates require explicit authenticated CLI state and local worktree hygiene.
- Best practices: review feedback is severity-ordered, line-grounded when possible, and separated from fix commits.
- Testing: lint, workflow dependency check, tools policy checks, and existing test suite cover the added surfaces.
- Parallelization: single shared workflow/config/code slice; future PR-specific fix commits can remain ticket-sized and parallelizable by file ownership.

## Ticket Plan

- Independent tickets: `ticket.context.049`.
- Sequential tickets: none.
- Shared files that require coordination: `tools/ctx-aide/ctx-aide.mjs`, `docs/config/ctx-aide.tools.json`, `README.md`, and workflow docs.
