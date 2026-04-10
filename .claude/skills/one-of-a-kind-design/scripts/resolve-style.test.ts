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

  // --- Expanded mood map ---
  test('mood "dignified" → swiss-international', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { mood: ["dignified"] })).toBe("swiss-international");
  });

  test('mood "edgy" → glitch', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { mood: ["edgy"] })).toBe("glitch");
  });

  test('mood "intimate" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { mood: ["intimate"] })).toBe("cinematic");
  });

  test('mood "smoky" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { mood: ["smoky"] })).toBe("cinematic");
  });

  test('mood "underground" → brutalist-web', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { mood: ["underground"] })).toBe("brutalist-web");
  });

  // --- Expanded industry map ---
  test('industry "funeral" → swiss-international', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "funeral" })).toBe("swiss-international");
  });

  test('industry "music" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "music" })).toBe("cinematic");
  });

  test('industry "jazz" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "jazz" })).toBe("cinematic");
  });

  test('industry "film" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "film" })).toBe("cinematic");
  });

  test('industry "fashion" → editorial-minimalism', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "fashion" })).toBe("editorial-minimalism");
  });

  test('industry "gaming" → glitch', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "gaming" })).toBe("glitch");
  });

  test('industry "nightlife" → brutalist-web', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "nightlife" })).toBe("brutalist-web");
  });

  test('industry "wearables" → studio-product', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "wearables" })).toBe("studio-product");
  });

  test('industry "wellness" → scandinavian-minimalism', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(inferStyleFromContext(taxonomy, { industry: "wellness" })).toBe(
      "scandinavian-minimalism",
    );
  });

  // --- Compound phrase detection via _userIntent ---
  test('compound: "funeral home" → swiss-international', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "death_care",
        mood: ["minimal"],
        _userIntent: "funeral home that doesn't feel depressing",
      }),
    ).toBe("swiss-international");
  });

  test('compound: "jazz trio" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "entertainment",
        mood: ["dark"],
        _userIntent: "jazz trio debut record smoky intimate",
      }),
    ).toBe("cinematic");
  });

  test('compound: "techno party" → glitch or brutalist-web', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(["glitch", "brutalist-web"]).toContain(
      inferStyleFromContext(taxonomy, {
        industry: "entertainment",
        mood: ["raw"],
        _userIntent: "warehouse techno party in Berlin",
      }),
    );
  });

  test('compound: "film production" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "entertainment",
        _userIntent: "film production company timeline",
      }),
    ).toBe("cinematic");
  });

  test('compound: "smart watch" → studio-product', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "tech",
        _userIntent: "smartwatch product video different environments",
      }),
    ).toBe("studio-product");
  });

  test('compound: "molecular gastronomy" → liquid-glass', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "food",
        _userIntent: "molecular gastronomy place in Copenhagen",
      }),
    ).toBe("liquid-glass");
  });

  test('compound: "album cover" → cinematic', async () => {
    const taxonomy = await loadTestTaxonomy();
    expect(
      inferStyleFromContext(taxonomy, {
        industry: "entertainment",
        _userIntent: "album cover for a jazz trio",
      }),
    ).toBe("cinematic");
  });
});
