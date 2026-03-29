/**
 * score-output-quality.ts — Composite quality score from all validators.
 * Weighted average of 9 sub-scores. Minimum: 7.0/10. HARD STOP if below.
 *
 * L5 fix: Accepts codeStandardsGate: null for image-only workflows.
 * When null, 0.08 weight redistributes proportionally across remaining sub-scores.
 *
 * Run: bun run scripts/score-output-quality.ts --scores '{"anti_slop":8.5,...}'
 *      bun run scripts/score-output-quality.ts --scores '{"antiSlopGate":9,"codeStandardsGate":null,...}' --workflow "image-only"
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface SubScores {
  readonly antiSlopGate: number;
  readonly codeStandardsGate: number | null;
  readonly assetQualityAvg: number;
  readonly promptArtifactAlign: number;
  readonly aesthetic: number;
  readonly styleFidelity: number;
  readonly distinctiveness: number;
  readonly hierarchy: number;
  readonly colorHarmony: number;
}

interface QualityReport {
  readonly composite: number;
  readonly passed: boolean;
  readonly minimum: number;
  readonly subScores: SubScores;
  readonly workflow: "full" | "image-only";
  readonly weightedBreakdown: Record<
    string,
    { score: number | null; weight: number; contribution: number }
  >;
  readonly scoreCard: string;
}

// --- Weights ---

export const BASE_WEIGHTS: Record<string, number> = {
  antiSlopGate: 0.15,
  codeStandardsGate: 0.08,
  assetQualityAvg: 0.12,
  promptArtifactAlign: 0.15,
  aesthetic: 0.13,
  styleFidelity: 0.13,
  distinctiveness: 0.13,
  hierarchy: 0.06,
  colorHarmony: 0.05,
};

/** @deprecated Use BASE_WEIGHTS instead */
export const WEIGHTS = BASE_WEIGHTS as Record<keyof SubScores, number>;

const MINIMUM_COMPOSITE = 7.0;

// --- Weight redistribution for null sub-scores ---

function computeEffectiveWeights(scores: SubScores): Record<string, number> {
  const nullKeys: string[] = [];
  const activeKeys: string[] = [];

  for (const key of Object.keys(BASE_WEIGHTS)) {
    const value = scores[key as keyof SubScores];
    if (value === null) {
      nullKeys.push(key);
    } else {
      activeKeys.push(key);
    }
  }

  if (nullKeys.length === 0) return { ...BASE_WEIGHTS };

  const nullWeight = nullKeys.reduce((sum, k) => sum + BASE_WEIGHTS[k], 0);
  const activeTotal = activeKeys.reduce((sum, k) => sum + BASE_WEIGHTS[k], 0);

  const effective: Record<string, number> = {};
  for (const key of Object.keys(BASE_WEIGHTS)) {
    if (nullKeys.includes(key)) {
      effective[key] = 0;
    } else {
      effective[key] = BASE_WEIGHTS[key] + (BASE_WEIGHTS[key] / activeTotal) * nullWeight;
    }
  }

  return effective;
}

// --- Scoring ---

export function computeComposite(scores: SubScores): QualityReport {
  const effectiveWeights = computeEffectiveWeights(scores);
  const isImageOnly = scores.codeStandardsGate === null;
  const breakdown: Record<string, { score: number | null; weight: number; contribution: number }> =
    {};
  let composite = 0;

  for (const [key, weight] of Object.entries(effectiveWeights)) {
    const score = scores[key as keyof SubScores];
    if (score === null) {
      breakdown[key] = { score: null, weight: 0, contribution: 0 };
    } else {
      const contribution = score * weight;
      composite += contribution;
      breakdown[key] = {
        score,
        weight: Math.round(weight * 1000) / 1000,
        contribution: Math.round(contribution * 100) / 100,
      };
    }
  }

  composite = Math.round(composite * 100) / 100;
  const passed = composite >= MINIMUM_COMPOSITE;

  const scoreCard = formatScoreCard(scores, breakdown, composite, passed);

  return {
    composite,
    passed,
    minimum: MINIMUM_COMPOSITE,
    subScores: scores,
    workflow: isImageOnly ? "image-only" : "full",
    weightedBreakdown: breakdown,
    scoreCard,
  };
}

function formatScoreCard(
  _scores: SubScores,
  breakdown: Record<string, { score: number | null; weight: number; contribution: number }>,
  composite: number,
  passed: boolean,
): string {
  const lines: string[] = [
    "╔══════════════════════════════════════════╗",
    "║         QUALITY SCORE CARD               ║",
    "╠══════════════════════════════════════════╣",
  ];

  const labels: Record<string, string> = {
    antiSlopGate: "Anti-Slop Gate",
    codeStandardsGate: "Code Standards",
    assetQualityAvg: "Asset Quality",
    promptArtifactAlign: "Prompt Alignment",
    aesthetic: "Aesthetic",
    styleFidelity: "Style Fidelity",
    distinctiveness: "Distinctiveness",
    hierarchy: "Hierarchy",
    colorHarmony: "Color Harmony",
  };

  for (const [key, entry] of Object.entries(breakdown)) {
    const label = labels[key] ?? key;
    if (entry.score === null) {
      lines.push(`║ ${label.padEnd(18)} ░░░░░░░░░░  N/A  ( 0%) ║`);
    } else {
      const bar = "█".repeat(Math.round(entry.score)) + "░".repeat(10 - Math.round(entry.score));
      const pct = `${(entry.weight * 100).toFixed(0)}%`;
      lines.push(
        `║ ${label.padEnd(18)} ${bar} ${entry.score.toFixed(1)}/10 (${pct.padStart(3)}) ║`,
      );
    }
  }

  lines.push("╠══════════════════════════════════════════╣");
  lines.push(
    `║ COMPOSITE: ${composite.toFixed(2)}/10  ${passed ? "PASS" : "FAIL — HARD STOP"}${" ".repeat(passed ? 14 : 4)}║`,
  );
  lines.push(`║ Minimum:   ${MINIMUM_COMPOSITE.toFixed(1)}/10${" ".repeat(26)}║`);
  lines.push("╚══════════════════════════════════════════╝");

  return lines.join("\n");
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const scoresIdx = args.indexOf("--scores");

  if (scoresIdx < 0 || !args[scoresIdx + 1]) {
    // Demo mode with default scores
    const demoScores: SubScores = {
      antiSlopGate: 8.5,
      codeStandardsGate: 9.0,
      assetQualityAvg: 8.0,
      promptArtifactAlign: 7.5,
      aesthetic: 7.8,
      styleFidelity: 8.2,
      distinctiveness: 7.0,
      hierarchy: 7.5,
      colorHarmony: 8.0,
    };

    const report = computeComposite(demoScores);
    yield* Effect.sync(() => {
      console.log(report.scoreCard);
      console.log(`\n${JSON.stringify(report, null, 2)}`);
    });
    return;
  }

  const rawScores = yield* Effect.try({
    try: () => JSON.parse(args[scoresIdx + 1]) as Record<string, unknown>,
    catch: () => new Error("Invalid JSON for --scores argument"),
  });

  const workflowIdx = args.indexOf("--workflow");
  const isImageOnly =
    (workflowIdx >= 0 && args[workflowIdx + 1] === "image-only") ||
    rawScores.codeStandardsGate === null ||
    rawScores.code_standards === null;

  const numOrDefault = (val: unknown, fallback: number): number =>
    typeof val === "number" ? val : fallback;

  const scores: SubScores = {
    antiSlopGate: numOrDefault(rawScores.antiSlopGate ?? rawScores.anti_slop, 5),
    codeStandardsGate: isImageOnly
      ? null
      : numOrDefault(rawScores.codeStandardsGate ?? rawScores.code_standards, 5),
    assetQualityAvg: numOrDefault(rawScores.assetQualityAvg ?? rawScores.asset_quality, 5),
    promptArtifactAlign: numOrDefault(rawScores.promptArtifactAlign ?? rawScores.prompt_align, 5),
    aesthetic: numOrDefault(rawScores.aesthetic, 5),
    styleFidelity: numOrDefault(rawScores.styleFidelity ?? rawScores.style_fidelity, 5),
    distinctiveness: numOrDefault(rawScores.distinctiveness, 5),
    hierarchy: numOrDefault(rawScores.hierarchy, 5),
    colorHarmony: numOrDefault(rawScores.colorHarmony ?? rawScores.color_harmony, 5),
  };

  const report = computeComposite(scores);

  yield* Effect.sync(() => {
    console.log(report.scoreCard);
    console.log(`\n${JSON.stringify(report, null, 2)}`);
    if (!report.passed) process.exit(1);
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Quality scoring failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
