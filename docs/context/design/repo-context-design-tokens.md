---
id: design.repo-context-tokens
kind: design
context_scan: true
status: active
title: Repo Context Design Tokens
routes:
  - /context-lab
files:
  - docs/context/components/context-entry-card.md
components:
  - component.ContextEntryCard
flows:
  - flow.repo-context-dogfood
tags:
  - design
  - tokens
  - catalog
positive_rules:
  - Prefer restrained metadata labels for context id, kind, status, and source path.
  - Use separate visual groups for positive rules and negative rules.
negative_rules:
  - Do not present negative rules as lower-priority suggestions.
  - Do not hide component status or source paths in catalog views.
load_when:
  path_matches:
    - components/context/**
    - docs/context/components/**
  task_terms:
    - design token
    - component catalog
updated: 2026-06-26
---

# Repo Context Design Tokens

## Purpose

Define lightweight visual conventions for rendering repo-context catalog entries in a target web app.

## Current Decisions

- Rule polarity is a first-class visual distinction.
- Metadata should stay compact enough for repeated scanning.
- Source markdown paths should be visible near rendered entries.

## Positive Rules

- Use compact labels for `id`, `kind`, `status`, and source path.
- Keep positive and negative rules in separate sections with clear headings.

## Negative Rules

- Do not make negative rules look optional.
- Do not bury source paths behind hover-only UI.

## Implementation Rules

- Reuse host app typography, spacing, and card/list primitives.
- Keep the catalog read-only unless a future ticket explicitly adds editing.
