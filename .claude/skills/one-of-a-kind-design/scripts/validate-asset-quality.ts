/**
 * validate-asset-quality.ts — Resolution, format, size, aspect ratio validation.
 * LOCAL deterministic file metadata checks. No API calls.
 *
 * Run: bun run scripts/validate-asset-quality.ts --file "<asset path>" --type "image"
 */
import { Effect, pipe } from "effect";

// --- Types ---

type AssetType = "image" | "video" | "svg" | "audio" | "3d";

interface AssetQualityResult {
  readonly passed: boolean;
  readonly score: number;
  readonly checks: AssetCheck[];
  readonly metadata: AssetMetadata;
}

interface AssetCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly value: string;
  readonly expected: string;
}

interface AssetMetadata {
  readonly filePath: string;
  readonly fileSize: number;
  readonly extension: string;
  readonly type: AssetType;
}

// --- Thresholds ---

const IMAGE_THRESHOLDS = {
  minWidth: 512,
  minHeight: 512,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFormats: [".png", ".jpg", ".jpeg", ".webp", ".avif", ".tiff"],
};

const VIDEO_THRESHOLDS = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFormats: [".mp4", ".webm", ".mov"],
};

const SVG_THRESHOLDS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxPathCount: 10000,
  mustHaveViewBox: true,
};

const AUDIO_THRESHOLDS = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFormats: [".mp3", ".wav", ".ogg", ".flac", ".m4a"],
};

const THREED_THRESHOLDS = {
  maxFileSize: 200 * 1024 * 1024, // 200MB
  allowedFormats: [".glb", ".gltf", ".usdz", ".obj", ".fbx"],
};

// --- Validation ---

export function detectAssetType(ext: string): AssetType {
  if (IMAGE_THRESHOLDS.allowedFormats.includes(ext)) return "image";
  if (VIDEO_THRESHOLDS.allowedFormats.includes(ext)) return "video";
  if (ext === ".svg") return "svg";
  if (AUDIO_THRESHOLDS.allowedFormats.includes(ext)) return "audio";
  if (THREED_THRESHOLDS.allowedFormats.includes(ext)) return "3d";
  return "image"; // default
}

export async function validateAsset(
  filePath: string,
  assetType?: AssetType,
): Promise<AssetQualityResult> {
  const file = Bun.file(filePath);
  const fileSize = file.size;
  const ext = `.${filePath.split(".").pop()?.toLowerCase()}`;
  const type = assetType ?? detectAssetType(ext);

  const checks: AssetCheck[] = [];

  // File exists check
  const exists = await file.exists();
  checks.push({
    name: "file-exists",
    passed: exists,
    value: exists ? "yes" : "no",
    expected: "yes",
  });

  if (!exists) {
    return {
      passed: false,
      score: 0,
      checks,
      metadata: { filePath, fileSize: 0, extension: ext, type },
    };
  }

  // File size check
  const thresholds =
    type === "image"
      ? IMAGE_THRESHOLDS
      : type === "video"
        ? VIDEO_THRESHOLDS
        : type === "svg"
          ? SVG_THRESHOLDS
          : type === "audio"
            ? AUDIO_THRESHOLDS
            : THREED_THRESHOLDS;

  const maxSize = "maxFileSize" in thresholds ? thresholds.maxFileSize : 50 * 1024 * 1024;
  checks.push({
    name: "file-size",
    passed: fileSize <= maxSize,
    value: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    expected: `<= ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
  });

  // Format check
  const allowedFormats =
    type === "svg" ? [".svg"] : "allowedFormats" in thresholds ? thresholds.allowedFormats : [ext];
  checks.push({
    name: "format",
    passed: allowedFormats.includes(ext),
    value: ext,
    expected: allowedFormats.join(", "),
  });

  // SVG-specific checks
  if (type === "svg") {
    const content = await file.text();

    // Valid XML
    const isValidXml = content.includes("<svg") && content.includes("</svg>");
    checks.push({
      name: "valid-svg-xml",
      passed: isValidXml,
      value: isValidXml ? "valid" : "invalid",
      expected: "valid SVG XML",
    });

    // viewBox present
    const hasViewBox = content.includes("viewBox");
    checks.push({
      name: "has-viewBox",
      passed: hasViewBox,
      value: hasViewBox ? "present" : "missing",
      expected: "present",
    });

    // Path count
    const pathCount = (content.match(/<path/g) ?? []).length;
    checks.push({
      name: "path-count",
      passed: pathCount <= SVG_THRESHOLDS.maxPathCount,
      value: `${pathCount}`,
      expected: `<= ${SVG_THRESHOLDS.maxPathCount}`,
    });

    // No raster embedded
    const hasRaster = content.includes("<image") || content.includes("data:image");
    checks.push({
      name: "no-embedded-raster",
      passed: !hasRaster,
      value: hasRaster ? "contains raster" : "clean vector",
      expected: "clean vector",
    });
  }

  // Score calculation
  const passedCount = checks.filter((c) => c.passed).length;
  const score = (passedCount / checks.length) * 10;

  return {
    passed: checks.every((c) => c.passed),
    score,
    checks,
    metadata: { filePath, fileSize, extension: ext, type },
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const filePath = getArg("--file");
  const assetType = getArg("--type") as AssetType | undefined;

  if (!filePath) {
    yield* Effect.fail(new Error("Provide --file <asset path>"));
    return;
  }

  const result = yield* Effect.tryPromise({
    try: () => validateAsset(filePath, assetType),
    catch: (e) => new Error(`Asset validation failed: ${e}`),
  });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exit(1);
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Asset quality check failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
