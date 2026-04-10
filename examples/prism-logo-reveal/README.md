# Prism Logo Reveal

## The Request
> "5-second logo reveal animation for a tech startup called 'Prism'"

## What the Skill Does

### Message Enhancement
- Extracted dimensions: output type=video, industry=tech, mood=none
- Specificity score: 2/7

### Style Resolution
- Style: **liquid-glass** (Liquid Glass)
- Why: Tech startup "Prism" evokes light refraction — liquid-glass style with translucent panels and refractive surfaces matches perfectly
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset Generation
- Model: WAN T2V (`fal-ai/wan/v2.1/1.3b/text-to-video`)
- Distilled prompt: `logo animation key frame on dark background, 5-second animation tech startup called 'Prism', Liquid Glass aesthetic, Apple Liquid Glass UI, dynamic translucent panels, refractive surfaces, layered panels that reveal content depth, sharp, detailed`
- Generation time: ~50s

### E2B Post-Processing
- Video output with logo reveal motion
- Camera choreography for smooth reveal transition

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 9.0 | 12% |
| Prompt Alignment | 2.7 | 15% |
| Aesthetic | 7.3 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.3 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.00/10 PASS**

### What Gets Delivered
A 5-second MP4 logo reveal animation — translucent refractive panels animate into the "Prism" logotype with liquid glass light diffraction effects.

## Try It Yourself
> Type in Claude Code: "5-second logo reveal animation for a tech startup called 'Prism'"

## Pipeline Test
```bash
bun run examples/prism-logo-reveal/run.ts
```
