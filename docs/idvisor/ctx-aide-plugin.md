---
id: idvisor.ctx-aide-plugin
status: draft
title: Idvisor CTX Aide Plugin
updated: 2026-06-26
---

# Idvisor CTX Aide Plugin

## Purpose

Define the thin Idvisor integration for ctx-aide without moving source truth out of the target repository.

## Ownership

- CTX Aide owns markdown schemas, context entries, specs, tickets, ticket packs, generated agent packs, and local query/index commands.
- Idvisor owns orchestration, gates, queueing, dispatch, run events, progress reports, and multi-agent execution policy.

## Workflow Template

1. Start from a user description.
2. Create or update a markdown spec.
3. Run a question pass and record resolved decisions.
4. Harden the spec through architecture, design, security, best-practices, testing, and parallelization gates.
5. Create a ticket pack.
6. Create atomic tickets.
7. Hydrate tickets with `ctx-aide ticket hydrate`.
8. Dispatch only tickets whose status is `ready`.
9. Require commit hash and verification evidence before marking tickets done.
10. Run pack validation before marking the pack complete.

## Local Command Contract

```bash
node tools/ctx-aide/ctx-aide.mjs scan --json
node tools/ctx-aide/ctx-aide.mjs query --path <path> --task <task> --agent codex --budget 6000 --json
node tools/ctx-aide/ctx-aide.mjs ticket hydrate <ticket> --json
node tools/ctx-aide/ctx-aide.mjs pack status <pack-id> --json
node tools/ctx-aide/ctx-aide.mjs run status <run-file> --json
node tools/ctx-aide/ctx-aide.mjs idvisor workflow --json
```

## Gates

- Spec cannot advance until question pass is resolved or explicitly waived.
- UI-impacting specs should receive a Claude design or audit pass before ticket generation.
- Tickets cannot dispatch unless status is `ready`.
- Tickets cannot complete without commit hash and verification evidence.
- Packs cannot complete until pack-level validation is recorded.
- Any implementation-changing product, design, architecture, security, event, RPC, config, or capability-policy question returns to hardening.

## Non-Goals

- Do not store ctx-aide truth in Idvisor instead of markdown.
- Do not require hosted infrastructure for v0.1.
- Do not add paid orchestration infrastructure as part of this plugin definition.
