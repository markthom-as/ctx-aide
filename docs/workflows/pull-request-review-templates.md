---
id: workflow.pull-request-review-templates
status: active
title: Pull Request Review Templates
updated: 2026-07-05
---

# Pull Request Review Templates

## Purpose

Give agents consistent review bodies for `workflow.pull-request-review` comments, requested changes, approvals, fix commits, and merge closeout.

## Summary Comment

```markdown
Review summary:

- Scope reviewed: <files, tickets, or behavior>
- Validation run: `<command>` -> <result>
- Merge readiness: <ready | blocked | needs follow-up>

Findings:

- <severity> <file:line> <issue and impact>

Non-blocking notes:

- <note>
```

## Request Changes

```markdown
Blocking findings:

- <file:line> <what is wrong, why it matters, and what must change>

Validation:

- `<command>` -> <result>

Requested fix:

- <specific fix required before approval>
```

## Approval

```markdown
Approved.

Validated:

- `<command>` -> <result>

Notes:

- <non-blocking note or "none">
```

## Fix Commit Closeout

```markdown
Fix commit: `<sha>`

Addresses:

- <review finding, ticket id, or feedback point>

Validation:

- `<command>` -> <result>

Residual risk:

- <none or explicit risk>
```

## Merge Closeout

```markdown
Merged PR: <url>
Merge method: <merge | squash | rebase>
Merge SHA: `<sha>`

Final gates:

- Review decision: <approved | waived with ticket evidence>
- Status checks: <green | waived with ticket evidence>
- Worktree state after merge: `<git status --short --branch>` -> <result>

Follow-up tickets:

- <ticket id or none>
```

## Line Comment Fallback

```markdown
<file>:<line>

<specific issue and impact>

Suggested change:

- <concrete change>
```

Use this fallback in the review body when `gh api` line-comment coordinates are uncertain.
