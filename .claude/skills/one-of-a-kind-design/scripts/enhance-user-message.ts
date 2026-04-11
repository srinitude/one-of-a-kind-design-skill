/**
 * enhance-user-message.ts — Deterministic message enrichment (<50ms).
 * Extracts 7 dimensions from user input, computes specificity score (0-7),
 * and injects design context into the message.
 *
 * Run: bun run scripts/enhance-user-message.ts --message "<user message>"
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface EnhancedMessage {
  readonly original: string;
  readonly dimensions: ExtractedDimensions;
  readonly specificity: number;
  readonly enhancement: string;
  readonly enhanced: string;
}

interface ExtractedDimensions {
  readonly outputType: string | null;
  readonly industry: string | null;
  readonly moodAestheticTags: string[];
  readonly audienceSegment: string | null;
  readonly explicitStyle: string | null;
  readonly conventionBreakingSignals: string[];
  readonly qualityEmphasis: string | null;
}

// --- Keyword Maps ---

const OUTPUT_TYPE_KEYWORDS: Record<string, string[]> = {
  website: ["website", "site", "landing page", "homepage", "web page", "webpage", "rebrand"],
  "web-app": [
    "web app",
    "webapp",
    "dashboard",
    "saas",
    "platform",
    "tool",
    "admin panel",
    "panel",
    "management tool",
  ],
  "mobile-app": [
    "mobile",
    "app screen",
    "ios",
    "android",
    "phone",
    "onboarding screen",
    "settings page",
  ],
  image: [
    "image",
    "picture",
    "photo",
    "illustration",
    "graphic",
    "poster",
    "album cover",
    "book cover",
    "product shot",
    "infographic",
    "event poster",
    "cover art",
  ],
  video: ["video", "animation", "motion", "clip", "reel", "reveal animation", "product video"],
  svg: ["svg", "vector", "logo", "icon", "badge", "icon set", "decorative pattern", "pattern"],
};

// More granular industries — order matters: specific before general
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  jazz: ["jazz"],
  film: ["film", "production company"],
  nightlife: ["techno", "warehouse party", "nightclub", "rave"],
  gaming: ["game", "gaming"],
  wearables: ["smartwatch", "smart watch", "wearable"],
  fashion: ["fashion brand", "fashion"],
  wellness: ["wellness", "spa"],
  funeral: ["funeral", "memorial", "cemetery"],
  meditation: ["meditation", "mindfulness", "zen"],
  music: ["music", "album", "record label"],
  tech: [
    "tech",
    "saas",
    "startup",
    "software",
    "api",
    "developer",
    "dev",
    "monitoring",
    "data",
    "turbine",
    "wind farm",
    "email client",
    "privacy",
  ],
  finance: [
    "finance",
    "fintech",
    "bank",
    "trading",
    "crypto",
    "payment",
    "cryptocurrency",
    "exchange",
    "institutional investor",
  ],
  healthcare: ["health", "medical", "fitness", "clinic", "veterinary", "therapist"],
  ecommerce: [
    "shop",
    "store",
    "ecommerce",
    "e-commerce",
    "marketplace",
    "retail",
    "product shot",
    "packaging",
    "soap",
  ],
  education: ["education", "learning", "course", "school", "university", "language learning"],
  entertainment: ["streaming", "media", "opera"],
  food: [
    "food",
    "restaurant",
    "cafe",
    "recipe",
    "culinary",
    "bar",
    "cocktail",
    "gastronomy",
    "omakase",
  ],
  luxury: ["luxury", "premium", "high-end", "exclusive", "boutique"],
  creative: [
    "creative",
    "agency",
    "portfolio",
    "studio",
    "design",
    "art",
    "architecture",
    "bookstore",
  ],
  real_estate: ["real estate", "property", "architecture firm", "interior"],
  nonprofit: ["nonprofit", "annual report", "charity", "ngo"],
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  bold: ["bold", "striking", "powerful", "dramatic", "impactful"],
  minimal: ["minimal", "clean", "simple", "understated", "quiet"],
  playful: ["playful", "fun", "colorful", "whimsical", "energetic"],
  dark: ["dark", "moody", "mysterious", "noir", "gothic"],
  warm: ["warm", "cozy", "inviting", "organic", "natural"],
  futuristic: ["futuristic", "cutting-edge", "innovative", "sleek"],
  vintage: ["vintage", "retro", "nostalgic", "classic", "old-school"],
  luxurious: ["luxurious", "elegant", "sophisticated", "refined", "opulent"],
  raw: ["raw", "brutalist", "honest", "unpolished", "gritty"],
  dignified: ["dignified", "solemn", "respectful", "stately"],
  intimate: ["intimate", "personal", "close"],
  smoky: ["smoky", "hazy", "atmospheric"],
  underground: ["underground", "subversive", "countercultural"],
  edgy: ["edgy", "provocative", "sharp", "angular"],
  calm: ["calm", "serene", "tranquil", "peaceful"],
  professional: ["professional", "corporate", "formal"],
  modern: ["modern", "contemporary"],
};

const AUDIENCE_KEYWORDS: Record<string, string[]> = {
  enterprise: ["enterprise", "corporate", "b2b", "business"],
  consumer: ["consumer", "b2c", "user", "customer", "people"],
  developer: ["developer", "engineer", "programmer", "coder"],
  creative: ["designer", "artist", "creator", "photographer"],
  youth: ["gen-z", "young", "teen", "student", "kids"],
};

const STYLE_IDS = [
  "art-deco",
  "impressionism",
  "constructivism",
  "art-nouveau",
  "bauhaus",
  "de-stijl",
  "rococo",
  "surrealism",
  "pop-art",
  "minimalism-fine-art",
  "flat-design",
  "material-design",
  "neomorphism",
  "glassmorphism",
  "brutalist-web",
  "skeuomorphism",
  "aurora-ui",
  "claymorphism",
  "dark-mode-ui",
  "isometric",
  "line-art",
  "risograph",
  "duotone",
  "woodcut",
  "retro-vintage-print",
  "papercut",
  "low-poly",
  "pixel-art",
  "wabi-sabi",
  "scandinavian-minimalism",
  "psychedelic",
  "afrofuturism",
  "vaporwave",
  "ukiyo-e",
  "memphis-design",
  "swiss-international",
  "generative-art",
  "glitch",
  "fractal",
  "ai-diffusion",
  "cellular-automata",
  "noise-field",
  "particle-systems",
  "wireframe-mesh",
  "cinematic",
  "tilt-shift",
  "analog-film-grain",
  "hdr-hyperrealism",
  "infrared",
  "cyanotype",
  "double-exposure",
  "miniature-diorama",
  "studio-product",
  "neubrutalism",
  "liquid-glass",
  "bento-ui",
  "resonant-stark",
  "editorial-minimalism",
  "minimalist-maximalism",
  "y2k-revival",
  "tactile-craft-digital",
  "solarpunk",
  "suprematism",
  "arte-povera-digital",
  "deconstructivism",
  "mono-ha",
];

const CONVENTION_SIGNALS = [
  "unexpected",
  "unconventional",
  "break",
  "different",
  "unique",
  "surprising",
  "non-traditional",
  "against",
  "subvert",
  "twist",
];

const QUALITY_KEYWORDS: Record<string, string[]> = {
  premium: ["premium", "high-quality", "professional", "polished"],
  experimental: ["experimental", "avant-garde", "artistic", "creative"],
  production: ["production", "production-ready", "ship", "launch", "deploy"],
};

// --- Extraction Logic ---

export function extractDimensions(message: string): ExtractedDimensions {
  const lower = message.toLowerCase();

  const outputType = matchFirst(lower, OUTPUT_TYPE_KEYWORDS);
  const industry = matchFirst(lower, INDUSTRY_KEYWORDS);
  const moodAestheticTags = matchAll(lower, MOOD_KEYWORDS);
  const audienceSegment = matchFirst(lower, AUDIENCE_KEYWORDS);
  const explicitStyle =
    STYLE_IDS.find((id) => lower.includes(id.replace(/-/g, " ")) || lower.includes(id)) ?? null;
  const conventionBreakingSignals = CONVENTION_SIGNALS.filter((s) => lower.includes(s));
  const qualityEmphasis = matchFirst(lower, QUALITY_KEYWORDS);

  return {
    outputType,
    industry,
    moodAestheticTags,
    audienceSegment,
    explicitStyle,
    conventionBreakingSignals,
    qualityEmphasis,
  };
}

function matchFirst(text: string, map: Record<string, string[]>): string | null {
  for (const [key, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => text.includes(kw))) return key;
  }
  return null;
}

function matchAll(text: string, map: Record<string, string[]>): string[] {
  const matches: string[] = [];
  for (const [key, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => text.includes(kw))) matches.push(key);
  }
  return matches;
}

export function computeSpecificity(dims: ExtractedDimensions): number {
  let score = 0;
  if (dims.outputType) score++;
  if (dims.industry) score++;
  if (dims.moodAestheticTags.length > 0) score++;
  if (dims.audienceSegment) score++;
  if (dims.explicitStyle) score++;
  if (dims.conventionBreakingSignals.length > 0) score++;
  if (dims.qualityEmphasis) score++;
  return score;
}

export function buildEnhancement(dims: ExtractedDimensions): string {
  const parts: string[] = [];

  if (dims.outputType) parts.push(`[output: ${dims.outputType}]`);
  if (dims.industry) parts.push(`[industry: ${dims.industry}]`);
  if (dims.moodAestheticTags.length > 0) parts.push(`[mood: ${dims.moodAestheticTags.join(", ")}]`);
  if (dims.audienceSegment) parts.push(`[audience: ${dims.audienceSegment}]`);
  if (dims.explicitStyle) parts.push(`[style: ${dims.explicitStyle}]`);
  if (dims.conventionBreakingSignals.length > 0) parts.push(`[convention-breaking: yes]`);
  if (dims.qualityEmphasis) parts.push(`[quality: ${dims.qualityEmphasis}]`);

  return parts.length > 0 ? parts.join(" ") : "";
}

// --- Main ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const messageIdx = args.indexOf("--message");
  const message = messageIdx >= 0 && args[messageIdx + 1] ? args[messageIdx + 1] : args.join(" ");

  if (!message) {
    yield* Effect.fail(new Error("No message provided. Use --message '<text>'"));
  }

  const dimensions = extractDimensions(message);
  const specificity = computeSpecificity(dimensions);
  const enhancement = buildEnhancement(dimensions);
  const enhanced = enhancement.length > 0 ? `${enhancement}\n\n${message}` : message;

  const result: EnhancedMessage = {
    original: message,
    dimensions,
    specificity,
    enhancement,
    enhanced,
  };

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });

  return result;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Enhancement failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
