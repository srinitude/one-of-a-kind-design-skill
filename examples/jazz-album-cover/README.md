# Jazz Album Cover

## The Request

> "Album cover for a jazz trio's debut record. Smoky, intimate, blue."

## What the Skill Does

### Message Enhancement (automatic)
- Output type: image (album cover)
- Industry: entertainment (jazz, music)
- Mood: dark (smoky, intimate)
- Audience: none detected
- Specificity score: 2/7

### Style Resolution
- Style: **vaporwave** (Vaporwave)
- Why: Entertainment + dark mood. Vaporwave's retro-digital palette and atmospheric qualities complement jazz's moody intimacy
- Dials: default with convention break active
- Convention break: applied — jazz covers don't typically get vaporwave treatment
- Audience fit: unexpected (music audience gets a digital-retro spin)

### Hero Asset
- Archetype: Photographic Drama
- Model: Flux 1.1 Ultra (premium tier)
- Distilled prompt (300 chars): `Vaporwave, Album cover for a jazz trio's debut record. Smoky, intimate, blue., vaporwave aesthetic, pink purple teal gradient, Greek statue, retro computer, pa, retro desktop/window UI metaphor over gr, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~22s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 8.1 | 15% |
| Aesthetic | 7.8 | 13% |
| Style Fidelity | 6.9 | 13% |
| Distinctiveness | 8.8 | 13% |
| Hierarchy | 7.9 | 6% |
| Color Harmony | 8.4 | 5% |
| Conv. Break | 7.3 | 5% |

**Composite: 8.14/10 PASS** (highest scoring example)

### What Gets Delivered
A square-format album cover blending jazz intimacy with vaporwave aesthetics — teal and purple gradients, atmospheric depth, with smoky digital textures.

## Try It Yourself

```
Album cover for a jazz trio's debut record. Smoky, intimate, blue.
```

## Pipeline Test

```bash
bun run examples/jazz-album-cover/run.ts
```
