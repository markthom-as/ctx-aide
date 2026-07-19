const commandCatalogVersion = 1;

function command(definition) {
  return {
    json: true,
    mutating: false,
    mutation_boundary: "read-only",
    required_flags: [],
    examples: [definition.usage],
    ...definition,
  };
}

export const commandGroups = [
  {
    id: "core",
    title: "Core",
    description: "Baseline validation and local health checks.",
    aliases: ["base"],
    commands: [
      command({
        id: "lint",
        command: "lint",
        usage: "ctxa lint --json",
        description: "Validate context, config, and markdown contracts.",
      }),
      command({
        id: "doctor",
        command: "doctor",
        usage: "ctxa doctor --json",
        description: "Check local runtime dependencies and repo health.",
      }),
      command({
        id: "init",
        command: "init",
        usage: "ctxa init --json",
        description: "Create the baseline CTX Aide repo structure.",
        mutating: true,
        mutation_boundary: "writes scaffold files unless existing files block the run; use --force to overwrite allowed files",
      }),
    ],
  },
  {
    id: "context",
    title: "Context",
    description: "Index, query, and export markdown-backed context artifacts.",
    aliases: ["context-index"],
    commands: [
      command({
        id: "scan",
        command: "scan",
        usage: "ctxa scan --json",
        description: "Index markdown context into generated local artifacts.",
        mutating: true,
        mutation_boundary: "writes generated context manifest and SQLite cache under docs/context/generated",
      }),
      command({
        id: "query",
        command: "query",
        usage: "ctxa query --path <path> --task <task> --agent codex --budget 6000 --json",
        description: "Load bounded context for a path and task.",
        required_flags: ["--path", "--task"],
      }),
      command({
        id: "export-agent",
        command: "export-agent",
        usage: "ctxa export-agent --agent codex --out docs/context/generated/agent-pack.codex.md --json",
        description: "Write generated agent context packs.",
        mutating: true,
        mutation_boundary: "writes only to repo-contained output paths; outside paths require explicit allow-outside-repo handling where supported",
        required_flags: ["--agent"],
      }),
    ],
  },
  {
    id: "catalog-impact",
    title: "Catalog And Impact",
    description: "Inspect command, component, run, discovery, and impact metadata.",
    aliases: ["catalog", "impact", "catalog-and-impact"],
    commands: [
      command({
        id: "command.manifest",
        command: "command manifest",
        usage: "ctxa command manifest --json",
        description: "Return a versioned machine-readable command manifest.",
      }),
      command({
        id: "components.list",
        command: "components list",
        usage: "ctxa components list --json",
        description: "List known component context entries.",
      }),
      command({
        id: "components.get",
        command: "components get",
        usage: "ctxa components get component.Button --json",
        description: "Read one component context entry.",
        required_flags: ["<component-id>"],
      }),
      command({
        id: "impact",
        command: "impact",
        usage: "ctxa impact --path components/Button.tsx --json",
        description: "Find context affected by a path.",
        required_flags: ["--path"],
      }),
      command({
        id: "run.status",
        command: "run status",
        usage: "ctxa run status docs/runs/RUN.md --json",
        description: "Read a milestone/run status file.",
        required_flags: ["<run-file>"],
      }),
      command({
        id: "idvisor.workflow",
        command: "idvisor workflow",
        usage: "ctxa idvisor workflow --json",
        description: "Inspect the Idvisor workflow helper.",
      }),
      command({
        id: "customize",
        command: "customize",
        usage: "ctxa customize --profile strict --dry-run --json",
        description: "Preview profile customization changes.",
        mutating: true,
        mutation_boundary: "dry-run by default; writes customization artifacts only when write flags are supplied",
      }),
      command({
        id: "discover",
        command: "discover",
        usage: "ctxa discover --backend semble --task <task> --repo . --json",
        description: "Run bounded semantic code discovery.",
        mutating: true,
        mutation_boundary: "read-only unless --out is supplied, then writes a repo-contained discovery result",
        required_flags: ["--task"],
      }),
    ],
  },
  {
    id: "repo-health-policy",
    title: "Repo Health And Policy",
    description: "Audit dependencies, LOC, workflow readiness, settings, and tool policy.",
    aliases: ["repo-health", "policy", "health"],
    commands: [
      command({
        id: "dependency.audit",
        command: "dependency audit",
        usage: "ctxa dependency audit --repo . --command 'pnpm audit --prod' --json",
        description: "Run a configured dependency audit command.",
        required_flags: ["--command"],
      }),
      command({
        id: "loc",
        command: "loc",
        usage: "ctxa loc --repo . --json",
        description: "Measure source volume.",
      }),
      command({
        id: "loc.check",
        command: "loc check",
        usage: "ctxa loc check --repo . --target-id source --json",
        description: "Validate configured LOC targets.",
      }),
      command({
        id: "tools.list",
        command: "tools list",
        usage: "ctxa tools list --json",
        description: "List known agent capabilities and policy.",
      }),
      command({
        id: "tools.policy",
        command: "tools policy",
        usage: "ctxa tools policy --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json",
        description: "Inspect policy for one capability.",
        required_flags: ["--capability"],
      }),
      command({
        id: "tools.check",
        command: "tools check",
        usage: "ctxa tools check --workflow workflow.browser-validation --step browser-smoke --capability tool.playwright --json",
        description: "Validate whether one capability is allowed.",
        required_flags: ["--capability"],
      }),
      command({
        id: "workflow.deps",
        command: "workflow deps",
        usage: "ctxa workflow deps --workflow workflow.browser-validation --repo . --json",
        description: "Inspect workflow dependencies.",
        mutating: true,
        mutation_boundary: "read-only unless --write is supplied, then updates package dependencies for missing workflow requirements",
        required_flags: ["--workflow"],
      }),
      command({
        id: "workflow.views",
        command: "workflow views",
        usage: "ctxa workflow views --workflow workflow.browser-validation --repo . --json",
        description: "Inspect workflow validation views.",
        required_flags: ["--workflow"],
      }),
      command({
        id: "workflow.validation-plan",
        command: "workflow validation-plan",
        usage: "ctxa workflow validation-plan --workflow workflow.browser-validation --repo . --json",
        description: "Build a validation readiness plan.",
        required_flags: ["--workflow"],
      }),
      command({
        id: "settings.get",
        command: "settings get",
        usage: "ctxa settings get --repo . --json",
        description: "Read repo-local CTX Aide settings.",
      }),
      command({
        id: "settings.set",
        command: "settings set",
        usage: "ctxa settings set --repo . --feature screenshot-feedback-review-ui --enabled true --write --json",
        description: "Update a settings feature flag.",
        mutating: true,
        mutation_boundary: "requires --write to persist settings changes",
        required_flags: ["--feature", "--enabled"],
      }),
    ],
  },
  {
    id: "skills",
    title: "Skills",
    description: "Inventory and validate repo-local Codex skills.",
    aliases: ["skill"],
    commands: [
      command({
        id: "skills.inventory",
        command: "skills inventory",
        usage: "ctxa skills inventory --repo . --json",
        description: "List repo-local skills without installing or activating them.",
      }),
      command({
        id: "skills.check",
        command: "skills check",
        usage: "ctxa skills check --repo . --json",
        description: "Validate repo-local skill manifest metadata.",
      }),
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Plan, review, capture, and promote feedback into markdown work.",
    aliases: ["review"],
    commands: [
      command({
        id: "feedback.plan",
        command: "feedback plan",
        usage: "ctxa feedback plan --repo . --ticket docs/tickets/ready/example.md --body '<natural feedback>' --json",
        description: "Plan how feedback should become ticket work.",
        required_flags: ["--ticket", "--body"],
      }),
      command({
        id: "feedback.review",
        command: "feedback review",
        usage: "ctxa feedback review --repo . --ticket docs/tickets/ready/example.md --screenshot .ctx-aide/artifacts/screenshots/example.png --url http://localhost:3000 --json",
        description: "Review screenshot feedback against a ticket.",
        required_flags: ["--ticket", "--screenshot"],
      }),
      command({
        id: "feedback.review-ui",
        command: "feedback review-ui",
        usage: "ctxa feedback review-ui --repo . --screenshot-dir .ctx-aide/artifacts/screenshots --port 0",
        description: "Start the local screenshot review UI.",
        json: false,
      }),
      command({
        id: "feedback.capture",
        command: "feedback capture",
        usage: "ctxa feedback capture --repo . --ticket docs/tickets/ready/example.md --title '<feedback>' --body '<feedback text>' --write --json",
        description: "Capture feedback as markdown.",
        mutating: true,
        mutation_boundary: "requires --write to persist captured feedback markdown",
        required_flags: ["--ticket", "--title", "--body"],
      }),
      command({
        id: "feedback.promote",
        command: "feedback promote",
        usage: "ctxa feedback promote --repo . --feedback <feedback-id-or-path> --ticket docs/tickets/ready/example.md --mode follow-up-ticket --write --json",
        description: "Promote accepted feedback into ticket work.",
        mutating: true,
        mutation_boundary: "requires --write to modify ticket markdown or create follow-up ticket work",
        required_flags: ["--feedback", "--ticket", "--mode"],
      }),
    ],
  },
  {
    id: "credentials",
    title: "Credentials",
    description: "Inspect and import local credential material without exposing secrets.",
    aliases: ["auth"],
    commands: [
      command({
        id: "credentials.check",
        command: "credentials check",
        usage: "ctxa credentials check --profile browser-test-user --repo . --json",
        description: "Check a named local credential profile.",
        required_flags: ["--profile"],
      }),
      command({
        id: "credentials.import-browser-state",
        command: "credentials import-browser-state",
        usage: "ctxa credentials import-browser-state --profile browser-test-user --from storage-state.json --repo . --write --json",
        description: "Import browser storage state for validation.",
        mutating: true,
        mutation_boundary: "requires --write to persist redacted browser state under .ctx-aide/browser",
        required_flags: ["--profile", "--from"],
      }),
    ],
  },
  {
    id: "adoption",
    title: "Adoption",
    description: "Inspect and seed CTX Aide conventions in target repositories.",
    aliases: ["adopt"],
    commands: [
      command({
        id: "setup",
        command: "setup",
        usage: "ctxa setup --repo <target-repo> --profile auto --no-input --json",
        description: "Preview or write first-run target setup.",
        mutating: true,
        mutation_boundary: "preview-only by default; requires --write or --yes to create or update target repo files",
        required_flags: ["--repo"],
        examples: [
          "ctxa setup --repo <target-repo> --profile auto --no-input --json",
          "ctxa setup --repo <target-repo> --profile auto --write --no-input --json",
        ],
      }),
      command({
        id: "adoption.status",
        command: "adoption status",
        usage: "ctxa adoption status --repo <target-repo> --profile auto --json",
        description: "Inspect target repo adoption readiness.",
        required_flags: ["--repo"],
      }),
      command({
        id: "adoption.bootstrap",
        command: "adoption bootstrap",
        usage: "ctxa adoption bootstrap --repo <target-repo> --profile wetware --write --json",
        description: "Seed CTX Aide files into a target repo.",
        mutating: true,
        mutation_boundary: "dry-run by default; requires --write to create or update target repo files",
        required_flags: ["--repo"],
      }),
      command({
        id: "adoption.pack",
        command: "adoption pack",
        usage: "ctxa adoption pack --repo <target-repo> --title '<pack>' --slug <slug> --write --json",
        description: "Create a target repo ticket pack.",
        mutating: true,
        mutation_boundary: "dry-run by default; requires --write to create target repo ticket pack markdown",
        required_flags: ["--repo", "--title", "--slug"],
      }),
      command({
        id: "adoption.context",
        command: "adoption context",
        usage: "ctxa adoption context --repo <target-repo> --kind flow --title '<flow>' --path <path> --task '<task>' --write --json",
        description: "Create target repo context markdown.",
        mutating: true,
        mutation_boundary: "dry-run by default; requires --write to create target repo context markdown",
        required_flags: ["--repo", "--kind", "--title", "--path", "--task"],
      }),
      command({
        id: "adoption.ticket",
        command: "adoption ticket",
        usage: "ctxa adoption ticket --repo <target-repo> --pack <pack-id> --pack-slug <pack-slug> --title '<ticket>' --task '<task>' --context <context-id> --capability-workflow <workflow-id> --capability-step <step-id> --capability <capability-id> --write --json",
        description: "Create a target repo implementation ticket.",
        mutating: true,
        mutation_boundary: "dry-run by default; requires --write to create target repo ticket markdown",
        required_flags: ["--repo", "--title", "--task"],
      }),
      command({
        id: "adoption.implementation-plan",
        command: "adoption implementation-plan",
        usage: "ctxa adoption implementation-plan --repo <target-repo> --ticket <ticket.md> --capability-workflow <workflow-id> --capability-step <step-id> --json",
        description: "Load a ticket implementation plan.",
        required_flags: ["--repo", "--ticket"],
      }),
    ],
  },
  {
    id: "markdown-gates",
    title: "Markdown Gates",
    description: "Validate canonical ticket, pack, spec, and future-work markdown.",
    aliases: ["markdown", "gates", "markdown gates"],
    commands: [
      command({
        id: "ticket.check",
        command: "ticket check",
        usage: "ctxa ticket check --json",
        description: "Validate ticket markdown.",
      }),
      command({
        id: "ticket.hydrate",
        command: "ticket hydrate",
        usage: "ctxa ticket hydrate docs/tickets/draft/TICKET.md --json",
        description: "Hydrate a draft ticket with context.",
        mutating: true,
        mutation_boundary: "writes ticket hydration output for the specified draft ticket when supported by the current ticket state",
        required_flags: ["<ticket-file>"],
      }),
      command({
        id: "pack.check",
        command: "pack check",
        usage: "ctxa pack check --json",
        description: "Validate ticket packs.",
      }),
      command({
        id: "pack.status",
        command: "pack status",
        usage: "ctxa pack status <pack-id> --json",
        description: "Read pack status and ticket rollup.",
        required_flags: ["<pack-id>"],
      }),
      command({
        id: "spec.check",
        command: "spec check",
        usage: "ctxa spec check --json",
        description: "Validate spec markdown.",
      }),
      command({
        id: "future.check",
        command: "future check",
        usage: "ctxa future check --json",
        description: "Validate future-work markdown.",
      }),
    ],
  },
];

function normalizeTopic(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicCommand(commandEntry, group) {
  return {
    id: commandEntry.id,
    group: group.id,
    group_title: group.title,
    command: commandEntry.command,
    usage: commandEntry.usage,
    description: commandEntry.description,
    json: commandEntry.json,
    mutating: commandEntry.mutating,
    mutation_boundary: commandEntry.mutation_boundary,
    required_flags: commandEntry.required_flags,
    examples: commandEntry.examples,
  };
}

export function commandEntries() {
  return commandGroups.flatMap((group) => group.commands.map((entry) => publicCommand(entry, group)));
}

export function commandUsage() {
  return commandEntries().map((entry) => entry.usage);
}

export function findCommandGroup(topic) {
  const normalized = normalizeTopic(topic);
  if (!normalized) return null;
  return commandGroups.find((group) => {
    const names = [group.id, group.title, ...(group.aliases ?? [])].map(normalizeTopic);
    return names.includes(normalized);
  }) ?? null;
}

export function validHelpGroups() {
  return commandGroups.map((group) => ({
    id: group.id,
    title: group.title,
    aliases: group.aliases ?? [],
  }));
}

export function formatTopLevelHelp() {
  const lines = [
    "CTX Aide (ctxa)",
    "Repo-local context, markdown tickets, validation gates, and agent handoff.",
    "",
    "Usage:",
    "  ctxa <command> [options]",
    "  ctxa <command> --json",
    "  ctxa help <group>",
    "",
    "Commands:",
  ];
  for (const group of commandGroups) {
    lines.push("", group.title);
    for (const entry of group.commands) {
      lines.push(`  ${entry.usage}`, `      ${entry.description}`);
    }
  }
  lines.push("", "Use --json for stable machine-readable output.");
  return `${lines.join("\n")}\n`;
}

export function formatGroupHelp(group) {
  const lines = [
    `CTX Aide (ctxa) ${group.title}`,
    group.description,
    "",
    "Usage:",
    `  ctxa help ${group.id}`,
    "  ctxa help <group> --json",
    "",
    "Commands:",
  ];
  for (const entry of group.commands) {
    lines.push(`  ${entry.usage}`, `      ${entry.description}`);
  }
  lines.push("", "Use --json for stable machine-readable output.");
  return `${lines.join("\n")}\n`;
}

export function topLevelHelpResult(ok = true) {
  return {
    ok,
    usage: commandUsage(),
  };
}

export function groupHelpResult(topic) {
  const group = findCommandGroup(topic);
  if (!group) {
    return {
      ok: false,
      scope: "help",
      group: topic,
      groups: validHelpGroups(),
      errors: [{ message: `unknown help group: ${topic}` }],
    };
  }
  return {
    ok: true,
    scope: `help ${group.id}`,
    group: {
      id: group.id,
      title: group.title,
      description: group.description,
      aliases: group.aliases ?? [],
    },
    commands: group.commands.map((entry) => publicCommand(entry, group)),
  };
}

export function commandManifestResult() {
  return {
    ok: true,
    scope: "command manifest",
    manifest_version: commandCatalogVersion,
    generated_from: "tools/ctx-aide/command-catalog.mjs",
    groups: commandGroups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      aliases: group.aliases ?? [],
      command_ids: group.commands.map((entry) => entry.id),
    })),
    command_count: commandEntries().length,
    commands: commandEntries(),
  };
}
