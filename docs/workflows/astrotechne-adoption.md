---
id: workflow.astrotechne-adoption
status: active
title: Astrotechne Repo-Context Adoption
created: 2026-06-26
updated: 2026-06-26
---

# Astrotechne Repo-Context Adoption

## Assessment

The repo-context tool worked for the documentation upgrade. It validated markdown, scanned context, generated bounded query output, ran doctor checks, reported pack status, and made the per-ticket commit discipline visible.

The run also exposed gaps before using it as the daily Astrotechne workflow:

- Creating a small documentation ticket and pack is still manual.
- Completion metadata is awkward because the final commit hash is only known after the commit.
- The validator assumes repo-context's canonical ticket shape, while Astrotechne already has a large historical ticket tree with simpler frontmatter.
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

Use repo-context as an overlay first.

1. Install repo-context scaffolding into Astrotechne without moving existing tickets.
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
5. For new milestone work, create repo-context specs and hydrated tickets that cite existing Astrotechne packet READMEs and ticket examples as source documents.
6. Index historical tickets as reference material only unless a user explicitly promotes them into new canonical repo-context tickets.
7. Treat packet README state plus implementation surface plus `npm run tickets:status` as the truth surface for whether an Astrotechne pack is actually complete.

## Needed Tooling

Before daily Astrotechne use, repo-context should add:

- Legacy ticket adapter configuration for custom ticket roots and status vocabularies.
- Read-only import that summarizes existing Astrotechne tickets and packets without rewriting them.
- A completion finalizer that can update ticket metadata with the just-created commit hash after commit.
- A bootstrap command that writes an Astrotechne profile config and AGENTS/CLAUDE instructions.
- A pack audit that distinguishes repo-wide `tickets:status` failures from unrelated open ticket drift.

## Daily Target Flow

1. `node /Users/jove/code/repo-context/tools/context/ctx.mjs customize --profile astrotechne --dry-run --json`
2. Bootstrap context directories in Astrotechne.
3. Capture context entries for the current feature area.
4. Run Semble discovery against Astrotechne to connect context to files and packet examples.
5. Draft and harden the spec.
6. Generate atomic implementation tickets with Astrotechne validation commands.
7. Implement in parallel lanes where write sets are disjoint.
8. Validate with focused tests, screenshots for UI, `npm run tickets:status`, typecheck/build as relevant, and route smoke.
9. Commit each completed ticket separately.
10. Run coordinator closeout: pack README, completion evidence, final validation, and status drift note.
