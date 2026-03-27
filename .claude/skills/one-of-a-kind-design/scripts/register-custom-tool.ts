/**
 * register-custom-tool.ts — Validates and stores user-defined tool definitions.
 * Supports register, list, remove, and update operations for custom tool YAML files.
 *
 * Run: bun run scripts/register-custom-tool.ts --register <yaml-path>
 *      bun run scripts/register-custom-tool.ts --list
 *      bun run scripts/register-custom-tool.ts --remove <tool-id>
 *      bun run scripts/register-custom-tool.ts --update <tool-id> <yaml-path>
 */

import { readdir, unlink } from "node:fs/promises";
import { extname, join } from "node:path";
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// --- Types ---

interface RegistrationResult {
  readonly action: "register" | "list" | "remove" | "update";
  readonly tool_id: string;
  readonly status: "success" | "error";
  readonly accepts?: string[];
  readonly suggest_when?: string[];
  readonly tools?: ToolSummary[];
  readonly message?: string;
}

interface ToolSummary {
  readonly id: string;
  readonly name: string;
  readonly accepts: string[];
  readonly suggest_when: string[];
}

// --- Constants ---

const CUSTOM_TOOLS_DIR = new URL("../custom-tools", import.meta.url).pathname;

const VALID_FORMATS = [
  "json",
  "css",
  "php",
  "md",
  "yaml",
  "xml",
  "html",
  "liquid",
  "njk",
  "hbs",
  "pug",
  "ejs",
];

const VALID_ACCEPTS = [
  "png",
  "jpg",
  "jpeg",
  "svg",
  "webp",
  "gif",
  "avif",
  "mp4",
  "webm",
  "mov",
  "mp3",
  "wav",
  "ogg",
  "glb",
  "gltf",
  "obj",
  "stl",
  "usdz",
  "css",
  "js",
  "ts",
  "html",
  "json",
  "yaml",
  "xml",
  "liquid",
  "php",
  "md",
  "txt",
];

const BUILT_IN_TOOL_IDS = [
  "figma",
  "framer",
  "webflow",
  "wordpress",
  "shopify",
  "squarespace",
  "notion",
  "canva",
  "generic",
];

// --- Validation ---

interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export function validateToolDefinition(def: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required string fields
  const requiredStrings = [
    "id",
    "name",
    "description",
    "native_format",
    "prompt_adaptation",
    "version",
  ];
  for (const field of requiredStrings) {
    if (typeof def[field] !== "string" || (def[field] as string).trim().length === 0) {
      errors.push({ field, message: `'${field}' is required and must be a non-empty string` });
    }
  }

  // ID must be kebab-case
  const id = def.id as string | undefined;
  if (id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    errors.push({
      field: "id",
      message: "ID must be kebab-case (lowercase letters, numbers, hyphens)",
    });
  }

  // ID must not conflict with built-in tools
  if (id && BUILT_IN_TOOL_IDS.includes(id)) {
    errors.push({ field: "id", message: `ID '${id}' conflicts with built-in tool` });
  }

  // Accepts must be array of valid formats
  const accepts = def.accepts as unknown;
  if (!Array.isArray(accepts) || accepts.length === 0) {
    errors.push({
      field: "accepts",
      message: "'accepts' must be a non-empty array of file extensions",
    });
  } else {
    for (const ext of accepts) {
      if (!VALID_ACCEPTS.includes(ext as string)) {
        errors.push({ field: "accepts", message: `Unknown accept format: '${ext}'` });
      }
    }
  }

  // Native format must be valid
  const nf = def.native_format as string | undefined;
  if (nf && !VALID_FORMATS.includes(nf)) {
    errors.push({
      field: "native_format",
      message: `Unknown native format: '${nf}'. Valid: ${VALID_FORMATS.join(", ")}`,
    });
  }

  // Import steps must be array
  const steps = def.import_steps as unknown;
  if (!Array.isArray(steps) || steps.length === 0) {
    errors.push({ field: "import_steps", message: "'import_steps' must be a non-empty array" });
  }

  // Suggest when must be array
  const suggest = def.suggest_when as unknown;
  if (!Array.isArray(suggest) || suggest.length === 0) {
    errors.push({ field: "suggest_when", message: "'suggest_when' must be a non-empty array" });
  }

  // Config template must be object
  if (def.config_template !== undefined && typeof def.config_template !== "object") {
    errors.push({ field: "config_template", message: "'config_template' must be an object" });
  }

  return errors;
}

// --- Operations ---

export function registerTool(yamlPath: string): Effect.Effect<RegistrationResult, Error> {
  return pipe(
    Effect.gen(function* () {
      const content = yield* Effect.tryPromise({
        try: () => Bun.file(yamlPath).text(),
        catch: (e) => new Error(`Failed to read YAML file: ${e}`),
      });

      const def = parseYaml(content) as Record<string, unknown>;
      const errors = validateToolDefinition(def);

      if (errors.length > 0) {
        const msg = errors.map((e) => `  ${e.field}: ${e.message}`).join("\n");
        return yield* Effect.fail(new Error(`Validation failed:\n${msg}`));
      }

      const toolId = def.id as string;

      // Check for uniqueness among existing custom tools
      const existingPath = join(CUSTOM_TOOLS_DIR, `${toolId}.yaml`);
      const exists = yield* Effect.tryPromise({
        try: () => Bun.file(existingPath).exists(),
        catch: () => new Error("Failed to check existing tool"),
      });

      if (exists) {
        return yield* Effect.fail(
          new Error(`Custom tool '${toolId}' already exists. Use --update to modify.`),
        );
      }

      // Write the validated definition
      yield* Effect.tryPromise({
        try: async () => {
          await Bun.write(existingPath, stringifyYaml(def));
        },
        catch: (e) => new Error(`Failed to write tool definition: ${e}`),
      });

      return {
        action: "register" as const,
        tool_id: toolId,
        status: "success" as const,
        accepts: def.accepts as string[],
        suggest_when: def.suggest_when as string[],
      };
    }),
  );
}

export function listTools(): Effect.Effect<RegistrationResult, Error> {
  return Effect.tryPromise({
    try: async () => {
      const entries = await readdir(CUSTOM_TOOLS_DIR, { withFileTypes: true }).catch(() => []);
      const tools: ToolSummary[] = [];

      for (const entry of entries) {
        if (!entry.isFile() || extname(entry.name) !== ".yaml") continue;
        const content = await Bun.file(join(CUSTOM_TOOLS_DIR, entry.name)).text();
        const def = parseYaml(content) as Record<string, unknown>;
        tools.push({
          id: (def.id as string) ?? entry.name.replace(".yaml", ""),
          name: (def.name as string) ?? "Unknown",
          accepts: (def.accepts as string[]) ?? [],
          suggest_when: (def.suggest_when as string[]) ?? [],
        });
      }

      return {
        action: "list" as const,
        tool_id: "*",
        status: "success" as const,
        tools,
      } satisfies RegistrationResult;
    },
    catch: (e) => new Error(`Failed to list custom tools: ${e}`),
  });
}

function removeTool(toolId: string): Effect.Effect<RegistrationResult, Error> {
  return pipe(
    Effect.gen(function* () {
      if (BUILT_IN_TOOL_IDS.includes(toolId)) {
        return yield* Effect.fail(new Error(`Cannot remove built-in tool: ${toolId}`));
      }

      const toolPath = join(CUSTOM_TOOLS_DIR, `${toolId}.yaml`);
      const exists = yield* Effect.tryPromise({
        try: () => Bun.file(toolPath).exists(),
        catch: () => new Error("Failed to check tool existence"),
      });

      if (!exists) {
        return yield* Effect.fail(new Error(`Custom tool '${toolId}' not found`));
      }

      yield* Effect.tryPromise({
        try: () => unlink(toolPath),
        catch: (e) => new Error(`Failed to remove tool: ${e}`),
      });

      return {
        action: "remove" as const,
        tool_id: toolId,
        status: "success" as const,
      };
    }),
  );
}

function updateTool(toolId: string, yamlPath: string): Effect.Effect<RegistrationResult, Error> {
  return pipe(
    Effect.gen(function* () {
      if (BUILT_IN_TOOL_IDS.includes(toolId)) {
        return yield* Effect.fail(new Error(`Cannot update built-in tool: ${toolId}`));
      }

      const toolPath = join(CUSTOM_TOOLS_DIR, `${toolId}.yaml`);
      const exists = yield* Effect.tryPromise({
        try: () => Bun.file(toolPath).exists(),
        catch: () => new Error("Failed to check tool existence"),
      });

      if (!exists) {
        return yield* Effect.fail(
          new Error(`Custom tool '${toolId}' not found. Use --register to create.`),
        );
      }

      const content = yield* Effect.tryPromise({
        try: () => Bun.file(yamlPath).text(),
        catch: (e) => new Error(`Failed to read YAML file: ${e}`),
      });

      const def = parseYaml(content) as Record<string, unknown>;

      // Ensure ID matches
      if (def.id !== toolId) {
        return yield* Effect.fail(
          new Error(`YAML id '${def.id}' does not match tool id '${toolId}'`),
        );
      }

      const errors = validateToolDefinition(def);
      if (errors.length > 0) {
        const msg = errors.map((e) => `  ${e.field}: ${e.message}`).join("\n");
        return yield* Effect.fail(new Error(`Validation failed:\n${msg}`));
      }

      yield* Effect.tryPromise({
        try: async () => {
          await Bun.write(toolPath, stringifyYaml(def));
        },
        catch: (e) => new Error(`Failed to write updated tool definition: ${e}`),
      });

      return {
        action: "update" as const,
        tool_id: toolId,
        status: "success" as const,
        accepts: def.accepts as string[],
        suggest_when: def.suggest_when as string[],
      };
    }),
  );
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    const result = yield* listTools();
    yield* Console.log(JSON.stringify(result, null, 2));
    return;
  }

  const registerIdx = args.indexOf("--register");
  if (registerIdx >= 0) {
    const yamlPath = args[registerIdx + 1];
    if (!yamlPath) return yield* Effect.fail(new Error("--register requires a YAML file path"));
    const result = yield* registerTool(yamlPath);
    yield* Console.log(JSON.stringify(result, null, 2));
    return;
  }

  const removeIdx = args.indexOf("--remove");
  if (removeIdx >= 0) {
    const toolId = args[removeIdx + 1];
    if (!toolId) return yield* Effect.fail(new Error("--remove requires a tool ID"));
    const result = yield* removeTool(toolId);
    yield* Console.log(JSON.stringify(result, null, 2));
    return;
  }

  const updateIdx = args.indexOf("--update");
  if (updateIdx >= 0) {
    const toolId = args[updateIdx + 1];
    const yamlPath = args[updateIdx + 2];
    if (!toolId || !yamlPath) {
      return yield* Effect.fail(new Error("--update requires <tool-id> <yaml-path>"));
    }
    const result = yield* updateTool(toolId, yamlPath);
    yield* Console.log(JSON.stringify(result, null, 2));
    return;
  }

  return yield* Effect.fail(
    new Error("Usage: --register <yaml> | --list | --remove <tool-id> | --update <tool-id> <yaml>"),
  );
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      pipe(
        Console.error(`Custom tool registration failed: ${error}`),
        Effect.andThen(Effect.fail(error)),
      ),
    ),
    Effect.runPromise,
  );
}
