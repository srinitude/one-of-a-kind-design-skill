# Molecular Gastronomy Restaurant Website

## The Request

> "Design a restaurant website for a molecular gastronomy place in Copenhagen"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: website
- Industry: food (gastronomy)
- Mood: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **liquid-glass** (Liquid Glass)
- Why: Compound phrase "molecular gastronomy" triggers liquid-glass — futuristic food merits translucent, refractive surfaces
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset
- Archetype: Generative Canvas
- Model: Flux 1.1 Ultra (premium tier, matched via style affinity)
- Distilled prompt (subject-first): `Design a restaurant website for a molecular gastronomy place in Copenhagen, Liquid Glass, Apple Liquid Glass UI, dynamic translucent panels, refractive surfaces, iOS 26, layered panels that reveal content depth, high detail, professional quality`

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
| Distinctiveness | 8.8 | 13% |
| Hierarchy | 8.5 | 6% |
| Color Harmony | 7.6 | 5% |

**Composite: 8.14/10 PASS** (highest scoring example)

### What Gets Delivered
A restaurant website hero in Liquid Glass style — translucent layered panels with refractive surfaces, capturing the futuristic precision of molecular gastronomy.

## Try It Yourself

```
Design a restaurant website for a molecular gastronomy place in Copenhagen
```

## Pipeline Test

```bash
bun run examples/molecular-gastronomy-website/run.ts
```
