# Language Learning App Onboarding

## The Request
> "Onboarding screens for a language learning app targeting adults"

## What the Skill Does

### Message Enhancement
- Extracted dimensions: output type=mobile-app, industry=education, mood=none
- Specificity score: 2/7

### Style Resolution
- Style: **material-design** (Material Design)
- Why: Mobile onboarding for education — Material Design's layered surfaces and responsive grid are standard for Android-first app screens
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset Generation
- Model: Flux 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`)
- Distilled prompt: `mobile onboarding screen with illustrations and text, language learning app targeting adults, Material Design aesthetic, Material Design UI, layered surfaces, subtle shadows, responsive grid with breakpoint columns, sharp, detailed`
- Generation time: ~17s

### E2B Post-Processing
- Mobile screen wrapped in phone-frame viewport
- Onboarding flow with illustration and text composition

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 3.6 | 15% |
| Aesthetic | 7.3 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.3 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.08/10 PASS**

### What Gets Delivered
Mobile onboarding screens in Material Design style — layered surfaces with subtle shadows, responsive layout with illustrations guiding adult learners through setup.

## Try It Yourself
> Type in Claude Code: "Onboarding screens for a language learning app targeting adults"

## Pipeline Test
```bash
bun run examples/language-learning-onboarding/run.ts
```
