#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildScreenshotReviewState,
  buildTicketDraftPlan,
  generateTicketDrafts,
  savePostedFeedback,
} from "./screenshot-review-ui.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ctxAide = path.join(repoRoot, "tools/ctx-aide/ctx-aide.mjs");
const buildScript = path.join(repoRoot, "scripts/build.mjs");
const installScript = path.join(repoRoot, "scripts/install-local.mjs");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "ctx-aide-"));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
assert.deepEqual(Object.keys(packageJson.bin), ["ctxa"]);
assert.equal(packageJson.bin.ctxa, "./tools/ctx-aide/ctx-aide.mjs");
assert.equal(packageJson.bin["ctx-aide"], undefined);
assert.equal(packageJson.scripts.build, "node scripts/build.mjs");
assert.equal(packageJson.scripts["install:local"], "node scripts/install-local.mjs");
assert.equal(packageJson.scripts["install:global"], "node scripts/install-local.mjs --global");
assert.equal(packageJson.files.includes("scripts/*.mjs"), true);
assert.equal(execFileSync(process.execPath, [buildScript, "--help"], { encoding: "utf8" }).includes("--pack-destination <dir>"), true);
assert.equal(execFileSync(process.execPath, [installScript, "--help"], { encoding: "utf8" }).includes("--prefix <path>"), true);

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
    return JSON.parse(execFileSync(process.execPath, [ctxAide, ...args, "--json"], {
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

const helpOutput = execFileSync(process.execPath, [ctxAide, "--help"], {
  cwd: fixture,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
assert.equal(helpOutput.includes("ctxa lint --json"), true);
assert.equal(helpOutput.includes("ctx-aide lint --json"), false);
const jsonHelp = run(["--help"]);
assert.equal(jsonHelp.ok, true);
assert.equal(jsonHelp.usage.includes("ctxa adoption status --repo <target-repo> --profile auto --json"), true);

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
  - flow.ctx-aide-dogfood
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

write("docs/context/routes/ignored.md", `<!-- ctx-aide: ignore -->

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
assert.equal(fs.existsSync(path.join(fixture, ".cursor/rules/ctx-aide.mdc")), true);

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
assert.equal(cursorPack.out, ".cursor/rules/generated/ctx-aide.mdc");
assert.equal(fs.existsSync(path.join(fixture, cursorPack.out)), true);

const componentList = run(["components", "list"]);
assert.equal(componentList.ok, true);
assert.equal(componentList.count, 0);

write("src/feature.ts", "export const first = 1;\n\nexport const second = 2;\n");
write("node_modules/pkg/index.js", "module.exports = 1;\n");
write("docs/context/generated/generated.js", "const generated = true;\n");
write("docs/config/ctx-aide.loc.json", `${JSON.stringify({
  config_version: 1,
  targets: {
    source: {
      paths: ["src"],
      max_lines: 3,
      line_kind: "nonblank_lines",
    },
  },
}, null, 2)}\n`);
const loc = run(["loc", "--limit", "100"]);
assert.equal(loc.ok, true);
assert.equal(loc.config.exists, true);
assert.equal(loc.targets.find((target) => target.id === "source").actual_lines, 3);
assert.equal(loc.targets.find((target) => target.id === "source").status, "within_range");
assert.equal(loc.largest_files.some((file) => file.file.includes("node_modules")), false);
assert.equal(loc.largest_files.some((file) => file.file.includes("docs/context/generated")), false);

const locCheck = run(["loc", "check", "--target-id", "source"]);
assert.equal(locCheck.ok, true);

const locCheckViolation = run(["loc", "check", "--path", "src", "--max-lines", "1"], { allowFailure: true });
assert.equal(locCheckViolation.ok, false);
assert.equal(locCheckViolation.errors.some((error) => error.message.includes("LOC target cli is over")), true);

const defaultToolsList = run(["tools", "list"]);
assert.equal(defaultToolsList.ok, true);
assert.equal(defaultToolsList.config.exists, false);
assert.equal(defaultToolsList.catalog.capabilities.some((capability) => capability.id === "tool.semble"), true);
assert.equal(defaultToolsList.policy.global.deny.includes("app.gmail"), true);

write("docs/config/ctx-aide.tools.json", `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa", "custom.internal-linter"],
    deny: ["app.gmail"],
  },
  capabilities: {
    "custom.internal-linter": {
      kind: "tool",
      source: "repo-config",
      risk: "low",
      purpose: "Run a repo-local lint wrapper.",
    },
  },
}, null, 2)}\n`);
const configuredToolsList = run(["tools", "list", "--capability", "custom.internal-linter"]);
assert.equal(configuredToolsList.ok, true);
assert.equal(configuredToolsList.config.exists, true);
assert.equal(configuredToolsList.catalog.count, 1);
assert.equal(configuredToolsList.catalog.capabilities[0].purpose, "Run a repo-local lint wrapper.");
assert.deepEqual(configuredToolsList.policy.global.allow, ["custom.internal-linter", "tool.ctxa"]);
const customCapabilityCheck = run(["tools", "check", "--capability", "custom.internal-linter"]);
assert.equal(customCapabilityCheck.ok, true);
assert.equal(customCapabilityCheck.decision.allowed, true);
const deniedGlobalCapability = run(["tools", "check", "--capability", "app.gmail"], { allowFailure: true });
assert.equal(deniedGlobalCapability.ok, false);
assert.equal(deniedGlobalCapability.decision.deny_layers.includes("global"), true);

const noBackendDiscovery = run(["discover", "--backend", "none", "--task", "known path", "--out", "docs/context/generated/discovery.none.json"]);
assert.equal(noBackendDiscovery.ok, true);
assert.equal(noBackendDiscovery.out, "docs/context/generated/discovery.none.json");
assert.equal(fs.existsSync(path.join(fixture, "docs/context/generated/discovery.none.json")), true);

const blockedOutsideOut = run(["export-agent", "--agent", "codex", "--out", path.join(os.tmpdir(), "ctx-aide-outside-agent.md")], { allowFailure: true });
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
write("docs/config/ctx-aide.tools.json", `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa", "tool.playwright"],
    deny: ["app.gmail"],
  },
  workflows: {
    "workflow.browser-validation": {
      allow: ["tool.chrome-devtools"],
      steps: {
        "browser-smoke": {
          allow: ["tool.playwright", "tool.computer-use", "app.gmail"],
          deny: ["tool.computer-use"],
        },
      },
    },
  },
}, null, 2)}\n`);
const stepPolicy = run([
  "tools",
  "policy",
  "--workflow",
  "workflow.browser-validation",
  "--step",
  "browser-smoke",
  "--capability",
  "tool.playwright",
]);
assert.equal(stepPolicy.ok, true);
assert.equal(stepPolicy.decision.allowed, true);
assert.equal(stepPolicy.policy.effective.allow.includes("tool.chrome-devtools"), true);
const workflowAllowedTool = run(["tools", "check", "--workflow", "workflow.browser-validation", "--capability", "tool.chrome-devtools"]);
assert.equal(workflowAllowedTool.ok, true);
const stepDeniedTool = run([
  "tools",
  "check",
  "--workflow",
  "workflow.browser-validation",
  "--step",
  "browser-smoke",
  "--capability",
  "tool.computer-use",
], { allowFailure: true });
assert.equal(stepDeniedTool.ok, false);
assert.equal(stepDeniedTool.decision.deny_layers.includes("step:browser-smoke"), true);
const denyWinsTool = run([
  "tools",
  "check",
  "--workflow",
  "workflow.browser-validation",
  "--step",
  "browser-smoke",
  "--capability",
  "app.gmail",
], { allowFailure: true });
assert.equal(denyWinsTool.ok, false);
assert.equal(denyWinsTool.decision.deny_layers.includes("global"), true);
write("docs/config/ctx-aide.tools.json", `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa", "tool.unknown"],
    deny: ["tool.ctxa"],
  },
  workflows: {
    "workflow.missing": {
      allow: ["tool.playwright"],
    },
  },
}, null, 2)}\n`);
const invalidToolsPolicyLint = run(["lint"], { allowFailure: true });
assert.equal(invalidToolsPolicyLint.ok, false);
assert.equal(invalidToolsPolicyLint.errors.some((error) => error.message.includes("unknown capability")), true);
assert.equal(invalidToolsPolicyLint.errors.some((error) => error.message.includes("cannot both allow and deny tool.ctxa")), true);
assert.equal(invalidToolsPolicyLint.errors.some((error) => error.message.includes("unknown workflow policy: workflow.missing")), true);
write("docs/config/ctx-aide.tools.json", `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa", "tool.playwright"],
    deny: ["app.gmail"],
  },
  workflows: {
    "workflow.browser-validation": {
      allow: ["tool.chrome-devtools"],
      steps: {
        "browser-smoke": {
          allow: ["tool.playwright", "tool.computer-use", "app.gmail"],
          deny: ["tool.computer-use"],
        },
      },
    },
  },
}, null, 2)}\n`);

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

if (commandExists("git")) {
  const prRepo = path.join(fixture, "pr-fixture");
  fs.mkdirSync(prRepo, { recursive: true });
  execFileSync("git", ["init"], { cwd: prRepo, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "agent@example.test"], { cwd: prRepo, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Agent Test"], { cwd: prRepo, stdio: "ignore" });
  fs.writeFileSync(path.join(prRepo, "README.md"), "# PR Fixture\n");
  execFileSync("git", ["add", "README.md"], { cwd: prRepo, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "Initial fixture"], { cwd: prRepo, stdio: "ignore" });

  const fakeBin = path.join(fixture, "fake-bin");
  fs.mkdirSync(fakeBin, { recursive: true });
  const fakeGh = path.join(fakeBin, "gh");
  fs.writeFileSync(fakeGh, `#!/bin/sh
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
  echo "Logged in to github.com as agent"
  echo "Token: gho_fixturesecret"
  exit 0
fi
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  cat <<'JSON'
{"number":12,"title":"Fixture PR","author":{"login":"contributor"},"headRefName":"feature/pr-fixture","baseRefName":"main","url":"https://github.com/example/repo/pull/12","isDraft":false,"reviewDecision":"APPROVED","mergeStateStatus":"CLEAN","statusCheckRollup":[{"name":"test","status":"COMPLETED","conclusion":"SUCCESS"}]}
JSON
  exit 0
fi
echo "unexpected gh args: $*" >&2
exit 1
`);
  fs.chmodSync(fakeGh, 0o755);
  const fakeEnv = { PATH: `${fakeBin}${path.delimiter}${process.env.PATH}` };
  const localPreflight = run(["pr", "preflight", "--repo", "pr-fixture"], { env: fakeEnv });
  assert.equal(localPreflight.ok, true);
  assert.equal(localPreflight.git.dirty, false);
  assert.equal(localPreflight.gh.authenticated, true);
  assert.equal(localPreflight.gh.auth_output_excerpt.includes("gho_fixturesecret"), false);
  assert.equal(localPreflight.gh.auth_output_excerpt.includes("[redacted-token]"), true);
  assert.equal(localPreflight.pr, null);
  assert.equal(localPreflight.warnings.some((warning) => warning.includes("no --pr provided")), true);

  const prPreflight = run(["pr", "preflight", "--repo", "pr-fixture", "--pr", "12"], { env: fakeEnv });
  assert.equal(prPreflight.ok, true);
  assert.equal(prPreflight.pr.number, 12);
  assert.equal(prPreflight.pr.status_checks.passed, 1);
  assert.equal(prPreflight.warnings.some((warning) => warning.includes("does not match PR head")), true);

  fs.writeFileSync(fakeGh, `#!/bin/sh
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
  echo "Logged in to github.com as agent"
  exit 0
fi
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  cat <<'JSON'
{"number":13,"title":"Blocked PR","author":{"login":"contributor"},"headRefName":"main","baseRefName":"main","url":"https://github.com/example/repo/pull/13","isDraft":true,"reviewDecision":"CHANGES_REQUESTED","mergeStateStatus":"DIRTY","statusCheckRollup":[{"name":"test","status":"COMPLETED","conclusion":"FAILURE"},{"name":"lint","status":"IN_PROGRESS","conclusion":null}]}
JSON
  exit 0
fi
exit 1
`);
  const blockedPrPreflight = run(["pr", "preflight", "--repo", "pr-fixture", "--pr", "13"], { env: fakeEnv, allowFailure: true });
  assert.equal(blockedPrPreflight.ok, false);
  assert.equal(blockedPrPreflight.blockers.some((blocker) => blocker.includes("draft")), true);
  assert.equal(blockedPrPreflight.blockers.some((blocker) => blocker.includes("CHANGES_REQUESTED")), true);
  assert.equal(blockedPrPreflight.pr.status_checks.failed, 1);
  assert.equal(blockedPrPreflight.pr.status_checks.pending, 1);

  fs.writeFileSync(path.join(prRepo, "dirty.txt"), "dirty\n");
  const dirtyPreflight = run(["pr", "preflight", "--repo", "pr-fixture"], { env: fakeEnv, allowFailure: true });
  assert.equal(dirtyPreflight.ok, false);
  assert.equal(dirtyPreflight.blockers.some((blocker) => blocker.includes("worktree has")), true);
}

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
assert.equal(fs.existsSync(path.join(fixture, ".ctx-aide/browser/browser-test-user.storage-state.json")), true);

const readyViewCredentials = run(["workflow", "views", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(readyViewCredentials.ok, true);

const defaultValidationPlan = run(["workflow", "validation-plan", "--workflow", "workflow.browser-validation", "--repo", "."]);
assert.equal(defaultValidationPlan.ok, true);
assert.equal(defaultValidationPlan.workflows[0].breakpoints.length, 4);
assert.equal(defaultValidationPlan.workflows[0].matrix.length, 8);
assert.equal(defaultValidationPlan.workflows[0].matrix.some((item) => item.id === "logged-in:desktop"), true);
assert.equal(defaultValidationPlan.workflows[0].testing.runner, "playwright");
assert.equal(defaultValidationPlan.workflows[0].screenshots.output_dir, ".ctx-aide/artifacts/screenshots");
assert.equal(defaultValidationPlan.workflows[0].ci.block_deploy_on_failure, true);
assert.equal(defaultValidationPlan.workflows[0].deploy.cost_estimate_required, true);
assert.equal(defaultValidationPlan.workflows[0].matrix.find((item) => item.id === "logged-out:mobile").screenshot_path, ".ctx-aide/artifacts/screenshots/browser-validation/logged-out/mobile.png");

write("docs/config/ctx-aide.validation.json", `${JSON.stringify({
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
        postdeploy_smoke_commands: ["ctxa workflow validation-plan --workflow workflow.browser-validation --repo . --json"],
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

write("docs/config/ctx-aide.validation.json", `${JSON.stringify({
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
assert.equal(adoptionDryRun.changes.some((change) => change.file === "docs/config/ctx-aide.tools.json" && change.action === "planned"), true);
assert.equal(adoptionDryRun.changes.some((change) => change.file === "docs/config/ctx-aide.settings.json" && change.action === "planned"), true);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.profile.json")), false);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.settings.json")), false);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.tools.json")), false);

const unbootstrappedAdoptionStatus = run(["adoption", "status", "--repo", adoptedRepo, "--profile", "wetware"], { allowFailure: true });
assert.equal(unbootstrappedAdoptionStatus.ok, false);
assert.equal(unbootstrappedAdoptionStatus.profile.profile, "wetware");
assert.equal(unbootstrappedAdoptionStatus.context.count, 0);
assert.equal(unbootstrappedAdoptionStatus.settings.exists, false);
assert.equal(unbootstrappedAdoptionStatus.tools_policy.exists, false);
assert.equal(unbootstrappedAdoptionStatus.blockers.some((blocker) => blocker.includes("ctx-aide.profile.json")), true);
assert.equal(unbootstrappedAdoptionStatus.blockers.some((blocker) => blocker.includes("ctx-aide.settings.json")), true);
assert.equal(unbootstrappedAdoptionStatus.blockers.some((blocker) => blocker.includes("ctx-aide.tools.json")), true);

const adoptionBootstrap = run(["adoption", "bootstrap", "--repo", adoptedRepo, "--profile", "wetware", "--write"]);
assert.equal(adoptionBootstrap.ok, true);
assert.equal(adoptionBootstrap.profile.profile, "wetware");
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.profile.json")), true);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.settings.json")), true);
assert.equal(fs.existsSync(path.join(adoptedRepo, "docs/config/ctx-aide.tools.json")), true);
const bootstrappedSettingsText = fs.readFileSync(path.join(adoptedRepo, "docs/config/ctx-aide.settings.json"), "utf8");
assert.equal(bootstrappedSettingsText.includes('"screenshot_feedback_review_ui"'), true);
assert.equal(bootstrappedSettingsText.includes('"enabled": false'), true);

const enabledBootstrapRepo = path.join(fixture, "enabled-bootstrap-app");
fs.mkdirSync(enabledBootstrapRepo, { recursive: true });
fs.writeFileSync(path.join(enabledBootstrapRepo, "package.json"), `${JSON.stringify({ name: "enabled-bootstrap-app", private: true }, null, 2)}\n`);
const enabledBootstrap = run([
  "adoption",
  "bootstrap",
  "--repo",
  enabledBootstrapRepo,
  "--profile",
  "default",
  "--enable-screenshot-feedback-ui",
  "--write",
]);
assert.equal(enabledBootstrap.ok, true);
const enabledBootstrapSettings = JSON.parse(fs.readFileSync(path.join(enabledBootstrapRepo, "docs/config/ctx-aide.settings.json"), "utf8"));
assert.equal(enabledBootstrapSettings.features.screenshot_feedback_review_ui.enabled, true);

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
assert.equal(bootstrappedAdoptionStatus.settings.exists, true);
assert.equal(bootstrappedAdoptionStatus.settings.features.screenshot_feedback_review_ui.enabled, false);
assert.equal(bootstrappedAdoptionStatus.settings.features.screenshot_feedback_review_ui.stability, "beta");
assert.equal(bootstrappedAdoptionStatus.tools_policy.exists, true);
assert.equal(bootstrappedAdoptionStatus.tools_policy.ok, true);
assert.equal(bootstrappedAdoptionStatus.context.count, 1);
assert.equal(bootstrappedAdoptionStatus.blockers.length, 0);
assert.equal(bootstrappedAdoptionStatus.warnings.some((warning) => warning.includes("generated context manifest")), true);

fs.writeFileSync(path.join(adoptedRepo, "docs/config/ctx-aide.tools.json"), `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa"],
    deny: ["tool.ctxa"],
  },
}, null, 2)}\n`);
const invalidTargetToolsPolicyStatus = run(["adoption", "status", "--repo", adoptedRepo, "--profile", "wetware"], { allowFailure: true });
assert.equal(invalidTargetToolsPolicyStatus.ok, false);
assert.equal(invalidTargetToolsPolicyStatus.tools_policy.ok, false);
assert.equal(invalidTargetToolsPolicyStatus.blockers.some((blocker) => blocker.includes("invalid tools policy")), true);
run(["adoption", "bootstrap", "--repo", adoptedRepo, "--profile", "wetware", "--write", "--force"]);
fs.writeFileSync(path.join(adoptedRepo, "docs/workflows/target-implementation.md"), `---
id: workflow.target-implementation
status: active
title: Target Implementation Workflow
updated: 2026-06-27
---

# Target Implementation Workflow
`);
fs.writeFileSync(path.join(adoptedRepo, "docs/config/ctx-aide.tools.json"), `${JSON.stringify({
  config_version: 1,
  global: {
    allow: ["tool.ctxa", "tool.semble"],
    deny: ["app.gmail"],
  },
  workflows: {
    "workflow.target-implementation": {
      steps: {
        "dependency-audit": {
          allow: ["tool.semble"],
          deny: ["app.google-drive"],
        },
      },
    },
  },
}, null, 2)}\n`);

const adoptionPackDryRun = run([
  "adoption",
  "pack",
  "--repo",
  adoptedRepo,
  "--profile",
  "wetware",
  "--title",
  "Dependency Audit Pack",
  "--slug",
  "dependency-audit-pack",
]);
assert.equal(adoptionPackDryRun.ok, true);
assert.equal(adoptionPackDryRun.write, false);
assert.equal(adoptionPackDryRun.pack.file, "docs/ticket-packs/draft/dependency-audit-pack.md");
assert.equal(fs.existsSync(path.join(adoptedRepo, adoptionPackDryRun.pack.file)), false);

const adoptionPackWrite = run([
  "adoption",
  "pack",
  "--repo",
  adoptedRepo,
  "--profile",
  "wetware",
  "--title",
  "Dependency Audit Pack",
  "--slug",
  "dependency-audit-pack",
  "--write",
]);
assert.equal(adoptionPackWrite.ok, true);
assert.equal(fs.existsSync(path.join(adoptedRepo, adoptionPackWrite.pack.file)), true);

const adoptionPackNoOverwrite = run([
  "adoption",
  "pack",
  "--repo",
  adoptedRepo,
  "--profile",
  "wetware",
  "--title",
  "Dependency Audit Pack",
  "--slug",
  "dependency-audit-pack",
  "--write",
], { allowFailure: true });
assert.equal(adoptionPackNoOverwrite.ok, false);
assert.equal(adoptionPackNoOverwrite.errors[0].message.includes("exists"), true);

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
  "ctxa dependency audit --repo . --command 'pnpm audit --prod' --json",
  "--capability-workflow",
  "workflow.target-implementation",
  "--capability-step",
  "dependency-audit",
  "--capability",
  "tool.semble,app.gmail",
  "--write",
]);
assert.equal(adoptedTicket.ok, true);
assert.equal(adoptedTicket.ticket.file, "docs/tickets/clear-dependency-audit.md");
assert.equal(fs.existsSync(path.join(adoptedRepo, adoptedTicket.ticket.file)), true);
const adoptedTicketText = fs.readFileSync(path.join(adoptedRepo, adoptedTicket.ticket.file), "utf8");
assert.equal(adoptedTicketText.includes("capability_policy:"), true);
assert.equal(adoptedTicketText.includes("workflow: workflow.target-implementation"), true);

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
assert.equal(adoptedPlan.capability_policy.workflow, "workflow.target-implementation");
assert.equal(adoptedPlan.capability_policy.step, "dependency-audit");
assert.equal(adoptedPlan.capability_policy.required.find((item) => item.capability === "tool.semble").allowed, true);
assert.equal(adoptedPlan.capability_policy.required.find((item) => item.capability === "app.gmail").allowed, false);
assert.equal(adoptedPlan.capability_policy.check_commands.some((command) => command.includes("--capability tool.semble")), true);

const screenshotPath = path.join(adoptedRepo, ".ctx-aide/artifacts/screenshots/browser-validation/logged-out/mobile.png");
fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
const pngHeader = Buffer.alloc(24);
pngHeader[1] = 0x50;
pngHeader[2] = 0x4e;
pngHeader[3] = 0x47;
pngHeader.writeUInt32BE(390, 16);
pngHeader.writeUInt32BE(844, 20);
fs.writeFileSync(screenshotPath, pngHeader);
const feedbackReview = run([
  "feedback",
  "review",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
  "--screenshot",
  ".ctx-aide/artifacts/screenshots/browser-validation/logged-out/mobile.png",
  "--url",
  "http://localhost:3000/settings",
]);
assert.equal(feedbackReview.ok, true);
assert.equal(feedbackReview.ticket.id, "ticket.clear-dependency-audit");
assert.equal(feedbackReview.artifacts[0].width, 390);
assert.equal(feedbackReview.artifacts[0].height, 844);
assert.equal(feedbackReview.artifacts[0].url, "http://localhost:3000/settings");
assert.equal(feedbackReview.changed_files.includes("package.json"), true);

const disabledReviewUi = run([
  "feedback",
  "review-ui",
  "--repo",
  adoptedRepo,
  "--screenshot-dir",
  ".ctx-aide/artifacts/screenshots/browser-validation/logged-out",
  "--plan-only",
], { allowFailure: true });
assert.equal(disabledReviewUi.ok, false);
assert.equal(disabledReviewUi.feature.enabled, false);
assert.equal(disabledReviewUi.feature.stability, "beta");
assert.equal(disabledReviewUi.blockers[0].includes("optional beta"), true);

const betaOverrideReviewUi = run([
  "feedback",
  "review-ui",
  "--repo",
  adoptedRepo,
  "--screenshot-dir",
  ".ctx-aide/artifacts/screenshots/browser-validation/logged-out",
  "--plan-only",
  "--allow-beta",
]);
assert.equal(betaOverrideReviewUi.ok, true);

const settingsGet = run(["settings", "get", "--repo", adoptedRepo]);
assert.equal(settingsGet.ok, true);
assert.equal(settingsGet.features.screenshot_feedback_review_ui.enabled, false);
assert.equal(settingsGet.features.screenshot_feedback_review_ui.stability, "beta");

const settingsSet = run([
  "settings",
  "set",
  "--repo",
  adoptedRepo,
  "--feature",
  "screenshot-feedback-review-ui",
  "--enabled",
  "true",
  "--write",
]);
assert.equal(settingsSet.ok, true);
assert.equal(settingsSet.feature.enabled, true);
const settingsGetEnabled = run(["settings", "get", "--repo", adoptedRepo]);
assert.equal(settingsGetEnabled.features.screenshot_feedback_review_ui.enabled, true);

const enabledReviewUi = run([
  "feedback",
  "review-ui",
  "--repo",
  adoptedRepo,
  "--screenshot-dir",
  ".ctx-aide/artifacts/screenshots/browser-validation/logged-out",
  "--plan-only",
]);
assert.equal(enabledReviewUi.ok, true);

const feedbackPlan = run([
  "feedback",
  "plan",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
  "--body",
  [
    "- The mobile spacing is too tight under the heading.",
    "- Change the button copy to Save changes.",
    "- The account settings nav is confusing and also the empty state is unclear.",
  ].join("\n"),
  "--file",
  "app/settings/page.tsx",
]);
assert.equal(feedbackPlan.ok, true);
assert.equal(feedbackPlan.point_count, 3);
assert.equal(feedbackPlan.suggested_summary.acceptance_criteria >= 1, true);
assert.equal(feedbackPlan.points[2].should_split_further, true);
assert.equal(feedbackPlan.points[2].subpoints.length, 2);
assert.equal(feedbackPlan.suggested_next_steps.some((step) => step.includes("clarifying")), true);

const feedbackRulesPlan = run([
  "feedback",
  "plan",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
  "--body",
  "Never ship visual tickets without mobile and desktop screenshots.",
]);
assert.equal(feedbackRulesPlan.ok, true);
assert.equal(feedbackRulesPlan.points[0].suggested_rules.negative_rules.length, 1);
assert.equal(feedbackRulesPlan.points[0].suggested_rules.axioms[0].id.startsWith("axiom.feedback."), true);

const capturedFeedback = run([
  "feedback",
  "capture",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
  "--title",
  "Settings spacing needs review",
  "--body",
  "Spacing is weird",
  "--file",
  "app/settings/page.tsx",
  "--screenshot",
  ".ctx-aide/artifacts/screenshots/browser-validation/logged-out/mobile.png",
  "--url",
  "http://localhost:3000/settings",
  "--write",
]);
assert.equal(capturedFeedback.ok, true);
assert.equal(capturedFeedback.feedback.needs_clarification, true);
assert.equal(capturedFeedback.decomposition.should_split, false);
assert.equal(fs.existsSync(path.join(adoptedRepo, capturedFeedback.feedback.file)), true);
const feedbackText = fs.readFileSync(path.join(adoptedRepo, capturedFeedback.feedback.file), "utf8");
assert.equal(feedbackText.includes("## Feedback"), true);
assert.equal(feedbackText.includes("Settings spacing needs review"), true);

const capturedRuleFeedback = run([
  "feedback",
  "capture",
  "--repo",
  adoptedRepo,
  "--ticket",
  adoptedTicket.ticket.file,
  "--title",
  "Visual evidence rule",
  "--body",
  "Never ship visual tickets without mobile and desktop screenshots.",
  "--file",
  "app/settings/page.tsx",
  "--write",
]);
assert.equal(capturedRuleFeedback.ok, true);
assert.equal(capturedRuleFeedback.suggested_rules.negative_rules.length, 1);
assert.equal(capturedRuleFeedback.suggested_rules.axioms[0].id.startsWith("axiom.feedback."), true);
const ruleFeedbackText = fs.readFileSync(path.join(adoptedRepo, capturedRuleFeedback.feedback.file), "utf8");
assert.equal(ruleFeedbackText.includes("## Suggested Rules and Axioms"), true);
assert.equal(ruleFeedbackText.includes("Never ship visual tickets"), true);

const promotedCriterion = run([
  "feedback",
  "promote",
  "--repo",
  adoptedRepo,
  "--feedback",
  capturedFeedback.feedback.id,
  "--ticket",
  adoptedTicket.ticket.file,
  "--mode",
  "acceptance-criteria",
  "--criterion",
  "Settings spacing matches the reviewed screenshot at desktop and mobile breakpoints.",
  "--write",
]);
assert.equal(promotedCriterion.ok, true);
const updatedTicketText = fs.readFileSync(path.join(adoptedRepo, adoptedTicket.ticket.file), "utf8");
assert.equal(updatedTicketText.includes("Settings spacing matches the reviewed screenshot"), true);

const promotedFollowUp = run([
  "feedback",
  "promote",
  "--repo",
  adoptedRepo,
  "--feedback",
  capturedFeedback.feedback.id,
  "--ticket",
  adoptedTicket.ticket.file,
  "--mode",
  "follow-up-ticket",
  "--write",
]);
assert.equal(promotedFollowUp.ok, true);
assert.equal(promotedFollowUp.ticket.status, "needs-questions");
assert.equal(fs.existsSync(path.join(adoptedRepo, promotedFollowUp.ticket.file)), true);
const followUpText = fs.readFileSync(path.join(adoptedRepo, promotedFollowUp.ticket.file), "utf8");
assert.equal(followUpText.includes("source_feedback:"), true);
assert.equal(followUpText.includes(capturedFeedback.feedback.id), true);

const promotedRuleFollowUp = run([
  "feedback",
  "promote",
  "--repo",
  adoptedRepo,
  "--feedback",
  capturedRuleFeedback.feedback.id,
  "--ticket",
  adoptedTicket.ticket.file,
  "--mode",
  "follow-up-ticket",
  "--write",
]);
assert.equal(promotedRuleFollowUp.ok, true);
const ruleFollowUpText = fs.readFileSync(path.join(adoptedRepo, promotedRuleFollowUp.ticket.file), "utf8");
assert.equal(ruleFollowUpText.includes("axiom.feedback."), true);
assert.equal(ruleFollowUpText.includes("Never ship visual tickets"), true);

const reviewUiState = buildScreenshotReviewState({
  repoPath: adoptedRepo,
  screenshotDir: ".ctx-aide/artifacts/screenshots/browser-validation/logged-out",
});
assert.equal(reviewUiState.items.length, 1);
savePostedFeedback(reviewUiState, {
  entries: {
    [reviewUiState.items[0].key]: {
      reviewStatus: "needs_ticket",
      severity: "P2",
      component: "Settings",
      notes: [
        "- Mobile spacing is too tight under the heading.",
        "- Change the button copy to Save changes.",
      ].join("\n"),
      tags: ["layout", "copy"],
    },
  },
});
const ticketDir = path.join(adoptedRepo, "docs/tickets/needs-questions");
const beforeReviewUiTickets = fs.existsSync(ticketDir)
  ? fs.readdirSync(ticketDir).filter((file) => file.includes("mobile-spacing"))
  : [];
const reviewUiPlan = buildTicketDraftPlan(reviewUiState);
assert.equal(reviewUiPlan.ok, true);
assert.equal(reviewUiPlan.count, 2);
assert.equal(reviewUiPlan.write_requires_confirmation, true);
assert.equal(reviewUiPlan.candidates[0].splitReason, "Structured list feedback");
const afterPlanTickets = fs.existsSync(ticketDir)
  ? fs.readdirSync(ticketDir).filter((file) => file.includes("mobile-spacing"))
  : [];
assert.deepEqual(afterPlanTickets, beforeReviewUiTickets);

const writtenReviewUiTickets = generateTicketDrafts(reviewUiState, {
  candidates: reviewUiPlan.candidates,
});
assert.equal(writtenReviewUiTickets.ok, true);
assert.equal(writtenReviewUiTickets.count, 2);
assert.equal(writtenReviewUiTickets.files.every((file) => file.startsWith("docs/tickets/needs-questions/")), true);
const generatedTicketText = fs.readFileSync(path.join(adoptedRepo, writtenReviewUiTickets.files[0]), "utf8");
assert.equal(generatedTicketText.includes("status: needs-questions"), true);
assert.equal(generatedTicketText.includes("ticket_pack: pack.screenshot-feedback"), true);
assert.equal(generatedTicketText.includes("source_feedback: []"), true);
assert.equal(generatedTicketText.includes("Screenshot Feedback"), false);
assert.equal(generatedTicketText.includes("Mobile spacing is too tight"), true);
assert.equal(generatedTicketText.includes("validation:"), true);
assert.equal(generatedTicketText.includes(".ctx-aide/artifacts/screenshots/browser-validation/logged-out/mobile.png"), true);

const targetRepoToolsCheck = run([
  "tools",
  "check",
  "--repo",
  adoptedRepo,
  "--workflow",
  "workflow.target-implementation",
  "--step",
  "dependency-audit",
  "--capability",
  "tool.semble",
]);
assert.equal(targetRepoToolsCheck.ok, true);

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

- \`ctxa dependency audit --repo . --command "pnpm audit --prod" --json\`
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
assert.equal(legacyPlan.capability_policy.workflow, null);
assert.equal(legacyPlan.capability_policy.policy.effective.allow.includes("tool.semble"), true);

const astrotechneTarget = path.join(fixture, "astrotechne-target");
fs.mkdirSync(path.join(astrotechneTarget, "docs/domain-redesign/tickets"), { recursive: true });
fs.writeFileSync(path.join(astrotechneTarget, "package.json"), `${JSON.stringify({ name: "astrotechne-target", private: true }, null, 2)}\n`);
const astrotechnePack = run([
  "adoption",
  "pack",
  "--repo",
  astrotechneTarget,
  "--profile",
  "astrotechne",
  "--title",
  "Public Copy Launch",
  "--slug",
  "public-copy-launch",
  "--write",
]);
assert.equal(astrotechnePack.ok, true);
assert.equal(astrotechnePack.pack.file, "docs/domain-redesign/tickets/public-copy-launch/README.md");
assert.equal(fs.existsSync(path.join(astrotechneTarget, astrotechnePack.pack.file)), true);

const missingPackTicket = run([
  "adoption",
  "ticket",
  "--repo",
  astrotechneTarget,
  "--profile",
  "astrotechne",
  "--title",
  "Missing Pack Ticket",
  "--slug",
  "missing-pack-ticket",
  "--pack-slug",
  "does-not-exist",
  "--write",
], { allowFailure: true });
assert.equal(missingPackTicket.ok, false);
assert.equal(missingPackTicket.errors[0].message.includes("pack does not exist"), true);

const astrotechnePackedTicket = run([
  "adoption",
  "ticket",
  "--repo",
  astrotechneTarget,
  "--profile",
  "astrotechne",
  "--title",
  "Polish Public Copy",
  "--slug",
  "polish-public-copy",
  "--task",
  "polish public copy",
  "--pack",
  astrotechnePack.pack.id,
  "--pack-slug",
  astrotechnePack.pack.slug,
  "--context",
  "flow.dependency-audit-clearance",
  "--file",
  "app/page.tsx",
  "--write",
]);
assert.equal(astrotechnePackedTicket.ok, true);
assert.equal(astrotechnePackedTicket.ticket.file, "docs/domain-redesign/tickets/public-copy-launch/polish-public-copy.md");
assert.equal(fs.existsSync(path.join(astrotechneTarget, astrotechnePackedTicket.ticket.file)), true);

const astrotechnePackedPlan = run([
  "adoption",
  "implementation-plan",
  "--repo",
  astrotechneTarget,
  "--ticket",
  astrotechnePackedTicket.ticket.file,
]);
assert.equal(astrotechnePackedPlan.ok, true);
assert.equal(astrotechnePackedPlan.ticket.file, astrotechnePackedTicket.ticket.file);
assert.equal(astrotechnePackedPlan.target_paths.includes("app/page.tsx"), true);

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
process.stdout.write("ctx-aide tests passed\n");
