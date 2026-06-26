---
id: ticket.context.007
status: draft
title: Add canonical ticket statuses and ticket packs
phase: 3
depends_on:
  - ticket.context.005
---

# Add Canonical Ticket Statuses and Ticket Packs

## Goal

Introduce a canonical ticket template, fixed ticket statuses, and ticket packs that usually represent milestones and sometimes span multiple milestones.

## Scope

- Add `docs/tickets/templates/canonical-ticket.md`.
- Add `docs/ticket-packs/` structure.
- Add pack frontmatter and markdown template.
- Add fixed ticket and pack status vocabularies.
- Add ticket pack membership fields to every generated ticket.
- Add pack-level parallel groups and validation sections.
- Add `ctx pack check --json`.

## Acceptance Criteria

- Every ticket has a valid status, ticket pack, milestone, parallel group, validation plan, and completion metadata.
- Ticket statuses distinguish draft, question, hardening, ready, in-progress, blocked, review, done, and superseded states.
- Ticket packs can contain tickets from one or more milestones.
- Ticket packs explicitly describe parallel groups, dependencies, shared-file coordination, and pack-level validation.
- `ctx lint` fails when tickets or packs drift from the canonical templates.

## Verification

- Create one sample pack with at least three tickets.
- Include two tickets that can run in parallel and one dependent ticket.
- Run `ctx ticket check --json` and `ctx pack check --json`.
- Confirm a ticket cannot be marked `done` without commit and verification evidence.

## Commit

One commit when complete: `Add canonical ticket packs and statuses`
