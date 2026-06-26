---
name: repo-context
description: Plan, harden, and execute repo-local product context workflows for coding agents. Use when creating or updating markdown specs, ticket packs, atomic implementation tickets, Codex/Claude/Cursor agent context, component/design context, feedback records, or a repo-local ctx CLI/tooling flow.
---

# Repo Context

Use this skill to turn rough product or implementation intent into a hardened repo-local markdown workflow that Codex can implement without making product, design, architecture, or security decisions.

## Core Contract

- Markdown is source of truth.
- SQLite indexes and generated agent packs are rebuildable artifacts.
- Markdown is loaded progressively; detailed files should not enter agent context unless selected by scope/query or explicitly requested.
- Files with first-line `<!-- repo-context: ignore -->` or frontmatter `context_scan: false` must be excluded from scans and generated agent context.
- Preserve rule polarity: positive rules describe what to prefer or preserve; negative rules describe what to avoid or escalate before doing.
- Prefer enforceable axioms over prose-only rules whenever a deterministic check can prove the rule.
- Specs come before tickets.
- Tickets belong to ticket packs.
- Tickets must be atomic, parallelizable where practical, and committed individually when complete.
- Long milestone-level work should run through explicit pack runs with worktrees, agent leases, heartbeats, stale-agent cleanup, merge queues, and pack-level validation.
- Capture non-blocking future work as explicit future-work markdown, then promote it later into a spec, ticket pack, or ticket.
- Codex is the default implementation agent.
- Claude is preferred for UI design, product-flow, copy, and visual hardening passes.

## Workflow

1. Capture the request as a draft spec under `docs/specs/` when the work is non-trivial.
2. Query or inspect repo-local context for affected routes, files, directories, components, flows, design rules, architecture notes, and feedback.
3. Ask targeted questions only when the answer changes implementation behavior.
4. Harden the spec through architecture, design, security, best-practices, testing, and parallelization lenses.
5. Freeze resolved decisions in the spec.
6. Capture non-blocking later ideas under `docs/future-work/captured/`.
7. Create or update a ticket pack under `docs/ticket-packs/`.
8. Create atomic tickets from the hardened spec using the canonical ticket template.
9. Harden each ticket until it can be implemented by Codex without design decisions.
10. For long or parallel milestones, create a milestone run that assigns tickets to worktrees with leases and heartbeat expectations.
11. During implementation, stop and escalate if the ticket needs new product/design/architecture/security decisions.
12. Validate with the ticket's automated checks, smoke tests, and screenshots, then record commit and evidence.
13. Merge through the coordinator queue and run pack-level validation before marking the pack done.

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

## Positive and Negative Rules

When hydrating specs, tickets, or agent packs, keep positive and negative rules separate.

- Positive rules: preserve, prefer, reuse, continue, follow.
- Negative rules: do not, avoid, never, stop and escalate, supersede only with explicit decision.

Do not flatten negative rules into generic guidance. If implementation appears to require violating a negative rule, stop and harden the ticket unless the ticket explicitly supersedes the rule.

## Axioms

Use axioms for programmatically enforceable rules. Each axiom needs a stable id, statement, check command or assertion name, and severity. Tickets should list the axioms they depend on. If a rule cannot be checked, keep it as a positive or negative rule and create a follow-up to make it enforceable.

## Long Runs

For milestone-level runs, track:

- pack id and run id
- active tickets and assigned agents
- worktree and branch per agent
- lease expiry and last heartbeat
- stale or dead agents
- cleanup and requeue actions
- merge queue
- pack-level validation state

Stale work should be inspected before deletion. Salvage commits or patches when useful, then record whether the ticket was completed, requeued, blocked, or abandoned.

## Future Customization

Post-v0.1, support agent-guided workflow customization. Keep the default profile conservative. Customization may recommend profiles such as `minimal`, `web-app`, `ui-heavy`, `idvisor-orchestrated`, or `strict`, but it must not disable required axioms or silently weaken readiness gates.

When asked about customization before the CLI exists, document the desired profile/toggles in a future ticket rather than inventing hidden behavior.

## Future Work

Use future-work files for non-blocking ideas. Capture first, then promote later. A future-work item should include the idea, why it is later, questions before promotion, and promotion notes. Do not bury future work in the current ticket unless it directly changes implementation.

## Templates

Use the repo templates when available:

- `docs/tickets/templates/canonical-ticket.md`
- `docs/ticket-packs/templates/ticket-pack.md`

If this skill is installed outside this repo, copy the bundled assets from `assets/` into the target repo.

## CLI Behavior

If a `ctx` CLI exists in the target repo, prefer it:

```sh
node tools/context/ctx.mjs lint --json
node tools/context/ctx.mjs future check --json
node tools/context/ctx.mjs discover --backend semble --task "<task>" --repo . --json
ctx scan --json
ctx query --path <path> --task "<task>" --agent codex --budget 6000 --json
ctx spec harden docs/specs/SPEC.md --json
ctx ticket harden docs/tickets/draft/TICKET.md --json
ctx pack check --json
```

If the CLI does not exist yet, do the same checks manually from markdown and note that automated context checks were not available.
