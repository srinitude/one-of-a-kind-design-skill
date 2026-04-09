# Arctic Research Dashboard

A web-app pipeline for the **Polar Watch Collective**, a climate nonprofit. Uses **swiss-international** style with generative-art secondary influence to visualize ice shelf fragmentation data.

## The Scenario

The audience spans climate researchers and donor board members (data-literate, ages 28-60). The mood is urgent, beautiful, and authoritative. The brief's convention break: the dashboard prioritizes emotional impact over information density, using severity-based color coding from glacial blues to volcanic reds.

## What Makes It Unique

Data dashboards typically optimize for information density. This one treats the data visualization as an emotional experience first, applying the swiss-international grid system to algorithmically generated particle visualizations. The `audience_formality: 7` dial produces refined, display-heavy typography that serves both researchers and donors, while `visual_density: 6` keeps the layout balanced rather than maximalist.

## How to Run

```bash
bun run examples/arctic-research-dashboard/run.ts
```

## Expected Output

1. Style resolution with swiss-international dial modifiers
2. fal.ai image generation (landscape 16:9, seed 42) as generative canvas hero
3. E2B sandbox downloads and resizes the image for dashboard integration
4. Quality score card emphasizing color harmony (weight 0.05) and hierarchy (weight 0.06)
5. Audit log entry

## Pipeline Steps Exercised

`resolveStyle` -> `selectModel` -> `buildPromptId` -> `buildCrafterContext` -> `runFalGeneration` -> E2B resize -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 5 | Standard: full positive prompt, soft convention breaks |
| `motion_intensity` | 4 | Standard: default motion signature |
| `visual_density` | 6 | Balanced: standard composition |
| `audience_formality` | 7 | Body-forward with warmth: polished, considered |
