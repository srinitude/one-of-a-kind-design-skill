/**
 * scorers/index.test.ts — Tests for custom Mastra scorers.
 */

import { describe, expect, it } from "bun:test";
import { designQualityScorer, styleConsistencyScorer, uniquenessScorer } from "./index";

describe("scorers", () => {
  describe("designQualityScorer", () => {
    it("is defined", () => {
      expect(designQualityScorer).toBeDefined();
    });

    it("has content-similarity id", () => {
      expect(designQualityScorer.id).toBe("content-similarity-scorer");
    });
  });

  describe("styleConsistencyScorer", () => {
    it("has correct id", () => {
      expect(styleConsistencyScorer.id).toBe("style-consistency-scorer");
    });

    it("has a run function", () => {
      expect(typeof styleConsistencyScorer.run).toBe("function");
    });
  });

  describe("uniquenessScorer", () => {
    it("has correct id", () => {
      expect(uniquenessScorer.id).toBe("uniqueness-scorer");
    });

    it("has a run function", () => {
      expect(typeof uniquenessScorer.run).toBe("function");
    });
  });
});
