---
name: one-of-a-kind-design
description: >-
  Generates one-of-a-kind websites, apps, images, SVGs, and videos with
  deterministic style resolution, multi-modal generation chains, pixel-level
  verification, and taste personalization via Mastra workflows. Use when asked
  to "design", "build a site", "landing page", "app screen", "generate image",
  "make video", "create SVG", "style transfer", "redesign", or any visual
  creative task. Supports interactive (coding agent) and headless (CI/CD)
  execution modes. Not for backend code, databases, or non-visual work.
---

# One-of-a-Kind Design

## Instructions

### Step 1: Parse the Request

Run `bun run scripts/mastra/modes/interactive.ts` with the user's request as JSON input.
The Mastra workflow automatically:
- Extracts output type, industry, mood, audience from the intent
- Computes specificity (0-7). If below 3, ask the user 1-3 clarifying questions
- Resolves style from taxonomy with convention-breaking detection

```bash
bun run scripts/mastra/modes/interactive.ts '{"userIntent":"Design a site for my omakase restaurant","outputType":"website"}'
```

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
| Code standards | 0.08 |
| Asset quality | 0.12 |
| Prompt-artifact alignment | 0.15 |
| Aesthetic | 0.13 |
| Style fidelity | 0.13 |
| Distinctiveness | 0.13 |
| Hierarchy | 0.06 |
| Color harmony | 0.05 |

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

For automated pipelines without human interaction:

```bash
bun run scripts/mastra/modes/ci.ts '{"userIntent":"...","outputType":"..."}'
```

Exit code 0 for success (composite at or above 7.0), exit code 1 for failure. Auto-retries 3 times before failing.

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
**User says:** "Design a website for my omakase restaurant in Brooklyn. No food photos."
**Actions:**
1. Pipeline resolves wabi-sabi style, variance 7, convention break applied
2. Flux Pro generates hero image with wabi-sabi tokens, seed 42
3. E2B converts to WebP, LLaVA scores 8.1/10 composite
4. Website generated with wabi-sabi Tailwind preset
**Result:** Full website with hand-textured hero, no food photography, seasonal palette.

### Example 2: Data Dashboard
**User says:** "Climate nonprofit needs an internal dashboard for Arctic ice shelf data."
**Actions:**
1. Pipeline resolves swiss-international plus generative-art cross-pollination
2. Flux Pro generates hero with glacial palette, verified unique (hamming 38)
3. E2B processes with sharp optimization, LLaVA scores 8.3/10
4. Dashboard with glacial-to-volcanic color coding, aurora gradients
**Result:** Interactive dashboard with generative data visualizations.

### Example 3: Video Trailer
**User says:** "15-second trailer for a contemporary opera"
**Actions:**
1. Pipeline resolves deconstructivism, chain t2i-i2v
2. Flux Pro generates keyframe, Seedance 2.0 animates to video
3. E2B extracts frame for quality check, LLaVA scores 7.5/10
4. Camera choreography: slow push to whip pan to static hold
**Result:** 15s cinematic video with fractured visual language.

### Example 4: SVG Identity System
**User says:** "Lagos animation studio needs vector identity -- logo, silhouettes, patterns."
**Actions:**
1. Pipeline resolves afrofuturism style for SVG output
2. QuiverAI Arrow generates Nsibidi-inspired geometric logo
3. SVGO optimization in E2B sandbox, LLaVA scores 8.6/10
4. Pattern library generated from logo motifs
**Result:** Complete vector identity with logo, 5 silhouettes, pattern library.

### Example 5: Mobile App
**User says:** "Somatic therapist needs app screens for booking. Clients are trauma survivors."
**Actions:**
1. Pipeline resolves scandinavian-minimalism plus wabi-sabi fusion
2. Flux Pro generates warm neutral hero, generous touch targets
3. Trauma-informed UX patterns applied, LLaVA scores 8.3/10
4. Phone-frame wrapper with body-aware design tokens
**Result:** Trauma-informed mobile screens with warm neutrals.

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
