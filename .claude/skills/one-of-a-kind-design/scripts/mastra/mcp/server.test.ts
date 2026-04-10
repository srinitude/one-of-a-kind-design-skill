/**
 * mcp/server.test.ts — Tests for MCP server tools.
 */

import { describe, expect, it } from "bun:test";
import type { z } from "zod";
import {
  designGenerateTool,
  designResolveStyleTool,
  designScoreTool,
  designVerifyTool,
  mcpTools,
} from "./server";

const safeParse = (schema: unknown, data: unknown) => (schema as z.ZodType).safeParse(data);

describe("MCP Server Tools", () => {
  describe("designGenerateTool", () => {
    it("has correct id", () => {
      expect(designGenerateTool.id).toBe("design-generate");
    });

    it("has input schema with required fields", () => {
      const result = safeParse(designGenerateTool.inputSchema, {
        userIntent: "Design a portfolio site",
        outputType: "website",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid outputType", () => {
      const result = safeParse(designGenerateTool.inputSchema, {
        userIntent: "test",
        outputType: "invalid-type",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("designResolveStyleTool", () => {
    it("has correct id", () => {
      expect(designResolveStyleTool.id).toBe("design-resolve-style");
    });

    it("validates input", () => {
      const result = safeParse(designResolveStyleTool.inputSchema, {
        userIntent: "Minimal restaurant site",
        outputType: "website",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("designScoreTool", () => {
    it("has correct id", () => {
      expect(designScoreTool.id).toBe("design-score");
    });

    it("requires imageUrl and styleId", () => {
      const result = safeParse(designScoreTool.inputSchema, {
        imageUrl: "https://example.com/img.png",
        styleId: "wabi-sabi",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("designVerifyTool", () => {
    it("has correct id", () => {
      expect(designVerifyTool.id).toBe("design-verify");
    });

    it("allows nullable referenceUrl", () => {
      const result = safeParse(designVerifyTool.inputSchema, {
        generatedUrl: "https://example.com/img.png",
        referenceUrl: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("mcpTools", () => {
    it("exports all 4 tools", () => {
      expect(Object.keys(mcpTools)).toHaveLength(4);
      expect(mcpTools["design-generate"]).toBeDefined();
      expect(mcpTools["design-resolve-style"]).toBeDefined();
      expect(mcpTools["design-score"]).toBeDefined();
      expect(mcpTools["design-verify"]).toBeDefined();
    });
  });
});
