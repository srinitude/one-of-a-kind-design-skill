# Wind Farm Monitoring Dashboard

## The Request
> "Dashboard for a wind farm monitoring system. Real-time turbine data."

## What the Skill Does

### Message Enhancement
- Extracted dimensions: output type=web-app, industry=energy/tech, mood=none
- Specificity score: 2/7

### Style Resolution
- Style: **bento-ui** (Bento UI)
- Why: Dashboard with "real-time data" matches bento grid — modular card layout suits monitoring UIs with varied data widgets
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset Generation
- Model: Flux 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`)
- Distilled prompt: `application dashboard interface, wind farm monitoring system. Real-time turbine data, Bento UI aesthetic, bento grid UI layout, modular card grid, varied cell sizes, asymmetric CSS Grid with 2:1 and 1:1 cel, sharp, detailed`
- Generation time: ~15s

### E2B Post-Processing
- Dashboard scaffold with Tailwind v4 bento-ui preset
- Modular card grid layout with turbine status widgets

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 6.3 | 15% |
| Aesthetic | 7.3 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.3 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.52/10 PASS**

### What Gets Delivered
A monitoring dashboard in Bento UI style — asymmetric card grids showing turbine status, power output, and wind speed data tiles.

## Try It Yourself
> Type in Claude Code: "Dashboard for a wind farm monitoring system. Real-time turbine data."

## Pipeline Test
```bash
bun run examples/wind-farm-dashboard/run.ts
```
