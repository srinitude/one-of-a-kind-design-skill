/**
 * modes/headless.test.ts — Tests for headless mode exports.
 */

import { describe, expect, it } from "bun:test";
import { runExperiment, runHeadless } from "./headless";

describe("headless mode", () => {
  it("exports runHeadless function", () => {
    expect(typeof runHeadless).toBe("function");
  });

  it("exports runExperiment function", () => {
    expect(typeof runExperiment).toBe("function");
  });
});
