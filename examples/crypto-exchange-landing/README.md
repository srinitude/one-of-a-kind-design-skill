# Crypto Exchange Landing Page

## The Request

> "I need a landing page for a cryptocurrency exchange that targets institutional investors"

## What the Skill Does

### Message Enhancement (automatic)
- Output type: website
- Industry: finance (crypto, exchange, institutional investor)
- Mood: none detected
- Audience: enterprise
- Specificity score: 2/7

### Style Resolution
- Style: **swiss-international** (Swiss / International Typographic Style)
- Why: Finance industry maps to swiss-international — Helvetica-driven grid layouts convey institutional trust
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied
- Audience fit: strong (enterprise/institutional)

### Hero Asset
- Archetype: Typographic Statement
- Model: Flux 1.1 Ultra (premium tier, matched via style affinity)
- Distilled prompt (300 chars): `Swiss / International Typographic Style, I need a landing page for a cryptocurrency exchange that targets institutional investors, Swiss design, International Typographic Style, Helvetica, grid layout, asymmetri, strict multi-column grid, left-aligned, , high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~21s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 4.5 | 15% |
| Aesthetic | 7.8 | 13% |
| Style Fidelity | 6.7 | 13% |
| Distinctiveness | 8.8 | 13% |
| Hierarchy | 8.1 | 6% |
| Color Harmony | 7.9 | 5% |

**Composite: 7.56/10 PASS**

### What Gets Delivered
A landing page hero image in Swiss International style — strict grid, Helvetica typography, monochromatic palette with institutional gravitas.

## Try It Yourself

```
I need a landing page for a cryptocurrency exchange that targets institutional investors
```

## Pipeline Test

```bash
bun run examples/crypto-exchange-landing/run.ts
```
