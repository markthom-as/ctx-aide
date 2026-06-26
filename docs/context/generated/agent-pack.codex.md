# Repo Context Pack: codex

Generated from markdown source. Do not edit generated packs by hand.

Prioritize implementation constraints, validation commands, source paths, and rule polarity.

## component.ContextEntryCard

- Kind: component
- Status: proposed
- Source: docs/context/components/context-entry-card.md
- Summary: Summarize one context entry in a lightweight catalog without replacing the markdown source file.
- Positive rules:
  - Display id, kind, status, source path, and short summary.
  - Keep positive rules and negative rules in separate labeled sections.
- Negative rules:
  - Do not collapse negative rules into generic notes.
  - Do not use this component to edit canonical markdown directly.

## design.repo-context-tokens

- Kind: design
- Status: active
- Source: docs/context/design/repo-context-design-tokens.md
- Summary: Define lightweight visual conventions for rendering repo-context catalog entries in a target web app.
- Positive rules:
  - Prefer restrained metadata labels for context id, kind, status, and source path.
  - Use separate visual groups for positive rules and negative rules.
- Negative rules:
  - Do not present negative rules as lower-priority suggestions.
  - Do not hide component status or source paths in catalog views.

## feedback.2026-06-26.substrate-examples

- Kind: feedback
- Status: accepted
- Source: docs/context/feedback/2026-06-26-substrate-examples.md
- Summary: The context substrate is not daily-usable if it only contains empty directories. It needs schema files and representative entries that validators can inspect.

## flow.repo-context-dogfood

- Kind: flow
- Status: active
- Source: docs/context/flows/repo-context-dogfood.md
- Summary: Use this repository as the first fixture for the repo-local context, ticket, pack, validation, and agent skill workflow.
- Positive rules:
  - Update markdown context in the same ticket when intentional behavior changes.
  - Validate the repo context graph before committing ticket work.
- Negative rules:
  - Do not treat generated indexes as canonical truth.
  - Do not implement a ticket that still requires product or architecture decisions.

## route.context-lab

- Kind: route
- Status: proposed
- Source: docs/context/routes/context-lab.md
- Summary: Provide a local route concept for previewing repo-context entries, component catalog records, and rule polarity in a web app.
- Positive rules:
  - Render context entries from markdown-derived registry data.
  - Keep positive and negative rules visually distinct.
- Negative rules:
  - Do not make the context lab the canonical authoring surface.
  - Do not hide scan exclusions from review output.

