import { describe, expect, test } from "bun:test";
import { distillPrompt, distillNegative } from "./distill-prompt";

const mockStyle = {
  id: "cinematic",
  name: "Cinematic",
  generativeAi: {
    positivePrompt: "dramatic lighting, film grain, high contrast, moody atmosphere, professional color grading",
    negativePrompt: "cartoon, flat, low quality",
  },
  designSystemParameters: {
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#e94560",
  },
  dialModifiers: {
    compositionOverride: "rule of thirds, shallow depth",
    colorShift: "cool blue",
  },
  antiSlopOverrides: ["generic stock photo", "clip art"],
};

describe("distillPrompt", () => {
  test("never truncates mid-word", () => {
    const longIntent = "A funeral home website that conveys dignity and peace without feeling morbid or depressing, with clean modern layout and professional photography of the facility and surrounding gardens";
    const result = distillPrompt(mockStyle, longIntent);
    expect(result).not.toMatch(/[a-zA-Z],?\.\.\./);
    expect(result).not.toMatch(/[a-z]{1,2}\.\.\.$/);
    // Should end with "..." only after a complete word
    if (result.endsWith("...")) {
      const beforeEllipsis = result.slice(0, -3).trim();
      const lastChar = beforeEllipsis[beforeEllipsis.length - 1];
      // Last char before "..." should be a space, comma, or end of word
      expect(lastChar).toMatch(/[\s,a-z]/);
    }
  });

  test("subject comes before style tokens", () => {
    const intent = "A funeral home website with modern dignified design";
    const result = distillPrompt(mockStyle, intent);
    const subjectIdx = result.toLowerCase().indexOf("funeral home");
    const styleIdx = result.toLowerCase().indexOf("cinematic");
    // Subject must appear before style name in the prompt
    expect(subjectIdx).toBeLessThan(styleIdx);
  });

  test("does not start with style name", () => {
    const intent = "Album cover for jazz trio";
    const result = distillPrompt(mockStyle, intent);
    expect(result.startsWith("Cinematic")).toBe(false);
  });

  test("respects MAX_PROMPT_LENGTH", () => {
    const intent = "An extremely detailed and elaborate concept for a product photography session featuring handmade artisanal ceramics in a warm studio setting with dramatic side lighting";
    const result = distillPrompt(mockStyle, intent);
    expect(result.length).toBeLessThanOrEqual(300);
  });

  test("truncation preserves at least 70% of max length", () => {
    const intent = "An extremely detailed and elaborate concept for a product photography session featuring handmade artisanal ceramics";
    const result = distillPrompt(mockStyle, intent);
    if (result.endsWith("...")) {
      // The actual content (minus "...") should be at least 70% of 300
      expect(result.length).toBeGreaterThan(200);
    }
  });
});

describe("distillNegative", () => {
  test("includes anti-slop overrides", () => {
    const result = distillNegative(mockStyle);
    expect(result).toContain("generic stock photo");
  });

  test("respects 150 char limit", () => {
    const result = distillNegative(mockStyle);
    expect(result.length).toBeLessThanOrEqual(150);
  });
});
