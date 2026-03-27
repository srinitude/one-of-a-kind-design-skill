import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { selectPipelineModel } from "./select-pipeline-models";

describe("selectPipelineModel", () => {
  test("selects BiRefNet for background-removal", async () => {
    const selection = await Effect.runPromise(selectPipelineModel("background-removal"));
    expect(selection.primary.name).toContain("BiRefNet");
    expect(selection.primary.endpoint).toContain("birefnet");
  });

  test("selects Topaz for upscale-image", async () => {
    const selection = await Effect.runPromise(selectPipelineModel("upscale-image"));
    expect(selection.primary.name).toContain("Topaz");
    expect(selection.primary.endpoint).toContain("topaz");
  });

  test("selects Depth Anything for depth-estimation", async () => {
    const selection = await Effect.runPromise(selectPipelineModel("depth-estimation"));
    expect(selection.primary.name).toContain("Depth Anything");
    expect(selection.primary.endpoint).toContain("depth-anything");
  });

  test("filters by input type", async () => {
    const imageSelection = await Effect.runPromise(
      selectPipelineModel("background-removal", "image"),
    );
    expect(imageSelection.primary.inputType).toBe("image");

    const videoSelection = await Effect.runPromise(
      selectPipelineModel("background-removal", "video"),
    );
    expect(videoSelection.primary.inputType).toBe("video");
  });

  test("fails for unknown stage", async () => {
    const exit = await Effect.runPromiseExit(selectPipelineModel("nonexistent-stage"));
    expect(exit._tag).toBe("Failure");
  });
});
