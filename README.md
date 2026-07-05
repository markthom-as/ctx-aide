# Repo Charter

Repo Charter is a local-first workflow system for coding agents. It keeps context, specs, tickets, ticket packs, validation rules, and agent instructions in versioned markdown beside the code so implementation agents can work from durable repo truth instead of reconstructed chat history.

The current repository and CLI namespace are still `repo-context`. `Repo Charter` is the public display name chosen for this release; no command, package, or remote rename is part of the current milestone.

No paid infrastructure is required. Markdown is canonical, generated agent packs are lightweight artifacts, and SQLite indexes are local rebuildable caches.

## What It Does

- Captures repo-local context for routes, files, directories, components, flows, design rules, architecture decisions, and feedback.
- Turns specs into atomic markdown tickets with frozen decisions, scope, validation, and commit expectations.
- Groups tickets into ticket packs with dependencies, parallel groups, run policy, and completion evidence.
- Generates agent-facing context packs for Codex, Claude, and Cursor without depending on one vendor's memory format.
- Provides local `ctx` checks for scanning, querying, linting, ticket validation, pack validation, future-work validation, adoption preflight, workflow validation, and tool-policy checks.

## Quickstart

Run the core checks from a fresh checkout with Node.js, Python 3, `make`, and Semble available on `PATH` or through `uvx`:

```sh
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs query --path README.md --task "understand Repo Charter public release" --agent codex --budget 1200 --json
node tools/context/ctx.mjs pack status pack.repo-context-public-release-2026-07-01 --json
make validate
```

For the fuller local smoke path:

```sh
make smoke
```

## How The Workflow Fits Together

1. Write or harden a markdown spec under `docs/specs/`.
2. Split the spec into ready tickets under `docs/tickets/ready/`.
3. Group related tickets in `docs/ticket-packs/`.
4. Implement each ready ticket as one scoped commit with validation evidence.
5. Move non-blocking ideas into `docs/future-work/captured/` instead of hiding them in chat.
6. Regenerate or inspect generated context artifacts only as caches, never as canonical truth.

## Proof Surfaces

- `AGENTS.md`: the repo-local operating contract for agents.
- `tools/context/ctx.mjs`: the implemented local CLI.
- `examples/public-release-demo/README.md`: a runnable public-safe walkthrough of scan, query, ticket, pack, and smoke checks.
- `docs/specs/public-release-2026-07-01.md`: the current public-release spec.
- `docs/ticket-packs/active/public-release-2026-07-01.md`: the active public-release ticket pack.
- `docs/context/architecture/public-name-decision-2026-07-05.md`: the public name decision.
- `docs/context/architecture/public-release-safety-audit-2026-07-05.md`: the public-release safety audit.

## Status

Repo Charter is not a hosted product. It is a working local developer-productivity system and a public-release candidate. The public-release pack is still active until README polish, demo proof, and the final GitHub launch gate are complete.

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

## Staff Review Hardening Gates

Before treating a milestone as ready for staff-engineering review, run the repo-context flow as a visible pack, not as chat-only analysis.

Minimum gates:

```sh
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs ticket check --json
node tools/context/ctx.mjs pack check --json
node tools/context/ctx.mjs doctor --json
node tools/context/ctx.mjs loc check --json
make validate
make smoke
```

Security and truthfulness rules:

- Dependency audit commands run without shell evaluation by default; pass `--shell` only for commands that require shell syntax.
- Generated output writes stay inside the active repo or target repo by default; pass `--allow-outside-repo` only when the destination is intentionally outside that boundary.
- `ctx workflow validation-plan` is a readiness gate. It returns the full matrix even when blocked, but top-level `ok` is false when a required view lacks credentials or browser storage state.
- Browser validation plans must keep deploy cost policy explicit; deploy-enabled configs must keep `cost_estimate_required: true`.

## LOC Volume Tracking

Repo-context can measure and enforce source-volume targets without leaving the local repo. Configure path-scoped targets in `docs/config/repo-context.loc.json`, then use `ctx loc` for measurement and `ctx loc check` as a validation gate.

```sh
node tools/context/ctx.mjs loc --repo . --json
node tools/context/ctx.mjs loc check --repo . --target-id repo-context-source --json
node tools/context/ctx.mjs loc check --repo . --path tools/context --max-lines 25000 --json
```

The default scan excludes generated context packs, VCS directories, dependency folders, and common build outputs. Targets can compare `nonblank_lines` or `total_lines` across the whole repo or selected path prefixes.

## Agent Capability Policy

Repo-context can describe the agent tools, connectors, and skills a repo expects agents to use. This is repo-local policy, not live host-runtime enforcement: it tells agents what is allowed before they choose a tool, but it does not authenticate connectors or prove that a Codex/Claude session actually has the tool loaded.

Use `docs/config/repo-context.tools.json` for global and workflow-step allow/deny rules:

```json
{
  "config_version": 1,
  "global": {
    "allow": ["tool.ctx", "tool.semble", "tool.shell", "skill.repo-context"],
    "deny": ["app.gmail", "app.google-drive", "tool.computer-use"]
  },
  "workflows": {
    "workflow.browser-validation": {
      "allow": ["tool.playwright", "tool.chrome-devtools", "skill.playwright"],
      "steps": {
        "browser-smoke": {
          "allow": ["tool.playwright", "tool.chrome-devtools"],
          "deny": ["tool.computer-use"]
        }
      }
    }
  },
  "capabilities": {
    "custom.internal-linter": {
      "kind": "tool",
      "source": "repo-config",
      "risk": "low",
      "purpose": "Run a repo-local lint wrapper."
    }
  }
}
```

Policy rules:

- Deny wins over allow at every layer.
- Allowlists are restrictive when at least one allow entry applies after global, workflow, and step policy are combined.
- Unknown capability ids fail `ctx lint` unless they use the `custom.*` namespace.
- `ctx lint` and `ctx doctor` validate malformed JSON, same-layer allow/deny overlaps, unknown workflow ids, and invalid capability references.

Useful commands:

```sh
node tools/context/ctx.mjs tools list --json
node tools/context/ctx.mjs tools policy --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json
node tools/context/ctx.mjs tools check --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json
```

## Target Adoption Preflight

Before using repo-context on a production repository, inspect the target state without mutating it:

```sh
node /path/to/repo-context/tools/context/ctx.mjs adoption status --repo /path/to/target --profile auto --json
node /path/to/repo-context/tools/context/ctx.mjs adoption bootstrap --repo /path/to/target --profile auto --json
node /path/to/repo-context/tools/context/ctx.mjs adoption pack --repo /path/to/target --title "<pack>" --slug <pack-slug> --json
```

`adoption bootstrap --write` seeds both `docs/config/repo-context.profile.json` and `docs/config/repo-context.tools.json` in the target repo. `adoption status` treats a missing or invalid tools policy as a blocker, but it remains read-only and does not probe live connector auth.

For directory-pack repositories such as Astrotechne, create tickets with the pack slug so generated work stays inside the packet:

```sh
node /path/to/repo-context/tools/context/ctx.mjs adoption ticket --repo /path/to/target --pack <pack-id> --pack-slug <pack-slug> --title "<ticket>" --task "<task>" --write --json
```

Generated tickets can also pin capability policy context:

```sh
node /path/to/repo-context/tools/context/ctx.mjs adoption ticket \
  --repo /path/to/target \
  --pack <pack-id> \
  --pack-slug <pack-slug> \
  --title "<ticket>" \
  --task "<task>" \
  --context <context-id> \
  --capability-workflow workflow.browser-validation \
  --capability-step browser-smoke \
  --capability tool.playwright,tool.semble \
  --write \
  --json
```

Before implementation, load the plan and follow the returned `capability_policy` envelope:

```sh
node /path/to/repo-context/tools/context/ctx.mjs adoption implementation-plan --repo /path/to/target --ticket <ticket.md> --json
node /path/to/repo-context/tools/context/ctx.mjs tools check --repo /path/to/target --workflow <workflow-id> --step <step-id> --capability <capability-id> --json
```

`implementation-plan` shows effective allow/deny policy and required capability decisions, but it does not fail only because a required capability is denied. Use `ctx tools check` as the failing guard before choosing a high-risk tool or connector.

## Agent Operating Rules

Repo-context should preserve the daily operating rules that make agent work reviewable and parallelizable.

- Plan work for parallel execution where practical. Use ticket packs, parallel groups, subagents, and worktrees when the work can be isolated cleanly.
- Use markdown specs, tickets, and ticket packs for implementation planning. A completed ticket should have one clean commit, completion metadata, and validation evidence.
- Keep tickets atomic enough to implement independently. Tickets that share files, migrations, route contracts, or design decisions must declare the coordination point in the pack.
- Estimate and surface the delta in cost before changing, deploying, or creating paid infrastructure such as AWS, Vercel, Fly, hosted databases, queues, or paid observability services.
- Start semantic code discovery with Semble when target files are unknown. Use `semble search` for behavioral or symbol-oriented discovery, `semble find-related` for similar code, and grep or ripgrep only for exhaustive literal matches or exact-string confirmation.
- If `semble` is not on `PATH`, use `uvx --from "semble[mcp]" semble`.
- Inspect full files before editing; Semble output is a discovery aid, not product truth.

Example search flow:

```bash
semble search "authentication flow" ./my-project
semble search "save_pretrained" ./my-project
semble search "save model to disk" ./my-project --top-k 10
semble find-related src/auth.py 42 ./my-project
uvx --from "semble[mcp]" semble search "authentication flow" ./my-project
```

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
ctx dependency audit --repo . --command "pnpm audit --prod" --out docs/context/generated/dependency-audit.json --json
ctx workflow deps --workflow workflow.browser-validation --repo . --json
ctx workflow deps --workflow workflow.browser-validation --repo . --write --json
ctx workflow views --workflow workflow.browser-validation --repo . --json
ctx workflow validation-plan --workflow workflow.browser-validation --repo . --json
ctx workflow deps --workflow workflow.pull-request-review --repo . --json
ctx tools check --workflow workflow.pull-request-review --step pr-review --capability tool.shell --json
ctx pr preflight --repo . --pr 123 --json
ctx credentials check --profile browser-test-user --repo . --json
ctx credentials import-browser-state --profile browser-test-user --from storage-state.json --repo . --write --json
ctx adoption bootstrap --repo /path/to/app --profile wetware --write --json
ctx adoption context --repo /path/to/app --kind flow --title "Dependency Audit Clearance" --path package.json --task "dependency audit" --write --json
ctx adoption ticket --repo /path/to/app --title "Clear Dependency Audit" --task "dependency audit" --context flow.dependency-audit-clearance --write --json
ctx adoption implementation-plan --repo /path/to/app --ticket docs/tickets/clear-dependency-audit.md --json
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

### Adoption Lifecycle Commands

Use the `adoption` commands when repo-context is managing another repo's daily workflow without replacing that repo's existing ticket system.

```bash
node /path/to/repo-context/tools/context/ctx.mjs adoption bootstrap \
  --repo /path/to/app \
  --profile wetware \
  --write \
  --json
```

`adoption bootstrap` creates only repo-local scaffolding: `docs/context`, `docs/config/repo-context.profile.json`, specs, ticket packs, workflows, and the detected or configured ticket root. It does not overwrite existing files unless `--force` is passed. Without `--write`, it returns the planned changes.

```bash
node /path/to/repo-context/tools/context/ctx.mjs adoption context \
  --repo /path/to/app \
  --kind flow \
  --title "Dependency Audit Clearance" \
  --slug dependency-audit-clearance \
  --path package.json,pnpm-lock.yaml \
  --task "dependency audit clearance" \
  --positive-rule "Preserve lockfile integrity." \
  --negative-rule "Do not mark dependency work done until the audit clears." \
  --write \
  --json
```

`adoption context` writes a scoped context entry that can be loaded later by id, matching path, or matching task terms. Positive and negative rules stay separate.

```bash
node /path/to/repo-context/tools/context/ctx.mjs adoption ticket \
  --repo /path/to/app \
  --profile wetware \
  --title "Clear Dependency Audit" \
  --task "dependency audit clearance" \
  --work-type dependency-upgrade \
  --context flow.dependency-audit-clearance \
  --file package.json,pnpm-lock.yaml \
  --validation "ctx dependency audit --repo . --command 'pnpm audit --prod' --json" \
  --write \
  --json
```

`adoption ticket` creates a full-fat implementation ticket in the target repo's configured ticket root. The ticket explicitly tells implementers to run an implementation plan before coding.

```bash
node /path/to/repo-context/tools/context/ctx.mjs adoption implementation-plan \
  --repo /path/to/app \
  --ticket docs/tickets/clear-dependency-audit.md \
  --json
```

`adoption implementation-plan` is the daily context-loading boundary. It returns ticket metadata, scoped paths, relevant context ids, positive and negative rules, validation commands, and stop conditions. It does not include full context bodies unless `--include-body` is passed.

Built-in profiles:

- `default`: use `docs/tickets`, detected package manager, and repo-context-style tickets.
- `wetware`: preserve flat `docs/tickets` markdown and pnpm validation conventions.
- `astrotechne`: preserve `docs/domain-redesign/tickets`, use `npm run tickets:status`, `npx biome check`, and `npm run build` as default validation guidance.

### Dependency Audit Gate

Dependency work needs a stricter closeout than ordinary implementation work. A ticket that updates dependency manifests may complete code changes while the production audit is still red. Repo-context treats those as different states.

Use `ctx dependency audit` to capture bounded, parseable evidence:

```bash
node tools/context/ctx.mjs dependency audit \
  --repo /path/to/app \
  --command "pnpm audit --prod" \
  --out docs/context/generated/dependency-audit.json \
  --json
```

Output includes `audit_cleared`, `exit_code`, vulnerability counts, vulnerable package names when they can be parsed, and bounded stdout/stderr excerpts. The command exits non-zero when the audit command fails.

Dependency tickets should opt into enforcement with:

```yaml
work_type: dependency-upgrade
completion:
  commit: pending
  completed_at: null
  dependency_audit: pending
  dependency_audit_command: pnpm audit --prod
  dependency_audit_checked_at: null
```

When a `work_type: dependency-upgrade` or `work_type: dependency-sweep` ticket is marked `done`, `ctx ticket check` requires:

- `completion.dependency_audit: cleared`
- `completion.dependency_audit_command`
- `completion.dependency_audit_checked_at`

This prevents agents from marking "dependency sweep findings implemented" as equivalent to "dependency audit cleared."

### Workflow Dependency Management

Workflow dependencies are declared in markdown workflow files under `docs/workflows/`. Repo-context can check a target repo for required workflow dependencies and, when package pins are known, write exact package pins into `package.json`.

Browser validation uses `workflow.browser-validation`:

```bash
node tools/context/ctx.mjs workflow deps \
  --workflow workflow.browser-validation \
  --repo /path/to/app \
  --json
```

If the repo is missing the pinned Playwright dependency, run:

```bash
node tools/context/ctx.mjs workflow deps \
  --workflow workflow.browser-validation \
  --repo /path/to/app \
  --write \
  --json
```

This updates `package.json` with an exact `@playwright/test` dev dependency pin. It does not install packages or create paid infrastructure. The operator still runs the repo's package-manager install command so the lockfile records the resolved tree.

Codex native browser plugins are treated as optional external runtime tools. They can help with interactive validation, but they are not the pinned source of truth for browser workflow readiness.

Pull request review uses `workflow.pull-request-review`:

```bash
node tools/context/ctx.mjs workflow deps \
  --workflow workflow.pull-request-review \
  --repo /path/to/app \
  --json

node tools/context/ctx.mjs tools check \
  --workflow workflow.pull-request-review \
  --step pr-review \
  --capability tool.shell \
  --json
```

This workflow is command-line first: agents inspect local state with `git`, inspect and mutate PR state with authenticated `gh`, leave review comments or requested changes, commit scoped fixes, push only the intended PR branch, re-check review and CI status, then merge with the repository's documented merge strategy. `gh auth status` must pass before any comment, push, status-check, or merge operation that talks to GitHub.

Run PR preflight before comments, pushes, or merges:

```bash
node tools/context/ctx.mjs pr preflight \
  --repo /path/to/app \
  --pr 123 \
  --json
```

The command is read-only. It returns git worktree state, `gh auth status`, optional PR metadata, review decision, status-check summary, blockers, and warnings. Dirty worktrees block by default; pass `--allow-dirty` only when the ticket explicitly accepts that local state.

### Validation Breakpoints

Browser validation has default breakpoints and runtime behavior so target repos get useful coverage without configuration:

- `mobile`: `390x844`
- `tablet`: `820x1180`
- `desktop`: `1440x900`
- `wide`: `1920x1080`

Generate the view-by-breakpoint matrix with:

```bash
node tools/context/ctx.mjs workflow validation-plan \
  --workflow workflow.browser-validation \
  --repo /path/to/app \
  --json
```

Target repos can override the matrix, test runner, screenshot location, CI gates, and deploy policy in `docs/config/repo-context.validation.json`:

```json
{
  "config_version": 1,
  "workflows": {
    "workflow.browser-validation": {
      "views": ["logged-out", "logged-in"],
      "breakpoints": [
        "mobile",
        "desktop",
        { "id": "small-height", "width": 1280, "height": 720 }
      ],
      "testing": {
        "runner": "playwright",
        "command": "npx playwright test",
        "config_file": "playwright.config.ts",
        "retries": { "local": 0, "ci": 2 }
      },
      "screenshots": {
        "output_dir": ".repo-context/artifacts/screenshots",
        "filename_template": "{workflow}/{view}/{breakpoint}.png"
      },
      "ci": {
        "provider": "auto",
        "required_gates": ["workflow-deps", "workflow-views", "workflow-validation-plan", "test-runner"],
        "artifact_paths": [".repo-context/artifacts/screenshots", "playwright-report", "test-results"],
        "block_deploy_on_failure": true
      },
      "deploy": {
        "enabled": false,
        "provider": "none",
        "requires_green_ci": true,
        "cost_estimate_required": true
      }
    }
  }
}
```

The command works when the config file is absent by using built-in defaults. It returns the normalized testing settings, screenshot path for each matrix row, CI gates/artifact paths, and deploy policy. A future smart TUI should edit this same config file so CLI, agents, and humans share one source of truth.

### Browser Views and Credentials

Browser workflows need to distinguish signed-out and signed-in validation. `workflow.browser-validation` declares two view states:

- `logged-out`: no credentials required.
- `logged-in`: uses the `browser-test-user` credential profile.

Check view readiness with:

```bash
node tools/context/ctx.mjs workflow views \
  --workflow workflow.browser-validation \
  --repo /path/to/app \
  --json
```

Check a credential profile without printing secret values:

```bash
node tools/context/ctx.mjs credentials check \
  --profile browser-test-user \
  --repo /path/to/app \
  --json
```

The default `browser-test-user` profile can be satisfied by:

- `BROWSER_TEST_EMAIL` and `BROWSER_TEST_PASSWORD` in the environment.
- `.repo-context/credentials/browser-test-user.env` in the target repo.
- `.repo-context/browser/browser-test-user.storage-state.json` in the target repo.

To copy an authenticated browser session into the target repo, first export a Playwright-compatible storage-state JSON file from the browser/tooling session, then import it:

```bash
node tools/context/ctx.mjs credentials import-browser-state \
  --profile browser-test-user \
  --from /path/to/storage-state.json \
  --repo /path/to/app \
  --write \
  --json
```

The import command validates the JSON shape and copies it to the profile's storage-state path. Output is redacted and only includes counts and paths. Repo-context does not scrape browser password stores. Target repos should keep `.repo-context/` untracked because storage-state files can contain live session cookies.

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

Use Semble as the default semantic code-discovery backend when target files are unknown. Keep discovery bounded and feed the results into context queries, ticket hydration, and implementation notes.

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
ctx customize --profile astrotechne --dry-run --json
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
- Enable a legacy ticket adapter for mature repos that already have a ticket tree, status command, and packet README convention.

Customization rules:

- Required axioms cannot be disabled.
- Customization must produce reviewable repo-local config or markdown.
- Dry-run output must show exactly which commands, exports, rules, and gates would change.
- Profiles should be named and diffable, not hidden agent memory.
- Customization is post-v0.1 and should not block the MVP pack.
- Capture customization requests first as future work, then promote them into a spec/ticket pack when the MVP workflow is stable.

### Astrotechne Adoption Profile

Astrotechne should use repo-context as an overlay first, not as a replacement for its existing ticket system.

Observed Astrotechne conventions to preserve:

- Executable tickets live under `docs/domain-redesign/tickets`.
- Ticket files use compact frontmatter such as `status`, `ticket_id`, `milestone`, `group`, `priority`, `depends_on`, `source_docs`, `created`, and `updated`.
- Packet directories use a `README.md` as the milestone or ticket-pack truth surface.
- `npm run tickets:status` is the authoritative executable-ticket audit. It treats `todo`, `blocked`, `in_progress`, and `review` as open; it treats `done`, `wont_do`, `template`, `completed`, `complete`, `implemented`, `planned`, `accepted`, and `implemented_pending_production_smoke` as closed or non-executable.
- No-status markdown under the ticket tree is historical or supporting documentation, not automatically executable work.
- Large public-surface packs work best as disjoint worker lanes plus a coordinator closeout commit.

Recommended rollout:

1. Add repo-context directories and generated agent packs without moving historical Astrotechne tickets.
2. Add high-value context entries for the surfaces that most often regress: public copy, chart workspace, report generation, Labs, billing/entitlements, engine-bound timing reports, deploy/runbooks, and design-system primitives.
3. Configure the `astrotechne` profile so `ctx` preserves the existing ticket root, status vocabulary, and `npm run tickets:status` gate.
4. Use Semble discovery to connect new context entries to existing files and packet README examples.
5. For new work, write repo-context-style specs and hydrated implementation tickets, but let them cite Astrotechne packet READMEs and existing ticket examples as source documents.
6. For legacy tickets, index them as references unless they are explicitly promoted into new repo-context tickets.
7. Keep completion truth strict: implementation tickets need validation evidence, screenshots when UI changes, and one clean commit per completed ticket.

The first Astrotechne pass should be a read-only bootstrap plus context capture. It should not rewrite the historical ticket tree or normalize 1,000+ older markdown files just to satisfy the new schema.

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
