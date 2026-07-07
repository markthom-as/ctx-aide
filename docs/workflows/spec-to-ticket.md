---
id: workflow.spec-to-ticket
status: active
title: Spec to Ticket Workflow
updated: 2026-06-26
---

# Spec to Ticket Workflow

## Purpose

Turn rough implementation intent into hardened, atomic tickets that can be executed without product, design, architecture, or security decisions during implementation.

## Stages

1. Describe the desired outcome, affected surfaces, constraints, and non-goals.
2. Draft a spec under `docs/specs/` from `docs/specs/templates/spec.md`.
3. Query repo context for affected routes, files, directories, components, flows, design notes, architecture notes, and accepted feedback.
4. Ask only questions whose answers change implementation behavior.
5. Harden the spec through architecture, design, security, best-practices, testing, and parallelization lenses.
6. Freeze resolved decisions in the spec and leave unresolved implementation-changing questions in `Open Questions`.
7. Create a ticket pack for the milestone-shaped unit of work.
8. Split the spec into atomic tickets, each scoped for one clean commit.
9. Harden tickets until implementation agents can execute without inventing decisions.
10. For visual or artifact-backed work, run the feedback review workflow before closing the ticket.
11. Promote review feedback into tighter acceptance criteria or follow-up tickets.
12. Validate and commit each completed ticket independently.

## Readiness Gates

- A spec is not ticket-ready if it still has implementation-changing open questions.
- A ticket is not implementation-ready unless status is `ready`.
- A ticket is not done unless it records a commit hash and verification evidence.
- A ticket that requires new product, design, architecture, or security decisions returns to hardening.
- A ticket with unresolved operator feedback returns to hardening or produces a follow-up ticket before closeout.

## Parallelization Rules

- Prefer independent parallel groups when tickets touch different files or context surfaces.
- Use a coordinator queue when tickets share README, templates, validators, generated manifests, or skill instructions.
- Record dependencies in frontmatter before dispatch.
- For long milestone runs, use worktrees, leases, heartbeat timestamps, stale-agent cleanup, and pack-level validation.

## Feedback Review

- Use `ctx-aide feedback review` to produce a review packet with ticket status, URL, scoped files, changed files, screenshot path, screenshot byte size, and image dimensions.
- Use `ctx-aide feedback capture --write` to save operator notes under `docs/context/feedback/`.
- Use `ctx-aide feedback promote --mode acceptance-criteria --write` when the feedback should tighten the current ticket.
- Use `ctx-aide feedback promote --mode follow-up-ticket --write` when the feedback is separate work.
- Answer clarifying questions before treating promoted feedback as implementation-ready.

## Validation

- Run `node tools/ctx-aide/ctx-aide.mjs spec check --json` after spec edits.
- Run `node tools/ctx-aide/ctx-aide.mjs ticket check --json` after ticket edits.
- Run `node tools/ctx-aide/ctx-aide.mjs pack check --json` after pack edits.
- Run `node tools/ctx-aide/ctx-aide.mjs feedback review --ticket <ticket> --json` for artifact-backed ticket closeout.
- Run `make validate` before committing workflow changes.
