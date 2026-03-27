---
description: fal.ai subscribe patterns, QuiverAI SDK patterns, E2B sandbox patterns
paths:
  - ".claude/skills/one-of-a-kind-design/scripts/run-*.ts"
  - ".claude/skills/one-of-a-kind-design/scripts/e2b-*.ts"
---

## fal.ai Integration

Use `@fal-ai/client` subscribe pattern. Reference: `.claude/skills/one-of-a-kind-design/references/FAL-API-PATTERNS.md`.

Key patterns:
- Always use `fal.subscribe()` (not `fal.run()`) for streaming progress
- Model registry: `.claude/skills/one-of-a-kind-design/references/MODEL-REGISTRY-FAL.md` (48 image, 45 video)
- Pipeline models: `.claude/skills/one-of-a-kind-design/references/PIPELINE-MODELS.md` (89 utility models)
- Select models via `.claude/skills/one-of-a-kind-design/scripts/select-fal-models.ts` and `.claude/skills/one-of-a-kind-design/scripts/select-pipeline-models.ts`

## QuiverAI Integration

Use `@quiverai/sdk` for SVG generation. Reference: `.claude/skills/one-of-a-kind-design/references/QUIVER-API-PATTERNS.md`.

Key patterns:
- Text-to-SVG: `.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-generation.ts`
- Image-to-SVG: `.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-vectorization.ts`
- Vector-first: prefer QuiverAI for logos, icons, decorative elements

## E2B Sandbox Integration

Use `@e2b/code-interpreter` for isolated execution. Reference: `.claude/skills/one-of-a-kind-design/references/E2B-PATTERNS.md`.

Key patterns:
- Sandbox manager: `.claude/skills/one-of-a-kind-design/scripts/e2b-sandbox-manager.ts`
- UX research execution: `.claude/skills/one-of-a-kind-design/scripts/run-ux-research.ts`
- Always clean up sandboxes after use

## All Three Keys Required

- `FAL_KEY`: fal.ai API access
- `E2B_API_KEY`: E2B sandbox access
- `QUIVERAI_API_KEY`: QuiverAI SVG access

Validate before any API call: `bun run check-keys`
