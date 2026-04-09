/**
 * apply-dials.ts — Transforms dial values into concrete prompt modifiers.
 * Pure function, fully deterministic. Lookup tables only, no randomness.
 *
 * Run: bun run scripts/apply-dials.ts --dials '{"design_variance":7,"motion_intensity":5}'
 */
import { Console, Effect, pipe } from "effect";

// --- Types ---

export interface DialModifiers {
  readonly promptPrefix: string;
  readonly promptSuffix: string;
  readonly negativeBoost: string[];
  readonly compositionOverride: string | null;
  readonly colorShift: "warmer" | "cooler" | "muted" | "saturated" | null;
  readonly typographyTier: "display-heavy" | "body-forward" | "mono-accent";
  readonly motionScale: number;
  readonly densityClass: "sparse" | "balanced" | "dense" | "maximalist";
}

interface ConventionBreakEntry {
  readonly dogma: string;
  readonly break: string;
}

// --- Helpers ---

function clampDial(value: number | undefined): number {
  if (value === undefined) return 5;
  return Math.max(1, Math.min(10, value));
}

// --- Design Variance ---

function resolveDesignVariance(
  dial: number,
  breaks: ReadonlyArray<ConventionBreakEntry>,
): { prefix: string; suffix: string; negatives: string[]; composition: string | null } {
  if (dial <= 3) {
    return {
      prefix: "conservative, faithful to style canon",
      suffix: "",
      negatives: ["no experimental", "no unexpected"],
      composition: null,
    };
  }
  if (dial <= 6) {
    return {
      prefix: "balanced creative expression",
      suffix: "",
      negatives: [],
      composition: null,
    };
  }
  if (dial <= 8) {
    const idx = breaks.length > 0 ? dial % breaks.length : -1;
    const breakText = idx >= 0 ? breaks[idx].break : "";
    return {
      prefix: "expressive, allow asymmetry",
      suffix: breakText,
      negatives: [],
      composition: null,
    };
  }
  // 9-10: Radical
  const allBreaks = breaks.map((b) => b.break).join("; ");
  return {
    prefix: "radical, cross-pollinate, unexpected pairings",
    suffix: allBreaks,
    negatives: [],
    composition: "style-atypical arrangement, asymmetric grid, unconventional hierarchy",
  };
}

// --- Motion Intensity ---

function resolveMotionIntensity(dial: number): {
  scale: number;
  negatives: string[];
  prefix: string;
} {
  if (dial <= 3) {
    return { scale: 0.3, negatives: ["no fast motion", "no shaking"], prefix: "slow cinematic" };
  }
  if (dial <= 6) {
    return { scale: 1.0, negatives: [], prefix: "" };
  }
  if (dial <= 8) {
    return { scale: 1.5, negatives: [], prefix: "intensified motion timing" };
  }
  return { scale: 2.0, negatives: [], prefix: "high-energy motion, stutter or spring physics" };
}

// --- Visual Density ---

function resolveVisualDensity(dial: number): {
  density: DialModifiers["densityClass"];
  negatives: string[];
  suffix: string;
} {
  if (dial <= 3) {
    return {
      density: "sparse",
      negatives: ["no clutter", "no busy"],
      suffix: "generous whitespace, isolated subjects",
    };
  }
  if (dial <= 6) {
    return { density: "balanced", negatives: [], suffix: "" };
  }
  if (dial <= 8) {
    return {
      density: "dense",
      negatives: [],
      suffix: "layered elements, overlapping forms, rich detail",
    };
  }
  return {
    density: "maximalist",
    negatives: [],
    suffix: "horror vacui, every surface treated, no empty space",
  };
}

// --- Audience Formality ---

function resolveAudienceFormality(dial: number): {
  tier: DialModifiers["typographyTier"];
  color: DialModifiers["colorShift"];
  suffix: string;
} {
  if (dial <= 3) {
    return { tier: "mono-accent", color: "cooler", suffix: "raw, unfinished, approachable" };
  }
  if (dial <= 6) {
    return { tier: "body-forward", color: null, suffix: "" };
  }
  if (dial <= 8) {
    return { tier: "display-heavy", color: "warmer", suffix: "refined, polished, considered" };
  }
  return {
    tier: "display-heavy",
    color: null,
    suffix: "luxurious, bespoke, elevated, museum-quality",
  };
}

// --- Main ---

export function applyDials(
  dials: Record<string, number | undefined>,
  conventionBreaks: ReadonlyArray<ConventionBreakEntry>,
): DialModifiers {
  const dv = clampDial(dials.design_variance);
  const mi = clampDial(dials.motion_intensity);
  const vd = clampDial(dials.visual_density);
  const af = clampDial(dials.audience_formality);

  const variance = resolveDesignVariance(dv, conventionBreaks);
  const motion = resolveMotionIntensity(mi);
  const density = resolveVisualDensity(vd);
  const formality = resolveAudienceFormality(af);

  const prefixParts = [variance.prefix, motion.prefix].filter(Boolean);
  const suffixParts = [variance.suffix, density.suffix, formality.suffix].filter(Boolean);
  const allNegatives = [...variance.negatives, ...motion.negatives, ...density.negatives];

  return {
    promptPrefix: prefixParts.join(", "),
    promptSuffix: suffixParts.join("; "),
    negativeBoost: allNegatives,
    compositionOverride: variance.composition,
    colorShift: formality.color,
    typographyTier: formality.tier,
    motionScale: motion.scale,
    densityClass: density.density,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const dialsIdx = args.indexOf("--dials");
  const rawDials =
    dialsIdx >= 0 && args[dialsIdx + 1]
      ? yield* Effect.try({
          try: () => JSON.parse(args[dialsIdx + 1]) as Record<string, number>,
          catch: () => new Error("Invalid --dials JSON"),
        })
      : {};

  const result = applyDials(rawDials, []);
  yield* Console.log(JSON.stringify(result, null, 2));
  return result;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Dial application failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
