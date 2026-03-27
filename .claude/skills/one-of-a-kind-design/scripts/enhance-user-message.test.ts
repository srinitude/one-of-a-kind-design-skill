import { describe, expect, test } from "bun:test";
import { buildEnhancement, computeSpecificity, extractDimensions } from "./enhance-user-message";

describe("extractDimensions", () => {
  test('extracts outputType "website" from "build me a landing page"', () => {
    const dims = extractDimensions("build me a landing page");
    expect(dims.outputType).toBe("website");
  });

  test('extracts industry "luxury" from "luxury hotel"', () => {
    const dims = extractDimensions("luxury hotel website");
    expect(dims.industry).toBe("luxury");
  });
});

describe("computeSpecificity", () => {
  test('computes specificity 0 for "make something cool"', () => {
    const dims = extractDimensions("make something cool");
    const score = computeSpecificity(dims);
    expect(score).toBe(0);
  });

  test("computes specificity 5+ for a highly specific prompt", () => {
    const dims = extractDimensions(
      "Build me a bold art-deco luxury hotel landing page for enterprise b2b with premium quality",
    );
    const score = computeSpecificity(dims);
    expect(score).toBeGreaterThanOrEqual(5);
  });
});

describe("buildEnhancement", () => {
  test("builds enhancement string with correct format", () => {
    const dims = extractDimensions("build me a bold art-deco luxury hotel landing page");
    const enhancement = buildEnhancement(dims);
    expect(enhancement).toContain("[output: website]");
    expect(enhancement).toContain("[industry: luxury]");
    expect(enhancement).toContain("[mood: bold]");
    expect(enhancement).toContain("[style: art-deco]");
  });

  test("returns empty enhancement for empty input", () => {
    const dims = extractDimensions("");
    const enhancement = buildEnhancement(dims);
    expect(enhancement).toBe("");
  });
});
