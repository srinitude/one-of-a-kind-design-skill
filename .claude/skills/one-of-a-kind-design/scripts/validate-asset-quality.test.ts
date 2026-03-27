import { describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { validateAsset } from "./validate-asset-quality";

const TMP_DIR = join(import.meta.dir, ".test-tmp-assets");

async function setup() {
  await mkdir(TMP_DIR, { recursive: true });
}

async function teardown() {
  await rm(TMP_DIR, { recursive: true, force: true });
}

describe("validateAsset", () => {
  test("validates SVG with viewBox passes", async () => {
    await setup();
    const svgPath = join(TMP_DIR, "valid.svg");
    const svgContent = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>`;
    await writeFile(svgPath, svgContent, "utf-8");

    const result = await validateAsset(svgPath, "svg");
    expect(result.passed).toBe(true);
    const viewBoxCheck = result.checks.find((c) => c.name === "has-viewBox");
    expect(viewBoxCheck?.passed).toBe(true);

    await teardown();
  });

  test("validates SVG without viewBox fails", async () => {
    await setup();
    const svgPath = join(TMP_DIR, "no-viewbox.svg");
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>`;
    await writeFile(svgPath, svgContent, "utf-8");

    const result = await validateAsset(svgPath, "svg");
    const viewBoxCheck = result.checks.find((c) => c.name === "has-viewBox");
    expect(viewBoxCheck?.passed).toBe(false);

    await teardown();
  });

  test("detects embedded raster in SVG", async () => {
    await setup();
    const svgPath = join(TMP_DIR, "raster.svg");
    const svgContent = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,abc" width="100" height="100"/></svg>`;
    await writeFile(svgPath, svgContent, "utf-8");

    const result = await validateAsset(svgPath, "svg");
    const rasterCheck = result.checks.find((c) => c.name === "no-embedded-raster");
    expect(rasterCheck?.passed).toBe(false);

    await teardown();
  });

  test("checks file size thresholds", async () => {
    await setup();
    const svgPath = join(TMP_DIR, "small.svg");
    const svgContent = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>`;
    await writeFile(svgPath, svgContent, "utf-8");

    const result = await validateAsset(svgPath, "svg");
    const sizeCheck = result.checks.find((c) => c.name === "file-size");
    expect(sizeCheck?.passed).toBe(true);

    await teardown();
  });
});
