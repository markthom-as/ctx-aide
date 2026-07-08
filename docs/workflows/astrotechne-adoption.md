---
id: workflow.astrotechne-adoption
status: active
title: Astrotechne Repo-Context Adoption
created: 2026-06-26
updated: 2026-06-26
---

# Astrotechne Repo-Context Adoption

## Assessment

The ctx-aide tool worked for the documentation upgrade. It validated markdown, scanned context, generated bounded query output, ran doctor checks, reported pack status, and made the per-ticket commit discipline visible.

The run also exposed gaps before using it as the daily Astrotechne workflow:

- Creating a small documentation ticket and pack is still manual.
- Completion metadata is awkward because the final commit hash is only known after the commit.
- The validator assumes ctx-aide's canonical ticket shape, while Astrotechne already has a large historical ticket tree with simpler frontmatter.
- There is no adapter yet for a mature repo that already has `npm run tickets:status`, packet README conventions, and historical no-status markdown.

## Astrotechne Source Conventions

Astrotechne should preserve these conventions:

- Ticket root: `docs/domain-redesign/tickets`.
- Status command: `npm run tickets:status`.
- Open statuses: `todo`, `blocked`, `in_progress`, `review`.
- Closed or non-executable statuses: `done`, `wont_do`, `template`, `completed`, `complete`, `implemented`, `planned`, `accepted`, `implemented_pending_production_smoke`.
- Ticket pack surface: packet directory with `README.md`.
- Ticket frontmatter: `status`, `ticket_id`, `milestone`, `group`, `priority`, `depends_on`, `source_docs`, `created`, and `updated`.
- Supporting markdown without a `status` line is historical or contextual documentation, not automatically executable work.

## Adoption Strategy

Use CTX Aide as an overlay first.

1. Install ctx-aide scaffolding into Astrotechne without moving existing tickets.
2. Add `docs/context` entries for high-regression surfaces:
   - public copy and SEO launch readiness
   - chart workspace and public chart library
   - report generation and saved report browser
   - Labs semantic search
   - billing, entitlements, and paid fulfillment
   - timing report engine contracts
   - deploy and production verification runbooks
   - route composition, public shell, and design-system primitives
3. Generate Codex and Claude agent packs from those entries.
4. Keep Astrotechne's existing `npm run tickets:status` as a validation gate.
5. For new milestone work, create ctx-aide specs and hydrated tickets that cite existing Astrotechne packet READMEs and ticket examples as source documents.
6. Index historical tickets as reference material only unless a user explicitly promotes them into new canonical ctx-aide tickets.
7. Treat packet README state plus implementation surface plus `npm run tickets:status` as the truth surface for whether an Astrotechne pack is actually complete.

## Needed Tooling

Before daily Astrotechne use, ctx-aide should add:

- Legacy ticket adapter configuration for custom ticket roots and status vocabularies.
- Read-only import that summarizes existing Astrotechne tickets and packets without rewriting them.
- A completion finalizer that can update ticket metadata with the just-created commit hash after commit.
- A bootstrap command that writes an Astrotechne profile config and AGENTS/CLAUDE instructions.
- A pack audit that distinguishes repo-wide `tickets:status` failures from unrelated open ticket drift.

## Daily Target Flow

1. Install or refresh ctx-aide locally with `npm run install:local -- --json`.
2. Run `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json` and review the detected profile, blockers, dirty-worktree warnings, planned writes, and next commands without mutating the target.
3. If the setup plan is acceptable, run `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --write --no-input --json` to bootstrap missing ctx-aide files without moving existing tickets.
4. Capture context entries for the current feature area.
5. Run Semble discovery against Astrotechne to connect context to files and packet examples.
6. Draft and harden the spec.
7. Create a native Astrotechne packet with `ctxa adoption pack --repo /Users/jove/code/astrotechne.com --profile auto --title "<pack>" --slug <pack-slug> --write --json`.
8. Generate atomic implementation tickets with Astrotechne validation commands, using the packet slug when the tickets belong inside that packet.
9. Implement in parallel lanes where write sets are disjoint.
10. Validate with focused tests, screenshots for UI, `npm run tickets:status`, typecheck/build as relevant, and route smoke.
11. Commit each completed ticket separately.
12. Run coordinator closeout: pack README, completion evidence, final validation, and status drift note.

## Pre-Production Hardening Flow

Before using ctx-aide on production code:

1. Run `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne.com --profile auto --no-input --json`.
2. Run `.ctx-aide/install/bin/ctxa setup --repo /Users/jove/code/astrotechne-engine --profile auto --no-input --json` before planning engine work.
3. Confirm the web repo reports `astrotechne-web` with `docs/domain-redesign/tickets`, and the engine repo reports `astrotechne-engine` with `docs/tickets`.
4. Resolve bootstrap blockers before generating production-code tickets.
5. Keep dirty target worktree warnings visible; do not stage unrelated target changes into ctxa adoption commits.
6. Use `ctxa adoption status --repo <target> --profile auto --json` when you need the lower-level read-only status details without a setup plan.
7. Create the packet with `ctxa adoption pack` before creating tickets.
8. Create web tickets with both `--pack <pack-id>` and `--pack-slug <pack-slug>` so the ticket file lands in the packet directory.
