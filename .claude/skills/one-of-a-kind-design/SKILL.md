---
name: one-of-a-kind-design
description: >-
  Generates one-of-a-kind websites, apps, images, SVGs, and videos with
  deterministic style resolution, multi-modal generation chains, pixel-level
  verification, and taste personalization via Mastra workflows. Use when asked
  to "design", "build a site", "landing page", "app screen", "generate image",
  "make video", "create SVG", "style transfer", "redesign", or any visual
  creative task. Supports interactive and headless (--print) execution modes.
  Not for backend code, databases, or non-visual work.
compatibility: Requires Bun 1.0+, internet access for fal.ai and E2B APIs
metadata:
  author: srinitude
  version: '2.0'
---

# One-of-a-Kind Design

## Instructions

### Step 0: Setup (first run only)

CRITICAL: On first invocation, install dependencies before anything else:

```bash
bun run .claude/skills/one-of-a-kind-design/scripts/setup.ts
```

This installs all runtime dependencies (Mastra, fal.ai, E2B, Effect, pixelmatch, etc.) and creates a `.env` template. The user must fill in API keys before generation will work.

Skip this step if `node_modules/@mastra/core` already exists.

### Step 1: Parse the Request

The user invokes the skill with `/one-of-a-kind-design` followed by their request.

Interactive mode (default):
```
/one-of-a-kind-design Design a site for my omakase restaurant
```

Headless mode (no human input, for CI/CD or batch processing):
```
/one-of-a-kind-design --print Design a site for my omakase restaurant
```

The Mastra workflow automatically:
- Extracts output type, industry, mood, audience from the intent
- Computes specificity (0-7). If below 3, ask the user 1-3 clarifying questions
- Resolves style from taxonomy with convention-breaking detection

Expected output: streaming progress events for each pipeline step.

### Step 2: Review Pipeline Output

The workflow streams progress for each step:
- **resolve-style** -- Maps intent to style config from 65+ styles in the taxonomy
- **select-models** -- Picks optimal fal.ai endpoints based on style affinity
- **craft-prompt** -- Agent-powered prompt crafting with style tokens, palette hex codes, composition directives
- **generate-artifact** -- fal.ai generation (Flux Pro, Seedance 2.0, Kling, Recraft, etc.)
- **post-process** -- E2B sandbox processing (sharp, potrace, SVGO optimization)
- **verify** -- 4-layer verification (pixelmatch, SSIM, pHash, uniqueness)
- **score-quality** -- LLaVA 13B vision scoring, 9 weighted sub-scores, composite 0-10

Hero asset archetypes are auto-selected based on style motion_signature:

| Archetype | When | Pipeline |
|---|---|---|
| Panning Scene | cinematic, editorial | Video camera choreography |
| Parallax Depth Stack | layered, atmospheric | Image generation plus depth estimation |
| Generative Canvas | algorithmic styles | Image generation |
| 3D Object Showcase | product, isometric | 3D mesh generation |
| Typographic Statement | editorial, swiss | Image generation |
| Photographic Drama | double-exposure, infrared | Image generation |
| SVG Vector Graphic | logos, icons, decorative | QuiverAI Arrow vectorization |

### Step 3: Quality Gate

Composite score is computed from 9 weighted sub-scores:

| Sub-score | Weight |
|---|---|
| Anti-slop gate | 0.15 |
| Prompt-artifact alignment | 0.15 |
| Aesthetic | 0.13 |
| Style fidelity | 0.13 |
| Distinctiveness | 0.13 |
| Asset quality | 0.12 |
| Hierarchy | 0.06 |
| Convention break adherence | 0.05 |
| Color harmony | 0.05 |
| Code standards | 0.03 |

**Minimum: 7.0/10.** If below, the workflow suspends in interactive mode.
Present the scores to the user and ask: accept, retry with feedback, or adjust dials.
In headless mode, auto-retries up to 3 times with seed bumps.

### Step 4: Deliver

Share the generated artifact with the user. The artifact includes:
- Generated hero asset (image, video, SVG, or 3D mesh)
- Full website/app code using resolved style's Tailwind v4 preset
- Quality score card with all 9 sub-scores
- Style metadata (ID, palette, motion signature, premium patterns)

### Headless / CI Mode

For automated pipelines without human interaction, use the `--print` flag:

```
/one-of-a-kind-design --print Album cover for a jazz trio
```

In `--print` mode:
- No suspend, no quality gate prompts, no human-in-the-loop
- Auto-retries up to 3 times with seed bumps if quality is below 7.0
- Outputs the artifact URL and composite score when done
- Exit code 0 for success, 1 for failure

For CI/CD scripts:
```bash
bun run .claude/skills/one-of-a-kind-design/scripts/mastra/modes/ci.ts '{"userIntent":"...","outputType":"..."}'
```

### MCP Integration

Tools are exposed via MCP for any MCP-compatible client:
- `design-generate` -- Full pipeline execution
- `design-resolve-style` -- Style resolution only
- `design-score` -- Quality scoring only
- `design-verify` -- Verification only

### Anti-Slop Rules

Full reference: `references/ANTI-SLOP.md`. Top rules:
1. NO Inter/Roboto/Open Sans -- use style-specific typography
2. NO purple-to-blue gradients -- derive palette from style
3. NO default shadows -- use style's shadow model
4. NO hero/features/testimonials/CTA skeleton -- restructure per style
5. NO linear easing -- spring physics or style curve
6. NO #000000 body text -- off-black (#111, #1a1a1a, #2F3437)
7. NO Lorem Ipsum/Acme Corp -- realistic content
8. NO "Elevate/Seamless/Unleash" -- specific, human copy
9. NO identical card grids -- vary sizes for hierarchy
10. NO simultaneous element mount -- stagger entry (80ms delay)

### Environment

Requires environment variables: `FAL_KEY`, `E2B_API_KEY`, `QUIVERAI_API_KEY`.

All scripts use Bun-only APIs, Effect-native TypeScript, max nesting depth 3.

## Examples

### Example 1: Restaurant Website
**User says:** "/one-of-a-kind-design Design a website for my omakase restaurant in Brooklyn. No food photos."

**Actions:**
1. Resolve style: wabi-sabi (food + warm + intimate), variance 7, convention break: no food photography
2. Select model: Flux Pro 1.1 (cinematic affinity), chain: t2i
3. Craft prompt: 280 chars, subject-first, hex palette #8B7355 #D4C5A9 #F5F0E8
4. Generate hero image via fal.ai, seed 42, E2B converts to WebP
5. Verify: pHash stored, uniqueness confirmed (hamming 42 to nearest)
6. Score: LLaVA 13B composite 7.9/10 PASS

**Result:** Full website with hand-textured hero, no food photography, seasonal palette system.

### Example 2: Album Cover
**User says:** "/one-of-a-kind-design Album cover for a jazz trio's debut. Smoky, intimate, blue."

**Actions:**
1. Resolve style: cinematic (jazz + intimate via compound map)
2. Select model: Flux Pro 1.1, chain: t2i
3. Craft prompt: atmospheric lighting, rich shadows, palette #1A1A2E #0F3460 #E94560
4. Generate, E2B post-process, verify uniqueness
5. Score: LLaVA 13B composite 7.7/10 PASS

**Result:** Cinematic album artwork with atmospheric depth and jazz-appropriate color theory.

### Example 3: Video Trailer
**User says:** "/one-of-a-kind-design 15-second trailer for a contemporary opera staging deconstructed Madama Butterfly"

**Actions:**
1. Resolve style: deconstructivism, chain: t2i-i2v (keyframe then animate)
2. Generate keyframe via Flux Pro, animate via Seedance 2.0 (duration "15", aspect "21:9")
3. E2B extracts first frame for quality verification
4. Score: LLaVA 13B composite 7.2/10 PASS

**Result:** 15s cinematic video with fractured visual language and camera choreography mirroring emotional arc.

### Example 4: SVG Logo
**User says:** "/one-of-a-kind-design Logo for a sustainable fashion brand called Thread"

**Actions:**
1. Resolve style: editorial-minimalism (fashion + minimal)
2. Route to SVG pipeline: Recraft V3 vector illustration mode
3. E2B runs SVGO optimization, tests at 16px and 4K
4. Score: LLaVA 13B composite 7.5/10 PASS

**Result:** Single-color vector logo with real SVG paths, tested across sizes.

### Example 5: Mobile App
**User says:** "/one-of-a-kind-design Onboarding screens for a language learning app targeting adults over 40"

**Actions:**
1. Resolve style: material-design (education + clean)
2. Generate hero texture, E2B creates phone-frame mockup
3. Verify uniqueness, score quality
4. Score: LLaVA 13B composite 7.4/10 PASS

**Result:** Accessible onboarding screens with warm typography and generous touch targets.

### Example 6: Headless / CI
**User says:** "/one-of-a-kind-design --print Event poster for a warehouse techno party in Berlin"

**Actions:**
1. Headless mode: no suspend, no human input
2. Resolve style: glitch (techno + underground), generate via Flux Pro
3. Auto-score: composite 6.8 (below 7.0), auto-retry with seed 43
4. Re-score: composite 7.3/10 PASS on second attempt

**Result:** Poster with neon typography, scan lines, RGB split. Delivered with score and URL, exit code 0.

## Troubleshooting

**Error:** fal.ai returns 404
**Cause:** Model endpoint deprecated
**Solution:** Run `bun run scripts/mastra/tools/index.test.ts` to verify working endpoints

**Error:** Quality score below 7.0
**Cause:** Prompt does not match the resolved style well enough
**Solution:** In interactive mode, provide feedback. In headless mode, auto-retries 3 times with different seeds.

**Error:** Pixelmatch shows 0% diff after refinement
**Cause:** Generator did not apply feedback
**Solution:** Pipeline auto-escalates to higher-tier model with explicit fix instructions

**Error:** Alignment below 5.0 after 3 retries
**Cause:** Prompt-model mismatch or overly abstract prompt
**Solution:** Escalate to higher-tier model. If still failing, flag for manual review.

**Error:** Style conflict detected
**Cause:** Two incompatible styles combined
**Solution:** Check `references/CONFLICT-MAP.md` for resolution patterns.

## Performance Notes
- Take your time with style resolution. Read the full taxonomy entry before resolving.
- Do not skip validation steps even when confident. Every generation gets alignment-checked.
- Quality over speed. A 7.0 composite reached in 3 attempts beats an 8.0 achieved by luck.
- Fix one quality dimension at a time.
- After 2 failed regenerations at the same tier, escalate exactly one tier.
- Maximum 15 fal.ai calls per pipeline run.
- Never fabricate alignment scores or quality sub-scores.

### Video Generation Reference

For video output types, consult these reference documents:
- `references/VIDEO-SCENE-SCHEMA.md` — Complete scene ontology (entities, composition, motion, lighting, materials, atmosphere, audio, narrative, editing), JSON/YAML schemas, prompt templates for Runway/Sora/Pika styles, identity locks, continuity locks, motion realism blocks, anti-failure blocks, and evaluation rubric.
- `references/VIDEO-ELEMENT-TEMPLATES.yaml` — Reusable element templates with shared enums (realism levels, framing layers, camera angles, lens types, motion types, materials, surface finishes), validation primitives, reference image roles, and clip assembly templates for multi-shot continuity.

When generating video:
1. Build a scene schema using the ontology (entities, composition, lighting, motion)
2. Use the appropriate prompt template variant (Runway-style, Sora-style, etc.) based on the selected model
3. Apply identity lock and continuity lock blocks for multi-shot consistency
4. Include the anti-failure block in negative prompts
5. Evaluate output against the rubric in section 9

### Surgical Image Editing (Nano Banana Pro Edit)

When brief compliance check finds missing elements, or the user requests a specific edit to a generated image, use Nano Banana Pro Edit for surgical, localized changes that preserve the existing composition.

```bash
bun run scripts/edit-with-nano-banana.ts --image <url> --edit "Add three nail holes in the plaster surface, catching amber side-light"
```

The edit pipeline:
1. Enhances the edit description into a precise Nano Banana prompt (enforcing spatial locality, dimensional integrity, photometric consistency)
2. Executes the edit via `fal-ai/nano-banana-pro/edit` with `image_urls` array
3. Returns the edited image URL

Use this INSTEAD of image-to-image for adding missing elements. Nano Banana preserves the base image exactly — i2i re-generates too much.

Endpoint: `fal-ai/nano-banana-pro/edit`
Input: `{ prompt: string, image_urls: string[], seed: number }`
