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
  - flow.repo-context-dogfood
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
updated: 2026-07-05
---

# GitHub Public Launch Gate

## Purpose

Prepare the final public-release gate for Repo Charter without changing GitHub visibility or creating paid infrastructure before required decisions are explicit.

## Current Decisions

- Public display name: `Repo Charter`.
- Internal repository and command name: `repo-context`.
- Recommended GitHub repository name: `repo-context`.
- Cost delta for the prepared launch path: `$0`. The documented path uses local validation and a standard public GitHub repository only. No AWS, Vercel, Fly, hosted database, queue, paid observability, or deployment resource is created.
- Current remote state: no git remote is configured in this checkout.
- Launch status: blocked pending user decisions on GitHub owner/org and repository license.

## Positive Rules

- Use the completed public-release tickets as launch evidence.
- Rerun safety scans after any new launch metadata changes.
- Keep external links pending until a public GitHub URL exists and is verified.

## Negative Rules

- Do not run `gh repo create`, `gh repo edit --visibility public`, or `git push` to a new public remote until the owner/org and license are confirmed.
- Do not claim open-source reuse rights without a license file or explicit no-license decision.
- Do not add deployment-connected remotes or paid services without a fresh cost estimate and user confirmation.

## Upstream Evidence

- `ticket.context.040`: done in commit `4b33476`, selected Repo Charter as the public display name.
- `ticket.context.041`: done in commit `8fefcd0`, completed the public-release safety audit.
- `ticket.context.042`: done in commit `f076b06`, polished README positioning and quickstart.
- `ticket.context.043`: done in commit `ee18ddc`, added the public demo walkthrough.

## Proposed GitHub Metadata

- Owner/org: blocked, user confirmation required.
- Repository name: `repo-context`.
- Display title: `Repo Charter`.
- Description: `Repo-local context, markdown tickets, validation gates, and agent handoff for coding-agent workflows.`
- Topics: `ai-agents`, `developer-tools`, `codex`, `claude`, `markdown`, `workflow`, `tickets`, `repo-context`, `local-first`, `validation`.
- Homepage: none until a public docs or project page exists.
- Visibility: public only after explicit confirmation.
- License: blocked, user confirmation required. No `LICENSE`, `COPYING`, or `NOTICE` file exists today.
- Public URL: pending owner/org decision and remote creation.

## Launch Commands After Approval

If the user confirms owner/org and license, the expected zero-cost launch path is:

```sh
gitleaks git . --no-banner --redact --report-format json --report-path /tmp/repo-context-gitleaks-report.json
uvx detect-secrets scan $(git ls-files)
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs spec check --json
node tools/context/ctx.mjs ticket check --json
node tools/context/ctx.mjs pack check --json
node tools/context/ctx.mjs pack status pack.repo-context-public-release-2026-07-01 --json
make validate
make smoke
```

Then either create a new public remote:

```sh
gh repo create OWNER/repo-context --public --source . --remote origin --push
```

Or attach/update an existing remote after confirming it points at the intended owner:

```sh
git remote add origin git@github.com:OWNER/repo-context.git
git push -u origin main
```

## Implementation Rules

- Add the chosen license before public launch if the user wants open-source reuse.
- Update README links only after the public URL is verified.
- Keep this gate blocked until owner/org and license are explicit.

## Validation

- `node tools/context/ctx.mjs scan --json`
- `node tools/context/ctx.mjs spec check --json`
- `node tools/context/ctx.mjs ticket check --json`
- `node tools/context/ctx.mjs pack check --json`
- `node tools/context/ctx.mjs pack status pack.repo-context-public-release-2026-07-01 --json`
- `make validate`
- `make smoke`
