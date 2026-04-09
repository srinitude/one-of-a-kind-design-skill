# 03 - Full Pipeline

Demonstrates the complete workflow chaining all steps with Effect:

1. **Resolve style** - Loads `cinematic` style from taxonomy
2. **Select model** - Picks the best fal.ai model for cinematic image generation
3. **Generate prompt** - Builds deterministic prompt ID and crafter context
4. **Run fal.ai generation** - Generates the image
5. **E2B post-processing** - Runs format conversion in an E2B sandbox

Shows proper Effect error handling with `Effect.catchTag`.

## Run

```bash
bun run examples/03-full-pipeline/run.ts
```

## Requirements

- `FAL_KEY` and `E2B_API_KEY` set in `.env` at repo root
- `bun install` completed
