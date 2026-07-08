# Contributing

CTX Aide uses markdown specs, tickets, ticket packs, context entries, and validation commands as source of truth. Start with the markdown workflow instead of relying on chat-only context.

## Current Status

This repository is still a private, unpublished public-release candidate. It intentionally has no `LICENSE`, `COPYING`, or `NOTICE` file yet, and `package.json` keeps `private: true`. Do not claim open-source reuse rights, publish packages, create public remotes, add secrets, or use paid infrastructure unless a future approved ticket explicitly covers that work.

## Workflow

1. Find or create the relevant markdown context, spec, ticket, or ticket pack.
2. Implement only tickets whose status is `ready`.
3. Keep each change scoped to one ticket when possible.
4. Move non-blocking follow-up ideas to `docs/future-work/captured/`.
5. Run the ticket's validation commands and the relevant repo gates.
6. Keep generated SQLite indexes and generated agent packs as rebuildable artifacts, not canonical truth.

## Local Setup

Use Node.js 20+, Python 3, `make`, and Semble on `PATH` or through `uvx`.

```sh
npm ci
node tools/ctx-aide/ctx-aide.mjs scan --json
make validate
make smoke
```

For package and install smoke without publishing:

```sh
npm audit --omit=dev --json
npm run build -- --dry-run --json
npm run install:local -- --json
npm pack --dry-run --json
npm link --dry-run
```

## Pull Requests

Pull requests should include:

- The markdown ticket and ticket pack.
- A concise scope summary.
- Validation commands and results.
- Any publication, deployment, secret, or paid-infrastructure impact.

Do not include secrets, private URLs, session cookies, access tokens, or personal contact details in issues, PRs, logs, screenshots, or fixtures.

## Public Repository Hygiene

Issue and PR templates live under `.github/`. Security reporting posture is in `SECURITY.md`. Release history starts in `CHANGELOG.md`. A code of conduct is intentionally omitted until maintainer contact and enforcement posture are explicit.
