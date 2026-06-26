---
id: future.2026-06-25.agent-driven-customization
kind: future-work
status: promoted
title: Agent-driven workflow customization
captured_at: 2026-06-25
source: user
applies_to:
  routes: []
  files:
    - README.md
    - skills/repo-context/SKILL.md
  components: []
  flows:
    - flow.workflow-customization
promotion_target:
  spec: spec.agent-driven-customization
  ticket_pack: pack.repo-context-post-v0.1
  ticket: ticket.context.014
---

# Agent-Driven Workflow Customization

## Idea

Users should be able to turn workflow features on and off through an agent-guided setup process, likely backed by CLI dry-run and repo-local profile/config output.

## Why Later

- This should not block v0.1 because the default workflow must become usable before customization broadens the state space.
- The customization surface needs stable axioms, tickets, packs, and validation behavior first.

## Questions Before Promotion

- Which profiles should ship first: `minimal`, `web-app`, `ui-heavy`, `idvisor-orchestrated`, or `strict`?
- Which checks are required axioms versus optional profile toggles?
- Should customization config live in markdown, JSON, TOML, or generated agent packs?

## Promotion Notes

- Suggested spec: `spec.agent-driven-customization`
- Suggested ticket pack: `pack.repo-context-post-v0.1`
- Suggested validation: dry-run profile output plus proof required axioms cannot be disabled.
