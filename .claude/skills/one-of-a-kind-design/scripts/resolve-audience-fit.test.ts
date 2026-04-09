import { describe, expect, test } from "bun:test";
import { resolveAudienceFit } from "./resolve-audience-fit";

const ART_DECO_FIT = {
  strong: ["luxury SaaS", "high-end hospitality", "fashion brands"],
  unexpected: ["developer API docs", "fintech dashboards"],
};

describe("resolveAudienceFit", () => {
  test('art-deco + "luxury SaaS" -> fitType strong, fitScore >= 8', () => {
    const result = resolveAudienceFit("luxury SaaS", ART_DECO_FIT);
    expect(result.fitType).toBe("strong");
    expect(result.fitScore).toBeGreaterThanOrEqual(8);
  });

  test('art-deco + "developer API docs" -> fitType unexpected, fitScore >= 6', () => {
    const result = resolveAudienceFit("developer API docs", ART_DECO_FIT);
    expect(result.fitType).toBe("unexpected");
    expect(result.fitScore).toBeGreaterThanOrEqual(6);
  });

  test('art-deco + "pet grooming" -> fitType neutral, fitScore 5', () => {
    const result = resolveAudienceFit("pet grooming", ART_DECO_FIT);
    expect(result.fitType).toBe("neutral");
    expect(result.fitScore).toBe(5);
  });

  test("same inputs always same output", () => {
    const a = resolveAudienceFit("luxury SaaS", ART_DECO_FIT);
    const b = resolveAudienceFit("luxury SaaS", ART_DECO_FIT);
    expect(a).toEqual(b);
  });

  test("strong fit includes adjustments", () => {
    const result = resolveAudienceFit("luxury SaaS", ART_DECO_FIT);
    expect(result.adjustments.length).toBeGreaterThan(0);
  });

  test("unexpected fit includes audience note explaining why it works", () => {
    const result = resolveAudienceFit("developer API docs", ART_DECO_FIT);
    expect(result.audienceNote.length).toBeGreaterThan(0);
    expect(result.audienceNote.toLowerCase()).toContain("unexpected");
  });

  test("neutral fit has empty adjustments", () => {
    const result = resolveAudienceFit("pet grooming", ART_DECO_FIT);
    expect(result.adjustments).toEqual([]);
  });

  test("case-insensitive matching works", () => {
    const result = resolveAudienceFit("Luxury SaaS", ART_DECO_FIT);
    expect(result.fitType).toBe("strong");
  });

  test("empty audience market fit returns neutral", () => {
    const result = resolveAudienceFit("anything", { strong: [], unexpected: [] });
    expect(result.fitType).toBe("neutral");
    expect(result.fitScore).toBe(5);
  });
});
