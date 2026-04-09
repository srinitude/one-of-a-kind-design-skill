# Brutalist Zine Streetwear Drop

An image series pipeline for **KURO**, a Tokyo streetwear label. Generates zine-style product imagery using **brutalist-web** style with risograph secondary influence.

## The Scenario

The audience is streetwear collectors aged 18-30 in Tokyo, NYC, and London. The mood is raw, confrontational, and illegible-on-purpose. Three convention breaks stack simultaneously: luxury products shot intentionally lo-fi, typography that's barely readable, and an asymmetric collage layout replacing the standard product grid.

## What Makes It Unique

At `design_variance: 9` (Radical), the pipeline injects ALL convention breaks from the style's array and uses unexpected audience market fit pairings. This is the most aggressive dial configuration in the examples. Combined with `visual_density: 8` (Dense) and `audience_formality: 2` (Raw/mono-accent), the generated imagery deliberately degrades product photography quality as a creative statement. The pipeline generates 2 frames with different seeds (42, 43) and composites them in E2B for style consistency checking.

## How to Run

```bash
bun run examples/brutalist-zine-streetwear-drop/run.ts
```

## Expected Output

1. Style resolution with radical convention breaks (all injected)
2. Two fal.ai generations with seeds 42 and 43 (portrait 4:3)
3. E2B sandbox downloads both frames and verifies style consistency
4. Quality score card with high distinctiveness (9.5) and style fidelity (9.0)
5. Audit log entry for the first frame

## Pipeline Steps Exercised

`resolveStyle` -> `selectModel` -> `buildCrafterContext` -> `runFalGeneration` x2 -> E2B compositing -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 9 | Radical: ALL convention breaks injected, cross-pollination |
| `motion_intensity` | 2 | Near-static: motionScale 0.3, no fast motion |
| `visual_density` | 8 | Dense: layered elements, overlapping forms |
| `audience_formality` | 2 | Raw: mono-accent typography, cooler tones |
