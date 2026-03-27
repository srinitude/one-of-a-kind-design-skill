import { describe, expect, test } from "bun:test";
import { DEFAULT_MODELS, ROUTE_MAP } from "./generate-api-prompt";

const EXPECTED_STAGES = [
  "image-gen",
  "image-edit",
  "style-transfer",
  "controlnet",
  "video-gen",
  "video-camera",
  "video-restyle",
  "3d-gen",
  "upscale",
  "audio-tts",
  "audio-music",
  "annotation",
  "avatar",
  "svg-gen",
  "svg-vectorize",
];

describe("ROUTE_MAP", () => {
  test("all 15 pipeline stages have routes", () => {
    for (const stage of EXPECTED_STAGES) {
      expect(ROUTE_MAP[stage]).toBeDefined();
    }
    expect(Object.keys(ROUTE_MAP).length).toBe(15);
  });

  test("svg-gen routes to QuiverAI", () => {
    expect(ROUTE_MAP["svg-gen"].api).toBe("quiverai");
  });

  test("image-gen routes to fal-ai", () => {
    expect(ROUTE_MAP["image-gen"].api).toBe("fal-ai");
  });

  test("route map keys match expected stages", () => {
    const routeKeys = Object.keys(ROUTE_MAP).sort();
    const expectedSorted = [...EXPECTED_STAGES].sort();
    expect(routeKeys).toEqual(expectedSorted);
  });
});

describe("DEFAULT_MODELS", () => {
  test("all 15 stages have default models", () => {
    for (const stage of EXPECTED_STAGES) {
      expect(DEFAULT_MODELS[stage]).toBeDefined();
      expect(typeof DEFAULT_MODELS[stage]).toBe("string");
      expect(DEFAULT_MODELS[stage].length).toBeGreaterThan(0);
    }
    expect(Object.keys(DEFAULT_MODELS).length).toBe(15);
  });
});
