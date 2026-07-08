## Ticket

- Ticket:
- Ticket pack:
- Context ids:

## Scope

- Changed:
- Out of scope:
- Publication, deployment, secrets, and paid infrastructure impact: none, unless explicitly described here.

## Validation

- [ ] `npm ci`
- [ ] `npm audit --omit=dev --json`
- [ ] `npm run build -- --dry-run --json`
- [ ] `npm run install:local -- --json`
- [ ] `npm pack --dry-run --json`
- [ ] `npm link --dry-run`
- [ ] `node tools/ctx-aide/ctx-aide.mjs scan --json`
- [ ] `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- [ ] `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- [ ] `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- [ ] `make validate`
- [ ] `make smoke`
- [ ] `git diff --check`

## Notes

- No `LICENSE`, `COPYING`, or `NOTICE` file is implied by this PR.
- Do not include secrets, private URLs, session cookies, access tokens, or personal contact details.
