# 02 - E2B Sandbox SVG Optimization

Demonstrates E2B sandbox usage for SVG processing:

1. **Create sandbox** - Spins up an isolated E2B sandbox
2. **Upload SVG** - Writes a sample SVG into the sandbox filesystem
3. **Run SVGO** - Executes SVGO optimization inside the sandbox
4. **Download result** - Retrieves the optimized SVG and logs stats

Uses `Effect.acquireUseRelease` to guarantee sandbox cleanup.

## Run

```bash
bun run examples/02-e2b-svg-optimization/run.ts
```

## Requirements

- `E2B_API_KEY` set in `.env` at repo root
- `bun install` completed
