/**
 * validate-prompt-artifact-alignment.ts — Closed-loop prompt vs artifact comparison.
 * Uses MoonDreamNext vision model to describe artifacts, then scores alignment
 * against the crafted prompt using per-job-type criteria.
 *
 * Run: bun run scripts/validate-prompt-artifact-alignment.ts --prompt "..." --artifact-url "..." --job-type "image-gen"
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

type JobType =
  | "image-gen"
  | "image-edit"
  | "style-transfer"
  | "controlnet"
  | "video-gen"
  | "video-camera"
  | "video-restyle"
  | "3d-gen"
  | "upscale"
  | "audio-tts"
  | "audio-music"
  | "annotation"
  | "avatar"
  | "svg-gen"
  | "svg-vectorize";

interface CriterionDef {
  readonly name: string;
  readonly weight: number;
  readonly description: string;
}

interface CriterionScore {
  readonly name: string;
  readonly score: number;
  readonly weight: number;
  readonly rationale: string;
}

interface AlignmentResult {
  readonly alignment_score: number;
  readonly per_criterion_scores: CriterionScore[];
  readonly description: string;
  readonly pass: boolean;
  readonly action: "regenerate" | "flag" | "pass";
}

// --- Per-Job Criteria ---

const JOB_CRITERIA: Record<JobType, CriterionDef[]> = {
  "image-gen": [
    {
      name: "subject_accuracy",
      weight: 0.25,
      description: "Does the image depict the described subject?",
    },
    {
      name: "style_adherence",
      weight: 0.2,
      description: "Does the visual style match the prompt's style directives?",
    },
    {
      name: "composition",
      weight: 0.15,
      description: "Is the composition appropriate for the described scene?",
    },
    {
      name: "color_palette",
      weight: 0.15,
      description: "Do colors match the prompt's color directives or mood?",
    },
    {
      name: "detail_fidelity",
      weight: 0.15,
      description: "Are fine details from the prompt represented?",
    },
    {
      name: "no_artifacts",
      weight: 0.1,
      description: "Is the image free from visual glitches or deformities?",
    },
  ],
  "image-edit": [
    {
      name: "edit_accuracy",
      weight: 0.3,
      description: "Was the requested edit correctly applied?",
    },
    { name: "preservation", weight: 0.25, description: "Are unedited areas preserved?" },
    { name: "seamlessness", weight: 0.2, description: "Is the edit blended naturally?" },
    {
      name: "intent_match",
      weight: 0.15,
      description: "Does the result match the editing intent?",
    },
    { name: "no_artifacts", weight: 0.1, description: "Free from editing artifacts?" },
  ],
  "style-transfer": [
    { name: "style_capture", weight: 0.3, description: "Does the output embody the target style?" },
    {
      name: "content_preservation",
      weight: 0.25,
      description: "Is the original content recognizable?",
    },
    { name: "consistency", weight: 0.2, description: "Is the style applied uniformly?" },
    { name: "quality", weight: 0.15, description: "Overall visual quality after transfer?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from transfer artifacts?" },
  ],
  controlnet: [
    {
      name: "structure_adherence",
      weight: 0.3,
      description: "Does the output follow the control structure?",
    },
    { name: "prompt_match", weight: 0.25, description: "Does the content match the text prompt?" },
    {
      name: "natural_blend",
      weight: 0.2,
      description: "Does the structure feel naturally integrated?",
    },
    { name: "detail_quality", weight: 0.15, description: "Quality of generated details?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from structural artifacts?" },
  ],
  "video-gen": [
    {
      name: "scene_accuracy",
      weight: 0.2,
      description: "Does the scene match the prompt description?",
    },
    { name: "motion_quality", weight: 0.2, description: "Is motion smooth and natural?" },
    { name: "temporal_coherence", weight: 0.2, description: "Is the video temporally consistent?" },
    { name: "style_match", weight: 0.15, description: "Does the visual style match the prompt?" },
    {
      name: "subject_consistency",
      weight: 0.15,
      description: "Are subjects consistent across frames?",
    },
    { name: "no_artifacts", weight: 0.1, description: "Free from video artifacts?" },
  ],
  "video-camera": [
    { name: "camera_motion", weight: 0.3, description: "Does the camera move as directed?" },
    {
      name: "scene_stability",
      weight: 0.2,
      description: "Is the scene stable during camera motion?",
    },
    { name: "content_match", weight: 0.2, description: "Does the content match the prompt?" },
    { name: "smoothness", weight: 0.2, description: "Is the camera motion smooth?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from motion artifacts?" },
  ],
  "video-restyle": [
    {
      name: "style_application",
      weight: 0.3,
      description: "Is the target style correctly applied?",
    },
    {
      name: "content_preservation",
      weight: 0.25,
      description: "Is the original video content preserved?",
    },
    {
      name: "temporal_consistency",
      weight: 0.2,
      description: "Is the style consistent across frames?",
    },
    { name: "quality", weight: 0.15, description: "Overall visual quality?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from restyling artifacts?" },
  ],
  "3d-gen": [
    { name: "geometry_accuracy", weight: 0.25, description: "Does the 3D shape match the input?" },
    { name: "surface_quality", weight: 0.2, description: "Are surfaces clean and well-formed?" },
    { name: "topology", weight: 0.2, description: "Is the mesh topology reasonable?" },
    { name: "texture_quality", weight: 0.2, description: "Are textures properly mapped?" },
    { name: "no_artifacts", weight: 0.15, description: "Free from mesh artifacts?" },
  ],
  upscale: [
    { name: "detail_enhancement", weight: 0.25, description: "Are details enhanced convincingly?" },
    { name: "sharpness", weight: 0.25, description: "Is the output sharp without oversharpening?" },
    { name: "artifact_free", weight: 0.2, description: "No upscaling artifacts (halos, ringing)?" },
    { name: "color_fidelity", weight: 0.15, description: "Are colors preserved accurately?" },
    {
      name: "noise_handling",
      weight: 0.15,
      description: "Is noise reduced without losing texture?",
    },
  ],
  "audio-tts": [
    { name: "voice_quality", weight: 0.3, description: "Is the voice natural and clear?" },
    { name: "pronunciation", weight: 0.25, description: "Is pronunciation correct?" },
    { name: "prosody", weight: 0.2, description: "Is intonation and rhythm natural?" },
    { name: "style_match", weight: 0.15, description: "Does the voice match the requested style?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from audio artifacts?" },
  ],
  "audio-music": [
    { name: "genre_match", weight: 0.25, description: "Does the music match the requested genre?" },
    {
      name: "composition_quality",
      weight: 0.25,
      description: "Is the musical composition coherent?",
    },
    { name: "production_quality", weight: 0.2, description: "Is the audio production clean?" },
    { name: "mood_match", weight: 0.2, description: "Does the mood match the prompt?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from audio glitches?" },
  ],
  annotation: [
    { name: "accuracy", weight: 0.3, description: "Are annotations placed correctly?" },
    { name: "completeness", weight: 0.25, description: "Are all requested elements annotated?" },
    { name: "clarity", weight: 0.2, description: "Are annotations visually clear?" },
    { name: "non_destructive", weight: 0.15, description: "Is the original image still visible?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from annotation artifacts?" },
  ],
  avatar: [
    { name: "likeness", weight: 0.25, description: "Does the avatar resemble the input?" },
    { name: "style_match", weight: 0.25, description: "Does the style match the request?" },
    { name: "expression", weight: 0.2, description: "Is the expression appropriate?" },
    { name: "quality", weight: 0.2, description: "Overall rendering quality?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from facial artifacts?" },
  ],
  "svg-gen": [
    {
      name: "subject_accuracy",
      weight: 0.25,
      description: "Does the SVG depict the described subject?",
    },
    { name: "path_quality", weight: 0.2, description: "Are SVG paths clean and efficient?" },
    { name: "scalability", weight: 0.2, description: "Does the SVG scale cleanly?" },
    { name: "color_accuracy", weight: 0.15, description: "Are colors matching the description?" },
    { name: "simplicity", weight: 0.1, description: "Is the SVG appropriately simplified?" },
    { name: "no_artifacts", weight: 0.1, description: "Free from path artifacts?" },
  ],
  "svg-vectorize": [
    { name: "fidelity", weight: 0.3, description: "How closely does the SVG match the source?" },
    { name: "path_efficiency", weight: 0.2, description: "Are paths efficient and clean?" },
    { name: "edge_accuracy", weight: 0.2, description: "Are edges accurately traced?" },
    { name: "color_mapping", weight: 0.15, description: "Are colors correctly mapped?" },
    { name: "scalability", weight: 0.15, description: "Does the result scale well?" },
  ],
};

// --- Vision Description ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

export function describeArtifactViaVision(
  artifactUrl: string,
  jobType: JobType,
): Effect.Effect<string, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const promptForDescription = buildDescriptionPrompt(jobType);
        const result = await fal.subscribe("fal-ai/moondream-next", {
          input: {
            image_url: artifactUrl,
            prompt: promptForDescription,
          },
        });

        const data = result.data as Record<string, unknown>;
        return (
          (data.output as string) ?? (data.text as string) ?? (data.description as string) ?? ""
        );
      },
      catch: (e) => new Error(`MoonDreamNext description failed: ${e}`),
    }),
    Effect.retry({ schedule: retryPolicy, while: (err) => err.message.includes("429") }),
  );
}

function buildDescriptionPrompt(jobType: JobType): string {
  const base = "Describe this image in detail, including:";
  const specifics: Record<string, string> = {
    "image-gen":
      "subjects, objects, scene layout, colors, style, lighting, mood, and any text visible",
    "image-edit": "what appears edited or modified, the overall composition, and any visible seams",
    "style-transfer":
      "the artistic style applied, color palette, textures, and how the original content is preserved",
    controlnet:
      "the structural composition, how elements are arranged, and the relationship between structure and content",
    "video-gen": "the scene, subjects, any motion implied, style, and overall composition",
    "video-camera": "camera angle, perspective, depth of field, and spatial arrangement",
    "video-restyle":
      "the artistic style, color treatment, and how it differs from a standard photograph",
    "3d-gen": "the 3D object shape, geometry, surface quality, and viewing angle",
    upscale: "fine details, texture quality, sharpness, and any artifacts like halos or ringing",
    "audio-tts": "any visual representation of audio waveform or spectrogram if present",
    "audio-music": "any visual representation of the audio if present",
    annotation:
      "all annotations, arrows, highlights, labels, and how they relate to the underlying image",
    avatar: "facial features, expression, style, proportions, and likeness quality",
    "svg-gen": "the vector shapes, colors, paths, composition, and overall design quality",
    "svg-vectorize":
      "edge quality, path accuracy, color regions, and how well it represents the original",
  };
  return `${base} ${specifics[jobType] ?? "all visual details"}.`;
}

// --- SVG DOM Parsing ---

export function parseSvgDom(svgContent: string): Record<string, unknown> {
  const colors = [...new Set(svgContent.match(/#[0-9a-fA-F]{3,8}/g) ?? [])];
  const fillColors = [
    ...new Set(svgContent.match(/fill="([^"]+)"/g)?.map((m) => m.replace(/fill="|"/g, "")) ?? []),
  ];
  const shapes = {
    rect: (svgContent.match(/<rect[\s/]/g) ?? []).length,
    circle: (svgContent.match(/<circle[\s/]/g) ?? []).length,
    ellipse: (svgContent.match(/<ellipse[\s/]/g) ?? []).length,
    line: (svgContent.match(/<line[\s/]/g) ?? []).length,
    polygon: (svgContent.match(/<polygon[\s/]/g) ?? []).length,
    polyline: (svgContent.match(/<polyline[\s/]/g) ?? []).length,
    path: (svgContent.match(/<path[\s/]/g) ?? []).length,
  };
  const textElements =
    svgContent.match(/<text[^>]*>([^<]*)<\/text>/g)?.map((t) => t.replace(/<[^>]+>/g, "")) ?? [];
  const pathCount = shapes.path;

  return { colors: [...colors, ...fillColors], shapes, textElements, pathCount };
}

// --- Scoring ---

export function scoreAlignment(
  description: string,
  prompt: string,
  jobType: JobType,
  svgData: Record<string, unknown> | null,
): AlignmentResult {
  const criteria = JOB_CRITERIA[jobType];
  const promptLower = prompt.toLowerCase();
  const descLower = description.toLowerCase();
  const promptWords = extractKeywords(promptLower);
  const descWords = extractKeywords(descLower);

  const perCriterionScores: CriterionScore[] = criteria.map((criterion) => {
    const score = scoreCriterion(
      criterion,
      promptWords,
      descWords,
      promptLower,
      descLower,
      svgData,
    );
    return {
      name: criterion.name,
      score,
      weight: criterion.weight,
      rationale: buildRationale(criterion, score),
    };
  });

  const weightedSum = perCriterionScores.reduce((sum, c) => sum + c.score * c.weight, 0);
  const totalWeight = perCriterionScores.reduce((sum, c) => sum + c.weight, 0);
  const alignmentScore = Math.round((weightedSum / totalWeight) * 100) / 100;

  const pass = alignmentScore >= 7.0;
  const action: "regenerate" | "flag" | "pass" =
    alignmentScore < 5 ? "regenerate" : alignmentScore < 7 ? "flag" : "pass";

  return {
    alignment_score: alignmentScore,
    per_criterion_scores: perCriterionScores,
    description,
    pass,
    action,
  };
}

function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "shall",
    "can",
    "need",
    "dare",
    "ought",
    "used",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "and",
    "but",
    "or",
    "nor",
    "not",
    "so",
    "yet",
    "both",
    "either",
    "neither",
    "each",
    "every",
    "all",
    "any",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "only",
    "own",
    "same",
    "than",
    "too",
    "very",
    "just",
    "because",
    "if",
    "when",
    "where",
    "how",
    "what",
    "which",
    "who",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "i",
    "image",
    "photo",
  ]);
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words.filter((w) => !stopWords.has(w)));
}

function scoreCriterion(
  criterion: CriterionDef,
  promptWords: Set<string>,
  descWords: Set<string>,
  promptLower: string,
  descLower: string,
  svgData: Record<string, unknown> | null,
): number {
  if (criterion.name === "no_artifacts" || criterion.name === "artifact_free") {
    const artifactIndicators = [
      "blurry",
      "distorted",
      "glitch",
      "artifact",
      "deformed",
      "broken",
      "corrupt",
    ];
    const hasArtifacts = artifactIndicators.some((ind) => descLower.includes(ind));
    return hasArtifacts ? 3 : 9;
  }

  if (svgData && (criterion.name === "path_quality" || criterion.name === "path_efficiency")) {
    const pathCount = svgData.pathCount as number;
    if (pathCount > 500) return 5;
    if (pathCount > 200) return 7;
    return 9;
  }

  // Keyword overlap scoring
  const overlap = [...promptWords].filter((w) => descWords.has(w));
  const overlapRatio = promptWords.size > 0 ? overlap.length / promptWords.size : 0;

  // Base score from keyword overlap
  let score = Math.min(10, Math.round(overlapRatio * 12 + 3));

  // Boost for specific semantic matches
  const colorWords = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "black",
    "white",
    "gold",
    "silver",
  ];
  const promptColors = colorWords.filter((c) => promptLower.includes(c));
  const descColors = colorWords.filter((c) => descLower.includes(c));
  if (promptColors.length > 0) {
    const colorMatch =
      promptColors.filter((c) => descColors.includes(c)).length / promptColors.length;
    score = Math.round((score + colorMatch * 10) / 2);
  }

  return Math.max(1, Math.min(10, score));
}

function buildRationale(criterion: CriterionDef, score: number): string {
  if (score >= 8) return `Strong match: ${criterion.description}`;
  if (score >= 6) return `Partial match: ${criterion.description}`;
  if (score >= 4) return `Weak match: ${criterion.description}`;
  return `Poor match: ${criterion.description}`;
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const prompt = getArg("--prompt");
  const artifactUrl = getArg("--artifact-url");
  const jobType = (getArg("--job-type") ?? "image-gen") as JobType;

  if (!prompt) return yield* Effect.fail(new Error("--prompt is required"));
  if (!artifactUrl) return yield* Effect.fail(new Error("--artifact-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));
  if (!JOB_CRITERIA[jobType]) return yield* Effect.fail(new Error(`Unknown job-type: ${jobType}`));

  let description: string;
  let svgData: Record<string, unknown> | null = null;

  if (jobType === "svg-gen" || jobType === "svg-vectorize") {
    const svgContent = yield* Effect.tryPromise({
      try: async () => {
        const resp = await fetch(artifactUrl);
        return resp.text();
      },
      catch: (e) => new Error(`Failed to fetch SVG: ${e}`),
    });
    svgData = parseSvgDom(svgContent);
    description = `SVG analysis: ${JSON.stringify(svgData)}`;
  } else {
    description = yield* describeArtifactViaVision(artifactUrl, jobType);
  }

  const result = scoreAlignment(description, prompt, jobType, svgData);

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.pass) process.exitCode = 1;
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Alignment validation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
