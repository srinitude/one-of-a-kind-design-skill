# Ocean Plastic Pollution Infographic

## The Request
> "Infographic about ocean plastic pollution for a nonprofit annual report"

## What the Skill Does

### Message Enhancement
- Extracted dimensions: output type=image, industry=nonprofit, mood=none
- Specificity score: 2/7

### Style Resolution
- Style: **swiss-international** (Swiss / International Typographic Style)
- Why: Infographic for annual report — Swiss grid brings structure, hierarchy, and credibility to data-heavy layouts
- Dials: default (design_variance: 5, motion_intensity: 5)
- Convention break: not applied

### Hero Asset Generation
- Model: Flux 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`)
- Distilled prompt: `data visualization infographic with charts and statistics, about ocean plastic pollution, Swiss / International Typographic Style aesthetic, Swiss design, International Typographic Style, Helvetica, strict multi-column grid, left-aligned, sharp, detailed`
- Generation time: ~18s

### E2B Post-Processing
- Infographic layout with Swiss grid structure
- Data visualization elements composited with typographic hierarchy

### Quality Evaluation (LLaVA 13B)

| Dimension | Score | Weight |
|-----------|-------|--------|
| Anti-Slop Gate | 9.0 | 15% |
| Asset Quality | 8.5 | 12% |
| Prompt Alignment | 6.3 | 15% |
| Aesthetic | 7.4 | 13% |
| Style Fidelity | 7.0 | 13% |
| Distinctiveness | 7.0 | 13% |
| Hierarchy | 7.2 | 6% |
| Color Harmony | 8.0 | 5% |

**Composite: 7.53/10 PASS**

### What Gets Delivered
A data infographic in Swiss International style — strict multi-column grid, Helvetica typography, clean data visualizations about ocean plastic pollution.

## Try It Yourself
> Type in Claude Code: "Infographic about ocean plastic pollution for a nonprofit annual report"

## Pipeline Test
```bash
bun run examples/ocean-plastic-infographic/run.ts
```
