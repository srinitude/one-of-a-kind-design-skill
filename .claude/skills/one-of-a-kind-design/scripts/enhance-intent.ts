/**
 * enhance-intent.ts — Parses user intent and determines what's known vs unknown.
 * When critical scene slots are missing, generates targeted clarifying questions.
 *
 * Every scene needs 10 resolved slots:
 * subject, environment, lighting, camera, palette, materials, props, atmosphere, time_era, composition
 *
 * The user provides some via their prompt. The style fills defaults.
 * But some slots can ONLY come from the user — this script identifies which.
 */

import { Effect, Console } from "effect";

// --- Scene Slot Types ---

interface SceneSlot {
  readonly name: string;
  readonly value: string | null;
  readonly source: "user" | "style" | "industry" | "default" | "unknown";
  readonly confidence: number; // 0-1
}

interface EnhancedIntent {
  readonly outputType: string;
  readonly industry: string | null;
  readonly mood: string[];
  readonly subjects: string[];
  readonly constraints: string[];
  readonly slots: Record<string, SceneSlot>;
  readonly specificity: number; // 0-7
  readonly missingCritical: string[];
  readonly clarifyingQuestions: string[];
}

// --- Output Type Detection ---

const OUTPUT_PATTERNS: Array<[RegExp, string]> = [
  [/\b(website|site|landing\s*page|homepage)\b/i, "website"],
  [/\b(dashboard|admin|panel|crm|tool)\b/i, "web-app"],
  [/\b(mobile|app\s+screen|onboarding|settings)\b/i, "mobile-app"],
  [/\b(logo|icon|svg|vector|pattern)\b/i, "svg"],
  [/\b(video|trailer|animation|reveal|flythrough)\b/i, "video"],
  [/\b(album\s*cover|poster|book\s*cover|illustration)\b/i, "image"],
  [/\b(product\s*shot|photo)\b/i, "image"],
];

function detectOutputType(intent: string): string {
  const lower = intent.toLowerCase();
  for (const [pattern, type] of OUTPUT_PATTERNS) {
    if (pattern.test(lower)) return type;
  }
  return "image";
}

// --- Subject Extraction ---

function extractSubjects(intent: string): string[] {
  const subjects: string[] = [];
  const subjectPatterns: Array<[RegExp, string]> = [
    [/bourbon|whiskey|glass/i, "bourbon glass"],
    [/piano|keys/i, "piano"],
    [/guitar/i, "guitar"],
    [/camera/i, "camera"],
    [/book(s)?/i, "books"],
    [/flower(s)?/i, "flowers"],
    [/bottle|flacon/i, "bottle"],
    [/record|vinyl/i, "vinyl record"],
    [/speaker/i, "speaker"],
    [/screen|monitor/i, "screen"],
    [/bowl|dish/i, "bowl"],
    [/noodle|ramen/i, "ramen bowl"],
    [/car|vehicle/i, "vehicle"],
    [/watch/i, "watch"],
    [/phone/i, "phone"],
    [/candle/i, "candle"],
  ];
  const lower = intent.toLowerCase();
  for (const [pattern, subject] of subjectPatterns) {
    if (pattern.test(lower)) subjects.push(subject);
  }
  return subjects;
}

// --- Constraint Extraction ---

function extractConstraints(intent: string): string[] {
  const constraints: string[] = [];
  const lower = intent.toLowerCase();
  const noPatterns = lower.match(/no\s+(\w+(\s+\w+)?)/g);
  if (noPatterns) {
    for (const match of noPatterns) {
      constraints.push(match.trim());
    }
  }
  if (/don'?t|doesn'?t|without|avoid/i.test(lower)) {
    const negMatch = lower.match(
      /(?:don'?t|doesn'?t|without|avoid)\s+(?:feel\s+)?(\w+(\s+\w+)?)/g,
    );
    if (negMatch) constraints.push(...negMatch.map((m) => m.trim()));
  }
  return constraints;
}

// --- Mood Extraction ---

const MOOD_WORDS = [
  "warm", "cool", "cold", "hot", "intimate", "bold", "minimal",
  "playful", "dark", "light", "futuristic", "vintage", "luxurious",
  "raw", "dignified", "somber", "underground", "clean", "whimsical",
  "calm", "edgy", "nostalgic", "elegant", "organic", "industrial",
  "geometric", "dreamy", "professional", "modern", "smoky", "dramatic",
  "serene", "chaotic", "refined", "gritty", "ethereal", "sacred",
  "confrontational", "meditative", "urgent", "melancholic", "mysterious",
];

function extractMoods(intent: string): string[] {
  const lower = intent.toLowerCase();
  return MOOD_WORDS.filter((m) => lower.includes(m));
}

// --- Industry Detection ---

const INDUSTRY_PATTERNS: Array<[RegExp, string]> = [
  [/architect/i, "architecture"],
  [/ramen/i, "ramen"],
  [/molecular gastronomy|spherification|foam.*plat/i, "molecular-gastronomy"],
  [/restaurant|food|chef|cook|omakase/i, "food"],
  [/crypto|blockchain|exchange|defi/i, "crypto"],
  [/funeral|memorial|grief/i, "funeral"],
  [/music|jazz|band|album|concert|vinyl|record/i, "music"],
  [/fashion|clothing|apparel|boutique/i, "fashion"],
  [/carbon offset|climate|sustainability|green energy|renewable/i, "sustainability"],
  [/tech|startup|saas|software|app\b/i, "tech"],
  [/photo|camera|documentary/i, "photography"],
  [/children|kids|bookstore|toy/i, "children"],
  [/perfume|fragrance|scent/i, "perfume"],
  [/medical|health|therapy|clinic/i, "healthcare"],
  [/law|legal|attorney/i, "legal"],
  [/real\s*estate|property/i, "real-estate"],
  [/hotel|hospitality|resort/i, "hospitality"],
  [/fitness|gym|sport/i, "fitness"],
  [/education|school|university/i, "education"],
  [/sustainability|carbon|climate|green/i, "sustainability"],
  [/art|gallery|museum/i, "art"],
  [/film|cinema|movie|opera/i, "film"],
  [/gaming|game/i, "gaming"],
];

function detectIndustry(intent: string): string | null {
  const lower = intent.toLowerCase();
  for (const [pattern, industry] of INDUSTRY_PATTERNS) {
    if (pattern.test(lower)) return industry;
  }
  return null;
}

// --- Slot Resolution ---

function resolveSlots(
  intent: string,
  _outputType: string,
  industry: string | null,
  moods: string[],
  subjects: string[],
): Record<string, SceneSlot> {
  const lower = intent.toLowerCase();
  const slot = (
    name: string,
    value: string | null,
    source: SceneSlot["source"],
    confidence: number,
  ): SceneSlot => ({ name, value, source, confidence });

  return {
    subject: subjects.length > 0
      ? slot("subject", subjects.join(", "), "user", 0.9)
      : slot("subject", null, "unknown", 0),
    environment: industry
      ? slot("environment", `${industry} context`, "industry", 0.6)
      : slot("environment", null, "unknown", 0),
    lighting: moods.some((m) => ["warm", "intimate", "smoky"].includes(m))
      ? slot("lighting", "warm practical light", "user", 0.7)
      : moods.some((m) => ["dark", "dramatic", "edgy"].includes(m))
        ? slot("lighting", "dramatic directional", "user", 0.7)
        : slot("lighting", null, "style", 0.3),
    camera: /close.?up|macro|detail/i.test(lower)
      ? slot("camera", "close-up macro", "user", 0.8)
      : /wide|panoram|establishing/i.test(lower)
        ? slot("camera", "wide shot", "user", 0.8)
        : slot("camera", null, "style", 0.3),
    palette: /blue|red|green|warm|cool|earth|neon/i.test(lower)
      ? slot("palette", moods.find((m) => /blue|red|warm|cool/.test(m)) ?? "from mood", "user", 0.5)
      : slot("palette", null, "style", 0.3),
    materials: slot("materials", null, industry ? "industry" : "unknown", industry ? 0.4 : 0),
    props: subjects.length > 0
      ? slot("props", subjects[0], "user", 0.8)
      : slot("props", null, "unknown", 0),
    atmosphere: moods.some((m) => ["smoky", "hazy", "foggy"].includes(m))
      ? slot("atmosphere", "atmospheric haze", "user", 0.8)
      : slot("atmosphere", null, "style", 0.3),
    time_era: moods.some((m) => ["vintage", "nostalgic", "retro"].includes(m))
      ? slot("time_era", "vintage analog", "user", 0.7)
      : moods.some((m) => ["futuristic", "modern"].includes(m))
        ? slot("time_era", "contemporary/future", "user", 0.7)
        : slot("time_era", null, "style", 0.3),
    composition: slot("composition", null, "style", 0.3),
  };
}

// --- Specificity Scoring ---

function computeSpecificity(
  slots: Record<string, SceneSlot>,
): number {
  const slotValues = Object.values(slots);
  const known = slotValues.filter((s) => s.value !== null);
  const highConf = slotValues.filter((s) => s.confidence >= 0.6);
  return Math.min(7, known.length * 0.5 + highConf.length * 0.3);
}

// --- Clarifying Questions ---

function generateQuestions(
  slots: Record<string, SceneSlot>,
  _outputType: string,
  industry: string | null,
): string[] {
  const questions: string[] = [];
  const unknowns = Object.entries(slots)
    .filter(([, s]) => s.source === "unknown");

  // CRITICAL missing slots get specific questions
  if (!slots.subject?.value) {
    if (industry === "food") {
      questions.push("What's the signature dish or the single object that represents this restaurant? (e.g., the handmade ceramic bowl, the chef's knife, the steam rising from broth)");
    } else if (industry === "music") {
      questions.push("What physical object captures the feeling of the music? (e.g., a bourbon glass on piano keys, a worn guitar pick, a vinyl groove under a needle)");
    } else if (industry) {
      questions.push(`What's the ONE physical object that represents this ${industry} business? Not the logo — the thing a visitor would remember.`);
    } else {
      questions.push("What's the ONE thing this image should be about? Not a mood — a specific physical subject.");
    }
  }

  if (!slots.environment?.value && !industry) {
    questions.push("Where does this take place? (e.g., a workshop, a club, a clinic, a studio, outdoors)");
  }

  if (!slots.props?.value && slots.subject?.value) {
    questions.push("What other objects should be in the scene to tell the story? (e.g., tools, drinks, instruments, materials)");
  }

  if (unknowns.length >= 5) {
    questions.push("Should this feel warm and organic, or cool and precise?");
  }

  // Limit to 3 questions max
  return questions.slice(0, 3);
}

// --- Main Enhancement ---

export function enhanceIntent(intent: string): EnhancedIntent {
  const outputType = detectOutputType(intent);
  const industry = detectIndustry(intent);
  const moods = extractMoods(intent);
  const subjects = extractSubjects(intent);
  const constraints = extractConstraints(intent);

  const slots = resolveSlots(
    intent, outputType, industry, moods, subjects,
  );

  const specificity = computeSpecificity(slots);

  const missingCritical: string[] = [];
  if (!slots.subject?.value) missingCritical.push("subject");
  if (!slots.environment?.value && !industry) missingCritical.push("environment");
  if (!slots.props?.value) missingCritical.push("props");

  const clarifyingQuestions = specificity < 3
    ? generateQuestions(slots, outputType, industry)
    : [];

  return {
    outputType,
    industry,
    mood: moods,
    subjects,
    constraints,
    slots,
    specificity: Math.round(specificity * 10) / 10,
    missingCritical,
    clarifyingQuestions,
  };
}

// --- CLI ---

if (import.meta.main) {
  const intent = Bun.argv.slice(2).join(" ");

  if (!intent) {
    Effect.runSync(
      Console.error("Usage: bun run enhance-intent.ts <your request>"),
    );
    process.exitCode = 1;
  } else {
    const result = enhanceIntent(intent);
    Effect.runSync(Console.log(JSON.stringify(result, null, 2)));
  }
}
