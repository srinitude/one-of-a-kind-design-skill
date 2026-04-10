/**
 * prompt-crafter.test.ts — Tests for the prompt crafter agent.
 */

import { describe, expect, it } from "bun:test";
import { promptCrafterAgent } from "./prompt-crafter";

describe("promptCrafterAgent", () => {
  it("has correct id", () => {
    expect(promptCrafterAgent.id).toBe("prompt-crafter");
  });

  it("has correct name", () => {
    expect(promptCrafterAgent.name).toBe("Prompt Crafter");
  });

  it("is an Agent instance with expected properties", () => {
    expect(promptCrafterAgent).toBeDefined();
    expect(typeof promptCrafterAgent.generate).toBe("function");
    expect(typeof promptCrafterAgent.stream).toBe("function");
  });
});
