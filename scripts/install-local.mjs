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

function usage() {
  process.stdout.write(`Usage: npm run install:local -- [options]

Options:
  --json           Emit structured JSON.
  --from <path>    Install from this package directory or tarball. Defaults to this checkout.
  --prefix <path>  Install into this prefix. Defaults to .ctx-aide/install.
  --global         Install into the active npm global prefix.
  -h, --help       Show this help.
`);
}

function emit(result, exitCode = result.ok ? 0 : 1) {
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else if (!result.ok) process.stderr.write(`${result.errors.map((error) => error.message).join("\n")}\n`);
  else {
    process.stdout.write(`Installed ctxa\n`);
    process.stdout.write(`Bin: ${result.bin}\n`);
    if (!result.global) process.stdout.write(`Add to PATH: ${path.dirname(result.bin)}\n`);
  }
  process.exit(exitCode);
}

function run(command, runArgs, options = {}) {
  const result = spawnSync(command, runArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: json || options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: process.env,
  });
  return {
    command: [command, ...runArgs].join(" "),
    exit_code: result.status ?? 1,
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
  };
}

if (hasArg("--help") || hasArg("-h")) {
  usage();
  process.exit(0);
}

const flagArgs = new Set(["--json", "--global", "--help", "-h"]);
const valueArgs = new Set(["--from", "--prefix"]);
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (valueArgs.has(arg)) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      emit({ ok: false, scope: "install", errors: [{ message: `${arg} requires a value` }] });
    }
    index += 1;
    continue;
  }
  if (arg.startsWith("--") && !flagArgs.has(arg)) {
    emit({ ok: false, scope: "install", errors: [{ message: `unknown option ${arg}` }] });
  }
}

const sourceArg = argValue("--from", ".");
const source = path.resolve(root, sourceArg);
if (!fs.existsSync(source)) {
  emit({ ok: false, scope: "install", errors: [{ file: rel(source), message: "install source does not exist" }] });
}

const globalInstall = hasArg("--global");
if (globalInstall && hasArg("--prefix")) {
  emit({ ok: false, scope: "install", errors: [{ message: "--prefix cannot be used with --global" }] });
}
const prefix = globalInstall ? null : path.resolve(root, argValue("--prefix", ".ctx-aide/install"));
if (prefix) fs.mkdirSync(prefix, { recursive: true });

const installArgs = ["install", "-g", source, "--ignore-scripts"];
if (prefix) installArgs.push("--prefix", prefix);
const installStep = run("npm", installArgs);
if (!installStep.ok) {
  emit({
    ok: false,
    scope: "install",
    source: rel(source),
    prefix: prefix ? rel(prefix) : null,
    global: globalInstall,
    errors: [{ message: "npm install failed", stderr: installStep.stderr }],
    steps: [installStep],
  }, installStep.exit_code);
}

let binDir = prefix ? path.join(prefix, "bin") : null;
if (!binDir) {
  const prefixStep = run("npm", ["prefix", "-g"], { capture: true });
  if (!prefixStep.ok || !prefixStep.stdout) {
    emit({
      ok: false,
      scope: "install",
      source: rel(source),
      global: true,
      errors: [{ message: "could not resolve npm global prefix", stderr: prefixStep.stderr }],
      steps: [installStep, prefixStep],
    }, prefixStep.exit_code || 1);
  }
  binDir = path.join(prefixStep.stdout, "bin");
}

const bin = path.join(binDir, "ctxa");
const oldBin = path.join(binDir, "ctx-aide");
const errors = [];
if (!fs.existsSync(bin)) errors.push({ file: bin, message: "ctxa bin was not installed" });
if (fs.existsSync(oldBin)) errors.push({ file: oldBin, message: "ctx-aide bin should not be installed" });
if (errors.length > 0) {
  emit({
    ok: false,
    scope: "install",
    source: rel(source),
    prefix: prefix ? rel(prefix) : null,
    global: globalInstall,
    bin,
    errors,
    steps: [installStep],
  });
}

const helpStep = run(bin, ["--help"], { capture: true });
if (!helpStep.ok || !helpStep.stdout.includes("ctxa lint --json")) {
  emit({
    ok: false,
    scope: "install",
    source: rel(source),
    prefix: prefix ? rel(prefix) : null,
    global: globalInstall,
    bin,
    errors: [{ file: bin, message: "ctxa --help did not return expected usage" }],
    steps: [installStep, helpStep],
  }, helpStep.exit_code || 1);
}

emit({
  ok: true,
  scope: "install",
  source: rel(source),
  prefix: prefix ? rel(prefix) : null,
  global: globalInstall,
  bin,
  steps: [installStep, helpStep],
});
