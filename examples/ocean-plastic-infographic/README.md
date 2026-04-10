# Ocean Plastic Pollution Infographic

## The Request

> "Infographic about ocean plastic pollution for a nonprofit annual report"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: image (infographic)
- Industry: nonprofit (annual report)
- Mood: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **swiss-international** (Swiss / International Typographic Style)
- Why: Nonprofit/annual report maps to swiss-international — Helvetica-driven grids convey data clarity and institutional authority
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (data-driven nonprofit communications)

### Hero Asset
- Archetype: Typographic Statement
- Model: Flux 1.1 Ultra (premium tier, matched via style affinity)
- Distilled prompt (subject-first): `Infographic about ocean plastic pollution for a nonprofit annual report, Swiss / International Typographic Style, Swiss design, International Typographic Style, Helvetica, grid layout, strict multi-column grid, left-aligned, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~14s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 5.4 | 15% |
| Aesthetic | 7.8 | 13% |
| Style Fidelity | 6.7 | 13% |
| Distinctiveness | 9.0 | 13% |
| Hierarchy | 7.5 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.70/10 PASS**

### What Gets Delivered
A data-forward infographic in Swiss International style — strict multi-column grid, Helvetica typography, ocean-blue palette, with clear visual hierarchy for pollution statistics.

## Try It Yourself

```
Infographic about ocean plastic pollution for a nonprofit annual report
```

## Pipeline Test

```bash
bun run examples/ocean-plastic-infographic/run.ts
```
