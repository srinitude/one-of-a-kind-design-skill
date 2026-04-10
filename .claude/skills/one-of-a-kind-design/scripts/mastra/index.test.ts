/**
 * index.test.ts — Tests for the Mastra instance wiring.
 */

import { describe, expect, it } from "bun:test";
import { mastra } from "./index";

describe("mastra instance", () => {
  it("is defined", () => {
    expect(mastra).toBeDefined();
  });

  it("has prompt-crafter agent registered", () => {
    const agent = mastra.getAgent("promptCrafterAgent");
    expect(agent).toBeDefined();
  });

  it("has tools registered", () => {
    const tool = mastra.getTool("falGenerateImageTool");
    expect(tool).toBeDefined();
  });

  it("has workflows registered", () => {
    const wf = mastra.getWorkflow("design-pipeline-interactive");
    expect(wf).toBeDefined();
  });

  it("has headless workflow registered", () => {
    const wf = mastra.getWorkflow("design-pipeline-headless");
    expect(wf).toBeDefined();
  });

  it("has scorers registered", () => {
    expect(mastra).toBeDefined();
  });
});
