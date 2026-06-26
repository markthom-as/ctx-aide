---
id: route.context-lab
kind: route
context_scan: true
status: proposed
title: Context Lab Route
routes:
  - /context-lab
files:
  - app/context-lab/page.tsx
components:
  - component.ContextEntryCard
flows:
  - flow.repo-context-dogfood
tags:
  - context
  - catalog
positive_rules:
  - Render context entries from markdown-derived registry data.
  - Keep positive and negative rules visually distinct.
negative_rules:
  - Do not make the context lab the canonical authoring surface.
  - Do not hide scan exclusions from review output.
load_when:
  path_matches:
    - app/context-lab/**
  task_terms:
    - context lab
    - component catalog
updated: 2026-06-26
---

# Context Lab Route

## Purpose

Provide a local route concept for previewing repo-context entries, component catalog records, and rule polarity in a web app.

## Current Decisions

- Markdown remains the authoring surface.
- The lab reads generated registry data and links back to source markdown.

## Positive Rules

- Show source markdown paths next to rendered entries.
- Preserve positive and negative rules as separate groups.

## Negative Rules

- Do not allow route UI edits to bypass markdown review.
- Do not render ignored files in the lab.

## Implementation Rules

- Treat this as an optional app integration surface, not a required v0.1 dependency.
- Query this context when implementing a future local catalog route.
