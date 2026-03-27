/**
 * enhance-message.ts — UserPromptSubmit hook handler.
 * Reads user message from stdin, enriches with taxonomy context.
 * If specificity < 3, signals AskUserQuestion for clarification.
 * Must complete in <5 seconds (hook timeout).
 */
import { Effect, pipe } from "effect";
import { logHookBoth } from "./hook-logger";

const OUTPUT_TYPES: Record<string, string[]> = {
  website: ["website", "site", "landing page", "homepage", "web page"],
  "web-app": ["web app", "webapp", "dashboard", "saas", "platform"],
  "mobile-app": ["mobile", "app screen", "ios", "android", "phone"],
  image: ["image", "picture", "photo", "illustration", "graphic", "poster"],
  video: ["video", "animation", "motion", "clip", "reel"],
  svg: ["svg", "vector", "logo", "icon", "badge"],
};

const INDUSTRIES: Record<string, string[]> = {
  tech: ["tech", "saas", "startup", "software", "api", "developer"],
  finance: ["finance", "fintech", "bank", "trading", "crypto"],
  healthcare: ["health", "medical", "wellness", "fitness"],
  ecommerce: ["shop", "store", "ecommerce", "marketplace", "retail"],
  luxury: ["luxury", "premium", "high-end", "exclusive", "boutique"],
  creative: ["creative", "agency", "portfolio", "studio", "art"],
};

const MOODS: Record<string, string[]> = {
  bold: ["bold", "striking", "powerful", "dramatic"],
  minimal: ["minimal", "clean", "simple", "understated"],
  playful: ["playful", "fun", "colorful", "whimsical"],
  dark: ["dark", "moody", "mysterious", "noir"],
  warm: ["warm", "cozy", "inviting", "organic"],
  futuristic: ["futuristic", "modern", "sleek"],
  vintage: ["vintage", "retro", "nostalgic", "classic"],
  luxurious: ["luxurious", "elegant", "sophisticated"],
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
  "infrared-photography",
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

function matchFirst(text: string, map: Record<string, string[]>): string | null {
  for (const [key, kws] of Object.entries(map)) {
    if (kws.some((kw) => text.includes(kw))) return key;
  }
  return null;
}

function enhance(message: string): string {
  const lower = message.toLowerCase();
  const parts: string[] = [];

  const outputType = matchFirst(lower, OUTPUT_TYPES);
  const industry = matchFirst(lower, INDUSTRIES);
  const moods: string[] = [];
  for (const [key, kws] of Object.entries(MOODS)) {
    if (kws.some((kw) => lower.includes(kw))) moods.push(key);
  }
  const style = STYLE_IDS.find((id) => lower.includes(id.replace(/-/g, " ")) || lower.includes(id));

  let specificity = 0;
  if (outputType) {
    parts.push(`[output: ${outputType}]`);
    specificity++;
  }
  if (industry) {
    parts.push(`[industry: ${industry}]`);
    specificity++;
  }
  if (moods.length > 0) {
    parts.push(`[mood: ${moods.join(", ")}]`);
    specificity++;
  }
  if (style) {
    parts.push(`[style: ${style}]`);
    specificity++;
  }

  parts.push(`[specificity: ${specificity}/7]`);

  if (specificity < 3) {
    parts.push("[action: ask-user-question — specificity below threshold]");
  }

  return parts.length > 1 ? parts.join(" ") : "";
}

const program = Effect.gen(function* () {
  const input = yield* Effect.tryPromise({
    try: async () => Bun.stdin.text(),
    catch: () => new Error("Failed to read stdin"),
  });

  const message = yield* Effect.try({
    try: () => {
      const parsed = JSON.parse(input);
      return (parsed.message ?? parsed.content ?? input) as string;
    },
    catch: () => input,
  });

  const enhancement = enhance(message);

  if (enhancement) {
    logHookBoth("UserPromptSubmit", "*", "PASS", enhancement.slice(0, 80));
    yield* Effect.sync(() => {
      console.log(JSON.stringify({ result: "enhance", enhancement }));
    });
  } else {
    logHookBoth("UserPromptSubmit", "*", "SKIP", "no taxonomy match");
  }
});

pipe(
  program,
  Effect.catchAll((e) =>
    Effect.sync(() => {
      logHookBoth("UserPromptSubmit", "*", "ERROR", e instanceof Error ? e.message : String(e));
    }),
  ),
  Effect.runPromise,
);
