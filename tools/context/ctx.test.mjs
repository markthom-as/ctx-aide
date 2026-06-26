#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const ctx = path.join(repoRoot, "tools/context/ctx.mjs");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "repo-context-"));

function commandExists(binary) {
  try {
    execFileSync("which", [binary], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function write(file, text) {
  const full = path.join(fixture, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text);
}

function run(args, options = {}) {
  try {
    return JSON.parse(execFileSync(process.execPath, [ctx, ...args, "--json"], {
      cwd: fixture,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }));
  } catch (error) {
    if (!options.allowFailure) throw error;
    return JSON.parse(error.stdout);
  }
}

write("docs/context/routes/context-lab.md", `---
id: route.context-lab
kind: route
context_scan: true
status: active
title: Context Lab
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
positive_rules:
  - Keep positive rules separate.
negative_rules:
  - Do not flatten negative rules.
load_when:
  path_matches:
    - app/context-lab/**
  task_terms:
    - context lab
updated: 2026-06-26
---

# Context Lab

## Purpose

Preview context entries.

## Current Decisions

- Markdown is canonical.

## Positive Rules

- Keep positive rules separate.

## Negative Rules

- Do not flatten negative rules.

## Implementation Rules

- Query this entry for context lab work.
`);

write("docs/context/routes/ignored.md", `<!-- repo-context: ignore -->

# Ignored
`);
write("src/auth.js", "export function authenticateUser() { return true; }\n");

const scan = run(["scan"]);
assert.equal(scan.ok, true);
assert.equal(scan.entry_count, 1);
assert.equal(scan.entries[0].id, "route.context-lab");
assert.equal(fs.existsSync(path.join(fixture, "docs/context/generated/context-manifest.json")), true);
if (commandExists("sqlite3")) {
  assert.equal(scan.sqlite_path, "docs/context/generated/context.sqlite");
  assert.equal(fs.existsSync(path.join(fixture, "docs/context/generated/context.sqlite")), true);
}

const manifest = JSON.parse(fs.readFileSync(path.join(fixture, scan.manifest_path), "utf8"));
assert.equal(manifest.entries.length, 1);
assert.equal(manifest.entries[0].id, "route.context-lab");
assert.equal(manifest.entries.some((entry) => entry.id === "route.ignored"), false);

const query = run([
  "query",
  "--path",
  "app/context-lab/page.tsx",
  "--task",
  "context lab rule polarity",
  "--agent",
  "codex",
  "--budget",
  "1200",
]);
assert.equal(query.ok, true);
assert.equal(query.entries.length, 1);
assert.equal(query.entries[0].id, "route.context-lab");
assert.deepEqual(query.entries[0].positive_rules, ["Keep positive rules separate."]);
assert.deepEqual(query.entries[0].negative_rules, ["Do not flatten negative rules."]);

const init = run(["init"]);
assert.equal(init.ok, true);
assert.equal(fs.existsSync(path.join(fixture, "docs/tickets/templates/canonical-ticket.md")), true);
assert.equal(fs.existsSync(path.join(fixture, "AGENTS.md")), true);
assert.equal(fs.existsSync(path.join(fixture, "CLAUDE.md")), true);
assert.equal(fs.existsSync(path.join(fixture, ".cursor/rules/repo-context.mdc")), true);

const secondInit = run(["init"], { allowFailure: true });
assert.equal(secondInit.ok, false);
assert.equal(secondInit.blocked.includes("AGENTS.md"), true);
assert.equal(secondInit.blocked.includes("CLAUDE.md"), true);
assert.equal(secondInit.skipped.includes("docs/tickets/templates/canonical-ticket.md"), true);

const fixtureLint = run(["lint"]);
assert.equal(fixtureLint.ok, true);

const codexPack = run(["export-agent", "--agent", "codex"]);
assert.equal(codexPack.ok, true);
assert.equal(codexPack.out, "docs/context/generated/agent-pack.codex.md");
assert.equal(fs.existsSync(path.join(fixture, codexPack.out)), true);

const cursorPack = run(["export-agent", "--agent", "cursor"]);
assert.equal(cursorPack.ok, true);
assert.equal(cursorPack.out, ".cursor/rules/generated/repo-context.mdc");
assert.equal(fs.existsSync(path.join(fixture, cursorPack.out)), true);

const componentList = run(["components", "list"]);
assert.equal(componentList.ok, true);
assert.equal(componentList.count, 0);

const noBackendDiscovery = run(["discover", "--backend", "none", "--task", "known path", "--out", "docs/context/generated/discovery.none.json"]);
assert.equal(noBackendDiscovery.ok, true);
assert.equal(noBackendDiscovery.out, "docs/context/generated/discovery.none.json");
assert.equal(fs.existsSync(path.join(fixture, "docs/context/generated/discovery.none.json")), true);

write("audit-pass.mjs", "process.exit(0);\n");
write("audit-fail.mjs", "process.stderr.write('2 vulnerabilities found\\nSeverity: 1 moderate | 1 high\\n│ Package             │ next                                                   │\\n'); process.exit(1);\n");
const clearedAudit = run(["dependency", "audit", "--repo", ".", "--command", `"${process.execPath}" audit-pass.mjs`]);
assert.equal(clearedAudit.ok, true);
assert.equal(clearedAudit.audit_cleared, true);

const failedAudit = run(["dependency", "audit", "--repo", ".", "--command", `"${process.execPath}" audit-fail.mjs`], { allowFailure: true });
assert.equal(failedAudit.ok, false);
assert.equal(failedAudit.audit_cleared, false);
assert.equal(failedAudit.vulnerabilities.total, 2);
assert.deepEqual(failedAudit.vulnerable_packages, ["next"]);

write("docs/specs/dependency-upgrade.md", `---
id: spec.dependency-upgrade
status: draft
title: Dependency Upgrade
owner_agent: codex-high-effort
source_feedback: []
context_ids: []
target_agents:
  spec:
    - codex-high-effort
  implementation: codex
created: 2026-06-26
---

# Dependency Upgrade

## Goal

Clear dependency audit findings.

## Affected Surfaces

- Files/directories: package manifests.

## Product Decisions

- Decision: audit must clear.

## Architecture Decisions

- Decision: no architecture change.
- Rationale: dependency update only.
- Rejected alternatives: ignore audit findings.

## Design Decisions

- Decision: no UI change.
- Components/tokens to use: none.
- Anti-patterns to avoid: unrelated UI changes.

## Security and Privacy Decisions

- Data touched: package metadata.
- Trust boundaries: dependency registry.
- Required safeguards: audit evidence.

## Open Questions

None.

## Hardening Review

- Architecture: bounded dependency update.
- Design: not applicable.
- Security: audit must clear.
- Best practices: keep lockfile reviewable.
- Testing: run audit.
- Parallelization: single package lane.

## Ticket Plan

- Independent tickets: dependency audit clear.
- Sequential tickets: none.
- Shared files that require coordination: package manifests.
`);

write("docs/tickets/done/dependency-upgrade-missing-audit.md", `---
id: ticket.test.dependency-upgrade
status: done
title: Dependency upgrade clears audit
work_type: dependency-upgrade
ticket_pack: pack.test.dependency-upgrade
milestones:
  - milestone.test
source_spec: spec.dependency-upgrade
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: deps-a
depends_on: []
blocks: []
scope:
  routes: []
  files:
    - package.json
  directories: []
  components: []
  flows: []
context_query:
  task: "dependency upgrade clears audit"
  generated_at: 2026-06-26
  context_ids: []
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
validation:
  automated:
    - Run dependency audit.
  smoke: []
  screenshots: []
completion:
  commit: test-commit
  completed_at: 2026-06-26
---

# Dependency Upgrade Clears Audit

## Outcome

Clear dependency audit findings.

## Context

Dependency upgrades must distinguish implementation from audit clearance.

## Positive Rules

- Preserve package manager lockfile integrity.

## Negative Rules

- Do not mark done while the audit still fails.

## Axioms

- axiom.markdown-source-of-truth: Markdown remains canonical.

## Frozen Decisions

- Audit evidence is required.

## Implementation Rules

- Required approach: update dependencies.

## Scope

- In: package manifests.
- Out: unrelated changes.

## Acceptance Criteria

- Dependency audit clears.

## Validation

- Run dependency audit.

## Completion

- Status: done
- Commit: test-commit
- Verification evidence: pending audit.
`);

const missingAuditTicketCheck = run(["ticket", "check"], { allowFailure: true });
assert.equal(missingAuditTicketCheck.ok, false);
assert.equal(missingAuditTicketCheck.errors.some((error) => error.message.includes("completion.dependency_audit: cleared")), true);

write("docs/tickets/done/dependency-upgrade-missing-audit.md", fs
  .readFileSync(path.join(fixture, "docs/tickets/done/dependency-upgrade-missing-audit.md"), "utf8")
  .replace("completion:\n  commit: test-commit\n  completed_at: 2026-06-26", "completion:\n  commit: test-commit\n  completed_at: 2026-06-26\n  dependency_audit: cleared\n  dependency_audit_command: pnpm audit --prod\n  dependency_audit_checked_at: 2026-06-26T00:00:00.000Z"));

const dependencyTicketCheck = run(["ticket", "check"]);
assert.equal(dependencyTicketCheck.ok, true);

if (commandExists("rg")) {
  const rgDiscovery = run(["discover", "--backend", "ripgrep", "--task", "authenticateUser", "--repo", ".", "--limit", "2"]);
  assert.equal(rgDiscovery.ok, true);
  assert.equal(rgDiscovery.matches.length, 1);
  assert.equal(rgDiscovery.matches[0].file.replace(/^\.\//, ""), "src/auth.js");
}

fs.rmSync(fixture, { recursive: true, force: true });
process.stdout.write("ctx tests passed\n");
