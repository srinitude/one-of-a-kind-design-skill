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
  sceneTemplates: {
    website_hero: "a single practical light source cutting through atmospheric haze in an empty architectural space, the beam itself is the subject, color-graded teal and warm amber",
    album_cover: "close-up of a surface that holds the memory of the music — piano fallboard with condensation, guitar case lining worn smooth, vinyl groove under macro lens",
    event_poster: "the environmental aftermath — empty venue with residual traces of what happened, a single overhead light still on, chairs still warm, dust still settling",
    logo: "abstract letterbox frame shape derived from anamorphic lens characteristics, negative space creates the mark",
    video_keyframe: "slow dolly forward through a narrow corridor of warm practical lights, shallow depth of field with the vanishing point in soft focus",
    mobile_hero: "color-graded surface texture — the grain of 35mm film stock at 4x magnification, warm amber on one side fading to cool teal",
    product_shot: "product lit by a single overhead practical light in otherwise darkness, dramatic directional shadow, color-graded warm amber with cool fill",
    editorial: "hands in the craft of the industry — the specific gesture that defines the profession, shallow DOF, warm sidelight, film grain",
  },
};

const mockStyleNoTemplates = {
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
  test("uses scene_template for website intent", () => {
    const result = distillPrompt(mockStyle, "A funeral home website with modern dignified design");
    expect(result).toContain("practical light source");
    expect(result).toContain("atmospheric haze");
  });

  test("uses album_cover template for album cover intent", () => {
    const result = distillPrompt(mockStyle, "Album cover for jazz trio");
    expect(result).toContain("piano fallboard");
  });

  test("uses event_poster template for poster intent", () => {
    const result = distillPrompt(mockStyle, "Poster for a techno event");
    expect(result).toContain("environmental aftermath");
  });

  test("uses logo template for logo intent", () => {
    const result = distillPrompt(mockStyle, "Logo for a film studio");
    expect(result).toContain("letterbox frame");
  });

  test("uses video_keyframe template for video intent", () => {
    const result = distillPrompt(mockStyle, "Video trailer for a product launch");
    expect(result).toContain("slow dolly");
  });

  test("uses mobile_hero template for mobile intent", () => {
    const result = distillPrompt(mockStyle, "Mobile app onboarding screen");
    expect(result).toContain("35mm film stock");
  });

  test("uses product_shot template for product intent", () => {
    const result = distillPrompt(mockStyle, "Product photography for e-commerce");
    expect(result).toContain("single overhead practical light");
  });

  test("uses editorial template for editorial intent", () => {
    const result = distillPrompt(mockStyle, "Editorial magazine spread");
    expect(result).toContain("specific gesture");
  });

  test("falls back to cleaned intent when no scene_templates", () => {
    const result = distillPrompt(mockStyleNoTemplates, "A funeral home website");
    expect(result).toContain("funeral home");
  });

  test("never truncates mid-word", () => {
    const longIntent = "A funeral home website that conveys dignity and peace without feeling morbid or depressing, with clean modern layout and professional photography of the facility and surrounding gardens";
    const result = distillPrompt(mockStyle, longIntent);
    expect(result).not.toMatch(/[a-zA-Z],?\.\.\./);
    expect(result).not.toMatch(/[a-z]{1,2}\.\.\.$/);
    if (result.endsWith("...")) {
      const beforeEllipsis = result.slice(0, -3).trim();
      const lastChar = beforeEllipsis[beforeEllipsis.length - 1];
      expect(lastChar).toMatch(/[\s,a-z]/);
    }
  });

  test("scene template comes before style tokens", () => {
    const intent = "A funeral home website with modern dignified design";
    const result = distillPrompt(mockStyle, intent);
    const templateIdx = result.indexOf("practical light");
    const styleIdx = result.indexOf("dramatic lighting");
    expect(templateIdx).toBeLessThan(styleIdx);
  });

  test("does not start with style name", () => {
    const intent = "Album cover for jazz trio";
    const result = distillPrompt(mockStyle, intent);
    expect(result.startsWith("Cinematic")).toBe(false);
  });

  test("respects MAX_PROMPT_LENGTH", () => {
    const intent = "An extremely detailed and elaborate concept for a product photography session featuring handmade artisanal ceramics in a warm studio setting with dramatic side lighting";
    const result = distillPrompt(mockStyle, intent);
    expect(result.length).toBeLessThanOrEqual(2000);
  });

  test("includes palette hex values", () => {
    const result = distillPrompt(mockStyle, "Website for a jazz club");
    expect(result).toMatch(/#[0-9a-fA-F]{6}/);
  });

  test("defaults to website_hero for generic intent", () => {
    const result = distillPrompt(mockStyle, "design something cool");
    expect(result).toContain("practical light source");
  });
});

describe("distillNegative", () => {
  test("includes anti-slop overrides", () => {
    const result = distillNegative(mockStyle);
    expect(result).toContain("generic stock photo");
  });

  test("respects 200 char limit", () => {
    const result = distillNegative(mockStyle);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  test("always includes anti-text terms", () => {
    const result = distillNegative(mockStyle);
    expect(result).toContain("text, words, letters");
  });
});
