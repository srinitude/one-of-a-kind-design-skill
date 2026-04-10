---
name: one-of-a-kind-design
description: >-
  Generates one-of-a-kind websites, apps, images, SVGs, and videos with
  deterministic style resolution, multi-modal generation chains (text-to-image,
  image-to-image, image-to-video), pixel-level verification (pixelmatch, SSIM,
  pHash), and taste personalization. Use when asked to "design", "build a site",
  "landing page", "app screen", "generate image", "make video", "create SVG",
  "style transfer", "redesign", or any visual creative task.
  Not for backend code, databases, or non-visual work.
hooks:
  SessionStart:
    - matcher: "startup"
      hooks:
        - type: command
          command: "echo 'RULES: (1) Bun-only (2) Effect-native (3) Max nesting 3'"
          timeout: 2
  UserPromptSubmit:
    - hooks:
        - type: command
          command: "bun run ${CLAUDE_SKILL_DIR}/scripts/hooks/enhance-message.ts"
          timeout: 5
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "bun run ${CLAUDE_SKILL_DIR}/scripts/hooks/enforce-bash-safety.ts"
          timeout: 5
    - matcher: "Write"
      hooks:
        - type: command
          command: "bun run ${CLAUDE_SKILL_DIR}/scripts/hooks/enforce-rules-pre-write.ts"
          timeout: 10
    - matcher: "Edit"
      hooks:
        - type: command
          command: "bun run ${CLAUDE_SKILL_DIR}/scripts/hooks/enforce-rules-pre-edit.ts"
          timeout: 10
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "bun run ${CLAUDE_SKILL_DIR}/scripts/hooks/enforce-rules-post-write.ts"
          timeout: 15
  Stop:
    - hooks:
        - type: agent
          prompt: "Review output for: (1) Bun-only, no Node.js APIs. (2) Effect-native, no raw Promises. (3) Max nesting depth 3. Also check taxonomy compliance, prompt-artifact alignment, and composite quality at or above 7.0. Read .claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml and .claude/skills/one-of-a-kind-design/references/PROMPT-ARTIFACT-ALIGNMENT.md."
          timeout: 60
---

# One-of-a-Kind Design

## Instructions

### Step 1: Message Enhancement

Every user message passes through `scripts/hooks/enhance-message.ts` (UserPromptSubmit hook). This is automatic and deterministic, completing in under 50ms. It extracts 7 dimensions: output_type, industry, mood, audience, explicit_style, convention_breaking, quality_emphasis. It computes specificity (0-7).

If specificity is below 3, use `AskUserQuestion` (1-3 questions, 2-4 options). Target missing dimensions. Suggestions from `references/MESSAGE-ENHANCEMENT-RULES.md`.

Then web-search UX best practices for the artifact type + industry. Inject findings into generation context.

### Step 2: Style Resolution

Run `scripts/resolve-style.ts`. Maps intent to style config from taxonomy. Consults:
- `references/AUDIENCE-ROUTES.md` for industry-to-style mapping
- `references/CONFLICT-MAP.md` to validate style combinations
- `references/CREATIVE-DIALS.md` for dial defaults and overrides

Returns: full style config with design_system_parameters, font_selection, motion_signature, premium_patterns, anti_slop_overrides, and recommendedChain (t2i, t2i-i2i, t2i-i2v, i2i, or t2i-i2i-i2v).

### Step 3: Hero Asset Conception

Read `references/HERO-ASSET-ARCHETYPES.md`. Select archetype matching the style's motion_signature:

| Archetype | When | Pipeline |
|---|---|---|
| Panning Scene | cinematic, editorial | prompt-crafter-video-camera to fal.ai video |
| Parallax Depth Stack | layered, atmospheric | prompt-crafter-image-gen to depth estimation |
| Generative Canvas | algorithmic styles | prompt-crafter-image-gen to fal.ai |
| 3D Object Showcase | product, isometric | prompt-crafter-3d-gen to Trellis |
| Typographic Statement | editorial, swiss | prompt-crafter-image-gen to fal.ai |
| Photographic Drama | double-exposure, infrared | prompt-crafter-image-gen to fal.ai |
| SVG Vector Graphic | logos, icons, decorative | prompt-crafter-svg-gen to QuiverAI Arrow |

Run `scripts/select-fal-models.ts` + `scripts/select-pipeline-models.ts` to choose endpoints.

### Step 4: Craft Prompt, Generate, and Verify

**Route** via `scripts/generate-api-prompt.ts` which maps pipeline stage to subagent + API. 15 prompt-crafter subagents in `.claude/agents/`. Each outputs exactly one prompt, zero commentary. NEVER pass user words directly to fal.ai or QuiverAI.

**Craft** by invoking the subagent with style data + user intent. Subagent reads taxonomy references to inject style-specific tokens.

**Generate** in E2B sandbox: fal.ai via `scripts/run-fal-generation.ts`, QuiverAI via `scripts/run-quiver-svg-generation.ts`.

**Verify alignment** via `scripts/validate-prompt-artifact-alignment.ts`:
- Below 5.0: AUTO-REGENERATE (different seed, higher-tier model, re-craft with feedback)
- 5.0-6.9: FLAG for user
- 7.0 or above: PASS

**Pixel verification** via `scripts/verify-image.ts` (4-layer stack):
1. Pixelmatch: exact pixel diff, confirms fixes were applied
2. SSIM: structural similarity, target 0.4-0.7 for style transfer
3. pHash: perceptual fingerprint, detects convergence (hamming 0 = stop)
4. Uniqueness: compare against known-hashes.json, hamming below 10 = re-generate

**Pipeline enhancement** (each gets alignment check):
- Background removal via `scripts/run-background-removal.ts`
- Upscaling via `scripts/run-upscale.ts`
- Depth estimation via `scripts/run-depth-estimation.ts`
- SVG vectorization via `scripts/run-quiver-svg-vectorization.ts`

### Step 5: One-Shot Generation

Generate COMPLETE artifact in single pass using:
- Resolved style's Tailwind v4 tokens (from `assets/tailwind-presets/{style-id}.css`)
- UX research findings
- Alignment-verified hero with composition techniques from `references/COMPOSITION-TECHNIQUES.md`
- 2+ premium_component_patterns from the style profile
- Motion matching motion_signature from `references/VISUAL-REFINEMENT-VOCAB.md`
- Realistic content (never Lorem Ipsum, never Acme Corp)

Output types: Website/web-app (React/HTML), Mobile (phone-frame), Image (fal.ai), Video (+ camera/pacing/audio), SVG (QuiverAI).

### Step 6: Quality Evaluation (MANDATORY)

Run `scripts/score-output-quality.ts`. Composite score from 9 sub-scores:

| Sub-score | Weight | Validator |
|---|---|---|
| Anti-slop gate | 0.15 | scripts/validate-output.ts |
| Code standards | 0.08 | scripts/validate-code-standards.ts |
| Asset quality | 0.12 | scripts/validate-asset-quality.ts |
| Prompt-artifact alignment | 0.15 | scripts/validate-prompt-artifact-alignment.ts |
| Aesthetic | 0.13 | scripts/run-perceptual-quality.ts |
| Style fidelity | 0.13 | scripts/run-perceptual-quality.ts |
| Distinctiveness | 0.13 | scripts/run-perceptual-quality.ts |
| Hierarchy | 0.06 | scripts/run-perceptual-quality.ts |
| Color harmony | 0.05 | scripts/run-perceptual-quality.ts |

**MINIMUM: 7.0/10.** Display score card. HARD STOP if below.

For multi-frame workflows, also run `scripts/validate-style-consistency.ts` (gate: 8.0).

### Step 7: Annotation and Refinement

Screenshot every artifact, annotate via fal.ai draw-over (`scripts/run-screenshot-annotation.ts`), present findings. Address annotation findings, re-generate if needed. Optimize assets via `scripts/optimize-assets.ts`.

Consult `references/CONVENTION-BREAKING.md` for unexpected style applications and `references/CROSS-POLLINATION.md` for style fusion recipes.

### Step 8: Export for External Tools

When user requests export: identify target tool from `references/EXTERNAL-TOOLS-REGISTRY.md` (50+ tools). Run `scripts/generate-tool-export.ts` for .zip with tool-adapted prompts, assets, and guides.

## Anti-Slop Rules (HARD)

Full reference: `references/ANTI-SLOP.md`. Top 10:
1. NO Inter/Roboto/Open Sans — use style-specific typography
2. NO purple-to-blue gradients — derive palette from style
3. NO Tailwind default shadows — use style's shadow_model
4. NO hero/features/testimonials/CTA skeleton — restructure per style
5. NO linear easing — spring physics or style curve
6. NO #000000 body text — off-black (#111, #1a1a1a, #2F3437)
7. NO Lorem Ipsum/Acme Corp — realistic content
8. NO "Elevate/Seamless/Unleash" — specific, human copy
9. NO identical card grids — vary sizes for hierarchy
10. NO simultaneous element mount — stagger entry (80ms delay)

## Environment

Requires: `FAL_KEY`, `E2B_API_KEY`, `QUIVERAI_API_KEY`.

All scripts use Bun-only APIs, Effect-native TypeScript, max nesting depth 3. Patterns: `references/FAL-API-PATTERNS.md`, `references/QUIVER-API-PATTERNS.md`, `references/E2B-PATTERNS.md`.

## Examples

### Example 1: Restaurant Website
**User says:** "I need a website for a 12-seat omakase restaurant in Brooklyn. No photos of food."
**Actions:**
1. Enhancement: output=website, industry=food, mood=warm/minimal/intimate, specificity=5/7
2. Style: wabi-sabi (food + intimate via AUDIENCE-ROUTES)
3. Hero: Typographic Statement, Flux 1.1 Ultra
4. Chain: t2i, pixelmatch verified, uniqueness confirmed (hamming 38)
5. Score: composite 8.5 PASS
**Result:** Full website with hand-textured typography, seasonal palette, no food photography.
See: `references/examples/omakase-counter-rebrand.md`

### Example 2: Data Dashboard
**User says:** "Climate nonprofit needs an internal dashboard for Arctic ice shelf data."
**Actions:**
1. Enhancement: output=web-app, industry=science, mood=urgent/beautiful, specificity=5/7
2. Style: swiss-international + generative-art
3. Hero: Generative Canvas, Flux Pro
4. Chain: t2i, SSIM 0.62 against reference, pHash unique
5. Score: composite 8.3 PASS
**Result:** Dashboard with glacial-to-volcanic color coding, aurora gradients.
See: `references/examples/arctic-research-dashboard.md`

### Example 3: Digital Zine (Image)
**User says:** "Tokyo streetwear label needs a digital zine — raw, confrontational."
**Actions:**
1. Enhancement: output=image, industry=fashion, mood=raw/confrontational, specificity=6/7
2. Style: brutalist-web + risograph
3. Hero: Photographic Drama, Flux Pro (6 frames)
4. Chain: t2i, style consistency 8.5 across 6 frames
5. Score: composite 8.2 PASS
**Result:** 6-spread digital zine with risograph color separation.
See: `references/examples/brutalist-zine-streetwear-drop.md`

### Example 4: SVG Identity System
**User says:** "Lagos animation studio needs vector identity — logo, silhouettes, patterns."
**Actions:**
1. Enhancement: output=svg, industry=media, mood=bold/geometric, specificity=6/7
2. Style: afrofuturism
3. Hero: SVG Vector Graphic, QuiverAI Arrow
4. Chain: t2i (text-to-svg), SVGO optimized in E2B
5. Score: composite 8.6 PASS
**Result:** Nsibidi-inspired geometric logo, 5 silhouettes, pattern library.
See: `references/examples/afrofuturist-animation-studio-identity.md`

### Example 5: Opera Trailer (Video)
**User says:** "Contemporary opera company needs a 15-second trailer."
**Actions:**
1. Enhancement: output=video, industry=performing-arts, mood=fractured/layered, specificity=6/7
2. Style: deconstructivism
3. Hero: Panning Scene, Kling v2 Master
4. Chain: t2i-i2v, camera choreography [Slow push] to [Whip pan] to [Static hold]
5. Score: composite 8.4 PASS
**Result:** 15s trailer with fractured camera movements.
See: `references/examples/deconstructed-opera-trailer.md`

### Example 6: Mobile App
**User says:** "Somatic therapist needs app screens for booking. Clients are trauma survivors."
**Actions:**
1. Enhancement: output=mobile-app, industry=healthcare, mood=safe/warm, specificity=5/7
2. Style: scandinavian-minimalism + wabi-sabi
3. Hero: Parallax Depth Stack, Flux Pro
4. Chain: t2i, warm neutrals, generous touch targets
5. Score: composite 8.3 PASS
**Result:** Trauma-informed mobile screens with warm neutrals, body-aware design.
See: `references/examples/somatic-therapist-practice-app.md`

## Troubleshooting

**Error:** fal.ai endpoint returns 404
**Cause:** Model endpoint was deprecated or renamed
**Solution:** Run `bun run scripts/check-model-availability.ts` to refresh working endpoints

**Error:** Pixelmatch shows 0% diff after refinement
**Cause:** Generator did not apply the critic's feedback
**Solution:** Pipeline auto-escalates: re-crafts prompt with explicit fix instructions

**Error:** Alignment below 5.0 after 3 retries
**Cause:** Prompt-model mismatch or overly abstract prompt
**Solution:** Escalate to higher-tier model. If still failing, flag for manual review

**Error:** Composite below 7.0
**Cause:** One or more sub-scores dragging down weighted sum
**Solution:** Review sub-score breakdown. Fix lowest-scoring dimension first

**Error:** Style conflict detected
**Cause:** Two incompatible styles combined
**Solution:** Check `references/CONFLICT-MAP.md` for hard vs soft. Soft conflicts have compromise patterns

## Performance Notes
- Take your time with style resolution. Read the full taxonomy entry before resolving.
- Do NOT skip validation steps even when confident. Every generation gets alignment-checked.
- Quality over speed. A 7.0 composite reached in 3 attempts beats an 8.0 achieved by luck.
- When blocked by a hook or safety check, STOP. Do not work around it.
- If a fal.ai call fails, try a different model before retrying the same endpoint.
- Never fabricate alignment scores or quality sub-scores. Report actual measured values.
- Fix one quality dimension at a time.
- After 2 failed regenerations at the same tier, escalate exactly one tier. Never skip tiers.
- Maximum 15 fal.ai calls per pipeline run. If reached, stop and report remaining work.
