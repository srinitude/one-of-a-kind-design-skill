# Film Production Dashboard

## The Request

> "Project management tool for a film production company. Timeline-heavy."

## What the Skill Does

### Message Enhancement (automatic)
- Output type: web-app (management tool)
- Industry: entertainment (film, production company)
- Mood: none detected
- Audience: none detected
- Specificity score: 3/7

### Style Resolution
- Style: **vaporwave** (Vaporwave)
- Why: Entertainment industry maps to vaporwave — retro-digital aesthetics suit film production's creative tooling
- Dials: default with convention break active (design_variance triggers)
- Convention break: applied — breaks the "dashboards must be corporate" dogma
- Audience fit: unexpected (production teams rarely get vaporwave UI)

### Hero Asset
- Archetype: Generative Canvas
- Model: Flux 1.1 Ultra (premium tier)
- Distilled prompt (300 chars): `Vaporwave, Project management tool for a film production company. Timeline-heavy., vaporwave aesthetic, pink purple teal gradient, Greek statue, retro computer, pa, retro desktop/window UI metaphor over gr, high detail, professional quality`

### Generation + Scoring
- fal.ai endpoint: `fal-ai/flux-pro/v1.1-ultra`
- Generation time: ~17s

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 8.1 | 15% |
| Aesthetic | 7.6 | 13% |
| Style Fidelity | 6.2 | 13% |
| Distinctiveness | 8.9 | 13% |
| Hierarchy | 7.5 | 6% |
| Color Harmony | 7.9 | 5% |
| Conv. Break | 6.5 | 5% |

**Composite: 7.94/10 PASS**

### What Gets Delivered
A timeline-heavy dashboard mockup in vaporwave style — pink-purple gradients, retro window chrome, Greek column accents mixed with production scheduling UI.

## Try It Yourself

```
Project management tool for a film production company. Timeline-heavy.
```

## Pipeline Test

```bash
bun run examples/film-production-dashboard/run.ts
```
