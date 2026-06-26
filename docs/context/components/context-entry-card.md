---
id: component.ContextEntryCard
kind: component
context_scan: true
status: proposed
title: Context Entry Card
name: ContextEntryCard
import_path: "@/components/context/ContextEntryCard"
files:
  - components/context/ContextEntryCard.tsx
components: []
flows:
  - flow.repo-context-dogfood
tags:
  - context
  - component-catalog
positive_rules:
  - Display id, kind, status, source path, and short summary.
  - Keep positive rules and negative rules in separate labeled sections.
negative_rules:
  - Do not collapse negative rules into generic notes.
  - Do not use this component to edit canonical markdown directly.
load_when:
  path_matches:
    - components/context/**
  task_terms:
    - context entry
    - component catalog
updated: 2026-06-26
---

# Context Entry Card

## Purpose

Summarize one context entry in a lightweight catalog without replacing the markdown source file.

## Current Decisions

- The card is read-only for v0.1.
- The source markdown path is always visible.

## Positive Rules

- Use compact metadata labels for id, kind, status, and source path.
- Keep rule polarity visible without requiring the user to open the markdown file.

## Negative Rules

- Do not add inline editing in the catalog card.
- Do not hide deprecated or proposed status labels.

## Implementation Rules

- Use existing app card/list primitives when integrating into a target app.
- Link to the source markdown path whenever the host environment supports it.
