# Somatic Therapist Practice App

A mobile app pipeline for **Dr. Maren Voss**, a somatic therapist in private practice. Generates hero textures using **scandinavian-minimalism** style with wabi-sabi secondary influence.

## The Scenario

The audience is trauma survivors seeking somatic therapy, aged 25-55, already therapy-experienced. The mood is safe, warm, and boundaried. The key convention break: a healthcare app that rejects the standard blue-and-white clinical palette in favor of warm neutrals and intentional imperfection to convey humanity.

## What Makes It Unique

This example shows how conservative dial settings create restraint. At `design_variance: 4` (Standard), only the mildest convention break applies. At `visual_density: 2` (Sparse), the pipeline enforces generous whitespace and isolated subjects. At `motion_intensity: 2`, motion is nearly static with a 0.3 scale multiplier. The result is a parallax depth texture that feels safe and contained. E2B wraps the generated texture into a phone-frame mockup at 375x812 (iPhone viewport).

## How to Run

```bash
bun run examples/somatic-therapist-practice-app/run.ts
```

## Expected Output

1. Style resolution with scandinavian-minimalism at conservative variance
2. fal.ai image generation (portrait 4:3, seed 42)
3. E2B sandbox creates phone-frame mockup at mobile viewport dimensions
4. Quality score card with high hierarchy (9.0) and color harmony (9.0)
5. Audit log entry

## Pipeline Steps Exercised

`resolveStyle` -> `selectModel` -> `buildPromptId` -> `buildCrafterContext` -> `runFalGeneration` -> E2B phone-frame -> `computeComposite` -> `logAuditEntry`

## Dial Settings

| Dial | Value | Effect |
|------|-------|--------|
| `design_variance` | 4 | Standard: primary tokens used, mildest convention break |
| `motion_intensity` | 2 | Near-static: motionScale 0.3, slow cinematic |
| `visual_density` | 2 | Sparse: generous whitespace, isolated subjects |
| `audience_formality` | 5 | Standard: balanced typography and color |
