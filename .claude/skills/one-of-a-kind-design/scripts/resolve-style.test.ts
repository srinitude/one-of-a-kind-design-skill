import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { parse as parseYaml } from "yaml";
import { inferStyleFromContext, resolveStyle } from "./resolve-style";

async function loadTestTaxonomy(): Promise<Record<string, unknown>> {
  const path = new URL("../references/TAXONOMY.yaml", import.meta.url).pathname;
  const content = await Bun.file(path).text();
  return parseYaml(content) as Record<string, unknown>;
}

describe("resolveStyle", () => {
  test('resolves "art-deco" to correct style config', async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(resolveStyle(taxonomy, { styleId: "art-deco" }));
    expect(resolved.id).toBe("art-deco");
    expect(resolved.name).toBeDefined();
    expect(resolved.tags).toBeInstanceOf(Array);
    expect(resolved.designSystemParameters).toBeDefined();
  });

  test("returns correct tags for each style", async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(resolveStyle(taxonomy, { styleId: "art-deco" }));
    expect(resolved.tags.length).toBeGreaterThan(0);
    expect(resolved.tags.every((t: string) => typeof t === "string")).toBe(true);
  });

  test("applies dial overrides", async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(
      resolveStyle(taxonomy, {
        styleId: "art-deco",
        dialOverrides: { design_variance: 9, motion_intensity: 2 },
      }),
    );
    expect(resolved.dials.design_variance).toBe(9);
    expect(resolved.dials.motion_intensity).toBe(2);
  });

  test("includes dialModifiers in resolved style", async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(resolveStyle(taxonomy, { styleId: "art-deco" }));
    expect(resolved.dialModifiers).toBeDefined();
    expect(resolved.dialModifiers.motionScale).toBeGreaterThan(0);
    expect(typeof resolved.dialModifiers.densityClass).toBe("string");
    expect(typeof resolved.dialModifiers.typographyTier).toBe("string");
  });

  test("includes conventionBreak in resolved style", async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(resolveStyle(taxonomy, { styleId: "art-deco" }));
    expect(resolved.conventionBreak).toBeDefined();
    expect(typeof resolved.conventionBreak.applied).toBe("boolean");
    expect(typeof resolved.conventionBreak.reason).toBe("string");
  });

  test("includes audienceFit in resolved style", async () => {
    const taxonomy = await loadTestTaxonomy();
    const resolved = await Effect.runPromise(resolveStyle(taxonomy, { styleId: "art-deco" }));
    expect(resolved.audienceFit).toBeDefined();
    expect(["strong", "unexpected", "neutral"]).toContain(resolved.audienceFit.fitType);
    expect(resolved.audienceFit.fitScore).toBeGreaterThanOrEqual(0);
  });

  test("dial overrides affect dialModifiers", async () => {
    const taxonomy = await loadTestTaxonomy();
    const low = await Effect.runPromise(
      resolveStyle(taxonomy, {
        styleId: "art-deco",
        dialOverrides: { design_variance: 1, motion_intensity: 1 },
      }),
    );
    const high = await Effect.runPromise(
      resolveStyle(taxonomy, {
        styleId: "art-deco",
        dialOverrides: { design_variance: 10, motion_intensity: 10 },
      }),
    );
    expect(low.dialModifiers.motionScale).toBeLessThan(high.dialModifiers.motionScale);
  });
});

describe("inferStyleFromContext", () => {
  test('infers "neubrutalism" from mood "bold"', async () => {
    const taxonomy = await loadTestTaxonomy();
    const styleId = inferStyleFromContext(taxonomy, { mood: ["bold"] });
    expect(styleId).toBe("neubrutalism");
  });

  test('infers "cinematic" from industry "luxury"', async () => {
    const taxonomy = await loadTestTaxonomy();
    const styleId = inferStyleFromContext(taxonomy, { industry: "luxury" });
    expect(styleId).toBe("cinematic");
  });
});
