# CTX Aide Public Demo

This demo proves the core CTX Aide workflow with public-safe repository content:

- context entries live in `docs/context/`;
- a release spec lives in `docs/specs/`;
- executable tickets live in `docs/tickets/`;
- the ticket pack tracks dependencies and completion evidence in `docs/ticket-packs/`;
- validation runs locally through `node tools/ctx-aide/ctx-aide.mjs` and `make`.

It does not require private repositories, paid infrastructure, browser credentials, or external accounts.

## Run The Demo

From the repository root:

```sh
node tools/ctx-aide/ctx-aide.mjs scan --json
node tools/ctx-aide/ctx-aide.mjs query --path README.md --task "prepare CTX Aide public release" --agent codex --budget 1200 --json
node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
node tools/ctx-aide/ctx-aide.mjs ticket check --json
node tools/ctx-aide/ctx-aide.mjs pack check --json
make smoke
```

## What To Inspect

1. `docs/context/architecture/public-name-decision-2026-07-05.md` records a frozen naming decision.
2. `docs/specs/public-release-2026-07-01.md` records the release goal, affected surfaces, decisions, safeguards, and ticket plan.
3. `docs/ticket-packs/active/public-release-2026-07-01.md` records the execution policy, dependency order, parallel groups, and current ticket status.
4. `docs/tickets/done/040-public-name-decision.md` shows a completed ticket with scope, rules, acceptance criteria, commit metadata, and validation evidence.
5. `docs/context/generated/context-manifest.json` is a generated artifact from `ctx-aide scan`; it is useful for agents, but markdown remains canonical.

## Expected Result

- `ctx-aide scan` reports `ok: true` and writes the generated manifest and SQLite cache.
- `ctx-aide query` returns the public-release context entries most relevant to the README.
- `ctx-aide pack status` reports the public-release pack and its ticket counts.
- `ctx-aide ticket check` and `ctx-aide pack check` report no structural errors.
- `make smoke` runs the full local smoke path: validation, scan, query smoke, and doctor.

If any command fails, inspect the referenced markdown or config file first. CTX Aide is designed so broken workflow truth is fixed in markdown before agents continue implementation.
