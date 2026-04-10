# Wind Farm Monitoring Dashboard

## The Request

> "Dashboard for a wind farm monitoring system. Real-time turbine data."

## What the Skill Does

### Message Enhancement (automatic)
- Output type: web-app (dashboard)
- Industry: tech (monitoring, turbine, wind farm)
- Mood: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **bento-ui** (Bento UI)
- Why: Tech industry maps to bento-ui — modular card grids are native to monitoring dashboards with real-time data tiles
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (data dashboards + bento grids is natural)

### Hero Asset
- Archetype: Generative Canvas
- Model: Flux 1.1 Ultra (premium tier, matched via style affinity)
- Distilled prompt (subject-first): `Dashboard for a wind farm monitoring system. Real-time turbine data., Bento UI, bento grid UI layout, modular card grid, varied cell sizes, Apple-style feature, asymmetric CSS Grid with 2:1 and 1:1 cel, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~16s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 5.4 | 15% |
| Aesthetic | 7.8 | 13% |
| Style Fidelity | 6.7 | 13% |
| Distinctiveness | 8.9 | 13% |
| Hierarchy | 7.7 | 6% |
| Color Harmony | 7.9 | 5% |

**Composite: 7.69/10 PASS**

### What Gets Delivered
A monitoring dashboard in Bento UI style — asymmetric card grids showing turbine status, power output, and wind speed data tiles with Apple-inspired proportions.

## Try It Yourself

```
Dashboard for a wind farm monitoring system. Real-time turbine data.
```

## Pipeline Test

```bash
bun run examples/wind-farm-dashboard/run.ts
```
