/**
 * validate-style-consistency.ts — Cross-frame style consistency scoring.
 * Takes LLaVA 13B descriptions for all frames in a set and measures coherence.
 *
 * L3 fix: Pipeline validated each frame independently but never checked whether
 * all frames in a concept look like they belong together.
 *
 * Run: bun run .claude/skills/one-of-a-kind-design/scripts/validate-style-consistency.ts \
 *   --descriptions '["desc1","desc2",...]' --style-id "pop-art" --gate 8.0
 */

import { Effect, pipe } from "effect";

// --- Types ---

interface ConsistencyInput {
  readonly descriptions: readonly string[];
  readonly styleId: string;
  readonly brandTerms?: readonly string[];
  readonly gate: number;
}

interface ConsistencyResult {
  readonly stylePresenceRatio: number;
  readonly brandPresenceRatio: number;
  readonly paletteOverlap: number;
  readonly consistencyScore: number;
  readonly passed: boolean;
  readonly gate: number;
  readonly frameCount: number;
}

// --- Color vocabulary for palette overlap ---

const COLOR_VOCABULARY = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "cyan",
  "magenta",
  "teal",
  "gold",
  "silver",
  "black",
  "white",
  "grey",
  "gray",
  "brown",
  "cream",
  "ivory",
  "beige",
  "coral",
  "salmon",
  "maroon",
  "navy",
  "indigo",
  "violet",
  "lavender",
  "turquoise",
  "emerald",
  "amber",
  "bronze",
  "copper",
  "crimson",
  "scarlet",
  "rust",
  "sage",
  "olive",
  "mint",
  "peach",
  "burgundy",
  "charcoal",
  "slate",
  "warm",
  "cool",
  "muted",
  "vibrant",
  "pastel",
  "neon",
  "dark",
  "light",
  "bright",
  "saturated",
  "desaturated",
  "faded",
  "deep",
];

// --- Scoring Functions ---

function computeStylePresence(descriptions: readonly string[], styleId: string): number {
  if (descriptions.length === 0) return 0;
  const normalizedStyle = styleId.replace(/-/g, " ").toLowerCase();
  const styleWords = normalizedStyle.split(" ");

  let presenceCount = 0;
  for (const desc of descriptions) {
    const lower = desc.toLowerCase();
    const hasStyleName = lower.includes(normalizedStyle);
    const hasStyleWords =
      styleWords.filter((w) => lower.includes(w)).length >= Math.ceil(styleWords.length / 2);
    if (hasStyleName || hasStyleWords) presenceCount++;
  }

  return presenceCount / descriptions.length;
}

function computeBrandPresence(
  descriptions: readonly string[],
  brandTerms: readonly string[],
): number {
  if (descriptions.length === 0 || brandTerms.length === 0) return 1.0;

  let presenceCount = 0;
  for (const desc of descriptions) {
    const lower = desc.toLowerCase();
    const hasAnyBrand = brandTerms.some((term) => lower.includes(term.toLowerCase()));
    if (hasAnyBrand) presenceCount++;
  }

  return presenceCount / descriptions.length;
}

function extractColorTerms(description: string): Set<string> {
  const lower = description.toLowerCase();
  const found = new Set<string>();
  for (const color of COLOR_VOCABULARY) {
    if (lower.includes(color)) found.add(color);
  }
  return found;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 1.0;
  return intersection.size / union.size;
}

function computePaletteOverlap(descriptions: readonly string[]): number {
  if (descriptions.length < 2) return 1.0;

  const colorSets = descriptions.map(extractColorTerms);
  let totalSimilarity = 0;
  let pairCount = 0;

  for (let i = 0; i < colorSets.length; i++) {
    for (let j = i + 1; j < colorSets.length; j++) {
      totalSimilarity += jaccardSimilarity(colorSets[i], colorSets[j]);
      pairCount++;
    }
  }

  return pairCount > 0 ? totalSimilarity / pairCount : 1.0;
}

// --- Main scoring ---

export function scoreConsistency(input: ConsistencyInput): ConsistencyResult {
  const stylePresenceRatio = computeStylePresence(input.descriptions, input.styleId);
  const brandPresenceRatio = computeBrandPresence(input.descriptions, input.brandTerms ?? []);
  const paletteOverlap = computePaletteOverlap(input.descriptions);

  const consistencyScore =
    5.0 + stylePresenceRatio * 2.0 + brandPresenceRatio * 1.5 + paletteOverlap * 1.5;

  const clampedScore = Math.max(1, Math.min(10, Math.round(consistencyScore * 10) / 10));

  return {
    stylePresenceRatio: Math.round(stylePresenceRatio * 100) / 100,
    brandPresenceRatio: Math.round(brandPresenceRatio * 100) / 100,
    paletteOverlap: Math.round(paletteOverlap * 100) / 100,
    consistencyScore: clampedScore,
    passed: clampedScore >= input.gate,
    gate: input.gate,
    frameCount: input.descriptions.length,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const descriptionsRaw = getArg("--descriptions");
  const styleId = getArg("--style-id") ?? "editorial-minimalism";
  const gate = Number(getArg("--gate") ?? "8.0");
  const brandRaw = getArg("--brand-terms");

  if (!descriptionsRaw) {
    return yield* Effect.fail(new Error("--descriptions '<JSON array>' is required"));
  }

  const descriptions = yield* Effect.try({
    try: () => JSON.parse(descriptionsRaw) as string[],
    catch: () => new Error("Invalid JSON for --descriptions"),
  });

  const brandTerms = brandRaw
    ? yield* Effect.try({
        try: () => JSON.parse(brandRaw) as string[],
        catch: () => new Error("Invalid JSON for --brand-terms"),
      })
    : [];

  const result = scoreConsistency({
    descriptions,
    styleId,
    brandTerms,
    gate,
  });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Style consistency check failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
