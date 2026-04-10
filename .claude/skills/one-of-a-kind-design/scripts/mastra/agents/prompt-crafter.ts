/**
 * prompt-crafter.ts — Mastra Agent for prompt crafting.
 * Uses streaming via .stream() for real-time prompt crafting visibility.
 */

import { Agent } from "@mastra/core/agent";
import type { Effect } from "effect";

export type AgentRef = Effect.Effect<void>;

export const promptCrafterAgent = new Agent({
  id: "prompt-crafter",
  name: "Prompt Crafter",
  model: "anthropic/claude-sonnet-4-6",
  instructions: `You craft focused image/video generation prompts.
Rules:
- Subject first. State what the image depicts.
- Max 300 characters total.
- Include 2-3 hex color values from the style palette.
- Include one composition directive.
- Never start with style words.
- Never use vague modifiers (beautiful, stunning, amazing).
- End with "sharp, detailed".
Output ONLY the prompt text, nothing else.`,
});
