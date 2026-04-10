# Prism Logo Reveal

## The Request

> "5-second logo reveal animation for a tech startup called 'Prism'"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: video (animation, reveal animation)
- Industry: tech (startup)
- Mood: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **liquid-glass** (Liquid Glass)
- Why: Compound phrase "logo reveal" triggers liquid-glass — refractive translucent surfaces suit a startup called "Prism"
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (tech + glass/prism aesthetic is natural)

### Hero Asset
- Archetype: Panning Scene
- Model: WAN T2V (text-to-video, pro tier)
- Distilled prompt (subject-first): `5-second logo reveal animation for a tech startup called 'Prism', Liquid Glass, Apple Liquid Glass UI, dynamic translucent panels, refractive surfaces, iOS 26, layered panels that reveal content depth, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/wan-t2v`
- Generation time: ~46s (video generation is slower)

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 7.0 | 15% |
| Asset Quality | 9.0 | 12% |
| Prompt Alignment | 6.5 | 15% |
| Aesthetic | 7.0 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.0 | 6% |
| Color Harmony | 7.0 | 5% |

**Composite: 7.18/10 PASS**

### What Gets Delivered
A 5-second MP4 logo reveal animation — translucent refractive panels animate into the "Prism" logotype with liquid glass light diffraction effects.

## Try It Yourself

```
5-second logo reveal animation for a tech startup called 'Prism'
```

## Pipeline Test

```bash
bun run examples/prism-logo-reveal/run.ts
```
