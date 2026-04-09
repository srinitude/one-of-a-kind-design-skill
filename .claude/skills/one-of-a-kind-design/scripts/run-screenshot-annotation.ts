/**
 * run-screenshot-annotation.ts — Screenshot draw-over with UX annotations.
 * Uses fal.ai GPT Image 1 for draw-over and LLaVA 13B for gaze detection analysis.
 *
 * Run: bun run scripts/run-screenshot-annotation.ts --screenshot "..." --annotation-prompt "..."
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

interface AnnotationInput {
  readonly screenshotUrl: string;
  readonly annotationPrompt: string;
}

interface Finding {
  readonly category: string;
  readonly observation: string;
  readonly severity: "critical" | "major" | "minor" | "suggestion";
  readonly area: string;
}

interface AnnotationResult {
  readonly annotated_url: string;
  readonly findings: Finding[];
}

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Annotation Generation ---

export function generateAnnotation(input: AnnotationInput): Effect.Effect<string, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const drawOverPrompt = [
          `You are a senior UX designer annotating a screenshot.`,
          `Draw directly on this screenshot with clear, professional annotations:`,
          `- Red circles/arrows pointing to UX issues`,
          `- Green checkmarks on well-designed elements`,
          `- Yellow highlights on areas needing improvement`,
          `- Numbered labels (1, 2, 3...) with brief notes`,
          ``,
          `Annotation focus: ${input.annotationPrompt}`,
          ``,
          `Keep annotations clear and non-overlapping. Use thin lines.`,
        ].join("\n");

        const result = await fal.subscribe("fal-ai/gpt-image-1", {
          input: {
            prompt: drawOverPrompt,
            image_url: input.screenshotUrl,
            size: "landscape_16_9",
          },
        });

        const data = result.data as Record<string, unknown>;
        const images = data.images as Array<{ url: string }> | undefined;
        return images?.[0]?.url ?? (data.url as string) ?? "";
      },
      catch: (e) => new Error(`GPT Image 1 annotation failed: ${e}`),
    }),
    Effect.retry({ schedule: retryPolicy, while: (err) => err.message.includes("429") }),
  );
}

// --- Gaze / Layout Analysis ---

export function analyzeScreenshot(
  screenshotUrl: string,
  annotationPrompt: string,
): Effect.Effect<Finding[], Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const analysisPrompt = [
          `Analyze this screenshot as a UX expert. For each area, evaluate:`,
          `1. Visual hierarchy - where does the eye go first?`,
          `2. Call-to-action visibility and placement`,
          `3. Whitespace usage and breathing room`,
          `4. Typography readability and contrast`,
          `5. Navigation clarity and affordances`,
          `6. Color usage and emotional impact`,
          `7. Mobile responsiveness concerns`,
          `8. Accessibility issues (contrast, text size)`,
          `9. Content density and scanability`,
          `10. Trust signals and social proof placement`,
          ``,
          `Context: ${annotationPrompt}`,
          ``,
          `List each finding as: [CATEGORY] | [SEVERITY: critical/major/minor/suggestion] | [AREA] | [OBSERVATION]`,
          `One finding per line. Be specific about location (top-left, hero section, etc.)`,
        ].join("\n");

        const result = await fal.subscribe("fal-ai/llavav15-13b", {
          input: { image_url: screenshotUrl, prompt: analysisPrompt },
        });

        const data = result.data as Record<string, unknown>;
        const output = (data.output as string) ?? (data.text as string) ?? "";
        return parseFindings(output);
      },
      catch: (e) => new Error(`LLaVA 13B analysis failed: ${e}`),
    }),
    Effect.retry({ schedule: retryPolicy, while: (err) => err.message.includes("429") }),
  );
}

function parseFindings(raw: string): Finding[] {
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const findings: Finding[] = [];

  for (const line of lines) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length >= 4) {
      findings.push({
        category: parts[0].replace(/[[\]]/g, "").trim(),
        severity: normalizeSeverity(parts[1]),
        area: parts[2].replace(/[[\]]/g, "").trim(),
        observation: parts[3],
      });
    } else if (parts.length >= 2) {
      findings.push({
        category: "general",
        severity: "suggestion",
        area: "unspecified",
        observation: parts.join(" ").trim(),
      });
    }
  }

  if (findings.length === 0 && raw.length > 0) {
    findings.push({
      category: "general",
      severity: "suggestion",
      area: "overall",
      observation: raw.slice(0, 500),
    });
  }

  return findings;
}

function normalizeSeverity(raw: string): Finding["severity"] {
  const lower = raw.toLowerCase().replace(/[[\]]/g, "").trim();
  if (lower.includes("critical")) return "critical";
  if (lower.includes("major")) return "major";
  if (lower.includes("minor")) return "minor";
  return "suggestion";
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const screenshotUrl = getArg("--screenshot");
  const annotationPrompt = getArg("--annotation-prompt") ?? "General UX review";

  if (!screenshotUrl) return yield* Effect.fail(new Error("--screenshot is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const [annotatedUrl, findings] = yield* Effect.all([
    generateAnnotation({ screenshotUrl, annotationPrompt }),
    analyzeScreenshot(screenshotUrl, annotationPrompt),
  ]);

  const result: AnnotationResult = { annotated_url: annotatedUrl, findings };

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Screenshot annotation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
