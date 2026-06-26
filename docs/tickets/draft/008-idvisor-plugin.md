---
id: ticket.context.008
status: draft
title: Define Idvisor repo-context plugin integration
phase: 5
depends_on:
  - ticket.context.002
  - ticket.context.003
  - ticket.context.005
  - ticket.context.007
---

# Define Idvisor Repo-Context Plugin Integration

## Goal

Define how the repo-context system can run as an Idvisor plugin or workflow pack while keeping markdown context local to the target application repo.

## Scope

- Define repo-context plugin responsibilities versus repo-local `ctx` responsibilities.
- Add Idvisor workflow template: describe, spec, questions, harden, tickets, ticket harden, implementation, validation, progress report.
- Define plugin commands for init, scan, spec harden, pack create, pack status, and dispatch.
- Define Idvisor gates for question resolution, UI audit, ticket readiness, commit evidence, and pack validation.
- Define how Codex and Claude harnesses are selected for planning, UI audit, and implementation steps.
- Define event/progress-report expectations without making Idvisor depend on a specific app repo.

## Acceptance Criteria

- The plugin treats markdown in the target repo as source of truth.
- Idvisor records workflow runs, gates, progress reports, and audit events but does not replace repo-local context files.
- Initial implementation can shell out to `ctx` as a governed local tool.
- Tickets dispatch only when status is `ready`.
- UI-impacting specs include a Claude-oriented design/audit gate before implementation tickets are marked ready.
- Pack completion requires commit hashes and validation evidence for all included tickets.

## Verification

- Create one sample Idvisor workflow template for a repo-context pack.
- Run the workflow against a fixture repo with one spec, one pack, and two tickets.
- Confirm blocked/question states prevent dispatch.
- Confirm ready tickets can be assigned to Codex implementation runs.

## Commit

One commit when complete: `Define Idvisor repo context plugin`
