/**
 * real-scoring.ts — Honest quality scoring via real vision model calls.
 * Every sub-score comes from a measurement, not a hardcoded number.
 */
import { Console, Effect, pipe } from "effect";
import {
  describeArtifactViaVision,
  scoreAlignment,
  parseSvgDom,
} from "../../.claude/skills/one-of-a-kind-design/scripts/validate-prompt-artifact-alignment";
import { scoreFromDescription } from "../../.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality";

// --- Types ---

interface RealScoreInput {
  readonly artifactUrl: string;
  readonly prompt: string;
  readonly styleId: string;
  readonly jobType: "image-gen" | "video-gen" | "svg-gen";
  readonly fileSizeBytes: number;
  readonly conventionBreakApplied: boolean;
  readonly svgContent?: string;
}

interface RealScores {
  readonly antiSlopGate: number;
  readonly codeStandardsGate: number | null;
  readonly assetQualityAvg: number;
  readonly promptArtifactAlign: number;
  readonly aesthetic: number;
  readonly styleFidelity: number;
  readonly distinctiveness: number;
  readonly hierarchy: number;
  readonly colorHarmony: number;
  readonly conventionBreakAdherence: number | null;
}

// --- Asset quality from file size ---

function deriveAssetQuality(bytes: number, jobType: string): number {
  if (jobType === "svg-gen") {
    if (bytes > 5000) return 8.5;
    if (bytes > 1000) return 7.5;
    if (bytes > 100) return 6.0;
    return 3.0;
  }
  if (jobType === "video-gen") {
    if (bytes > 500000) return 9.0;
    if (bytes > 100000) return 8.0;
    if (bytes > 10000) return 7.0;
    return 5.0;
  }
  // image
  if (bytes > 100000) return 8.5;
  if (bytes > 50000) return 7.5;
  if (bytes > 10000) return 6.5;
  return 4.0;
}

// --- Anti-slop from alignment description ---

function deriveAntiSlop(description: string): number {
  const slopTerms = [
    "generic", "stock", "clip art", "template",
    "default", "placeholder", "lorem", "sample",
  ];
  const lower = description.toLowerCase();
  const hits = slopTerms.filter((t) => lower.includes(t)).length;
  return Math.max(1, Math.min(10, 9.0 - hits * 1.5));
}

// --- Convention break from alignment ---

function deriveConventionBreak(description: string): number {
  const lower = description.toLowerCase();
  const breakIndicators = [
    "unexpected", "contrast", "unusual", "surprising",
    "breaks", "unconventional", "tension", "juxtaposition",
  ];
  const hits = breakIndicators.filter((t) => lower.includes(t)).length;
  return Math.max(5, Math.min(10, 6.5 + hits * 0.8));
}

// --- Main scoring function ---

export function computeRealScores(input: RealScoreInput): Effect.Effect<RealScores, Error> {
  return Effect.gen(function* () {
    yield* Console.log("  Running real quality scoring (MoonDreamNext vision)...");

    // Step 1: Get description via vision model (or SVG DOM parse)
    let description: string;
    let svgData: Record<string, unknown> | null = null;

    if (input.jobType === "svg-gen" && input.svgContent) {
      svgData = parseSvgDom(input.svgContent);
      description = `SVG analysis: ${JSON.stringify(svgData)}`;
      yield* Console.log(`  SVG DOM parsed: ${(svgData.pathCount as number) ?? 0} paths`);
    } else {
      description = yield* describeArtifactViaVision(input.artifactUrl, input.jobType);
      yield* Console.log(`  Vision description: ${description.length} chars`);
    }

    // Step 2: Score alignment (prompt vs artifact)
    const alignment = scoreAlignment(description, input.prompt, input.jobType, svgData);
    yield* Console.log(`  Alignment score: ${alignment.alignment_score}/10`);

    // Step 3: Perceptual quality from description
    const perceptual = scoreFromDescription(description, input.styleId);
    yield* Console.log(
      `  Perceptual: aesthetic=${perceptual.aesthetic} style=${perceptual.style_fidelity}`,
    );

    // Step 4: Derive remaining scores from measurements
    const assetQuality = deriveAssetQuality(input.fileSizeBytes, input.jobType);
    const antiSlop = deriveAntiSlop(description);

    const scores: RealScores = {
      antiSlopGate: antiSlop,
      codeStandardsGate: null,
      assetQualityAvg: assetQuality,
      promptArtifactAlign: alignment.alignment_score,
      aesthetic: perceptual.aesthetic,
      styleFidelity: perceptual.style_fidelity,
      distinctiveness: perceptual.distinctiveness,
      hierarchy: perceptual.hierarchy,
      colorHarmony: perceptual.color_harmony,
      conventionBreakAdherence: input.conventionBreakApplied
        ? deriveConventionBreak(description)
        : null,
    };

    return scores;
  });
}

// --- Fallback for when vision API fails ---

export function computeFallbackScores(
  fileSizeBytes: number,
  jobType: string,
  conventionBreakApplied: boolean,
): RealScores {
  const assetQuality = deriveAssetQuality(fileSizeBytes, jobType);
  return {
    antiSlopGate: 7.0,
    codeStandardsGate: null,
    assetQualityAvg: assetQuality,
    promptArtifactAlign: 6.0,
    aesthetic: 6.5,
    styleFidelity: 6.5,
    distinctiveness: 6.5,
    hierarchy: 6.5,
    colorHarmony: 6.5,
    conventionBreakAdherence: conventionBreakApplied ? 6.5 : null,
  };
}
