#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
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
  "docs/specs",
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
  const result = {
    ok: true,
    backend,
    task,
    repo,
    matches: [],
    warnings: [],
  };

  if (!task.trim()) {
    result.ok = false;
    result.warnings.push("missing --task");
    return result;
  }

  if (backend === "none") return result;

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
    return result;
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
  return result;
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
      "ctx discover --backend semble --task <task> --repo . --json",
      "ctx ticket check --json",
      "ctx pack check --json",
      "ctx spec check --json",
      "ctx future check --json",
    ],
  };
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stderr.write(`${result.usage.join("\n")}\n`);
  process.exit(1);
}
