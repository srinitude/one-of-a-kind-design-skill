# Meditation Icon Set

## The Request

> "Icon set for a meditation app. 12 icons. Calm, minimal."

## What the Skill Does

### Message Enhancement (automatic)
- Output type: svg (icon set)
- Industry: meditation
- Mood: minimal, calm
- Specificity score: 3/7

### Style Resolution
- Style: **scandinavian-minimalism** (Scandinavian Minimalism)
- Why: Calm mood + meditation industry both point to scandinavian-minimalism — warm neutrals and clean lines match meditative serenity
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (meditation + Scandinavian minimalism is natural)

### Hero Asset
- Archetype: SVG Vector Graphic
- Model: Flux 1.1 Ultra (premium tier)
- Distilled prompt (subject-first): `Icon set for a meditation app. 12 icons. Calm, minimal., Scandinavian Minimalism, Scandinavian design, Nordic minimalism, warm neutrals, natural light, clean line, clean grid with abundant white space, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~17s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 8.1 | 15% |
| Aesthetic | 7.5 | 13% |
| Style Fidelity | 6.9 | 13% |
| Distinctiveness | 8.1 | 13% |
| Hierarchy | 8.1 | 6% |
| Color Harmony | 7.6 | 5% |

**Composite: 8.02/10 PASS**

### What Gets Delivered
A set of minimal icons in Scandinavian style — warm neutrals, clean strokes, abundant white space — suitable for vectorization via QuiverAI Arrow.

## Try It Yourself

```
Icon set for a meditation app. 12 icons. Calm, minimal.
```

## Pipeline Test

```bash
bun run examples/meditation-icon-set/run.ts
```
