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
      env: { ...process.env, ...(options.env ?? {}) },
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

const blockedOutsideOut = run(["export-agent", "--agent", "codex", "--out", path.join(os.tmpdir(), "repo-context-outside-agent.md")], { allowFailure: true });
assert.equal(blockedOutsideOut.ok, false);
assert.equal(blockedOutsideOut.errors[0].message.includes("escapes repo"), true);

write("audit-pass.mjs", "process.exit(0);\n");
write("audit-fail.mjs", "process.stderr.write('2 vulnerabilities found\\nSeverity: 1 moderate | 1 high\\n│ Package             │ next                                                   │\\n'); process.exit(1);\n");
const clearedAudit = run(["dependency", "audit", "--repo", ".", "--command", `"${process.execPath}" audit-pass.mjs`]);
assert.equal(clearedAudit.ok, true);
assert.equal(clearedAudit.audit_cleared, true);
assert.equal(clearedAudit.shell, false);
assert.deepEqual(clearedAudit.command_argv, [process.execPath, "audit-pass.mjs"]);

const shellAudit = run(["dependency", "audit", "--repo", ".", "--command", "exit 0", "--shell"]);
assert.equal(shellAudit.ok, true);
assert.equal(shellAudit.shell, true);
assert.equal(shellAudit.command_argv, null);

const blockedAuditOut = run(["dependency", "audit", "--repo", ".", "--command", `"${process.execPath}" audit-pass.mjs`, "--out", "../outside-audit.json"], { allowFailure: true });
assert.equal(blockedAuditOut.ok, false);
assert.equal(blockedAuditOut.errors[0].message.includes("escapes repo"), true);

const failedAudit = run(["dependency", "audit", "--repo", ".", "--command", `"${process.execPath}" audit-fail.mjs`], { allowFailure: true });
assert.equal(failedAudit.ok, false);
assert.equal(failedAudit.audit_cleared, false);
assert.equal(failedAudit.vulnerabilities.total, 2);
assert.deepEqual(failedAudit.vulnerable_packages, ["next"]);

write("docs/workflows/browser-validation.md", `---
id: workflow.browser-validation
status: active
title: Browser Validation Workflow
workflow_dependencies:
  - node
  - package-manager-lockfile
  - playwright
optional_workflow_dependencies:
  - codex-native-browser-plugin
workflow_views:
  - logged-out
  - logged-in
credential_profiles:
  - browser-test-user
updated: 2026-06-26
---

# Browser Validation Workflow
`);
write("package.json", `${JSON.stringify({ name: "fixture-app", private: true }, null, 2)}\n`);
const missingWorkflowDeps = run(["workflow", "deps", "--workflow", "workflow.browser-validation", "--repo", "."], { allowFailure: true });
assert.equal(missingWorkflowDeps.ok, false);
assert.equal(missingWorkflowDeps.workflows[0].dependencies.some((dependency) => dependency.id === "playwright" && dependency.pinned === false), true);

const wroteWorkflowDeps = run(["workflow", "deps", "--workflow", "workflow.browser-validation", "--repo", ".", "--write"], { allowFailure: true });
assert.equal(wroteWorkflowDeps.ok, false);
assert.equal(wroteWorkflowDeps.workflows[0].writes.some((writeRow) => writeRow.package_name === "@playwright/test"), true);
const workflowPackage = JSON.parse(fs.readFileSync(path.join(fixture, "package.json"), "utf8"));
assert.equal(workflowPackage.devDependencies["@playwright/test"], "1.61.1");

write("package-lock.json", "{}\n");
const pinnedWorkflowDeps = run(["workflow", "deps", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(pinnedWorkflowDeps.ok, true);

const missingViewCredentials = run(["workflow", "views", "--workflow", "workflow.browser-validation", "--repo", "."], { allowFailure: true });
assert.equal(missingViewCredentials.ok, false);
assert.equal(missingViewCredentials.workflows[0].views.find((view) => view.id === "logged-out").ready, true);
assert.equal(missingViewCredentials.workflows[0].views.find((view) => view.id === "logged-in").ready, false);

const blockedValidationPlan = run(["workflow", "validation-plan", "--workflow", "workflow.browser-validation", "--repo", "."], { allowFailure: true });
assert.equal(blockedValidationPlan.ok, false);
assert.equal(blockedValidationPlan.workflows[0].matrix.length, 8);
assert.equal(blockedValidationPlan.workflows[0].ready, false);
assert.equal(blockedValidationPlan.errors.some((error) => error.message.includes("logged-in")), true);

const envCredentials = run(["credentials", "check", "--profile", "browser-test-user", "--repo", "."], {
  env: {
    BROWSER_TEST_EMAIL: "agent@example.test",
    BROWSER_TEST_PASSWORD: "secret-password",
  },
});
assert.equal(envCredentials.ok, true);
assert.equal(JSON.stringify(envCredentials).includes("secret-password"), false);

write("browser-export.storage-state.json", `${JSON.stringify({
  cookies: [{ name: "session", value: "secret-cookie", domain: "example.test", path: "/" }],
  origins: [],
}, null, 2)}\n`);
const importedState = run([
  "credentials",
  "import-browser-state",
  "--profile",
  "browser-test-user",
  "--repo",
  ".",
  "--from",
  "browser-export.storage-state.json",
  "--write",
]);
assert.equal(importedState.ok, true);
assert.equal(importedState.storage_state.cookies, 1);
assert.equal(JSON.stringify(importedState).includes("secret-cookie"), false);
assert.equal(fs.existsSync(path.join(fixture, ".repo-context/browser/browser-test-user.storage-state.json")), true);

const readyViewCredentials = run(["workflow", "views", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(readyViewCredentials.ok, true);

const defaultValidationPlan = run(["workflow", "validation-plan", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(defaultValidationPlan.ok, true);
assert.equal(defaultValidationPlan.workflows[0].breakpoints.length, 4);
assert.equal(defaultValidationPlan.workflows[0].matrix.length, 8);
assert.equal(defaultValidationPlan.workflows[0].matrix.some((item) => item.id === "logged-in:desktop"), true);
assert.equal(defaultValidationPlan.workflows[0].testing.runner, "playwright");
assert.equal(defaultValidationPlan.workflows[0].screenshots.output_dir, ".repo-context/artifacts/screenshots");
assert.equal(defaultValidationPlan.workflows[0].ci.block_deploy_on_failure, true);
assert.equal(defaultValidationPlan.workflows[0].deploy.cost_estimate_required, true);
assert.equal(defaultValidationPlan.workflows[0].matrix.find((item) => item.id === "logged-out:mobile").screenshot_path, ".repo-context/artifacts/screenshots/browser-validation/logged-out/mobile.png");

write("docs/config/repo-context.validation.json", `${JSON.stringify({
  config_version: 1,
  workflows: {
    "workflow.browser-validation": {
      views: ["logged-out"],
      breakpoints: ["mobile", { id: "compact", width: 500, height: 700, purpose: "Custom compact viewport" }],
      testing: {
        runner: "vitest-browser",
        command: "pnpm exec vitest --browser",
      },
      screenshots: {
        output_dir: "artifacts/screens",
        filename_template: "{view}-{breakpoint}.png",
      },
      ci: {
        required_gates: ["unit", "browser"],
      },
      deploy: {
        enabled: true,
        provider: "vercel",
        settings_file: "vercel.json",
        postdeploy_smoke_commands: ["ctx workflow validation-plan --workflow workflow.browser-validation --repo . --json"],
      },
    },
  },
}, null, 2)}\n`);
const configuredValidationPlan = run(["workflow", "validation-plan", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(configuredValidationPlan.ok, true);
assert.equal(configuredValidationPlan.config.exists, true);
assert.equal(configuredValidationPlan.workflows[0].views.length, 1);
assert.equal(configuredValidationPlan.workflows[0].breakpoints.length, 2);
assert.equal(configuredValidationPlan.workflows[0].matrix.map((item) => item.id).join(","), "logged-out:mobile,logged-out:compact");
assert.equal(configuredValidationPlan.workflows[0].testing.runner, "vitest-browser");
assert.equal(configuredValidationPlan.workflows[0].screenshots.output_dir, "artifacts/screens");
assert.deepEqual(configuredValidationPlan.workflows[0].ci.required_gates, ["unit", "browser"]);
assert.equal(configuredValidationPlan.workflows[0].deploy.provider, "vercel");
assert.equal(configuredValidationPlan.workflows[0].deploy.cost_estimate_required, true);
assert.equal(configuredValidationPlan.workflows[0].matrix[0].screenshot_path, "artifacts/screens/logged-out-mobile.png");

write("docs/config/repo-context.validation.json", `${JSON.stringify({
  config_version: 1,
  workflows: {
    "workflow.browser-validation": {
      breakpoints: [{ id: "broken", width: 0, height: 700 }],
      deploy: {
        enabled: true,
        cost_estimate_required: false,
      },
    },
  },
}, null, 2)}\n`);
const invalidValidationPlan = run(["workflow", "validation-plan", "--workflow", "workflow.browser-validation", "--repo", "."], { allowFailure: true });
assert.equal(invalidValidationPlan.ok, false);
assert.equal(invalidValidationPlan.errors.some((error) => error.message.includes("invalid width")), true);
assert.equal(invalidValidationPlan.errors.some((error) => error.message.includes("cost_estimate_required")), true);

const adoptedRepo = path.join(fixture, "target-app");
fs.mkdirSync(adoptedRepo, { recursive: true });
fs.writeFileSync(path.join(adoptedRepo, "package.json"), `${JSON.stringify({ name: "target-app", private: true }, null, 2)}\n`);
fs.writeFileSync(path.join(adoptedRepo, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
const adoptionDryRun = run(["adoption", "bootstrap", "--repo", adoptedRepo, "--profile", "wetware"]);
assert.equal(adoptionDryRun.ok, true);
assert.equal(adoptionDryRun.write, false);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/repo-context.profile.json")), false);

const unbootstrappedAdoptionStatus = run(["adoption", "status", "--repo", adoptedRepo, "--profile", "wetware"], { allowFailure: true });
assert.equal(unbootstrappedAdoptionStatus.ok, false);
assert.equal(unbootstrappedAdoptionStatus.profile.profile, "wetware");
assert.equal(unbootstrappedAdoptionStatus.context.count, 0);
assert.equal(unbootstrappedAdoptionStatus.blockers.some((blocker) => blocker.includes("repo-context.profile.json")), true);

const adoptionBootstrap = run(["adoption", "bootstrap", "--repo", adoptedRepo, "--profile", "wetware", "--write"]);
assert.equal(adoptionBootstrap.ok, true);
assert.equal(adoptionBootstrap.profile.profile, "wetware");
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/repo-context.profile.json")), true);

const adoptedContext = run([
  "adoption",
  "context",
  "--repo",
  adoptedRepo,
  "--kind",
  "flow",
  "--title",
  "Dependency Audit Clearance",
  "--slug",
  "dependency-audit-clearance",
  "--path",
  "package.json,pnpm-lock.yaml",
  "--task",
  "dependency audit clearance",
  "--positive-rule",
  "Preserve lockfile integrity.",
  "--negative-rule",
  "Do not mark dependency work done until the audit clears.",
  "--write",
]);
assert.equal(adoptedContext.ok, true);
assert.equal(adoptedContext.context.id, "flow.dependency-audit-clearance");
assert.equal(fs.existsSync(path.join(adoptedRepo, adoptedContext.context.file)), true);

const bootstrappedAdoptionStatus = run(["adoption", "status", "--repo", adoptedRepo, "--profile", "wetware"]);
assert.equal(bootstrappedAdoptionStatus.ok, true);
assert.equal(bootstrappedAdoptionStatus.config.exists, true);
assert.equal(bootstrappedAdoptionStatus.context.count, 1);
assert.equal(bootstrappedAdoptionStatus.blockers.length, 0);
assert.equal(bootstrappedAdoptionStatus.warnings.some((warning) => warning.includes("generated context manifest")), true);

const adoptedTicket = run([
  "adoption",
  "ticket",
  "--repo",
  adoptedRepo,
  "--profile",
  "wetware",
  "--title",
  "Clear Dependency Audit",
  "--slug",
  "clear-dependency-audit",
  "--task",
  "dependency audit clearance",
  "--work-type",
  "dependency-upgrade",
  "--context",
  "flow.dependency-audit-clearance",
  "--file",
  "package.json,pnpm-lock.yaml",
  "--validation",
  "ctx dependency audit --repo . --command 'pnpm audit --prod' --json",
  "--write",
]);
assert.equal(adoptedTicket.ok, true);
assert.equal(adoptedTicket.ticket.file, "docs/tickets/clear-dependency-audit.md");
assert.equal(fs.existsSync(path.join(adoptedRepo, adoptedTicket.ticket.file)), true);

const adoptedPlan = run([
  "adoption",
  "implementation-plan",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
]);
assert.equal(adoptedPlan.ok, true);
assert.equal(adoptedPlan.explicit_context_loading, true);
assert.deepEqual(adoptedPlan.context_ids, ["flow.dependency-audit-clearance"]);
assert.equal(adoptedPlan.entries[0].body, undefined);
assert.equal(adoptedPlan.validation_commands.some((command) => command.includes("dependency audit")), true);

fs.writeFileSync(path.join(adoptedRepo, "docs/tickets/legacy-dependency-ticket.md"), `---
status: done
ticket_id: WG-DEPS-LEGACY
work_type: dependency-upgrade
source_docs:
  - package.json
  - pnpm-lock.yaml
---

# Ticket: Clear Production Dependency Audit

## Verification

- \`ctx dependency audit --repo . --command "pnpm audit --prod" --json\`
`);
const legacyPlan = run([
  "adoption",
  "implementation-plan",
  "--repo",
  adoptedRepo,
  "--ticket",
  "docs/tickets/legacy-dependency-ticket.md",
]);
assert.equal(legacyPlan.ok, true);
assert.equal(legacyPlan.ticket.id, "WG-DEPS-LEGACY");
assert.equal(legacyPlan.ticket.title, "Clear Production Dependency Audit");
assert.equal(legacyPlan.target_paths.includes("package.json"), true);
assert.equal(legacyPlan.validation_commands.some((command) => command.includes("pnpm audit --prod")), true);

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
