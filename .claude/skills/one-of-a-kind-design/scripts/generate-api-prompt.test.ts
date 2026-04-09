import { describe, expect, test } from "bun:test";
import {
  buildCrafterContext,
  buildPromptId,
  DEFAULT_MODELS,
  ROUTE_MAP,
} from "./generate-api-prompt";

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

describe("buildPromptId", () => {
  test("same inputs produce same promptId (deterministic)", () => {
    const id1 = buildPromptId("image-gen", "art-deco", "luxury hotel hero");
    const id2 = buildPromptId("image-gen", "art-deco", "luxury hotel hero");
    expect(id1).toBe(id2);
  });

  test("different inputs produce different promptIds", () => {
    const id1 = buildPromptId("image-gen", "art-deco", "luxury hotel hero");
    const id2 = buildPromptId("video-gen", "art-deco", "luxury hotel hero");
    const id3 = buildPromptId("image-gen", "cinematic", "luxury hotel hero");
    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
  });

  test("promptId is a 16-character hex string", () => {
    const id = buildPromptId("image-gen", "art-deco", "test");
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });
});

describe("buildCrafterContext", () => {
  test("includes stage and style info", () => {
    const ctx = buildCrafterContext(
      "image-gen",
      { id: "art-deco", name: "Art Deco" },
      "hero image",
    );
    expect(ctx).toContain("Pipeline stage: image-gen");
    expect(ctx).toContain("Style: art-deco (Art Deco)");
    expect(ctx).toContain("User intent: hero image");
  });
});
