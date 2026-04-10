/**
 * browser/ux-research.test.ts — Tests for UX research browser.
 */

import { describe, expect, it } from "bun:test";
import { researchIndustryUx, uxResearchBrowser } from "./ux-research";

describe("ux-research browser", () => {
  it("exports uxResearchBrowser instance", () => {
    expect(uxResearchBrowser).toBeDefined();
    expect(uxResearchBrowser.name).toBe("StagehandBrowser");
  });

  it("exports researchIndustryUx function", () => {
    expect(typeof researchIndustryUx).toBe("function");
  });
});
