/**
 * browser/ux-research.ts — Stagehand browser for UX research during style resolution.
 * Browses industry sites to gather UX patterns and best practices.
 */

import { StagehandBrowser } from "@mastra/stagehand";
import { Effect } from "effect";

export type BrowserRef = Effect.Effect<void>;

export const uxResearchBrowser = new StagehandBrowser({
  model: "openai/gpt-4o",
  headless: true,
});

interface UxResearchResult {
  readonly patterns: string[];
  readonly colorUsage: string[];
  readonly layoutNotes: string[];
}

export const researchIndustryUx = (industry: string, outputType: string) =>
  Effect.gen(function* () {
    const query = `${industry} ${outputType} design patterns best practices 2026`;

    yield* Effect.tryPromise({
      try: () => uxResearchBrowser.ensureReady(),
      catch: (e) => new Error(`Browser init failed: ${e}`),
    });

    yield* Effect.tryPromise({
      try: () =>
        uxResearchBrowser.navigate({
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        }),
      catch: (e) => new Error(`Navigation failed: ${e}`),
    });

    const extracted = yield* Effect.tryPromise({
      try: () =>
        uxResearchBrowser.extract({
          instruction: `Extract design patterns, color usage, and layout conventions for ${industry} ${outputType} designs`,
          schema: {
            patterns: { type: "array", items: { type: "string" } },
            colorUsage: { type: "array", items: { type: "string" } },
            layoutNotes: { type: "array", items: { type: "string" } },
          },
        }),
      catch: (e) => new Error(`Extraction failed: ${e}`),
    });

    yield* Effect.tryPromise({
      try: () => uxResearchBrowser.close(),
      catch: () => new Error("Browser close failed"),
    });

    const data =
      "data" in extracted
        ? (extracted.data as UxResearchResult)
        : (extracted as unknown as UxResearchResult);
    return data;
  });
