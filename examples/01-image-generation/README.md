# 01 - Image Generation Pipeline

Demonstrates the end-to-end image generation workflow:

1. **Resolve style** - Loads the `bauhaus` style from the taxonomy YAML
2. **Select fal model** - Picks the best fal.ai model for the style + output type + tier
3. **Generate prompt** - Builds a deterministic prompt ID and crafter context
4. **Run fal.ai generation** - Calls fal.ai with the selected model, prompt, and seed pinning

## Run

```bash
bun run examples/01-image-generation/run.ts
```

## Requirements

- `FAL_KEY` set in `.env` at repo root
- `bun install` completed
