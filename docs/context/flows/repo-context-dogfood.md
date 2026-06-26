---
id: flow.repo-context-dogfood
kind: flow
context_scan: true
status: active
title: Repo Context Dogfood Flow
routes:
  - /context-lab
files:
  - README.md
  - AGENTS.md
  - tools/context/ctx.mjs
components:
  - component.ContextEntryCard
flows: []
tags:
  - dogfood
  - tickets
  - validation
positive_rules:
  - Update markdown context in the same ticket when intentional behavior changes.
  - Validate the repo context graph before committing ticket work.
negative_rules:
  - Do not treat generated indexes as canonical truth.
  - Do not implement a ticket that still requires product or architecture decisions.
load_when:
  path_matches:
    - docs/context/**
    - docs/tickets/**
    - tools/context/**
  task_terms:
    - repo context
    - ticket pack
    - dogfood
updated: 2026-06-26
---

# Repo Context Dogfood Flow

## Purpose

Use this repository as the first fixture for the repo-local context, ticket, pack, validation, and agent skill workflow.

## Current Decisions

- Context files are committed markdown.
- Generated manifests and SQLite indexes are rebuildable.
- Tickets remain the implementation boundary for agent work.

## Positive Rules

- Keep docs, CLI behavior, and skill instructions aligned in the same ticket when they describe one behavior.
- Run context validation before marking ticket work complete.

## Negative Rules

- Do not skip markdown updates when code behavior intentionally changes.
- Do not let generated files become the only record of a decision.

## Implementation Rules

- Use this flow for repo-context implementation tickets.
- Prefer small commits that close a single ticket or a clearly bounded slice.
