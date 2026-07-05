# Repo Charter Public Demo

This demo proves the core Repo Charter workflow with public-safe repository content:

- context entries live in `docs/context/`;
- a release spec lives in `docs/specs/`;
- executable tickets live in `docs/tickets/`;
- the ticket pack tracks dependencies and completion evidence in `docs/ticket-packs/`;
- validation runs locally through `node tools/context/ctx.mjs` and `make`.

It does not require private repositories, paid infrastructure, browser credentials, or external accounts.

## Run The Demo

From the repository root:

```sh
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs query --path README.md --task "prepare Repo Charter public release" --agent codex --budget 1200 --json
node tools/context/ctx.mjs pack status pack.repo-context-public-release-2026-07-01 --json
node tools/context/ctx.mjs ticket check --json
node tools/context/ctx.mjs pack check --json
make smoke
```

## What To Inspect

1. `docs/context/architecture/public-name-decision-2026-07-05.md` records a frozen naming decision.
2. `docs/specs/public-release-2026-07-01.md` records the release goal, affected surfaces, decisions, safeguards, and ticket plan.
3. `docs/ticket-packs/active/public-release-2026-07-01.md` records the execution policy, dependency order, parallel groups, and current ticket status.
4. `docs/tickets/done/040-public-name-decision.md` shows a completed ticket with scope, rules, acceptance criteria, commit metadata, and validation evidence.
5. `docs/context/generated/context-manifest.json` is a generated artifact from `ctx scan`; it is useful for agents, but markdown remains canonical.

## Expected Result

- `ctx scan` reports `ok: true` and writes the generated manifest and SQLite cache.
- `ctx query` returns the public-release context entries most relevant to the README.
- `ctx pack status` reports the public-release pack and its ticket counts.
- `ctx ticket check` and `ctx pack check` report no structural errors.
- `make smoke` runs the full local smoke path: validation, scan, query smoke, and doctor.

If any command fails, inspect the referenced markdown or config file first. Repo Charter is designed so broken workflow truth is fixed in markdown before agents continue implementation.
