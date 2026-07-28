#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const json = args.includes("--json");

function hasArg(name) {
  return args.includes(name);
}

function argValue(name, fallback = null) {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function rel(file) {
  return path.relative(root, file) || ".";
}

function fail(message, extra = {}) {
  const result = { ok: false, scope: "build", errors: [{ message, ...extra }] };
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stderr.write(`build failed: ${message}\n`);
  process.exit(1);
}

function usage() {
  process.stdout.write(`Usage: npm run build -- [options]

Options:
  --json                    Emit structured JSON.
  --dry-run                 Run npm pack without writing a tarball.
  --no-test                 Skip the unit test step.
  --pack-destination <dir>  Write package artifacts to this directory. Defaults to dist.
  -h, --help                Show this help.
`);
}

if (hasArg("--help") || hasArg("-h")) {
  usage();
  process.exit(0);
}

const flagArgs = new Set(["--json", "--dry-run", "--no-test", "--help", "-h"]);
const valueArgs = new Set(["--pack-destination"]);
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (valueArgs.has(arg)) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) fail(`${arg} requires a value`);
    index += 1;
    continue;
  }
  if (arg.startsWith("--") && !flagArgs.has(arg)) fail(`unknown option ${arg}`);
}

function runStep(name, command, stepArgs, options = {}) {
  const result = spawnSync(command, stepArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: json ? ["ignore", "pipe", "pipe"] : "inherit",
    env: process.env,
  });
  const step = {
    name,
    command: [command, ...stepArgs].join(" "),
    exit_code: result.status ?? 1,
    ok: result.status === 0,
  };
  if (json) {
    if (result.stdout?.trim()) step.stdout = result.stdout.trim();
    if (result.stderr?.trim()) step.stderr = result.stderr.trim();
  }
  if (!step.ok && !options.allowFailure) {
    const output = { ok: false, scope: "build", failed_step: step, steps };
    if (json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    process.exit(step.exit_code || 1);
  }
  steps.push(step);
  return step;
}

const steps = [];
const packagePath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const expectedPackedPaths = [
  "LICENSE",
  "README.md",
  "docs/config/ctx-aide.adoption-profiles.json",
  "docs/context/schema/adoption-profile-registry.schema.json",
  "docs/context/schema/context-entry.schema.json",
  "docs/context/schema/feedback-entry.schema.json",
  "docs/context/schema/source-provenance.schema.json",
  "docs/future-work/templates/future-work.md",
  "docs/specs/templates/spec.md",
  "docs/ticket-packs/templates/ticket-pack.md",
  "docs/tickets/templates/canonical-ticket.md",
  "package.json",
  "tools/ctx-aide/command-catalog.mjs",
  "tools/ctx-aide/ctx-aide.mjs",
  "tools/ctx-aide/screenshot-review-ui.mjs",
];
if (pkg.name !== "ctx-aide") fail("package name must remain ctx-aide", { file: rel(packagePath) });
if (JSON.stringify(Object.keys(pkg.bin ?? {})) !== JSON.stringify(["ctxa"])) {
  fail("package bin must expose exactly ctxa", { file: rel(packagePath) });
}
if (pkg.bin.ctxa !== "./tools/ctx-aide/ctx-aide.mjs") {
  fail("ctxa bin must point at tools/ctx-aide/ctx-aide.mjs", { file: rel(packagePath) });
}

const distArg = argValue("--pack-destination", "dist");
const distDir = path.resolve(root, distArg);
fs.mkdirSync(distDir, { recursive: true });

runStep("check build script syntax", process.execPath, ["--check", "scripts/build.mjs"]);
runStep("check install script syntax", process.execPath, ["--check", "scripts/install-local.mjs"]);
runStep("check cli syntax", process.execPath, ["--check", "tools/ctx-aide/ctx-aide.mjs"]);
runStep("check test syntax", process.execPath, ["--check", "tools/ctx-aide/ctx-aide.test.mjs"]);
runStep("check screenshot ui syntax", process.execPath, ["--check", "tools/ctx-aide/screenshot-review-ui.mjs"]);
if (!hasArg("--no-test")) runStep("run tests", process.execPath, ["tools/ctx-aide/ctx-aide.test.mjs"]);
runStep("scan context", process.execPath, ["tools/ctx-aide/ctx-aide.mjs", "scan", "--json"]);
runStep("lint", process.execPath, ["tools/ctx-aide/ctx-aide.mjs", "lint", "--json"]);
runStep("ticket check", process.execPath, ["tools/ctx-aide/ctx-aide.mjs", "ticket", "check", "--json"]);
runStep("pack check", process.execPath, ["tools/ctx-aide/ctx-aide.mjs", "pack", "check", "--json"]);

const packArgs = ["pack", "--json", "--pack-destination", rel(distDir)];
if (hasArg("--dry-run")) packArgs.splice(1, 0, "--dry-run");
const packStep = runStep(hasArg("--dry-run") ? "npm pack dry-run" : "npm pack", "npm", packArgs);
let tarball = null;
let packedPaths = [];
if (packStep.stdout) {
  try {
    const parsed = JSON.parse(packStep.stdout);
    const fileName = parsed?.[0]?.filename ?? null;
    if (fileName) tarball = path.join(rel(distDir), fileName);
    packedPaths = (parsed?.[0]?.files ?? []).map((file) => file.path).sort();
  } catch {
    fail("npm pack did not return parseable inventory metadata");
  }
}
if (JSON.stringify(packedPaths) !== JSON.stringify(expectedPackedPaths)) {
  fail("npm pack runtime inventory does not match the frozen allowlist", {
    expected: expectedPackedPaths,
    actual: packedPaths,
  });
}

const output = {
  ok: true,
  scope: "build",
  package: { name: pkg.name, version: pkg.version, bin: pkg.bin },
  artifact: hasArg("--dry-run") ? null : tarball,
  pack_destination: rel(distDir),
  runtime_inventory: packedPaths,
  steps,
};
if (json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
else {
  process.stdout.write(`Built ${pkg.name}@${pkg.version}\n`);
  if (tarball) process.stdout.write(`Artifact: ${tarball}\n`);
}
