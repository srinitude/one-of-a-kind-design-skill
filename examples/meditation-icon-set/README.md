# Meditation Icon Set

## The Request

> "Icon set for a meditation app. 12 icons. Calm, minimal."

## What the Skill Does

### Message Enhancement (automatic)
- Output type: svg (icon set)
- Industry: meditation
- Mood: minimal (calm, minimal)
- Audience: none detected
- Specificity score: 3/7

### Style Resolution
- Style: **editorial-minimalism** (Editorial Minimalism)
- Why: Minimal mood maps to editorial-minimalism. Meditation industry reinforces the calm, Notion-like aesthetic
- Dials: default
- Convention break: not applied
- Audience fit: strong (meditation + minimalism is natural)

### Hero Asset
- Archetype: SVG Vector Graphic
- Model: Flux Pro 1.1 (pro tier, design-focused)
- Distilled prompt (300 chars): `Editorial Minimalism, Icon set for a meditation app. 12 icons. Calm, minimal., editorial UI design, Notion-like interface, warm monochrome, serif headings, hai, palette: #F7F6F3 #111111 #EAEAEA, asymmetric bento grid with hairline 1px , high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1`
- Generation time: ~9s (fastest example)

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 5.4 | 15% |
| Aesthetic | 7.5 | 13% |
| Style Fidelity | 6.7 | 13% |
| Distinctiveness | 9.0 | 13% |
| Hierarchy | 7.7 | 6% |
| Color Harmony | 7.9 | 5% |

**Composite: 7.67/10 PASS**

### What Gets Delivered
A set of minimal icons in warm monochrome — hairline strokes, #F7F6F3 background, #111111 foreground — suitable for vectorization via QuiverAI Arrow.

## Try It Yourself

```
Icon set for a meditation app. 12 icons. Calm, minimal.
```

## Pipeline Test

```bash
bun run examples/meditation-icon-set/run.ts
```
