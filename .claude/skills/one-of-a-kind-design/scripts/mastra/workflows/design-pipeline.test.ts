/**
 * design-pipeline.test.ts — Tests for both interactive and headless pipelines.
 */

import { describe, expect, it } from "bun:test";
import { designPipelineHeadless } from "./design-pipeline-headless.js";
import { designPipelineInteractive } from "./design-pipeline-interactive.js";
import { craftPromptStep } from "./steps/craft-prompt-step.js";
import { generateStep } from "./steps/generate-step.js";
import { persistContextStep } from "./steps/persist-context-step.js";
import { postProcessStep } from "./steps/post-process-step.js";
import { qualityGateHeadlessStep } from "./steps/quality-gate-headless.js";
import { qualityGateInteractiveStep } from "./steps/quality-gate-interactive.js";
import { resolveStyleStep } from "./steps/resolve-style-step.js";
import { scoreStep } from "./steps/score-step.js";
import { selectModelsStep } from "./steps/select-models-step.js";
import { verifyStep } from "./steps/verify-step.js";

describe("Design Pipeline - Workflows", () => {
  describe("designPipelineInteractive", () => {
    it("has correct workflow id", () => {
      expect(designPipelineInteractive.id).toBe("design-pipeline-interactive");
    });

    it("has inputSchema defined", () => {
      expect(designPipelineInteractive.inputSchema).toBeDefined();
    });

    it("has outputSchema defined", () => {
      expect(designPipelineInteractive.outputSchema).toBeDefined();
    });
  });

  describe("designPipelineHeadless", () => {
    it("has correct workflow id", () => {
      expect(designPipelineHeadless.id).toBe("design-pipeline-headless");
    });

    it("has inputSchema defined", () => {
      expect(designPipelineHeadless.inputSchema).toBeDefined();
    });

    it("has outputSchema defined", () => {
      expect(designPipelineHeadless.outputSchema).toBeDefined();
    });
  });
});

describe("Design Pipeline - Shared Steps", () => {
  describe("resolveStyleStep", () => {
    it("has correct id", () => {
      expect(resolveStyleStep.id).toBe("resolve-style");
    });

    it("has execute function", () => {
      expect(typeof resolveStyleStep.execute).toBe("function");
    });

    it("has inputSchema and outputSchema", () => {
      expect(resolveStyleStep.inputSchema).toBeDefined();
      expect(resolveStyleStep.outputSchema).toBeDefined();
    });
  });

  describe("selectModelsStep", () => {
    it("has correct id", () => {
      expect(selectModelsStep.id).toBe("select-models");
    });

    it("has execute function", () => {
      expect(typeof selectModelsStep.execute).toBe("function");
    });
  });

  describe("craftPromptStep", () => {
    it("has correct id", () => {
      expect(craftPromptStep.id).toBe("craft-prompt");
    });

    it("has execute function", () => {
      expect(typeof craftPromptStep.execute).toBe("function");
    });
  });

  describe("generateStep", () => {
    it("has correct id", () => {
      expect(generateStep.id).toBe("generate-artifact");
    });

    it("has execute function", () => {
      expect(typeof generateStep.execute).toBe("function");
    });
  });

  describe("postProcessStep", () => {
    it("has correct id", () => {
      expect(postProcessStep.id).toBe("post-process");
    });

    it("has execute function", () => {
      expect(typeof postProcessStep.execute).toBe("function");
    });
  });

  describe("verifyStep", () => {
    it("has correct id", () => {
      expect(verifyStep.id).toBe("verify");
    });

    it("has execute function", () => {
      expect(typeof verifyStep.execute).toBe("function");
    });
  });

  describe("scoreStep", () => {
    it("has correct id", () => {
      expect(scoreStep.id).toBe("score-quality");
    });

    it("has execute function", () => {
      expect(typeof scoreStep.execute).toBe("function");
    });
  });

  describe("persistContextStep", () => {
    it("has correct id", () => {
      expect(persistContextStep.id).toBe("persist-context");
    });

    it("has execute function", () => {
      expect(typeof persistContextStep.execute).toBe("function");
    });
  });
});

describe("Design Pipeline - Quality Gates", () => {
  describe("qualityGateInteractiveStep", () => {
    it("has correct id", () => {
      expect(qualityGateInteractiveStep.id).toBe("quality-gate");
    });

    it("has suspendSchema for human-in-the-loop", () => {
      expect(qualityGateInteractiveStep.suspendSchema).toBeDefined();
    });

    it("has resumeSchema for user response", () => {
      expect(qualityGateInteractiveStep.resumeSchema).toBeDefined();
    });
  });

  describe("qualityGateHeadlessStep", () => {
    it("has correct id", () => {
      expect(qualityGateHeadlessStep.id).toBe("quality-gate-headless");
    });

    it("does NOT have suspendSchema (fully autonomous)", () => {
      expect(qualityGateHeadlessStep.suspendSchema).toBeUndefined();
    });

    it("does NOT have resumeSchema (no human input)", () => {
      expect(qualityGateHeadlessStep.resumeSchema).toBeUndefined();
    });
  });
});

describe("Design Pipeline - Step unique IDs", () => {
  it("all shared steps have unique ids", () => {
    const steps = [
      resolveStyleStep,
      selectModelsStep,
      craftPromptStep,
      generateStep,
      postProcessStep,
      verifyStep,
      scoreStep,
      persistContextStep,
    ];
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
