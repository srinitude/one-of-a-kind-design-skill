# 04 - Determinism Demo

Demonstrates why determinism matters and what was fixed:

## What was broken

- `generatePromptId()` used `Date.now()` + `Math.random()` - different ID every run
- `crypto.randomUUID()` fallback in fal.ai generation - non-deterministic prompt IDs
- No seed pinning - fal.ai outputs varied between runs

## What was fixed

- `buildPromptId(stage, styleId, intent)` uses SHA-256 hash - same inputs always produce the same ID
- Deterministic fallback IDs using `Bun.CryptoHasher` in all generation scripts
- Default seed 42 injected into fal.ai calls for reproducible outputs

## Run

```bash
bun run examples/04-determinism-demo/run.ts
```

The script runs the same inputs twice and verifies identical prompt IDs.
