# Deconstructed Opera Trailer

A video pipeline for **Fracture Opera**, a contemporary opera company. Generates a 15-second trailer using **deconstructivism** style with camera choreography.

## The Scenario

The audience is art patrons aged 25-40 who think opera is dead. The mood is fractured, layered, and uncomfortable-beauty. Three convention breaks stack: the trailer looks nothing like opera marketing, avoids velvet curtains and costumed sopranos, and uses abstract visual metaphor for psychological fracture instead.

## What Makes It Unique

This is the only video pipeline example, demonstrating camera choreography notation: `[Slow push]` through shattered mirror fragments, `[Whip pan]` to silk falling, `[Static hold]` on a single butterfly wing. At `design_variance: 9` (Radical), all convention breaks fire, and the deconstructivism style's negative prompts actively suppress traditional opera visual language. The premium model tier is selected for highest-quality video output. E2B extracts the first frame for quality verification.

## How to Run

```bash
bun run examples/deconstructed-opera-trailer/run.ts
```

## Expected Output

1. Style resolution with deconstructivism at radical variance
2. Premium-tier video model selection
3. fal.ai video generation with camera choreography appended to prompt
4. E2B sandbox downloads video and extracts first frame for quality check
5. Quality score card with high distinctiveness (9.0) and aesthetic (9.0)
6. Audit log entry with video URL and timing

## Pipeline Steps Exercised

`resolveStyle` -> `selectModel` (premium tier) -> `buildPromptId` -> `buildCrafterContext` -> `runFalGeneration` (video) -> E2B frame extraction -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 9 | Radical: ALL convention breaks, cross-pollination |
| `motion_intensity` | 7 | Expressive: motionScale 1.5, intensified timing |
| `visual_density` | 7 | Dense: layered elements, overlapping forms |
| `audience_formality` | 6 | Standard: body-forward typography |
