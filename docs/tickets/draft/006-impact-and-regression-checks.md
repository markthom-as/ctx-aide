---
id: ticket.context.006
status: draft
title: Add impact and regression checks
phase: 4
depends_on:
  - ticket.context.002
  - ticket.context.004
  - ticket.context.005
---

# Add Impact and Regression Checks

## Goal

Use repo-local context to show what routes, components, flows, feedback, and design rules are affected by a proposed change.

## Scope

- Add `ctx impact --path <file> --json`.
- Add `ctx changed-context --base main --json`.
- Add PR or ticket summary generation listing affected context ids.
- Add CI checks for stale generated context and malformed entries.
- Optionally add visual snapshot checks for component catalog examples.

## Acceptance Criteria

- Impact output is bounded and parseable.
- Changed files map to affected routes, components, flows, and feedback.
- CI can fail on malformed or stale context without requiring network access.
- PR summaries can list context ids reviewers should inspect.

## Verification

- Test impact output for route, shared component, and design-token changes.
- Run changed-context against a synthetic branch.
- Confirm CI command works from a clean checkout.

## Commit

One commit when complete: `Add context impact checks`
