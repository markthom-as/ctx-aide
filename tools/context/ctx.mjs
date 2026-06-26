#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const root = process.cwd();
const toolRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const args = process.argv.slice(2);
const command = args[0] ?? "help";
const subcommand = args[1] ?? "";
const json = args.includes("--json");

const ticketStatuses = new Set([
  "draft",
  "needs-questions",
  "needs-hardening",
  "ready",
  "in-progress",
  "blocked",
  "needs-review",
  "done",
  "superseded",
]);

const packStatuses = new Set(["draft", "ready", "active", "blocked", "done", "superseded"]);
const specStatuses = new Set(["draft", "needs-questions", "needs-hardening", "ready", "done", "superseded"]);
const contextKinds = new Set(["route", "file", "dir", "component", "flow", "design", "architecture"]);
const contextStatuses = new Set(["draft", "proposed", "active", "deprecated", "superseded"]);
const feedbackStatuses = new Set(["proposed", "accepted", "rejected", "resolved", "superseded"]);
const feedbackSeverities = new Set(["low", "medium", "high", "critical"]);
const workflowStatuses = new Set(["draft", "active", "deprecated", "superseded"]);
const runStatuses = new Set([
  "planning",
  "active",
  "draining",
  "blocked",
  "needs-merge",
  "validating",
  "done",
  "abandoned",
]);

const requiredDirs = [
  "docs/context/schema",
  "docs/context/routes",
  "docs/context/files",
  "docs/context/dirs",
  "docs/context/components",
  "docs/context/flows",
  "docs/context/design",
  "docs/context/architecture",
  "docs/context/feedback",
  "docs/context/generated",
  ".cursor/rules/generated",
  "docs/specs",
  "docs/specs/templates",
  "docs/workflows",
  "docs/idvisor",
  "docs/config",
  "docs/tickets/templates",
  "docs/tickets/draft",
  "docs/tickets/needs-questions",
  "docs/tickets/needs-hardening",
  "docs/tickets/ready",
  "docs/tickets/in-progress",
  "docs/tickets/blocked",
  "docs/tickets/needs-review",
  "docs/tickets/done",
  "docs/tickets/superseded",
  "docs/ticket-packs/templates",
  "docs/ticket-packs/draft",
  "docs/ticket-packs/active",
  "docs/ticket-packs/backlog",
  "docs/ticket-packs/done",
  "docs/ticket-packs/superseded",
  "docs/runs",
  "docs/future-work",
  "docs/future-work/templates",
  "docs/future-work/captured",
  "docs/future-work/promoted",
  "docs/future-work/superseded",
  "tools/context",
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function markdownFiles(dir) {
  return walk(path.join(root, dir))
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.relative(root, file));
}

function contextMarkdownFiles() {
  return markdownFiles("docs/context")
    .filter((file) => !file.includes("/schema/") && !file.includes("/generated/"))
    .sort();
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed === "[]") return [];
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  return trimmed.replace(/^["']|["']$/g, "");
}

function parseDocText(file, text) {
  if (text.replace(/^\uFEFF/, "").startsWith("<!-- repo-context: ignore -->")) {
    return { file, ignored: true, frontmatter: {}, body: text };
  }
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { file, ignored: false, frontmatter: {}, body: text };
  const frontmatter = {};
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!top) continue;
    const key = top[1];
    const raw = top[2] ?? "";
    if (raw === "") {
      const arr = [];
      let sawArray = false;
      for (let j = i + 1; j < lines.length; j += 1) {
        const child = lines[j];
        if (/^[A-Za-z0-9_-]+:/.test(child)) break;
        const item = child.match(/^\s+-\s*(.+)$/);
        if (item) {
          sawArray = true;
          arr.push(parseValue(item[1]));
          i = j;
        }
      }
      frontmatter[key] = sawArray ? arr : {};
    } else {
      frontmatter[key] = parseValue(raw);
    }
  }
  return {
    file,
    ignored: frontmatter.context_scan === false,
    frontmatter,
    frontmatterText: match[1],
    body: text.slice(match[0].length),
  };
}

function readDoc(file) {
  return parseDocText(file, fs.readFileSync(path.join(root, file), "utf8"));
}

function readDocAt(baseRoot, file) {
  return parseDocText(file, fs.readFileSync(path.join(baseRoot, file), "utf8"));
}

function nestedFrontmatterValue(doc, parent, key) {
  let inParent = false;
  for (const line of (doc.frontmatterText ?? "").split("\n")) {
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (top) {
      inParent = top[1] === parent && (top[2] ?? "") === "";
      continue;
    }
    if (!inParent) continue;
    const child = line.match(new RegExp(`^\\s+${key}:\\s*(.+)$`));
    if (child) return parseValue(child[1]);
  }
  return undefined;
}

function nestedFrontmatterList(doc, parent, key) {
  const values = [];
  let inParent = false;
  let inKey = false;
  for (const line of (doc.frontmatterText ?? "").split("\n")) {
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (top) {
      inParent = top[1] === parent && (top[2] ?? "") === "";
      inKey = false;
      continue;
    }
    if (!inParent) continue;
    const child = line.match(new RegExp(`^\\s{2}${key}:\\s*$`));
    if (child) {
      inKey = true;
      continue;
    }
    if (/^\s{2}[A-Za-z0-9_-]+:/.test(line)) {
      inKey = false;
      continue;
    }
    if (!inKey) continue;
    const item = line.match(/^\s+-\s*(.+)$/);
    if (item) values.push(parseValue(item[1]));
  }
  return values;
}

function allNestedFrontmatterValues(doc, parent) {
  const values = {};
  let inParent = false;
  for (const line of (doc.frontmatterText ?? "").split("\n")) {
    const top = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (top) {
      inParent = top[1] === parent && (top[2] ?? "") === "";
      continue;
    }
    if (!inParent) continue;
    const child = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.+)$/);
    if (child) values[child[1]] = parseValue(child[2]);
  }
  return values;
}

function folderAfter(file, prefix) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = file.match(new RegExp(`^${escaped}\\/([^/]+)\\/`));
  return match ? match[1] : null;
}

function assert(condition, errors, file, message) {
  if (!condition) errors.push({ file, message });
}

function sectionPresent(body, heading) {
  return new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").test(body);
}

function hasPlaceholder(body) {
  return [
    "YYYY-MM-DD",
    "ticket.YYYY",
    "pack.YYYY",
    "milestone.slug",
    "Short imperative title",
    "One concrete outcome this ticket delivers.",
  ].some((placeholder) => body.includes(placeholder));
}

function boundedText(text, max = 4000) {
  const value = String(text ?? "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n...[truncated ${value.length - max} chars]`;
}

function dependencyAudit() {
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  const commandText = argValue("--command", "pnpm audit --prod");
  const out = argValue("--out", "");
  const startedAt = new Date().toISOString();
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "dependency audit",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  const result = spawnSync(commandText, {
    cwd: repoPath,
    shell: true,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const combined = `${stdout}\n${stderr}`;
  const vulnerabilities = {
    total: Number.parseInt(combined.match(/(\d+)\s+vulnerabilities?\s+found/i)?.[1] ?? "0", 10),
    low: Number.parseInt(combined.match(/(\d+)\s+low/i)?.[1] ?? "0", 10),
    moderate: Number.parseInt(combined.match(/(\d+)\s+moderate/i)?.[1] ?? "0", 10),
    high: Number.parseInt(combined.match(/(\d+)\s+high/i)?.[1] ?? "0", 10),
    critical: Number.parseInt(combined.match(/(\d+)\s+critical/i)?.[1] ?? "0", 10),
  };
  const packages = unique([...combined.matchAll(/│\s*Package\s*│\s*([^│]+?)\s*│/g)].map((match) => match[1].trim()));
  const payload = {
    ok: result.status === 0,
    scope: "dependency audit",
    repo: path.relative(root, repoPath) || ".",
    command: commandText,
    checked_at: startedAt,
    audit_cleared: result.status === 0,
    exit_code: result.status,
    vulnerabilities,
    vulnerable_packages: packages,
    evidence: {
      command: commandText,
      stdout_excerpt: boundedText(stdout),
      stderr_excerpt: boundedText(stderr),
    },
    errors: result.status === 0 ? [] : [{ file: path.relative(root, repoPath) || ".", message: "dependency audit did not clear" }],
  };
  if (out) {
    const outPath = path.isAbsolute(out) ? out : path.join(root, out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
    payload.out = path.relative(root, outPath);
  }
  return payload;
}

const workflowDependencyCatalog = {
  node: {
    kind: "command",
    command: "node",
    purpose: "Run repo-context and JavaScript workflow tooling.",
  },
  "package-manager-lockfile": {
    kind: "lockfile",
    purpose: "Keep workflow package pins reproducible for agents and local runs.",
  },
  playwright: {
    kind: "npm_package",
    package_name: "@playwright/test",
    version: "1.61.1",
    purpose: "Run deterministic browser validation without depending on agent-host plugin versions.",
  },
  "codex-native-browser-plugin": {
    kind: "external_tool",
    purpose: "Optional interactive browser fallback supplied by the Codex app/plugin environment.",
  },
};

const credentialProfileCatalog = {
  "browser-test-user": {
    purpose: "Default logged-in browser validation identity.",
    required_env: ["BROWSER_TEST_EMAIL", "BROWSER_TEST_PASSWORD"],
    env_file: ".repo-context/credentials/browser-test-user.env",
    storage_state: ".repo-context/browser/browser-test-user.storage-state.json",
  },
};

const workflowViewCatalog = {
  "logged-out": {
    auth_required: false,
    purpose: "Validate anonymous and signed-out surfaces.",
  },
  "logged-in": {
    auth_required: true,
    credential_profile: "browser-test-user",
    purpose: "Validate authenticated surfaces with a reusable test identity or browser storage state.",
  },
};

const workflowBreakpointCatalog = {
  mobile: {
    width: 390,
    height: 844,
    device_scale_factor: 2,
    is_mobile: true,
    purpose: "Default modern phone portrait viewport.",
  },
  tablet: {
    width: 820,
    height: 1180,
    device_scale_factor: 2,
    is_mobile: true,
    purpose: "Default tablet portrait viewport.",
  },
  desktop: {
    width: 1440,
    height: 900,
    device_scale_factor: 1,
    is_mobile: false,
    purpose: "Default desktop viewport.",
  },
  wide: {
    width: 1920,
    height: 1080,
    device_scale_factor: 1,
    is_mobile: false,
    purpose: "Default wide desktop viewport.",
  },
};

const defaultWorkflowValidationConfig = {
  config_version: 1,
  workflows: {
    "workflow.browser-validation": {
      views: ["logged-out", "logged-in"],
      breakpoints: ["mobile", "tablet", "desktop", "wide"],
    },
  },
};

function workflowMarkdownFiles() {
  return markdownFiles("docs/workflows").sort();
}

function readWorkflows() {
  return workflowMarkdownFiles()
    .map((file) => ({ file, doc: readDoc(file) }))
    .filter(({ doc }) => !doc.ignored && typeof doc.frontmatter.id === "string")
    .map(({ file, doc }) => ({ file, frontmatter: doc.frontmatter, body: doc.body }));
}

function targetWorkflows(workflowArg) {
  const workflows = readWorkflows();
  if (!workflowArg) return workflows;
  return workflows.filter((workflow) => workflow.frontmatter.id === workflowArg || workflow.file === workflowArg);
}

function packageJsonPath(repoPath) {
  return path.join(repoPath, "package.json");
}

function readPackageJson(repoPath) {
  const file = packageJsonPath(repoPath);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writePackageJson(repoPath, pkg) {
  fs.writeFileSync(packageJsonPath(repoPath), `${JSON.stringify(pkg, null, 2)}\n`);
}

function packageSpec(pkg, packageName) {
  if (!pkg) return null;
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    if (pkg[field]?.[packageName]) return { field, spec: pkg[field][packageName] };
  }
  return null;
}

function isExactVersion(spec) {
  return /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(String(spec ?? ""));
}

function detectPackageManager(repoPath, pkg) {
  if (typeof pkg?.packageManager === "string") return pkg.packageManager.split("@")[0];
  const lockfiles = [
    ["pnpm", "pnpm-lock.yaml"],
    ["npm", "package-lock.json"],
    ["yarn", "yarn.lock"],
    ["bun", "bun.lockb"],
    ["bun", "bun.lock"],
  ];
  return lockfiles.find(([, file]) => fs.existsSync(path.join(repoPath, file)))?.[0] ?? "npm";
}

function lockfileStatus(repoPath) {
  const present = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb", "bun.lock"]
    .filter((file) => fs.existsSync(path.join(repoPath, file)));
  return {
    present,
    ok: present.length > 0,
  };
}

function commandVersion(command, versionArgs = ["--version"], cwd = root) {
  if (!commandExists(command)) return null;
  const result = spawnSync(command, versionArgs, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 5000,
  });
  if (result.status !== 0) return null;
  return (result.stdout || result.stderr || "").trim();
}

function checkWorkflowDependency(id, required, repoPath, pkg) {
  const dependency = workflowDependencyCatalog[id] ?? {
    kind: "unknown",
    purpose: "Unknown workflow dependency.",
  };
  const base = {
    id,
    required,
    kind: dependency.kind,
    purpose: dependency.purpose,
    ok: false,
    issues: [],
    fix: null,
  };

  if (dependency.kind === "command") {
    const version = commandVersion(dependency.command, ["--version"], repoPath);
    return {
      ...base,
      ok: Boolean(version),
      command: dependency.command,
      version,
      issues: version ? [] : [`missing command: ${dependency.command}`],
    };
  }

  if (dependency.kind === "lockfile") {
    const lockfiles = lockfileStatus(repoPath);
    return {
      ...base,
      ok: lockfiles.ok,
      lockfiles: lockfiles.present,
      issues: lockfiles.ok ? [] : ["missing package-manager lockfile"],
    };
  }

  if (dependency.kind === "npm_package") {
    const current = packageSpec(pkg, dependency.package_name);
    const pinned = current?.spec === dependency.version && isExactVersion(current.spec);
    const installedVersion = commandVersion("npx", ["--no-install", "playwright", "--version"], repoPath);
    return {
      ...base,
      ok: pinned,
      package_name: dependency.package_name,
      required_version: dependency.version,
      current_spec: current?.spec ?? null,
      current_field: current?.field ?? null,
      installed_version: installedVersion,
      pinned,
      issues: pinned
        ? []
        : [`${dependency.package_name} must be pinned to ${dependency.version} in package.json`],
      fix: {
        package_json_field: "devDependencies",
        package_name: dependency.package_name,
        version: dependency.version,
      },
    };
  }

  if (dependency.kind === "external_tool") {
    return {
      ...base,
      ok: !required,
      managed_by: "external agent runtime",
      issues: required
        ? [`${id} cannot be pinned by repo-context; make it optional or replace it with a repo-owned dependency`]
        : ["external runtime dependency is not repo-pinned"],
    };
  }

  return {
    ...base,
    issues: [`unknown workflow dependency: ${id}`],
  };
}

function applyWorkflowDependencyFixes(repoPath, pkg, checks, packageManager) {
  const writes = [];
  for (const check of checks) {
    if (!check.fix) continue;
    const field = check.fix.package_json_field;
    pkg[field] = pkg[field] ?? {};
    if (pkg[field][check.fix.package_name] !== check.fix.version) {
      pkg[field][check.fix.package_name] = check.fix.version;
      writes.push({
        file: path.relative(root, packageJsonPath(repoPath)) || "package.json",
        field,
        package_name: check.fix.package_name,
        version: check.fix.version,
        install_command: `${packageManager} ${packageManager === "npm" ? "install --save-dev" : "add -D"} ${check.fix.package_name}@${check.fix.version}`,
      });
    }
  }
  if (writes.length > 0) writePackageJson(repoPath, pkg);
  return writes;
}

function workflowDeps() {
  const workflowArg = argValue("--workflow", args[2] && !args[2].startsWith("--") ? args[2] : "");
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  const write = args.includes("--write");
  const initPackage = args.includes("--init-package");
  const out = argValue("--out", "");
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "workflow deps",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  let pkg = readPackageJson(repoPath);
  if (write && !pkg && initPackage) {
    pkg = {
      name: path.basename(repoPath).toLowerCase().replace(/[^a-z0-9_.-]+/g, "-") || "repo-context-target",
      private: true,
    };
  }
  if (write && !pkg) {
    return {
      ok: false,
      scope: "workflow deps",
      errors: [{ file: path.relative(root, packageJsonPath(repoPath)) || "package.json", message: "missing package.json; pass --init-package to create one" }],
    };
  }

  const selected = targetWorkflows(workflowArg);
  if (selected.length === 0) {
    return {
      ok: false,
      scope: "workflow deps",
      errors: [{ file: "docs/workflows", message: `unknown workflow: ${workflowArg}` }],
    };
  }

  const packageManager = argValue("--package-manager", detectPackageManager(repoPath, pkg));
  const workflowRows = selected.map((workflow) => {
    const requiredIds = Array.isArray(workflow.frontmatter.workflow_dependencies)
      ? workflow.frontmatter.workflow_dependencies
      : [];
    const optionalIds = Array.isArray(workflow.frontmatter.optional_workflow_dependencies)
      ? workflow.frontmatter.optional_workflow_dependencies
      : [];
    const checks = [
      ...requiredIds.map((id) => checkWorkflowDependency(id, true, repoPath, pkg)),
      ...optionalIds.map((id) => checkWorkflowDependency(id, false, repoPath, pkg)),
    ];
    const writes = write && pkg ? applyWorkflowDependencyFixes(repoPath, pkg, checks, packageManager) : [];
    if (writes.length > 0) {
      pkg = readPackageJson(repoPath);
      for (let i = 0; i < checks.length; i += 1) {
        checks[i] = checkWorkflowDependency(checks[i].id, checks[i].required, repoPath, pkg);
      }
    }
    return {
      id: workflow.frontmatter.id,
      title: workflow.frontmatter.title,
      file: workflow.file,
      ok: checks.filter((check) => check.required).every((check) => check.ok),
      dependencies: checks,
      writes,
    };
  });
  const payload = {
    ok: workflowRows.every((workflow) => workflow.ok),
    scope: "workflow deps",
    repo: path.relative(root, repoPath) || ".",
    write,
    package_manager: packageManager,
    workflows: workflowRows,
    errors: workflowRows
      .filter((workflow) => !workflow.ok)
      .flatMap((workflow) => workflow.dependencies
        .filter((check) => check.required && !check.ok)
        .map((check) => ({ file: workflow.file, message: `${workflow.id}: ${check.issues.join("; ")}` }))),
  };
  if (out) {
    const outPath = path.isAbsolute(out) ? out : path.join(root, out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
    payload.out = path.relative(root, outPath);
  }
  return payload;
}

function defaultCredentialProfile(profileId) {
  const id = profileId || "browser-test-user";
  return credentialProfileCatalog[id] ?? {
    purpose: "Custom credential profile.",
    required_env: [`${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_USERNAME`, `${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_PASSWORD`],
    env_file: `.repo-context/credentials/${id}.env`,
    storage_state: `.repo-context/browser/${id}.storage-state.json`,
  };
}

function parseEnvKeys(raw, fallback) {
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const values = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return values;
}

function credentialStatus(profileId, repoPath, options = {}) {
  const profile = defaultCredentialProfile(profileId);
  const envKeys = parseEnvKeys(options.envKeys, profile.required_env);
  const envFile = options.envFile ?? profile.env_file;
  const storageState = options.storageState ?? profile.storage_state;
  const envFilePath = path.isAbsolute(envFile) ? envFile : path.join(repoPath, envFile);
  const storageStatePath = path.isAbsolute(storageState) ? storageState : path.join(repoPath, storageState);
  const envFileValues = parseEnvFile(envFilePath);
  const env = envKeys.map((key) => ({
    key,
    present: Boolean(process.env[key]),
  }));
  const file = envKeys.map((key) => ({
    key,
    present: Boolean(envFileValues[key]),
  }));
  const envReady = envKeys.length > 0 && env.every((item) => item.present);
  const fileReady = envKeys.length > 0 && file.every((item) => item.present);
  const storageStateExists = fs.existsSync(storageStatePath);
  return {
    id: profileId,
    purpose: profile.purpose,
    required_env: envKeys,
    sources: {
      env: {
        ok: envReady,
        keys: env,
      },
      env_file: {
        ok: fileReady,
        path: path.relative(root, envFilePath) || envFile,
        exists: fs.existsSync(envFilePath),
        keys: file,
      },
      browser_storage_state: {
        ok: storageStateExists,
        path: path.relative(root, storageStatePath) || storageState,
        exists: storageStateExists,
      },
    },
    ok: envReady || fileReady || storageStateExists,
    redacted: true,
  };
}

function workflowViews() {
  const workflowArg = argValue("--workflow", args[2] && !args[2].startsWith("--") ? args[2] : "");
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "workflow views",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  const selected = targetWorkflows(workflowArg);
  if (selected.length === 0) {
    return {
      ok: false,
      scope: "workflow views",
      errors: [{ file: "docs/workflows", message: `unknown workflow: ${workflowArg}` }],
    };
  }
  const workflows = selected.map((workflow) => {
    const views = workflowViewRows(workflow, repoPath);
    return {
      id: workflow.frontmatter.id,
      title: workflow.frontmatter.title,
      file: workflow.file,
      ok: views.every((view) => view.ready),
      views,
    };
  });
  return {
    ok: workflows.every((workflow) => workflow.ok),
    scope: "workflow views",
    repo: path.relative(root, repoPath) || ".",
    workflows,
    errors: workflows
      .filter((workflow) => !workflow.ok)
      .flatMap((workflow) => workflow.views
        .filter((view) => !view.ready)
        .map((view) => ({ file: workflow.file, message: `${workflow.id}: ${view.issues.join("; ")}` }))),
  };
}

function credentialsCheck() {
  const profileId = argValue("--profile", args[2] && !args[2].startsWith("--") ? args[2] : "browser-test-user");
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "credentials check",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  const status = credentialStatus(profileId, repoPath, {
    envKeys: argValue("--env", ""),
    envFile: argValue("--env-file", null),
    storageState: argValue("--storage-state", null),
  });
  return {
    ok: status.ok,
    scope: "credentials check",
    repo: path.relative(root, repoPath) || ".",
    profile: status,
    errors: status.ok ? [] : [{ file: status.sources.env_file.path, message: `missing credentials for profile ${profileId}` }],
  };
}

function validateStorageStateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, errors: [`source storage state does not exist: ${filePath}`] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const cookies = Array.isArray(parsed.cookies) ? parsed.cookies.length : 0;
    const origins = Array.isArray(parsed.origins) ? parsed.origins.length : 0;
    if (!Array.isArray(parsed.cookies) && !Array.isArray(parsed.origins)) {
      return { ok: false, errors: ["storage state must contain cookies or origins arrays"] };
    }
    return { ok: true, cookies, origins };
  } catch (error) {
    return { ok: false, errors: [`invalid storage state JSON: ${error.message}`] };
  }
}

function credentialsImportBrowserState() {
  const profileId = argValue("--profile", "browser-test-user");
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  const sourceArg = argValue("--from", argValue("--from-browser-export", ""));
  const write = args.includes("--write");
  const force = args.includes("--force");
  const profile = defaultCredentialProfile(profileId);
  const outArg = argValue("--out", profile.storage_state);
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "credentials import-browser-state",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  if (!sourceArg) {
    return {
      ok: false,
      scope: "credentials import-browser-state",
      errors: [{ file: "credentials", message: "missing --from <storage-state.json>" }],
    };
  }
  const sourcePath = path.isAbsolute(sourceArg) ? sourceArg : path.join(root, sourceArg);
  const outPath = path.isAbsolute(outArg) ? outArg : path.join(repoPath, outArg);
  const validation = validateStorageStateFile(sourcePath);
  if (!validation.ok) {
    return {
      ok: false,
      scope: "credentials import-browser-state",
      errors: validation.errors.map((message) => ({ file: sourceArg, message })),
    };
  }
  if (fs.existsSync(outPath) && !force && write) {
    return {
      ok: false,
      scope: "credentials import-browser-state",
      errors: [{ file: path.relative(root, outPath) || outArg, message: "destination exists; pass --force to overwrite" }],
    };
  }
  if (write) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.copyFileSync(sourcePath, outPath);
  }
  return {
    ok: true,
    scope: "credentials import-browser-state",
    repo: path.relative(root, repoPath) || ".",
    profile: profileId,
    write,
    source: path.relative(root, sourcePath) || sourceArg,
    out: path.relative(root, outPath) || outArg,
    storage_state: {
      cookies: validation.cookies,
      origins: validation.origins,
      redacted: true,
    },
    warnings: [
      "storage state can contain live session cookies; keep destination untracked and rotate if exposed",
      "repo-context does not scrape browser password stores",
    ],
  };
}

function readValidationConfig(repoPath, configArg) {
  const defaultPath = path.join(repoPath, "docs/config/repo-context.validation.json");
  const configPath = configArg
    ? (path.isAbsolute(configArg) ? configArg : path.join(repoPath, configArg))
    : defaultPath;
  if (!fs.existsSync(configPath)) {
    return {
      ok: true,
      path: path.relative(root, configPath) || "docs/config/repo-context.validation.json",
      exists: false,
      config: defaultWorkflowValidationConfig,
      source: "built-in defaults",
      errors: [],
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      ok: true,
      path: path.relative(root, configPath) || configArg,
      exists: true,
      config: parsed,
      source: "config file",
      errors: [],
    };
  } catch (error) {
    return {
      ok: false,
      path: path.relative(root, configPath) || configArg,
      exists: true,
      config: null,
      source: "config file",
      errors: [{ file: path.relative(root, configPath) || configArg, message: `invalid JSON: ${error.message}` }],
    };
  }
}

function workflowValidationOverride(config, workflowId) {
  return config?.workflows?.[workflowId]
    ?? config?.workflow_overrides?.[workflowId]
    ?? {};
}

function normalizeBreakpointEntry(entry) {
  if (typeof entry === "string") {
    const preset = workflowBreakpointCatalog[entry];
    if (!preset) {
      return {
        ok: false,
        error: `unknown validation breakpoint: ${entry}`,
      };
    }
    return {
      ok: true,
      breakpoint: {
        id: entry,
        ...preset,
        source: "preset",
      },
    };
  }
  if (!entry || typeof entry !== "object") {
    return { ok: false, error: "breakpoint entries must be preset ids or objects" };
  }
  const id = String(entry.id ?? "").trim();
  const width = Number.parseInt(entry.width, 10);
  const height = Number.parseInt(entry.height, 10);
  if (!id) return { ok: false, error: "custom breakpoint is missing id" };
  if (!Number.isFinite(width) || width <= 0) return { ok: false, error: `breakpoint ${id} has invalid width` };
  if (!Number.isFinite(height) || height <= 0) return { ok: false, error: `breakpoint ${id} has invalid height` };
  return {
    ok: true,
    breakpoint: {
      id,
      width,
      height,
      device_scale_factor: Number(entry.device_scale_factor ?? entry.deviceScaleFactor ?? 1),
      is_mobile: Boolean(entry.is_mobile ?? entry.isMobile ?? false),
      purpose: String(entry.purpose ?? "Custom validation viewport."),
      source: "config",
    },
  };
}

function workflowViewRows(workflow, repoPath, configuredViews = null) {
  const workflowViewIds = Array.isArray(workflow.frontmatter.workflow_views)
    ? workflow.frontmatter.workflow_views
    : [];
  const viewIds = Array.isArray(configuredViews) && configuredViews.length > 0
    ? configuredViews
    : workflowViewIds;
  const profileIds = Array.isArray(workflow.frontmatter.credential_profiles)
    ? workflow.frontmatter.credential_profiles
    : [];
  const defaultProfile = profileIds[0] ?? "browser-test-user";
  return viewIds.map((viewId) => {
    const view = workflowViewCatalog[viewId] ?? { auth_required: true, purpose: "Custom workflow view." };
    const credentialProfile = view.credential_profile ?? defaultProfile;
    const credentials = view.auth_required ? credentialStatus(credentialProfile, repoPath) : null;
    const ready = view.auth_required ? credentials.ok : true;
    return {
      id: viewId,
      purpose: view.purpose,
      auth_required: view.auth_required,
      credential_profile: view.auth_required ? credentialProfile : null,
      ready,
      credentials,
      issues: ready ? [] : [`view ${viewId} needs env credentials, env file credentials, or browser storage state`],
    };
  });
}

function workflowValidationPlan() {
  const workflowArg = argValue("--workflow", args[2] && !args[2].startsWith("--") ? args[2] : "");
  const repoArg = argValue("--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
  const configArg = argValue("--config", "");
  if (!fs.existsSync(repoPath)) {
    return {
      ok: false,
      scope: "workflow validation-plan",
      errors: [{ file: repoArg, message: "repo path does not exist" }],
    };
  }
  const selected = targetWorkflows(workflowArg);
  if (selected.length === 0) {
    return {
      ok: false,
      scope: "workflow validation-plan",
      errors: [{ file: "docs/workflows", message: `unknown workflow: ${workflowArg}` }],
    };
  }
  const configResult = readValidationConfig(repoPath, configArg);
  if (!configResult.ok) {
    return {
      ok: false,
      scope: "workflow validation-plan",
      errors: configResult.errors,
    };
  }
  const errors = [];
  const workflows = selected.map((workflow) => {
    const override = workflowValidationOverride(configResult.config, workflow.frontmatter.id);
    const configuredBreakpoints = Array.isArray(override.breakpoints)
      ? override.breakpoints
      : (Array.isArray(workflow.frontmatter.validation_breakpoints)
          ? workflow.frontmatter.validation_breakpoints
          : defaultWorkflowValidationConfig.workflows["workflow.browser-validation"].breakpoints);
    const normalizedBreakpoints = configuredBreakpoints.map(normalizeBreakpointEntry);
    for (const normalized of normalizedBreakpoints) {
      if (!normalized.ok) errors.push({ file: configResult.path, message: normalized.error });
    }
    const breakpoints = normalizedBreakpoints
      .filter((normalized) => normalized.ok)
      .map((normalized) => normalized.breakpoint);
    const views = workflowViewRows(workflow, repoPath, override.views);
    const matrix = views.flatMap((view) => breakpoints.map((breakpoint) => ({
      id: `${view.id}:${breakpoint.id}`,
      view: view.id,
      breakpoint: breakpoint.id,
      viewport: {
        width: breakpoint.width,
        height: breakpoint.height,
        device_scale_factor: breakpoint.device_scale_factor,
        is_mobile: breakpoint.is_mobile,
      },
      auth_required: view.auth_required,
      ready: view.ready,
    })));
    return {
      id: workflow.frontmatter.id,
      title: workflow.frontmatter.title,
      file: workflow.file,
      views,
      breakpoints,
      matrix,
      ready: matrix.every((item) => item.ready),
    };
  });
  return {
    ok: errors.length === 0,
    scope: "workflow validation-plan",
    repo: path.relative(root, repoPath) || ".",
    config: {
      path: configResult.path,
      exists: configResult.exists,
      source: configResult.source,
    },
    workflows,
    errors,
  };
}

function isDependencyUpgradeTicket(doc) {
  const workType = doc.frontmatter.work_type;
  if (workType === "dependency-upgrade" || workType === "dependency-sweep") return true;
  return false;
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function firstParagraph(body) {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"));
  return lines[0] ?? "";
}

function contextEntryFromDoc(file, doc) {
  const fm = doc.frontmatter;
  const feedbackRoutes = nestedFrontmatterList(doc, "applies_to", "routes");
  const feedbackFiles = nestedFrontmatterList(doc, "applies_to", "files");
  const feedbackComponents = nestedFrontmatterList(doc, "applies_to", "components");
  const feedbackFlows = nestedFrontmatterList(doc, "applies_to", "flows");
  const loadPathMatches = nestedFrontmatterList(doc, "load_when", "path_matches");
  const loadTaskTerms = nestedFrontmatterList(doc, "load_when", "task_terms");
  return {
    id: fm.id,
    kind: fm.kind,
    status: fm.status,
    title: fm.title,
    markdown_path: file,
    summary: firstParagraph(doc.body),
    routes: unique([...(Array.isArray(fm.routes) ? fm.routes : []), ...feedbackRoutes]),
    files: unique([...(Array.isArray(fm.files) ? fm.files : []), ...feedbackFiles]),
    components: unique([...(Array.isArray(fm.components) ? fm.components : []), ...feedbackComponents]),
    flows: unique([...(Array.isArray(fm.flows) ? fm.flows : []), ...feedbackFlows]),
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    positive_rules: Array.isArray(fm.positive_rules) ? fm.positive_rules : [],
    negative_rules: Array.isArray(fm.negative_rules) ? fm.negative_rules : [],
    severity: fm.severity ?? null,
    source: fm.source ?? null,
    name: fm.name ?? null,
    import_path: fm.import_path ?? null,
    package_path: fm.package_path ?? null,
    load_when: {
      path_matches: loadPathMatches,
      task_terms: loadTaskTerms,
    },
    updated: fm.updated ?? fm.created ?? null,
    body: doc.body,
  };
}

function readContextEntries() {
  return contextMarkdownFiles()
    .map((file) => ({ file, doc: readDoc(file) }))
    .filter(({ doc }) => !doc.ignored)
    .map(({ file, doc }) => contextEntryFromDoc(file, doc))
    .filter((entry) => typeof entry.id === "string")
    .sort((a, b) => a.id.localeCompare(b.id));
}

function publicEntry(entry) {
  const { body, ...rest } = entry;
  return rest;
}

function manifestFor(entries) {
  return {
    schema_version: 1,
    generated_by: "tools/context/ctx.mjs scan",
    source: "markdown",
    entry_count: entries.length,
    entries: entries.map(publicEntry),
  };
}

function writeGeneratedManifest(manifest) {
  const outDir = path.join(root, "docs/context/generated");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "context-manifest.json");
  fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return path.relative(root, outPath);
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return sqlString(JSON.stringify(value));
}

function writeSqliteIndex(entries) {
  if (!commandExists("sqlite3")) {
    return { path: null, warning: "sqlite3 is unavailable; skipped SQLite index generation" };
  }
  const outDir = path.join(root, "docs/context/generated");
  fs.mkdirSync(outDir, { recursive: true });
  const dbPath = path.join(outDir, "context.sqlite");
  fs.rmSync(dbPath, { force: true });
  const statements = [
    "pragma journal_mode = delete;",
    "create table context_entries (id text primary key, kind text not null, status text not null, title text not null, markdown_path text not null, summary text, updated text, frontmatter_json text not null);",
    "create table scope_bindings (entry_id text not null, scope_type text not null, scope_value text not null, weight integer not null default 100, primary key (entry_id, scope_type, scope_value));",
    "create table relationships (from_id text not null, relation text not null, to_id text not null, primary key (from_id, relation, to_id));",
    "create table feedback_items (id text primary key, status text not null, severity text, source text, created text, resolved_at text, markdown_path text not null);",
    "create table component_registry (id text primary key, name text not null, package_path text, import_path text, status text not null, markdown_path text not null);",
    "create virtual table context_fts using fts5(id, title, kind, body, tags);",
  ];
  for (const entry of entries) {
    statements.push(
      `insert into context_entries values (${sqlString(entry.id)}, ${sqlString(entry.kind)}, ${sqlString(entry.status)}, ${sqlString(entry.title)}, ${sqlString(entry.markdown_path)}, ${sqlString(entry.summary)}, ${sqlString(entry.updated)}, ${sqlJson(publicEntry(entry))});`,
    );
    for (const [scopeType, values] of Object.entries({
      route: entry.routes,
      file: entry.files,
      component: entry.components,
      flow: entry.flows,
      tag: entry.tags,
      path_match: entry.load_when.path_matches,
      task_term: entry.load_when.task_terms,
    })) {
      for (const value of values) {
        statements.push(
          `insert into scope_bindings values (${sqlString(entry.id)}, ${sqlString(scopeType)}, ${sqlString(value)}, 100);`,
        );
      }
    }
    for (const component of entry.components) {
      statements.push(
        `insert or ignore into relationships values (${sqlString(entry.id)}, 'references_component', ${sqlString(component)});`,
      );
    }
    for (const flow of entry.flows) {
      statements.push(
        `insert or ignore into relationships values (${sqlString(entry.id)}, 'references_flow', ${sqlString(flow)});`,
      );
    }
    if (entry.kind === "feedback") {
      statements.push(
        `insert into feedback_items values (${sqlString(entry.id)}, ${sqlString(entry.status)}, ${sqlString(entry.severity)}, ${sqlString(entry.source)}, ${sqlString(entry.updated)}, null, ${sqlString(entry.markdown_path)});`,
      );
    }
    if (entry.kind === "component") {
      statements.push(
        `insert into component_registry values (${sqlString(entry.id)}, ${sqlString(entry.name ?? entry.title)}, ${sqlString(entry.package_path)}, ${sqlString(entry.import_path)}, ${sqlString(entry.status)}, ${sqlString(entry.markdown_path)});`,
      );
    }
    statements.push(
      `insert into context_fts (id, title, kind, body, tags) values (${sqlString(entry.id)}, ${sqlString(entry.title)}, ${sqlString(entry.kind)}, ${sqlString(entry.body)}, ${sqlString(entry.tags.join(" "))});`,
    );
  }
  execFileSync("sqlite3", [dbPath], {
    input: `${statements.join("\n")}\n`,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return { path: path.relative(root, dbPath), warning: null };
}

function scan() {
  const entries = readContextEntries();
  const manifest = manifestFor(entries);
  const manifestPath = writeGeneratedManifest(manifest);
  const sqlite = writeSqliteIndex(entries);
  return {
    ok: true,
    scope: "scan",
    manifest_path: manifestPath,
    sqlite_path: sqlite.path,
    entry_count: entries.length,
    warnings: sqlite.warning ? [sqlite.warning] : [],
    entries: entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      markdown_path: entry.markdown_path,
    })),
  };
}

function pathMatchesPattern(pattern, targetPath) {
  if (!pattern || !targetPath) return false;
  if (pattern.endsWith("/**")) return targetPath.startsWith(pattern.slice(0, -3));
  if (pattern.includes("*")) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`).test(targetPath);
  }
  return pattern === targetPath;
}

function scoreEntry(entry, targetPath, task) {
  const reasons = [];
  let score = 0;
  if (targetPath) {
    if (entry.files.includes(targetPath)) {
      score += 100;
      reasons.push("exact file match");
    }
    if (entry.routes.includes(targetPath)) {
      score += 90;
      reasons.push("exact route match");
    }
    for (const pattern of entry.load_when.path_matches) {
      if (pathMatchesPattern(pattern, targetPath)) {
        score += 60;
        reasons.push(`load_when path match: ${pattern}`);
      }
    }
    for (const file of entry.files) {
      if (targetPath.startsWith(file.replace(/\/?$/, "/"))) {
        score += 25;
        reasons.push(`directory ancestor match: ${file}`);
      }
    }
  }

  const taskLower = task.toLowerCase();
  for (const term of entry.load_when.task_terms) {
    if (term && taskLower.includes(term.toLowerCase())) {
      score += 35;
      reasons.push(`task term match: ${term}`);
    }
  }
  const searchable = [
    entry.id,
    entry.title,
    entry.kind,
    entry.summary,
    entry.tags.join(" "),
    entry.body,
  ].join(" ").toLowerCase();
  for (const token of unique(taskLower.split(/[^a-z0-9_.-]+/)).filter((token) => token.length >= 4)) {
    if (searchable.includes(token)) score += 5;
  }
  if (entry.status === "active" || entry.status === "accepted") score += 10;
  return { score, reasons };
}

function query() {
  const targetPath = argValue("--path", "");
  const task = argValue("--task", "");
  const agent = argValue("--agent", "codex");
  const budget = Number.parseInt(argValue("--budget", "6000"), 10);
  const maxEntries = Math.max(1, Math.min(20, Math.floor((Number.isFinite(budget) ? budget : 6000) / 300)));
  const entries = readContextEntries()
    .map((entry) => {
      const ranked = scoreEntry(entry, targetPath, task);
      return { ...entry, score: ranked.score, reasons: ranked.reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, maxEntries)
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      title: entry.title,
      markdown_path: entry.markdown_path,
      score: entry.score,
      reasons: entry.reasons,
      summary: entry.summary,
      positive_rules: entry.positive_rules,
      negative_rules: entry.negative_rules,
    }));
  return {
    ok: true,
    scope: "query",
    query: {
      path: targetPath,
      task,
      agent,
      budget,
    },
    entries,
  };
}

function agentPackMarkdown(agent, entries) {
  const title = agent === "cursor" ? "Repo Context Cursor Rules" : `Repo Context Pack: ${agent}`;
  const lines = [`# ${title}`, "", "Generated from markdown source. Do not edit generated packs by hand.", ""];
  if (agent === "claude") {
    lines.push("Prioritize product-flow, UI, design, copy, and critique context. Load full files only when needed.", "");
  } else if (agent === "codex") {
    lines.push("Prioritize implementation constraints, validation commands, source paths, and rule polarity.", "");
  } else {
    lines.push("Use this as a compact IDE rule summary. Query markdown source for detail.", "");
  }
  for (const entry of entries) {
    lines.push(`## ${entry.id}`);
    lines.push("");
    lines.push(`- Kind: ${entry.kind}`);
    lines.push(`- Status: ${entry.status}`);
    lines.push(`- Source: ${entry.markdown_path}`);
    if (entry.summary) lines.push(`- Summary: ${entry.summary}`);
    if (entry.positive_rules.length > 0) {
      lines.push("- Positive rules:");
      for (const rule of entry.positive_rules) lines.push(`  - ${rule}`);
    }
    if (entry.negative_rules.length > 0) {
      lines.push("- Negative rules:");
      for (const rule of entry.negative_rules) lines.push(`  - ${rule}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function exportAgent() {
  const agent = argValue("--agent", "codex");
  const defaultOut = {
    codex: "docs/context/generated/agent-pack.codex.md",
    claude: "docs/context/generated/agent-pack.claude.md",
    cursor: ".cursor/rules/generated/repo-context.mdc",
  }[agent];
  if (!defaultOut) {
    return {
      ok: false,
      scope: "export-agent",
      errors: [{ file: "tools/context/ctx.mjs", message: `unsupported agent: ${agent}` }],
    };
  }
  const out = argValue("--out", defaultOut);
  const entries = readContextEntries();
  const outPath = path.isAbsolute(out) ? out : path.join(root, out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, agentPackMarkdown(agent, entries));
  return {
    ok: true,
    scope: "export-agent",
    agent,
    out: path.relative(root, outPath),
    entry_count: entries.length,
  };
}

function componentsList() {
  const components = readContextEntries()
    .filter((entry) => entry.kind === "component")
    .map((entry) => ({
      id: entry.id,
      name: entry.name ?? entry.title,
      status: entry.status,
      import_path: entry.import_path,
      markdown_path: entry.markdown_path,
      summary: entry.summary,
    }));
  return {
    ok: true,
    scope: "components list",
    count: components.length,
    components,
  };
}

function componentGet(id) {
  const componentId = id || argValue("--id", "");
  const component = readContextEntries().find((entry) => entry.id === componentId && entry.kind === "component");
  if (!component) {
    return {
      ok: false,
      scope: "components get",
      errors: [{ file: "docs/context/components", message: `unknown component: ${componentId}` }],
    };
  }
  return {
    ok: true,
    scope: "components get",
    component: publicEntry(component),
  };
}

function hydrateTicket(ticketPath) {
  const file = ticketPath || args[2] || argValue("--ticket", "");
  if (!file) {
    return {
      ok: false,
      scope: "ticket hydrate",
      errors: [{ file: "docs/tickets", message: "missing ticket path" }],
    };
  }
  const doc = readDoc(file);
  if (doc.ignored || !doc.frontmatter.id) {
    return {
      ok: false,
      scope: "ticket hydrate",
      errors: [{ file, message: "ticket is ignored or missing frontmatter id" }],
    };
  }
  const task = nestedFrontmatterValue(doc, "context_query", "task") ?? doc.frontmatter.title ?? "";
  const scopeFiles = nestedFrontmatterList(doc, "scope", "files");
  const scopeDirs = nestedFrontmatterList(doc, "scope", "directories");
  const scopeRoutes = nestedFrontmatterList(doc, "scope", "routes");
  const targetPaths = unique([...scopeFiles, ...scopeDirs, ...scopeRoutes]);
  const entries = readContextEntries()
    .map((entry) => {
      const scores = targetPaths.length > 0
        ? targetPaths.map((targetPath) => scoreEntry(entry, targetPath, task))
        : [scoreEntry(entry, "", task)];
      const score = Math.max(...scores.map((ranked) => ranked.score));
      const reasons = unique(scores.flatMap((ranked) => ranked.reasons));
      return { ...entry, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      markdown_path: entry.markdown_path,
      score: entry.score,
      reasons: entry.reasons,
      summary: entry.summary,
      positive_rules: entry.positive_rules,
      negative_rules: entry.negative_rules,
    }));
  return {
    ok: true,
    scope: "ticket hydrate",
    ticket: {
      id: doc.frontmatter.id,
      title: doc.frontmatter.title,
      file,
    },
    query: {
      task,
      target_paths: targetPaths,
    },
    context_ids: entries.map((entry) => entry.id),
    entries,
  };
}

function impact() {
  const changedPaths = args
    .flatMap((arg, index) => (arg === "--path" && args[index + 1] ? [args[index + 1]] : []))
    .concat(argValue("--changed", "") ? [argValue("--changed", "")] : [])
    .filter(Boolean);
  const task = argValue("--task", "impact regression check");
  const entries = readContextEntries()
    .map((entry) => {
      const scores = changedPaths.map((changedPath) => scoreEntry(entry, changedPath, task));
      const score = scores.length > 0 ? Math.max(...scores.map((ranked) => ranked.score)) : 0;
      const reasons = unique(scores.flatMap((ranked) => ranked.reasons));
      return { ...entry, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return {
    ok: true,
    scope: "impact",
    changed_paths: changedPaths,
    affected: {
      routes: unique(entries.flatMap((entry) => entry.routes)),
      files: unique(entries.flatMap((entry) => entry.files)),
      components: unique(entries.flatMap((entry) => entry.components)),
      flows: unique(entries.flatMap((entry) => entry.flows)),
      context_ids: entries.map((entry) => entry.id),
    },
    entries: entries.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      markdown_path: entry.markdown_path,
      score: entry.score,
      reasons: entry.reasons,
      positive_rules: entry.positive_rules,
      negative_rules: entry.negative_rules,
    })),
  };
}

function runStatus(runFile) {
  const file = runFile || args[2] || argValue("--run", "");
  if (!file) {
    return {
      ok: false,
      scope: "run status",
      errors: [{ file: "docs/runs", message: "missing run file" }],
    };
  }
  const doc = readDoc(file);
  const agents = nestedFrontmatterList(doc, "agents", "ids");
  const mergeQueue = nestedFrontmatterList(doc, "merge_queue", "items");
  const staleAgents = nestedFrontmatterList(doc, "stale_agents", "ids");
  return {
    ok: Boolean(doc.frontmatter.kind === "milestone-run"),
    scope: "run status",
    run: {
      file,
      ticket_pack: doc.frontmatter.ticket_pack,
      status: doc.frontmatter.status,
      coordinator: doc.frontmatter.coordinator,
      max_parallel_agents: doc.frontmatter.max_parallel_agents,
      stale_after_minutes: doc.frontmatter.stale_after_minutes,
    },
    agents,
    stale_agents: staleAgents,
    merge_queue: mergeQueue,
    pack_validation: {
      pending: doc.body.includes("Pack validation: pending"),
    },
    errors: doc.frontmatter.kind === "milestone-run" ? [] : [{ file, message: "run kind must be milestone-run" }],
  };
}

function idvisorWorkflow() {
  return {
    ok: true,
    scope: "idvisor workflow",
    plugin: "repo-context",
    source_of_truth: "repo-local markdown",
    local_commands: [
      "node tools/context/ctx.mjs scan --json",
      "node tools/context/ctx.mjs query --path <path> --task <task> --agent codex --budget 6000 --json",
      "node tools/context/ctx.mjs ticket hydrate <ticket> --json",
      "node tools/context/ctx.mjs pack status <pack-id> --json",
      "node tools/context/ctx.mjs run status <run-file> --json",
    ],
    gates: [
      "spec-question-pass",
      "spec-hardening-pass",
      "ticket-hardening-pass",
      "ready-before-dispatch",
      "commit-and-evidence-before-done",
      "pack-validation-before-complete",
    ],
    dispatch: {
      default_implementation_agent: "codex",
      ui_review_agent: "claude-high-effort",
      merge_strategy: "coordinator-queue",
    },
  };
}

const requiredAxioms = [
  "axiom.markdown-source-of-truth",
  "axiom.ticket-done-requires-commit",
  "axiom.rule-polarity-preserved",
];

function customize() {
  const profile = argValue("--profile", "strict");
  const dryRun = args.includes("--dry-run") || !args.includes("--write");
  const profiles = {
    minimal: {
      enabled: ["markdown-source", "lint", "ticket-check"],
      optional: ["agent-packs", "sqlite-index", "impact"],
    },
    "web-app": {
      enabled: ["markdown-source", "lint", "ticket-check", "component-catalog", "impact", "agent-packs"],
      optional: ["idvisor-workflow", "custom-ui-catalog"],
    },
    "ui-heavy": {
      enabled: ["markdown-source", "lint", "ticket-check", "component-catalog", "impact", "claude-ui-review", "agent-packs"],
      optional: ["idvisor-workflow"],
    },
    astrotechne: {
      enabled: [
        "markdown-source",
        "lint",
        "ticket-check",
        "legacy-ticket-adapter",
        "component-catalog",
        "impact",
        "run-orchestration",
        "agent-packs",
        "semble-discovery",
      ],
      optional: ["claude-ui-review", "idvisor-workflow", "custom-ui-catalog"],
    },
    "idvisor-orchestrated": {
      enabled: ["markdown-source", "lint", "ticket-check", "run-orchestration", "idvisor-workflow", "agent-packs"],
      optional: ["custom-ui-catalog"],
    },
    strict: {
      enabled: ["markdown-source", "lint", "ticket-check", "component-catalog", "impact", "run-orchestration", "idvisor-workflow", "agent-packs"],
      optional: [],
    },
  };
  const selected = profiles[profile];
  if (!selected) {
    return {
      ok: false,
      scope: "customize",
      errors: [{ file: "docs/config", message: `unknown profile: ${profile}` }],
    };
  }
  const config = {
    profile,
    required_axioms: requiredAxioms,
    enabled: selected.enabled,
    optional: selected.optional,
    generated_by: "tools/context/ctx.mjs customize",
  };
  const out = argValue("--out", "docs/config/repo-context.profile.json");
  if (!dryRun) {
    const outPath = path.isAbsolute(out) ? out : path.join(root, out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
  }
  return {
    ok: true,
    scope: "customize",
    dry_run: dryRun,
    out,
    config,
  };
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "work";
}

function splitCsv(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function argValues(name) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name && args[index + 1]) values.push(args[index + 1]);
  }
  return values.flatMap(splitCsv);
}

function yamlKeyList(key, values, indent = "") {
  const clean = unique(values);
  if (clean.length === 0) return `${indent}${key}: []`;
  return `${indent}${key}:\n${clean.map((value) => `${indent}  - ${value}`).join("\n")}`;
}

function targetRepoPath() {
  const repoArg = argValue("--repo", ".");
  return path.isAbsolute(repoArg) ? repoArg : path.join(root, repoArg);
}

function detectAdoptionProfile(repoPath, explicitProfile = "auto") {
  const base = path.basename(repoPath);
  const profile = explicitProfile === "auto"
    ? (fs.existsSync(path.join(repoPath, "docs/domain-redesign/tickets")) || base.includes("astrotechne")
        ? "astrotechne"
        : (base.includes("wetware") ? "wetware" : "default"))
    : explicitProfile;
  const pkg = readPackageJson(repoPath);
  const profiles = {
    default: {
      profile: "default",
      ticket_root: "docs/tickets",
      ticket_status_command: null,
      package_manager: detectPackageManager(repoPath, pkg),
      recommended_validation: [],
      preserved_ticket_system: "repo-context target tickets",
    },
    wetware: {
      profile: "wetware",
      ticket_root: "docs/tickets",
      ticket_status_command: null,
      package_manager: "pnpm",
      recommended_validation: [
        "npx pnpm@10.34.4 test",
        "npx pnpm@10.34.4 typecheck",
        "npx pnpm@10.34.4 lint",
        "npx pnpm@10.34.4 build",
      ],
      preserved_ticket_system: "flat Wetware docs/tickets markdown",
    },
    astrotechne: {
      profile: "astrotechne",
      ticket_root: "docs/domain-redesign/tickets",
      ticket_status_command: "npm run tickets:status",
      package_manager: "npm",
      recommended_validation: ["npm run tickets:status", "npx biome check", "npm run build"],
      preserved_ticket_system: "Astrotechne domain-redesign ticket tree",
    },
  };
  return profiles[profile] ?? { ...profiles.default, profile };
}

const adoptionContextDirs = [
  "docs/context/routes",
  "docs/context/files",
  "docs/context/dirs",
  "docs/context/components",
  "docs/context/flows",
  "docs/context/design",
  "docs/context/architecture",
  "docs/context/feedback",
  "docs/context/generated",
  "docs/context/schema",
  "docs/config",
  "docs/specs",
  "docs/ticket-packs",
  "docs/workflows",
];

function writeFileIfAllowed(repoPath, relativePath, text, options) {
  const full = path.join(repoPath, relativePath);
  if (fs.existsSync(full) && !options.force) {
    return { action: "skipped", file: relativePath, reason: "exists" };
  }
  if (options.write) {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text);
  }
  return { action: options.write ? "created" : "planned", file: relativePath };
}

function adoptionBootstrap() {
  const repoPath = targetRepoPath();
  const write = args.includes("--write");
  const force = args.includes("--force");
  if (!fs.existsSync(repoPath)) {
    return { ok: false, scope: "adoption bootstrap", errors: [{ file: argValue("--repo", "."), message: "repo path does not exist" }] };
  }
  const profile = detectAdoptionProfile(repoPath, argValue("--profile", "auto"));
  const changes = [];
  for (const dir of [...adoptionContextDirs, profile.ticket_root]) {
    const full = path.join(repoPath, dir);
    if (fs.existsSync(full)) changes.push({ action: "skipped", file: dir, reason: "exists" });
    else {
      if (write) fs.mkdirSync(full, { recursive: true });
      changes.push({ action: write ? "created" : "planned", file: dir });
    }
  }
  const config = {
    config_version: 1,
    generated_by: "repo-context adoption bootstrap",
    profile: profile.profile,
    ticket_root: profile.ticket_root,
    ticket_status_command: profile.ticket_status_command,
    package_manager: profile.package_manager,
    recommended_validation: profile.recommended_validation,
    preserved_ticket_system: profile.preserved_ticket_system,
    context_loading: {
      default: "explicit",
      command: "ctx adoption implementation-plan --repo <repo> --ticket <ticket> --json",
    },
    updated: todayDate(),
  };
  changes.push(writeFileIfAllowed(repoPath, "docs/config/repo-context.profile.json", `${JSON.stringify(config, null, 2)}\n`, { write, force }));
  changes.push(writeFileIfAllowed(
    repoPath,
    "docs/context/README.md",
    "# Repo Context\n\nRepo-local context is loaded explicitly with `ctx adoption implementation-plan` or targeted queries. Do not bulk-load this directory by default.\n",
    { write, force },
  ));
  return {
    ok: true,
    scope: "adoption bootstrap",
    repo: repoPath,
    write,
    force,
    profile,
    changes,
    next_commands: [
      `ctx adoption context --repo ${repoPath} --kind flow --title "<flow>" --path "<path>" --task "<task>" --write --json`,
      `ctx adoption ticket --repo ${repoPath} --title "<ticket>" --task "<task>" --context "<context-id>" --write --json`,
    ],
    errors: [],
  };
}

function adoptionContext() {
  const repoPath = targetRepoPath();
  const write = args.includes("--write");
  const force = args.includes("--force");
  if (!fs.existsSync(repoPath)) {
    return { ok: false, scope: "adoption context", errors: [{ file: argValue("--repo", "."), message: "repo path does not exist" }] };
  }
  const kind = argValue("--kind", "flow");
  const folderByKind = { route: "routes", file: "files", dir: "dirs", component: "components", flow: "flows", design: "design", architecture: "architecture" };
  if (!Object.hasOwn(folderByKind, kind)) {
    return { ok: false, scope: "adoption context", errors: [{ file: "adoption context", message: `unsupported --kind ${kind}` }] };
  }
  const title = argValue("--title", argValue("--task", "Adopted Context"));
  const slug = slugify(argValue("--slug", title));
  const paths = unique([...argValues("--path"), ...argValues("--file")]);
  const routes = argValues("--route");
  const components = argValues("--component");
  const taskTerms = unique([...splitCsv(argValue("--task", "")), ...argValues("--task-term")]);
  const positiveRules = argValues("--positive-rule");
  const negativeRules = argValues("--negative-rule");
  const id = `${kind}.${slug}`;
  const relativePath = `docs/context/${folderByKind[kind]}/${slug}.md`;
  const positive = positiveRules.length > 0 ? positiveRules : ["Load this context only when the task or scoped files match."];
  const negative = negativeRules.length > 0 ? negativeRules : ["Do not bulk-load unrelated context entries."];
  const text = `---\nid: ${id}\nkind: ${kind}\ncontext_scan: true\nstatus: active\ntitle: ${title}\n${yamlKeyList("routes", routes)}\n${yamlKeyList("files", paths)}\n${yamlKeyList("components", components)}\n${yamlKeyList("flows", kind === "flow" ? [id] : [])}\ntags:\n  - repo-context-adoption\n${yamlKeyList("positive_rules", positive)}\n${yamlKeyList("negative_rules", negative)}\nload_when:\n${yamlKeyList("path_matches", paths, "  ")}\n${yamlKeyList("task_terms", taskTerms, "  ")}\nupdated: ${todayDate()}\n---\n\n# ${title}\n\n## Purpose\n\nCapture repo-local context for ${argValue("--task", title)}.\n\n## Current Decisions\n\n- Context is loaded explicitly for matching tickets or implementation plans.\n\n## Positive Rules\n\n${positive.map((rule) => `- ${rule}`).join("\n")}\n\n## Negative Rules\n\n${negative.map((rule) => `- ${rule}`).join("\n")}\n\n## Implementation Rules\n\n- Use this entry as bounded guidance for tickets that cite \`${id}\`.\n- Run \`ctx adoption implementation-plan\` before implementation to hydrate only relevant context.\n`;
  const change = writeFileIfAllowed(repoPath, relativePath, text, { write, force });
  return {
    ok: change.action !== "skipped" || !write,
    scope: "adoption context",
    repo: repoPath,
    write,
    context: { id, kind, title, file: relativePath },
    changes: [change],
    errors: change.action === "skipped" && write ? [{ file: relativePath, message: "context file exists; pass --force to overwrite" }] : [],
  };
}

function adoptionTicket() {
  const repoPath = targetRepoPath();
  const write = args.includes("--write");
  const force = args.includes("--force");
  if (!fs.existsSync(repoPath)) {
    return { ok: false, scope: "adoption ticket", errors: [{ file: argValue("--repo", "."), message: "repo path does not exist" }] };
  }
  const profile = detectAdoptionProfile(repoPath, argValue("--profile", "auto"));
  const title = argValue("--title", argValue("--task", "Adopted Ticket"));
  const task = argValue("--task", title);
  const slug = slugify(argValue("--slug", title));
  const contexts = unique([...argValues("--context"), ...argValues("--context-id")]);
  const files = unique([...argValues("--file"), ...argValues("--path")]);
  const routes = argValues("--route");
  const components = argValues("--component");
  const flows = argValues("--flow");
  const validations = unique([...argValues("--validation"), ...profile.recommended_validation]);
  const relativePath = path.join(profile.ticket_root, `${slug}.md`);
  const text = `---\nid: ${argValue("--id", `ticket.${slug}`)}\nstatus: ready\ntitle: ${title}\nwork_type: ${argValue("--work-type", "implementation")}\nticket_pack: ${argValue("--pack", `pack.${profile.profile}.${todayDate().slice(0, 7)}.adoption`)}\nmilestones:\n  - ${argValue("--milestone", `milestone.${profile.profile}.adoption`)}\nsource_spec: null\nsource_feedback: []\nimplementation_agent: codex\nplanning_agents:\n  - codex-high-effort\nui_review_agent: claude-high-effort\nparallel_group: ${argValue("--parallel-group", "default")}\ndepends_on: []\nblocks: []\nscope:\n${yamlKeyList("routes", routes, "  ")}\n${yamlKeyList("files", files, "  ")}\n  directories: []\n${yamlKeyList("components", components, "  ")}\n${yamlKeyList("flows", flows, "  ")}\ncontext_query:\n  task: "${task.replace(/"/g, "'")}"\n  generated_at: ${todayDate()}\n${yamlKeyList("context_ids", contexts, "  ")}\naxioms:\n  - axiom.markdown-source-of-truth\n  - axiom.ticket-done-requires-commit\n  - axiom.explicit-context-loading\nvalidation:\n${yamlKeyList("automated", validations, "  ")}\n  smoke: []\n  screenshots: []\ncompletion:\n  commit: pending\n  completed_at: null\n---\n\n# ${title}\n\n## Outcome\n\n${argValue("--outcome", `Deliver ${task} without making uncaptured product, design, architecture, or security decisions during implementation.`)}\n\n## Context\n\nRun \`ctx adoption implementation-plan --repo ${repoPath} --ticket ${relativePath} --json\` before implementation. Load only the returned context entries unless the ticket is blocked.\n\n## Positive Rules\n\n- Use the cited context ids and scoped files as the implementation boundary.\n- Preserve repo-local ticket and validation conventions for the ${profile.profile} profile.\n\n## Negative Rules\n\n- Do not bulk-load unrelated docs or infer missing product/design decisions.\n- Do not mark complete without commit metadata and validation evidence.\n\n## Axioms\n\n- \`axiom.markdown-source-of-truth\`: Markdown remains the canonical planning artifact.\n- \`axiom.ticket-done-requires-commit\`: Each completed ticket should have a clean commit.\n- \`axiom.explicit-context-loading\`: Context is loaded by command, not by scanning every markdown file into the prompt.\n\n## Frozen Decisions\n\n- Profile: ${profile.profile}\n- Ticket root: ${profile.ticket_root}\n- Context ids: ${contexts.length > 0 ? contexts.map((item) => `\`${item}\``).join(", ") : "none"}\n\n## Implementation Rules\n\n- Required approach: implement only the scoped task and update this ticket when complete.\n- Existing components/helpers to use: read from the implementation-plan output.\n- Stop and escalate if: the implementation needs a decision absent from this ticket or returned context.\n\n## Scope\n\n- In: ${files.concat(routes).join(", ") || task}\n- Out: unrelated refactors, broad dependency changes, hidden infrastructure changes.\n\n## Acceptance Criteria\n\n- The scoped behavior is complete.\n- Validation commands pass or failures are documented with exact blockers.\n\n## Validation\n\n${validations.map((item) => `- \`${item}\``).join("\n") || "- Add the repo-appropriate validation command before implementation."}\n\n## Completion\n\n- Status: ready\n- Commit: pending\n- Verification evidence: pending\n`;
  const change = writeFileIfAllowed(repoPath, relativePath, text, { write, force });
  return {
    ok: change.action !== "skipped" || !write,
    scope: "adoption ticket",
    repo: repoPath,
    write,
    profile,
    ticket: { id: argValue("--id", `ticket.${slug}`), title, file: relativePath, status: "ready" },
    changes: [change],
    next_commands: [`ctx adoption implementation-plan --repo ${repoPath} --ticket ${relativePath} --json`],
    errors: change.action === "skipped" && write ? [{ file: relativePath, message: "ticket file exists; pass --force to overwrite" }] : [],
  };
}

function targetContextEntries(repoPath) {
  const contextRoot = path.join(repoPath, "docs/context");
  if (!fs.existsSync(contextRoot)) return [];
  return walk(contextRoot)
    .filter((file) => file.endsWith(".md") && !file.includes("/schema/") && !file.includes("/generated/"))
    .map((file) => {
      const relative = path.relative(repoPath, file);
      return { file: relative, doc: readDocAt(repoPath, relative) };
    })
    .filter(({ doc }) => !doc.ignored)
    .map(({ file, doc }) => contextEntryFromDoc(file, doc))
    .filter((entry) => typeof entry.id === "string")
    .sort((a, b) => a.id.localeCompare(b.id));
}

function bodySectionLines(body, heading) {
  const lines = body.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return [];
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    out.push(lines[index]);
  }
  return out;
}

function implementationPlan() {
  const repoPath = targetRepoPath();
  const ticketArg = argValue("--ticket", args[2] && !args[2].startsWith("--") ? args[2] : "");
  const includeBody = args.includes("--include-body");
  if (!fs.existsSync(repoPath)) {
    return { ok: false, scope: "adoption implementation-plan", errors: [{ file: argValue("--repo", "."), message: "repo path does not exist" }] };
  }
  if (!ticketArg) {
    return { ok: false, scope: "adoption implementation-plan", errors: [{ file: "adoption implementation-plan", message: "missing --ticket <path>" }] };
  }
  const ticketPath = path.isAbsolute(ticketArg) ? path.relative(repoPath, ticketArg) : ticketArg;
  if (!fs.existsSync(path.join(repoPath, ticketPath))) {
    return { ok: false, scope: "adoption implementation-plan", errors: [{ file: ticketArg, message: "ticket file does not exist" }] };
  }
  const doc = readDocAt(repoPath, ticketPath);
  const task = nestedFrontmatterValue(doc, "context_query", "task") ?? doc.frontmatter.title ?? "";
  const explicitContextIds = unique([
    ...(Array.isArray(doc.frontmatter.context_ids) ? doc.frontmatter.context_ids : []),
    ...nestedFrontmatterList(doc, "context_query", "context_ids"),
  ]);
  const targetPaths = unique([
    ...nestedFrontmatterList(doc, "scope", "files"),
    ...nestedFrontmatterList(doc, "scope", "directories"),
    ...nestedFrontmatterList(doc, "scope", "routes"),
  ]);
  const entries = targetContextEntries(repoPath)
    .map((entry) => {
      const explicit = explicitContextIds.includes(entry.id);
      const scores = targetPaths.length > 0 ? targetPaths.map((targetPath) => scoreEntry(entry, targetPath, task)) : [scoreEntry(entry, "", task)];
      const score = (explicit ? 1000 : 0) + Math.max(...scores.map((ranked) => ranked.score));
      const reasons = unique([...(explicit ? ["explicit context id"] : []), ...scores.flatMap((ranked) => ranked.reasons)]);
      return { ...entry, score, reasons };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, Number.parseInt(argValue("--limit", "8"), 10))
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      status: entry.status,
      title: entry.title,
      markdown_path: entry.markdown_path,
      score: entry.score,
      reasons: entry.reasons,
      summary: entry.summary,
      positive_rules: entry.positive_rules,
      negative_rules: entry.negative_rules,
      body: includeBody ? boundedText(entry.body, 2000) : undefined,
    }));
  const validationCommands = unique([
    ...nestedFrontmatterList(doc, "validation", "automated"),
    ...bodySectionLines(doc.body, "Validation")
      .map((line) => line.match(/`([^`]+)`/)?.[1] ?? line.replace(/^-\s*/, "").trim())
      .filter((line) => line && !line.endsWith(":")),
  ]);
  return {
    ok: true,
    scope: "adoption implementation-plan",
    repo: repoPath,
    explicit_context_loading: true,
    ticket: {
      file: ticketPath,
      id: doc.frontmatter.id ?? null,
      title: doc.frontmatter.title ?? null,
      status: doc.frontmatter.status ?? null,
      work_type: doc.frontmatter.work_type ?? null,
    },
    task,
    target_paths: targetPaths,
    context_ids: entries.map((entry) => entry.id),
    entries,
    validation_commands: validationCommands,
    stop_conditions: [
      "Stop if implementation needs a product, design, architecture, or security decision missing from the ticket/context.",
      "Stop if validation requires paid infrastructure changes that were not costed before implementation.",
      "Stop before marking done unless commit metadata and validation evidence are recorded.",
    ],
    errors: [],
  };
}

function doctor() {
  const errors = [];
  validateDirs(errors);
  validateContextEntries(errors);
  validateWorkflows(errors);
  const specs = validateSpecs(errors);
  const tickets = validateTickets(errors, specs);
  const packs = validatePacks(errors, tickets, specs);
  validateRuns(errors);
  validateFutureWork(errors, tickets, packs, specs);
  const generatedManifest = path.join(root, "docs/context/generated/context-manifest.json");
  return {
    ok: errors.length === 0,
    scope: "doctor",
    checks: {
      lint: errors.length === 0,
      node: true,
      sqlite3: commandExists("sqlite3"),
      semble: commandExists("semble"),
      uvx: commandExists("uvx"),
      generated_manifest: fs.existsSync(generatedManifest),
    },
    counts: {
      context_entries: readContextEntries().length,
      specs: specs.size,
      tickets: tickets.size,
      packs: packs.size,
    },
    errors,
  };
}

function packStatus(packId) {
  const errors = [];
  const specs = validateSpecs(errors);
  const tickets = validateTickets(errors, specs);
  const packs = validatePacks(errors, tickets, specs);
  const requestedPackId = packId || argValue("--pack", "");
  const pack = packs.get(requestedPackId);
  if (!pack) {
    return {
      ok: false,
      scope: "pack status",
      pack: requestedPackId,
      errors: [{ file: "docs/ticket-packs", message: `unknown pack: ${requestedPackId}` }],
    };
  }
  const ticketRows = (Array.isArray(pack.frontmatter.tickets) ? pack.frontmatter.tickets : []).map((ticketId) => {
    const ticket = tickets.get(ticketId);
    return {
      id: ticketId,
      status: ticket?.frontmatter.status ?? "missing",
      title: ticket?.frontmatter.title ?? null,
      file: ticket?.file ?? null,
      parallel_group: ticket?.frontmatter.parallel_group ?? null,
    };
  });
  const byStatus = {};
  for (const ticket of ticketRows) {
    byStatus[ticket.status] = (byStatus[ticket.status] ?? 0) + 1;
  }
  return {
    ok: errors.length === 0,
    scope: "pack status",
    pack: {
      id: pack.frontmatter.id,
      status: pack.frontmatter.status,
      title: pack.frontmatter.title,
      file: pack.file,
    },
    ticket_count: ticketRows.length,
    by_status: byStatus,
    tickets: ticketRows,
    errors,
  };
}

function writeInitFile(relativePath, content, result, force = false) {
  const target = path.join(root, relativePath);
  if (fs.existsSync(target) && !force) {
    result.blocked.push(relativePath);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  result.created.push(relativePath);
}

function copyInitFile(sourceRelativePath, targetRelativePath, result, force = false) {
  const source = path.join(toolRoot, sourceRelativePath);
  const target = path.join(root, targetRelativePath);
  if (!fs.existsSync(source)) {
    result.warnings.push(`missing source template: ${sourceRelativePath}`);
    return;
  }
  if (fs.existsSync(target) && !force) {
    result.skipped.push(targetRelativePath);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  result.created.push(targetRelativePath);
}

function initRepo() {
  const force = args.includes("--force");
  const result = {
    ok: true,
    scope: "init",
    force,
    created: [],
    skipped: [],
    blocked: [],
    warnings: [],
  };
  for (const dir of requiredDirs) {
    const full = path.join(root, dir);
    if (fs.existsSync(full)) {
      result.skipped.push(dir);
    } else {
      fs.mkdirSync(full, { recursive: true });
      result.created.push(dir);
    }
  }
  const templateCopies = [
    ["docs/specs/templates/spec.md", "docs/specs/templates/spec.md"],
    ["docs/tickets/templates/canonical-ticket.md", "docs/tickets/templates/canonical-ticket.md"],
    ["docs/ticket-packs/templates/ticket-pack.md", "docs/ticket-packs/templates/ticket-pack.md"],
    ["docs/future-work/templates/future-work.md", "docs/future-work/templates/future-work.md"],
    ["docs/context/schema/context-entry.schema.json", "docs/context/schema/context-entry.schema.json"],
    ["docs/context/schema/feedback-entry.schema.json", "docs/context/schema/feedback-entry.schema.json"],
  ];
  for (const [source, target] of templateCopies) {
    copyInitFile(source, target, result, force);
  }
  writeInitFile(
    "AGENTS.md",
    `# Agent Instructions

Before creating or implementing tickets, run:

\`\`\`sh
node tools/context/ctx.mjs scan --json
node tools/context/ctx.mjs query --path <target-path> --task "<task>" --agent codex --budget 6000 --json
\`\`\`

Use markdown specs, tickets, ticket packs, and context entries as source-of-truth planning artifacts.
`,
    result,
    force,
  );
  writeInitFile(
    "CLAUDE.md",
    `# Claude Instructions

Use repo-context markdown for product-flow, design, copy, and UI hardening passes. Prefer targeted context from \`ctx query\` over broad document loading.
`,
    result,
    force,
  );
  writeInitFile(
    ".cursor/rules/repo-context.mdc",
    `---
description: Repo Context
globs:
  - "**/*"
alwaysApply: false
---

Use \`docs/context\`, \`docs/specs\`, \`docs/tickets\`, and \`docs/ticket-packs\` as local context sources. Preserve positive and negative rules separately.
`,
    result,
    force,
  );
  result.ok = result.blocked.length === 0;
  return result;
}

function validateDirs(errors) {
  for (const dir of requiredDirs) {
    assert(fs.existsSync(path.join(root, dir)), errors, dir, "required directory is missing");
  }
}

function validateContextEntries(errors) {
  const files = markdownFiles("docs/context").filter(
    (file) => !file.includes("/schema/") && !file.includes("/generated/"),
  );
  const ids = new Map();
  const expectedKindByFolder = {
    routes: "route",
    files: "file",
    dirs: "dir",
    components: "component",
    flows: "flow",
    design: "design",
    architecture: "architecture",
    feedback: "feedback",
  };
  for (const file of files) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    if (typeof fm.id === "string") {
      assert(!ids.has(fm.id), errors, file, `duplicate context id: ${fm.id}`);
      ids.set(fm.id, file);
    }
    const folder = folderAfter(file, "docs/context");
    const expectedKind = expectedKindByFolder[folder];
    assert(Boolean(expectedKind), errors, file, `unsupported context folder: ${folder}`);
    assert(fm.kind === expectedKind, errors, file, `context kind ${fm.kind} does not match folder ${folder}`);

    if (fm.kind === "feedback") {
      assert(/^feedback\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "feedback id must start with feedback.");
      assert(feedbackStatuses.has(fm.status), errors, file, `invalid feedback status: ${fm.status}`);
      assert(feedbackSeverities.has(fm.severity), errors, file, `invalid feedback severity: ${fm.severity}`);
      for (const key of ["title", "source", "applies_to", "created"]) {
        assert(Object.hasOwn(fm, key), errors, file, `missing feedback frontmatter: ${key}`);
      }
      for (const heading of ["Feedback", "Decision", "Regression Risk"]) {
        assert(sectionPresent(doc.body, heading), errors, file, `missing feedback section: ${heading}`);
      }
      continue;
    }

    assert(new RegExp(`^${fm.kind}\\.[A-Za-z0-9_.-]+$`).test(fm.id ?? ""), errors, file, `context id must start with ${fm.kind}.`);
    assert(contextKinds.has(fm.kind), errors, file, `invalid context kind: ${fm.kind}`);
    assert(contextStatuses.has(fm.status), errors, file, `invalid context status: ${fm.status}`);
    for (const key of ["title", "positive_rules", "negative_rules", "load_when", "updated"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing context frontmatter: ${key}`);
    }
    for (const heading of ["Purpose", "Current Decisions", "Positive Rules", "Negative Rules", "Implementation Rules"]) {
      assert(sectionPresent(doc.body, heading), errors, file, `missing context section: ${heading}`);
    }
  }
}

function validateSpecs(errors) {
  const files = markdownFiles("docs/specs");
  const specs = new Map();
  for (const file of files) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    if (typeof fm.id === "string") {
      assert(!specs.has(fm.id), errors, file, `duplicate spec id: ${fm.id}`);
      specs.set(fm.id, { file, frontmatter: fm, body: doc.body });
    }
    assert(/^spec\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "spec id must start with spec.");
    assert(specStatuses.has(fm.status), errors, file, `invalid spec status: ${fm.status}`);
    for (const key of ["title", "owner_agent", "source_feedback", "context_ids", "target_agents", "created"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing spec frontmatter: ${key}`);
    }
    for (const heading of ["Goal", "Affected Surfaces", "Product Decisions", "Architecture Decisions", "Design Decisions", "Security and Privacy Decisions", "Open Questions", "Hardening Review", "Ticket Plan"]) {
      assert(sectionPresent(doc.body, heading), errors, file, `missing spec section: ${heading}`);
    }
    assert(!hasPlaceholder(doc.body + JSON.stringify(fm)), errors, file, "spec still contains template placeholder text");
  }
  return specs;
}

function validateTickets(errors, specs = new Map()) {
  const files = markdownFiles("docs/tickets").filter((file) => !file.includes("/templates/"));
  const tickets = new Map();
  for (const file of files) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    if (typeof fm.id === "string") {
      assert(!tickets.has(fm.id), errors, file, `duplicate ticket id: ${fm.id}`);
      tickets.set(fm.id, { file, frontmatter: fm, body: doc.body });
    }
    assert(/^ticket\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "ticket id must start with ticket.");
    assert(ticketStatuses.has(fm.status), errors, file, `invalid ticket status: ${fm.status}`);
    const folderStatus = folderAfter(file, "docs/tickets");
    if (folderStatus && ticketStatuses.has(folderStatus)) {
      assert(fm.status === folderStatus, errors, file, `ticket status ${fm.status} does not match folder ${folderStatus}`);
    }
    for (const key of ["title", "ticket_pack", "milestones", "source_spec", "implementation_agent", "parallel_group", "scope", "context_query", "axioms", "validation", "completion"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing canonical ticket frontmatter: ${key}`);
    }
    if (typeof fm.source_spec === "string") {
      assert(specs.has(fm.source_spec), errors, file, `ticket references missing spec: ${fm.source_spec}`);
    }
    if (fm.status === "done") {
      const commit = nestedFrontmatterValue(doc, "completion", "commit");
      const completedAt = nestedFrontmatterValue(doc, "completion", "completed_at");
      assert(Boolean(commit && commit !== "pending"), errors, file, "done ticket must record completion commit");
      assert(Boolean(completedAt && completedAt !== "null"), errors, file, "done ticket must record completed_at");
      if (isDependencyUpgradeTicket(doc)) {
        const completion = allNestedFrontmatterValues(doc, "completion");
        assert(completion.dependency_audit === "cleared", errors, file, "done dependency-upgrade ticket must record completion.dependency_audit: cleared");
        assert(Boolean(completion.dependency_audit_command), errors, file, "done dependency-upgrade ticket must record completion.dependency_audit_command");
        assert(Boolean(completion.dependency_audit_checked_at), errors, file, "done dependency-upgrade ticket must record completion.dependency_audit_checked_at");
      }
    }
    for (const heading of ["Outcome", "Context", "Positive Rules", "Negative Rules", "Axioms", "Frozen Decisions", "Implementation Rules", "Scope", "Acceptance Criteria", "Validation", "Completion"]) {
      assert(sectionPresent(doc.body, heading), errors, file, `missing ticket section: ${heading}`);
    }
    assert(!hasPlaceholder(doc.body + JSON.stringify(fm)), errors, file, "ticket still contains template placeholder text");
  }
  return tickets;
}

function validatePacks(errors, tickets, specs = new Map()) {
  const files = markdownFiles("docs/ticket-packs").filter((file) => !file.includes("/templates/"));
  const packs = new Map();
  const allowedFolderStatuses = {
    draft: new Set(["draft"]),
    active: new Set(["active", "blocked"]),
    backlog: new Set(["draft", "ready", "blocked"]),
    done: new Set(["done"]),
    superseded: new Set(["superseded"]),
  };
  for (const file of files) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    if (typeof fm.id === "string") {
      assert(!packs.has(fm.id), errors, file, `duplicate pack id: ${fm.id}`);
      packs.set(fm.id, { file, frontmatter: fm, body: doc.body });
    }
    assert(/^pack\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "pack id must start with pack.");
    assert(packStatuses.has(fm.status), errors, file, `invalid pack status: ${fm.status}`);
    const folderStatus = folderAfter(file, "docs/ticket-packs");
    if (folderStatus && allowedFolderStatuses[folderStatus]) {
      assert(allowedFolderStatuses[folderStatus].has(fm.status), errors, file, `pack status ${fm.status} does not belong in folder ${folderStatus}`);
    }
    for (const key of ["title", "milestones", "source_specs", "tickets", "run_policy", "parallel_groups", "completion"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing pack frontmatter: ${key}`);
    }
    if (Array.isArray(fm.source_specs)) {
      for (const spec of fm.source_specs) {
        assert(specs.has(spec), errors, file, `pack references missing spec: ${spec}`);
      }
    }
    if (Array.isArray(fm.tickets)) {
      for (const ticket of fm.tickets) {
        assert(tickets.has(ticket), errors, file, `pack references missing ticket: ${ticket}`);
        const ticketDoc = tickets.get(ticket);
        if (ticketDoc) {
          assert(ticketDoc.frontmatter.ticket_pack === fm.id, errors, ticketDoc.file, `ticket_pack ${ticketDoc.frontmatter.ticket_pack} does not match containing pack ${fm.id}`);
        }
      }
    }
    if (fm.status === "done") {
      const completedAt = nestedFrontmatterValue(doc, "completion", "completed_at");
      assert(Boolean(completedAt && completedAt !== "null"), errors, file, "done pack must record completed_at");
    }
    for (const heading of ["Outcome", "Scope", "Tickets", "Execution Plan", "Run Policy", "Pack Validation", "Completion"]) {
      assert(sectionPresent(doc.body, heading), errors, file, `missing pack section: ${heading}`);
    }
  }
  for (const [id, ticket] of tickets) {
    const packId = ticket.frontmatter.ticket_pack;
    if (typeof packId !== "string") continue;
    assert(packs.has(packId), errors, ticket.file, `ticket references missing pack: ${packId}`);
    const packTickets = packs.get(packId)?.frontmatter.tickets;
    if (Array.isArray(packTickets)) {
      assert(packTickets.includes(id), errors, ticket.file, `ticket_pack ${packId} does not include ticket ${id}`);
    }
  }
  return packs;
}

function validateRuns(errors) {
  for (const file of markdownFiles("docs/runs")) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    assert(fm.kind === "milestone-run", errors, file, "run kind must be milestone-run");
    assert(runStatuses.has(fm.status), errors, file, `invalid run status: ${fm.status}`);
    for (const key of ["ticket_pack", "coordinator", "max_parallel_agents", "stale_after_minutes", "agents", "merge_queue"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing run frontmatter: ${key}`);
    }
  }
}

function validateFutureWork(errors, tickets = new Map(), packs = new Map(), specs = new Map()) {
  const files = markdownFiles("docs/future-work").filter((file) => !file.includes("/templates/"));
  const allowedFolderStatuses = {
    captured: new Set(["captured", "questioning"]),
    promoted: new Set(["promoted"]),
    superseded: new Set(["superseded"]),
  };
  for (const file of files) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    assert(/^future\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "future work id must start with future.");
    assert(fm.kind === "future-work", errors, file, "future work kind must be future-work");
    assert(["captured", "questioning", "promoted", "superseded"].includes(fm.status), errors, file, `invalid future work status: ${fm.status}`);
    const folderStatus = folderAfter(file, "docs/future-work");
    if (folderStatus && allowedFolderStatuses[folderStatus]) {
      assert(allowedFolderStatuses[folderStatus].has(fm.status), errors, file, `future work status ${fm.status} does not belong in folder ${folderStatus}`);
    }
    for (const key of ["title", "captured_at", "source", "promotion_target"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing future work frontmatter: ${key}`);
    }
    const targetSpec = nestedFrontmatterValue(doc, "promotion_target", "spec");
    const targetPack = nestedFrontmatterValue(doc, "promotion_target", "ticket_pack");
    const targetTicket = nestedFrontmatterValue(doc, "promotion_target", "ticket");
    if (fm.status === "promoted") {
      assert(targetSpec || targetPack || targetTicket, errors, file, "promoted future work must reference a promotion target");
    }
    if (targetSpec) assert(specs.has(targetSpec), errors, file, `future work references missing spec: ${targetSpec}`);
    if (targetPack) assert(packs.has(targetPack), errors, file, `future work references missing ticket pack: ${targetPack}`);
    if (targetTicket) assert(tickets.has(targetTicket), errors, file, `future work references missing ticket: ${targetTicket}`);
    for (const heading of ["Idea", "Why Later", "Questions Before Promotion", "Promotion Notes"]) {
      assert(sectionPresent(doc.body, heading), errors, file, `missing future work section: ${heading}`);
    }
  }
}

function validateWorkflows(errors) {
  for (const file of workflowMarkdownFiles()) {
    const doc = readDoc(file);
    if (doc.ignored) continue;
    const fm = doc.frontmatter;
    assert(/^workflow\.[A-Za-z0-9_.-]+$/.test(fm.id ?? ""), errors, file, "workflow id must start with workflow.");
    assert(workflowStatuses.has(fm.status), errors, file, `invalid workflow status: ${fm.status}`);
    for (const key of ["title", "updated"]) {
      assert(Object.hasOwn(fm, key), errors, file, `missing workflow frontmatter: ${key}`);
    }
    const dependencyIds = [
      ...(Array.isArray(fm.workflow_dependencies) ? fm.workflow_dependencies : []),
      ...(Array.isArray(fm.optional_workflow_dependencies) ? fm.optional_workflow_dependencies : []),
    ];
    for (const dependencyId of dependencyIds) {
      assert(Object.hasOwn(workflowDependencyCatalog, dependencyId), errors, file, `unknown workflow dependency: ${dependencyId}`);
    }
    const viewIds = Array.isArray(fm.workflow_views) ? fm.workflow_views : [];
    for (const viewId of viewIds) {
      assert(Object.hasOwn(workflowViewCatalog, viewId), errors, file, `unknown workflow view: ${viewId}`);
    }
    const profileIds = Array.isArray(fm.credential_profiles) ? fm.credential_profiles : [];
    for (const profileId of profileIds) {
      assert(Object.hasOwn(credentialProfileCatalog, profileId), errors, file, `unknown credential profile: ${profileId}`);
    }
    const breakpointIds = Array.isArray(fm.validation_breakpoints) ? fm.validation_breakpoints : [];
    for (const breakpointId of breakpointIds) {
      assert(Object.hasOwn(workflowBreakpointCatalog, breakpointId), errors, file, `unknown validation breakpoint: ${breakpointId}`);
    }
  }
}

function runChecks(scope) {
  const errors = [];
  validateDirs(errors);
  validateContextEntries(errors);
  validateWorkflows(errors);
  const specs = validateSpecs(errors);
  const tickets = validateTickets(errors, specs);
  const packs = validatePacks(errors, tickets, specs);
  validateRuns(errors);
  validateFutureWork(errors, tickets, packs, specs);
  return {
    ok: errors.length === 0,
    scope,
    errors,
  };
}

function argValue(name, fallback = null) {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function commandExists(binary) {
  try {
    execFileSync("which", [binary], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function parseSembleOutput(output, limit) {
  const lines = output.split("\n");
  const matches = [];
  for (const line of lines) {
    const match = line.match(/^##\s+\d+\.\s+(.+?):(\d+)-(\d+)/);
    if (!match) continue;
    matches.push({
      file: match[1],
      line: Number.parseInt(match[2], 10),
      reason: "semble semantic match",
    });
    if (matches.length >= limit) break;
  }
  return matches;
}

function discover() {
  const backend = argValue("--backend", "semble");
  const task = argValue("--task", "");
  const repo = argValue("--repo", ".");
  const limit = Number.parseInt(argValue("--limit", "10"), 10);
  const out = argValue("--out", "");
  const result = {
    ok: true,
    backend,
    task,
    repo,
    limit,
    matches: [],
    warnings: [],
  };

  if (!task.trim()) {
    result.ok = false;
    result.warnings.push("missing --task");
    return writeDiscoveryResult(result, out);
  }

  if (backend === "none") return writeDiscoveryResult(result, out);

  if (backend === "ripgrep") {
    try {
      const output = execFileSync("rg", ["-n", "--", task, repo], { encoding: "utf8" });
      result.matches = output
        .split("\n")
        .filter(Boolean)
        .slice(0, limit)
        .map((line) => {
          const [file, lineNo] = line.split(":");
          return { file, line: Number.parseInt(lineNo, 10), reason: "ripgrep literal match" };
        });
    } catch (error) {
      if (error.status === 1) return result;
      result.ok = false;
      result.warnings.push(`ripgrep failed: ${error.message}`);
    }
    return writeDiscoveryResult(result, out);
  }

  if (backend !== "semble") {
    result.ok = false;
    result.warnings.push(`unsupported discovery backend: ${backend}`);
    return result;
  }

  try {
    if (commandExists("semble")) {
      const output = execFileSync("semble", ["search", task, repo, "--top-k", String(limit)], {
        encoding: "utf8",
      });
      result.matches = parseSembleOutput(output, limit);
    } else if (commandExists("uvx")) {
      const output = execFileSync(
        "uvx",
        ["--from", "semble[mcp]", "semble", "search", task, repo, "--top-k", String(limit)],
        { encoding: "utf8" },
      );
      result.matches = parseSembleOutput(output, limit);
      result.warnings.push("used uvx fallback for semble");
    } else {
      result.ok = false;
      result.warnings.push("semble and uvx are unavailable");
    }
  } catch (error) {
    result.ok = false;
    result.warnings.push(`semble discovery failed: ${error.message}`);
  }
  return writeDiscoveryResult(result, out);
}

function writeDiscoveryResult(result, out) {
  if (!out) return result;
  const outPath = path.isAbsolute(out) ? out : path.join(root, out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const payload = {
    ...result,
    generated_by: "tools/context/ctx.mjs discover",
    source: "bounded code-discovery metadata",
  };
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  return {
    ...result,
    out: path.relative(root, outPath),
  };
}

function printResult(result) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.ok) {
    process.stdout.write("ok\n");
  } else {
    for (const error of result.errors) {
      process.stderr.write(`${error.file}: ${error.message}\n`);
    }
  }
  process.exit(result.ok ? 0 : 1);
}

if (command === "lint") {
  printResult(runChecks("lint"));
} else if (command === "doctor") {
  printResult(doctor());
} else if (command === "init") {
  printResult(initRepo());
} else if (command === "scan") {
  printResult(scan());
} else if (command === "query") {
  printResult(query());
} else if (command === "export-agent") {
  printResult(exportAgent());
} else if (command === "components" && subcommand === "list") {
  printResult(componentsList());
} else if (command === "components" && subcommand === "get") {
  printResult(componentGet(args[2] ?? ""));
} else if (command === "impact") {
  printResult(impact());
} else if (command === "run" && subcommand === "status") {
  printResult(runStatus(args[2] ?? ""));
} else if (command === "idvisor" && subcommand === "workflow") {
  printResult(idvisorWorkflow());
} else if (command === "customize") {
  printResult(customize());
} else if (command === "discover") {
  const result = discover();
  printResult(result);
} else if (command === "dependency" && subcommand === "audit") {
  printResult(dependencyAudit());
} else if (command === "workflow" && subcommand === "deps") {
  printResult(workflowDeps());
} else if (command === "workflow" && subcommand === "views") {
  printResult(workflowViews());
} else if (command === "workflow" && subcommand === "validation-plan") {
  printResult(workflowValidationPlan());
} else if (command === "credentials" && subcommand === "check") {
  printResult(credentialsCheck());
} else if (command === "credentials" && subcommand === "import-browser-state") {
  printResult(credentialsImportBrowserState());
} else if (command === "adoption" && subcommand === "bootstrap") {
  printResult(adoptionBootstrap());
} else if (command === "adoption" && subcommand === "context") {
  printResult(adoptionContext());
} else if (command === "adoption" && subcommand === "ticket") {
  printResult(adoptionTicket());
} else if (command === "adoption" && subcommand === "implementation-plan") {
  printResult(implementationPlan());
} else if (command === "ticket" && subcommand === "check") {
  const errors = [];
  const specs = validateSpecs(errors);
  validateTickets(errors, specs);
  printResult({ ok: errors.length === 0, scope: "ticket check", errors });
} else if (command === "ticket" && subcommand === "hydrate") {
  printResult(hydrateTicket(args[2] ?? ""));
} else if (command === "pack" && subcommand === "check") {
  const errors = [];
  const specs = validateSpecs(errors);
  const tickets = validateTickets(errors, specs);
  validatePacks(errors, tickets, specs);
  printResult({ ok: errors.length === 0, scope: "pack check", errors });
} else if (command === "pack" && subcommand === "status") {
  printResult(packStatus(args[2] ?? ""));
} else if (command === "spec" && subcommand === "check") {
  const errors = [];
  validateSpecs(errors);
  printResult({ ok: errors.length === 0, scope: "spec check", errors });
} else if (command === "future" && subcommand === "check") {
  const errors = [];
  const specs = validateSpecs(errors);
  const tickets = validateTickets(errors, specs);
  const packs = validatePacks(errors, tickets, specs);
  validateFutureWork(errors, tickets, packs, specs);
  printResult({ ok: errors.length === 0, scope: "future check", errors });
} else {
  const result = {
    ok: false,
    usage: [
      "ctx lint --json",
      "ctx doctor --json",
      "ctx init --json",
      "ctx scan --json",
      "ctx query --path <path> --task <task> --agent codex --budget 6000 --json",
      "ctx export-agent --agent codex --out docs/context/generated/agent-pack.codex.md --json",
      "ctx components list --json",
      "ctx components get component.Button --json",
      "ctx impact --path components/Button.tsx --json",
      "ctx run status docs/runs/RUN.md --json",
      "ctx idvisor workflow --json",
      "ctx customize --profile strict --dry-run --json",
      "ctx discover --backend semble --task <task> --repo . --json",
      "ctx dependency audit --repo . --command 'pnpm audit --prod' --json",
      "ctx workflow deps --workflow workflow.browser-validation --repo . --json",
      "ctx workflow views --workflow workflow.browser-validation --repo . --json",
      "ctx workflow validation-plan --workflow workflow.browser-validation --repo . --json",
      "ctx credentials check --profile browser-test-user --repo . --json",
      "ctx credentials import-browser-state --profile browser-test-user --from storage-state.json --repo . --write --json",
      "ctx adoption bootstrap --repo <target-repo> --profile wetware --write --json",
      "ctx adoption context --repo <target-repo> --kind flow --title '<flow>' --path <path> --task '<task>' --write --json",
      "ctx adoption ticket --repo <target-repo> --title '<ticket>' --task '<task>' --context <context-id> --write --json",
      "ctx adoption implementation-plan --repo <target-repo> --ticket <ticket.md> --json",
      "ctx ticket check --json",
      "ctx ticket hydrate docs/tickets/draft/TICKET.md --json",
      "ctx pack check --json",
      "ctx pack status <pack-id> --json",
      "ctx spec check --json",
      "ctx future check --json",
    ],
  };
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stderr.write(`${result.usage.join("\n")}\n`);
  process.exit(1);
}
