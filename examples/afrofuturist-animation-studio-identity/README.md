# Afrofuturist Animation Studio Identity

An SVG pipeline for **Adinkra Motion**, a Lagos-based children's animation studio. Generates a geometric logo mark using **afrofuturism** style via QuiverAI Arrow.

## The Scenario

The audience is parents of children aged 4-12 in the African diaspora who are culturally engaged. The mood is bold, geometric, and sophisticated-for-children. The key convention break: a children's brand identity uses angular geometry instead of the standard rounded, friendly shapes. It treats children as sophisticated visual thinkers.

## What Makes It Unique

This is the only SVG pipeline example, using QuiverAI Arrow instead of fal.ai. The Nsibidi-inspired geometric mark must scale from 16px favicon to 4K title card, demanding clean vector paths with no gradients. At `design_variance: 8` (Expressive), the pipeline injects one convention break deterministically, pushing the logo away from the soft, rounded shapes that dominate children's branding. E2B runs SVGO-style optimization on the resulting SVG.

## How to Run

```bash
bun run examples/afrofuturist-animation-studio-identity/run.ts
```

Requires `QUIVERAI_API_KEY` in `.env`. The pipeline will report a clear error if the key is missing.

## Expected Output

1. Style resolution with afrofuturism dial modifiers and convention break
2. QuiverAI Arrow SVG generation (temperature 0.7)
3. E2B sandbox runs SVG cleanup and optimization, reports size reduction
4. Quality score card with high asset quality (9.0) and aesthetic (9.0)
5. Audit log entry with QuiverAI endpoint

## Pipeline Steps Exercised

`resolveStyle` -> `buildPromptId` -> `buildCrafterContext` -> `generateSvg` (QuiverAI) -> E2B SVGO -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 8 | Expressive: 1 convention break injected, asymmetry allowed |
| `motion_intensity` | 5 | Standard: default motion (N/A for SVG) |
| `visual_density` | 5 | Balanced: standard composition |
| `audience_formality` | 4 | Slightly informal: body-forward typography |
