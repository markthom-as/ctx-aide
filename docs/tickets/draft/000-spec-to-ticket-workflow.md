---
id: ticket.context.000
status: draft
title: Define high-effort spec to ticket workflow
phase: 0
---

# Define High-Effort Spec to Ticket Workflow

## Goal

Make the user's preferred workflow explicit: describe the goal, build a markdown spec, ask targeted questions, harden the spec through multiple review lenses, then create full-fat atomic tickets that Codex can execute without making design decisions.

## Scope

- Add `docs/specs/` conventions.
- Add spec frontmatter and section templates.
- Add question-pass rules.
- Add architecture, design, security, best-practices, testing, and parallelization hardening checklists.
- Define when a ticket is ready for Codex implementation.
- Define Codex and Claude planning roles, with Claude preferred for UI design and audit passes.
- Define when an implementation agent must stop and escalate.

## Acceptance Criteria

- A spec can distinguish assumptions, frozen decisions, open questions, and blockers.
- Question passes only ask about gaps that change implementation behavior.
- Hardening passes produce concrete edits to the spec, not generic review notes.
- Tickets generated from a hardened spec include context, frozen decisions, implementation rules, acceptance criteria, validation steps, screenshot or smoke-test requirements, and commit expectations.
- Specs support both Codex and Claude hardening passes, with Claude-oriented UI review captured before tickets are marked ready.
- Tickets are labeled for parallel execution where possible.
- Tickets that still require product, design, architecture, or security decisions are not considered ready.

## Verification

- Create one sample spec from rough feedback.
- Run the hardening checklist against it.
- Generate at least two atomic tickets from the spec.
- Confirm one ticket can be implemented without making design decisions.

## Commit

One commit when complete: `Define spec to ticket workflow`
