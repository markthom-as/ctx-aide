---
id: future.2026-06-26.smart-tui-validation-config
kind: future-work
status: captured
title: Smart TUI for Validation Configuration
captured_at: 2026-06-26
source: user
applies_to:
  routes: []
  files:
    - docs/config/repo-context.validation.json
    - tools/context/ctx.mjs
  components: []
  flows:
    - flow.repo-context-dogfood
promotion_target:
  spec: null
  ticket_pack: null
  ticket: null
---

# Smart TUI for Validation Configuration

## Idea

Add a smart terminal UI that guides operators through configuring workflow validation views, breakpoints, credential profiles, and browser validation defaults.

## Why Later

- The current milestone needs a deterministic config-file contract first.
- A TUI should edit `docs/config/repo-context.validation.json` instead of becoming a second source of truth.
- The interaction design should be hardened after more workflows use the config contract.

## Questions Before Promotion

- Should the TUI support only validation config or all repo-context workflow config?
- Should it detect available app routes and recommend route-specific validation matrices?
- Should it generate Playwright project entries, repo-context config only, or both?

## Promotion Notes

- Suggested spec: `spec.smart-tui-validation-config`
- Suggested ticket pack: `pack.repo-context-smart-tui-validation-config`
- Suggested validation: fixture-driven TUI dry-run output plus config round-trip tests.
