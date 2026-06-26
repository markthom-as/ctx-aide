# Agent Instructions

This repo defines a repo-local context system for coding agents. Markdown is the source of truth; generated SQLite indexes and agent packs are cache/build artifacts.

## Workflow

- Use markdown specs, tickets, and ticket packs for all implementation planning.
- Prefer high-effort planning before implementation: describe, draft spec, ask targeted questions, harden, create tickets, harden tickets, then implement.
- Keep tickets atomic and parallelizable when possible.
- Each completed ticket should have one clean commit.
- Tickets are not implementation-ready until status is `ready`.
- Codex is the default implementation agent.
- Claude is preferred for UI design critique, product-flow review, copy tone, and visual hardening.
- Prefer enforceable axioms over prose-only rules when a deterministic check can prove the rule.
- Use Semble-backed discovery when a task is behavioral and target files are unknown.

## Ticket Readiness

A ready ticket must include:

- `ticket_pack`, `milestones`, `parallel_group`, dependencies, and scope.
- Frozen product/design/architecture/security decisions.
- Implementation rules and stop/escalation conditions.
- Acceptance criteria.
- Automated checks, smoke tests, and screenshots where applicable.
- Completion metadata with commit and verification evidence.
- Axioms that list programmatically enforceable assertions for the ticket.

If a ticket still requires product, design, architecture, or security decisions, harden the ticket instead of implementing it.

## Checks

When tooling exists, prefer:

```sh
ctx scan --json
ctx discover --backend semble --task "<task>" --repo . --json
ctx lint --json
ctx ticket check --json
ctx pack check --json
ctx spec check --json
```

Until the CLI exists, validate markdown structure manually against the templates in `docs/tickets/templates/` and `docs/ticket-packs/templates/`.
