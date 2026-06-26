---
id: ticket.context.001
status: draft
title: Add repo-local context markdown substrate
phase: 1
---

# Add Repo-Local Context Markdown Substrate

## Goal

Create the committed documentation structure that stores route, file, directory, component, flow, design, architecture, and feedback context.

## Scope

- Add `docs/context/` structure.
- Add schemas for context entries and feedback entries.
- Add starter README explaining the local workflow.
- Add examples for one route, one component, one flow, and one feedback item.

## Acceptance Criteria

- Context files use stable ids and frontmatter.
- Feedback entries include status, severity, source, and `applies_to`.
- Example entries can be parsed by the future CLI.
- The docs clearly state that markdown is source of truth and SQLite is generated.

## Verification

- Manual review of example entries.
- Schema validation if a schema tool is already present.

## Commit

One commit when complete: `Add repo context markdown substrate`
