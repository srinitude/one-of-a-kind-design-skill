/**
 * score-output-quality.ts — Composite quality score from all validators.
 * Weighted average of 9 sub-scores. Minimum: 7.0/10. HARD STOP if below.
 *
 * Run: bun run scripts/score-output-quality.ts --scores '{"anti_slop":8.5,...}'
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface SubScores {
  readonly antiSlopGate: number;
  readonly codeStandardsGate: number;
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
  readonly weightedBreakdown: Record<
    string,
    { score: number; weight: number; contribution: number }
  >;
  readonly scoreCard: string;
}

// --- Weights ---

export const WEIGHTS: Record<keyof SubScores, number> = {
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

const MINIMUM_COMPOSITE = 7.0;

// --- Scoring ---

export function computeComposite(scores: SubScores): QualityReport {
  const breakdown: Record<string, { score: number; weight: number; contribution: number }> = {};
  let composite = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = scores[key as keyof SubScores];
    const contribution = score * weight;
    composite += contribution;
    breakdown[key] = { score, weight, contribution: Math.round(contribution * 100) / 100 };
  }

  composite = Math.round(composite * 100) / 100;
  const passed = composite >= MINIMUM_COMPOSITE;

  const scoreCard = formatScoreCard(scores, breakdown, composite, passed);

  return {
    composite,
    passed,
    minimum: MINIMUM_COMPOSITE,
    subScores: scores,
    weightedBreakdown: breakdown,
    scoreCard,
  };
}

function formatScoreCard(
  _scores: SubScores,
  breakdown: Record<string, { score: number; weight: number; contribution: number }>,
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
    const bar = "█".repeat(Math.round(entry.score)) + "░".repeat(10 - Math.round(entry.score));
    const pct = `${(entry.weight * 100).toFixed(0)}%`;
    lines.push(`║ ${label.padEnd(18)} ${bar} ${entry.score.toFixed(1)}/10 (${pct.padStart(3)}) ║`);
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
      console.log("\n" + JSON.stringify(report, null, 2));
    });
    return;
  }

  const rawScores = yield* Effect.try({
    try: () => JSON.parse(args[scoresIdx + 1]) as Record<string, number>,
    catch: () => new Error("Invalid JSON for --scores argument"),
  });
  const scores: SubScores = {
    antiSlopGate: rawScores.antiSlopGate ?? rawScores.anti_slop ?? 5,
    codeStandardsGate: rawScores.codeStandardsGate ?? rawScores.code_standards ?? 5,
    assetQualityAvg: rawScores.assetQualityAvg ?? rawScores.asset_quality ?? 5,
    promptArtifactAlign: rawScores.promptArtifactAlign ?? rawScores.prompt_align ?? 5,
    aesthetic: rawScores.aesthetic ?? 5,
    styleFidelity: rawScores.styleFidelity ?? rawScores.style_fidelity ?? 5,
    distinctiveness: rawScores.distinctiveness ?? 5,
    hierarchy: rawScores.hierarchy ?? 5,
    colorHarmony: rawScores.colorHarmony ?? rawScores.color_harmony ?? 5,
  };

  const report = computeComposite(scores);

  yield* Effect.sync(() => {
    console.log(report.scoreCard);
    console.log("\n" + JSON.stringify(report, null, 2));
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
