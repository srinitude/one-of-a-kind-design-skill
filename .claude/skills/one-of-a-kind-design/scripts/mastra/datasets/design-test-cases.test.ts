/**
 * datasets/design-test-cases.test.ts — Tests for dataset creation.
 */

import { describe, expect, it } from "bun:test";
import { groundTruthSchema, inputSchema } from "./design-test-cases";

describe("design-test-cases", () => {
  describe("inputSchema", () => {
    it("validates correct input", () => {
      const result = inputSchema.safeParse({
        userIntent: "Design a portfolio site",
        outputType: "website",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      const result = inputSchema.safeParse({ userIntent: "test" });
      expect(result.success).toBe(false);
    });
  });

  describe("groundTruthSchema", () => {
    it("validates with minimum composite", () => {
      const result = groundTruthSchema.safeParse({ minimumComposite: 7.0 });
      expect(result.success).toBe(true);
    });

    it("validates with optional chain", () => {
      const result = groundTruthSchema.safeParse({
        minimumComposite: 7.0,
        expectedChain: "t2i",
      });
      expect(result.success).toBe(true);
    });
  });
});
