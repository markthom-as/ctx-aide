#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

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

function readDoc(file) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (text.startsWith("<!-- repo-context: ignore -->")) {
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

function doctor() {
  const errors = [];
  validateDirs(errors);
  validateContextEntries(errors);
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

function runChecks(scope) {
  const errors = [];
  validateDirs(errors);
  validateContextEntries(errors);
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
} else if (command === "discover") {
  const result = discover();
  printResult(result);
} else if (command === "ticket" && subcommand === "check") {
  const errors = [];
  const specs = validateSpecs(errors);
  validateTickets(errors, specs);
  printResult({ ok: errors.length === 0, scope: "ticket check", errors });
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
      "ctx discover --backend semble --task <task> --repo . --json",
      "ctx ticket check --json",
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
