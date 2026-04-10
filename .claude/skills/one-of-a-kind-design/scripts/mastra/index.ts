/**
 * index.ts — Wire everything together into a single Mastra instance.
 * Central entry point for tools, agents, workflows, scorers, and MCP.
 */

import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import type { Effect } from "effect";
import { promptCrafterAgent } from "./agents/prompt-crafter.js";
import { mcpTools } from "./mcp/server.js";
import { designQualityScorer, styleConsistencyScorer, uniquenessScorer } from "./scorers/index.js";
import {
  e2bProcessTool,
  falGenerateImageTool,
  falGenerateVideoTool,
  falI2ITool,
  llavaScoreTool,
  verifyImageTool,
} from "./tools/index.js";
import { designPipelineHeadless } from "./workflows/design-pipeline-headless.js";
import { designPipelineInteractive } from "./workflows/design-pipeline-interactive.js";

export type MastraRef = Effect.Effect<void>;

export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: "design-store",
    url: "file:./.mastra/store.db",
  }),
  agents: { promptCrafterAgent },
  tools: {
    falGenerateImageTool,
    falGenerateVideoTool,
    falI2ITool,
    llavaScoreTool,
    e2bProcessTool,
    verifyImageTool,
    ...mcpTools,
  },
  workflows: {
    "design-pipeline-interactive": designPipelineInteractive,
    "design-pipeline-headless": designPipelineHeadless,
  },
  scorers: {
    designQualityScorer,
    styleConsistencyScorer,
    uniquenessScorer,
  },
});
