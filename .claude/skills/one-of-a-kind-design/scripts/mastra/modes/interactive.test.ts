/**
 * modes/interactive.test.ts — Tests for interactive mode exports.
 */

import { describe, expect, it } from "bun:test";
import { retryWithFeedback, runInteractive } from "./interactive";

describe("interactive mode", () => {
  it("exports runInteractive function", () => {
    expect(typeof runInteractive).toBe("function");
  });

  it("exports retryWithFeedback function", () => {
    expect(typeof retryWithFeedback).toBe("function");
  });
});
