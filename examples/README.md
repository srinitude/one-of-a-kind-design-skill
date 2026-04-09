# Examples

Six end-to-end pipelines demonstrating the one-of-a-kind-design skill. Each resolves a taxonomy style, generates assets via fal.ai, scores quality with LLaVA 13B vision, and validates a composite score >= 7.0.

## Overview

| Example | User Prompt | Output Type | Style | Composite |
|---------|------------|-------------|-------|-----------|
| [crypto-exchange-landing](./crypto-exchange-landing/) | "Landing page for a cryptocurrency exchange targeting institutional investors" | website | swiss-international | 7.56 |
| [film-production-dashboard](./film-production-dashboard/) | "Project management tool for a film production company. Timeline-heavy." | web-app | vaporwave | 7.94 |
| [jazz-album-cover](./jazz-album-cover/) | "Album cover for a jazz trio's debut record. Smoky, intimate, blue." | image | vaporwave | 8.14 |
| [meditation-icon-set](./meditation-icon-set/) | "Icon set for a meditation app. 12 icons. Calm, minimal." | svg | editorial-minimalism | 7.67 |
| [prism-logo-reveal](./prism-logo-reveal/) | "5-second logo reveal animation for a tech startup called 'Prism'" | video | bento-ui | 7.18 |
| [privacy-email-settings](./privacy-email-settings/) | "Settings page for a privacy-focused email client" | mobile-app | bento-ui | 7.52 |

## Running

```bash
# Ensure .env is set with FAL_KEY
bun run examples/crypto-exchange-landing/run.ts
bun run examples/film-production-dashboard/run.ts
bun run examples/jazz-album-cover/run.ts
bun run examples/meditation-icon-set/run.ts
bun run examples/prism-logo-reveal/run.ts
bun run examples/privacy-email-settings/run.ts
```

## Pipeline Steps (all examples)

1. Load `brief.yaml` with user prompt and resolved metadata
2. Load `TAXONOMY.yaml` and call `resolveStyle` (attaches `dialModifiers`, `conventionBreak`, `audienceFit`)
3. `selectModel` picks fal.ai endpoint based on style affinity and tier
4. `distillPrompt` produces a <=300 char prompt with style tokens
5. `runFalGeneration` calls the API with seed pinning and retry logic
6. `computeRealScores` runs LLaVA 13B vision for structured quality evaluation
7. `computeComposite` scores quality (9 sub-scores with weights)

## Quality Threshold

All examples target a composite score >= 7.0/10. The score card breaks down all sub-scores with weights. Selected from the top-performing invocations in the 20-test validation suite (one per output type).
