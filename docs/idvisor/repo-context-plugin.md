---
id: idvisor.repo-context-plugin
status: draft
title: Idvisor Repo Context Plugin
updated: 2026-06-26
---

# Idvisor Repo Context Plugin

## Purpose

Define the thin Idvisor integration for repo-context without moving source truth out of the target repository.

## Ownership

- Repo context owns markdown schemas, context entries, specs, tickets, ticket packs, generated agent packs, and local query/index commands.
- Idvisor owns orchestration, gates, queueing, dispatch, run events, progress reports, and multi-agent execution policy.

## Workflow Template

1. Start from a user description.
2. Create or update a markdown spec.
3. Run a question pass and record resolved decisions.
4. Harden the spec through architecture, design, security, best-practices, testing, and parallelization gates.
5. Create a ticket pack.
6. Create atomic tickets.
7. Hydrate tickets with `ctx ticket hydrate`.
8. Dispatch only tickets whose status is `ready`.
9. Require commit hash and verification evidence before marking tickets done.
10. Run pack validation before marking the pack complete.

## Local Command Contract

```bash
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs query --path <path> --task <task> --agent codex --budget 6000 --json
node tools/context/ctx.mjs ticket hydrate <ticket> --json
node tools/context/ctx.mjs pack status <pack-id> --json
node tools/context/ctx.mjs run status <run-file> --json
node tools/context/ctx.mjs idvisor workflow --json
```

## Gates

- Spec cannot advance until question pass is resolved or explicitly waived.
- UI-impacting specs should receive a Claude design or audit pass before ticket generation.
- Tickets cannot dispatch unless status is `ready`.
- Tickets cannot complete without commit hash and verification evidence.
- Packs cannot complete until pack-level validation is recorded.
- Any implementation-changing product, design, architecture, security, event, RPC, config, or capability-policy question returns to hardening.

## Non-Goals

- Do not store repo-context truth in Idvisor instead of markdown.
- Do not require hosted infrastructure for v0.1.
- Do not add paid orchestration infrastructure as part of this plugin definition.
