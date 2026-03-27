/**
 * optimize-assets.ts — Asset compression and optimization.
 * Handles images (via ffmpeg), video (via ffmpeg), and SVG (path optimization, minification).
 *
 * Run: bun run scripts/optimize-assets.ts --input "..." --output "..." --type "image"
 */

import { readFile, stat, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { Console, Effect, pipe } from "effect";

// --- Types ---

type AssetType = "image" | "video" | "svg";

interface OptimizeResult {
  readonly input_size: number;
  readonly output_size: number;
  readonly compression_ratio: number;
}

// --- Image Optimization (via ffmpeg) ---

export function optimizeImage(input: string, output: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const ext = extname(output).toLowerCase();
      const args: string[] = ["-i", input, "-y"];

      if (ext === ".webp") {
        args.push("-quality", "85", "-compression_level", "6", output);
      } else if (ext === ".jpg" || ext === ".jpeg") {
        args.push("-q:v", "4", output);
      } else if (ext === ".png") {
        args.push("-compression_level", "9", output);
      } else {
        // Default: convert to webp for best compression
        args.push("-quality", "85", output);
      }

      const proc = Bun.spawn(["ffmpeg", ...args], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        // Fallback: simple file copy if ffmpeg fails
        Effect.runSync(
          Console.log(
            `ffmpeg exit ${exitCode}, falling back to copy. stderr: ${stderr.slice(0, 200)}`,
          ),
        );
        const content = await Bun.file(input).arrayBuffer();
        await Bun.write(output, content);
      }
    },
    catch: (e) => new Error(`Image optimization failed: ${e}`),
  });
}

// --- Video Optimization (via ffmpeg) ---

export function optimizeVideo(input: string, output: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const ext = extname(output).toLowerCase();
      const args: string[] = ["-i", input, "-y"];

      if (ext === ".mp4") {
        args.push(
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "23",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-movflags",
          "+faststart",
          output,
        );
      } else if (ext === ".webm") {
        args.push(
          "-c:v",
          "libvpx-vp9",
          "-crf",
          "30",
          "-b:v",
          "0",
          "-c:a",
          "libopus",
          "-b:a",
          "128k",
          output,
        );
      } else {
        args.push("-c:v", "libx264", "-crf", "23", output);
      }

      const proc = Bun.spawn(["ffmpeg", ...args], {
        stdout: "pipe",
        stderr: "pipe",
      });
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        Effect.runSync(
          Console.log(
            `ffmpeg exit ${exitCode}, falling back to copy. stderr: ${stderr.slice(0, 200)}`,
          ),
        );
        const content = await Bun.file(input).arrayBuffer();
        await Bun.write(output, content);
      }
    },
    catch: (e) => new Error(`Video optimization failed: ${e}`),
  });
}

// --- SVG Optimization ---

export function optimizeSvg(input: string, output: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const content = await readFile(input, "utf-8");
      const optimized = performSvgOptimization(content);
      await writeFile(output, optimized, "utf-8");
    },
    catch: (e) => new Error(`SVG optimization failed: ${e}`),
  });
}

export function performSvgOptimization(svg: string): string {
  let result = svg;

  // Remove XML comments
  result = result.replace(/<!--[\s\S]*?-->/g, "");

  // Remove XML processing instructions
  result = result.replace(/<\?xml[^?]*\?>/g, "");

  // Remove metadata elements
  result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");

  // Remove editor-specific attributes
  result = result.replace(/\s+(inkscape|sodipodi|xmlns:inkscape|xmlns:sodipodi)[^=]*="[^"]*"/g, "");

  // Remove empty groups
  result = result.replace(/<g>\s*<\/g>/g, "");

  // Collapse whitespace in attributes
  result = result.replace(/\s+/g, " ");

  // Optimize path data: remove redundant spaces
  result = result.replace(/d="([^"]*)"/g, (_match, pathData: string) => {
    const optimized = pathData
      .replace(/\s+/g, " ")
      .replace(/\s*([MLHVCSQTAZ])\s*/gi, "$1")
      .replace(/,\s+/g, ",")
      .trim();
    return `d="${optimized}"`;
  });

  // Remove unnecessary whitespace between tags
  result = result.replace(/>\s+</g, "><");

  // Restore minimal newlines for readability at top level
  result = result.replace(/(<svg)/g, "\n$1");
  result = result.replace(/(<\/svg>)/g, "\n$1");

  // Trim leading/trailing whitespace
  result = result.trim();

  // Shorten color hex codes where possible (#aabbcc -> #abc)
  result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, "#$1$2$3");

  // Remove default attribute values
  result = result.replace(/\s+fill-opacity="1"/g, "");
  result = result.replace(/\s+stroke-opacity="1"/g, "");
  result = result.replace(/\s+opacity="1"/g, "");
  result = result.replace(/\s+fill-rule="nonzero"/g, "");

  return result;
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const inputPath = getArg("--input");
  const outputPath = getArg("--output");
  const assetType = (getArg("--type") ?? inferType(inputPath ?? "")) as AssetType;

  if (!inputPath) return yield* Effect.fail(new Error("--input is required"));
  if (!outputPath) return yield* Effect.fail(new Error("--output is required"));

  const validTypes: AssetType[] = ["image", "video", "svg"];
  if (!validTypes.includes(assetType)) {
    return yield* Effect.fail(
      new Error(`Invalid type: ${assetType}. Valid: ${validTypes.join(", ")}`),
    );
  }

  // Get input size
  const inputStat = yield* Effect.tryPromise({
    try: () => stat(inputPath),
    catch: (e) => new Error(`Input file not found: ${e}`),
  });

  // Run optimization
  if (assetType === "image") {
    yield* optimizeImage(inputPath, outputPath);
  } else if (assetType === "video") {
    yield* optimizeVideo(inputPath, outputPath);
  } else {
    yield* optimizeSvg(inputPath, outputPath);
  }

  // Get output size
  const outputStat = yield* Effect.tryPromise({
    try: () => stat(outputPath),
    catch: (e) => new Error(`Output file not created: ${e}`),
  });

  const result: OptimizeResult = {
    input_size: inputStat.size,
    output_size: outputStat.size,
    compression_ratio:
      inputStat.size > 0 ? Math.round((1 - outputStat.size / inputStat.size) * 10000) / 100 : 0,
  };

  yield* Console.log(JSON.stringify(result, null, 2));
});

function inferType(path: string): AssetType {
  const ext = extname(path).toLowerCase();
  const videoExts = new Set([".mp4", ".webm", ".avi", ".mov", ".mkv"]);
  const svgExts = new Set([".svg"]);
  if (videoExts.has(ext)) return "video";
  if (svgExts.has(ext)) return "svg";
  return "image";
}

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Asset optimization failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
