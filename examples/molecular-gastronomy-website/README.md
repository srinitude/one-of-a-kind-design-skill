# Molecular Gastronomy Restaurant Website

## The Request
> "Design a restaurant website for a molecular gastronomy place in Copenhagen"

## What the Skill Does

### Message Enhancement
- Extracted dimensions: output type=website, industry=food, mood=none
- Specificity score: 2/7

### Style Resolution
- Style: **liquid-glass** (Liquid Glass)
- Why: Compound phrase "molecular gastronomy" triggers liquid-glass — futuristic food merits translucent, refractive surfaces
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset Generation
- Model: Flux 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`)
- Distilled prompt: `website interface design screenshot, restaurant molecular gastronomy place in Copenhagen, Liquid Glass aesthetic, Apple Liquid Glass UI, dynamic translucent panels, refractive surfaces, layered panels that reveal content depth, sharp, detailed`
- Generation time: ~17s

### E2B Post-Processing
- Website scaffold with Tailwind v4 liquid-glass preset
- Hero image composited into layout with translucent panel overlays

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 3.6 | 15% |
| Aesthetic | 7.4 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.4 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.10/10 PASS**

### What Gets Delivered
A restaurant website hero in Liquid Glass style — translucent layered panels with refractive surfaces, capturing the futuristic precision of molecular gastronomy.

## Try It Yourself
> Type in Claude Code: "Design a restaurant website for a molecular gastronomy place in Copenhagen"

## Pipeline Test
```bash
bun run examples/molecular-gastronomy-website/run.ts
```
