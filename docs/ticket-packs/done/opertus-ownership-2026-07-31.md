---
id: pack.ctx-aide-opertus-ownership-2026-07-31
status: done
title: Opertus Systems Repository Ownership
milestones:
  - milestone.ctx-aide-opertus-ownership
source_specs:
  - spec.public-release-2026-07-01
tickets:
  - ticket.context.099
run_policy:
  max_parallel_agents: 1
  stale_after_minutes: 20
  merge_strategy: sequential-ticket-commits
  worktree_required: true
parallel_groups:
  ownership:
    tickets:
      - ticket.context.099
blocked_by: []
created: 2026-07-31
completion:
  completed_at: 2026-07-31
  final_validation:
    - GitHub reports opertus-systems/ctx-aide as a public repository with main as its default branch.
    - Package-facing source, issue, security, clone, and distribution links use opertus-systems.
    - npm test, npm pack --dry-run --json, CTX lint, ticket check, and pack check passed.
---

# Opertus Systems Repository Ownership

## Outcome

CTX Aide remains public and unpublished while its GitHub repository and active
package provenance move from the maintainer account to Opertus Systems.

## Scope

- Included: the GitHub repository transfer and active package-facing links.
- Excluded: npm publication, a version change, tag rewriting, visibility
  changes, paid infrastructure, and rewriting historical decision records.

## Tickets

- `ticket.context.099`: done.

## Execution Plan

- One ownership operation and one clean metadata commit.
- Preserve immutable commits, tags, issues, Actions history, and redirects.

## Run Policy

- Max parallel agents: one.
- Stale lease threshold: 20 minutes.
- Worktree strategy: isolated ownership worktree based on public `main`.
- Merge strategy: one fast-forward ticket commit.

## Pack Validation

- Smoke: verify the organization-owned public repository and default branch.
- Package: run tests and inspect the unpublished npm tarball.
- Markdown: run lint, ticket check, pack check, and `git diff --check`.

## Completion

- Completed tickets: 099.
- Remaining tickets: none.
- Infrastructure cost delta: `$0/month`.
