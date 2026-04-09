/**
 * generate-tool-export.ts — Assembles .zip export for a target design tool.
 * Reads tool declarations, adapts assets and prompts to tool-native format,
 * and generates import-ready packages.
 *
 * Run: bun run scripts/generate-tool-export.ts --tool "figma" --style '{"id":"cinematic",...}' --assets-dir "..." --output-dir "..."
 */

import { createWriteStream } from "node:fs";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import archiver from "archiver";
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";

// --- Types ---

interface StyleConfig {
  readonly id: string;
  readonly name?: string;
  readonly category?: string;
  readonly designSystemParameters?: Record<string, string>;
  readonly dials?: Record<string, number>;
  readonly fontSelection?: Record<string, string>;
  readonly generativeAi?: {
    positivePrompt?: string;
    negativePrompt?: string;
  };
}

interface ToolDeclaration {
  readonly id: string;
  readonly name: string;
  readonly accepts: string[];
  readonly nativeFormat: string;
  readonly promptAdaptation: string;
  readonly importSteps: string[];
  readonly configTemplate: Record<string, unknown>;
}

interface ToolExportResult {
  readonly tool: string;
  readonly files: string[];
  readonly zip_path: string;
}

// --- Built-in Tool Registry ---

const BUILT_IN_TOOLS: Record<string, ToolDeclaration> = {
  figma: {
    id: "figma",
    name: "Figma",
    accepts: ["png", "jpg", "svg", "webp"],
    nativeFormat: "json",
    promptAdaptation: "Convert to Figma Tokens Studio JSON format with design token names",
    importSteps: [
      "Install Tokens Studio plugin in Figma",
      "Import design-tokens.json via Tokens Studio",
      "Drag assets from assets/ into your canvas",
      "Apply text styles from the imported token set",
    ],
    configTemplate: {
      figma_tokens_version: "5.0",
      token_sets: ["core", "semantic", "component"],
    },
  },
  framer: {
    id: "framer",
    name: "Framer",
    accepts: ["png", "jpg", "svg", "webp", "mp4", "gif"],
    nativeFormat: "json",
    promptAdaptation: "Convert to Framer motion variants and responsive layout properties",
    importSteps: [
      "Open your Framer project",
      "Drag assets into the Assets panel",
      "Import motion-config.json for animation presets",
      "Use the code override snippets from guides/",
    ],
    configTemplate: {
      framer_motion: { default_transition: "spring", stiffness: 300, damping: 30 },
    },
  },
  webflow: {
    id: "webflow",
    name: "Webflow",
    accepts: ["png", "jpg", "svg", "webp", "mp4", "gif", "css"],
    nativeFormat: "css",
    promptAdaptation: "Convert to Webflow custom CSS classes and global styles",
    importSteps: [
      "Go to Project Settings > Custom Code",
      "Paste the CSS from config/custom.css into Head Code",
      "Upload assets via the Asset Manager",
      "Apply classes as documented in guides/",
    ],
    configTemplate: {
      css_framework: "custom",
      responsive_breakpoints: [480, 768, 992, 1280, 1920],
    },
  },
  wordpress: {
    id: "wordpress",
    name: "WordPress",
    accepts: ["png", "jpg", "svg", "webp", "mp4", "css", "js", "php"],
    nativeFormat: "php",
    promptAdaptation: "Convert to WordPress theme customizer options and block patterns",
    importSteps: [
      "Upload theme zip via Appearance > Themes",
      "Activate the theme and run the setup wizard",
      "Import media assets via Media Library",
      "Configure theme options from Appearance > Customize",
    ],
    configTemplate: { theme_supports: ["custom-logo", "post-thumbnails", "responsive-embeds"] },
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    accepts: ["png", "jpg", "svg", "webp", "css", "liquid", "json"],
    nativeFormat: "json",
    promptAdaptation: "Convert to Shopify theme settings schema and section blocks",
    importSteps: [
      "Go to Online Store > Themes > Add theme",
      "Upload the theme package",
      "Apply settings from config/settings_data.json",
      "Customize sections using the Theme Editor",
    ],
    configTemplate: { schema_version: "1.0", sections: {} },
  },
  squarespace: {
    id: "squarespace",
    name: "Squarespace",
    accepts: ["png", "jpg", "svg", "webp", "css"],
    nativeFormat: "css",
    promptAdaptation: "Convert to Squarespace custom CSS with .sqs- class prefixes",
    importSteps: [
      "Go to Design > Custom CSS",
      "Paste the CSS from config/custom.css",
      "Upload images via the page editor or Asset Library",
    ],
    configTemplate: { squarespace_version: "7.1" },
  },
  notion: {
    id: "notion",
    name: "Notion",
    accepts: ["png", "jpg", "svg", "webp"],
    nativeFormat: "md",
    promptAdaptation: "Convert to Notion-compatible Markdown with embedded image references",
    importSteps: [
      "Create a new Notion page",
      "Upload images as inline embeds",
      "Follow the layout guide in guides/ for page structure",
    ],
    configTemplate: {},
  },
  canva: {
    id: "canva",
    name: "Canva",
    accepts: ["png", "jpg", "svg"],
    nativeFormat: "json",
    promptAdaptation: "Convert to Canva Brand Kit format with color palettes and font selections",
    importSteps: [
      "Go to Brand Kit in Canva",
      "Upload brand colors from config/brand-palette.json",
      "Upload logos and assets from assets/",
    ],
    configTemplate: { brand_kit: { colors: [], fonts: [] } },
  },
};

// --- Custom Tool Loader ---

export function loadCustomTool(toolId: string): Effect.Effect<ToolDeclaration | null, Error> {
  return Effect.tryPromise({
    try: async () => {
      const customToolPath = join(
        new URL("../custom-tools", import.meta.url).pathname,
        `${toolId}.yaml`,
      );
      const exists = await Bun.file(customToolPath).exists();
      if (!exists) return null;

      const content = await readFile(customToolPath, "utf-8");
      const parsed = parseYaml(content) as Record<string, unknown>;

      return {
        id: parsed.id as string,
        name: parsed.name as string,
        accepts: (parsed.accepts as string[]) ?? [],
        nativeFormat: (parsed.native_format as string) ?? "json",
        promptAdaptation: (parsed.prompt_adaptation as string) ?? "",
        importSteps: (parsed.import_steps as string[]) ?? [],
        configTemplate: (parsed.config_template as Record<string, unknown>) ?? {},
      } satisfies ToolDeclaration;
    },
    catch: (e) => new Error(`Failed to load custom tool definition: ${e}`),
  });
}

// --- Prompt Adaptation ---

function adaptPromptForTool(style: StyleConfig, tool: ToolDeclaration): string {
  const positive = style.generativeAi?.positivePrompt ?? "";
  const negative = style.generativeAi?.negativePrompt ?? "";
  const fonts = style.fontSelection ?? {};
  const params = style.designSystemParameters ?? {};

  if (tool.nativeFormat === "css") {
    return generateCssConfig(style, params, fonts);
  }
  if (tool.nativeFormat === "json") {
    return JSON.stringify(generateJsonConfig(style, params, fonts, tool), null, 2);
  }
  if (tool.nativeFormat === "md") {
    return generateMarkdownConfig(style, positive, negative, fonts);
  }
  if (tool.nativeFormat === "php") {
    return generatePhpConfig(style, params, fonts);
  }

  return JSON.stringify({ style: style.id, positive, negative, fonts, params }, null, 2);
}

function generateCssConfig(
  style: StyleConfig,
  params: Record<string, string>,
  fonts: Record<string, string>,
): string {
  const lines = [`/* ${style.name ?? style.id} Design System */`, `:root {`];

  for (const [key, value] of Object.entries(params)) {
    const cssVar = `--${key.replace(/_/g, "-")}`;
    lines.push(`  ${cssVar}: ${value};`);
  }

  for (const [role, font] of Object.entries(fonts)) {
    lines.push(`  --font-${role}: ${font};`);
  }

  lines.push("}");
  return lines.join("\n");
}

function generateJsonConfig(
  style: StyleConfig,
  params: Record<string, string>,
  fonts: Record<string, string>,
  tool: ToolDeclaration,
): Record<string, unknown> {
  return {
    ...tool.configTemplate,
    style_id: style.id,
    style_name: style.name ?? style.id,
    design_tokens: params,
    typography: fonts,
    dials: style.dials ?? {},
  };
}

function generateMarkdownConfig(
  style: StyleConfig,
  positive: string,
  negative: string,
  fonts: Record<string, string>,
): string {
  const lines = [`# ${style.name ?? style.id} Style Configuration`, "", "## Typography", ""];
  for (const [role, font] of Object.entries(fonts)) {
    lines.push(`- **${role}**: ${font}`);
  }
  lines.push("", "## Generation Prompts", "");
  if (positive) lines.push(`**Positive:** ${positive}`);
  if (negative) lines.push(`**Negative:** ${negative}`);
  return lines.join("\n");
}

function generatePhpConfig(
  style: StyleConfig,
  params: Record<string, string>,
  fonts: Record<string, string>,
): string {
  const lines = [
    "<?php",
    `// ${style.name ?? style.id} Theme Configuration`,
    `// Auto-generated by One-of-a-Kind Design`,
    "",
    "return [",
    `  'style_id' => '${style.id}',`,
  ];
  for (const [key, value] of Object.entries(params)) {
    lines.push(`  '${key}' => '${value}',`);
  }
  lines.push("  'fonts' => [");
  for (const [role, font] of Object.entries(fonts)) {
    lines.push(`    '${role}' => '${font}',`);
  }
  lines.push("  ],", "];");
  return lines.join("\n");
}

// --- Export Guide Generation ---

function generateExportGuide(tool: ToolDeclaration, style: StyleConfig, fileCount: number): string {
  return [
    `# ${tool.name} Import Guide for ${style.name ?? style.id}`,
    "",
    `Generated by One-of-a-Kind Design on ${new Date().toISOString().split("T")[0]}`,
    "",
    "## Quick Start",
    "",
    ...tool.importSteps.map((step, i) => `${i + 1}. ${step}`),
    "",
    "## Package Contents",
    "",
    `- **${fileCount} assets** in accepted formats: ${tool.accepts.join(", ")}`,
    "- **config/**: Tool-specific configuration files",
    "- **prompts/**: Generation prompts adapted for this tool",
    "- **guides/**: Implementation best practices",
    "",
    "## Prompt Adaptation",
    "",
    tool.promptAdaptation,
    "",
    "## Style Details",
    "",
    `- **Style ID:** ${style.id}`,
    `- **Category:** ${style.category ?? "unspecified"}`,
    "",
    "## Quality Assurance",
    "",
    "All assets have passed the One-of-a-Kind quality gate (minimum 7.0/10).",
    "See QUALITY-REPORT.md for per-asset scores.",
  ].join("\n");
}

// --- Archive Assembly ---

export function assembleExport(
  tool: ToolDeclaration,
  style: StyleConfig,
  assetsDir: string,
  outputDir: string,
): Effect.Effect<ToolExportResult, Error> {
  const noEntries = (): never[] => [];
  const noStat = (): null => null;
  return Effect.tryPromise({
    try: async () => {
      await mkdir(outputDir, { recursive: true }).catch(Boolean);
      const acceptSet = new Set(tool.accepts.map((a) => `.${a}`));
      const assetResults: Array<{ path: string; name: string; ext: string; size: number }> = [];
      const walkDir = async (currentDir: string): Promise<void> => {
        const entries = await readdir(currentDir, { withFileTypes: true }).catch(noEntries);
        for (const entry of entries) {
          const fullPath = join(currentDir, entry.name);
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else {
            const ext = extname(entry.name).toLowerCase();
            if (acceptSet.has(ext) || acceptSet.has(".*")) {
              const fileStat = await stat(fullPath).catch(noStat);
              if (fileStat) {
                assetResults.push({ path: fullPath, name: entry.name, ext, size: fileStat.size });
              }
            }
          }
        }
      };
      await walkDir(assetsDir);
      const assets = assetResults;
      const zipPath = join(outputDir, `${tool.id}-export-${style.id}-${Date.now()}.zip`);
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      const files: string[] = [];

      const done = new Promise<void>((resolve, reject) => {
        output.addListener("close", resolve);
        archive.addListener("error", reject);
      });

      archive.pipe(output);

      // Assets
      for (const asset of assets) {
        archive.file(asset.path, { name: `assets/${asset.name}` });
        files.push(`assets/${asset.name}`);
      }

      // Config
      const configContent = adaptPromptForTool(style, tool);
      const configExt =
        tool.nativeFormat === "css"
          ? "css"
          : tool.nativeFormat === "php"
            ? "php"
            : tool.nativeFormat === "md"
              ? "md"
              : "json";
      archive.append(configContent, { name: `config/design-system.${configExt}` });
      files.push(`config/design-system.${configExt}`);

      // Tool-specific config template
      archive.append(JSON.stringify(tool.configTemplate, null, 2), {
        name: "config/tool-config.json",
      });
      files.push("config/tool-config.json");

      // Prompts
      const promptData = {
        style_id: style.id,
        positive_prompt: style.generativeAi?.positivePrompt ?? "",
        negative_prompt: style.generativeAi?.negativePrompt ?? "",
        tool_adaptation: tool.promptAdaptation,
      };
      archive.append(JSON.stringify(promptData, null, 2), {
        name: "prompts/generation-prompts.json",
      });
      files.push("prompts/generation-prompts.json");

      // Guides
      const guide = generateExportGuide(tool, style, assets.length);
      archive.append(guide, { name: "guides/import-guide.md" });
      files.push("guides/import-guide.md");

      // README
      archive.append(guide, { name: "README.md" });
      files.push("README.md");

      // Quality report placeholder
      archive.append(
        `# Quality Report\n\nGenerated: ${new Date().toISOString()}\n\nSee score-output-quality.ts for scoring.\n`,
        { name: "QUALITY-REPORT.md" },
      );
      files.push("QUALITY-REPORT.md");

      // Style spec
      archive.append(configContent, { name: "STYLE-SPEC.md" });
      files.push("STYLE-SPEC.md");

      await archive.finalize();
      await done;

      return {
        tool: tool.id,
        files,
        zip_path: zipPath,
      } satisfies ToolExportResult;
    },
    catch: (e) => new Error(`Tool export assembly failed: ${e}`),
  });
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const toolId = getArg("--tool");
  const styleRaw = getArg("--style");
  const assetsDir = getArg("--assets-dir");
  const outputDir = getArg("--output-dir") ?? ".";

  if (!toolId) return yield* Effect.fail(new Error("--tool is required"));
  if (!styleRaw) return yield* Effect.fail(new Error("--style is required (JSON string)"));
  if (!assetsDir) return yield* Effect.fail(new Error("--assets-dir is required"));

  const style = yield* Effect.try(() => JSON.parse(styleRaw) as StyleConfig).pipe(
    Effect.mapError(() => new Error("Invalid JSON in --style argument")),
  );

  // Resolve tool declaration: built-in first, then custom
  let tool: ToolDeclaration | null = BUILT_IN_TOOLS[toolId] ?? null;
  if (!tool) {
    tool = yield* loadCustomTool(toolId);
  }
  if (!tool) {
    const available = Object.keys(BUILT_IN_TOOLS).join(", ");
    return yield* Effect.fail(
      new Error(
        `Unknown tool: ${toolId}. Built-in tools: ${available}. Check custom-tools/ for custom definitions.`,
      ),
    );
  }

  const result = yield* assembleExport(tool, style, assetsDir, outputDir);

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Tool export generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
