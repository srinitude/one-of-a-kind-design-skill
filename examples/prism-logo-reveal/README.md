# Prism Logo Reveal

## The Request

> "5-second logo reveal animation for a tech startup called 'Prism'"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: video (animation, reveal animation)
- Industry: tech (startup)
- Mood: none detected
- Audience: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **bento-ui** (Bento UI)
- Why: Tech industry maps to bento-ui — modular grid layouts are native to tech branding
- Dials: default
- Convention break: not applied
- Audience fit: strong (tech + bento is natural)

### Hero Asset
- Archetype: Panning Scene
- Model: WAN T2V (text-to-video, pro tier)
- Distilled prompt (300 chars): `Bento UI, 5-second logo reveal animation for a tech startup called 'Prism', bento grid UI layout, modular card grid, varied cell sizes, Apple-style feature , asymmetric CSS Grid with 2:1 and 1:1 cel, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/wan-t2v`
- Generation time: ~95s (video generation is slower)

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
A 5-second MP4 logo reveal animation — modular grid elements animate into the "Prism" logotype with bento-style card transitions.

## Try It Yourself

```
5-second logo reveal animation for a tech startup called 'Prism'
```

## Pipeline Test

```bash
bun run examples/prism-logo-reveal/run.ts
```
