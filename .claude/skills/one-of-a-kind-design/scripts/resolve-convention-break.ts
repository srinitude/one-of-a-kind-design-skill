/**
 * resolve-convention-break.ts — Deterministic convention break selection.
 * Selects which convention break to apply based on design_variance dial.
 *
 * Run: bun run scripts/resolve-convention-break.ts --variance 8 --breaks '[...]'
 */
import { Console, Effect, pipe } from "effect";

// --- Types ---

export interface ConventionBreakSelection {
  readonly applied: boolean;
  readonly dogma: string;
  readonly breakText: string;
  readonly injectionPoint: "prompt-prefix" | "prompt-suffix" | "negative-boost";
  readonly reason: string;
}

interface ConventionBreakEntry {
  readonly dogma: string;
  readonly break: string;
}

// --- Core Logic ---

export function resolveConventionBreak(
  designVariance: number,
  breaks: ReadonlyArray<ConventionBreakEntry>,
): ConventionBreakSelection {
  if (breaks.length === 0) {
    return {
      applied: false,
      dogma: "",
      breakText: "",
      injectionPoint: "prompt-suffix",
      reason: "No convention breaks defined for this style",
    };
  }

  if (designVariance < 4) {
    return {
      applied: false,
      dogma: "",
      breakText: "",
      injectionPoint: "prompt-suffix",
      reason: `design_variance ${designVariance} is below threshold (4) for convention breaks`,
    };
  }

  if (designVariance < 7) {
    const entry = breaks[0];
    return {
      applied: true,
      dogma: entry.dogma,
      breakText: entry.break,
      injectionPoint: "prompt-suffix",
      reason: `design_variance ${designVariance}: soft break, using mildest convention break`,
    };
  }

  if (designVariance < 9) {
    const idx = designVariance % breaks.length;
    const entry = breaks[idx];
    return {
      applied: true,
      dogma: entry.dogma,
      breakText: entry.break,
      injectionPoint: "prompt-suffix",
      reason: `design_variance ${designVariance}: expressive break at index ${idx}`,
    };
  }

  // 9-10: Apply ALL breaks
  const allDogmas = breaks.map((b) => b.dogma).join("; ");
  const allBreaks = breaks.map((b) => b.break).join("; ");
  return {
    applied: true,
    dogma: allDogmas,
    breakText: allBreaks,
    injectionPoint: "prompt-suffix",
    reason: `design_variance ${designVariance}: radical — all ${breaks.length} convention breaks applied`,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const variance = Number(getArg("--variance") ?? "5");
  const rawBreaks = getArg("--breaks");
  const breaks: ConventionBreakEntry[] = rawBreaks
    ? yield* Effect.try({
        try: () => JSON.parse(rawBreaks) as ConventionBreakEntry[],
        catch: () => new Error("Invalid --breaks JSON"),
      })
    : [];

  const result = resolveConventionBreak(variance, breaks);
  yield* Console.log(JSON.stringify(result, null, 2));
  return result;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Convention break resolution failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
