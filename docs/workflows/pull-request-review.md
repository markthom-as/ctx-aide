---
id: workflow.pull-request-review
status: active
title: Pull Request Review Workflow
workflow_dependencies:
  - git
optional_workflow_dependencies:
  - github-cli
updated: 2026-07-05
---

# Pull Request Review Workflow

## Purpose

Give agents a complete local CLI path for reviewing a GitHub pull request, leaving review feedback, committing fixes, and merging only after the review and validation gates are satisfied.

## Stages

1. Check workflow dependencies with `ctxa workflow deps --workflow workflow.pull-request-review --repo <repo> --json`.
2. Run `ctxa pr preflight --repo <repo> --pr <pr> --json` before PR mutation steps.
3. Confirm `git status --short --branch` is understood before touching files; stop if unrelated local changes would be staged or overwritten.
4. Identify the target pull request with `gh pr status`, `gh pr list`, or an operator-provided PR URL or number.
5. Inspect PR metadata with `gh pr view <pr> --json number,title,author,headRefName,baseRefName,mergeStateStatus,reviewDecision,statusCheckRollup,url`.
6. Fetch and check out the PR with `gh pr checkout <pr>` or fetch the head ref explicitly with `git fetch` and `git switch`.
7. Review the diff with `git diff --stat <base>...HEAD`, `git diff <base>...HEAD`, and targeted `gh pr diff <pr>` calls when GitHub's rendered patch is needed.
8. Run repo-native discovery and validation commands from the ticket, pack, or README before forming final review feedback.
9. Leave review comments with `gh pr review <pr> --comment --body-file <file>` when feedback is summary-level.
10. Leave line-specific comments with `gh pr review <pr> --comment --body-file <file>` plus the GitHub review UI or `gh api` only when the agent has exact file, line, side, and commit context.
11. For requested fixes, make scoped edits, run the same validation commands, and commit each completed ticket or feedback point separately.
12. Push fixes to the PR branch with `git push` only after checking the branch still matches the PR head and the worktree contains only intended changes.
13. Re-review the updated diff and status checks with `gh pr view <pr> --json reviewDecision,statusCheckRollup,mergeStateStatus`.
14. Merge with `gh pr merge <pr> --merge|--squash|--rebase` only when required reviews, checks, branch freshness, and operator/repo merge policy are satisfied.
15. Record review feedback, fix commits, validation evidence, and merge outcome in the ticket or run log.

## Readiness Gates

- PR review work must name the PR number or URL, base branch, and head branch before checkout.
- Agents must run `ctxa tools check --workflow workflow.pull-request-review --step <step> --capability tool.shell --json` before PR mutation steps in policy-managed repos.
- Agents should run `ctxa pr preflight --repo <repo> --pr <pr> --json` before comments, pushes, and merges.
- `gh auth status` must pass before any comment, push, or merge step that talks to GitHub.
- The workflow may inspect with `git` alone, but comment, push, status-check, and merge stages require an authenticated `gh` session or an explicit operator handoff.
- Review feedback must distinguish blocking defects from non-blocking suggestions.
- Fix commits must stay scoped to the reviewed PR and must not absorb unrelated local worktree changes.
- A PR must not be merged while required checks are pending or failing unless the ticket records the accepted exception.
- A PR must not be merged when review comments remain unresolved unless the operator or repository policy explicitly accepts the residual risk.
- Infrastructure, deployment, or paid-service changes discovered during review must surface a cost delta before implementation or merge.

## Review Policy

- Start with findings ordered by severity and grounded in file and line references when available.
- Use `gh pr comment` for summary feedback only when a formal review is not required by the repository.
- Use `gh pr review --request-changes` for blocking defects that must be fixed before merge.
- Use `gh pr review --approve` only after independently validating the diff and required checks.
- Convert ambiguous feedback into markdown follow-up tickets instead of mixing it into the current PR.

## Fix Policy

- Pull or fetch the latest PR head before editing.
- Use repo-local markdown tickets and acceptance criteria as the scope boundary for fixes.
- Commit each independent fix as its own commit when it closes a distinct ticket or feedback point.
- Re-run the validation commands that justify each fix before pushing.
- Re-open review if a fix broadens scope, changes architecture, touches security-sensitive code, or changes user-facing behavior outside the PR's stated scope.

## Merge Policy

- Prefer the repository's documented merge strategy over agent preference.
- Confirm the PR head branch is the branch being pushed and merged.
- Confirm status checks are green or explicitly waived in the ticket.
- Confirm required reviews are approved or explicitly waived in the ticket.
- Confirm post-merge cleanup policy before deleting remote branches.
- Record the merge method, merged commit or PR URL, and any post-merge follow-up in the ticket completion metadata.

## Capability Policy

- `tool.shell` is required because `git` and `gh` are command-line tools.
- `tool.semble` remains available for semantic code discovery during review.
- `tool.ctxa` remains available for workflow dependency checks, ticket checks, pack checks, feedback capture, and policy checks.
- GitHub connector access is not required for this workflow; prefer `gh`/`git` commands when the operator asks for CLI-driven PR work.
- Denied connector apps remain denied unless a repository updates `docs/config/ctx-aide.tools.json` and records the decision in a ticket.

## Validation

- `ctxa workflow deps --workflow workflow.pull-request-review --repo <repo> --json`
- `ctxa pr preflight --repo <repo> --pr <pr> --json`
- `ctxa tools policy --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json`
- `ctxa tools check --workflow workflow.pull-request-review --step pr-fix --capability tool.shell --json`
- `git status --short --branch`
- `gh auth status`
- `gh pr view <pr> --json number,title,headRefName,baseRefName,reviewDecision,statusCheckRollup,mergeStateStatus,url`
