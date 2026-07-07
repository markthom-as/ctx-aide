---
id: feedback.2026-06-26.substrate-examples
kind: feedback
status: accepted
severity: medium
source: implementation-audit
title: Context substrate needs committed examples
applies_to:
  routes:
    - /context-lab
  files:
    - docs/context/schema/context-entry.schema.json
    - docs/context/schema/feedback-entry.schema.json
    - tools/ctx-aide/ctx-aide.mjs
  components:
    - component.ContextEntryCard
  flows:
    - flow.ctx-aide-dogfood
tags:
  - context
  - validation
created: 2026-06-26
resolved_by:
  tickets:
    - ticket.context.001
---

# Context Substrate Needs Committed Examples

## Feedback

The context substrate is not daily-usable if it only contains empty directories. It needs schema files and representative entries that validators can inspect.

## Decision

Accepted. Add schema files plus one route, component, flow, and feedback example, then make lint validate their required fields and section structure.

## Regression Risk

Future changes could add malformed context markdown that still passes ticket and pack checks unless context entries are part of lint.
