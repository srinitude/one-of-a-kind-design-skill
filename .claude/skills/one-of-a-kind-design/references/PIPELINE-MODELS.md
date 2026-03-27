# PIPELINE-MODELS.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete registry of all 89 functional pipeline models. These are composable pipeline stages that transform, enhance, annotate, or extend outputs from image/video generation models. All endpoints are fal.ai unified API (requires FAL_KEY) unless noted as QuiverAI.

---

## Background Removal (3 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| BiRefNet v2 | `fal-ai/birefnet/v2` | pro | Bilateral reference framework, hair-strand precision, transparent object handling, up to 2048x2048 | Isolate hero asset subjects for compositing over UI, extract product shots from cluttered backgrounds, create transparent PNGs |
| Bria RMBG 2.0 | `fal-ai/bria/rmbg` | standard | Commercially safe (trained exclusively on licensed data), fast, reliable for clean product shots | E-commerce product isolation, safe for client deliverables requiring license clarity |
| Video Background Removal | `fal-ai/bria/video/background-removal` | pro | Per-frame background removal without green screen, temporal consistency across frames | Clean video hero assets, create transparent video overlays for scroll-driven backgrounds |

**BiRefNet v2 Variants:**
- General Use (Light) -- fast, lower resource
- General Use (Light 2K) -- light model at 2K resolution
- General Use (Heavy) -- maximum precision
- Matting -- alpha matte extraction
- Portrait -- optimized for human subjects
- General Use (Dynamic) -- adaptive processing

---

## Upscaling (5 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| Topaz Image Upscale | `fal-ai/topaz/upscale/image` | premium | Face enhancement, sharpening, denoising, up to 16x, subject detection, film grain control | Upscale hero images to retina resolution, enhance AI-generated images that are soft or low-res |
| Topaz Video Upscale | `fal-ai/topaz/upscale/video` | premium | Cinema-grade video upscaling, frame interpolation, compression artifact removal, film grain control | Upscale hero video assets to 4K, clean compression artifacts from generated video |
| SeedVR Upscale | `fal-ai/seedvr` | pro | Ultra-realistic skin and texture preservation, superior to Topaz on portrait/face content | Upscale portrait-heavy assets, fashion and beauty hero imagery |
| ESRGAN | `fal-ai/esrgan` | fast | Fast general-purpose upscaling, well-understood baseline model | Batch upscale texture assets, quick prototype enhancement |
| Clarity Upscale | `fal-ai/clarity-upscale` | standard | Raster image enhancement, sharpening, cleaning | Enhance screenshots for annotation pipeline, clean up scroll-frame sequences |

**Topaz Image Variants:** Standard V2, Low Resolution V2, CGI, High Fidelity V2, Text Refine, Redefine, Recovery V2

**Topaz Video Variants:** Proteus, Artemis HQ, Artemis MQ, Artemis LQ, Nyx, Nyx Fast, Nyx XL, Nyx HF, Gaia HQ, Gaia CG (optimized for AI-generated and CG content)

---

## Image Restoration (1 model)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| NAFNet | `fal-ai/nafnet` | standard | Deblurring, denoising, general image restoration | Fix motion-blurred frames from video extraction, restore compressed JPEG artifacts in scroll sequences |

---

## Depth Estimation (2 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| Depth Anything V2 | `fal-ai/depth-anything/v2` | standard | Monocular depth estimation from single images, high accuracy | Generate depth maps for parallax effects, create z-layers for scroll-driven depth stacking |
| Depth Anything Video | `fal-ai/depth-anything-video` | pro | Per-frame depth with temporal consistency, 5 colormaps, raw depth export (.npz), side-by-side comparison | Create depth-aware video compositions, enable 3D parallax from 2D video assets |

**Depth Anything Video Model Sizes:** Small, Base, Large

**Colormaps:** grayscale, inferno, spectral, viridis, plasma

**Style Affinity:** glassmorphism, papercut, double-exposure, parallax-card-stack archetype, cinematic

---

## OCR & Vision (3 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| GOT-OCR2 | `fal-ai/got-ocr2` | standard | Plain documents, scene text, formatted documents, tables, charts, mathematical formulas, geometric shapes, molecular formulas, sheet music | Extract text from screenshot annotations, read content from reference images for design context |
| MoonDreamNext | `fal-ai/moondream-next` | standard | Multimodal vision-language model, gaze detection for UX analysis, UI element position detection | Analyze screenshots for UX annotation (gaze tracking), detect UI element positions, validate visual hierarchy |
| NSFW Detection | `fal-ai/nsfw-detection` | fast | Binary SFW/NSFW classification | Safety gate on all generated image and video assets before delivery |

**MoonDreamNext Capabilities:** captioning, gaze detection, bounding box detection, point detection

---

## Video Utilities (3 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| FFmpeg Video Compose | `fal-ai/ffmpeg/compose` | utility | Compose videos from multiple media sources, overlay, concatenate, mix | Combine hero video with scroll-frame sequence, add audio tracks to video assets |
| FFmpeg Waveform | `fal-ai/ffmpeg/waveform` | utility | Extract waveform data from audio files | Generate audio visualization assets for music and entertainment styles |
| Video Auto Caption | `fal-ai/video-auto-caption` | standard | Automatic subtitle generation from video audio, customizable text color and font | Add captions to video hero assets, accessibility compliance, social media video assets |

---

## ControlNet (6 models)

| Model | fal.ai Endpoint | Tier | Control Modes | Strengths |
|-------|-----------------|------|---------------|-----------|
| Z-Image Turbo ControlNet | `fal-ai/z-image/turbo/controlnet` | fast | raw_image, canny_edges, depth_map, pose_skeleton | 4 preprocessing modes in single model, multi-format output, ultra-fast 6B params, $0.0065/MP |
| FLUX.1 [pro] ControlNet | `fal-ai/flux-pro/v1/controlnet` | pro | canny, depth, pose | FLUX quality with structural guidance, fine-tuned LoRA support |
| FLUX.1 [dev] Depth | `fal-ai/flux-depth/dev` | standard | depth | Generate images from depth maps, scene understanding, parallax-ready output |
| FLUX.1 [pro] Depth | `fal-ai/flux-depth/pro` | pro | depth | Premium depth-to-image generation, superior detail preservation |
| SDXL ControlNet Union | `fal-ai/sdxl-controlnet-union` | standard | depth, canny, teed, normal, segmentation | Multi-mode control in single model, inpainting support, 5 control types |
| Pose Estimation | `fal-ai/pose-estimation` | utility | -- | Extract pose skeletons from images for use as ControlNet input |

**Per-Style Control Mode Mapping (Z-Image Turbo ControlNet):**

| Style | Control Mode | Strength | Rationale |
|-------|-------------|----------|-----------|
| bauhaus | canny_edges | 0.9 | Enforce geometric grid structure |
| de-stijl | canny_edges | 0.9 | Enforce rectilinear grid |
| constructivism | canny_edges | 0.8 | Enforce diagonal compositions |
| swiss-international | canny_edges | 0.8 | Enforce mathematical grid |
| art-nouveau | raw_image | 0.3 | Preserve organic curves loosely |
| isometric | depth_map | 0.8 | Maintain consistent 3D perspective |
| wireframe-mesh | depth_map | 0.7 | Maintain spatial structure |
| cinematic | depth_map | 0.5 | Guide scene depth without rigidity |
| surrealism | raw_image | 0.2 | Allow maximum distortion |
| pop-art | canny_edges | 0.6 | Preserve comic panel structure |

---

## Image Editing / Inpainting (11 models)

### Inpainting

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| FLUX.1 [pro] Fill | `fal-ai/flux-pro/v1/fill` | pro | Mask-based surgical editing, object replacement, gap filling, $0.05/MP | Fix specific regions flagged by UX annotation, replace elements that conflict with style palette |
| FLUX General Inpainting | `fal-ai/flux-general/inpainting` | standard | LoRA + ControlNet + IP-Adapter support, versatile editing | Style-specific inpainting using taxonomy LoRA adaptations |
| OneReward | `fal-ai/onereward` | standard | Fine-tuned FLUX 1.0 Fill with intelligent editing capabilities | Smart object removal and replacement in hero imagery |

### Style Transfer

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| FLUX Kontext [pro] | `fal-ai/flux-kontext/pro` | pro | Multi-reference image conditioning via URL arrays, context-aware editing, $0.055/MP | Apply taxonomy style to existing images via style reference images |
| FLUX Kontext [max] | `fal-ai/flux-kontext/max` | premium | Highest quality multi-reference editing, $0.11/MP | Premium style transfer for client deliverables, hero image refinement |
| FLUX.1 [schnell] Redux | `fal-ai/flux/schnell/redux` | fast | Rapid style transfer and image modification from reference, 1-4 steps | Quick style exploration, batch-process into same taxonomy style |
| FLUX.1 [dev] Redux | `fal-ai/flux/dev/redux` | standard | Balanced quality and speed style transfer | Apply taxonomy aesthetics to user-provided reference images |

### Color & Material

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| HY-WU | `fal-ai/hy-wu` | pro | Outfit transfer, face swap, texture blending via natural language | Swap textures and materials to match style palette |
| PhysicEdit | `fal-ai/physic-edit` | pro | Physics-aware editing -- refraction, material changes, deformation | Material and surface editing that respects physical reality |
| Bria Background Replace | `fal-ai/bria/background-replace` | standard | Swap backgrounds via text prompt or reference image, commercially safe | Place isolated products into style-matched environments |
| Bria Embed Product | `bria/embed-product` | pro | Pixel-perfect product placement into predefined scenes, multi-product | Integrate product shots into style-matched hero compositions |

**PhysicEdit Style Affinity:**
- glassmorphism: frosted glass refraction effects
- liquid-glass: dynamic light refraction and caustics
- art-deco: metallic surface reflections and bevels
- neomorphism: soft plastic material interactions
- claymorphism: puffy inflated material deformation

### General Image Editing

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| GPT Image 1 | `fal-ai/gpt-image-1` | premium | Natural language image editing, high fidelity, complex drawing instructions | UX screenshot annotation (draw-over), iterative hero image refinement |
| Nano Banana 2 Edit | `fal-ai/nano-banana-2/edit` | fast | Fast Google-powered editing, high quality per token | Rapid iteration on generated assets, quick color tweaks |
| Nano Banana Pro Edit | `fal-ai/nano-banana-pro/edit` | pro | Premium Google editing model, state-of-the-art quality | Production-quality asset refinement |
| Qwen-Image-2.0 Edit | `fal-ai/qwen-image-2/edit` | standard | Unified generation and editing architecture | Generate-then-edit workflow in single model family |
| Qwen-Image-2.0 Pro Edit | `fal-ai/qwen-image-2/pro/edit` | pro | Premium Qwen editing with strong prompt adherence | High-quality refinement for production deliverables |
| FireRed Image Edit v1.1 | `fal-ai/firered-image-edit-v1.1` | standard | Improved image editing capabilities over v1 | General-purpose image refinement |
| Ideogram V2 Edit | `fal-ai/ideogram/v2/edit` | pro | Precise editing with strong typography preservation | Edit images containing text without corrupting typography |

---

## Video Control Models (13 models)

### Camera Control

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| Kling 3 Pro (Camera) | `fal-ai/kling-video/v3/pro` | premium | Native audio, multi-shot, custom element consistency, up to 15s 1080p |
| Higgsfield DoP | `fal-ai/higgsfield/dop` | pro | Director of Photography level camera control for cinematic shots |
| Goal Force | `fal-ai/goal-force` | pro | Physics-based video generation -- point where objects move, set force direction and strength |

**Kling 3 Pro Camera Bracket Notation (max 3 per prompt):**
`[Truck left]`, `[Truck right]`, `[Pan left]`, `[Pan right]`, `[Push in]`, `[Pull out]`, `[Pedestal up]`, `[Pedestal down]`, `[Tilt up]`, `[Tilt down]`, `[Zoom in]`, `[Zoom out]`, `[Shake]`, `[Tracking shot]`, `[Static shot]`

### Motion Transfer

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| Kling v3 Pro Motion Control | `fal-ai/kling-video/v3/pro/motion-control` | premium | Transfer movements from reference video to any character image |
| Kling v3 Standard Motion Control | `fal-ai/kling-video/v3/standard/motion-control` | standard | Cost-effective motion transfer for portraits and simple animations |
| Kling O3 Image-to-Video | `fal-ai/kling-video/o3/standard/image-to-video` | pro | Start frame + end frame animation with text-driven guidance |
| Luma Modify Video | `fal-ai/luma/modify-video` | pro | Restyle existing video footage while preserving original motion |
| Marey Motion Transfer | `fal-ai/marey/motion-transfer` | premium | Choreography transfer, steadicam paths, licensed data |
| Marey Pose Transfer | `fal-ai/marey/pose-transfer` | premium | Frame-accurate pose transfer |

### Video Extension

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| LTX-2 Extend Video | `fal-ai/ltx-2/extend-video` | standard | Extend video duration with audio continuity |
| LTX-2.3 Extend Video | `fal-ai/ltx-2.3/extend-video` | pro | Improved extension quality with lipsync and style preservation |

### Video Restyling

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| LTX-2.3 Retake Video | `fal-ai/ltx-2.3/retake-video` | pro | Video-to-video restyling while preserving motion structure |
| Cosmos Predict 2.5 V2V | `fal-ai/cosmos-predict-2.5/video-to-video` | pro | NVIDIA 2B parameter model, text-driven video transformation |

### Multi-Shot

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| MultiShotMaster | `fal-ai/multishot-master` | pro | Controllable multi-shot narrative video, variable shot counts/durations, customized subjects |

### Audio-to-Video

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| LTX-2 Audio-to-Video | `fal-ai/ltx-2/audio-to-video` | standard | Generate video from audio input, audio-reactive generation |
| LTX-2.3 Audio-to-Video | `fal-ai/ltx-2.3/audio-to-video` | pro | Improved audio-to-video quality with lipsync support |

---

## 3D Mesh Generation (7 models)

| Model | fal.ai Endpoint | Tier | Output | Strengths |
|-------|-----------------|------|--------|-----------|
| Trellis 2 | `fal-ai/trellis-2` | pro | GLB | Improved quality, configurable resolution (512p/1024p/1536p), SLAT + DINOv2 |
| Trellis 2 Retexture | `fal-ai/trellis-2/retexture` | pro | GLB | Retexture existing 3D models from new reference images |
| Trellis | `fal-ai/trellis` | standard | GLB | Fast, reliable single-image to 3D, proven SLAT architecture |
| Trellis Multi | `fal-ai/trellis/multi` | pro | GLB | Multi-image input for improved geometry accuracy |
| Hunyuan 3D | `fal-ai/hunyuan3d` | pro | GLB | Versatile 3D asset creation, multiple output variants |
| Hyper3D Rodin | `fal-ai/hyper3d/rodin` | pro | GLB | Detailed character and object 3D models with fine geometry |
| TripoSR | `fal-ai/triposr` | fast | GLB | Extremely fast single-image 3D generation |

**Trellis 2 Retexture Style Affinity:**
- art-deco: gold and brass metallic materials
- wabi-sabi: earth tone, imperfect ceramic textures
- vaporwave: chrome and iridescent surfaces
- brutalist-web: raw concrete and exposed materials
- claymorphism: soft matte puffy materials

---

## Avatar & Human Models (12 models)

### Talking Head

| Model | fal.ai Endpoint | Tier | Pricing | Strengths |
|-------|-----------------|------|---------|-----------|
| OmniHuman v1.5 | `fal-ai/bytedance/omnihuman/v1.5` | pro | $0.16/sec | Audio-driven video from single image, emotion correlation, 720p/1080p, turbo mode, up to 60s |
| OmniHuman v1 | `fal-ai/bytedance/omnihuman` | standard | $0.14/sec | Proven audio-to-video human animation, 18700 hours training data |
| MultiTalk | `fal-ai/multitalk` | standard | -- | Text-to-speech plus avatar animation in single pipeline |
| Aurora (Creatify) | `fal-ai/creatify/aurora` | premium | -- | Studio-quality avatar speaking and singing |

### Lipsync

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| Sync Lipsync 2.0 | `fal-ai/sync-lipsync/v2` | standard | Realistic lipsync from audio, advanced synchronization |
| PixVerse Lipsync | `fal-ai/pixverse/lipsync` | standard | Lipsync with visual style control options |

### Translation

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| Heygen Translate (Speed) | `fal-ai/heygen/v2/translate/speed` | pro | Extreme speed video translation with lip-synced dubbing |
| Heygen Translate (Precision) | `fal-ai/heygen/v2/translate/precision` | premium | Highest accuracy video translation and dubbing |
| Heygen Photo Avatar 4 | `fal-ai/heygen/avatar4/image-to-video` | pro | Photo-to-avatar video generation |

### Face & Try-On

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| Face Swap | `fal-ai/face-swap` | standard | Single face swap with scene preservation |
| Easel AI Advanced Face Swap | `easel-ai/advanced-face-swap` | pro | One or two simultaneous face swaps |
| Kling Kolors Virtual TryOn v1.5 | `fal-ai/kling/kolors-virtual-tryon` | pro | Commercial-grade virtual clothing try-on |

---

## Audio Models (11 models)

### Text-to-Speech

| Model | fal.ai Endpoint | Tier | Pricing | Strengths |
|-------|-----------------|------|---------|-----------|
| Gemini TTS | `fal-ai/gemini-tts` | pro | -- | 30 voices, natural language style/pace/emotion control, multi-speaker, inline markers |
| MiniMax Speech 02 HD | `fal-ai/minimax/speech-02-hd` | premium | $0.10/1K chars | 300+ voices, 30+ languages, emotion presets, custom voice cloning |
| F5 TTS | `fal-ai/f5-tts` | standard | -- | Zero-shot voice cloning from single sample, multi-language |
| Dia TTS | `fal-ai/dia-tts` | fast | $0.04/1K chars | Multi-speaker dialog with natural nonverbal cues, two-speaker |
| ElevenLabs Turbo v2.5 | `fal-ai/elevenlabs/tts/turbo-v2.5` | pro | -- | Industry-leading natural speech, extensive voice library |
| Inworld TTS-1.5 Max | `fal-ai/inworld/tts-1.5-max` | standard | -- | Optimized for interactive and game contexts |
| Chatterbox TTS | `fal-ai/chatterbox` | standard | -- | Expressive TTS for memes, videos, games, AI agents |

**Gemini TTS Models:** gemini-2.5-flash-tts (fast, cost-efficient), gemini-2.5-pro-tts (highest quality, multi-speaker)

**Gemini TTS Inline Markers:** `[slowly]`, `[whispering]`, `[excited]`, `[extremely fast]`

**Dia TTS Nonverbal Cues:** `(laughs)`, `(whispers)`, `(excited)`, `(clears throat)`

### Voice Cloning

| Model | fal.ai Endpoint | Tier | Pricing | Strengths |
|-------|-----------------|------|---------|-----------|
| Zonos Voice Clone | `fal-ai/zonos` | standard | -- | Open-source Apache 2.0, 1.6B params, emotion control, multilingual (EN/JP/ZH/FR/DE), 44kHz |
| MiniMax Voice Clone | `fal-ai/minimax/voice-clone` | pro | $1.50/clone | Custom voice ID creation for reuse across all MiniMax TTS calls |

### Music & SFX

| Model | fal.ai Endpoint | Tier | Strengths |
|-------|-----------------|------|-----------|
| CassetteAI Music | `fal-ai/cassetteai/music-gen` | standard | Royalty-free instrumental music, genres: electronic, hip hop, indie rock, cinematic, classical |
| CassetteAI SFX | `fal-ai/cassetteai/sfx-gen` | standard | Professional sound effects: animal, vehicle, nature, sci-fi, otherworldly |

**CassetteAI Music Style Affinity:**
- cinematic: cinematic genre
- vaporwave: electronic genre with nostalgic feel
- psychedelic: electronic genre with experimental feel
- editorial-minimalism: classical genre, minimal arrangement
- brutalist-web: electronic genre, industrial feel

---

## Conversion Models (2 models)

| Model | fal.ai Endpoint | Tier | Strengths | Use In Pipeline |
|-------|-----------------|------|-----------|-----------------|
| OmniLottie | `fal-ai/omnilottie` | standard | Convert raster and vector assets to Lottie animation format (.json) | Convert generated illustrations to Lottie for lightweight web animation |
| VecGlypher | `fal-ai/vecglypher` | pro | Vector font generation from prompts | Generate custom display typefaces matching taxonomy style parameters |

**OmniLottie Style Affinity:** flat-design, bauhaus, pop-art, memphis-design, isometric

---

## SVG Models (via QuiverAI API)

| Model | Provider | SDK Method | Tier | Strengths |
|-------|----------|------------|------|-----------|
| QuiverAI Arrow (Text-to-SVG) | QuiverAI | `client.createSVGs.generateSVG()` | standard | High-quality SVG generation from text prompts with optional reference images and style instructions |
| QuiverAI Arrow (Image-to-SVG) | QuiverAI | `client.vectorizeSVG.vectorizeSVG()` | standard | High-fidelity raster-to-SVG vectorization, production-ready vector output |

**SDK:** `@quiverai/sdk` | **Auth:** Bearer token via `QUIVERAI_API_KEY` | **Model ID:** `arrow-preview` | **Billing:** 1 credit per SVG | **Rate Limit:** 20 requests per 60 seconds per organization

---

## Pipeline Model Selection Decision Tree

### Background Removal
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Commercial deliverable | Bria RMBG 2.0 | `fal-ai/bria/rmbg` |
| Complex edges / hair / transparency | BiRefNet v2 Heavy | `fal-ai/birefnet/v2` (variant Heavy) |
| Simple product on white | BiRefNet v2 Light | `fal-ai/birefnet/v2` (variant Light) |
| Video background | Video Background Removal | `fal-ai/bria/video/background-removal` |

### Upscaling
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| AI-generated image | Topaz Image CGI variant | `fal-ai/topaz/upscale/image` |
| Face-heavy content | SeedVR | `fal-ai/seedvr` |
| AI-generated video | Topaz Video Gaia CG | `fal-ai/topaz/upscale/video` |
| Quick batch | ESRGAN | `fal-ai/esrgan` |
| General enhancement | Clarity Upscale | `fal-ai/clarity-upscale` |

### Structural Guidance
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Geometric layout | Z-Image Turbo ControlNet canny_edges | `fal-ai/z-image/turbo/controlnet` |
| 3D perspective | FLUX [pro] Depth | `fal-ai/flux-depth/pro` |
| Character pose | Z-Image Turbo ControlNet pose_skeleton | `fal-ai/z-image/turbo/controlnet` |
| Multi-control | SDXL ControlNet Union | `fal-ai/sdxl-controlnet-union` |

### Image Editing
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Surgical mask edit | FLUX [pro] Fill | `fal-ai/flux-pro/v1/fill` |
| Style transfer from reference | FLUX Kontext [pro] | `fal-ai/flux-kontext/pro` |
| Physics-aware material | PhysicEdit | `fal-ai/physic-edit` |
| Background swap | Bria Background Replace | `fal-ai/bria/background-replace` |
| Product placement | Bria Embed Product | `bria/embed-product` |
| Quick natural language edit | GPT Image 1 or Nano Banana 2 Edit | `fal-ai/gpt-image-1` or `fal-ai/nano-banana-2/edit` |

### Camera-Controlled Video
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Specific camera path | Kling 3 Pro bracket notation | `fal-ai/kling-video/v3/pro` |
| Professional cinematography | Higgsfield DoP | `fal-ai/higgsfield/dop` |
| Physics-based motion | Goal Force | `fal-ai/goal-force` |
| Start/end keyframes | Kling O3 | `fal-ai/kling-video/o3/standard/image-to-video` |

### Video Modification
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Restyle preserving motion | LTX-2.3 Retake Video or Luma Modify Video | `fal-ai/ltx-2.3/retake-video` or `fal-ai/luma/modify-video` |
| Extend duration | LTX-2.3 Extend Video | `fal-ai/ltx-2.3/extend-video` |
| Transfer motion | Kling v3 Motion Control | `fal-ai/kling-video/v3/pro/motion-control` |
| Multi-shot narrative | MultiShotMaster | `fal-ai/multishot-master` |

### 3D Generation
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Single image, fast | TripoSR | `fal-ai/triposr` |
| Single image, quality | Trellis 2 | `fal-ai/trellis-2` |
| Retexture existing | Trellis 2 Retexture | `fal-ai/trellis-2/retexture` |
| Multi-image, precise | Trellis Multi | `fal-ai/trellis/multi` |
| Complex character | Hyper3D Rodin | `fal-ai/hyper3d/rodin` |

### Audio Generation
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Voiceover | Gemini TTS | `fal-ai/gemini-tts` |
| Voice clone (open) | Zonos | `fal-ai/zonos` |
| Voice clone (branded) | MiniMax Voice Clone | `fal-ai/minimax/voice-clone` |
| Background music | CassetteAI Music | `fal-ai/cassetteai/music-gen` |
| Sound effects | CassetteAI SFX | `fal-ai/cassetteai/sfx-gen` |
| Talking head | OmniHuman v1.5 | `fal-ai/bytedance/omnihuman/v1.5` |

### UX Annotation
| Scenario | Recommended Model | Endpoint |
|----------|-------------------|----------|
| Screenshot draw-over | GPT Image 1 | `fal-ai/gpt-image-1` |
| Gaze detection | MoonDreamNext | `fal-ai/moondream-next` |
| Fallback annotation | Nano Banana 2 Edit | `fal-ai/nano-banana-2/edit` |

### SVG Generation
| Scenario | Recommended Model | API |
|----------|-------------------|-----|
| Text-to-SVG logo/icon | QuiverAI Arrow text-to-SVG | `api.quiver.ai/v1/svgs/generations` (model arrow-preview) |
| Text-to-SVG illustration | QuiverAI Arrow text-to-SVG + references | `api.quiver.ai/v1/svgs/generations` (model arrow-preview + references array) |
| Text-to-SVG decorative | QuiverAI Arrow text-to-SVG + instructions | `api.quiver.ai/v1/svgs/generations` (model arrow-preview + instructions field) |
| Raster-to-SVG vectorization | QuiverAI Arrow image-to-SVG | `api.quiver.ai/v1/svgs/vectorizations` (model arrow-preview) |

> SVG generation routes through QuiverAI API (NOT fal.ai). Use for any asset that must be resolution-independent, CSS-animatable, or file-size-optimized. For complex illustrations requiring photorealism, generate raster via fal.ai first, then vectorize via QuiverAI image-to-SVG if a vector version is needed.
