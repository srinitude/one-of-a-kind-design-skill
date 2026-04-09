/**
 * resolve-style.ts — Intent → style config resolution.
 * Consults AUDIENCE-ROUTES, CONFLICT-MAP, and taxonomy style_profiles.
 * Supports dial overrides and pairing validation.
 *
 * Run: bun run scripts/resolve-style.ts --style "cinematic" --formality 8
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import type { DialModifiers } from "./apply-dials";
import { applyDials } from "./apply-dials";
import type { AudienceFitResult } from "./resolve-audience-fit";
import { resolveAudienceFit } from "./resolve-audience-fit";
import type { ConventionBreakSelection } from "./resolve-convention-break";
import { resolveConventionBreak } from "./resolve-convention-break";

// --- Types ---

interface ResolvedStyle {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly tags: string[];
  readonly designSystemParameters: Record<string, string>;
  readonly dials: Record<string, number>;
  readonly fontSelection: Record<string, string>;
  readonly motionSignature: string;
  readonly motionCharacter: string;
  readonly premiumPatterns: string[];
  readonly antiSlopOverrides: string[];
  readonly generativeAi: {
    positivePrompt: string;
    negativePrompt: string;
    recommendedImageModels: string[];
    recommendedVideoModels: string[];
  };
  readonly conventionBreaks: Array<{ dogma: string; break: string }>;
  readonly audienceMarketFit: { strong: string[]; unexpected: string[] };
  readonly dialModifiers: DialModifiers;
  readonly conventionBreak: ConventionBreakSelection;
  readonly audienceFit: AudienceFitResult;
}

interface StyleResolutionInput {
  readonly styleId?: string;
  readonly industry?: string;
  readonly mood?: string[];
  readonly audience?: string;
  readonly dialOverrides?: Record<string, number>;
}

// --- Taxonomy Loader ---

const loadTaxonomy = () =>
  Effect.tryPromise({
    try: async () => {
      const taxonomyPath = new URL("../references/TAXONOMY.yaml", import.meta.url).pathname;
      const content = await Bun.file(taxonomyPath).text();
      return parseYaml(content) as Record<string, unknown>;
    },
    catch: (e) => new Error(`Failed to load taxonomy: ${e}`),
  });

function findStyleById(
  taxonomy: Record<string, unknown>,
  styleId: string,
): Record<string, unknown> | null {
  const categories = taxonomy.categories as Array<Record<string, unknown>>;
  for (const cat of categories) {
    const styles = cat.styles as Array<Record<string, unknown>>;
    for (const style of styles) {
      if (style.id === styleId) {
        return { ...style, category_name: cat.category_name };
      }
    }
  }
  return null;
}

function findStyleProfile(
  taxonomy: Record<string, unknown>,
  styleId: string,
): Record<string, unknown> | null {
  const impl = taxonomy.implementation as Record<string, unknown> | undefined;
  if (!impl?.style_profiles) return null;
  const profiles = impl.style_profiles as Array<Record<string, unknown>>;
  return profiles.find((p) => p.style_id === styleId) ?? null;
}

function findImplIntelProfile(
  taxonomy: Record<string, unknown>,
  styleId: string,
): Record<string, unknown> | null {
  const intel = taxonomy.implementation_intelligence as Record<string, unknown> | undefined;
  if (!intel?.style_implementations) return null;
  const impls = intel.style_implementations as Array<Record<string, unknown>>;
  return impls.find((p) => p.style_id === styleId) ?? null;
}

export function checkConflicts(
  taxonomy: Record<string, unknown>,
  styleA: string,
  styleB: string,
): { isHard: boolean; isSoft: boolean; detail: string } {
  const conflicts = taxonomy.conflicts as Record<string, unknown> | undefined;
  if (!conflicts) return { isHard: false, isSoft: false, detail: "" };

  const hard = (conflicts.hard as Array<Record<string, unknown>>) ?? [];
  const soft = (conflicts.soft as Array<Record<string, unknown>>) ?? [];

  const hardMatch = hard.find(
    (c) =>
      (c.style_a === styleA && c.style_b === styleB) ||
      (c.style_a === styleB && c.style_b === styleA),
  );
  if (hardMatch) {
    return { isHard: true, isSoft: false, detail: hardMatch.reason as string };
  }

  const softMatch = soft.find(
    (c) =>
      (c.style_a === styleA && c.style_b === styleB) ||
      (c.style_a === styleB && c.style_b === styleA),
  );
  if (softMatch) {
    return {
      isHard: false,
      isSoft: true,
      detail: `${softMatch.condition} — ${softMatch.compromise}`,
    };
  }

  return { isHard: false, isSoft: false, detail: "" };
}

// --- Resolution ---

export const resolveStyle = (
  taxonomy: Record<string, unknown>,
  input: StyleResolutionInput,
): Effect.Effect<ResolvedStyle, Error> => {
  const styleId = input.styleId ?? inferStyleFromContext(taxonomy, input);
  const style = findStyleById(taxonomy, styleId);
  if (!style) return Effect.fail(new Error(`Style not found: ${styleId}`));

  const profile = findStyleProfile(taxonomy, styleId);
  const intelProfile = findImplIntelProfile(taxonomy, styleId);
  const dsp = style.design_system_parameters as Record<string, string>;
  const genAi = style.generative_ai as Record<string, unknown>;
  const tags = style.tags as string[];

  const baseDials = (profile?.dials ??
    intelProfile?.default_dials ?? {
      design_variance: 5,
      motion_intensity: 5,
      visual_density: 5,
      audience_formality: 5,
    }) as Record<string, number>;

  const dials = { ...baseDials, ...input.dialOverrides };

  const fontSelection = (intelProfile?.typography ?? profile?.font_selection ?? {}) as Record<
    string,
    string
  >;

  const motionSig = (profile?.motion_signature ??
    intelProfile?.motion_character ??
    "spring_physics") as string;

  const motionChar = (intelProfile?.motion_character ?? profile?.motion_signature ?? "") as string;

  const premiumPatterns = (profile?.premium_patterns ??
    intelProfile?.premium_component_patterns ??
    []) as string[];

  const antiSlop = (intelProfile?.anti_slop_overrides ?? []) as string[];

  const conventionBreaks = (
    (profile?.convention_breaks ?? []) as Array<Record<string, string>>
  ).map((c) => ({
    dogma: c.dogma ?? "",
    break: c.break ?? "",
  }));

  const marketFit = (profile?.audience_market_fit ?? {
    strong: [],
    unexpected: [],
  }) as { strong: string[]; unexpected: string[] };

  const dialModifiers = applyDials(dials, conventionBreaks);
  const conventionBreak = resolveConventionBreak(dials.design_variance ?? 5, conventionBreaks);
  const audienceFit = resolveAudienceFit(input.audience ?? "", marketFit);

  return Effect.succeed({
    id: styleId,
    name: style.name as string,
    category: style.category_name as string,
    tags,
    designSystemParameters: dsp,
    dials,
    fontSelection,
    motionSignature: motionSig,
    motionCharacter: motionChar,
    premiumPatterns,
    antiSlopOverrides: antiSlop,
    generativeAi: {
      positivePrompt: (genAi?.positive_prompt ?? "") as string,
      negativePrompt: (genAi?.negative_prompt ?? "") as string,
      recommendedImageModels: (genAi?.recommended_image_models ?? []) as string[],
      recommendedVideoModels: (genAi?.recommended_video_models ?? []) as string[],
    },
    conventionBreaks,
    audienceMarketFit: marketFit,
    dialModifiers,
    conventionBreak,
    audienceFit,
  });
};

export function inferStyleFromContext(
  _taxonomy: Record<string, unknown>,
  input: StyleResolutionInput,
): string {
  // Default fallback heuristics based on mood/industry
  const mood = input.mood?.[0] ?? "";
  const industry = input.industry ?? "";

  const moodMap: Record<string, string> = {
    bold: "neubrutalism",
    minimal: "editorial-minimalism",
    playful: "claymorphism",
    dark: "dark-mode-ui",
    warm: "wabi-sabi",
    futuristic: "liquid-glass",
    vintage: "retro-vintage-print",
    luxurious: "art-deco",
    raw: "brutalist-web",
  };

  const industryMap: Record<string, string> = {
    tech: "bento-ui",
    finance: "swiss-international",
    healthcare: "scandinavian-minimalism",
    ecommerce: "studio-product",
    education: "material-design",
    entertainment: "vaporwave",
    food: "art-nouveau",
    luxury: "cinematic",
    creative: "editorial-minimalism",
    real_estate: "cinematic",
  };

  return moodMap[mood] ?? industryMap[industry] ?? "editorial-minimalism";
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);

  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const taxonomy = yield* loadTaxonomy();

  const input: StyleResolutionInput = {
    styleId: getArg("--style"),
    industry: getArg("--industry"),
    mood: getArg("--mood")?.split(","),
    audience: getArg("--audience"),
    dialOverrides: getArg("--dials")
      ? yield* Effect.try({
          try: () => JSON.parse(getArg("--dials") ?? "{}") as Record<string, number>,
          catch: () => new Error("Invalid --dials JSON"),
        })
      : undefined,
  };

  const resolved = yield* resolveStyle(taxonomy, input);

  yield* Console.log(JSON.stringify(resolved, null, 2));

  return resolved;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Style resolution failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
