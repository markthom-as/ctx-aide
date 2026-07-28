# CTX Aide Alpha Source Contract

This document is the source and redistribution contract for consumers such as vakOS. It describes public source, not an npm or Cargo publication.

## Qualified Alpha Revision

- Repository: `https://github.com/markthom-as/ctx-aide`
- Git URL: `https://github.com/markthom-as/ctx-aide.git`
- Qualified revision: `d440a524b52a9e5e5b624ffd937331bae659a937`
- Git tree: `e1906962bbe58b7857c8544c6f7eab3adc656713`
- Discovery tag: `v0.1.0-alpha.1`
- Annotated tag object: `0e56328329b09f4dbfe1cd563cc0165a4cf03232`
- Raw `git archive --format=tar` SHA-256: `108a613fd5d260b1658cbff85f4949055b2c34674f919ae4ac66fd89de4f582f`
- Derived npm tarball SHA-256: `c37dcf29271ddb404acb1ed507678818898a0903b45545c5ead26048b91b8b85`
- Green hosted validation: `https://github.com/markthom-as/ctx-aide/actions/runs/30391660122`

The full 40-character commit is authoritative. The tag and `main` branch are discovery aids and must not be used alone as a reproducibility boundary. The archive and package hashes are evidence for this revision; a Nix consumer must also commit the NAR hash produced by its chosen fetcher in `flake.lock` or the derivation.

## License And Access

- Source and redistribution license: MIT, from the repository `LICENSE`.
- Nix license metadata: `lib.licenses.mit`.
- Access: public HTTPS; no token, npm account, Cargo account, or private GitHub entitlement is required.
- Binary caching: downstream Nix builds may be cached and redistributed under MIT, retaining the license notice. CTX Aide does not operate or require a hosted binary cache for alpha.
- Infrastructure cost delta: `$0/month` for the upstream project.

## Runtime Contract

- Runtime: Node.js 20 or newer.
- Package identity: `ctx-aide@0.1.0` with `private: true`; npm is not a distribution channel.
- Executable identity: exactly one binary, `ctxa`.
- Dependencies: no npm runtime or development dependencies.
- Lifecycle: no install-time lifecycle script and no model, binary, or data download.

The build fails unless `npm pack` expands to exactly these 15 files:

1. `LICENSE`
2. `README.md`
3. `docs/config/ctx-aide.adoption-profiles.json`
4. `docs/context/schema/adoption-profile-registry.schema.json`
5. `docs/context/schema/context-entry.schema.json`
6. `docs/context/schema/feedback-entry.schema.json`
7. `docs/context/schema/source-provenance.schema.json`
8. `docs/future-work/templates/future-work.md`
9. `docs/specs/templates/spec.md`
10. `docs/ticket-packs/templates/ticket-pack.md`
11. `docs/tickets/templates/canonical-ticket.md`
12. `package.json`
13. `tools/ctx-aide/command-catalog.mjs`
14. `tools/ctx-aide/ctx-aide.mjs`
15. `tools/ctx-aide/screenshot-review-ui.mjs`

Tests, Git metadata, generated context caches, tickets, credentials, build scripts, repository skills, workflow examples, and unrelated release documents are excluded from the runtime package.

## Nix Consumption Rules

- Pin `rev = "d440a524b52a9e5e5b624ffd937331bae659a937"` or a later reviewed full commit; never pin only `main` or the alpha tag.
- Let the vakOS flake or derivation record its own fetcher-specific NAR hash.
- Wrap `tools/ctx-aide/ctx-aide.mjs` with a pinned Node runtime; do not add an npm registry fetch or global install.
- Copy the complete reviewed runtime inventory so `init`, profile selection, command manifest, and schema commands stay functional.
- Set license metadata to MIT and keep cache substitution optional. A cache miss must fall back to the same local Nix build.

## Reproduction Proof

The qualified revision was cloned from the public URL into a clean temporary directory. With npm offline mode and lifecycle scripts disabled, the source passed `npm ci`, build, tarball creation, isolated installation, `ctxa --help`, `ctxa command manifest --json`, and `ctxa schema list --json`. The installed schema probe returned four packaged schemas and the command manifest returned version 4.

Representative verification:

```sh
git clone --no-checkout https://github.com/markthom-as/ctx-aide.git
git -C ctx-aide checkout --detach d440a524b52a9e5e5b624ffd937331bae659a937
(cd ctx-aide && npm_config_offline=true npm ci --offline --ignore-scripts --no-audit --no-fund)
npm_config_offline=true node ctx-aide/scripts/build.mjs --pack-destination /tmp/ctx-aide-artifacts --json
```

Temporary proof directories and installed artifacts are not retained.
