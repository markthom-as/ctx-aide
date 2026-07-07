---
id: workflow.feedback-review
status: active
title: Feedback Review Workflow
workflow_dependencies:
  - node
optional_workflow_dependencies:
  - playwright
updated: 2026-07-07
---

# Feedback Review Workflow

## Purpose

Turn screenshot and artifact review into a guided repo-local loop instead of a manual process where operators open files, inspect URLs, and rewrite notes into tickets by hand.

## Stages

1. Generate or collect screenshot artifacts during ticket validation.
2. Build a review packet with `ctx feedback review --repo <repo> --ticket <ticket> --screenshot <path> --url <url> --json`.
3. Inspect the packet fields for ticket status, URL, scoped files, changed files, screenshot path, byte size, and image dimensions.
4. For visual review across many screenshots, opt into the beta UI through onboarding with `ctx adoption bootstrap --repo <repo> --enable-screenshot-feedback-ui --write --json` or later settings with `ctx settings set --repo <repo> --feature screenshot-feedback-review-ui --enabled true --write --json`.
5. Start the local UI with `ctx feedback review-ui --repo <repo> --screenshot-dir .repo-context/artifacts/screenshots --port 0`.
6. In the UI, record per-screenshot status, severity, title, tags, and feedback notes; use bullets or `--- ticket ---` separators for independently actionable issues.
7. Review the proposed ticket split stop before writing files; the UI must not write ticket markdown until the operator confirms the draft plan.
8. Plan a natural-language feedback response with `ctx feedback plan --repo <repo> --ticket <ticket> --body "<feedback>" --json` when working in the JSON-only path.
9. Split the response into distinct feedback points, then split any mixed point again when it covers multiple behaviors, surfaces, or acceptance checks.
10. Extract candidate positive rules, negative rules, and axioms from durable operator wording when appropriate.
11. Offer the operator suggested interpretations, rule/axiom candidates, and clarification questions before writing tickets when the correct outcome or promotion target is ambiguous.
12. Capture operator feedback with `ctx feedback capture --repo <repo> --ticket <ticket> --title "<title>" --body "<feedback>" --screenshot <path> --url <url> --write --json`.
13. Promote clear feedback with `ctx feedback promote --mode acceptance-criteria` when it should tighten the current ticket.
14. Promote separate work with `ctx feedback promote --mode follow-up-ticket` when it should become a new atomic ticket.

## Readiness Gates

- Visual tickets should include reviewable screenshot paths in validation evidence.
- Review packets must be JSON-readable and must not require an interactive prompt.
- Feedback entries must live under `docs/context/feedback/` and remain the source of truth.
- Ambiguous feedback should produce clarifying questions before becoming implementation-ready work.
- Multi-point feedback must be decomposed before promotion; mixed points should be split again before tickets are created.
- The review UI must preview split ticket candidates before any markdown files are written.
- Review UI generated tickets must start in `needs-questions` so screenshot feedback cannot bypass ticket hardening.
- The review UI is a beta feature and must be disabled by default in `docs/config/repo-context.settings.json`.
- Onboarding may enable the beta only when `--enable-screenshot-feedback-ui` is explicit.
- Agents should offer suggested ticket titles, promotion modes, and clarifying questions instead of asking blank-ended questions.
- Durable operator wording such as "always", "never", "must", "do not", or "should not" should produce candidate rules or axioms for user confirmation.
- Candidate rules and axioms are suggestions until captured in markdown and accepted through the normal ticket/context lifecycle.
- Follow-up tickets generated from feedback should start outside `done` and be hardened before implementation.
- Acceptance-criteria promotion must keep the original ticket as the source of truth for current-ticket completion.

## Artifact Policy

- Screenshot artifacts should be repo-relative when possible.
- The review UI serves only screenshot paths discovered from the selected run or screenshot directory.
- Review packets should include URL, existence, byte size, image width, image height, and image format when the file is present.
- Missing artifacts are allowed in the packet, but they should block visual-ticket completion until evidence is available.
- `.repo-context/artifacts/` remains a local artifact area unless a target repo explicitly chooses to commit selected evidence.
- `ctx feedback review-ui` is local-only, binds to `127.0.0.1`, remains optional beta setup, and has an expected cost delta of `$0/month`.

## Feedback Policy

- Feedback entries are context entries with `kind: feedback`.
- `status: proposed` means the feedback has been captured but not yet accepted, rejected, resolved, or superseded.
- Feedback may be promoted into acceptance criteria for the current ticket or into a new follow-up ticket.
- The system should ask questions when feedback is too vague to implement safely, when it lacks a target surface, or when the operator has not said whether it blocks current work.
- When the operator gives several points in one response, the agent should first propose a split plan and then write one feedback entry or ticket per distinct action.
- When one point combines separate concerns, the agent should suggest subpoints and ask whether to split before implementation.
- When feedback states a reusable preference or prohibition, the agent should propose positive rules, negative rules, and `axiom.feedback.*` candidates.
- Generated follow-up tickets should carry relevant rule and axiom candidates into their Positive Rules, Negative Rules, and Axioms sections.
- UI-generated screenshot tickets are canonical ticket markdown, but remain non-ready until hardened and attached to the appropriate pack/status lifecycle.

## Validation

- `ctx feedback review --repo <repo> --ticket <ticket> --screenshot <path> --url <url> --json`
- `ctx settings get --repo <repo> --json`
- `ctx settings set --repo <repo> --feature screenshot-feedback-review-ui --enabled true --write --json`
- `ctx feedback review-ui --repo <repo> --screenshot-dir .repo-context/artifacts/screenshots --port 0`
- `ctx feedback review-ui --repo <repo> --plan-only --json`
- `ctx feedback plan --repo <repo> --ticket <ticket> --body "<natural feedback>" --json`
- `ctx feedback capture --repo <repo> --ticket <ticket> --title "<title>" --body "<feedback>" --write --json`
- `ctx feedback promote --repo <repo> --feedback <feedback-id-or-path> --ticket <ticket> --mode acceptance-criteria --write --json`
- `ctx feedback promote --repo <repo> --feedback <feedback-id-or-path> --ticket <ticket> --mode follow-up-ticket --write --json`
