# Examples

Six end-to-end pipelines demonstrating the one-of-a-kind-design skill. Each resolves a taxonomy style, generates assets via fal.ai, scores quality with LLaVA 13B vision, and validates a composite score >= 7.0.

## Overview

| Example | User Prompt | Output Type | Style | Composite |
|---------|------------|-------------|-------|-----------|
| [molecular-gastronomy-website](./molecular-gastronomy-website/) | "Design a restaurant website for a molecular gastronomy place in Copenhagen" | website | liquid-glass | 8.14 |
| [wind-farm-dashboard](./wind-farm-dashboard/) | "Dashboard for a wind farm monitoring system. Real-time turbine data." | web-app | bento-ui | 7.69 |
| [ocean-plastic-infographic](./ocean-plastic-infographic/) | "Infographic about ocean plastic pollution for a nonprofit annual report" | image | swiss-international | 7.70 |
| [meditation-icon-set](./meditation-icon-set/) | "Icon set for a meditation app. 12 icons. Calm, minimal." | svg | scandinavian-minimalism | 8.02 |
| [prism-logo-reveal](./prism-logo-reveal/) | "5-second logo reveal animation for a tech startup called 'Prism'" | video | liquid-glass | 7.18 |
| [language-learning-onboarding](./language-learning-onboarding/) | "Onboarding screens for a language learning app targeting adults" | mobile-app | material-design | 7.35 |

## Running

```bash
# Ensure .env is set with FAL_KEY
bun run examples/molecular-gastronomy-website/run.ts
bun run examples/wind-farm-dashboard/run.ts
bun run examples/ocean-plastic-infographic/run.ts
bun run examples/meditation-icon-set/run.ts
bun run examples/prism-logo-reveal/run.ts
bun run examples/language-learning-onboarding/run.ts
```

## Pipeline Steps (all examples)

1. Load `brief.yaml` with user prompt and resolved metadata
2. Load `TAXONOMY.yaml` and call `resolveStyle` (attaches `dialModifiers`, `conventionBreak`, `audienceFit`)
3. `selectModel` picks fal.ai endpoint based on style affinity and tier
4. `distillPrompt` produces a <=300 char prompt with subject-first ordering and word-boundary truncation
5. `runFalGeneration` calls the API with seed pinning and retry logic
6. `computeRealScores` runs LLaVA 13B vision for structured quality evaluation
7. `computeComposite` scores quality (9 sub-scores with weights)

## Quality Threshold

All examples target a composite score >= 7.0/10. The score card breaks down all sub-scores with weights. Selected from the top-performing invocations in the 20-test validation suite (one per output type).
