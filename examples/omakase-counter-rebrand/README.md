# Omakase Counter Rebrand

A website pipeline for **Sushi Kioku**, a 12-seat omakase counter in Brooklyn. The design uses the **wabi-sabi** style to evoke warmth, imperfection, and intimacy.

## The Scenario

Sushi Kioku serves a $200+ prix fixe to NYC food culture devotees aged 30-50. The brief deliberately breaks restaurant website conventions: no food photography, no visible menu prices, no reservation widget above the fold. The hero asset is a typographic statement combining vertical Japanese calligraphy with hand-textured washi paper.

## What Makes It Unique

The **convention break** is the centerpiece. Restaurant sites universally lead with food photography. This one leads with texture and typography, trusting the audience's sophistication. With `design_variance: 7`, the pipeline injects one convention break deterministically from the wabi-sabi style's break array, adding it to the prompt context so the generated image actively avoids food-photography tropes.

## How to Run

```bash
bun run examples/omakase-counter-rebrand/run.ts
```

## Expected Output

1. Style resolution with wabi-sabi dial modifiers and convention break metadata
2. fal.ai image generation (portrait 4:3, seed 42) via Flux Pro
3. E2B sandbox downloads the image and prepares WebP conversion
4. Quality score card with 10 sub-scores including convention break adherence
5. Audit log entry with prompt hash, seed, timing, and quality score

## Pipeline Steps Exercised

`resolveStyle` -> `selectModel` -> `buildPromptId` -> `buildCrafterContext` -> `runFalGeneration` -> E2B post-processing -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 7 | Expressive: injects 1 convention break, loosens composition |
| `motion_intensity` | 3 | Slow/static: motionScale 0.3, prefers cinematic stillness |
| `visual_density` | 3 | Sparse: generous whitespace, isolated subjects |
| `audience_formality` | 8 | Refined: display-heavy typography, warmer colors |
