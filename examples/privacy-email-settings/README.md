# Privacy Email Settings

## The Request

> "Settings page for a privacy-focused email client"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: mobile-app (settings page)
- Industry: tech (email client)
- Mood: minimal (privacy-focused implies clean, restrained)
- Audience: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **bento-ui** (Bento UI)
- Why: Tech industry maps to bento-ui — modular card grids are native to settings interfaces
- Dials: default
- Convention break: not applied
- Audience fit: strong (tech + bento settings layout is natural)

### Hero Asset
- Archetype: Generative Canvas
- Model: Flux 1.1 Ultra (premium tier)
- Distilled prompt (300 chars): `Bento UI, Settings page for a privacy-focused email client, bento grid UI layout, modular card grid, varied cell sizes, Apple-style feature , asymmetric CSS Grid with 2:1 and 1:1 cel, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~20s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 5.2 | 15% |
| Aesthetic | 7.0 | 13% |
| Style Fidelity | 6.5 | 13% |
| Distinctiveness | 7.5 | 13% |
| Hierarchy | 7.0 | 6% |
| Color Harmony | 7.5 | 5% |

**Composite: 7.52/10 PASS**

### What Gets Delivered
A mobile settings screen in Bento UI style — modular card grid with toggle rows, privacy controls, and asymmetric cell layouts in Apple-inspired proportions.

## Try It Yourself

```
Settings page for a privacy-focused email client
```

## Pipeline Test

```bash
bun run examples/privacy-email-settings/run.ts
```
