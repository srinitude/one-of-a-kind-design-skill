/**
 * distill-prompt.ts — Distills rich style context into a focused fal.ai prompt.
 *
 * fal.ai models (especially Flux) have effective prompt attention that degrades
 * after ~77 tokens (CLIP limit). This function produces a ~55-77 token prompt
 * by layering: style anchor, subject, composition, color palette, quality markers.
 *
 * Pure string function — no LLM needed, deterministic.
 */

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
 * Distills a resolved style + user intent into a focused fal.ai prompt.
 * Output is capped at MAX_PROMPT_LENGTH (~300 chars, ~55-77 tokens).
 */
export function distillPrompt(style: StyleLike, intent: string): string {
  const parts: string[] = [];

  // 1. Style anchor (~5 tokens)
  parts.push(style.name ?? style.id);

  // 2. Subject from intent (~15 tokens) — trim to essentials
  const trimmedIntent = intent.slice(0, 120);
  parts.push(trimmedIntent);

  // 3. Positive style tokens from taxonomy (~15 tokens)
  const positive = style.generativeAi?.positivePrompt ?? "";
  if (positive) {
    // Take first ~80 chars of positive tokens
    parts.push(positive.slice(0, 80));
  }

  // 4. Color palette with hex values (~10 tokens)
  const colors = extractColors(style.designSystemParameters);
  if (colors) parts.push(`palette: ${colors}`);

  // 5. Composition (~10 tokens)
  const comp = extractComposition(style);
  if (comp) parts.push(comp);

  // 6. Color shift
  if (style.dialModifiers?.colorShift) {
    parts.push(`${style.dialModifiers.colorShift} tones`);
  }

  // 7. Quality markers (~5 tokens)
  parts.push("high detail, professional quality");

  // Join and cap
  let prompt = parts.join(", ");
  if (prompt.length > MAX_PROMPT_LENGTH) {
    prompt = prompt.slice(0, MAX_PROMPT_LENGTH - 3) + "...";
  }

  return prompt;
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

  let result = parts.join(", ");
  if (result.length > 150) result = result.slice(0, 147) + "...";
  return result;
}
