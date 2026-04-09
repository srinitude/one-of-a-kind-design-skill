/**
 * select-pipeline-models.ts — Stage → utility/pipeline endpoint selection.
 * Deterministic decision tree for background removal, upscaling, depth, etc.
 *
 * Run: bun run scripts/select-pipeline-models.ts --stage "background-removal" --input-type "image"
 */
import { Console, Effect, pipe } from "effect";

// --- Types ---

interface PipelineModel {
  readonly name: string;
  readonly endpoint: string;
  readonly inputType: string;
  readonly strengths: string;
}

interface PipelineSelection {
  readonly stage: string;
  readonly primary: PipelineModel;
  readonly fallback: PipelineModel | null;
  readonly reason: string;
}

// --- Pipeline Model Registry ---

export const PIPELINE_MODELS: Record<string, PipelineModel[]> = {
  "background-removal": [
    {
      name: "BiRefNet v2",
      endpoint: "fal-ai/birefnet/v2",
      inputType: "image",
      strengths: "highest quality, fine edges",
    },
    {
      name: "Bria RMBG 2.0",
      endpoint: "fal-ai/bria/rmbg",
      inputType: "image",
      strengths: "fast, commercial-safe",
    },
    {
      name: "Video BG Removal",
      endpoint: "fal-ai/bria/video/background-removal",
      inputType: "video",
      strengths: "temporal consistency",
    },
  ],
  "upscale-image": [
    {
      name: "Topaz Image Upscale",
      endpoint: "fal-ai/topaz/upscale/image",
      inputType: "image",
      strengths: "up to 16x, highest quality",
    },
    {
      name: "SeedVR Upscale",
      endpoint: "fal-ai/seedvr",
      inputType: "image",
      strengths: "AI-native super-resolution",
    },
    {
      name: "ESRGAN",
      endpoint: "fal-ai/esrgan",
      inputType: "image",
      strengths: "fast, open model, 4x",
    },
    {
      name: "Clarity Upscale",
      endpoint: "fal-ai/clarity-upscaler",
      inputType: "image",
      strengths: "creative upscale with enhancement",
    },
  ],
  "upscale-video": [
    {
      name: "Topaz Video Upscale",
      endpoint: "fal-ai/topaz/upscale/video",
      inputType: "video",
      strengths: "up to 8x, frame-consistent",
    },
  ],
  "depth-estimation": [
    {
      name: "Depth Anything V2",
      endpoint: "fal-ai/depth-anything/v2",
      inputType: "image",
      strengths: "best zero-shot depth",
    },
    {
      name: "Depth Anything Video",
      endpoint: "fal-ai/depth-anything-video",
      inputType: "video",
      strengths: "temporal depth consistency",
    },
  ],
  controlnet: [
    {
      name: "FLUX Pro ControlNet",
      endpoint: "fal-ai/flux-pro/v1/controlnet",
      inputType: "image",
      strengths: "FLUX-quality structural guidance",
    },
    {
      name: "Z-Image Turbo ControlNet",
      endpoint: "fal-ai/z-image/turbo/controlnet",
      inputType: "image",
      strengths: "fast turbo inference",
    },
    {
      name: "SDXL ControlNet Union",
      endpoint: "fal-ai/sdxl-controlnet-union",
      inputType: "image",
      strengths: "multi-control modes",
    },
  ],
  inpainting: [
    {
      name: "FLUX Pro Fill",
      endpoint: "fal-ai/flux-pro/v1/fill",
      inputType: "image",
      strengths: "best inpainting quality",
    },
    {
      name: "FLUX General Inpainting",
      endpoint: "fal-ai/flux-general/inpainting",
      inputType: "image",
      strengths: "versatile fill",
    },
  ],
  "style-transfer": [
    {
      name: "FLUX Kontext Pro",
      endpoint: "fal-ai/flux-kontext/pro",
      inputType: "image",
      strengths: "reference-based style transfer",
    },
    {
      name: "FLUX Kontext Max",
      endpoint: "fal-ai/flux-kontext/max",
      inputType: "image",
      strengths: "maximum quality transfer",
    },
    {
      name: "FLUX Redux Dev",
      endpoint: "fal-ai/flux/dev/redux",
      inputType: "image",
      strengths: "variation generation",
    },
  ],
  "ocr-vision": [
    {
      name: "LLaVA 13B",
      endpoint: "fal-ai/llavav15-13b",
      inputType: "image",
      strengths: "vision-language, captioning",
    },
    {
      name: "GOT-OCR2",
      endpoint: "fal-ai/got-ocr2",
      inputType: "image",
      strengths: "text extraction from images",
    },
    {
      name: "NSFW Detection",
      endpoint: "fal-ai/nsfw-detection",
      inputType: "image",
      strengths: "content safety",
    },
  ],
  "video-utility": [
    {
      name: "FFmpeg Compose",
      endpoint: "fal-ai/ffmpeg/compose",
      inputType: "video",
      strengths: "concatenation, overlay, mixing",
    },
    {
      name: "FFmpeg Waveform",
      endpoint: "fal-ai/ffmpeg/waveform",
      inputType: "audio",
      strengths: "audio waveform visualization",
    },
    {
      name: "Video Auto Caption",
      endpoint: "fal-ai/video-auto-caption",
      inputType: "video",
      strengths: "SRT subtitle generation",
    },
  ],
  "3d-mesh": [
    {
      name: "Trellis",
      endpoint: "fal-ai/trellis",
      inputType: "image",
      strengths: "image-to-3D mesh, textured GLB",
    },
    {
      name: "TripoSR v2",
      endpoint: "fal-ai/triposr/v2",
      inputType: "image",
      strengths: "fast single-image 3D",
    },
  ],
  "svg-generation": [
    {
      name: "QuiverAI Arrow (text-to-SVG)",
      endpoint: "api.quiver.ai/v1/svgs/generations",
      inputType: "text",
      strengths: "text-to-SVG, logos, icons, decorative",
    },
    {
      name: "QuiverAI Arrow (image-to-SVG)",
      endpoint: "api.quiver.ai/v1/svgs/vectorizations",
      inputType: "image",
      strengths: "raster-to-vector conversion",
    },
  ],
  "pose-estimation": [
    {
      name: "Pose Estimation",
      endpoint: "fal-ai/pose-estimation",
      inputType: "image",
      strengths: "human pose detection for ControlNet",
    },
  ],
  "audio-tts": [
    {
      name: "PlayAI TTS v3",
      endpoint: "fal-ai/playai/tts/v3",
      inputType: "text",
      strengths: "natural speech, emotion control",
    },
    {
      name: "MiniMax Speech v2",
      endpoint: "fal-ai/minimax-speech/v2",
      inputType: "text",
      strengths: "multilingual, fast",
    },
  ],
  "audio-music": [
    {
      name: "Stable Audio",
      endpoint: "fal-ai/stable-audio",
      inputType: "text",
      strengths: "royalty-free music generation",
    },
    {
      name: "MMAudio V2",
      endpoint: "fal-ai/mmaudio/v2",
      inputType: "video",
      strengths: "video-to-audio, foley",
    },
  ],
  avatar: [
    {
      name: "Act-One",
      endpoint: "fal-ai/act-one",
      inputType: "image+audio",
      strengths: "facial animation from audio",
    },
    {
      name: "Wan Lipsync",
      endpoint: "fal-ai/wan/lipsync",
      inputType: "video+audio",
      strengths: "lip sync overlay",
    },
  ],
};

// --- Decision Tree ---

export const selectPipelineModel = (
  stage: string,
  inputType?: string,
): Effect.Effect<PipelineSelection, Error> => {
  const models = PIPELINE_MODELS[stage];
  if (!models || models.length === 0) {
    return Effect.fail(
      new Error(
        `Unknown pipeline stage: ${stage}. Options: ${Object.keys(PIPELINE_MODELS).join(", ")}`,
      ),
    );
  }

  const filtered = inputType
    ? models.filter((m) => m.inputType === inputType || m.inputType.includes(inputType))
    : models;

  const candidates = filtered.length > 0 ? filtered : models;
  const primary = candidates[0];
  const fallback = candidates.length > 1 ? candidates[1] : null;

  return Effect.succeed({
    stage,
    primary,
    fallback,
    reason: inputType ? `Best ${stage} model for ${inputType} input` : `Default ${stage} model`,
  });
};

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const stage = getArg("--stage");
  const inputType = getArg("--input-type");

  if (!stage) {
    const stages = Object.keys(PIPELINE_MODELS).join(", ");
    yield* Effect.fail(new Error(`Missing --stage. Options: ${stages}`));
    return;
  }

  const selection = yield* selectPipelineModel(stage, inputType);

  yield* Console.log(JSON.stringify(selection, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Pipeline model selection failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
