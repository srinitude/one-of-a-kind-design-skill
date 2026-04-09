# Examples

Six end-to-end pipelines demonstrating the one-of-a-kind-design skill. Each reads a `brief.yaml`, resolves a taxonomy style with dials and convention breaks, generates assets via fal.ai or QuiverAI, post-processes in an E2B sandbox, scores quality, and logs an audit entry.

## Overview

| Example | Output | Style | Unique Angle | E2B Step |
|---------|--------|-------|--------------|----------|
| [omakase-counter-rebrand](./omakase-counter-rebrand/) | Website | wabi-sabi | No food photography for a restaurant | WebP conversion |
| [arctic-research-dashboard](./arctic-research-dashboard/) | Web App | swiss-international | Emotional data viz over info density | Dashboard resize |
| [brutalist-zine-streetwear-drop](./brutalist-zine-streetwear-drop/) | Image Series | brutalist-web | Luxury products shot lo-fi | Frame compositing |
| [afrofuturist-animation-studio-identity](./afrofuturist-animation-studio-identity/) | SVG | afrofuturism | Angular geometry for children's brand | SVGO optimization |
| [deconstructed-opera-trailer](./deconstructed-opera-trailer/) | Video | deconstructivism | Opera trailer with no opera imagery | Frame extraction |
| [somatic-therapist-practice-app](./somatic-therapist-practice-app/) | Mobile App | scandinavian-minimalism | Healthcare app rejecting clinical blue | Phone-frame mockup |

## Running

```bash
# Ensure .env is set with FAL_KEY, E2B_API_KEY, QUIVERAI_API_KEY
bun run examples/omakase-counter-rebrand/run.ts
bun run examples/arctic-research-dashboard/run.ts
bun run examples/brutalist-zine-streetwear-drop/run.ts
bun run examples/afrofuturist-animation-studio-identity/run.ts
bun run examples/deconstructed-opera-trailer/run.ts
bun run examples/somatic-therapist-practice-app/run.ts
```

## Pipeline Steps (all examples)

1. Load `brief.yaml` with project context, audience, dials, convention breaks
2. Load `TAXONOMY.yaml` and call `resolveStyle` (attaches `dialModifiers`, `conventionBreak`, `audienceFit`)
3. `selectModel` picks fal.ai endpoint based on style affinity and tier
4. `buildCrafterContext` produces dial-modulated prompt context
5. `runFalGeneration` or `generateSvg` calls the API with seed pinning
6. E2B sandbox downloads and post-processes the result
7. `computeComposite` scores quality (10 sub-scores including `conventionBreakAdherence`)
8. `logAuditEntry` writes a structured audit record

## Quality Threshold

All examples target a composite score >= 7.0/10. The score card breaks down all sub-scores with weights and visual bars.
