---
name: repo-context
description: Plan, harden, and execute repo-local product context workflows for coding agents. Use when creating or updating markdown specs, ticket packs, atomic implementation tickets, Codex/Claude/Cursor agent context, component/design context, feedback records, or a repo-local ctx CLI/tooling flow.
---

# Repo Context

Use this skill to turn rough product or implementation intent into a hardened repo-local markdown workflow that Codex can implement without making product, design, architecture, or security decisions.

## Core Contract

- Markdown is source of truth.
- SQLite indexes and generated agent packs are rebuildable artifacts.
- Specs come before tickets.
- Tickets belong to ticket packs.
- Tickets must be atomic, parallelizable where practical, and committed individually when complete.
- Codex is the default implementation agent.
- Claude is preferred for UI design, product-flow, copy, and visual hardening passes.

## Workflow

1. Capture the request as a draft spec under `docs/specs/` when the work is non-trivial.
2. Query or inspect repo-local context for affected routes, files, directories, components, flows, design rules, architecture notes, and feedback.
3. Ask targeted questions only when the answer changes implementation behavior.
4. Harden the spec through architecture, design, security, best-practices, testing, and parallelization lenses.
5. Freeze resolved decisions in the spec.
6. Create or update a ticket pack under `docs/ticket-packs/`.
7. Create atomic tickets from the hardened spec using the canonical ticket template.
8. Harden each ticket until it can be implemented by Codex without design decisions.
9. During implementation, stop and escalate if the ticket needs new product/design/architecture/security decisions.
10. Validate with the ticket's automated checks, smoke tests, and screenshots, then record commit and evidence.

## Status Rules

Use only these ticket statuses:

- `draft`
- `needs-questions`
- `needs-hardening`
- `ready`
- `in-progress`
- `blocked`
- `needs-review`
- `done`
- `superseded`

Only `ready` tickets may be assigned for implementation. A `done` ticket must have a commit hash and verification evidence.

Use only these pack statuses:

- `draft`
- `ready`
- `active`
- `blocked`
- `done`
- `superseded`

## Hardening Lenses

- Architecture: ownership, boundaries, data flow, dependency direction, migrations, rollback.
- Design: components, tokens, responsive behavior, loading/error/empty states, anti-patterns.
- Security: auth, authorization, secrets, injection, logging, privacy, abuse cases.
- Best practices: framework idioms, performance, accessibility, observability, error handling.
- Testing: unit/component/e2e coverage, smoke tests, screenshots, regression checks.
- Parallelization: independent lanes, shared-file conflicts, dependency ordering, worktree suitability.

## Templates

Use the repo templates when available:

- `docs/tickets/templates/canonical-ticket.md`
- `docs/ticket-packs/templates/ticket-pack.md`

If this skill is installed outside this repo, copy the bundled assets from `assets/` into the target repo.

## CLI Behavior

If a `ctx` CLI exists in the target repo, prefer it:

```sh
ctx scan --json
ctx query --path <path> --task "<task>" --agent codex --budget 6000 --json
ctx spec harden docs/specs/SPEC.md --json
ctx ticket harden docs/tickets/draft/TICKET.md --json
ctx pack check --json
```

If the CLI does not exist yet, do the same checks manually from markdown and note that automated context checks were not available.

