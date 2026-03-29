# FAL REFERENCE IMAGE PARAMETERS
> Generated from probing fal.ai endpoints | one-of-a-kind-design skill | Last verified: 2026-03-29

Different fal.ai models accept reference images via different parameter names and formats.
This document maps each model to its correct reference image parameter.

---

## Parameter Types

| Type | Format | Example |
|------|--------|---------|
| `image_url` (string) | Single URL string | `{ image_url: "https://..." }` |
| `image_urls` (array) | Array of URL strings | `{ image_urls: ["https://...", "https://..."] }` |
| `reference_images` (array of objects) | Array of `{url}` objects | `{ reference_images: [{ url: "https://..." }] }` |
| `input_image` (string) | Single URL string (editing models) | `{ input_image: "https://..." }` |
| `control_image` (string) | Single URL string (ControlNet) | `{ control_image: "https://..." }` |

---

## Image Generation Models

### String `image_url`

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| Flux Dev | `fal-ai/flux/dev` | `image_url` | Redux/img2img mode |
| Flux Pro 1.1 | `fal-ai/flux-pro/v1.1` | `image_url` | Style reference |
| Flux 1.1 Ultra | `fal-ai/flux-pro/v1.1-ultra` | `image_url` | Style reference |
| Flux 2 Flex | `fal-ai/flux-2-flex` | `image_url` | Compositional guidance |
| Flux Redux | `fal-ai/flux/schnell/redux` | `image_url` | Variation of input |
| Ideogram V3 | `fal-ai/ideogram/v3` | `image_url` | Style reference |
| Nano Banana | `fal-ai/nano-banana-2` | `image_url` | Edit/blend mode |
| Nano Banana Pro | `fal-ai/nano-banana-pro` | `image_url` | Edit/blend mode |
| Recraft V3 | `fal-ai/recraft-v3` | `image_url` | Style reference |
| Imagen 4 | `fal-ai/imagen4/preview` | `image_url` | Reference input |
| Stable Diffusion 3.5 | `fal-ai/stable-diffusion-v35-large` | `image_url` | img2img |

### Array `image_urls`

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| GPT Image 1.5 | `fal-ai/gpt-image-1.5` | `image_urls` | Multi-image reference |
| Qwen Image Edit | `fal-ai/qwen-image-2/edit` | `image_urls` | Multi-image editing |
| Qwen Image Edit Plus | `fal-ai/qwen-image-2/pro/edit` | `image_urls` | Multi-image editing |
| Qwen Image Edit Angles | `fal-ai/qwen-image-2/angles/edit` | `image_urls` | Multi-angle editing |
| Nano Banana Edit | `fal-ai/nano-banana-2/edit` | `image_urls` | Multi-image blend |

### Array of objects `reference_images`

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| Ideogram V3 | `fal-ai/ideogram/v3` | `reference_images` | Alternate: `[{ url: "..." }]` |
| Ideogram V3 Character | `fal-ai/ideogram/v3/character` | `reference_images` | Character consistency |

### String `input_image` (editing models)

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| Gemini 2.0 Flash | `fal-ai/gemini-2.0-flash` | `input_image` | Image edit input |
| Kling O1 (Image) | `fal-ai/kling-video/o1/image` | `input_image` | Edit source |

### String `control_image` (ControlNet/structural)

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| Flux Canny | `fal-ai/flux-canny` | `control_image` | Edge map input (**404 as of 2026-03-29**) |
| Flux Depth | `fal-ai/flux-depth/dev` | `control_image` | Depth map input (**404 as of 2026-03-29**) |

---

## Video Models (reference/first frame)

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| Kling 3 | `fal-ai/kling-video/v3/pro` | `image_url` | First frame / reference |
| Kling 2.6 Pro | `fal-ai/kling-video/v2.6/pro` | `image_url` | First frame |
| Runway Gen-4 | `fal-ai/runway/gen4` | `image_url` | Reference frame |
| Runway Gen-4.5 | `fal-ai/runway/gen4.5` | `image_url` | Reference frame |
| Luma Ray 2 | `fal-ai/luma-dream-machine/ray2` | `image_url` | First frame |
| WAN 2.2 | `fal-ai/wan/v2.2` | `image_url` | First frame |
| WAN 2.5 | `fal-ai/wan/v2.5` | `image_url` | First frame |
| WAN 2.6 | `fal-ai/wan/v2.6` | `image_url` | First frame |
| Minimax Video 01 | `fal-ai/minimax/video-01` | `image_url` | First frame |
| Seedance V1.5 Pro | `fal-ai/seedance/v1.5-pro` | `image_url` | Reference |
| Veo 2 | `fal-ai/veo2` | `image_url` | Reference |
| Sora 2 | `fal-ai/sora/v2` | `image_url` | Reference |

---

## Pipeline Models (reference input)

| Model | Endpoint | Param | Notes |
|-------|----------|-------|-------|
| BiRefNet v2 | `fal-ai/birefnet/v2` | `image_url` | Subject to isolate |
| Depth Anything V2 | `fal-ai/depth-anything/v2` | `image_url` | Source for depth map |
| Topaz Upscale | `fal-ai/topaz/upscale/image` | `image_url` | Image to upscale |
| ESRGAN | `fal-ai/esrgan` | `image_url` | Image to upscale |
| SeedVR | `fal-ai/seedvr` | `image_url` | Image to upscale |
| MoonDreamNext | `fal-ai/moondream-next` | `image_url` | Image to analyze |
| GOT-OCR2 | `fal-ai/got-ocr2` | `image_url` | Image for OCR |
| NAFNet | `fal-ai/nafnet` | `image_url` | Image to restore |

---

## Quick Lookup by Model

Use this when constructing API calls:

```typescript
const REF_IMAGE_PARAMS: Record<string, string> = {
  // String image_url
  "fal-ai/flux/dev": "image_url",
  "fal-ai/flux-pro/v1.1": "image_url",
  "fal-ai/flux-pro/v1.1-ultra": "image_url",
  "fal-ai/flux-2-flex": "image_url",
  "fal-ai/flux/schnell/redux": "image_url",
  "fal-ai/ideogram/v3": "image_url",
  "fal-ai/nano-banana-2": "image_url",
  "fal-ai/nano-banana-pro": "image_url",
  "fal-ai/recraft-v3": "image_url",
  "fal-ai/imagen4/preview": "image_url",
  // Array image_urls
  "fal-ai/gpt-image-1.5": "image_urls",
  "fal-ai/qwen-image-2/edit": "image_urls",
  "fal-ai/qwen-image-2/pro/edit": "image_urls",
  "fal-ai/qwen-image-2/angles/edit": "image_urls",
  // Array of objects reference_images
  "fal-ai/ideogram/v3/character": "reference_images",
  // String input_image
  "fal-ai/gemini-2.0-flash": "input_image",
  "fal-ai/kling-video/o1/image": "input_image",
  // String control_image (ControlNet)
  "fal-ai/flux-canny": "control_image",
  "fal-ai/flux-depth/dev": "control_image",
};
```

---

## Notes

- **Ideogram V3** accepts BOTH `image_url` (string) and `reference_images` (array of objects). Use `reference_images` for multi-reference workflows.
- Models marked **404** may return at any time. Run `check-model-availability.ts` to get current status.
- Video models universally use `image_url` for first-frame / reference input.
- Pipeline models universally use `image_url` for input images.
