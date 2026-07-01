---
id: config.repo-context-customization
status: draft
title: Repo Context Customization
updated: 2026-06-26
---

# Repo Context Customization

## Purpose

Document the post-v0.1 profile model for tuning repo-context workflows without weakening required validation gates.

## Profiles

- `minimal`: markdown, lint, and ticket checks only.
- `web-app`: adds component catalog, impact checks, and generated agent packs.
- `ui-heavy`: adds Claude UI review expectations to the web-app profile.
- `idvisor-orchestrated`: adds run orchestration and Idvisor workflow gates.
- `strict`: enables all local workflow features.

## Required Axioms

These axioms cannot be disabled by profile selection:

- `axiom.markdown-source-of-truth`
- `axiom.ticket-done-requires-commit`
- `axiom.rule-polarity-preserved`

## Command

```bash
node tools/context/ctx.mjs customize --profile strict --dry-run --json
node tools/context/ctx.mjs customize --profile web-app --write --out docs/config/repo-context.profile.json --json
```

## LOC Volume Targets

Use `docs/config/repo-context.loc.json` to track source volume for a repo or selected paths. `ctx loc` reports totals and target status without failing; `ctx loc check` enforces configured or inline targets.

```bash
node tools/context/ctx.mjs loc --repo . --json
node tools/context/ctx.mjs loc check --repo . --target-id repo-context-source --json
node tools/context/ctx.mjs loc check --repo . --path tools/context --max-lines 25000 --json
```

## Rules

- Customization is optional.
- Dry-run output should be reviewed before writing config.
- Generated config must not contain secrets.
- Required axioms remain enabled for every profile.
- LOC targets should use broad path ranges for repo health and narrower path ranges for known complexity hotspots.
