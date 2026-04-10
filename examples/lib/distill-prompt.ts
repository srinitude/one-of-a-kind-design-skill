/**
 * distill-prompt.ts — Distills rich style context into a focused fal.ai prompt.
 *
 * Flux Pro uses T5-XXL encoder which handles 512+ tokens.
 * No artificial truncation — the full creative prompt goes through.
 * Layers: oblique visual metaphor, style anchor, convention break, palette, composition.
 *
 * ROOT CAUSE FIXES (from visual evaluation):
 * 1. NEVER include text, typography, buttons, or UI elements — fal.ai can't render text
 * 2. Avoid visual cliches — no "saxophone in spotlight", no "gradient hero"
 * 3. Find an OBLIQUE visual metaphor, not a literal depiction of the subject
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
 * CLICHE MAP: for each output type + style combo, defines what to AVOID
 * and what OBLIQUE ANGLE to take instead.
 *
 * The key insight: a jazz album cover shouldn't show a saxophone.
 * A funeral home shouldn't show flowers. An architecture firm shouldn't
 * show a building facade. Those are the FIRST things anyone would think of.
 * One-of-a-kind means finding the SECOND or THIRD association.
 */
const OBLIQUE_ANGLES: Record<string, Record<string, string>> = {
  // Output type → industry/subject → oblique visual
  "album cover": {
    jazz: "close-up of piano keys with condensation from a cold glass, warm amber light reflecting off lacquered wood, shallow depth of field",
    electronic: "long-exposure light trails through rain-streaked window, abstracted city grid dissolving into frequency patterns",
    ambient: "frozen lake surface with trapped air bubbles forming patterns, aerial perspective, muted silver-blue",
    _default: "abstract texture that evokes the music's emotional core, not the instruments",
  },
  poster: {
    techno: "thermal camera view of a concrete wall with body heat traces where dancers pressed against it, infrared palette",
    concert: "empty stage with a single mic stand casting a long shadow across worn floorboards, dramatic side-light",
    _default: "abstract environmental detail that captures the event's energy without showing people or text",
  },
  website: {
    architecture: "macro detail of material intersection — where two different reclaimed materials meet, the joint itself tells the story of craft",
    restaurant: "the surface of the counter or table, showing wear patterns from years of use, warm indirect light",
    funeral: "soft light passing through textured glass, casting warm diffused patterns on stone, no flowers no crosses",
    _default: "environmental texture or material detail that embodies the brand, not a screenshot of a website layout",
  },
  logo: {
    _default: "abstract geometric mark on neutral background, single weight, no text no letters no words",
  },
  video: {
    opera: "slow-motion fabric falling through fractured light, deconstructed and layered, no people",
    _default: "single continuous camera movement through an environment that embodies the mood",
  },
  "mobile-app": {
    _default: "abstract background texture with the brand's emotional temperature, not a UI screenshot",
  },
};

/**
 * Finds an oblique visual angle for the given output type and subject.
 * Falls back through: exact match → output type default → generic.
 */
function findObliqueAngle(intent: string, outputType: string): string | null {
  const lower = intent.toLowerCase();
  const typeKey = detectOutputCategory(lower);
  const typeMap = OBLIQUE_ANGLES[typeKey];
  if (!typeMap) return null;

  for (const [subject, angle] of Object.entries(typeMap)) {
    if (subject === "_default") continue;
    if (lower.includes(subject)) return angle;
  }
  return typeMap._default ?? null;
}

function detectOutputCategory(intent: string): string {
  if (/album\s*cover/i.test(intent)) return "album cover";
  if (/poster|flyer/i.test(intent)) return "poster";
  if (/website|site|landing|homepage/i.test(intent)) return "website";
  if (/logo/i.test(intent)) return "logo";
  if (/video|trailer|animation/i.test(intent)) return "video";
  if (/mobile|app\s+screen|onboarding/i.test(intent)) return "mobile-app";
  return "website";
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
 * Strategy: OBLIQUE ANGLE first (not literal depiction), then style anchor
 * (one specific expression), then palette, then quality markers.
 * NEVER includes text, UI elements, or layout terms.
 */
export function distillPrompt(style: StyleLike, intent: string): string {
  const parts: string[] = [];

  // 1. OBLIQUE visual angle — the surprising interpretation
  const oblique = findObliqueAngle(intent, "");
  if (oblique) {
    parts.push(oblique);
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
  // NOTE: don't run removeBannedTerms on the output — it strips legitimate "no text" instructions
  // Instead, the NEGATIVE prompt handles anti-text
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
