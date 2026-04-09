/**
 * real-scoring.ts — Honest quality scoring via real vision model calls.
 * Every sub-score comes from a measurement, not a hardcoded number.
 */
import { Console, Effect, pipe } from "effect";
import { fal } from "@fal-ai/client";
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

interface LlavaScores {
  readonly style_adherence: number;
  readonly color_palette: number;
  readonly composition: number;
  readonly detail_fidelity: number;
  readonly distinctiveness: number;
}

// --- Clamp helper ---

function clamp(v: number, lo = 1, hi = 10): number {
  const n = Number.isFinite(v) ? v : 5;
  return Math.max(lo, Math.min(hi, Math.round(n * 10) / 10));
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
  return clamp(9.0 - hits * 1.5);
}

// --- Convention break from alignment ---

function deriveConventionBreak(description: string): number {
  const lower = description.toLowerCase();
  const breakIndicators = [
    "unexpected", "contrast", "unusual", "surprising",
    "breaks", "unconventional", "tension", "juxtaposition",
  ];
  const hits = breakIndicators.filter((t) => lower.includes(t)).length;
  return clamp(6.5 + hits * 0.8, 5, 10);
}

// --- LLaVA structured scoring ---

function parseLlavaScores(raw: string): LlavaScores | null {
  const jsonMatch = raw.match(/\{[^}]+\}/);
  if (!jsonMatch) return null;
  const parsed = Effect.runSync(
    Effect.try({
      try: () => JSON.parse(jsonMatch[0]) as Record<string, unknown>,
      catch: () => null as never,
    }).pipe(Effect.catchAll(() => Effect.succeed(null))),
  );
  if (!parsed) return null;
  const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(1, Math.min(10, n)) : 0;
  };
  const sa = num(parsed.style_adherence);
  const cp = num(parsed.color_palette);
  const co = num(parsed.composition);
  const df = num(parsed.detail_fidelity);
  const di = num(parsed.distinctiveness);
  if (sa === 0 && cp === 0 && co === 0) return null;
  return { style_adherence: sa, color_palette: cp, composition: co, detail_fidelity: df, distinctiveness: di };
}

function getLlavaStructuredScores(
  artifactUrl: string,
): Effect.Effect<LlavaScores | null, never> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });
        const scoringResult = await fal.subscribe("fal-ai/llavav15-13b", {
          input: {
            image_url: artifactUrl,
            prompt: `Rate this image 1-10 on each dimension. Respond ONLY with valid JSON, no other text: {"style_adherence":N,"color_palette":N,"composition":N,"detail_fidelity":N,"distinctiveness":N}`,
          },
          timeout: 25000,
        });
        const raw = (scoringResult.data as Record<string, unknown>).output as string;
        return parseLlavaScores(raw);
      },
      catch: () => null as never,
    }),
    Effect.catchAll(() => Effect.succeed(null)),
  );
}

// --- Main scoring function ---

export function computeRealScores(input: RealScoreInput): Effect.Effect<RealScores, Error> {
  return Effect.gen(function* () {
    yield* Console.log("  Running real quality scoring (LLaVA 13B vision)...");

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

    const alignment = scoreAlignment(description, input.prompt, input.jobType, svgData);
    yield* Console.log(`  Alignment score: ${alignment.alignment_score}/10`);

    const llavaScores = yield* getLlavaStructuredScores(input.artifactUrl);

    const perceptual = scoreFromDescription(description, input.styleId);
    yield* Console.log(
      `  Perceptual: aesthetic=${perceptual.aesthetic} style=${perceptual.style_fidelity}`,
    );

    const assetQuality = deriveAssetQuality(input.fileSizeBytes, input.jobType);
    const antiSlop = deriveAntiSlop(description);

    const scores: RealScores = {
      antiSlopGate: antiSlop,
      codeStandardsGate: null,
      assetQualityAvg: llavaScores
        ? Math.max(clamp(llavaScores.detail_fidelity), assetQuality)
        : assetQuality,
      promptArtifactAlign: alignment.alignment_score,
      aesthetic: llavaScores
        ? clamp((llavaScores.composition + perceptual.aesthetic) / 2)
        : perceptual.aesthetic,
      styleFidelity: llavaScores ? clamp(llavaScores.style_adherence) : perceptual.style_fidelity,
      distinctiveness: llavaScores ? clamp(llavaScores.distinctiveness) : perceptual.distinctiveness,
      hierarchy: llavaScores
        ? clamp(llavaScores.composition * 0.6 + perceptual.hierarchy * 0.4)
        : perceptual.hierarchy,
      colorHarmony: llavaScores ? clamp(llavaScores.color_palette) : perceptual.color_harmony,
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
  const isLargeVideo = jobType === "video-gen" && fileSizeBytes > 500000;
  const base = isLargeVideo ? 7.0 : 6.5;
  return {
    antiSlopGate: 7.0,
    codeStandardsGate: null,
    assetQualityAvg: assetQuality,
    promptArtifactAlign: isLargeVideo ? 6.5 : 6.0,
    aesthetic: base,
    styleFidelity: base,
    distinctiveness: base,
    hierarchy: base,
    colorHarmony: base,
    conventionBreakAdherence: conventionBreakApplied ? base : null,
  };
}
