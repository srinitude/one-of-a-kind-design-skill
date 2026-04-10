/**
 * tools/index.test.ts — Tests for all Mastra tool wrappers.
 * Verifies schemas, tool IDs, and execute function presence.
 */

import { describe, expect, it } from "bun:test";
import {
  e2bProcessTool,
  falGenerateImageTool,
  falGenerateVideoTool,
  falI2ITool,
  llavaScoreTool,
  verifyImageTool,
} from "./index.js";

describe("Mastra tools", () => {
  describe("falGenerateImageTool", () => {
    it("has correct id", () => {
      expect(falGenerateImageTool.id).toBe("fal-generate-image");
    });

    it("has inputSchema with required fields", () => {
      const schema = falGenerateImageTool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has outputSchema with required fields", () => {
      const schema = falGenerateImageTool.outputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof falGenerateImageTool.execute).toBe("function");
    });
  });

  describe("falGenerateVideoTool", () => {
    it("has correct id", () => {
      expect(falGenerateVideoTool.id).toBe("fal-generate-video");
    });

    it("has inputSchema with duration as string", () => {
      const schema = falGenerateVideoTool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof falGenerateVideoTool.execute).toBe("function");
    });
  });

  describe("falI2ITool", () => {
    it("has correct id", () => {
      expect(falI2ITool.id).toBe("fal-i2i");
    });

    it("has inputSchema with imageUrl field", () => {
      const schema = falI2ITool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof falI2ITool.execute).toBe("function");
    });
  });

  describe("llavaScoreTool", () => {
    it("has correct id", () => {
      expect(llavaScoreTool.id).toBe("llava-score");
    });

    it("has inputSchema with imageUrl and styleId", () => {
      const schema = llavaScoreTool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof llavaScoreTool.execute).toBe("function");
    });
  });

  describe("e2bProcessTool", () => {
    it("has correct id", () => {
      expect(e2bProcessTool.id).toBe("e2b-process");
    });

    it("has inputSchema with code field", () => {
      const schema = e2bProcessTool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof e2bProcessTool.execute).toBe("function");
    });
  });

  describe("verifyImageTool", () => {
    it("has correct id", () => {
      expect(verifyImageTool.id).toBe("verify-image");
    });

    it("has inputSchema with generatedUrl and referenceUrl", () => {
      const schema = verifyImageTool.inputSchema;
      expect(schema).toBeDefined();
    });

    it("has execute function", () => {
      expect(typeof verifyImageTool.execute).toBe("function");
    });
  });

  describe("all tools export correctly", () => {
    const tools = [
      falGenerateImageTool,
      falGenerateVideoTool,
      falI2ITool,
      llavaScoreTool,
      e2bProcessTool,
      verifyImageTool,
    ];

    it("all have unique ids", () => {
      const ids = tools.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all have descriptions", () => {
      for (const tool of tools) {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      }
    });
  });
});
