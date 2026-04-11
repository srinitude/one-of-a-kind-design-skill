/**
 * distill-prompt.ts — Distills rich style context into a focused fal.ai prompt.
 *
 * Flux Pro uses T5-XXL encoder which handles 512+ tokens.
 * No artificial truncation — the full creative prompt goes through.
 * Layers: scene template (taxonomy-driven), style anchor, convention break, palette, composition.
 *
 * ROOT CAUSE FIXES (from visual evaluation):
 * 1. NEVER include text, typography, buttons, or UI elements — fal.ai can't render text
 * 2. Avoid visual cliches — no "saxophone in spotlight", no "gradient hero"
 * 3. Use taxonomy scene_templates as the prompt BASE — specific, oblique, anti-cliche
 * 4. Pick ONE specific expression of the style for THIS project, not generic style tokens
 *
 * Pure string function — no LLM needed, deterministic.
 */
import { Effect, pipe } from "effect";

// Flux Pro uses T5-XXL encoder (not CLIP) — supports 512+ tokens (~2000 chars)
// No artificial truncation. Let the full prompt through.
const MAX_PROMPT_LENGTH = 2000;

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
  readonly conventionBreak?: {
    applied?: boolean;
    breakText?: string;
  };
  readonly antiSlopOverrides?: string[];
  readonly sceneTemplates?: Record<string, string>;
}

function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  const cutPoint = lastSpace > maxChars * 0.7 ? lastSpace : maxChars;
  return text.slice(0, cutPoint).trimEnd();
}

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

function extractComposition(style: StyleLike): string {
  if (style.dialModifiers?.compositionOverride) {
    return style.dialModifiers.compositionOverride.slice(0, 40);
  }
  const dsp = style.designSystemParameters;
  if (!dsp) return "";
  const layoutKey = Object.keys(dsp).find(
    (k) => k.includes("layout") || k.includes("composition"),
  );
  return layoutKey ? (dsp[layoutKey] ?? "").slice(0, 40) : "";
}

/**
 * Maps intent strings to scene_template keys.
 * The scene_templates in the taxonomy use these keys:
 * website_hero, album_cover, event_poster, logo, video_keyframe, mobile_hero, product_shot, editorial
 */
function detectSceneTemplateKey(intent: string): string {
  const lower = intent.toLowerCase();
  if (/album\s*cover/i.test(lower)) return "album_cover";
  if (/poster|flyer|event/i.test(lower)) return "event_poster";
  if (/logo|icon|mark|badge/i.test(lower)) return "logo";
  if (/video|trailer|animation|keyframe/i.test(lower)) return "video_keyframe";
  if (/mobile|app\s+screen|onboarding|phone/i.test(lower)) return "mobile_hero";
  if (/product|e-?commerce|shop|store|catalog/i.test(lower)) return "product_shot";
  if (/editorial|magazine|article|blog|journal/i.test(lower)) return "editorial";
  return "website_hero";
}

/**
 * Finds the scene template for this style + output type combination.
 * Falls back to website_hero if no specific match.
 */
function findSceneTemplate(style: StyleLike, intent: string): string | null {
  const templates = style.sceneTemplates;
  if (!templates || Object.keys(templates).length === 0) return null;
  const key = detectSceneTemplateKey(intent);
  return templates[key] ?? templates.website_hero ?? null;
}

/**
 * CRITICAL: Things that must NEVER appear in a fal.ai prompt.
 * Flux cannot render text — any text in the prompt becomes garbled pixels.
 */
const BANNED_TERMS = [
  /\btext\b/i, /\btypography\b/i, /\bfont\b/i, /\bletter(s|ing)?\b/i,
  /\bword(s)?\b/i, /\bheadline\b/i, /\btitle\b/i, /\bslogan\b/i,
  /\bbutton\b/i, /\bCTA\b/i, /\bcall.to.action\b/i, /\bUI\b/i,
  /\binterface\b/i, /\bscreenshot\b/i, /\blayout\b/i, /\bgrid\b/i,
  /\bnavigation\b/i, /\bmenu\b/i, /\bheader\b/i, /\bfooter\b/i,
  /\bbusiness name\b/i, /\bcompany name\b/i,
];

function removeBannedTerms(prompt: string): string {
  let cleaned = prompt;
  for (const pattern of BANNED_TERMS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
}

/**
 * Picks ONE specific style expression, not the entire style's positive_prompt.
 * The first token of the positive_prompt is usually the most distinctive.
 */
function pickStyleAnchor(style: StyleLike): string {
  const positive = style.generativeAi?.positivePrompt ?? "";
  const tokens = positive.split(",").map((t) => t.trim());
  // Take the MOST SPECIFIC token (usually position 2-3, not the genre name at position 0)
  const specific = tokens.find(
    (t) => t.length > 10 && !t.includes("aesthetic") && !t.includes("style"),
  );
  return specific ?? tokens[0] ?? style.id;
}

/**
 * Distills a resolved style + user intent into a focused fal.ai prompt.
 *
 * Strategy: SCENE TEMPLATE first (taxonomy-driven, specific, oblique),
 * then style anchor (one specific expression), then palette, then quality markers.
 * NEVER includes text, UI elements, or layout terms.
 */
export function distillPrompt(style: StyleLike, intent: string): string {
  const parts: string[] = [];

  // 1. SCENE TEMPLATE — taxonomy-driven, specific, anti-cliche
  const template = findSceneTemplate(style, intent);
  if (template) {
    parts.push(template);
  } else {
    // Fallback: extract the core visual subject without cliches
    const cleaned = intent
      .replace(/\b(design|create|build|make|for|a|an|the|my|our|we need|i need)\b/gi, "")
      .replace(/\b(website|site|landing page|app|screen|poster|cover)\b/gi, "")
      .trim();
    parts.push(cleaned || intent);
  }

  // 2. ONE specific style expression (not generic "aesthetic" tokens)
  const anchor = pickStyleAnchor(style);
  parts.push(anchor);

  // 3. Convention break injection (if applied)
  if (style.conventionBreak?.applied && style.conventionBreak?.breakText) {
    // Extract the actionable part of the break
    const breakAction = style.conventionBreak.breakText.split("—").pop()?.trim() ?? "";
    if (breakAction.length > 10) {
      parts.push(breakAction.slice(0, 60));
    }
  }

  // 4. Palette (2-3 hex values)
  const colors = extractColors(style.designSystemParameters);
  if (colors) parts.push(`palette: ${colors}`);

  // 5. Composition
  const comp = extractComposition(style);
  if (comp) parts.push(comp);

  // 6. Quality markers
  parts.push("sharp, detailed");

  // Join and cap at word boundary
  const raw = parts.join(", ");
  return truncateAtWord(raw, MAX_PROMPT_LENGTH);
}

/**
 * Builds a negative prompt. Now ALWAYS includes anti-text terms.
 */
export function distillNegative(style: StyleLike): string {
  const parts: string[] = [];

  const negative = style.generativeAi?.negativePrompt ?? "";
  if (negative) parts.push(negative.slice(0, 80));

  const antiSlop = style.antiSlopOverrides ?? [];
  if (antiSlop.length > 0) parts.push(antiSlop.slice(0, 2).join(", "));

  // ALWAYS ban text rendering — Flux can't do it
  parts.push("text, words, letters, numbers, watermark, signature, logo text, UI elements, buttons");
  parts.push("blurry, low quality, generic, stock photo, cliche");

  const result = parts.join(", ");
  return truncateAtWord(result, 200);
}
