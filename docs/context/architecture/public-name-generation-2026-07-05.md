---
id: architecture.public-name-generation-2026-07-05
kind: architecture
context_scan: true
status: active
title: Public Name Generation Brief
files:
  - README.md
  - tools/context/ctx.mjs
  - docs/specs/public-release-2026-07-01.md
flows:
  - flow.repo-context-dogfood
tags:
  - public-release
  - naming
  - positioning
positive_rules:
  - Use this brief as the rationale trail for the CTX Aide name decision.
  - Prefer names that fit the actual repo-local workflow surface instead of generic AI branding.
negative_rules:
  - Do not reopen rejected names without a fresh collision and positioning review.
  - Do not rename commands, remotes, package names, or generated artifact paths from this brief alone.
load_when:
  path_matches:
    - README.md
    - docs/specs/public-release-2026-07-01.md
    - docs/ticket-packs/**
  task_terms:
    - public name
    - naming
    - shortlist
    - brand
updated: 2026-07-05
---

# Public Name Generation Brief

## Purpose

Document the repo's actual feature and workflow surface, then use that inventory to generate and record public-name candidates.

The resulting public-name decision selected **CTX Aide** as the public display name and `ctx-aide` as the package-facing name if a future publishing ticket proceeds. It exists because the first selected name, `Repo Charter`, felt too formal and needed to be replaced after a more grounded naming pass.

## Product Shape

The product is a local-first workflow system for coding agents. It turns repo-local markdown into a durable working substrate for planning, implementation, review, validation, and handoff.

The public name should make sense for a developer tool, not a hosted platform, PM suite, governance body, or generic AI assistant.

## Current Decisions

- CTX Aide is the selected public display name.
- `ctx-aide` is the selected package-facing name if a future publishing ticket proceeds.
- `repo-context` remains the current repository name.
- `ctx` remains the current command namespace until a dedicated rename ticket exists.

## Positive Rules

- Use CTX Aide when public copy needs the product name.
- Use `ctx-aide` only for future package-facing references and blocked publishing plans.
- Keep the repo-local context, ticket, validation, and handoff workflow as the naming anchor.

## Negative Rules

- Do not revive Repo Charter as the public name.
- Do not use package-facing names in install instructions until owner, license, and registry publishing decisions are explicit.
- Do not rename commands, remotes, package names, or generated artifact paths from this brief alone.

## Implementation Rules

- Treat this brief as rationale for the canonical public-name decision.
- Update `docs/context/architecture/public-name-decision-2026-07-05.md` before changing README, launch metadata, or public examples.
- Run `ctx scan`, `ctx spec check`, `ctx ticket check`, and `ctx pack check` after changing public-name context.

## Feature Inventory

- Repo-local markdown context for routes, files, directories, components, flows, design rules, architecture decisions, and feedback.
- Context scanning from markdown into generated manifest and SQLite cache artifacts.
- Context querying by path, task, agent, and budget so agents load scoped guidance instead of broad chat history.
- Agent-pack export for Codex, Claude, and Cursor adapter surfaces.
- Spec authoring and hardening as the planning source before implementation.
- Atomic markdown tickets with scope, frozen decisions, implementation rules, acceptance criteria, validation, and completion evidence.
- Ticket packs with milestones, dependencies, parallel groups, run policy, blocked state, and final validation.
- Ticket hydration and adoption implementation plans that load only scoped context for a target ticket.
- Repo adoption preflight for target repos, including profile detection, bootstrap planning, context creation, pack creation, and ticket creation.
- Capability policy for allowed and denied tools, skills, and connectors at global, workflow, and step levels.
- Browser workflow dependency checks, view readiness checks, screenshot matrix planning, CI gates, and deploy-cost policy.
- Credential readiness checks and browser storage-state import for validation workflows.
- Feedback planning, review, capture, decomposition, and promotion into rules, axioms, and follow-up tickets.
- Future-work capture so non-blocking ideas are retained without bloating current tickets.
- Dependency audit command wrapper with safer execution and structured evidence.
- LOC measurement and enforcement for repo and path-scoped source-volume targets.
- Component catalog and impact lookup for UI/component-aware context.
- Public-release safety and launch gates for history scans, generated artifacts, license, owner, and visibility decisions.
- Doctor, lint, spec check, ticket check, pack check, future check, and scan checks as local proof surfaces.

## Workflow Inventory

- **Describe to spec**: capture a rough goal, affected surfaces, constraints, and outcome.
- **Spec hardening**: review architecture, design, security, best practices, testing, and parallelization before implementation.
- **Spec to tickets**: split a hardened spec into atomic ready tickets with frozen decisions and validation.
- **Ticket pack execution**: group related tickets, declare dependencies and parallel groups, and coordinate shared files.
- **Implementation handoff**: implementation agents load scoped context and execute without inventing missing product, design, architecture, or security decisions.
- **Validation closeout**: run ticket-defined checks, smoke tests, screenshots when relevant, and record verification evidence.
- **Commit per ticket**: each completed ticket gets one clean commit and completion metadata.
- **Context scan and query**: regenerate local cache artifacts and query context by path/task before coding.
- **Agent-pack generation**: produce Codex, Claude, and Cursor-facing context packs from the same markdown source.
- **Target repo adoption**: inspect another repo, bootstrap config, seed context, create packs/tickets, and hydrate implementation plans.
- **Workflow validation planning**: check browser dependencies, credential-backed views, breakpoint matrix, screenshot paths, CI gates, and deploy cost policy.
- **Capability policy checks**: evaluate whether an agent/tool/connector is allowed for a workflow step before using it.
- **Feedback to work**: turn review feedback into durable context, candidate rules, axioms, and follow-up tickets.
- **Future-work capture**: preserve useful non-blocking ideas for later promotion.
- **Public release gate**: block publication until name, safety, docs, demo, owner, license, and launch metadata are resolved.

## Naming Criteria

- Short enough to remember and say in conversation.
- More developer-tool than governance concept.
- Local-first, repo-native, and workflow-oriented.
- Compatible with a CLI that can stay named `ctx`.
- Broad enough to cover context, specs, tickets, validation, adoption, and handoff.
- Not over-AI-branded; avoid names that sound like a chatbot, agent runtime, hosted SaaS, compliance framework, or PM product.
- Avoid names that lean on `charter`, `pact`, `accord`, `protocol`, `agent`, or `AI`.
- Package, GitHub, domain, and trademark checks are required before final selection or publishing.

## Semantic Axes

- **Context substrate**: names about ground, base, lattice, weave, trail, map, field, or layer.
- **Handoff and continuity**: names about relay, pass, thread, baton, bridge, or continuity.
- **Proof and validation**: names about checks, marks, proofs, gates, ledgers, or traces.
- **Spec and ticket flow**: names about plans, notes, work units, packets, or rails.
- **Local repo truth**: names about root, source, field, notebook, workspace, or forge.

## Candidate List

### Strongest Direction

- `Trellis`: structured support for growing work; good fit for context plus tickets, but needs collision review.
- `Keel`: stable underside of the work; concise and serious, but less immediately descriptive.
- `Lattice`: structured cross-links between context, specs, tickets, and validation.
- `Relay`: strong handoff metaphor for human-to-agent and agent-to-agent work.
- `Fieldnote`: local, practical, durable notes; softer and less infrastructure-heavy.
- `Groundline`: repo truth as the line implementation follows.
- `Tracewell`: traceability plus completion quality.
- `Worktrail`: work history, tickets, validation, and handoff.
- `Anchorfile`: local source of truth; concrete but possibly too file-specific.
- `Runline`: workflow execution path; concise but may sound CI-focused.

### Context And Substrate

- `Groundline`
- `Groundwork`
- `Lattice`
- `Trellis`
- `Rootline`
- `Sourcefield`
- `Basepath`
- `Localbase`
- `Contextline`
- `Fieldbase`
- `Workfield`
- `Codefield`
- `Mapline`
- `Threadbase`
- `Tracefield`

### Handoff And Continuity

- `Relay`
- `Relayline`
- `Baton`
- `Handrail`
- `Wayline`
- `Threadline`
- `Passage`
- `Bridgework`
- `Continuo`
- `Nextmark`
- `Carryline`
- `Runrelay`
- `Workpass`
- `Handoff`
- `Linkline`

### Proof And Validation

- `Proofline`
- `Checkline`
- `Tracewell`
- `Tracekit`
- `Proofmark`
- `Gatewell`
- `Runproof`
- `Markline`
- `Verifyline`
- `Evidence`
- `Ledgerline`
- `Clearline`
- `Donepath`
- `Passmark`
- `Checkfield`

### Spec And Ticket Flow

- `Planmark`
- `Planline`
- `Specline`
- `Specmark`
- `Taskline`
- `Ticketline`
- `Workpacket`
- `Packetline`
- `Runbook`
- `Fieldbook`
- `Worknote`
- `Taskwell`
- `Noteflow`
- `Planbase`
- `Scopewell`

### Coined Or Softer Names

- `Trellis`
- `Keel`
- `Cairn`
- `Quire`
- `Folio`
- `Notch`
- `Waymark`
- `Threadmark`
- `Proofleaf`
- `Speclet`
- `Markwell`
- `Taskwell`
- `Runwell`
- `Groundmark`
- `Fieldmark`

## Initial Ranking

1. `Trellis`: best overall metaphor for structured local support, but likely needs careful collision review because it is a common product word.
2. `Lattice`: strongest fit for linked context and workflow graph, but slightly abstract.
3. `Relay`: best expression of handoff, but weaker on validation and repo-local truth.
4. `Fieldnote`: most human and local, but less obviously a developer tool.
5. `Groundline`: good repo-truth metaphor, but may feel heavier.
6. `Keel`: memorable and concise, but requires more explanation.
7. `Tracewell`: strongest validation/traceability angle, but more coined.
8. `Worktrail`: descriptive and clear, but less distinctive.
9. `Proofline`: clear validation signal, but too narrow if used for the whole product.
10. `Planmark`: captures specs/tickets, but weaker on context and handoff.

## Intent-Sentence Candidate Pass

These candidates are generated from the current intent sentence:

> This repo is a repo-native operating system for coding-agent work: markdown context, specs, tickets, validation, and handoff rules that let agents implement safely from durable repo truth instead of chat history.

### Operating System / Substrate

- `WorkOS`: clear but likely too collided and too broad.
- `RepoOS`: direct but too literal.
- `AgentOS`: clear but too AI-branded and likely crowded.
- `ContextOS`: direct but broad.
- `Workkernel`: captures the operating-system metaphor without claiming to be an OS.
- `Repokernel`: precise but too repo-prefixed.
- `Taskkernel`: practical, task-oriented, and moderately technical.
- `Kernelnote`: softer, but may sound like a note app.
- `Workcore`: simple and broad.
- `Taskcore`: simple, but more PM-flavored.

### Durable Repo Truth

- `Sourcewell`: repo truth as a well agents draw from.
- `Truthwell`: direct but possibly too grand.
- `Groundsource`: grounded source of implementation truth.
- `Sourceline`: implementation follows the source line.
- `Rootnote`: local, repo-root, markdown note feel.
- `Rootline`: concise repo-root truth metaphor.
- `Sourcebook`: readable, but may sound like docs only.
- `Groundnote`: softer working-note version of repo truth.
- `Basebook`: local reference manual, but possibly generic.
- `Workroot`: clear but utilitarian.

### Context, Tickets, And Handoff

- `Handoff`: perfectly descriptive, but likely too generic.
- `Handrail`: agents stay on the rail; nice safety metaphor.
- `Taskrail`: tickets and validation as rails for agent work.
- `Workrail`: broader than Taskrail.
- `Relay`: best short handoff metaphor.
- `Relaybook`: handoff plus repo-local handbook.
- `Threadrail`: context thread plus guardrail.
- `Threadline`: continuity through work.
- `Ticketrail`: very descriptive, but narrows the product.
- `Contextrail`: broad and descriptive, but a little clunky.

### Validation And Safe Implementation

- `Proofline`: implementation follows proof/validation.
- `Checkrail`: checks as guardrails.
- `Safeline`: safe implementation path, but generic.
- `Proofrail`: stronger validation metaphor.
- `Tracepath`: traceability through specs, tickets, and commits.
- `Tracebase`: stored traceable repo truth.
- `Clearpath`: clean implementation path, but common.
- `Gatepath`: validation gates plus implementation path.
- `Donepath`: ticket closeout focus.
- `Passline`: validation pass plus line of work.

### Softer Product Names

- `Trellis`: structured support for growing work.
- `Lattice`: linked context/spec/ticket structure.
- `Keel`: stability under agent work.
- `Cairn`: durable trail markers for future agents.
- `Quire`: markdown pages gathered into a working book.
- `Folio`: durable project pages, but docs-heavy.
- `Fieldnote`: working notes from the repo field.
- `Waymark`: markers that keep work oriented.
- `Notch`: small durable marks in the workflow.
- `Tally`: status/evidence/completion feel.

## Second-Pass Shortlist

1. `Handrail`: best blend of safety, implementation guidance, and not sounding like governance.
2. `Trellis`: best broad product metaphor for structured support.
3. `Sourcewell`: strongest repo-truth metaphor.
4. `Relay`: strongest handoff metaphor.
5. `Taskrail`: clearest ticket/validation execution metaphor.
6. `Rootline`: concise repo-root truth metaphor.
7. `Proofline`: strongest validation evidence metaphor.
8. `Lattice`: best for linked context and graph structure.
9. `Fieldnote`: softest local markdown working-note option.
10. `Workkernel`: best operating-system metaphor without using `OS`.

## Agent-Aide Pass

These candidates came from the assistant/helper direction after the user asked for a word around "minion / assistant / etc." The strongest semantic lane was aide, scribe, clerk, page, or helper rather than minion.

- `CTX Aide`: selected. It keeps the existing `ctx` identity and frames the product as a practical context aide for coding agents.
- `ctx-aide`: selected as the future package-facing name if publishing proceeds.
- `Context Aide`: viable expanded form, but `CTX Aide` is shorter and better aligned with the existing CLI.
- `Aide`: rejected as too broad and too crowded.
- `Scriba`: strong markdown/scribe meaning, but less pragmatic and less tied to `ctx`.
- `Agent Notes`: clear but too generic.
- `Agent Runbook`: semantically good but too occupied in same-category package and GitHub surfaces.
- `Agent Aide`: clear but broader and more AI-assistant sounding than the repo's context substrate.

## Names To Avoid For Now

- `Repo Charter`: rejected by user preference and too governance-like.
- `Concordat`: unavailable because it is a separate local project.
- `Workmark`: live search surfaced an existing scoped npm package and workspace-tooling description.
- `Trailmark`: live checks surfaced an existing Trail of Bits source-code graph project plus occupied package names.
- `Specrail`: too close to an existing spec-first agent-workflow project.
- `Context Accord`: too close to Accord ecosystem naming.
- `Agent Loom` and `Context Loom`: adjacent agent-workflow usage already exists.
- `Context Ledger`: too generic and adjacent to existing AI context ledger usage.

## Future Publishing Check

Before publishing a package, renaming a command, registering a domain, or claiming a commercial mark, run a fresh collision check for `CTX Aide`, `ctx-aide`, and any normalized variants across:

- GitHub repositories and organizations.
- npm package names, including scoped-package adjacency.
- PyPI packages.
- crates.io packages.
- Domain availability if a domain is likely.
- Obvious trademark or same-category product conflicts.

Only after that pass should package-manager install instructions or command/package renames move from blocked planning into implementation.
