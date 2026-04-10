/**
 * datasets/design-test-cases.ts — Dataset creation from hundred-prompts.txt.
 * Parses each line into a typed test case item for Mastra datasets.
 */

import { Effect } from "effect";
import { z } from "zod";

export type DatasetRef = Effect.Effect<void>;

const CATEGORY_MAP: Record<string, string> = {
  websites: "website",
  "web apps": "web-app",
  images: "image",
  svg: "svg",
  videos: "video",
  "mobile apps": "mobile-app",
  "style transfers": "image",
  "multi-modal chains": "image",
};

export const inputSchema = z.object({
  userIntent: z.string(),
  outputType: z.string(),
});

export const groundTruthSchema = z.object({
  minimumComposite: z.number(),
  expectedChain: z.string().optional(),
});

interface DatasetItem {
  readonly input: { userIntent: string; outputType: string };
  readonly groundTruth: { minimumComposite: number; expectedChain?: string };
}

const parsePromptFile = (text: string): DatasetItem[] => {
  const lines = text.split("\n");
  let currentCategory = "website";
  const items: DatasetItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const categoryMatch = trimmed.match(/^#\s*(.+?)\s*\(\d+\)/);
    if (categoryMatch) {
      const key = categoryMatch[1].toLowerCase();
      currentCategory = CATEGORY_MAP[key] ?? "website";
      continue;
    }

    if (trimmed.startsWith("#")) continue;

    items.push({
      input: { userIntent: trimmed, outputType: currentCategory },
      groundTruth: { minimumComposite: 7.0 },
    });
  }

  return items;
};

export const createDesignDataset = (mastra: {
  datasets: {
    create: (
      opts: Record<string, unknown>,
    ) => Effect.Effect<{ addItems: (items: DatasetItem[]) => Effect.Effect<void> }>;
  };
}) =>
  Effect.gen(function* () {
    const promptPath = `${import.meta.dir}/../../../../../../hundred-prompts.txt`;
    const text = yield* Effect.tryPromise({
      try: () => Bun.file(promptPath).text(),
      catch: () => new Error("Failed to read hundred-prompts.txt"),
    });

    const items = parsePromptFile(text);
    const dataset = yield* mastra.datasets.create({
      name: "design-test-cases",
      description: "100+ real user invocations across all output types",
      inputSchema,
      groundTruthSchema,
    });

    yield* dataset.addItems(items);
    return { itemCount: items.length };
  });
