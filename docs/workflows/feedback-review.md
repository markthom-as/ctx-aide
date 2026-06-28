---
id: workflow.feedback-review
status: active
title: Feedback Review Workflow
workflow_dependencies:
  - node
optional_workflow_dependencies:
  - playwright
updated: 2026-06-28
---

# Feedback Review Workflow

## Purpose

Turn screenshot and artifact review into a guided repo-local loop instead of a manual process where operators open files, inspect URLs, and rewrite notes into tickets by hand.

## Stages

1. Generate or collect screenshot artifacts during ticket validation.
2. Build a review packet with `ctx feedback review --repo <repo> --ticket <ticket> --screenshot <path> --url <url> --json`.
3. Inspect the packet fields for ticket status, URL, scoped files, changed files, screenshot path, byte size, and image dimensions.
4. Capture operator feedback with `ctx feedback capture --repo <repo> --ticket <ticket> --title "<title>" --body "<feedback>" --screenshot <path> --url <url> --write --json`.
5. Resolve clarification prompts before implementation when the feedback does not define the correct behavior or promotion target.
6. Promote clear feedback with `ctx feedback promote --mode acceptance-criteria` when it should tighten the current ticket.
7. Promote separate work with `ctx feedback promote --mode follow-up-ticket` when it should become a new atomic ticket.

## Readiness Gates

- Visual tickets should include reviewable screenshot paths in validation evidence.
- Review packets must be JSON-readable and must not require an interactive prompt.
- Feedback entries must live under `docs/context/feedback/` and remain the source of truth.
- Ambiguous feedback should produce clarifying questions before becoming implementation-ready work.
- Follow-up tickets generated from feedback should start outside `done` and be hardened before implementation.
- Acceptance-criteria promotion must keep the original ticket as the source of truth for current-ticket completion.

## Artifact Policy

- Screenshot artifacts should be repo-relative when possible.
- Review packets should include URL, existence, byte size, image width, image height, and image format when the file is present.
- Missing artifacts are allowed in the packet, but they should block visual-ticket completion until evidence is available.
- `.repo-context/artifacts/` remains a local artifact area unless a target repo explicitly chooses to commit selected evidence.

## Feedback Policy

- Feedback entries are context entries with `kind: feedback`.
- `status: proposed` means the feedback has been captured but not yet accepted, rejected, resolved, or superseded.
- Feedback may be promoted into acceptance criteria for the current ticket or into a new follow-up ticket.
- The system should ask questions when feedback is too vague to implement safely, when it lacks a target surface, or when the operator has not said whether it blocks current work.

## Validation

- `ctx feedback review --repo <repo> --ticket <ticket> --screenshot <path> --url <url> --json`
- `ctx feedback capture --repo <repo> --ticket <ticket> --title "<title>" --body "<feedback>" --write --json`
- `ctx feedback promote --repo <repo> --feedback <feedback-id-or-path> --ticket <ticket> --mode acceptance-criteria --write --json`
- `ctx feedback promote --repo <repo> --feedback <feedback-id-or-path> --ticket <ticket> --mode follow-up-ticket --write --json`
