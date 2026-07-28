---
id: architecture.github-public-launch-gate-2026-07-05
kind: architecture
context_scan: true
status: active
title: GitHub Public Launch Gate
files:
  - README.md
  - docs/ticket-packs/active/public-release-2026-07-01.md
flows:
  - flow.ctx-aide-dogfood
tags:
  - public-release
  - github
  - launch-gate
positive_rules:
  - Use this gate before creating a remote, pushing, or changing GitHub visibility.
  - Keep launch cost at zero unless a future user-approved deployment ticket changes that.
negative_rules:
  - Do not create or publish a GitHub repository until owner and license decisions are explicit.
  - Do not update external profile links until the public URL exists and has been verified.
load_when:
  path_matches:
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/active/public-release-2026-07-01.md
    - README.md
  task_terms:
    - GitHub launch
    - public release
    - public URL
    - launch gate
updated: 2026-07-28
---

# GitHub Public Launch Gate

## Purpose

Prepare the final public-release gate for CTX Aide without changing GitHub visibility or creating paid infrastructure before required decisions are explicit.

## Current Decisions

- Public display name: `CTX Aide`.
- Package-facing name if a future publishing ticket proceeds: `ctx-aide`.
- Internal repository and command name: `ctx-aide`.
- Recommended GitHub repository name: `ctx-aide`.
- Cost delta for the prepared launch path: `$0`. The documented path uses local validation and a standard public GitHub repository only. No AWS, Vercel, Fly, hosted database, queue, paid observability, or deployment resource is created.
- Current remote state: no git remote is configured in this checkout.
- GitHub owner/repository: `markthom-as/ctx-aide`.
- License: MIT.
- Registry posture: no npm or Cargo publication for alpha.
- Support posture: no SLA; use GitHub issues and private vulnerability reporting
  after launch.
- Launch status: owner, license, and no-Cargo posture are resolved; final
  cutover still waits for the no-npm ticket and fresh safety validation.

## Positive Rules

- Use the completed public-release tickets as launch evidence.
- Rerun safety scans after any new launch metadata changes.
- Keep external links pending until a public GitHub URL exists and is verified.

## Negative Rules

- Do not run `gh repo create` or push the public remote outside the final
  cutover ticket.
- Do not treat public source as approval to publish npm or Cargo packages.
- Do not add deployment-connected remotes or paid services without a fresh cost estimate and user confirmation.

## Upstream Evidence

- `ticket.context.040`: done, selected CTX Aide as the public display name.
- `ticket.context.041`: done in commit `8fefcd0`, completed the public-release safety audit.
- `ticket.context.042`: done in commit `f076b06`, polished README positioning and quickstart.
- `ticket.context.043`: done in commit `ee18ddc`, added the public demo walkthrough.

## Proposed GitHub Metadata

- Owner/org: `markthom-as`.
- Repository name: `ctx-aide`.
- Display title: `CTX Aide`.
- Description: `Repo-local context, markdown tickets, validation gates, and agent handoff for coding-agent workflows.`
- Topics: `ai-agents`, `developer-tools`, `codex`, `claude`, `markdown`, `workflow`, `tickets`, `ctx-aide`, `local-first`, `validation`.
- Homepage: none until a public docs or project page exists.
- Visibility: public at final cutover.
- License: MIT.
- Public URL: pending owner/org decision and remote creation.

## Launch Commands After Approval

After the remaining release tickets close, the expected zero-cost launch path is:

```sh
gitleaks git . --no-banner --redact --report-format json --report-path /tmp/ctx-aide-gitleaks-report.json
uvx detect-secrets scan $(git ls-files)
node tools/ctx-aide/ctx-aide.mjs scan --json
node tools/ctx-aide/ctx-aide.mjs spec check --json
node tools/ctx-aide/ctx-aide.mjs ticket check --json
node tools/ctx-aide/ctx-aide.mjs pack check --json
node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json
make validate
make smoke
```

Then either create a new public remote:

```sh
gh repo create OWNER/ctx-aide --public --source . --remote origin --push
```

Or attach/update an existing remote after confirming it points at the intended owner:

```sh
git remote add origin git@github.com:OWNER/ctx-aide.git
git push -u origin main
```

## Implementation Rules

- Verify the MIT license/package metadata before public launch.
- Update README links only after the public URL is verified.
- Keep this gate blocked until the no-npm decision and fresh safety validation
  are complete.

## Validation

- `node tools/ctx-aide/ctx-aide.mjs scan --json`
- `node tools/ctx-aide/ctx-aide.mjs spec check --json`
- `node tools/ctx-aide/ctx-aide.mjs ticket check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack check --json`
- `node tools/ctx-aide/ctx-aide.mjs pack status pack.ctx-aide-public-release-2026-07-01 --json`
- `make validate`
- `make smoke`
