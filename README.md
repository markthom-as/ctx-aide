# Repo Context System

This proposal defines a repo-local context system for coding agents, optimized first for Codex, then Claude, then Cursor. The system keeps product feedback, page rules, component contracts, flow behavior, design-system guidance, and architecture decisions close to the code without relying on a hosted service.

No paid infrastructure is required for the baseline. Markdown files and a local SQLite index run entirely inside the repo. A hosted component catalog could be added later, but the first implementation should stay local.

## Goals

- Keep page, component, flow, design, and architecture feedback in versioned markdown.
- Let agents load the right context for a route, file, directory, component, or ticket.
- Make feedback actionable, scoped, statused, and linked to implementation tickets.
- Encourage atomic tickets by making scope and relevant context explicit before coding starts.
- Reduce UI and architectural regressions by surfacing local conventions at implementation time.
- Provide a lightweight component/design catalog without requiring full Storybook adoption.

## Non-Goals

- Replace product management tools.
- Replace tests or visual regression checks.
- Become a hosted documentation platform.
- Require every component to have exhaustive examples on day one.
- Depend on one agent vendor's memory format.

## Core Model

Markdown is the source of truth. SQLite is a generated cache and search index.

```text
repo/
  AGENTS.md
  CLAUDE.md
  .cursor/
    rules/
      repo-context.mdc
      generated/
  docs/
    context/
      README.md
      schema/
        context-entry.schema.json
      routes/
      files/
      dirs/
      components/
      flows/
      design/
      architecture/
      feedback/
      generated/
        context.sqlite
        context-manifest.json
        agent-pack.codex.md
        agent-pack.claude.md
        agent-pack.cursor.mdc
    tickets/
      templates/
        canonical-ticket.md
      draft/
      needs-questions/
      needs-hardening/
      ready/
      in-progress/
      blocked/
      needs-review/
      done/
      superseded/
    ticket-packs/
      templates/
      draft/
      active/
      backlog/
      done/
      superseded/
    future-work/
      templates/
      captured/
      promoted/
      superseded/
  tools/
    context/
      ctx.mjs
      package.json
```

The repo should commit markdown context and generated lightweight agent packs. The SQLite database should usually be ignored or regenerated, unless the team wants deterministic local bootstrap without Node install.

## Scan Exclusion

Some markdown files should stay human-only and never enter the context index. The scanner must support two exclusion forms.

Preferred structured form:

```markdown
---
context_scan: false
---

# Human-Only Notes
```

Fast first-line sentinel:

```markdown
<!-- repo-context: ignore -->

# Scratch Notes
```

Scanner rules:

- If the first non-BOM line is `<!-- repo-context: ignore -->`, skip the file before frontmatter parsing.
- If YAML frontmatter contains `context_scan: false`, skip the file.
- Excluded files must not appear in SQLite, generated manifests, FTS search, agent packs, ticket hydration, or context query results.
- `ctx lint` may report malformed markdown only when explicitly asked to include ignored files.
- Ignored files should still remain normal repo files; this is not a gitignore substitute.

## Operating Model

This system is designed around a two-tier agent workflow:

1. A high-effort planning agent turns a rough description into a hardened markdown spec.
2. The same high-effort tier creates full-fat atomic tickets from that spec.
3. Codex implementation agents execute those tickets without making product, design, architecture, or security decisions.

The specification and ticketing stages are intentionally more expensive than implementation. The goal is to spend reasoning budget before code changes, so implementation tickets become deterministic work units.

Agent preferences:

- **Codex**: default implementation agent for all ticket work; also strong for architecture, repo navigation, validation, commits, and end-to-end execution.
- **Claude**: preferred for UI design critique, visual/aesthetic hardening, product-flow review, and alternate spec/audit passes.
- **Cursor**: secondary IDE-local context consumer, mainly via generated rules and summaries.

The system should not encode "lower effort" as a different tool. It should encode it as a readiness contract: implementation agents can be lower-effort because the ticket already contains the decisions.

Recommended flow:

1. **Describe**: capture the user's rough goal, affected surfaces, constraints, and desired outcome.
2. **Draft Spec**: create a markdown spec under `docs/specs/` with assumptions clearly marked.
3. **Question Pass**: ask targeted questions only for gaps that would affect product behavior, architecture, security, design, scope, or validation.
4. **Harden Spec**: run explicit architecture, design, security, best-practices, testing, and parallelization reviews against the spec.
5. **Freeze Decisions**: move resolved choices into a decisions section; move unresolved choices into blockers or ticket-specific questions.
6. **Create Tickets**: split the spec into atomic markdown tickets, each with context, implementation rules, acceptance criteria, validation steps, and commit expectations.
7. **Harden Tickets**: run the same review lenses on each ticket. Tickets that still require design decisions are not ready.
8. **Implement in Parallel**: assign independent tickets to separate agents or worktrees when useful.
9. **Validate**: every ticket defines its own smoke tests, screenshots, and relevant automated checks.
10. **Commit Per Ticket**: each completed ticket gets one clean commit and updates its completion metadata.

The implementation agent contract is strict: if a ticket contains an unresolved design, architecture, product, or security decision, the agent should stop and escalate rather than inventing policy during implementation.

## Future Work Capture

Future work is first-class. Use it for ideas that should be retained but should not block the current spec, ticket, or milestone.

```markdown
---
id: future.2026-06-25.agent-driven-customization
kind: future-work
status: captured
title: Agent-driven workflow customization
captured_at: 2026-06-25
source: user
applies_to:
  routes: []
  files:
    - README.md
  components: []
  flows:
    - flow.workflow-customization
promotion_target:
  spec: null
  ticket_pack: null
  ticket: null
---

# Agent-Driven Workflow Customization

## Idea

Capture the idea without forcing it into the current milestone.

## Why Later

- Explain why it should not block current work.

## Questions Before Promotion

- What must be answered before this becomes a spec or ticket?

## Promotion Notes

- Suggested spec:
- Suggested ticket pack:
- Suggested validation:
```

Future work statuses:

- `captured`: idea is recorded but not elaborated.
- `questioning`: idea needs targeted questions before promotion.
- `promoted`: idea has been turned into a spec, ticket pack, or ticket.
- `superseded`: idea is replaced or no longer relevant.

Useful command surface:

```bash
ctx future capture --title "..." --source user --json
ctx future list --status captured --json
ctx future promote <future-id> --to spec --json
node tools/context/ctx.mjs future check --json
```

For now, `node tools/context/ctx.mjs future check --json` validates future-work files. Capture and promote are documented future commands.

## Spec Format

Specs live under `docs/specs/` and are the bridge between product feedback/context and implementation tickets.

```markdown
---
id: spec.2026-06-25.report-workspace-context
status: draft
owner_agent: codex-high
source_feedback:
  - feedback.2026-06-25.reports.chart-helper-copy
context_ids:
  - route.reports.generate
  - flow.report-generation
target_agents:
  spec:
    - codex-high-effort
    - claude-high-effort
  ui_design_review: claude-high-effort
  implementation: codex
created: 2026-06-25
---

# Report Workspace Context Improvements

## Goal

State the user-visible or operator-visible outcome.

## Affected Surfaces

- Routes:
- Files/directories:
- Components:
- Flows:
- Design-system areas:

## Existing Context

Generated by `ctx query` and manually refined by the spec agent.

## Product Decisions

- Decision:
- Rationale:
- Regression risk:

## Architecture Decisions

- Decision:
- Rationale:
- Rejected alternatives:

## Design Decisions

- Decision:
- Components/tokens to use:
- Anti-patterns to avoid:

## Security and Privacy Decisions

- Data touched:
- Trust boundaries:
- Required safeguards:

## Open Questions

Only questions whose answers change implementation behavior.

## Hardening Review

- Architecture:
- Design:
- Security:
- Best practices:
- Testing:
- Parallelization:

## Ticket Plan

- Independent tickets:
- Sequential tickets:
- Shared files that require coordination:
```

## Spec Hardening Checklist

The high-effort agent should harden specs before creating tickets.

- **Architecture**: clear boundaries, ownership, data flow, dependency direction, migration path, rollback plan when relevant.
- **Design**: named components, design tokens, layout rules, responsive behavior, empty/loading/error states, visual anti-patterns to avoid.
- **Security**: data sensitivity, authz/authn assumptions, injection risks, secrets, logging, privacy, abuse cases.
- **Best Practices**: repo conventions, framework idioms, performance constraints, accessibility, observability, error handling.
- **Context Consistency**: route/component/flow/feedback entries match the proposed behavior.
- **Parallelization**: tickets identify shared-file conflicts and can be run in separate worktrees where practical.
- **Validation**: each behavior has concrete automated checks, smoke tests, or screenshots.
- **Decision Completeness**: no ticket asks the implementation agent to choose a product/design/architecture/security direction.

Recommended agent split for hardening:

- Use Codex for architecture, implementation feasibility, repo-pattern consistency, test strategy, and validation planning.
- Use Claude for UI, visual hierarchy, interaction quality, copy tone, product-flow coherence, and design anti-pattern review.
- Use either Codex or Claude for security and best-practices review, then convert review findings into concrete spec edits.

## Context Entry Format

Every context file uses frontmatter plus markdown. The frontmatter provides machine-readable scope; the markdown carries human-readable nuance.

```markdown
---
id: route.reports.generate
kind: route
context_scan: true
status: active
title: Reports Generate Flow
routes:
  - /reports/generate
files:
  - app/reports/generate/page.tsx
  - components/reports/ReportGenerateFlow.tsx
components:
  - component.ReportGenerateFlow
  - component.ChartStep
flows:
  - flow.report-generation
tags:
  - reports
  - workspace
  - charting
positive_rules:
  - Use existing report workspace components before adding new surface area.
  - Keep chart-selection helper copy inline with the step it supports.
negative_rules:
  - Do not create a second reports cache surface unless the payload contract differs.
  - Do not introduce a new chart-picker component for copy-only changes.
load_when:
  path_matches:
    - app/reports/**
    - components/reports/**
  task_terms:
    - report
    - chart
    - saved report
updated: 2026-06-25
---

# Reports Generate Flow

## Product Intent

Describe what the page or flow is supposed to accomplish for the user.

## Current Decisions

- Keep chart-selection helper copy inline.
- Treat saved-report metadata as part of the report artifact contract.

## Positive Rules

- Use existing report workspace components before adding new surface area.
- Keep chart-selection helper copy inline with the step it supports.

## Negative Rules

- Do not create a second reports cache surface unless the payload contract differs.
- Do not introduce a new chart-picker component for copy-only changes.

## Known Feedback

- Feedback ids live in `docs/context/feedback/`.

## Implementation Rules

- Do not create a second reports cache surface unless the payload contract differs.
- Prefer existing report workspace components before introducing new panels.
```

Rule polarity:

- `positive_rules` describe what agents should prefer, reuse, preserve, or do.
- `negative_rules` describe what agents must avoid, not create, not change, or escalate before doing.
- Agent packs, ticket hydration, and `ctx query` must preserve rule polarity instead of flattening everything into generic guidance.
- Negative rules should be treated as constraints. If a ticket appears to require violating one, the implementation agent should stop and escalate unless the ticket explicitly supersedes the rule.
- Positive rules should be ranked as guidance and reuse preference, not as unconditional requirements.

## Enforceable Axioms

Rules should be programmatically enforceable whenever practical. Use "axiom" for a rule that can be checked by code, shell command, schema validation, snapshot, or deterministic inspection.

```yaml
axioms:
  - id: axiom.markdown-source-of-truth
    statement: Markdown files are the canonical authoring surface; SQLite is generated.
    check: ctx lint --assert markdown-source-of-truth --json
    severity: error
  - id: axiom.ticket-done-requires-commit
    statement: A done ticket must include commit hash and verification evidence.
    check: ctx ticket check --assert done-has-evidence --json
    severity: error
  - id: axiom.negative-rules-preserved
    statement: Negative rules must remain separate in query, hydration, and agent-pack output.
    check: ctx lint --assert rule-polarity --json
    severity: error
```

Axioms are different from ordinary guidance:

- An axiom needs a stable id.
- An axiom needs a pass/fail check, even if the first implementation is a lint assertion.
- Axioms should use `severity: error` when violating them would make agent work unsafe or non-deterministic.
- If a rule cannot be checked yet, record it as a positive or negative rule and add a follow-up ticket to promote it into an axiom.
- Tickets should list the axioms they rely on so implementation agents know which checks must stay green.

## Feedback Format

Feedback should be small, scoped, and statused. A feedback item is not automatically a ticket; it is product context that can produce one or more tickets.

```markdown
---
id: feedback.2026-06-25.reports.chart-helper-copy
kind: feedback
status: accepted
severity: medium
source: user
applies_to:
  routes:
    - /reports/generate
  files:
    - components/reports/ReportGenerateFlow.tsx
  components:
    - component.ChartStep
tags:
  - reports
  - copy
  - flow
created: 2026-06-25
resolved_by:
  tickets:
    - ticket.2026-06-25.reports-chart-helper-copy
---

# Chart Step Helper Copy

## Feedback

The chart step should guide the operator inline instead of presenting "Add New Chart" as the main next action.

## Decision

Accepted. The flow should use direct helper text: "Please select a chart to continue."

## Regression Risk

Future chart-step refactors may reintroduce CTA-first language.
```

## SQLite Index

SQLite exists to make lookup fast and deterministic for agents. It should be generated from markdown by `ctx scan`.

Minimum tables:

```sql
create table context_entries (
  id text primary key,
  kind text not null,
  status text not null,
  title text not null,
  markdown_path text not null,
  summary text,
  updated text,
  frontmatter_json text not null
);

create table scope_bindings (
  entry_id text not null,
  scope_type text not null,
  scope_value text not null,
  weight integer not null default 100,
  primary key (entry_id, scope_type, scope_value)
);

create table relationships (
  from_id text not null,
  relation text not null,
  to_id text not null,
  primary key (from_id, relation, to_id)
);

create table feedback_items (
  id text primary key,
  status text not null,
  severity text not null,
  source text,
  created text,
  resolved_at text,
  markdown_path text not null
);

create table component_registry (
  id text primary key,
  name text not null,
  package_path text,
  import_path text,
  status text not null,
  markdown_path text not null
);

create virtual table context_fts using fts5(
  id,
  title,
  kind,
  body,
  tags,
  content='context_entries',
  content_rowid='rowid'
);
```

## Agent Loading Algorithm

`ctx query` should rank context in this order:

1. Exact path or route matches.
2. Directory ancestors from most specific to least specific.
3. Components imported by the target file or route.
4. Flows connected to those routes/components.
5. Active or accepted feedback scoped to the same surface.
6. Design-system and component contracts referenced by those components.
7. Architecture decisions that bind the directory, subsystem, or package.
8. Full-text task-term matches.
9. Recently updated entries, with a cap to avoid noisy context.

The CLI should return both concise summaries and file pointers so the agent can inspect full files only when needed.

Example:

```bash
ctx query \
  --path app/reports/generate/page.tsx \
  --task "fix chart selection regression" \
  --agent codex \
  --budget 6000 \
  --json
```

## CLI Surface

The CLI should be non-interactive and agent-native.

```bash
node tools/context/ctx.mjs lint --json
node tools/context/ctx.mjs doctor --json
node tools/context/ctx.mjs discover --backend semble --task "save report chart selection" --repo . --json
ctx init --json
ctx scan --json
ctx query --path <path> --task <text> --agent codex --budget 6000 --json
ctx feedback add --scope route:/reports/generate --title "..." --status proposed --json
ctx feedback resolve <feedback-id> --ticket <ticket-id> --json
ctx spec create --from-description <file-or-stdin> --json
ctx spec questions docs/specs/SPEC.md --json
ctx spec harden docs/specs/SPEC.md --lenses architecture,design,security,best-practices,testing --json
ctx spec tickets docs/specs/SPEC.md --out docs/tickets/draft --json
ctx pack create --from-spec docs/specs/SPEC.md --json
ctx pack check --json
ctx pack status <pack-id> --json
ctx ticket create --from-feedback <feedback-id> --json
ctx ticket hydrate docs/tickets/draft/TICKET.md --agent codex --json
ctx ticket harden docs/tickets/draft/TICKET.md --json
ctx components list --json
ctx components get component.Button --json
ctx impact --path components/ui/button.tsx --json
ctx export-agent --agent codex --out docs/context/generated/agent-pack.codex.md --json
ctx export-agent --agent claude --out docs/context/generated/agent-pack.claude.md --json
ctx export-agent --agent cursor --out .cursor/rules/generated/repo-context.mdc --json
```

Output rules:

- JSON on stdout for `--json`.
- Diagnostics on stderr.
- Bounded defaults for query/list commands.
- Durable ids for mutations.
- Validation before writes.
- `--dry-run` for mutation previews.

Pack status returns the pack metadata, ticket count, per-status totals, and ordered ticket rows. Use it before dispatching parallel agents and after merging ticket commits.

Ticket hydration returns a bounded context snapshot for a ticket's scoped paths, directories, routes, and task. It preserves positive and negative rules as separate arrays so implementation agents can distinguish preferences from constraints.

## Daily Commands

Use these commands while shaping or implementing tickets:

```bash
make validate
make smoke
make ctx-scan
make ctx-query-smoke
make ctx-doctor
make install-skill
```

`make validate` is the default pre-commit check. `make smoke` adds scan, query, and doctor checks. `make install-skill` installs the local Codex skill into `~/.codex/skills/repo-context` after validating it.

### Semble Discovery

Use Semble as an optional code-discovery backend when target files are unknown.

```bash
node tools/context/ctx.mjs discover --backend semble --task "fix chart selection flow" --repo . --json
node tools/context/ctx.mjs discover --backend ripgrep --task "ChartStep" --repo . --json
node tools/context/ctx.mjs discover --backend none --task "known path only" --repo . --json
node tools/context/ctx.mjs discover --backend semble --task "auth flow" --repo . --out docs/context/generated/discovery.auth.json --json
```

Discovery output should be bounded and should feed `ctx query` and ticket hydration. It should store the query, backend, file path, line, and short reason, not large code excerpts. Semble is not product truth; agents must inspect files before editing.

## Agent Integration

### Codex

`AGENTS.md` should contain a short bootstrap block:

```markdown
## Repo Context

Before creating or implementing tickets, run:

`ctx scan --json`
`ctx query --path <changed-or-target-file> --task "<task>" --agent codex --budget 6000 --json`

Use returned context ids to hydrate tickets and implementation notes. If context conflicts with code, inspect code and update the markdown context in the same ticket when the new behavior is intentional.
```

Codex is the primary target because it already works well with repo-local instructions, markdown tickets, and command-line workflows.

Codex should be the default assignee for implementation tickets. A ready ticket should let Codex implement, validate, screenshot, smoke test, update completion metadata, and commit without needing to reopen design decisions.

### Claude

`CLAUDE.md` should mirror the bootstrap instructions and point Claude at `docs/context/generated/agent-pack.claude.md`. Keep it shorter than the Codex pack because Claude tends to over-ingest long instructions.

Claude should be treated as a high-effort planning and audit partner, especially for UI work. Claude-oriented packs should emphasize design intent, component paradigms, visual constraints, product-flow questions, and critique checklists rather than implementation command details.

### Cursor

Cursor should receive generated `.mdc` rules:

```text
.cursor/rules/generated/repo-context.mdc
.cursor/rules/generated/components.mdc
.cursor/rules/generated/feedback.mdc
```

Cursor rules should be stable summaries, not the whole database. The CLI remains the source for targeted lookup.

## Idvisor Plugin Fit

This system is a strong fit for an Idvisor plugin or workflow pack, but it should not start by moving all repo-context truth into Idvisor. The repo should remain the source of truth for markdown specs, tickets, ticket packs, feedback, context entries, and component catalog entries. Idvisor should orchestrate, index, validate, dispatch, and audit the workflow.

Recommended shape:

- Keep `docs/context/`, `docs/specs/`, `docs/tickets/`, and `docs/ticket-packs/` in the target app repo.
- Provide an Idvisor plugin that registers a repo-context workflow template: describe, spec, questions, hardening, ticket generation, ticket hardening, implementation, validation, progress report.
- Let Idvisor track workflow runs, gates, review passes, queue items, feedback records, and progress reports through its existing SQLite-first event/runtime model.
- Expose `ctx` as a governed local tool or MCP capability rather than rewriting the CLI inside Idvisor on day one.
- Use Idvisor's Codex and Claude harnesses to assign high-effort planning/review steps and Codex implementation steps.
- Use Idvisor workflow gates to prevent implementation before spec and ticket hardening pass.
- Use Idvisor progress reports to summarize pack status, completed commits, validation evidence, and blocked tickets.

Division of responsibility:

- **Repo context system owns**: markdown schema, ticket template, pack template, route/component/design/feedback context, local SQLite index, generated Codex/Claude/Cursor packs.
- **Idvisor owns**: workflow orchestration, agent assignment, queueing, event audit, capability policy, review gates, progress reports, and multi-agent execution.

This gives Idvisor a concrete product workflow without making Idvisor app-specific. The plugin should be generic enough to run in any web app repo that follows the context-system conventions.

Possible plugin command surface:

```bash
idv repo-context init --repo <path> --json
idv repo-context scan --repo <path> --json
idv repo-context spec start --repo <path> --description <file> --json
idv repo-context spec harden --repo <path> --spec <spec-id> --agents codex,claude --json
idv repo-context pack create --repo <path> --spec <spec-id> --json
idv repo-context pack status --repo <path> --pack <pack-id> --json
idv repo-context dispatch --repo <path> --pack <pack-id> --parallel --json
```

The first implementation should probably be thin: Idvisor calls `ctx` and records events. Later, if the pattern proves stable, shared schema/types can move into an Idvisor crate or plugin SDK.

Idvisor-specific gates:

- Spec cannot advance until question pass is resolved or explicitly waived.
- UI-impacting specs should have a Claude design/audit pass before ticket generation.
- Tickets cannot dispatch unless status is `ready`.
- Tickets cannot complete without commit hash and verification evidence.
- Packs cannot complete until pack-level validation is recorded.
- Any ticket that would require product, design, architecture, security, event/RPC/config, or capability-policy decisions returns to hardening instead of implementation.

## Lightweight Component Catalog

This should be component-context-first, not full Storybook-first.

```text
docs/context/components/
  Button.md
  DataTable.md
  ReportGenerateFlow.md
  ChartStep.md
```

Component entry format:

```markdown
---
id: component.Button
kind: component
status: active
name: Button
import_path: "@/components/ui/button"
files:
  - components/ui/button.tsx
design_tokens:
  - color.action.primary
  - radius.control
variants:
  - primary
  - secondary
  - ghost
used_by:
  routes:
    - /reports/generate
---

# Button

## Purpose

Primary command surface for committed actions.

## Variants

- `primary`: one per local action group.
- `secondary`: available but not visually dominant.
- `ghost`: toolbar and low-emphasis commands.

## Composition Rules

- Use lucide icons for icon buttons when an icon exists.
- Do not create rounded text pills when an icon button is the expected control.
- Avoid nesting button groups inside cards inside cards.

## Positive Rules

- Use `primary` for the dominant committed action in a local action group.
- Use `ghost` icon buttons for toolbar actions when a familiar icon exists.

## Negative Rules

- Do not create one-off CTA styling in route components.
- Do not use text labels where a familiar toolbar icon is clearer.

## Examples

```tsx
<Button variant="primary" icon={Save}>Save</Button>
<Button variant="ghost" icon={Undo} aria-label="Undo" />
```

## Anti-Patterns

- Creating one-off CTA styling in route components.
- Using text labels where familiar toolbar icons are clearer.
```

Optional local catalog:

```text
app/context-lab/page.tsx
docs/context/components/examples/*.tsx
```

The catalog should render examples from the component registry and support screenshots for visual review. It can start as one internal route or static Vite app. Full Storybook can remain a later migration path.

## Ticket Workflow

Tickets should include a context snapshot so future agents can see what was considered when the ticket was created. Every ticket should use the canonical ticket template so status, pack membership, implementation rules, validation, and completion metadata are predictable.

### Ticket Statuses

Use a small fixed status vocabulary:

- `draft`: ticket is being shaped and may still contain open questions.
- `needs-questions`: ticket cannot be hardened without user or planning-agent answers.
- `needs-hardening`: ticket has enough information to review, but not enough to implement.
- `ready`: ticket is implementation-ready; Codex can execute without making product/design/architecture/security decisions.
- `in-progress`: implementation has started.
- `blocked`: implementation cannot continue without a specific external answer or dependency.
- `needs-review`: implementation is complete but validation, screenshots, audit, or review remains.
- `done`: ticket is implemented, validated, committed, and completion metadata is filled.
- `superseded`: ticket should not be implemented because another ticket/spec replaced it.

Status rules:

- Only `ready` tickets should be assigned to implementation agents.
- A ticket with unresolved implementation-changing questions cannot move past `needs-questions`.
- A ticket without frozen decisions, validation steps, and pack membership cannot move to `ready`.
- A ticket cannot move to `done` without a commit hash and verification evidence.

### Ticket Packs

Ticket packs group related tickets into a milestone-shaped unit. Most packs represent one milestone, but a pack may cover multiple milestones when the work is a tightly coupled program.

Pack files live under `docs/ticket-packs/`:

```markdown
---
id: pack.2026-06-report-workspace-context
status: active
title: Report Workspace Context
milestones:
  - milestone.report-workspace-context
source_specs:
  - spec.2026-06-25.report-workspace-context
tickets:
  - ticket.2026-06-25.reports-chart-helper-copy
  - ticket.2026-06-25.reports-saved-metadata
parallel_groups:
  reports-ui-a:
    tickets:
      - ticket.2026-06-25.reports-chart-helper-copy
  reports-data-a:
    tickets:
      - ticket.2026-06-25.reports-saved-metadata
blocked_by: []
created: 2026-06-25
---

# Report Workspace Context

## Outcome

State the milestone-level outcome this pack delivers.

## Scope

- Included:
- Excluded:

## Execution Plan

- Parallel groups:
- Sequential dependencies:
- Shared-file coordination:

## Pack Validation

- Smoke tests:
- Screenshots:
- Full regression checks:

## Completion

- Completed tickets:
- Remaining tickets:
- Final validation:
```

Pack statuses:

- `draft`: pack is being planned.
- `ready`: all included tickets are ready or intentionally deferred.
- `active`: at least one ticket is in progress.
- `blocked`: pack cannot progress because one or more required tickets are blocked.
- `done`: pack outcome is delivered and pack-level validation is complete.
- `superseded`: pack was replaced by another pack.

Packs should make parallel execution explicit. Tickets in different `parallel_group`s should be safe to implement concurrently unless the pack calls out shared-file coordination.

### Milestone Runs

A ticket pack is the plan. A milestone run is the live execution state for one attempt to complete that plan with parallel agents.

Milestone runs should be local, resumable, and cheap to inspect. For a pure markdown implementation, store them under `docs/runs/`. For an Idvisor-backed implementation, Idvisor should own the durable run/event truth and can export markdown progress reports back into the repo.

```markdown
---
id: run.2026-06-25.repo-context-mvp.001
kind: milestone-run
status: active
ticket_pack: pack.repo-context-mvp
started_at: 2026-06-25T09:00:00-06:00
updated_at: 2026-06-25T10:15:00-06:00
coordinator: codex-high-effort
max_parallel_agents: 4
stale_after_minutes: 20
worktree_root: ../.worktrees/repo-context-mvp
agents:
  - agent_id: codex-a
    status: active
    ticket: ticket.context.002
    worktree: ../.worktrees/repo-context-mvp/codex-a
    branch: ctx/ticket-context-002
    lease_expires_at: 2026-06-25T10:35:00-06:00
    last_heartbeat_at: 2026-06-25T10:15:00-06:00
  - agent_id: codex-b
    status: stale
    ticket: ticket.context.004
    worktree: ../.worktrees/repo-context-mvp/codex-b
    branch: ctx/ticket-context-004
    lease_expires_at: 2026-06-25T09:50:00-06:00
    last_heartbeat_at: 2026-06-25T09:30:00-06:00
merge_queue:
  - ticket.context.002
blocked_tickets: []
completed_tickets: []
---

# Repo Context MVP Run

## Current State

- Active agents:
- Stale agents:
- Ready tickets:
- Blocked tickets:
- Merge queue:

## Coordination Notes

- Shared files:
- Merge order:
- Validation gates:

## Cleanup Log

- Timestamp:
- Agent:
- Action:
- Reason:
```

Run statuses:

- `planning`: run exists but no implementation agents are assigned.
- `active`: at least one agent has an active lease.
- `draining`: no new tickets should be assigned; active tickets may finish.
- `blocked`: no runnable tickets remain because of blockers.
- `needs-merge`: one or more completed ticket branches are waiting to merge.
- `validating`: pack-level validation is running.
- `done`: all required tickets are merged and pack validation is complete.
- `abandoned`: run was intentionally stopped before completion.

Agent lease statuses:

- `active`: agent owns the ticket lease and heartbeat is current.
- `stale`: heartbeat or lease expired.
- `recovering`: coordinator is inspecting or salvaging work from the stale worktree.
- `requeued`: ticket was returned to ready work.
- `completed`: ticket commit was produced and evidence recorded.
- `failed`: agent ended with a hard failure.
- `abandoned`: coordinator intentionally discarded the lease.

Long-run orchestration rules:

- Assign each parallel ticket to a separate worktree and branch.
- Store a lease for every in-progress ticket with `agent_id`, `worktree`, `branch`, `started_at`, `last_heartbeat_at`, and `lease_expires_at`.
- Agents must heartbeat after meaningful progress, before long test runs, after tests, and before final handoff.
- A stale agent does not automatically mean failed work. The coordinator should inspect `git status`, recent commits, logs, and ticket notes before cleanup.
- Dead-agent cleanup must either salvage a commit, preserve a patch artifact, or explicitly discard the worktree with a reason.
- Requeue tickets only after recording what happened to the stale lease.
- Merge through a coordinator-owned queue, not directly from parallel agents into the main branch.
- Run pack-level validation after ticket merges, even when each ticket passed locally.

Useful command surface:

```bash
ctx run start --pack <pack-id> --max-parallel 4 --json
ctx run status <run-id> --json
ctx run assign <run-id> --ticket <ticket-id> --agent codex --json
ctx run heartbeat <run-id> --agent <agent-id> --ticket <ticket-id> --json
ctx run stale <run-id> --json
ctx run recover <run-id> --agent <agent-id> --json
ctx run requeue <run-id> --ticket <ticket-id> --reason "..." --json
ctx run merge-next <run-id> --json
ctx run validate <run-id> --json
ctx run finish <run-id> --json
```

Idvisor is the stronger long-run backend once available because it can own heartbeats, queues, leases, events, and dead-agent cleanup as runtime truth. The repo-local markdown form is still useful as an exportable progress artifact and a fallback when Idvisor is not running.

### Future Customization

Post-v0.1, repo-context should support an agent-driven customization flow. The default workflow should remain conservative and usable without setup, but users should be able to tune optional behavior through a guided skill flow and eventually a CLI dry run.

Example future command surface:

```bash
ctx customize --profile minimal --dry-run --json
ctx customize --profile web-app --dry-run --json
ctx customize --profile ui-heavy --dry-run --json
ctx customize --profile idvisor-orchestrated --dry-run --json
ctx customize --profile strict --dry-run --json
```

Candidate toggles:

- Enable or disable Semble-backed discovery.
- Generate Codex, Claude, and Cursor packs independently.
- Require Claude UI/design audit for UI-impacting specs.
- Require screenshots for frontend tickets.
- Enable Idvisor orchestration and milestone-run exports.
- Choose strict or advisory enforcement for optional checks.
- Select component-catalog mode: markdown-only, local route, or Storybook-compatible export.

Customization rules:

- Required axioms cannot be disabled.
- Customization must produce reviewable repo-local config or markdown.
- Dry-run output must show exactly which commands, exports, rules, and gates would change.
- Profiles should be named and diffable, not hidden agent memory.
- Customization is post-v0.1 and should not block the MVP pack.
- Capture customization requests first as future work, then promote them into a spec/ticket pack when the MVP workflow is stable.

```markdown
---
id: ticket.2026-06-25.reports-chart-helper-copy
status: ready
ticket_pack: pack.2026-06-report-workspace-context
milestones:
  - milestone.report-workspace-context
implementation_agent: codex
planning_agents:
  - codex-high-effort
  - claude-high-effort
ui_review_agent: claude-high-effort
parallel_group: reports-ui-a
scope:
  routes:
    - /reports/generate
  files:
    - components/reports/ReportGenerateFlow.tsx
context_query:
  task: "fix chart selection helper copy"
  generated_at: 2026-06-25
  context_ids:
    - route.reports.generate
    - component.ChartStep
    - feedback.2026-06-25.reports.chart-helper-copy
---

# Fix Chart Selection Helper Copy

## Context

Generated by `ctx ticket hydrate`.

## Positive Rules

- Preserve:
- Prefer:
- Reuse:

## Negative Rules

- Do not:
- Avoid:
- Stop and escalate if:

## Frozen Decisions

- Use the accepted helper copy from the linked feedback.
- Do not introduce a new chart-picker component.

## Implementation Rules

- Keep the change scoped to the chart step.
- If the existing component cannot support the copy change without broader flow changes, stop and report the blocker.

## Acceptance Criteria

- The chart step uses the accepted helper copy.
- No unrelated report flow behavior changes.
- Context feedback is marked resolved when complete.

## Verification

- Unit or component test if present.
- Browser smoke for `/reports/generate` if the route can run locally.
- Screenshot of the chart step after the change.

## Completion

- Commit: pending
```

## Canonical Ticket Template

All implementation tickets should follow this template.

```markdown
---
id: ticket.YYYY-MM-DD.short-slug
status: draft
title: Short imperative title
ticket_pack: pack.YYYY-MM-slug
milestones:
  - milestone.slug
source_spec: spec.YYYY-MM-DD.slug
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: default
depends_on: []
blocks: []
scope:
  routes: []
  files: []
  directories: []
  components: []
  flows: []
context_query:
  task: ""
  generated_at: YYYY-MM-DD
  context_ids: []
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated: []
  smoke: []
  screenshots: []
completion:
  commit: pending
  completed_at: null
---

# Short Imperative Title

## Outcome

One concrete outcome this ticket delivers.

## Context

Generated by `ctx ticket hydrate`; include only the context needed to implement this ticket.

## Positive Rules

- Preserve:
- Prefer:
- Reuse:

## Negative Rules

- Do not:
- Avoid:
- Stop and escalate if:

## Axioms

- `axiom.markdown-source-of-truth`: Markdown remains the canonical authoring surface.
- `axiom.ticket-done-requires-commit`: Completion requires commit and verification evidence.

## Frozen Decisions

- Decision:
- Rationale:

## Implementation Rules

- Required approach:
- Existing components/helpers to use:
- Anti-patterns to avoid:
- Stop and escalate if:

## Scope

- In:
- Out:

## Acceptance Criteria

- Observable criterion:
- Regression criterion:

## Validation

- Automated:
- Smoke:
- Screenshots:

## Implementation Notes

Notes for the implementation agent, not new decisions.

## Completion

- Status:
- Commit:
- Verification evidence:
- Follow-up tickets:
```

Spec-to-ticket loop:

1. Capture feedback or description as markdown.
2. Run `ctx scan --json`.
3. Create a draft spec.
4. Run `ctx spec questions` and ask only implementation-changing questions.
5. Update the spec with answers and decisions.
6. Run `ctx spec harden`.
7. Create atomic tickets from the hardened spec.
8. Run `ctx ticket harden` on each ticket.
9. Assign tickets to a ticket pack and parallel group.
10. Mark tickets ready only when Codex can implement without making design decisions.

Implementation loop:

1. Query context before implementation.
2. Implement the smallest coherent change.
3. Update context if intentional behavior changed.
4. Run ticket-defined tests, screenshots, and smoke checks.
5. Run `ctx lint --json` and project tests.
6. Commit the ticket cleanly.

## Lint Rules

`ctx lint` should catch:

- Context entries with missing ids, kind, status, or title.
- Referenced files that do not exist.
- Route entries that no longer map to app routes.
- Feedback without an `applies_to` scope.
- Accepted feedback not linked to a ticket after a configurable age.
- Resolved feedback without a resolving ticket or decision note.
- Component entries with missing import paths.
- Cursor/Claude/Codex generated packs out of date with markdown source.
- Tickets missing context snapshots.
- Tickets missing canonical status, ticket pack, milestone, or parallel group.
- Ticket packs that reference missing tickets.
- Ticket packs marked ready while included tickets are still draft, needs-questions, or needs-hardening.
- Specs with unresolved implementation-changing questions.
- Tickets that lack frozen decisions, implementation rules, validation steps, or commit metadata.
- Tickets marked ready while still containing product/design/architecture/security choices.
- Tickets marked done without commit hash, verification evidence, and pack status update.

## Regression Defense

The system reduces regressions by making the local product/design contract queryable before edits happen. It should not rely on agents remembering prior conversations.

Recommended checks in CI:

```bash
ctx scan --check --json
node tools/context/ctx.mjs lint --json
node tools/context/ctx.mjs ticket check --json
node tools/context/ctx.mjs pack check --json
node tools/context/ctx.mjs future check --json
ctx spec check --json
```

Later additions:

- `ctx impact --path <file>` to show affected routes, components, flows, and feedback.
- `ctx changed-context --base main --json` for PR review.
- Visual snapshots for component catalog examples.
- Pull request template section listing relevant context ids.
- Worktree assignment helpers for parallel ticket execution.
- Long-running milestone run orchestration with leases, heartbeats, stale-agent recovery, merge queues, and pack-level validation.

## Adoption Plan

Start with one web app and one active surface. Do not document the whole repo first.

1. Add the markdown structure and CLI scaffold.
2. Model 3-5 real pages/routes.
3. Model the core shared components used by those pages.
4. Capture recent product feedback as scoped feedback entries.
5. Add the spec workflow and question/hardening passes.
6. Generate Codex, Claude, and Cursor packs.
7. Require context snapshots and frozen decisions in new tickets.
8. Add linting to CI once the workflow is stable.

The important constraint is that context updates should happen inside the same atomic ticket as the code change that makes them true.
