/**
 * run-ux-research.ts — Web search query structuring for UX best practices.
 * Outputs a structured query for Claude's WebSearch tool to execute.
 * This script formats the research request; actual web search is done externally.
 *
 * Run: bun run scripts/run-ux-research.ts --query "luxury hotel website UX best practices 2026"
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface UxResearchQuery {
  readonly query: string;
  readonly suggestions: string[];
}

// --- Research Categories ---

const RESEARCH_FACETS: Record<string, string[]> = {
  layout: [
    "responsive grid patterns",
    "above-the-fold content strategy",
    "whitespace utilization",
    "visual hierarchy techniques",
  ],
  typography: [
    "font pairing best practices",
    "readability standards",
    "typographic scale systems",
    "variable font usage",
  ],
  color: [
    "color psychology for target audience",
    "accessible color contrast ratios",
    "dark mode implementation",
    "color system design tokens",
  ],
  interaction: [
    "micro-interaction patterns",
    "scroll-triggered animations",
    "gesture-based navigation",
    "progressive disclosure patterns",
  ],
  navigation: [
    "mobile navigation patterns",
    "breadcrumb strategies",
    "search UX patterns",
    "information architecture",
  ],
  performance: [
    "core web vitals optimization",
    "lazy loading strategies",
    "image optimization techniques",
    "skeleton screen patterns",
  ],
  accessibility: [
    "WCAG 2.2 AA compliance",
    "screen reader optimization",
    "keyboard navigation patterns",
    "reduced motion preferences",
  ],
  conversion: [
    "CTA placement strategies",
    "form design best practices",
    "social proof patterns",
    "trust signal placement",
  ],
};

// --- Query Structuring ---

export function structureResearchQuery(rawQuery: string): UxResearchQuery {
  const queryLower = rawQuery.toLowerCase();
  const matchedFacets: string[] = [];

  for (const [facet, suggestions] of Object.entries(RESEARCH_FACETS)) {
    const facetTerms: Record<string, string[]> = {
      layout: ["layout", "grid", "spacing", "structure", "responsive"],
      typography: ["font", "type", "typography", "text", "heading"],
      color: ["color", "palette", "theme", "dark mode", "contrast"],
      interaction: ["animation", "micro", "interaction", "motion", "hover"],
      navigation: ["nav", "menu", "navigation", "breadcrumb", "search"],
      performance: ["performance", "speed", "loading", "core web vitals"],
      accessibility: ["accessible", "a11y", "wcag", "screen reader", "aria"],
      conversion: ["conversion", "cta", "form", "checkout", "funnel"],
    };
    const terms = facetTerms[facet] ?? [facet];
    if (terms.some((t) => queryLower.includes(t))) {
      matchedFacets.push(...suggestions);
    }
  }

  // Extract industry context
  const industryTerms = [
    "hotel",
    "restaurant",
    "ecommerce",
    "saas",
    "healthcare",
    "finance",
    "education",
    "real estate",
    "luxury",
    "fashion",
    "tech",
    "startup",
    "portfolio",
    "agency",
    "nonprofit",
    "media",
    "entertainment",
  ];
  const detectedIndustry = industryTerms.find((t) => queryLower.includes(t));

  // Build targeted suggestions
  const suggestions: string[] = [];

  if (detectedIndustry) {
    suggestions.push(`${detectedIndustry} website UX best practices 2026`);
    suggestions.push(`${detectedIndustry} industry design trends`);
    suggestions.push(`award-winning ${detectedIndustry} website examples`);
  }

  if (matchedFacets.length > 0) {
    suggestions.push(...matchedFacets.slice(0, 4));
  } else {
    suggestions.push(
      "modern web design UX best practices 2026",
      "award-winning website design patterns",
      "user experience research methodology",
      "conversion-optimized design principles",
    );
  }

  suggestions.push(`${rawQuery} case studies`, `${rawQuery} competitive analysis`);

  return {
    query: rawQuery,
    suggestions: [...new Set(suggestions)],
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const query = getArg("--query");
  if (!query) {
    return yield* Effect.fail(new Error("--query is required"));
  }

  const result = structureResearchQuery(query);

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`UX research query structuring failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
