/**
 * resolve-audience-fit.ts — Deterministic audience-style fit scoring.
 * String matching against audience_market_fit arrays. No randomness.
 *
 * Run: bun run scripts/resolve-audience-fit.ts --audience "luxury SaaS" --fit '{"strong":[...],"unexpected":[...]}'
 */
import { Console, Effect, pipe } from "effect";

// --- Types ---

export interface AudienceFitResult {
  readonly fitType: "strong" | "unexpected" | "neutral";
  readonly fitScore: number;
  readonly adjustments: string[];
  readonly audienceNote: string;
}

interface AudienceMarketFit {
  readonly strong: string[];
  readonly unexpected: string[];
}

// --- Core Logic ---

function matchesAny(query: string, candidates: ReadonlyArray<string>): boolean {
  const lower = query.toLowerCase();
  return candidates.some((c) => c.toLowerCase() === lower);
}

export function resolveAudienceFit(
  audience: string,
  marketFit: AudienceMarketFit,
): AudienceFitResult {
  if (matchesAny(audience, marketFit.strong)) {
    return {
      fitType: "strong",
      fitScore: 9,
      adjustments: [`Lean into proven pairing: ${audience}`],
      audienceNote: `Strong audience fit: "${audience}" is a natural match for this style`,
    };
  }

  if (matchesAny(audience, marketFit.unexpected)) {
    return {
      fitType: "unexpected",
      fitScore: 7,
      adjustments: [
        `Unexpected pairing: ${audience} — emphasize contrast and surprise`,
        "Add explanatory context for why this unusual combination works",
      ],
      audienceNote: `Unexpected but valid pairing: "${audience}" creates productive tension with this style`,
    };
  }

  return {
    fitType: "neutral",
    fitScore: 5,
    adjustments: [],
    audienceNote: `Neutral fit: "${audience}" has no specific affinity with this style`,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const audience = getArg("--audience") ?? "";
  const rawFit = getArg("--fit");
  const fit: AudienceMarketFit = rawFit
    ? yield* Effect.try({
        try: () => JSON.parse(rawFit) as AudienceMarketFit,
        catch: () => new Error("Invalid --fit JSON"),
      })
    : { strong: [], unexpected: [] };

  const result = resolveAudienceFit(audience, fit);
  yield* Console.log(JSON.stringify(result, null, 2));
  return result;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Audience fit resolution failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
