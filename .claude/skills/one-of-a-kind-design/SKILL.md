---
name: one-of-a-kind-design
description: >-
  Generates unique websites, web apps, mobile screens, images, SVGs, and video
  using 66-style taxonomy, 184 models (fal.ai + QuiverAI), 15 prompt-crafter
  subagents, prompt-artifact alignment, anti-slop guardrails, E2B sandboxes,
  quality scoring, and workflow export for 50+ external tools. Use for "design",
  "build a site", "landing page", "app screen", "generate image", "make video",
  "create SVG", "export to Figma", "export to Runway", or any creative task.
  Not for backend, databases, or non-visual work.
  Reference examples for 6 project types in references/examples/.
hooks:
  SessionStart:
    - matcher: "startup"
      hooks:
        - type: command
          command: "echo 'RULES: (1) Bun-only — no Node.js APIs. (2) Effect-native — no vanilla TS async patterns. (3) Max Effect nesting depth 3.'"
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
          prompt: "Review output for: (1) Bun-only — no Node.js APIs, no require(), no node:* imports, Bun.env not process.env. (2) Effect-native — no raw Promises, no try/catch, no async/await outside Effect.tryPromise, no throw, no console.log outside Effect.sync. (3) Max nesting depth 3. Also check taxonomy compliance, prompt-artifact alignment, and composite quality >= 7.0. Read .claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml and .claude/skills/one-of-a-kind-design/references/PROMPT-ARTIFACT-ALIGNMENT.md."
          timeout: 60
---

## Critical

**10 Principles** — violating any produces generic output:

1. **Taste Before Technology** — resolve visual style BEFORE generating anything. Read `references/STYLE-INDEX.md`.
2. **Hero Asset as Design Anchor** — conceive the single most distinctive element first. 7 archetypes in `references/HERO-ASSET-ARCHETYPES.md`.
3. **UX-Informed Generation** — web-search for UX best practices BEFORE generating. Run `scripts/run-ux-research.ts` in E2B.
4. **One-Shot Then Layer** — generate complete output in a single pass, then iterate.
5. **Crafted Prompts, Not Raw Intent** — NEVER pass user words directly to fal.ai or QuiverAI. Route through the 15 prompt-crafter subagents in `.claude/agents/prompt-crafter-*.md`. Each outputs exactly one prompt, zero commentary.
6. **Closed-Loop Verification** — after EVERY fal.ai/QuiverAI call, run `scripts/validate-prompt-artifact-alignment.ts`. Compare what was requested with what was produced.
7. **Visual Annotation** — screenshot every artifact → annotate via fal.ai draw-over → present findings.
8. **Objective Quality** — composite score ≥ 7.0/10 to deliver. Run `scripts/score-output-quality.ts`. HARD STOP below threshold.
9. **Vector-First Where Possible** — use QuiverAI Arrow for logos, icons, decorative elements. Cheaper and more performant than raster.
10. **Portable Workflows** — every session can export as a tool-specific .zip for 50+ external tools.

## Workflow

### Step 0: Enhance Message

**ALWAYS FIRST.** Every message passes through `scripts/hooks/enhance-message.ts` (UserPromptSubmit hook). Deterministic, <50ms. Extracts 7 dimensions: output_type, industry, mood, audience, explicit_style, convention_breaking, quality_emphasis. Computes specificity (0-7).

**If specificity < 3**: Use `AskUserQuestion` (1-3 questions, 2-4 options). Target missing dimensions. Suggestions from `references/MESSAGE-ENHANCEMENT-RULES.md`.

### Step 0c: Web Search

**ALWAYS.** Search UX best practices for the artifact type + industry. Inject findings into generation context.

### Step 1: Resolve Style

Run `scripts/resolve-style.ts`. Maps intent → style config from taxonomy. Consults:
- `references/AUDIENCE-ROUTES.md` for industry→style mapping
- `references/CONFLICT-MAP.md` to validate style combinations
- `references/CREATIVE-DIALS.md` for dial defaults and overrides (design_variance, motion_intensity, visual_density, formality)

Returns: full style config with design_system_parameters, font_selection, motion_signature, premium_patterns, anti_slop_overrides.

### Step 2: Conceive Hero Asset

Read `references/HERO-ASSET-ARCHETYPES.md`. Select archetype matching the style's motion_signature:

| Archetype | When | Pipeline |
|---|---|---|
| Panning Scene | cinematic, editorial | `prompt-crafter-video-camera` → fal.ai video |
| Parallax Depth Stack | layered, atmospheric | `prompt-crafter-image-gen` → depth estimation |
| Generative Canvas | algorithmic styles | `prompt-crafter-image-gen` → fal.ai |
| 3D Object Showcase | product, isometric | `prompt-crafter-3d-gen` → Trellis |
| Typographic Statement | editorial, swiss | `prompt-crafter-image-gen` → fal.ai |
| Photographic Drama | double-exposure, infrared | `prompt-crafter-image-gen` → fal.ai |
| SVG Vector Graphic | logos, icons, decorative | `prompt-crafter-svg-gen` → QuiverAI Arrow |

**Routing**: If structural guidance needed → ControlNet. If background isolation → BiRefNet/Bria. If depth → Depth Anything. If vectorization of raster → QuiverAI image-to-SVG.

Run `scripts/select-fal-models.ts` + `scripts/select-pipeline-models.ts` to choose endpoints. Full model registry: `references/MODEL-REGISTRY-FAL.md` (48 image, 45 video). Pipeline: `references/PIPELINE-MODELS.md` (89 utility models).

### Step 3: Craft Prompt + Generate + Verify

**3a. Route** — `scripts/generate-api-prompt.ts` maps pipeline stage → subagent + API:

| Stage | Crafter | API |
|---|---|---|
| Image from scratch | `prompt-crafter-image-gen` | fal.ai |
| Image editing | `prompt-crafter-image-edit` | fal.ai |
| Style transfer | `prompt-crafter-style-transfer` | fal.ai |
| ControlNet | `prompt-crafter-controlnet` | fal.ai |
| Video text/image | `prompt-crafter-video-gen` | fal.ai |
| Video camera | `prompt-crafter-video-camera` | fal.ai |
| Video restyle | `prompt-crafter-video-restyle` | fal.ai |
| 3D mesh | `prompt-crafter-3d-gen` | fal.ai |
| Upscale | `prompt-crafter-upscale` | fal.ai |
| TTS | `prompt-crafter-audio-tts` | fal.ai |
| Music | `prompt-crafter-audio-music` | fal.ai |
| Annotation | `prompt-crafter-annotation` | fal.ai |
| Avatar | `prompt-crafter-avatar` | fal.ai |
| SVG from text | `prompt-crafter-svg-gen` | QuiverAI |
| SVG from image | `prompt-crafter-svg-vectorize` | QuiverAI |

**3b. Craft** — invoke subagent with style data + user intent. Subagent reads taxonomy references, produces one prompt.

**3c. Generate** — execute in E2B:
- fal.ai: `scripts/run-fal-generation.ts` (subscribe pattern)
- QuiverAI: `scripts/run-quiver-svg-generation.ts` or `run-quiver-svg-vectorization.ts`

**3d. Verify Alignment** — `scripts/validate-prompt-artifact-alignment.ts` in E2B. Per-job criteria in `references/PROMPT-ARTIFACT-ALIGNMENT.md`.
- **< 5.0**: AUTO-REGENERATE (different seed → higher-tier model → re-craft with misalignment feedback)
- **5.0-6.9**: FLAG for user
- **≥ 7.0**: PASS

**3e. Pipeline Enhancement** — conditional post-processing (each gets alignment check):
- Background removal → `scripts/run-background-removal.ts`
- Upscaling → `scripts/run-upscale.ts`
- Depth estimation → `scripts/run-depth-estimation.ts`
- SVG vectorization → `scripts/run-quiver-svg-vectorization.ts`

### Step 4: One-Shot Generation

Generate COMPLETE artifact in single pass:
- Resolved style's Tailwind v4 tokens (from `assets/tailwind-presets/{style-id}.css`)
- UX research findings
- Alignment-verified hero with composition techniques from `references/COMPOSITION-TECHNIQUES.md`
- 2+ premium_component_patterns from the style profile
- Motion matching motion_signature from `references/VISUAL-REFINEMENT-VOCAB.md`
- REALISTIC content (never Lorem Ipsum, never Acme Corp)

**Output types**: Website/web-app (React/HTML), Mobile (phone-frame), Image (fal.ai), Video (+ camera/pacing/audio), SVG (QuiverAI).

**Code rules**: Bun-only. Effect-native TypeScript. Max nesting depth 3.

### Step 5: Quality Evaluation (MANDATORY)

Run all validators, then `scripts/score-output-quality.ts`:

| Sub-score | Weight | Validator |
|---|---|---|
| Anti-slop gate | 0.15 | `scripts/validate-output.ts` |
| Code standards | 0.08 | `scripts/validate-code-standards.ts` |
| Asset quality | 0.12 | `scripts/validate-asset-quality.ts` |
| Prompt-artifact alignment | 0.15 | `scripts/validate-prompt-artifact-alignment.ts` |
| Aesthetic | 0.13 | `scripts/run-perceptual-quality.ts` |
| Style fidelity | 0.13 | `scripts/run-perceptual-quality.ts` |
| Distinctiveness | 0.13 | `scripts/run-perceptual-quality.ts` |
| Hierarchy | 0.06 | `scripts/run-perceptual-quality.ts` |
| Color harmony | 0.05 | `scripts/run-perceptual-quality.ts` |

**MINIMUM: 7.0/10.** Display score card. HARD STOP if below.

**Step 5g: Style Consistency (multi-frame workflows)**

For workflows producing multiple frames/images in a set, run `scripts/validate-style-consistency.ts` to verify cross-frame coherence:
- Style presence ratio: % of frames where target style detected
- Brand presence ratio: % of frames where product/brand detected
- Palette overlap: Jaccard similarity of color vocabulary across frame pairs
- Gate: 8.0 (configurable)

### Steps 6-10: Annotation → Refinement → Optimization

6. **Screenshot annotation** — `scripts/run-screenshot-annotation.ts` → present findings
7. **Refinement** — address annotation findings, re-generate if needed
8. **Asset optimization** — `scripts/optimize-assets.ts` (compression, format conversion)
9. **Convention-breaking** — consult `references/CONVENTION-BREAKING.md` for unexpected style applications
10. **Cross-pollination** — consult `references/CROSS-POLLINATION.md` for style fusion recipes

### Step 11: Export for External Tools

When user requests export or skill identifies a better-suited tool:

1. Identify target tool from `references/EXTERNAL-TOOLS-REGISTRY.md` (50+ tools, 10 categories) or `custom-tools/*.yaml`
2. Run `scripts/generate-tool-export.ts` → `.zip` with:
   - Tool-adapted prompts (Midjourney: `--ar --style --chaos`; ComfyUI: workflow JSON; Runway: `@reference` tags; Figma: Tokens Studio JSON)
   - Assets filtered to tool's accepted types
   - README.md from `export-guide-writer` agent
   - QUALITY-REPORT.md, STYLE-SPEC.md, UX-RESEARCH.md
3. Template structure in `references/TOOL-EXPORT-TEMPLATES.md`

### Step 12: Register Custom Tool

When user references an unrecognized tool:
1. Check registry → not found → `AskUserQuestion` (tool type, file imports, prompt format)
2. If docs_url provided → web-search to auto-fill
3. `scripts/register-custom-tool.ts` validates + stores in `custom-tools/{tool-id}.yaml`
4. Schema in `references/CUSTOM-TOOL-SCHEMA.md`

## Prompt Crafters

15 subagents in `.claude/agents/` (model: haiku, tools: Read). Each outputs exactly one prompt — zero markdown, zero commentary.

System prompts and rationale: `references/FAL-PROMPT-SYSTEMS.md`. Alignment criteria: `references/PROMPT-ARTIFACT-ALIGNMENT.md`.

Crafters read taxonomy references to inject style-specific tokens. Example: `prompt-crafter-svg-gen` reads art-deco palette → outputs "geometric symmetrical ornament, gold (#C9A84C) fills on black (#1A1A1A), no gradients, clean vector paths."

## Quality Agents

3 agents in `.claude/agents/`:
- `ux-reviewer.md` — navigation clarity, hierarchy, accessibility
- `style-guard.md` — taxonomy compliance, anti-slop, dial reflection
- `quality-assessor.md` — composite scoring, score card display

## Anti-Slop (HARD RULES)

Full reference: `references/ANTI-SLOP.md`. Top 10:

1. **NO Inter/Roboto/Open Sans** — use style-specific typography from taxonomy
2. **NO purple-to-blue gradients** — derive palette from style's color_palette_type
3. **NO Tailwind default shadows** — use style's shadow_model or none
4. **NO hero→features→testimonials→CTA skeleton** — restructure per style's layout_philosophy
5. **NO linear easing** — spring physics or style-appropriate curve
6. **NO #000000 body text** — off-black (#111, #1a1a1a, #2F3437)
7. **NO Lorem Ipsum/Acme Corp** — realistic, contextual content
8. **NO "Elevate/Seamless/Unleash"** — specific, human copy
9. **NO identical card grids** — vary sizes for hierarchy
10. **NO simultaneous element mount** — stagger entry (80ms delay per index)

## Environment

Requires three API keys: `FAL_KEY` (fal.ai), `E2B_API_KEY` (E2B sandboxes), `QUIVERAI_API_KEY` (QuiverAI SVG).

All fal.ai scripts use `@fal-ai/client` subscribe pattern. QuiverAI uses `@quiverai/sdk`. E2B uses `@e2b/code-interpreter`. Patterns: `references/FAL-API-PATTERNS.md`, `references/QUIVER-API-PATTERNS.md`, `references/E2B-PATTERNS.md`.

## Prerequisites

### Required Dependencies

```bash
bun add effect @effect/platform @fal-ai/client @quiverai/sdk @e2b/code-interpreter yaml archiver
bun add -d typescript @biomejs/biome @types/bun @types/archiver
```

All scripts import `effect` and `yaml` — these must be in `package.json`. Without them, any script will fail with "Cannot find package".

### Agent Dependencies

The 19 subagent files in `.claude/agents/` are required for the pipeline to function. They are NOT bundled inside the skill directory — they live at the repo level.

**Source:** `github.com/srinitude/one-of-a-kind-design-skill/.claude/agents/`

**Verify agents are present (expect 19 files):**

```bash
ls .claude/agents/prompt-crafter-*.md .claude/agents/quality-assessor.md .claude/agents/style-guard.md .claude/agents/ux-reviewer.md .claude/agents/export-guide-writer.md | wc -l
```

If missing, clone the full repo — the `.claude/agents/` directory must be at the repo root, not inside the skill directory. When using `bunx` to install from skills.sh, agents may not be copied. In that case, manually copy from the source repo:

```bash
# From the source repo root
cp -r .claude/agents/ /path/to/your/project/.claude/agents/
```

### Script Paths

All scripts are at `.claude/skills/one-of-a-kind-design/scripts/`, NOT at `scripts/` (root). The root `scripts/` directory is unrelated.

```bash
# Correct
bun run .claude/skills/one-of-a-kind-design/scripts/resolve-style.ts

# Wrong — will fail
bun run scripts/resolve-style.ts
```

The `package.json` scripts use full paths. Use `bun run <script-name>` for the registered commands.

### Image-Only Workflows

For image/video/SVG generation without code output:
- Steps 0-3: Execute normally (enhance, style resolve, hero asset, craft+generate+verify)
- Step 4: Skip (no code artifact to generate)
- Step 5: Quality evaluation with `--workflow "image-only"` — `codeStandardsGate` is null, weight redistributes to visual sub-scores
- Steps 6-10: Execute normally (annotation, refinement, optimization, convention-breaking, cross-pollination)
- `validate-output.ts` returns N/A pass for non-code asset types (.png, .jpg, .mp4, etc.)

### Workflow Step Ordering (MANDATORY)

Steps 0 through 10 MUST be executed sequentially in order. No step may be skipped. Each step depends on outputs from prior steps:

| Step | Depends On | Produces |
|------|-----------|----------|
| 0. Enhance Message | User input | 7 dimensions, specificity score |
| 0c. Web Search | Step 0 output_type + industry | UX findings |
| 1. Resolve Style | Step 0 dimensions | Full style config |
| 2. Conceive Hero | Step 1 style config | Archetype + model selection |
| 3. Craft + Generate | Steps 1-2 | Verified hero asset |
| 4. One-Shot Gen | Steps 0c, 1, 3 | Complete artifact |
| 5. Quality Eval | Step 4 output | Score card (gate: 7.0) |
| 5g. Style Consistency | Step 3 descriptions | Consistency score (multi-frame only) |
| 6. Annotate | Step 4/5 output | Annotation findings |
| 7. Refine | Step 6 findings | Refined artifact |
| 8. Optimize | Step 7 output | Optimized assets |
| 9. Convention-Break | Steps 1, 7 | Style-pushed variant |
| 10. Cross-Pollinate | Steps 1, 7 | Style fusion |

## Troubleshooting

| Issue | Fix |
|---|---|
| fal.ai timeout | Increase to 5min. Check model status at fal.ai/dashboard |
| QuiverAI 401 | Verify QUIVERAI_API_KEY. Regenerate at quiver.ai |
| E2B sandbox fails | Check E2B_API_KEY. Verify quota at e2b.dev/dashboard |
| Alignment < 5.0 after 3 retries | Escalate to higher-tier model. If still failing, flag for manual review |
| Composite < 7.0 | Review sub-score breakdown. Fix lowest-scoring dimension first |
| Style conflict detected | Check `references/CONFLICT-MAP.md` for hard vs soft. Soft conflicts have compromise patterns |
| Export .zip missing files | Verify tool's accepts declaration in registry or custom-tools/ |

## Performance Notes
- Take your time with style resolution. Read the full taxonomy entry before resolving.
- Do NOT skip validation steps even when confident. Every generation gets alignment-checked.
- Quality > speed. A 7.0 composite reached in 3 attempts beats an 8.0 achieved by luck.
- When blocked by a hook or safety check, STOP. Do not work around it. The block is correct.
- If a fal.ai call fails, try a different model before retrying the same endpoint.
- Never fabricate alignment scores or quality sub-scores. Report actual measured values.
- If composite < 7.0 after 3 attempts, report this to the user honestly rather than continuing.
- Fix one quality dimension at a time — do not attempt to fix all sub-scores simultaneously.
- After 2 failed regenerations at the same tier, escalate exactly one tier. Never skip tiers.
- Maximum 15 fal.ai calls per pipeline run. If reached, stop and report remaining work.

## Examples

### Omakase Counter Rebrand
User says: "I need a website for a 12-seat omakase restaurant in Brooklyn. No photos of food — the site should feel like sitting at the counter."
Actions:
1. Enhancement extracts: output=website, industry=food, mood=[warm, minimal, intimate], specificity=5/7
2. Style resolution: wabi-sabi (food + intimate → wabi-sabi via AUDIENCE-ROUTES)
3. Hero asset: Typographic Statement → prompt-crafter-image-gen → Flux 1.1 Ultra
4. One-shot generation with wabi-sabi Tailwind preset + organic_drift motion
5. Quality evaluation: composite 8.5/10 (PASS)
Result: Full website with hand-textured typography, no food photography, seasonal palette system
See: references/examples/omakase-counter-rebrand.md

### Arctic Research Dashboard
User says: "Climate nonprofit needs an internal dashboard for Arctic ice shelf data. Beautiful enough for donor screenshots."
Actions:
1. Enhancement extracts: output=web-app, industry=science, mood=[urgent, beautiful], specificity=5/7
2. Style resolution: swiss-international + generative-art (science + authority → swiss)
3. Hero asset: Generative Canvas → prompt-crafter-image-gen → Flux Pro
4. One-shot generation with swiss-international preset + particle system viz
5. Quality evaluation: composite 8.3/10 (PASS)
Result: Data dashboard with glacial-to-volcanic color coding, aurora-inspired gradients
See: references/examples/arctic-research-dashboard.md

### Brutalist Zine Streetwear Drop
User says: "Tokyo streetwear label dropping a capsule. Need a digital zine — raw, confrontational, illegible on purpose."
Actions:
1. Enhancement extracts: output=image, industry=fashion, mood=[raw, confrontational], specificity=6/7
2. Style resolution: brutalist-web + risograph (fashion + raw → brutalist-web)
3. Hero asset: Photographic Drama → prompt-crafter-image-gen → Flux Pro (6 frames)
4. Multi-frame generation with style consistency validation across all 6 zine spreads
5. Quality evaluation: composite 8.2/10 (PASS), style consistency 8.5 (PASS)
Result: 6-spread digital zine with risograph color separation and deliberate degradation
See: references/examples/brutalist-zine-streetwear-drop.md

### Afrofuturist Animation Studio Identity
User says: "Lagos animation studio needs vector identity — logo, character silhouettes, pattern library. Must work at 16px to 4K."
Actions:
1. Enhancement extracts: output=svg, industry=media, mood=[bold, geometric], specificity=6/7
2. Style resolution: afrofuturism (media + African diaspora → afrofuturism)
3. Hero asset: SVG Vector Graphic → prompt-crafter-svg-gen → QuiverAI Arrow
4. E2B sandbox for SVGO optimization + multi-size export validation
5. Quality evaluation: composite 8.6/10 (PASS)
Result: Nsibidi-inspired geometric logo, 5 silhouettes, pattern library as SVG sprite sheet
See: references/examples/afrofuturist-animation-studio-identity.md

### Deconstructed Opera Trailer
User says: "Contemporary opera company needs a 15-second trailer. Fractured, layered, uncomfortable beauty."
Actions:
1. Enhancement extracts: output=video, industry=performing-arts, mood=[fractured, layered], specificity=6/7
2. Style resolution: deconstructivism (performing-arts + fractured → deconstructivism)
3. Hero asset: Panning Scene → prompt-crafter-video-camera → Kling v2 Master
4. Camera choreography: [Slow push] → [Whip pan] → [Static hold] + video restyle
5. Quality evaluation: composite 8.4/10 (PASS)
Result: 15s trailer with fractured camera movements mirroring Butterfly's psychological arc
See: references/examples/deconstructed-opera-trailer.md

### Somatic Therapist Practice App
User says: "Somatic therapist needs app screens for booking and intake. Clients are trauma survivors — interface must feel safe."
Actions:
1. Enhancement extracts: output=mobile-app, industry=healthcare, mood=[safe, warm], specificity=5/7
2. Style resolution: scandinavian-minimalism + wabi-sabi (healthcare + safe → scandi-minimal)
3. Hero asset: Parallax Depth Stack → prompt-crafter-image-gen → Flux Pro
4. One-shot generation with warm neutrals, generous touch targets, no sharp corners
5. Quality evaluation: composite 8.3/10 (PASS)
Result: Trauma-informed mobile screens with warm neutrals, body-aware design
See: references/examples/somatic-therapist-practice-app.md
