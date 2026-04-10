# Language Learning Onboarding

## The Request

> "Onboarding screens for a language learning app targeting adults"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: mobile-app (onboarding screen)
- Industry: education (language learning)
- Mood: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **material-design** (Material Design)
- Why: Education industry maps to material-design — Google's layered surface system suits structured learning flows
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (education + Material Design is natural)

### Hero Asset
- Archetype: Generative Canvas
- Model: Flux 1.1 Ultra (premium tier, matched via style affinity)
- Distilled prompt (subject-first): `Onboarding screens for a language learning app targeting adults, Material Design, Material Design UI, layered surfaces, subtle shadows, clean typography, Google d, responsive grid with breakpoint columns, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~16s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 3.6 | 15% |
| Aesthetic | 7.8 | 13% |
| Style Fidelity | 6.5 | 13% |
| Distinctiveness | 9.0 | 13% |
| Hierarchy | 7.5 | 6% |
| Color Harmony | 7.5 | 5% |

**Composite: 7.35/10 PASS**

### What Gets Delivered
Mobile onboarding screens in Material Design style — layered surfaces with subtle elevation shadows, clean typography, and structured learning progression flows.

## Try It Yourself

```
Onboarding screens for a language learning app targeting adults
```

## Pipeline Test

```bash
bun run examples/language-learning-onboarding/run.ts
```
