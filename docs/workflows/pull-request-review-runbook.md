---
id: workflow.pull-request-review-runbook
status: active
title: Pull Request Review Runbook
workflow_dependencies:
  - git
optional_workflow_dependencies:
  - github-cli
updated: 2026-07-05
---

# Pull Request Review Runbook

## Purpose

Provide a copy-paste command path for agents running `workflow.pull-request-review` from a local checkout.

## Inputs

- `<repo>`: local repository path.
- `<pr>`: pull request number or URL.
- `<base>`: base branch from `gh pr view`.
- `<head>`: head branch from `gh pr view`.
- `<review-file>`: temporary file containing a review body.

## Orient

```bash
cd <repo>
ctx-aide workflow deps --workflow workflow.pull-request-review --repo . --json
ctx-aide tools check --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json
git status --short --branch
gh auth status
gh pr view <pr> --json number,title,author,headRefName,baseRefName,url,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup
ctx-aide pr preflight --repo . --pr <pr> --json
```

Stop before checkout if `git status --short --branch` shows unrelated local changes that could be staged, overwritten, or confused with PR changes.

## Check Out

```bash
gh pr checkout <pr>
git status --short --branch
git fetch origin <base>
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

If `gh pr checkout` is unavailable, fetch the head ref explicitly and switch to a local review branch:

```bash
git fetch origin pull/<pr>/head:review/pr-<pr>
git switch review/pr-<pr>
```

## Review

```bash
semble search "<behavior under review>" .
gh pr diff <pr> --patch
```

Run the repository's ticket, pack, README, or CI-equivalent validation commands before final feedback. For ctx-aide itself, use the narrow checks listed on the relevant ticket plus `node tools/ctx-aide/ctx-aide.test.mjs` when CLI behavior changes.

## Comment

Summary comment:

```bash
gh pr comment <pr> --body-file <review-file>
```

Formal review comment:

```bash
gh pr review <pr> --comment --body-file <review-file>
```

Blocking review:

```bash
gh pr review <pr> --request-changes --body-file <review-file>
```

Approval:

```bash
gh pr review <pr> --approve --body-file <review-file>
```

Use line comments only when exact `path`, `line`, `side`, and head commit context are known. If exact line context is uncertain, include file and line references in the review body instead of emitting a malformed API comment.

## Fix

```bash
git status --short --branch
# edit only the scoped files
<repo-validation-command>
git diff --stat
git diff
git add <intended-files>
git commit -m "<scoped fix message>"
git status --short --branch
git push
```

Make one commit per independent ticket or feedback point when the fixes are separable.

## Re-Review

```bash
gh pr view <pr> --json reviewDecision,mergeStateStatus,statusCheckRollup,headRefName,baseRefName,url
git fetch origin <base>
git diff --stat origin/<base>...HEAD
```

If status checks are pending or failing, stop unless the ticket records an accepted exception.

Run preflight again before merge:

```bash
ctx-aide pr preflight --repo . --pr <pr> --json
```

## Merge

```bash
gh pr merge <pr> --merge
```

Use `--squash` or `--rebase` only when the repository's documented policy prefers that method. Confirm branch deletion policy before adding `--delete-branch`.

## Closeout

Record the following in the ticket or run log:

- PR URL and number.
- Review outcome: comment, request changes, approve, or merge.
- Fix commits pushed.
- Validation commands and results.
- Merge method and merge SHA, when merged.
- Follow-up tickets for unresolved non-blocking work.
