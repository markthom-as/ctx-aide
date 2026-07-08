---
id: architecture.public-release-safety-audit-2026-07-05
kind: architecture
context_scan: true
status: active
title: Public Release Safety Audit
files:
  - README.md
  - .gitignore
  - tools/ctx-aide/ctx-aide.mjs
  - tools/ctx-aide/ctx-aide.test.mjs
flows:
  - flow.ctx-aide-dogfood
tags:
  - public-release
  - safety
  - history-scan
positive_rules:
  - Public release is allowed to proceed to the launch gate when this audit remains current.
  - Treat generated SQLite as a local cache artifact, not a canonical public artifact.
negative_rules:
  - Do not make the repository public without rerunning history and working-tree scans after any new sensitive changes.
  - Do not claim package publishing readiness until a license decision is recorded.
load_when:
  path_matches:
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/active/public-release-2026-07-01.md
    - docs/tickets/**
  task_terms:
    - public release
    - safety audit
    - secret scan
    - history scan
updated: 2026-07-08
---

# Public Release Safety Audit

## Purpose

Record public-release safety evidence for credentials, private traces, generated artifacts, git history, and dependency/license surfaces.

## Current Decisions

No credential, private-data, or generated-artifact safety blocker was found for the public-release launch gate after the 2026-07-08 production-hardening refresh.

The release still needs explicit license, repository-owner, npm-owner, public-remote, and Cargo-posture decisions before external users should treat the project as open source or package-publishable. Those are launch metadata and distribution blockers, not secret or privacy findings.

## Positive Rules

- Rerun history and working-tree scans after public README, demo, and launch metadata changes land.
- Keep generated SQLite as a local cache artifact unless a future ticket explicitly changes that policy.

## Negative Rules

- Do not make the repository public if a future scan finds real credentials, private client data, or sensitive local workflow traces.
- Do not claim package publishing or open-source reuse readiness until the license decision is recorded.

## Commands Run

Initial audit on 2026-07-05:

```sh
rg -n -i --hidden --glob '!.git/**' "(api_key|secret|token|password|private key|OPENAI_API_KEY|ANTHROPIC_API_KEY|DATABASE_URL|refresh_token|access_token)" .
git log --all --name-only --pretty=format: | sort -u
uvx detect-secrets scan $(git ls-files)
strings docs/context/generated/context.sqlite | rg -n -i "(/Users|api_key|secret|token|password|private key|OPENAI_API_KEY|ANTHROPIC_API_KEY|DATABASE_URL|refresh_token|access_token)"
gitleaks git . --no-banner --redact --report-format json --report-path /tmp/ctx-aide-gitleaks-report.json
find . -maxdepth 3 -type f \( -name 'package.json' -o -name '*lock*' -o -name 'LICENSE*' -o -name 'COPYING*' -o -name 'NOTICE*' \) -print
node tools/ctx-aide/ctx-aide.mjs ticket check --json
node tools/ctx-aide/ctx-aide.mjs pack check --json
```

Refresh on 2026-07-08:

```sh
git status --short
git log --all --oneline --decorate
git grep -n -I -E '(AKIA|ASIA|BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY|sk_live_|pk_live_|xox[baprs]-|ghp_|github_pat_|npm_[A-Za-z0-9])' -- . || true
rg -n -S '(password|secret|token|api[_-]?key|private key|credential)' . || true
git log --all --oneline -G '(AKIA|ASIA|BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY|sk_live_|pk_live_|xox[baprs]-|ghp_|github_pat_|npm_[A-Za-z0-9])' -- . || true
npm audit --omit=dev --json
npm run build -- --dry-run --json
node tools/ctx-aide/ctx-aide.mjs scan --json
node tools/ctx-aide/ctx-aide.mjs ticket check --json
node tools/ctx-aide/ctx-aide.mjs pack check --json
make validate
make smoke
```

## Findings

2026-07-08 refresh:

- Working-tree high-risk credential grep produced reviewed false positives only: the scan pattern in `ticket.context.069` and `npm_package` enum handling in the CLI.
- Broad credential-term search matched docs, policy text, credential command documentation, design-token wording, and deliberate redaction fixtures in `tools/ctx-aide/ctx-aide.test.mjs`. No live credential value was found.
- Git-history `-G` scanning matched commits that introduced safety-scan regex text or package-kind identifiers. The matches are release-audit and implementation text, not secrets.
- `npm audit --omit=dev --json` reported zero production vulnerabilities.
- `npm run build -- --dry-run --json`, `scan`, `ticket check`, `pack check`, `make validate`, and `make smoke` passed after running the final validation serially.
- The launch remains blocked by distribution decisions: no license file, no public remote/owner decision, `package.json` still has `private: true`, no npm owner decision, and no Cargo package posture decision.

2026-07-05 initial audit:

- `gitleaks` 8.30.1 scanned 57 commits, about 729 KB, and reported no leaks. The JSON report at `/tmp/ctx-aide-gitleaks-report.json` was `[]`.
- `detect-secrets` scanned tracked files and reported one unverified `Secret Keyword` in `tools/ctx-aide/ctx-aide.test.mjs`. Manual review confirmed it is a deliberate fixture value used to assert credential redaction behavior.
- Literal `rg` hits were documentation, rule text, environment-variable names, test fixture strings, and `design token` vocabulary. No live credential value was found in tracked files.
- Generated agent-pack markdown under `docs/context/generated/` only mirrors public-safe context markdown.
- `docs/context/generated/context.sqlite` is ignored by `.gitignore`. A strings scan matched `design token` vocabulary, not private paths or credential material.
- No package manifest or lockfile is present, so there is no dependency license surface in this repository today.
- No `LICENSE`, `COPYING`, or `NOTICE` file is present. The final launch gate should record or add the license decision before public publication.

## Release Guidance

The safety audit clears the current repository contents for the public-release launch gate, subject to the remaining license, owner, npm, Cargo, and public-remote decisions. Before flipping GitHub visibility or publishing a package, rerun history and working-tree scans after all public README/demo/launch metadata changes have landed.

## Implementation Rules

- Treat `tools/ctx-aide/ctx-aide.test.mjs` fixture secrets as test data only when they are redaction assertions, not credential material.
- Keep `.ctx-aide/` and generated SQLite files out of public artifacts unless a later ticket introduces a sanitized export format.
- Update this audit note if future scans identify new findings or accepted launch risks.
