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

const noBackendDiscovery = run(["discover", "--backend", "none", "--task", "known path", "--out", "docs/context/generated/discovery.none.json"]);
assert.equal(noBackendDiscovery.ok, true);
assert.equal(noBackendDiscovery.out, "docs/context/generated/discovery.none.json");
assert.equal(fs.existsSync(path.join(fixture, "docs/context/generated/discovery.none.json")), true);

if (commandExists("rg")) {
  const rgDiscovery = run(["discover", "--backend", "ripgrep", "--task", "authenticateUser", "--repo", ".", "--limit", "2"]);
  assert.equal(rgDiscovery.ok, true);
  assert.equal(rgDiscovery.matches.length, 1);
  assert.equal(rgDiscovery.matches[0].file.replace(/^\.\//, ""), "src/auth.js");
}

fs.rmSync(fixture, { recursive: true, force: true });
process.stdout.write("ctx tests passed\n");
