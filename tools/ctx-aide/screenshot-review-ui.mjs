import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const REVIEW_STATUSES = ["unreviewed", "approved", "needs_ticket", "needs_followup", "wont_fix"];
const SEVERITIES = ["P0", "P1", "P2", "P3"];
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const DEFAULT_SCREENSHOT_DIR = ".ctx-aide/artifacts/screenshots";
const DEFAULT_ASTRO_RUN_ROOT = "output/playwright/prod-total-coverage";
export const SCREENSHOT_REVIEW_UI_FEATURE_ID = "screenshot_feedback_review_ui";
const FEATURE_ALIASES = new Map([
  [SCREENSHOT_REVIEW_UI_FEATURE_ID, SCREENSHOT_REVIEW_UI_FEATURE_ID],
  ["screenshot-feedback-review-ui", SCREENSHOT_REVIEW_UI_FEATURE_ID],
  ["screenshot-review-ui", SCREENSHOT_REVIEW_UI_FEATURE_ID],
  ["feedback-review-ui", SCREENSHOT_REVIEW_UI_FEATURE_ID],
]);

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  const value = index >= 0 ? args[index + 1] : null;
  return value && !value.startsWith("--") ? value : fallback;
}

function hasArg(args, name) {
  return args.includes(name);
}

function pathInside(basePath, targetPath) {
  const base = path.resolve(basePath);
  const target = path.resolve(targetPath);
  return target === base || target.startsWith(`${base}${path.sep}`);
}

function normalizePathForUrl(filePath) {
  return filePath.split(path.sep).join("/");
}

function displayPath(cwd, targetPath) {
  const resolved = path.resolve(targetPath);
  return pathInside(cwd, resolved) ? normalizePathForUrl(path.relative(cwd, resolved) || ".") : resolved;
}

function repoDisplayPath(repoPath, targetPath) {
  const resolved = path.resolve(targetPath);
  return pathInside(repoPath, resolved) ? normalizePathForUrl(path.relative(repoPath, resolved) || ".") : resolved;
}

function resolveRepoPath(repoPath, filePath) {
  return path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(repoPath, filePath);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

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

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function ctxAideSettingsPath(repoPath) {
  return path.join(repoPath, "docs/config/ctx-aide.settings.json");
}

export function defaultCtxAideSettings(overrides = {}) {
  const screenshotFeature = overrides.screenshotFeedbackReviewUi ?? {};
  return {
    config_version: 1,
    generated_by: "ctx-aide settings",
    features: {
      [SCREENSHOT_REVIEW_UI_FEATURE_ID]: {
        enabled: Boolean(screenshotFeature.enabled),
        stability: "beta",
        setup: "optional",
        label: "Screenshot feedback review UI",
        description: "Local UI for reviewing screenshot feedback and drafting canonical non-ready tickets.",
        screenshot_dir: screenshotFeature.screenshot_dir ?? DEFAULT_SCREENSHOT_DIR,
        ticket_dir: screenshotFeature.ticket_dir ?? "docs/tickets/needs-questions",
        feedback_dir: screenshotFeature.feedback_dir ?? null,
      },
    },
    updated: screenshotFeature.updated ?? null,
  };
}

function mergeFeatureSettings(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  return { ...base, ...override };
}

function mergeCtxAideSettings(parsed) {
  const defaults = defaultCtxAideSettings();
  const features = parsed?.features && typeof parsed.features === "object" ? parsed.features : {};
  return {
    ...defaults,
    ...(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}),
    config_version: 1,
    features: {
      ...defaults.features,
      ...features,
      [SCREENSHOT_REVIEW_UI_FEATURE_ID]: mergeFeatureSettings(
        defaults.features[SCREENSHOT_REVIEW_UI_FEATURE_ID],
        features[SCREENSHOT_REVIEW_UI_FEATURE_ID],
      ),
    },
  };
}

export function normalizeFeatureId(featureId) {
  return FEATURE_ALIASES.get(String(featureId ?? "").trim()) ?? null;
}

export function readCtxAideSettings(repoPath) {
  const settingsPath = ctxAideSettingsPath(repoPath);
  if (!fs.existsSync(settingsPath)) {
    return {
      ok: true,
      exists: false,
      path: settingsPath,
      settings: defaultCtxAideSettings(),
      errors: [],
    };
  }
  try {
    return {
      ok: true,
      exists: true,
      path: settingsPath,
      settings: mergeCtxAideSettings(readJsonFile(settingsPath)),
      errors: [],
    };
  } catch (error) {
    return {
      ok: false,
      exists: true,
      path: settingsPath,
      settings: defaultCtxAideSettings(),
      errors: [{ file: settingsPath, message: `invalid settings JSON: ${error.message}` }],
    };
  }
}

export function screenshotReviewUiFeature(settings) {
  return mergeCtxAideSettings(settings).features[SCREENSHOT_REVIEW_UI_FEATURE_ID];
}

function asString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value) {
  return typeof value === "boolean" ? value : false;
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string" && entry.length > 0)
    : [];
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry, 40))
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

function normalizeReviewStatus(value) {
  return REVIEW_STATUSES.includes(value) ? value : "unreviewed";
}

function normalizeSeverity(value) {
  return SEVERITIES.includes(value) ? value : "P2";
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "screenshot-feedback";
}

function yamlScalar(value) {
  return JSON.stringify(String(value ?? "").replace(/\s+/g, " ").trim());
}

function yamlKeyList(key, values, indent = "") {
  const clean = unique(values);
  if (clean.length === 0) return `${indent}${key}: []`;
  return `${indent}${key}:\n${clean.map((value) => `${indent}  - ${value}`).join("\n")}`;
}

function markdownValue(value) {
  return String(value ?? "").trim() || "Not supplied.";
}

function imageDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
      format: "png",
    };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
          format: "jpeg",
        };
      }
      offset += 2 + length;
    }
  }
  return null;
}

function normalizeViewport(value, dimensions = null, fallbackName = "unknown") {
  if (value && typeof value === "object") {
    return {
      name: typeof value.name === "string" ? value.name : fallbackName,
      width: typeof value.width === "number" ? value.width : dimensions?.width ?? 0,
      height: typeof value.height === "number" ? value.height : dimensions?.height ?? 0,
    };
  }
  return {
    name: fallbackName,
    width: dimensions?.width ?? 0,
    height: dimensions?.height ?? 0,
  };
}

function pathFromUrl(urlValue) {
  try {
    const parsed = new URL(urlValue);
    return `${parsed.pathname || "/"}${parsed.search}`;
  } catch {
    return "";
  }
}

function componentForUrl(urlValue) {
  const route = pathFromUrl(urlValue);
  if (!route || route === "/") return "Home";
  const first = route.split("/").filter(Boolean)[0] ?? "Page";
  return first
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function consoleErrorCount(value) {
  if (!Array.isArray(value)) return 0;
  return value.filter((entry) => {
    if (typeof entry === "string") return /error|warning/i.test(entry);
    if (!entry || typeof entry !== "object") return false;
    const type = typeof entry.type === "string" ? entry.type : "";
    const text = typeof entry.text === "string" ? entry.text : "";
    return /error|warning/i.test(`${type} ${text}`);
  }).length;
}

function stableItemKey(baseDir, screenshotPath, index) {
  const absoluteScreenshotPath = path.resolve(screenshotPath);
  const relativeToBase = normalizePathForUrl(path.relative(baseDir, absoluteScreenshotPath));
  if (relativeToBase && !relativeToBase.startsWith("..")) return relativeToBase;
  return `screenshot/${String(index + 1).padStart(5, "0")}`;
}

function screenshotItemFromSummary(repoPath, runDir, result, index) {
  const screenshotPath = asString(result.screenshot);
  if (!screenshotPath) return null;
  const absoluteScreenshotPath = resolveRepoPath(repoPath, screenshotPath);
  if (!fs.existsSync(absoluteScreenshotPath)) return null;
  const diagnostics = result.diagnostics && typeof result.diagnostics === "object" ? result.diagnostics : {};
  const dimensions = imageDimensions(absoluteScreenshotPath);
  const viewport = normalizeViewport(result.viewport, dimensions, "screenshot");
  const h1s = stringArray(diagnostics.h1s);
  const url = asString(result.url) ?? "";
  const finalUrl = asString(result.finalUrl) ?? url;
  const stats = fs.statSync(absoluteScreenshotPath);
  const title =
    asString(diagnostics.title) ??
    h1s[0] ??
    pathFromUrl(finalUrl || url) ??
    path.basename(absoluteScreenshotPath);

  return {
    key: stableItemKey(runDir, absoluteScreenshotPath, index),
    kind: asString(result.kind) ?? "page",
    id: asString(result.id),
    url,
    finalUrl,
    viewport,
    component: componentForUrl(finalUrl || url),
    title,
    h1s,
    httpStatus: asNumber(result.status),
    ok: asBoolean(result.ok),
    screenshotPath: repoDisplayPath(repoPath, absoluteScreenshotPath),
    metadataPath: asString(result.metadata)
      ? repoDisplayPath(repoPath, resolveRepoPath(repoPath, asString(result.metadata)))
      : null,
    screenshotBytes: asNumber(result.screenshotBytes) ?? stats.size,
    elapsedMs: asNumber(result.elapsedMs),
    textLength: asNumber(diagnostics.textLength),
    consoleErrorCount: consoleErrorCount(result.console),
    failedRequestCount: Array.isArray(result.failedRequests) ? result.failedRequests.length : 0,
    redirected: Boolean(finalUrl && url && finalUrl !== url),
    error: asString(result.error),
    screenshotUrl: `/asset?path=${encodeURIComponent(repoDisplayPath(repoPath, absoluteScreenshotPath))}`,
  };
}

function screenshotItemFromFile(repoPath, screenshotDir, filePath, index) {
  const dimensions = imageDimensions(filePath);
  const relativeToDir = normalizePathForUrl(path.relative(screenshotDir, filePath));
  const baseName = path.basename(filePath, path.extname(filePath));
  const parentName = path.basename(path.dirname(filePath));
  const stats = fs.statSync(filePath);
  return {
    key: stableItemKey(screenshotDir, filePath, index),
    kind: "screenshot",
    id: null,
    url: "",
    finalUrl: "",
    viewport: normalizeViewport(null, dimensions, baseName || "screenshot"),
    component: parentName && parentName !== "." ? parentName : "Screenshot",
    title: relativeToDir,
    h1s: [],
    httpStatus: null,
    ok: true,
    screenshotPath: repoDisplayPath(repoPath, filePath),
    metadataPath: null,
    screenshotBytes: stats.size,
    elapsedMs: null,
    textLength: null,
    consoleErrorCount: 0,
    failedRequestCount: 0,
    redirected: false,
    error: null,
    screenshotUrl: `/asset?path=${encodeURIComponent(repoDisplayPath(repoPath, filePath))}`,
  };
}

function latestAstrotechneRunDir(repoPath) {
  const root = path.join(repoPath, DEFAULT_ASTRO_RUN_ROOT);
  if (!fs.existsSync(root)) return null;
  const candidates = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(root, entry.name);
      const summaryPath = path.join(dir, "summary.json");
      if (!fs.existsSync(summaryPath)) return null;
      return { dir, mtimeMs: fs.statSync(summaryPath).mtimeMs };
    })
    .filter(Boolean)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.dir ?? null;
}

function resolveSource(repoPath, options) {
  if (options.summaryPath) {
    const summaryPath = resolveRepoPath(repoPath, options.summaryPath);
    return {
      mode: "summary",
      sourceDir: path.dirname(summaryPath),
      summaryPath,
    };
  }
  if (options.runDir) {
    const sourceDir = resolveRepoPath(repoPath, options.runDir);
    const summaryPath = path.join(sourceDir, "summary.json");
    return {
      mode: fs.existsSync(summaryPath) ? "summary" : "screenshots",
      sourceDir,
      summaryPath: fs.existsSync(summaryPath) ? summaryPath : null,
    };
  }
  if (options.screenshotDir) {
    return {
      mode: "screenshots",
      sourceDir: resolveRepoPath(repoPath, options.screenshotDir),
      summaryPath: null,
    };
  }
  const defaultScreenshotDir = path.join(repoPath, DEFAULT_SCREENSHOT_DIR);
  if (fs.existsSync(defaultScreenshotDir)) {
    return {
      mode: "screenshots",
      sourceDir: defaultScreenshotDir,
      summaryPath: null,
    };
  }
  const latestRun = latestAstrotechneRunDir(repoPath);
  if (latestRun) {
    return {
      mode: "summary",
      sourceDir: latestRun,
      summaryPath: path.join(latestRun, "summary.json"),
    };
  }
  throw new Error(
    `No screenshots found. Pass --run-dir, --summary, or --screenshot-dir; default ${DEFAULT_SCREENSHOT_DIR} does not exist.`,
  );
}

export function buildScreenshotReviewState(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const repoPath = path.resolve(options.repoPath ?? cwd);
  if (!fs.existsSync(repoPath)) throw new Error(`repo path does not exist: ${repoPath}`);
  const source = resolveSource(repoPath, options);
  if (!fs.existsSync(source.sourceDir)) throw new Error(`screenshot source does not exist: ${source.sourceDir}`);

  let summary = {
    startedAt: null,
    finishedAt: null,
    baseUrl: null,
    outputDir: repoDisplayPath(repoPath, source.sourceDir),
    resultCount: 0,
  };
  let items = [];
  if (source.summaryPath) {
    if (!fs.existsSync(source.summaryPath)) throw new Error(`summary does not exist: ${source.summaryPath}`);
    const parsed = readJsonFile(source.summaryPath);
    const rawResults = Array.isArray(parsed.results) ? parsed.results : [];
    items = rawResults
      .map((result, index) => screenshotItemFromSummary(repoPath, source.sourceDir, result, index))
      .filter(Boolean);
    summary = {
      startedAt: asString(parsed.startedAt),
      finishedAt: asString(parsed.finishedAt),
      baseUrl: asString(parsed.baseUrl),
      outputDir: asString(parsed.outputDir) ?? repoDisplayPath(repoPath, source.sourceDir),
      resultCount: rawResults.length,
    };
  } else {
    const imageFiles = walk(source.sourceDir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort();
    items = imageFiles.map((file, index) => screenshotItemFromFile(repoPath, source.sourceDir, file, index));
    summary.resultCount = items.length;
  }

  const feedbackDir = resolveRepoPath(
    repoPath,
    options.feedbackDir ?? path.join(repoDisplayPath(repoPath, source.sourceDir), "feedback"),
  );
  const ticketDraftRoot = resolveRepoPath(repoPath, options.ticketDir ?? "docs/tickets/needs-questions");
  const itemByKey = new Map(items.map((item) => [item.key, item]));
  const allowedScreenshotPaths = new Set(items.map((item) => resolveRepoPath(repoPath, item.screenshotPath)));

  return {
    cwd,
    repoPath,
    sourceDir: source.sourceDir,
    sourceMode: source.mode,
    feedbackDir,
    feedbackPath: path.join(feedbackDir, "screenshot-feedback.json"),
    ticketDraftRoot,
    ticketPackId: options.ticketPackId ?? "pack.screenshot-feedback",
    milestoneId: options.milestoneId ?? "milestone.screenshot-feedback-review",
    summaryPath: source.summaryPath,
    summary,
    items,
    itemByKey,
    allowedScreenshotPaths,
  };
}

function defaultFeedbackFile(state) {
  return {
    version: "ctx-aide.screenshot-feedback.v1",
    sourceDir: repoDisplayPath(state.repoPath, state.sourceDir),
    updatedAt: new Date().toISOString(),
    entries: {},
  };
}

export function readFeedback(state) {
  if (!fs.existsSync(state.feedbackPath)) return defaultFeedbackFile(state);
  const parsed = readJsonFile(state.feedbackPath);
  return {
    version: "ctx-aide.screenshot-feedback.v1",
    sourceDir: typeof parsed.sourceDir === "string" ? parsed.sourceDir : repoDisplayPath(state.repoPath, state.sourceDir),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
  };
}

function writeFeedback(state, feedback) {
  fs.mkdirSync(state.feedbackDir, { recursive: true });
  const tempPath = `${state.feedbackPath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(feedback, null, 2)}\n`);
  fs.renameSync(tempPath, state.feedbackPath);
}

function shouldKeepEntry(entry, item) {
  return (
    entry.reviewStatus !== "unreviewed" ||
    entry.ticketTitle.length > 0 ||
    entry.notes.length > 0 ||
    entry.tags.length > 0 ||
    entry.component !== item.component
  );
}

function normalizeFeedbackEntry(item, input) {
  const record = input && typeof input === "object" ? input : {};
  return {
    key: item.key,
    screenshot: item.screenshotPath,
    url: item.url,
    finalUrl: item.finalUrl,
    viewport: item.viewport.name,
    component: cleanString(record.component, 120) || item.component,
    reviewStatus: normalizeReviewStatus(record.reviewStatus),
    severity: normalizeSeverity(record.severity),
    ticketTitle: cleanString(record.ticketTitle, 160),
    notes: cleanString(record.notes, 10000),
    tags: cleanTags(record.tags),
    updatedAt: new Date().toISOString(),
  };
}

function feedbackForClient(feedback, state) {
  const entries = {};
  for (const [key, entry] of Object.entries(feedback.entries)) {
    if (state.itemByKey.has(key)) entries[key] = entry;
  }
  return entries;
}

export function savePostedFeedback(state, payload) {
  const record = payload && typeof payload === "object" ? payload : {};
  const postedEntries =
    record.entries && typeof record.entries === "object" ? record.entries : {};
  const feedback = readFeedback(state);
  for (const [key, value] of Object.entries(postedEntries)) {
    const item = state.itemByKey.get(key);
    if (!item) continue;
    const entry = normalizeFeedbackEntry(item, value);
    if (shouldKeepEntry(entry, item)) feedback.entries[key] = entry;
    else delete feedback.entries[key];
  }
  feedback.sourceDir = repoDisplayPath(state.repoPath, state.sourceDir);
  feedback.updatedAt = new Date().toISOString();
  writeFeedback(state, feedback);
  return feedback;
}

function shouldGenerateDraft(item, entry) {
  if (entry.reviewStatus === "approved" || entry.reviewStatus === "wont_fix") return false;
  if (entry.reviewStatus === "needs_ticket" || entry.reviewStatus === "needs_followup") return true;
  return (
    entry.notes.length > 0 ||
    entry.ticketTitle.length > 0 ||
    entry.tags.length > 0 ||
    entry.component !== item.component
  );
}

function splitFeedbackNotes(notes) {
  const trimmed = notes.trim();
  if (!trimmed) return [{ notes: "", reason: "Sparse feedback entry" }];
  const explicitParts = trimmed
    .split(/\n\s*---\s*ticket\s*---\s*\n/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (explicitParts.length > 1) {
    return explicitParts.map((part) => ({ notes: part, reason: "Explicit ticket separator" }));
  }
  const lines = trimmed.split(/\r?\n/);
  const parts = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+?)\s*$/);
    if (match) {
      current = [match[1]];
      parts.push(current);
      continue;
    }
    if (current && line.trim()) current.push(line.trim());
  }
  if (parts.length > 1) {
    return parts.map((part) => ({
      notes: part.join("\n"),
      reason: "Structured list feedback",
    }));
  }
  return [{ notes: trimmed, reason: "Single feedback item" }];
}

function feedbackTitleCandidate(notes) {
  const firstLine =
    notes
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? "";
  const sentence = firstLine
    .split(/[.!?]/)[0]
    .replace(/[#*_`[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (sentence.length < 8) return null;
  return sentence.slice(0, 100);
}

function urlPathLabel(urlValue) {
  const route = pathFromUrl(urlValue);
  return route || "screenshot";
}

function draftTitle(item, entry) {
  return (
    entry.ticketTitle ||
    feedbackTitleCandidate(entry.notes) ||
    `${entry.component || item.component}: ${urlPathLabel(entry.url || item.url)} screenshot feedback`
  );
}

function buildCandidate(item, entry, part, splitIndex, splitCount) {
  const candidateEntry = {
    ...entry,
    ticketTitle:
      splitCount > 1
        ? feedbackTitleCandidate(part.notes) ||
          `${entry.ticketTitle || draftTitle(item, entry)} ${splitIndex}`
        : entry.ticketTitle,
    notes: part.notes,
  };
  return {
    id: `${entry.key}::${splitIndex}`,
    key: entry.key,
    title: draftTitle(item, candidateEntry),
    severity: normalizeSeverity(entry.severity),
    component: entry.component || item.component,
    reviewStatus: normalizeReviewStatus(entry.reviewStatus),
    notes: part.notes,
    tags: entry.tags,
    splitIndex,
    splitCount,
    splitReason: part.reason,
    url: entry.url || item.url,
    finalUrl: entry.finalUrl || item.finalUrl,
    viewport: entry.viewport || item.viewport.name,
    screenshot: entry.screenshot || item.screenshotPath,
    sourceTitle: item.title,
  };
}

export function buildTicketDraftPlan(state) {
  const feedback = readFeedback(state);
  const candidates = [];
  for (const entry of Object.values(feedback.entries)) {
    const item = state.itemByKey.get(entry.key);
    if (!item || !shouldGenerateDraft(item, entry)) continue;
    const parts = splitFeedbackNotes(entry.notes);
    parts.forEach((part, index) => {
      candidates.push(buildCandidate(item, entry, part, index + 1, parts.length));
    });
  }
  return {
    ok: true,
    scope: "feedback review-ui draft-plan",
    count: candidates.length,
    splitCount: candidates.filter((candidate) => candidate.splitCount > 1).length,
    ticket_directory: repoDisplayPath(state.repoPath, state.ticketDraftRoot),
    write_requires_confirmation: true,
    candidates,
  };
}

function cleanCandidate(state, input) {
  const record = input && typeof input === "object" ? input : {};
  const key = cleanString(record.key, 500);
  const item = state.itemByKey.get(key);
  if (!item) return null;
  const splitIndex = Math.max(1, Math.floor(asNumber(record.splitIndex) ?? 1));
  const splitCount = Math.max(splitIndex, Math.floor(asNumber(record.splitCount) ?? splitIndex));
  return {
    id: cleanString(record.id, 560) || `${key}::${splitIndex}`,
    key,
    title:
      cleanString(record.title, 160) ||
      `${item.component}: ${urlPathLabel(item.url)} screenshot feedback`,
    severity: normalizeSeverity(record.severity),
    component: cleanString(record.component, 120) || item.component,
    reviewStatus: normalizeReviewStatus(record.reviewStatus),
    notes: cleanString(record.notes, 10000),
    tags: cleanTags(record.tags),
    splitIndex,
    splitCount,
    splitReason: cleanString(record.splitReason, 120) || "Draft generation",
    url: cleanString(record.url, 500) || item.url,
    finalUrl: cleanString(record.finalUrl, 500) || item.finalUrl,
    viewport: cleanString(record.viewport, 80) || item.viewport.name,
    screenshot: item.screenshotPath,
    sourceTitle: item.title,
  };
}

function ticketMarkdown(state, item, candidate, generatedAt, ordinal) {
  const title = candidate.title || `${candidate.component}: screenshot feedback`;
  const route = pathFromUrl(candidate.url);
  const ticketId = `ticket.screenshot-feedback.${todayDate()}.${String(ordinal).padStart(3, "0")}.${slugify(title)}`;
  const contextTask = title.replace(/"/g, "'");
  const sourceLines = [
    `- Generated: ${generatedAt}`,
    `- Screenshot key: \`${candidate.key}\``,
    `- Screenshot: \`${candidate.screenshot}\``,
    `- URL: ${candidate.url || "Not supplied."}`,
    `- Final URL: ${candidate.finalUrl || "Not supplied."}`,
    `- Viewport: ${candidate.viewport} (${item.viewport.width}x${item.viewport.height})`,
    `- Component: ${candidate.component}`,
    `- Review status: ${candidate.reviewStatus}`,
    `- Severity: ${candidate.severity}`,
    `- Draft split: ${candidate.splitIndex} of ${candidate.splitCount} (${candidate.splitReason})`,
    `- Source title: ${candidate.sourceTitle}`,
    `- Tags: ${candidate.tags.length > 0 ? candidate.tags.join(", ") : "None"}`,
  ];
  return `---
id: ${ticketId}
status: needs-questions
title: ${yamlScalar(title)}
ticket_pack: ${state.ticketPackId}
milestones:
  - ${state.milestoneId}
source_spec: null
source_feedback: []
implementation_agent: codex
planning_agents:
  - codex-high-effort
ui_review_agent: claude-high-effort
parallel_group: screenshot-feedback
depends_on: []
blocks: []
scope:
${yamlKeyList("routes", route ? [route] : [], "  ")}
  files: []
  directories: []
${yamlKeyList("components", [candidate.component], "  ")}
  flows: []
context_query:
  task: "${contextTask}"
  generated_at: ${todayDate()}
  context_ids: []
axioms:
  - axiom.markdown-source-of-truth
  - axiom.ticket-done-requires-commit
  - axiom.feedback-review-promotes-actionable-work
validation:
  automated: []
  smoke:
    - Reopen the reviewed URL or screenshot state and verify the feedback has been addressed.
${yamlKeyList("screenshots", [candidate.screenshot], "  ")}
completion:
  commit: pending
  completed_at: null
---

# ${title}

## Outcome

Resolve the screenshot feedback for the reviewed state without changing unrelated behavior.

## Context

Generated from screenshot review UI feedback.

${sourceLines.join("\n")}

## Feedback

${markdownValue(candidate.notes)}

## Positive Rules

- Preserve the reviewed screenshot, URL, viewport, component, and feedback text in implementation context.
- Keep the fix scoped to the smallest change that resolves this feedback.
- Capture fresh screenshot or browser evidence before closing the ticket.

## Negative Rules

- Do not broaden this ticket into unrelated visual redesign work.
- Do not mark this ticket ready until product, design, architecture, and security questions are answered.
- Do not complete this ticket without validation evidence and commit metadata.

## Axioms

- \`axiom.markdown-source-of-truth\`: Markdown remains the canonical authoring surface.
- \`axiom.ticket-done-requires-commit\`: Completion requires commit and verification evidence.
- \`axiom.feedback-review-promotes-actionable-work\`: Operator feedback becomes either acceptance criteria or follow-up tickets.

## Frozen Decisions

- Source screenshot: \`${candidate.screenshot}\`.
- Source review status: \`${candidate.reviewStatus}\`.
- Generated status: \`needs-questions\`.
- Cost delta: \`$0/month\` unless implementation later changes paid infrastructure.

## Implementation Rules

- Required approach: harden this ticket before implementation, then make the smallest scoped product change.
- Existing components/helpers to use: determine during ticket hardening from repo-local context.
- Anti-patterns to avoid: unrelated route changes, broad restyling, and unvalidated visual fixes.
- Stop and escalate if: the expected behavior is unclear from the screenshot and feedback.

## Scope

- In: ${[route, candidate.component].filter(Boolean).join(", ") || "the reviewed screenshot state"}.
- Out: unrelated routes, components, and infrastructure changes.

## Acceptance Criteria

- The screenshot feedback is resolved for the listed viewport and component.
- Related responsive states are checked when the change affects layout.
- A fresh screenshot or focused browser proof captures the corrected state.

## Validation

- Automated: add repo-appropriate checks during ticket hardening.
- Smoke: reopen the reviewed URL or state.
- Screenshots: capture before/after evidence for the affected viewport.

## Completion

- Status: needs-questions
- Commit: pending
- Verification evidence: pending
- Follow-up tickets: pending
`;
}

function uniqueTicketPath(state, baseFileName) {
  let candidate = path.join(state.ticketDraftRoot, baseFileName);
  let index = 2;
  while (fs.existsSync(candidate)) {
    const ext = path.extname(baseFileName);
    const stem = baseFileName.slice(0, -ext.length);
    candidate = path.join(state.ticketDraftRoot, `${stem}-${index}${ext}`);
    index += 1;
  }
  return candidate;
}

export function generateTicketDrafts(state, payload = {}) {
  const record = payload && typeof payload === "object" ? payload : {};
  const candidates = Array.isArray(record.candidates)
    ? record.candidates
        .map((candidate) => cleanCandidate(state, candidate))
        .filter(Boolean)
    : buildTicketDraftPlan(state).candidates;
  const generatedAt = new Date().toISOString();
  if (candidates.length === 0) {
    return {
      ok: true,
      scope: "feedback review-ui ticket-drafts",
      ticket_directory: repoDisplayPath(state.repoPath, state.ticketDraftRoot),
      files: [],
      count: 0,
      splitCount: 0,
    };
  }
  fs.mkdirSync(state.ticketDraftRoot, { recursive: true });
  const files = [];
  let ordinal = 1;
  const runStamp = timestampSlug();
  for (const candidate of candidates) {
    const item = state.itemByKey.get(candidate.key);
    if (!item) continue;
    const fileName = `${runStamp}-${String(ordinal).padStart(3, "0")}-${slugify(candidate.title)}.md`;
    const fullPath = uniqueTicketPath(state, fileName);
    fs.writeFileSync(fullPath, ticketMarkdown(state, item, candidate, generatedAt, ordinal));
    files.push(repoDisplayPath(state.repoPath, fullPath));
    ordinal += 1;
  }
  return {
    ok: true,
    scope: "feedback review-ui ticket-drafts",
    ticket_directory: repoDisplayPath(state.repoPath, state.ticketDraftRoot),
    files,
    count: files.length,
    splitCount: candidates.filter((candidate) => candidate.splitCount > 1).length,
  };
}

function readRequestJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    request.on("data", (chunk) => {
      totalBytes += chunk.byteLength;
      if (totalBytes > 25_000_000) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      resolve(body ? JSON.parse(body) : {});
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

function sendText(response, status, body, type) {
  response.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
  });
  response.end(body);
}

function serveAsset(state, url, response) {
  const requestedPath = url.searchParams.get("path");
  if (!requestedPath) {
    sendText(response, 400, "Missing asset path.", "text/plain; charset=utf-8");
    return;
  }
  const absolutePath = resolveRepoPath(state.repoPath, requestedPath);
  if (!state.allowedScreenshotPaths.has(absolutePath)) {
    sendText(response, 403, "Forbidden asset.", "text/plain; charset=utf-8");
    return;
  }
  const body = fs.readFileSync(absolutePath);
  response.writeHead(200, {
    "content-type": contentType(absolutePath),
    "cache-control": "private, max-age=3600",
  });
  response.end(body);
}

async function handleRequest(state, request, response) {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (request.method === "GET" && url.pathname === "/") {
    sendText(response, 200, INDEX_HTML, "text/html; charset=utf-8");
    return;
  }
  if (request.method === "GET" && url.pathname === "/app.js") {
    sendText(response, 200, APP_JS, "text/javascript; charset=utf-8");
    return;
  }
  if (request.method === "GET" && url.pathname === "/styles.css") {
    sendText(response, 200, STYLES_CSS, "text/css; charset=utf-8");
    return;
  }
  if (request.method === "GET" && url.pathname === "/asset") {
    serveAsset(state, url, response);
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/screenshots") {
    const feedback = readFeedback(state);
    sendJson(response, 200, {
      repo: repoDisplayPath(state.cwd, state.repoPath),
      sourceDir: repoDisplayPath(state.repoPath, state.sourceDir),
      sourceMode: state.sourceMode,
      summaryPath: state.summaryPath ? repoDisplayPath(state.repoPath, state.summaryPath) : null,
      feedbackPath: repoDisplayPath(state.repoPath, state.feedbackPath),
      ticketDirectory: repoDisplayPath(state.repoPath, state.ticketDraftRoot),
      summary: state.summary,
      screenshots: state.items,
      feedback: feedbackForClient(feedback, state),
    });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/feedback") {
    const payload = await readRequestJson(request);
    const feedback = savePostedFeedback(state, payload);
    sendJson(response, 200, {
      ok: true,
      feedbackPath: repoDisplayPath(state.repoPath, state.feedbackPath),
      entryCount: Object.keys(feedback.entries).length,
      updatedAt: feedback.updatedAt,
      feedback: feedbackForClient(feedback, state),
    });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/ticket-draft-plan") {
    sendJson(response, 200, buildTicketDraftPlan(state));
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/ticket-drafts") {
    const payload = await readRequestJson(request);
    sendJson(response, 200, generateTicketDrafts(state, payload));
    return;
  }
  sendText(response, 404, "Not found.", "text/plain; charset=utf-8");
}

function parsePort(args) {
  const value = argValue(args, "--port", "0");
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid --port value: ${value}`);
  }
  return port;
}

export function startScreenshotReviewServer(state, options = {}) {
  const server = http.createServer((request, response) => {
    void handleRequest(state, request, response).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (!response.headersSent) sendJson(response, 500, { ok: false, error: message });
      else response.end();
    });
  });
  server.listen(options.port ?? 0, "127.0.0.1", () => {
    const address = server.address();
    options.onReady?.({
      ok: true,
      scope: "feedback review-ui",
      url: `http://127.0.0.1:${address.port}`,
      repo: repoDisplayPath(state.cwd, state.repoPath),
      sourceDir: repoDisplayPath(state.repoPath, state.sourceDir),
      screenshots: state.items.length,
      feedbackPath: repoDisplayPath(state.repoPath, state.feedbackPath),
      ticketDirectory: repoDisplayPath(state.repoPath, state.ticketDraftRoot),
      cost_delta: "$0/month",
    });
  });
  return server;
}

function stateFromArgs(args, cwd) {
  const repoArg = argValue(args, "--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(cwd, repoArg);
  const settingsResult = readCtxAideSettings(repoPath);
  const feature = screenshotReviewUiFeature(settingsResult.settings);
  return buildScreenshotReviewState({
    cwd,
    repoPath,
    runDir: argValue(args, "--run-dir", null),
    summaryPath: argValue(args, "--summary", null),
    screenshotDir: argValue(args, "--screenshot-dir", null) ?? feature.screenshot_dir,
    feedbackDir: argValue(args, "--feedback-dir", null) ?? feature.feedback_dir,
    ticketDir: argValue(args, "--ticket-dir", null) ?? feature.ticket_dir,
    ticketPackId: argValue(args, "--ticket-pack", null) ?? undefined,
    milestoneId: argValue(args, "--milestone", null) ?? undefined,
  });
}

export function screenshotReviewUiCommand(args, options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const repoArg = argValue(args, "--repo", ".");
  const repoPath = path.isAbsolute(repoArg) ? repoArg : path.join(cwd, repoArg);
  if (hasArg(args, "--help")) {
    return {
      ok: true,
      scope: "feedback review-ui",
      usage: [
        "ctx-aide settings set --repo . --feature screenshot-feedback-review-ui --enabled true --write --json",
        "ctx-aide feedback review-ui --repo . [--screenshot-dir .ctx-aide/artifacts/screenshots] [--port 0]",
        "ctx-aide feedback review-ui --repo . --run-dir output/playwright/prod-total-coverage/<run> --port 0",
        "ctx-aide feedback review-ui --repo . --summary output/run/summary.json --port 0",
        "ctx-aide feedback review-ui --repo . --plan-only --json",
        "ctx-aide feedback review-ui --repo . --write-drafts --json",
      ],
      notes: [
        "Beta feature: disabled by default in docs/config/ctx-aide.settings.json.",
        "Starts a local-only UI on 127.0.0.1.",
        "Ticket markdown is written only after draft confirmation in the UI.",
        "Generated tickets default to docs/tickets/needs-questions.",
        "Cost delta: $0/month.",
      ],
    };
  }
  const settingsResult = readCtxAideSettings(repoPath);
  const feature = screenshotReviewUiFeature(settingsResult.settings);
  const allowBetaOverride = hasArg(args, "--allow-beta") || hasArg(args, "--beta");
  if (!settingsResult.ok) {
    return {
      ok: false,
      scope: "feedback review-ui",
      repo: repoDisplayPath(cwd, repoPath),
      feature: {
        id: SCREENSHOT_REVIEW_UI_FEATURE_ID,
        enabled: false,
        stability: "beta",
      },
      errors: settingsResult.errors.map((error) => ({
        ...error,
        file: repoDisplayPath(repoPath, error.file),
      })),
    };
  }
  if (!feature.enabled && !allowBetaOverride) {
    return {
      ok: false,
      scope: "feedback review-ui",
      repo: repoDisplayPath(cwd, repoPath),
      feature: {
        id: SCREENSHOT_REVIEW_UI_FEATURE_ID,
        enabled: false,
        stability: feature.stability,
        setup: feature.setup,
        settings_path: repoDisplayPath(repoPath, settingsResult.path),
      },
      blockers: [
        "screenshot feedback review UI is an optional beta feature and is disabled in ctx-aide settings",
      ],
      next_commands: [
        "ctx-aide adoption bootstrap --repo . --enable-screenshot-feedback-ui --write --json",
        "ctx-aide settings set --repo . --feature screenshot-feedback-review-ui --enabled true --write --json",
        "ctx-aide feedback review-ui --repo . --allow-beta --json",
      ],
      errors: [
        {
          file: repoDisplayPath(repoPath, settingsResult.path),
          message: "enable features.screenshot_feedback_review_ui.enabled before starting the beta UI",
        },
      ],
    };
  }
  const state = stateFromArgs(args, cwd);
  if (hasArg(args, "--plan-only")) return buildTicketDraftPlan(state);
  if (hasArg(args, "--write-drafts")) return generateTicketDrafts(state);
  startScreenshotReviewServer(state, {
    port: parsePort(args),
    onReady: (payload) => {
      if (options.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      else {
        process.stdout.write(`Screenshot feedback review UI: ${payload.url}\n`);
        process.stdout.write(`Repo: ${payload.repo}\n`);
        process.stdout.write(`Screenshots: ${payload.screenshots}\n`);
        process.stdout.write(`Feedback: ${payload.feedbackPath}\n`);
        process.stdout.write(`Ticket directory: ${payload.ticketDirectory}\n`);
        process.stdout.write(`Cost delta: ${payload.cost_delta}\n`);
        if (allowBetaOverride && !feature.enabled) {
          process.stdout.write("Beta override: enabled for this run only; repo settings remain disabled.\n");
        }
      }
    },
  });
  return null;
}

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Screenshot Feedback Review</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <header class="app-header">
      <div>
        <p class="eyebrow">Local screenshot feedback</p>
        <h1>Screenshot Review</h1>
        <p id="run-meta" class="muted">Loading screenshots...</p>
      </div>
      <div class="header-actions">
        <button id="save-feedback" class="primary" type="button">Save now</button>
        <button id="generate-drafts" type="button">Generate tickets</button>
      </div>
    </header>
    <main class="review-shell">
      <section class="viewer-panel" aria-label="Selected screenshot">
        <div class="viewer-toolbar">
          <div class="viewer-title-group">
            <p id="viewer-kicker" class="eyebrow">Screenshot</p>
            <h2 id="viewer-title">Loading screenshots...</h2>
            <p id="viewer-meta" class="muted">Loading run data...</p>
          </div>
          <div class="viewer-controls" aria-label="Screenshot controls">
            <button id="prev-shot" type="button">Previous</button>
            <button id="next-shot" type="button">Next</button>
            <button id="zoom-out" type="button">-</button>
            <span id="zoom-label" class="zoom-label">100%</span>
            <button id="zoom-in" type="button">+</button>
            <button id="zoom-fit" type="button">Fit</button>
            <button id="open-image" type="button">Open</button>
          </div>
        </div>
        <div id="screenshot-stage" class="screenshot-stage">
          <div id="empty-viewer" class="empty-viewer">Loading screenshots...</div>
          <img id="screenshot-image" alt="">
        </div>
      </section>
      <aside class="feedback-panel" aria-label="Screenshot feedback">
        <div class="panel-heading">
          <p class="eyebrow">Feedback</p>
          <h2>Selected Screenshot</h2>
        </div>
        <div id="selected-feedback" class="selected-feedback">
          <p class="muted">Select a screenshot to review it.</p>
        </div>
        <div class="stats" id="stats"></div>
        <div class="save-state" id="save-state">Autosave ready.</div>
      </aside>
      <section class="nav-panel" aria-label="Screenshot navigation">
        <div class="nav-filters">
          <label>Search <input id="search" type="search" placeholder="URL, title, component, feedback"></label>
          <label>Component <select id="component-filter"></select></label>
          <label>Viewport <select id="viewport-filter"></select></label>
          <label>Review status
            <select id="status-filter">
              <option value="">All statuses</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="approved">Approved</option>
              <option value="needs_ticket">Needs ticket</option>
              <option value="needs_followup">Needs follow-up</option>
              <option value="wont_fix">Won't fix</option>
            </select>
          </label>
          <label class="check-row"><input id="console-only" type="checkbox"> Console</label>
          <label class="check-row"><input id="with-feedback-only" type="checkbox"> Feedback</label>
        </div>
        <div class="nav-toolbar">
          <p id="result-count">Loading screenshots...</p>
          <div class="pager">
            <button id="prev-page" type="button">Previous page</button>
            <span id="page-label"></span>
            <button id="next-page" type="button">Next page</button>
          </div>
        </div>
        <div id="screenshot-list" class="thumb-strip"></div>
      </section>
    </main>
    <dialog id="image-dialog">
      <button id="close-dialog" class="dialog-close" type="button">Close</button>
      <img id="dialog-image" alt="">
    </dialog>
    <dialog id="draft-dialog" class="draft-dialog">
      <div class="draft-dialog-header">
        <div>
          <p class="eyebrow">Ticket draft stop</p>
          <h2>Review Proposed Tickets</h2>
          <p id="draft-summary" class="muted">No draft plan loaded.</p>
        </div>
        <button id="close-draft-dialog" type="button">Back to feedback</button>
      </div>
      <div id="draft-plan-list" class="draft-plan-list"></div>
      <div class="draft-dialog-actions">
        <button id="cancel-drafts" type="button">Back to feedback</button>
        <button id="confirm-drafts" class="primary" type="button">Write ticket files</button>
      </div>
    </dialog>
    <script src="/app.js"></script>
  </body>
</html>`;

const APP_JS = `var state = {
  items: [],
  itemByKey: new Map(),
  feedback: {},
  dirty: new Set(),
  selectedKey: null,
  page: 1,
  pageSize: 18,
  saving: false,
  saveQueued: false,
  zoom: 1,
  draftPlan: null
};
var REVIEW_STATUSES = [["unreviewed", "Unreviewed"], ["approved", "Approved"], ["needs_ticket", "Needs ticket"], ["needs_followup", "Needs follow-up"], ["wont_fix", "Won't fix"]];
var SEVERITIES = ["P0", "P1", "P2", "P3"];
var els = {
  runMeta: document.getElementById("run-meta"),
  stats: document.getElementById("stats"),
  saveState: document.getElementById("save-state"),
  viewerKicker: document.getElementById("viewer-kicker"),
  viewerTitle: document.getElementById("viewer-title"),
  viewerMeta: document.getElementById("viewer-meta"),
  screenshotStage: document.getElementById("screenshot-stage"),
  screenshotImage: document.getElementById("screenshot-image"),
  emptyViewer: document.getElementById("empty-viewer"),
  selectedFeedback: document.getElementById("selected-feedback"),
  search: document.getElementById("search"),
  componentFilter: document.getElementById("component-filter"),
  viewportFilter: document.getElementById("viewport-filter"),
  statusFilter: document.getElementById("status-filter"),
  consoleOnly: document.getElementById("console-only"),
  withFeedbackOnly: document.getElementById("with-feedback-only"),
  resultCount: document.getElementById("result-count"),
  list: document.getElementById("screenshot-list"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  pageLabel: document.getElementById("page-label"),
  prevShot: document.getElementById("prev-shot"),
  nextShot: document.getElementById("next-shot"),
  zoomOut: document.getElementById("zoom-out"),
  zoomIn: document.getElementById("zoom-in"),
  zoomFit: document.getElementById("zoom-fit"),
  zoomLabel: document.getElementById("zoom-label"),
  openImage: document.getElementById("open-image"),
  saveFeedback: document.getElementById("save-feedback"),
  generateDrafts: document.getElementById("generate-drafts"),
  draftDialog: document.getElementById("draft-dialog"),
  draftSummary: document.getElementById("draft-summary"),
  draftPlanList: document.getElementById("draft-plan-list"),
  closeDraftDialog: document.getElementById("close-draft-dialog"),
  cancelDrafts: document.getElementById("cancel-drafts"),
  confirmDrafts: document.getElementById("confirm-drafts"),
  dialog: document.getElementById("image-dialog"),
  dialogImage: document.getElementById("dialog-image"),
  closeDialog: document.getElementById("close-dialog")
};
var autosaveTimer = null;
function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
    return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char];
  });
}
function shortUrl(url) {
  try {
    var parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch (error) {
    return url || "";
  }
}
function bytesLabel(value) {
  if (!value) return "unknown size";
  if (value > 1000000) return (value / 1000000).toFixed(1) + " MB";
  return Math.round(value / 1000) + " KB";
}
function entryFor(item) {
  var existing = state.feedback[item.key];
  if (existing) return existing;
  return { key: item.key, screenshot: item.screenshotPath, url: item.url, finalUrl: item.finalUrl, viewport: item.viewport.name, component: item.component, reviewStatus: "unreviewed", severity: "P2", ticketTitle: "", notes: "", tags: [], updatedAt: "" };
}
function hasFeedback(entry, item) {
  return Boolean(entry.reviewStatus !== "unreviewed" || entry.ticketTitle || entry.notes || (entry.tags && entry.tags.length > 0) || entry.component !== item.component);
}
function entrySignature(entry) {
  return JSON.stringify({ component: entry && entry.component ? entry.component : "", reviewStatus: entry && entry.reviewStatus ? entry.reviewStatus : "unreviewed", severity: entry && entry.severity ? entry.severity : "P2", ticketTitle: entry && entry.ticketTitle ? entry.ticketTitle : "", notes: entry && entry.notes ? entry.notes : "", tags: entry && entry.tags ? entry.tags : [] });
}
function cloneEntry(entry) {
  return JSON.parse(JSON.stringify(entry));
}
function selectedValue(value, current) {
  return value === current ? " selected" : "";
}
function statusOptions(current) {
  return REVIEW_STATUSES.map(function (pair) {
    return '<option value="' + pair[0] + '"' + selectedValue(pair[0], current) + ">" + pair[1] + "</option>";
  }).join("");
}
function severityOptions(current) {
  return SEVERITIES.map(function (value) {
    return '<option value="' + value + '"' + selectedValue(value, current) + ">" + value + "</option>";
  }).join("");
}
function reviewStatusLabel(value) {
  var found = REVIEW_STATUSES.find(function (pair) { return pair[0] === value; });
  return found ? found[1] : value;
}
function statusClass(value) {
  return "status-" + String(value || "unreviewed").replace(/_/g, "-");
}
function populateFilters() {
  var components = Array.from(new Set(state.items.map(function (item) { return item.component; }))).sort();
  var viewports = Array.from(new Set(state.items.map(function (item) { return item.viewport.name + " (" + item.viewport.width + "x" + item.viewport.height + ")"; }))).sort();
  els.componentFilter.innerHTML = '<option value="">All components</option>' + components.map(function (component) { return '<option value="' + escapeHtml(component) + '">' + escapeHtml(component) + "</option>"; }).join("");
  els.viewportFilter.innerHTML = '<option value="">All viewports</option>' + viewports.map(function (viewport) { return '<option value="' + escapeHtml(viewport) + '">' + escapeHtml(viewport) + "</option>"; }).join("");
}
function filteredItems() {
  var query = els.search.value.trim().toLowerCase();
  var component = els.componentFilter.value;
  var viewport = els.viewportFilter.value;
  var status = els.statusFilter.value;
  var consoleOnly = els.consoleOnly.checked;
  var withFeedbackOnly = els.withFeedbackOnly.checked;
  return state.items.filter(function (item) {
    var entry = entryFor(item);
    var viewportLabel = item.viewport.name + " (" + item.viewport.width + "x" + item.viewport.height + ")";
    var haystack = [item.url, item.finalUrl, item.title, item.component, entry.component, entry.ticketTitle, entry.notes, (entry.tags || []).join(" ")].join(" ").toLowerCase();
    if (query && haystack.indexOf(query) === -1) return false;
    if (component && item.component !== component) return false;
    if (viewport && viewportLabel !== viewport) return false;
    if (status && entry.reviewStatus !== status) return false;
    if (consoleOnly && item.consoleErrorCount < 1) return false;
    if (withFeedbackOnly && !hasFeedback(entry, item)) return false;
    return true;
  });
}
function currentItem() {
  return state.selectedKey ? state.itemByKey.get(state.selectedKey) || null : null;
}
function currentIndex(filtered) {
  if (!state.selectedKey) return -1;
  return filtered.findIndex(function (item) { return item.key === state.selectedKey; });
}
function pageCountFor(filtered) {
  return Math.max(1, Math.ceil(filtered.length / state.pageSize));
}
function ensureSelection(filtered) {
  if (filtered.length === 0) { state.selectedKey = null; state.page = 1; return; }
  if (currentIndex(filtered) === -1) { state.selectedKey = filtered[0].key; state.page = 1; }
  state.page = Math.max(1, Math.min(pageCountFor(filtered), state.page));
}
function signalText(item) {
  return [(item.httpStatus == null ? "HTTP ?" : "HTTP " + item.httpStatus), item.ok ? "OK" : "Not OK", item.consoleErrorCount + " console", item.failedRequestCount + " failed req", item.elapsedMs == null ? "time ?" : item.elapsedMs + " ms", bytesLabel(item.screenshotBytes)].join(" / ");
}
function renderStats() {
  var reviewed = 0, needsTicket = 0, consoleErrors = 0;
  state.items.forEach(function (item) {
    var entry = entryFor(item);
    if (entry.reviewStatus !== "unreviewed") reviewed += 1;
    if (entry.reviewStatus === "needs_ticket") needsTicket += 1;
    if (item.consoleErrorCount > 0) consoleErrors += 1;
  });
  els.stats.innerHTML = '<div><strong>' + state.items.length + "</strong><span>Screenshots</span></div>" + '<div><strong>' + reviewed + "</strong><span>Reviewed</span></div>" + '<div><strong>' + needsTicket + "</strong><span>Need tickets</span></div>" + '<div><strong>' + consoleErrors + "</strong><span>Console flags</span></div>";
}
function renderThumb(item, filteredIndex) {
  var entry = entryFor(item);
  var selected = item.key === state.selectedKey ? " selected" : "";
  return '<button class="nav-thumb' + selected + '" type="button" data-key="' + escapeHtml(item.key) + '">' + '<img loading="lazy" src="' + escapeHtml(item.screenshotUrl) + '" alt="' + escapeHtml(item.title) + '">' + '<span class="nav-thumb-body"><span class="nav-thumb-index">' + String(filteredIndex + 1) + '</span><span class="nav-thumb-title">' + escapeHtml(shortUrl(item.url) || item.title) + '</span><span class="nav-thumb-meta">' + escapeHtml(item.viewport.name + " / " + item.component) + '</span><span class="review-pill ' + statusClass(entry.reviewStatus) + '">' + escapeHtml(reviewStatusLabel(entry.reviewStatus)) + "</span></span></button>";
}
function renderViewer(filtered) {
  var item = currentItem();
  if (!item) {
    els.viewerKicker.textContent = "Screenshot";
    els.viewerTitle.textContent = "No screenshots match the current filters";
    els.viewerMeta.textContent = "Adjust the navigation filters below.";
    els.emptyViewer.hidden = false;
    els.screenshotImage.hidden = true;
    els.screenshotImage.removeAttribute("src");
    els.prevShot.disabled = true;
    els.nextShot.disabled = true;
    els.openImage.disabled = true;
    return;
  }
  var entry = entryFor(item);
  var index = currentIndex(filtered);
  els.viewerKicker.textContent = index >= 0 ? String(index + 1) + " of " + filtered.length : "Filtered";
  els.viewerTitle.textContent = item.title || shortUrl(item.url) || "Untitled screenshot";
  els.viewerMeta.textContent = entry.component + " / " + item.viewport.name + " " + item.viewport.width + "x" + item.viewport.height + " / " + signalText(item);
  els.emptyViewer.hidden = true;
  els.screenshotImage.hidden = false;
  els.screenshotImage.src = item.screenshotUrl;
  els.screenshotImage.alt = item.title || shortUrl(item.url);
  applyZoom();
  els.prevShot.disabled = index <= 0;
  els.nextShot.disabled = index < 0 || index >= filtered.length - 1;
  els.openImage.disabled = false;
}
function renderFeedbackPanel() {
  var item = currentItem();
  if (!item) { els.selectedFeedback.innerHTML = '<p class="muted">Select a screenshot to review it.</p>'; return; }
  var entry = entryFor(item);
  var urlLine = item.url ? '<p><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(shortUrl(item.url)) + "</a></p>" : "";
  els.selectedFeedback.innerHTML = '<div class="source-block"><p><strong>' + escapeHtml(item.title || "Untitled") + "</strong></p>" + urlLine + '<p>' + escapeHtml(item.screenshotPath) + "</p></div>" + '<div class="feedback-grid"><div class="field"><span>Status</span><select data-field="reviewStatus">' + statusOptions(entry.reviewStatus) + '</select></div><div class="field"><span>Severity</span><select data-field="severity">' + severityOptions(entry.severity) + '</select></div><div class="field"><span>Component</span><input data-field="component" value="' + escapeHtml(entry.component) + '"></div><div class="field"><span>Tags</span><input data-field="tags" value="' + escapeHtml((entry.tags || []).join(", ")) + '" placeholder="layout, copy, data"></div></div>' + '<div class="field"><span>Ticket title</span><input data-field="ticketTitle" value="' + escapeHtml(entry.ticketTitle || "") + '" placeholder="Short issue title"></div>' + '<div class="field"><span>Feedback</span><textarea data-field="notes" rows="8" placeholder="Use bullets for separate tickets.">' + escapeHtml(entry.notes || "") + "</textarea></div>";
}
function renderNavigation(filtered) {
  state.page = Math.max(1, Math.min(pageCountFor(filtered), state.page));
  var start = (state.page - 1) * state.pageSize;
  var pageItems = filtered.slice(start, start + state.pageSize);
  els.resultCount.textContent = filtered.length + " of " + state.items.length + " screenshots";
  els.pageLabel.textContent = "Page " + state.page + " of " + pageCountFor(filtered);
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= pageCountFor(filtered);
  els.list.innerHTML = pageItems.map(function (item, index) { return renderThumb(item, start + index); }).join("");
}
function renderAll(options) {
  var filtered = filteredItems();
  ensureSelection(filtered);
  renderViewer(filtered);
  if (!options || !options.preserveFeedback) renderFeedbackPanel();
  renderNavigation(filtered);
  renderStats();
  updateSaveState();
}
function selectItem(key) {
  var filtered = filteredItems();
  var index = filtered.findIndex(function (item) { return item.key === key; });
  if (index === -1) return;
  state.selectedKey = key;
  state.page = Math.floor(index / state.pageSize) + 1;
  state.zoom = 1;
  renderAll();
}
function moveSelection(delta) {
  var filtered = filteredItems();
  if (filtered.length === 0) return;
  var index = currentIndex(filtered);
  selectItem(filtered[Math.max(0, Math.min(filtered.length - 1, index + delta))].key);
}
function setPage(page) {
  var filtered = filteredItems();
  state.page = Math.max(1, Math.min(pageCountFor(filtered), page));
  var pageItems = filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  state.selectedKey = pageItems[0] ? pageItems[0].key : null;
  state.zoom = 1;
  renderAll();
}
function applyFilters() {
  state.page = 1;
  var filtered = filteredItems();
  state.selectedKey = filtered[0] ? filtered[0].key : null;
  state.zoom = 1;
  renderAll();
}
function applyZoom() {
  els.zoomLabel.textContent = Math.round(state.zoom * 100) + "%";
  els.zoomOut.disabled = state.zoom <= 0.5;
  els.zoomIn.disabled = state.zoom >= 3;
  if (!els.screenshotImage.hidden) els.screenshotImage.style.width = Math.round(state.zoom * 100) + "%";
}
function setZoom(value) {
  state.zoom = Math.max(0.5, Math.min(3, Math.round(value * 4) / 4));
  applyZoom();
}
function updateSaveState(message) {
  if (message) { els.saveState.textContent = message; return; }
  if (state.saving) { els.saveState.textContent = "Autosaving..."; return; }
  els.saveState.textContent = state.dirty.size > 0 ? state.dirty.size + " screenshot edits pending autosave." : "All feedback autosaved.";
}
function updateEntry(key, field, value, options) {
  var item = state.itemByKey.get(key);
  if (!item) return;
  var entry = Object.assign({}, entryFor(item));
  if (field === "tags") entry.tags = value.split(",").map(function (tag) { return tag.trim(); }).filter(Boolean);
  else entry[field] = value;
  state.feedback[key] = entry;
  state.dirty.add(key);
  scheduleAutosave();
  if (!options || options.renderAux !== false) {
    renderStats();
    renderNavigation(filteredItems());
    renderViewer(filteredItems());
  }
  updateSaveState();
}
function scheduleAutosave() {
  window.clearTimeout(autosaveTimer);
  if (state.saving) { state.saveQueued = true; return; }
  autosaveTimer = window.setTimeout(function () { saveFeedback(false); }, 1200);
}
function wait(ms) { return new Promise(function (resolve) { window.setTimeout(resolve, ms); }); }
async function waitForIdleSave() { while (state.saving) await wait(100); }
async function saveFeedback(showMessage) {
  window.clearTimeout(autosaveTimer);
  autosaveTimer = null;
  if (state.saving) { state.saveQueued = true; if (showMessage) updateSaveState("Save already in progress; latest edits are queued."); return; }
  if (state.dirty.size === 0) { if (showMessage) updateSaveState("No feedback changes pending autosave."); return; }
  state.saving = true;
  updateSaveState();
  var entries = {}, signatures = {}, savingKeys = Array.from(state.dirty);
  savingKeys.forEach(function (key) { entries[key] = cloneEntry(state.feedback[key]); signatures[key] = entrySignature(entries[key]); });
  var response = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entries: entries }) });
  if (!response.ok) { state.saving = false; updateSaveState("Save failed: HTTP " + response.status); return; }
  var data = await response.json();
  var serverFeedback = data.feedback || {};
  savingKeys.forEach(function (key) {
    if (entrySignature(state.feedback[key]) === signatures[key]) {
      if (serverFeedback[key]) state.feedback[key] = serverFeedback[key];
      else delete state.feedback[key];
      state.dirty.delete(key);
    }
  });
  Object.keys(serverFeedback).forEach(function (key) { if (!state.dirty.has(key)) state.feedback[key] = serverFeedback[key]; });
  state.saving = false;
  var shouldSaveAgain = state.saveQueued || state.dirty.size > 0;
  state.saveQueued = false;
  if (shouldSaveAgain) scheduleAutosave();
  renderStats();
  renderNavigation(filteredItems());
  renderViewer(filteredItems());
  updateSaveState(showMessage && state.dirty.size === 0 ? "Autosaved to " + data.feedbackPath : undefined);
}
async function flushFeedback() {
  await saveFeedback(false);
  await waitForIdleSave();
  if (state.dirty.size > 0) {
    await saveFeedback(false);
    await waitForIdleSave();
  }
  return state.dirty.size === 0;
}
function excerpt(value, maxLength) {
  var text = String(value || "").replace(/\\s+/g, " ").trim();
  if (text.length <= maxLength) return text || "No feedback text supplied.";
  return text.slice(0, maxLength - 1) + "...";
}
function renderDraftPlan(plan) {
  state.draftPlan = plan;
  var candidates = plan && Array.isArray(plan.candidates) ? plan.candidates : [];
  var splitCount = candidates.filter(function (candidate) { return candidate.splitCount > 1; }).length;
  els.draftSummary.textContent = candidates.length + " proposed ticket files. " + splitCount + " came from split multi-issue feedback. Review before writing markdown.";
  els.confirmDrafts.disabled = candidates.length === 0;
  if (candidates.length === 0) { els.draftPlanList.innerHTML = '<p class="muted">No actionable feedback is ready for ticket files.</p>'; return; }
  els.draftPlanList.innerHTML = candidates.map(function (candidate, index) {
    return '<article class="draft-candidate"><div class="draft-candidate-head"><span class="nav-thumb-index">' + String(index + 1) + '</span><strong>' + escapeHtml(candidate.title) + '</strong><span class="review-pill ' + statusClass(candidate.reviewStatus) + '">' + escapeHtml(reviewStatusLabel(candidate.reviewStatus)) + '</span></div><p class="draft-meta">' + escapeHtml(candidate.component) + " / " + escapeHtml(candidate.viewport) + " / " + escapeHtml(candidate.severity) + " / split " + escapeHtml(candidate.splitIndex) + " of " + escapeHtml(candidate.splitCount) + '</p><p class="draft-meta">' + escapeHtml(candidate.splitReason) + " / " + escapeHtml(shortUrl(candidate.url)) + '</p><p class="draft-notes">' + escapeHtml(excerpt(candidate.notes, 280)) + "</p></article>";
  }).join("");
}
async function generateDrafts() {
  var flushed = await flushFeedback();
  if (!flushed) { updateSaveState("Save failed; ticket generation skipped."); return; }
  els.generateDrafts.disabled = true;
  els.generateDrafts.textContent = "Preparing...";
  try {
    var response = await fetch("/api/ticket-draft-plan", { method: "POST" });
    var data = await response.json();
    if (!response.ok) { updateSaveState("Ticket planning failed."); return; }
    renderDraftPlan(data);
    els.draftDialog.showModal();
    updateSaveState("Review " + data.count + " proposed tickets before writing files.");
  } finally {
    els.generateDrafts.disabled = false;
    els.generateDrafts.textContent = "Generate tickets";
  }
}
async function confirmDrafts() {
  if (!state.draftPlan) { updateSaveState("No draft plan is ready."); return; }
  els.confirmDrafts.disabled = true;
  els.confirmDrafts.textContent = "Writing...";
  try {
    var response = await fetch("/api/ticket-drafts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidates: state.draftPlan.candidates || [] }) });
    var data = await response.json();
    if (!response.ok) { updateSaveState("Ticket generation failed."); return; }
    els.draftDialog.close();
    updateSaveState("Generated " + data.count + " ticket files in " + data.ticket_directory + ".");
  } finally {
    els.confirmDrafts.disabled = false;
    els.confirmDrafts.textContent = "Write ticket files";
  }
}
async function load() {
  var response = await fetch("/api/screenshots");
  if (!response.ok) { els.runMeta.textContent = "Failed to load screenshots: HTTP " + response.status; return; }
  var data = await response.json();
  state.items = data.screenshots || [];
  state.itemByKey = new Map(state.items.map(function (item) { return [item.key, item]; }));
  state.feedback = data.feedback || {};
  state.selectedKey = state.items[0] ? state.items[0].key : null;
  els.runMeta.textContent = data.sourceDir + " / " + state.items.length + " screenshots / feedback: " + data.feedbackPath;
  populateFilters();
  renderAll();
}
els.selectedFeedback.addEventListener("input", function (event) {
  var target = event.target;
  if (target.tagName !== "TEXTAREA" && target.tagName !== "INPUT") return;
  var item = currentItem();
  if (!item || !target.dataset.field) return;
  updateEntry(item.key, target.dataset.field, target.value, { renderAux: false });
});
els.selectedFeedback.addEventListener("change", function (event) {
  var target = event.target;
  var item = currentItem();
  if (!item || !target.dataset.field) return;
  updateEntry(item.key, target.dataset.field, target.value, { renderAux: target.tagName === "SELECT" });
  if (target.tagName === "SELECT") renderAll({ preserveFeedback: true });
});
els.list.addEventListener("click", function (event) {
  var control = event.target.closest("[data-key]");
  if (control) selectItem(control.dataset.key);
});
els.openImage.addEventListener("click", function () {
  var item = currentItem();
  if (!item) return;
  els.dialogImage.src = item.screenshotUrl;
  els.dialogImage.alt = item.title;
  els.dialog.showModal();
});
els.closeDialog.addEventListener("click", function () { els.dialog.close(); });
els.zoomOut.addEventListener("click", function () { setZoom(state.zoom - 0.25); });
els.zoomIn.addEventListener("click", function () { setZoom(state.zoom + 0.25); });
els.zoomFit.addEventListener("click", function () { setZoom(1); els.screenshotStage.scrollTop = 0; els.screenshotStage.scrollLeft = 0; });
els.screenshotStage.addEventListener("wheel", function (event) { if (!event.ctrlKey && !event.metaKey) return; event.preventDefault(); setZoom(state.zoom + (event.deltaY < 0 ? 0.25 : -0.25)); }, { passive: false });
els.search.addEventListener("input", applyFilters);
els.componentFilter.addEventListener("change", applyFilters);
els.viewportFilter.addEventListener("change", applyFilters);
els.statusFilter.addEventListener("change", applyFilters);
els.consoleOnly.addEventListener("change", applyFilters);
els.withFeedbackOnly.addEventListener("change", applyFilters);
els.prevPage.addEventListener("click", function () { setPage(state.page - 1); });
els.nextPage.addEventListener("click", function () { setPage(state.page + 1); });
els.prevShot.addEventListener("click", function () { moveSelection(-1); });
els.nextShot.addEventListener("click", function () { moveSelection(1); });
els.saveFeedback.addEventListener("click", function () { saveFeedback(true); });
els.generateDrafts.addEventListener("click", generateDrafts);
els.confirmDrafts.addEventListener("click", confirmDrafts);
els.closeDraftDialog.addEventListener("click", function () { els.draftDialog.close(); });
els.cancelDrafts.addEventListener("click", function () { els.draftDialog.close(); });
document.addEventListener("keydown", function (event) {
  var tag = document.activeElement ? document.activeElement.tagName : "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (event.key === "ArrowLeft") { event.preventDefault(); moveSelection(-1); }
  if (event.key === "ArrowRight") { event.preventDefault(); moveSelection(1); }
  if (event.key === "-" || event.key === "_") { event.preventDefault(); setZoom(state.zoom - 0.25); }
  if (event.key === "=" || event.key === "+") { event.preventDefault(); setZoom(state.zoom + 0.25); }
  if (event.key === "0") { event.preventDefault(); setZoom(1); }
});
window.addEventListener("beforeunload", function (event) { if (state.dirty.size === 0) return; event.preventDefault(); event.returnValue = ""; });
load();`;

const STYLES_CSS = `:root {
  color-scheme: light;
  --bg: #f7f8f5;
  --panel: #ffffff;
  --panel-strong: #eef1e8;
  --ink: #20231f;
  --muted: #62685f;
  --line: #d5dacd;
  --blue: #236386;
  --green: #2f7655;
  --amber: #9a6415;
  --red: #9f342b;
  --violet: #5b4b7d;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body { margin: 0; background: var(--bg); color: var(--ink); min-height: 100vh; overflow: hidden; }
button, input, select, textarea { font: inherit; }
button { border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 6px; min-height: 34px; padding: 7px 11px; cursor: pointer; }
button.primary { background: var(--blue); border-color: var(--blue); color: #fff; }
button:disabled { color: var(--muted); cursor: not-allowed; opacity: 0.7; }
a { color: var(--blue); }
.app-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding: 18px 22px; border-bottom: 1px solid var(--line); background: #fcfff8; position: sticky; top: 0; z-index: 10; }
.app-header h1 { margin: 0; font-size: 22px; line-height: 1.2; }
.eyebrow { margin: 0 0 4px; color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; }
.muted { color: var(--muted); }
.app-header .muted { margin: 6px 0 0; font-size: 13px; overflow-wrap: anywhere; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.review-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 390px); grid-template-rows: minmax(0, 1fr) minmax(176px, 230px); gap: 12px; height: calc(100vh - 86px); padding: 12px; min-height: 0; }
.viewer-panel, .feedback-panel, .nav-panel { min-width: 0; min-height: 0; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
.viewer-panel { display: grid; grid-template-rows: auto minmax(0, 1fr); overflow: hidden; }
.viewer-toolbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; padding: 12px; border-bottom: 1px solid var(--line); }
.viewer-title-group { display: grid; gap: 4px; min-width: 0; }
.viewer-title-group h2 { margin: 0; font-size: 18px; line-height: 1.2; }
.viewer-title-group .muted { margin: 0; font-size: 12px; overflow-wrap: anywhere; }
.viewer-controls { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
.viewer-controls button { min-width: 36px; }
.zoom-label { min-width: 48px; color: var(--muted); font-size: 12px; font-weight: 800; text-align: center; }
.screenshot-stage { min-height: 0; overflow: auto; background: #151713; padding: 18px; }
.screenshot-stage img { display: block; width: 100%; height: auto; margin: 0 auto; background: #fff; box-shadow: 0 12px 34px rgba(0, 0, 0, 0.38); }
.empty-viewer { display: grid; min-height: 100%; place-items: center; color: #ccd4c6; font-weight: 800; }
.feedback-panel { grid-column: 2; grid-row: 1 / 3; display: grid; grid-template-rows: auto minmax(0, 1fr) auto auto; gap: 12px; overflow: auto; padding: 14px; }
.panel-heading { display: grid; gap: 4px; }
.panel-heading h2 { margin: 0; font-size: 17px; }
.selected-feedback { display: grid; align-content: start; gap: 12px; min-height: 0; }
.source-block { display: grid; gap: 4px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel-strong); padding: 10px; color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
.source-block p { margin: 0; }
.source-block strong { color: var(--ink); }
.nav-panel { display: grid; grid-template-rows: auto auto minmax(0, 1fr); gap: 10px; overflow: hidden; padding: 10px; }
.nav-filters { display: grid; grid-template-columns: minmax(180px, 1.4fr) repeat(3, minmax(130px, 1fr)) repeat(2, auto); gap: 8px; align-items: end; }
.nav-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.nav-toolbar p { margin: 0; font-weight: 800; }
.thumb-strip { display: flex; gap: 8px; overflow: auto; padding-bottom: 4px; }
.nav-thumb { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 8px; align-items: start; min-width: 270px; max-width: 310px; padding: 7px; text-align: left; background: #fff; }
.nav-thumb.selected { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(35, 99, 134, 0.16); }
.nav-thumb img { width: 104px; aspect-ratio: 16 / 10; object-fit: cover; object-position: top left; border-radius: 4px; background: #d5dacd; }
.nav-thumb-body { display: grid; gap: 3px; min-width: 0; }
.nav-thumb-index { color: var(--muted); font-size: 11px; font-weight: 800; }
.nav-thumb-title { color: var(--ink); font-size: 12px; font-weight: 800; overflow-wrap: anywhere; }
.nav-thumb-meta { color: var(--muted); font-size: 11px; line-height: 1.25; }
label, .field { display: grid; gap: 5px; min-width: 0; color: var(--muted); font-size: 12px; font-weight: 700; }
input, select, textarea { width: 100%; min-width: 0; border: 1px solid var(--line); border-radius: 6px; background: #fff; color: var(--ink); padding: 8px 9px; font-weight: 500; }
textarea { resize: vertical; min-height: 96px; }
.check-row { grid-template-columns: 18px 1fr; align-items: center; color: var(--ink); font-weight: 600; }
.check-row input { width: 16px; height: 16px; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.stats div { border: 1px solid var(--line); border-radius: 6px; padding: 8px; background: var(--panel-strong); }
.stats strong, .stats span { display: block; }
.stats span { color: var(--muted); font-size: 11px; }
.save-state { border-top: 1px solid var(--line); padding-top: 12px; color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
.pager { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
.review-pill { border-radius: 999px; padding: 2px 7px; color: #fff; font-weight: 800; }
.status-unreviewed { background: var(--muted); }
.status-approved { background: var(--green); }
.status-needs-ticket { background: var(--red); }
.status-needs-followup { background: var(--amber); }
.status-wont-fix { background: var(--violet); }
.feedback-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
dialog { width: min(94vw, 1400px); height: min(92vh, 1000px); padding: 44px 10px 10px; border: 1px solid var(--line); border-radius: 8px; }
dialog::backdrop { background: rgba(0, 0, 0, 0.64); }
.dialog-close { position: absolute; top: 8px; right: 8px; }
#dialog-image { width: 100%; height: 100%; object-fit: contain; object-position: top center; }
.draft-dialog { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 12px; width: min(92vw, 980px); height: min(88vh, 820px); padding: 14px; }
.draft-dialog:not([open]) { display: none; }
.draft-dialog-header, .draft-dialog-actions { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.draft-dialog-header h2 { margin: 0; font-size: 20px; }
.draft-dialog-header .muted { margin: 5px 0 0; font-size: 13px; }
.draft-dialog-actions { align-items: center; border-top: 1px solid var(--line); padding-top: 12px; }
.draft-plan-list { display: grid; align-content: start; gap: 10px; overflow: auto; }
.draft-candidate { display: grid; gap: 7px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 10px; }
.draft-candidate-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.draft-meta, .draft-notes { margin: 0; color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
.draft-notes { color: var(--ink); line-height: 1.35; }
@media (max-width: 1180px) {
  body { overflow: auto; }
  .review-shell { grid-template-columns: 1fr; grid-template-rows: minmax(520px, 72vh) auto auto; height: auto; }
  .feedback-panel { grid-column: auto; grid-row: auto; max-height: none; }
  .nav-panel { min-height: 280px; }
  .nav-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .review-shell { display: grid; grid-template-columns: 1fr; grid-template-rows: minmax(420px, 70vh) auto auto; padding: 8px; }
  .viewer-toolbar, .nav-toolbar, .app-header { align-items: flex-start; flex-direction: column; }
  .nav-filters, .feedback-grid { grid-template-columns: 1fr; }
  .thumb-strip { flex-direction: column; }
  .nav-thumb { max-width: none; width: 100%; }
}`;
