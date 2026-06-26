---
id: ticket.context.005
status: draft
title: Hydrate markdown tickets with scoped context
phase: 3
depends_on:
  - ticket.context.002
---

# Hydrate Markdown Tickets with Scoped Context

## Goal

Ensure every implementation ticket starts with the relevant route, file, component, flow, feedback, design, and architecture context.

## Scope

- Add `ctx ticket create --from-feedback <id> --json`.
- Add `ctx ticket hydrate <ticket-path> --agent codex --json`.
- Add ticket frontmatter fields for context queries and context ids.
- Add `ctx ticket check --json`.
- Update ticket templates.

## Acceptance Criteria

- Tickets include a context snapshot generated from `ctx query`.
- Tickets preserve source context ids rather than pasting untraceable prose only.
- Ticket check fails when a ticket lacks context or references stale context ids.
- Resolved feedback can be linked to completed tickets.
- Completion section records the final commit hash.

## Verification

- Create a ticket from example feedback.
- Hydrate it with route/component/design context.
- Run ticket check before and after marking completion.

## Commit

One commit when complete: `Hydrate tickets with repo context`
