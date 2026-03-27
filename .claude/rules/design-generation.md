---
description: Full design generation workflow with routing tables and hero archetypes
---

## Hero Asset Archetypes

| Archetype | When to use | Pipeline |
|-----------|------------|---------|
| Panning Scene | cinematic, editorial | `prompt-crafter-video-camera` -> fal.ai video |
| Parallax Depth Stack | layered, atmospheric | `prompt-crafter-image-gen` -> depth estimation |
| Generative Canvas | algorithmic styles | `prompt-crafter-image-gen` -> fal.ai |
| 3D Object Showcase | product, isometric | `prompt-crafter-3d-gen` -> Trellis |
| Typographic Statement | editorial, swiss | `prompt-crafter-image-gen` -> fal.ai |
| Photographic Drama | double-exposure, infrared | `prompt-crafter-image-gen` -> fal.ai |
| SVG Vector Graphic | logos, icons, decorative | `prompt-crafter-svg-gen` -> QuiverAI Arrow |

Select archetype matching the style's motion_signature. Reference: `.claude/skills/one-of-a-kind-design/references/HERO-ASSET-ARCHETYPES.md`.

## Prompt-Crafter Routing

| Stage | Crafter Subagent | Target API |
|-------|-----------------|-----------|
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

Route via `.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt.ts`. NEVER pass user words directly to APIs.

## Pipeline Enhancement (each gets alignment check after)

- Background removal: `.claude/skills/one-of-a-kind-design/scripts/run-background-removal.ts`
- Upscaling: `.claude/skills/one-of-a-kind-design/scripts/run-upscale.ts`
- Depth estimation: `.claude/skills/one-of-a-kind-design/scripts/run-depth-estimation.ts`
- SVG vectorization: `.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-vectorization.ts`
- Video restyle: `.claude/skills/one-of-a-kind-design/scripts/run-video-restyle.ts`

## Output Types

- Website/web-app: React/HTML with Tailwind v4 tokens from `.claude/skills/one-of-a-kind-design/assets/tailwind-presets/{style-id}.css`
- Mobile: Phone-frame wrapper
- Image: fal.ai generation
- Video: fal.ai + camera choreography + audio
- SVG: QuiverAI Arrow (vector-first for logos, icons)

## Composition Techniques

Reference: `.claude/skills/one-of-a-kind-design/references/COMPOSITION-TECHNIQUES.md`. Apply 2+ premium_component_patterns from the style profile. Use motion matching motion_signature from `.claude/skills/one-of-a-kind-design/references/VISUAL-REFINEMENT-VOCAB.md`.
