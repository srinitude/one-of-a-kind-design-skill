/**
 * distill-prompt.ts — Distills rich style context into a focused fal.ai prompt.
 *
 * fal.ai models (especially Flux) have effective prompt attention that degrades
 * after ~77 tokens (CLIP limit). This function produces a ~55-77 token prompt
 * by layering: subject, style anchor, composition, color palette, quality markers.
 *
 * Pure string function — no LLM needed, deterministic.
 */
import { Effect, pipe } from "effect";

const MAX_PROMPT_LENGTH = 300;

interface StyleLike {
  readonly id: string;
  readonly name?: string;
  readonly generativeAi?: {
    positivePrompt?: string;
    negativePrompt?: string;
  };
  readonly designSystemParameters?: Record<string, string>;
  readonly dialModifiers?: {
    compositionOverride?: string | null;
    colorShift?: string | null;
  };
  readonly antiSlopOverrides?: string[];
}

/**
 * Truncates text at the last complete word before maxChars.
 */
function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  const cutPoint = lastSpace > maxChars * 0.7 ? lastSpace : maxChars;
  return text.slice(0, cutPoint).trimEnd();
}

/**
 * Extracts 2-3 hex colors from design system parameters.
 */
function extractColors(dsp: Record<string, string> | undefined): string {
  if (!dsp) return "";
  const hexPattern = /#[0-9a-fA-F]{3,8}/g;
  const allColors: string[] = [];
  for (const value of Object.values(dsp)) {
    const matches = value.match(hexPattern);
    if (matches) allColors.push(...matches);
  }
  return allColors.slice(0, 3).join(" ");
}

/**
 * Extracts composition hint from design system or dial modifiers.
 */
function extractComposition(style: StyleLike): string {
  if (style.dialModifiers?.compositionOverride) {
    return style.dialModifiers.compositionOverride.slice(0, 40);
  }
  const dsp = style.designSystemParameters;
  if (!dsp) return "";
  const layoutKey = Object.keys(dsp).find((k) =>
    k.includes("layout") || k.includes("grid") || k.includes("composition"),
  );
  return layoutKey ? (dsp[layoutKey] ?? "").slice(0, 40) : "";
}

/**
 * Strips filler words and normalizes whitespace for clean detail extraction.
 */
function cleanDetails(raw: string): string {
  return raw
    .replace(/\b(for|a|an|the|my|our|we need|i need|design|create|build|make|screens?)\b/gi, "")
    .replace(/\b(packaging|branding|marketing|campaign|annual report|nonprofit)\b/gi, "")
    .replace(/[.,]+\s*$/, "")
    .replace(/^[.,\s]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Transforms conversational intent into concrete visual description.
 * fal.ai needs to know what to DEPICT, not what the user WANTS.
 */
function describeVisually(intent: string): string {
  const subjectPatterns: Array<[RegExp, string]> = [
    [/website|site|landing\s*page|homepage/i, "website interface design screenshot"],
    [/dashboard|admin\s*panel/i, "application dashboard interface"],
    [/onboarding\s*screens?/i, "mobile onboarding screen with illustrations and text"],
    [/settings\s*page/i, "settings interface with toggle controls and sections"],
    [/mobile|app\s+screen/i, "mobile app screen design"],
    [/album\s*cover/i, "album cover artwork"],
    [/poster|event\s*poster/i, "graphic design poster"],
    [/book\s*cover/i, "book cover design"],
    [/product\s*(shot|photo|video)/i, "product photography on clean surface"],
    [/infographic/i, "data visualization infographic with charts and statistics"],
    [/logo\s*reveal|logo\s*animation/i, "logo animation key frame on dark background"],
    [/logo/i, "logo design on neutral background"],
    [/icon\s*set|(\d+)\s*icons/i, "grid of uniform icons on white background"],
    [/pattern/i, "ornate floral pattern, intricate detailed design, colorful artistic tile"],
    [/video|animation|reveal/i, "key frame from motion design"],
  ];

  for (const [pattern, visual] of subjectPatterns) {
    if (pattern.test(intent)) {
      const details = cleanDetails(intent.replace(pattern, ""));
      if (!details) return visual;
      return `${visual}, ${details}`;
    }
  }
  return intent;
}

/**
 * Distills a resolved style + user intent into a focused fal.ai prompt.
 * Visual-subject-first ordering: concrete depiction before style tokens.
 * Output is capped at MAX_PROMPT_LENGTH (~300 chars, ~55-77 tokens).
 */
export function distillPrompt(style: StyleLike, intent: string): string {
  const parts: string[] = [];

  // 1. Visual subject description FIRST — what to depict
  const visual = describeVisually(intent);
  parts.push(visual);

  // 2. Style tokens (first 3 comma-separated phrases)
  const positive = style.generativeAi?.positivePrompt ?? "";
  if (positive) {
    const tokens = positive.split(",").slice(0, 3).join(",").trim();
    parts.push(`${style.name ?? style.id} aesthetic, ${tokens}`);
  } else {
    parts.push(`${style.name ?? style.id} aesthetic`);
  }

  // 3. Color palette with hex values
  const colors = extractColors(style.designSystemParameters);
  if (colors) parts.push(`palette: ${colors}`);

  // 4. Composition directive
  const comp = extractComposition(style);
  if (comp) parts.push(comp);

  // 5. Quality markers
  parts.push("sharp, detailed");

  // Join and cap at word boundary
  const prompt = parts.join(", ");
  return truncateAtWord(prompt, MAX_PROMPT_LENGTH);
}

/**
 * Builds a negative prompt from style data, capped at 150 chars.
 */
export function distillNegative(style: StyleLike): string {
  const parts: string[] = [];

  const negative = style.generativeAi?.negativePrompt ?? "";
  if (negative) parts.push(negative.slice(0, 80));

  const antiSlop = style.antiSlopOverrides ?? [];
  if (antiSlop.length > 0) parts.push(antiSlop.slice(0, 3).join(", "));

  parts.push("blurry, low quality, watermark, text overlay");

  const result = parts.join(", ");
  return truncateAtWord(result, 150);
}
