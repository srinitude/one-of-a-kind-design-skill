/**
 * scorers/index.ts — Custom Mastra scorers for quality evaluation.
 * Uses prebuilt createContentSimilarityScorer + custom scorers via createScorer.
 */

import { createScorer } from "@mastra/core/evals";
import { createContentSimilarityScorer } from "@mastra/evals/scorers/prebuilt";
import { Effect } from "effect";

export type ScorerRef = Effect.Effect<void>;

export const designQualityScorer = createContentSimilarityScorer({
  ignoreCase: true,
  ignoreWhitespace: true,
});

export const styleConsistencyScorer = createScorer({
  id: "style-consistency-scorer",
  description: "Checks if output aligns with resolved style tokens",
  type: "agent",
})
  .preprocess((ctx) => {
    const tokens = String(ctx.run.input ?? "")
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const desc = String(ctx.run.output ?? "").toLowerCase();
    return { tokens, desc };
  })
  .generateScore((ctx) => {
    const { tokens, desc } = ctx.results.preprocessStepResult;
    const matched = tokens.filter((t: string) => desc.includes(t));
    return tokens.length > 0 ? matched.length / tokens.length : 0;
  });

export const uniquenessScorer = createScorer({
  id: "uniqueness-scorer",
  description: "Checks pHash uniqueness against library of prior generations",
  type: "agent",
})
  .preprocess((ctx) => {
    const currentHash = String(ctx.run.input ?? "");
    const raw = String(ctx.run.output ?? "[]");
    const prior = Effect.runSync(
      Effect.try({
        try: () => JSON.parse(raw) as string[],
        catch: () => new Error("parse failed"),
      }).pipe(Effect.catchAll(() => Effect.succeed([] as string[]))),
    );
    return { currentHash, prior };
  })
  .generateScore((ctx) => {
    const { currentHash, prior } = ctx.results.preprocessStepResult;
    return prior.some((h: string) => h === currentHash) ? 0 : 1;
  });
