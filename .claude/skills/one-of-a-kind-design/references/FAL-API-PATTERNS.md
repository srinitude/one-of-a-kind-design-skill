# FAL-API-PATTERNS.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete reference for fal.ai API integration patterns used throughout the one-of-a-kind-design skill. All patterns use the `@fal-ai/client` SDK with Bun runtime.

**SDK:** `@fal-ai/client` | **Docs:** https://docs.fal.ai/ | **Runtime:** Bun

---

## Authentication

```typescript
import fal from "@fal-ai/client";

fal.config({
  credentials: Bun.env.FAL_KEY,
});
```

The `FAL_KEY` environment variable must be set. The skill validates this at startup and fails fast with a clear error if missing.

---

## Subscribe Pattern (Primary)

The subscribe pattern is the recommended approach for most operations. It submits a request to the queue, automatically polls for completion, and returns the final result.

```typescript
const result = await fal.subscribe("fal-ai/flux-2-max", {
  input: {
    prompt: "A geometric Bauhaus composition with primary colors on white",
    image_size: "landscape_16_9",
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
    seed: 42,
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_QUEUE") {
      console.log(`Position: ${update.queue_position}`);
    }
    if (update.status === "IN_PROGRESS") {
      update.logs?.forEach((log) => console.log(log.message));
    }
  },
});

// Access result
const imageUrl = result.data.images[0].url;
const seed = result.data.seed;
```

**When to use:** All standard image generation, video generation, upscaling, background removal, and single-operation pipeline stages.

---

## Queue Pattern (Advanced)

The queue pattern separates submission from result retrieval, enabling fire-and-forget workflows, parallel submissions, and custom polling strategies.

### Submit

```typescript
const { request_id } = await fal.queue.submit("fal-ai/veo3.1", {
  input: {
    prompt: "[Push in] Cinematic dolly through art-deco lobby, gold and black",
    duration: "6s",
    aspect_ratio: "16:9",
  },
});

// Store request_id for later retrieval
console.log(`Submitted: ${request_id}`);
```

### Check Status

```typescript
const status = await fal.queue.status("fal-ai/veo3.1", {
  requestId: request_id,
  logs: true,
});

console.log(status.status); // "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED"
```

### Retrieve Result

```typescript
const result = await fal.queue.result("fal-ai/veo3.1", {
  requestId: request_id,
});

const videoUrl = result.data.video.url;
```

**When to use:** Long-running video generation, parallel batch submissions, workflows that need to persist request IDs across process restarts.

---

## Streaming Pattern

For models that support streaming (typically LLM-based or progressive generation), use the stream pattern to receive partial results.

```typescript
const stream = await fal.stream("fal-ai/gemini-tts", {
  input: {
    text: "Welcome to our portfolio. Let me walk you through the design.",
    model: "gemini-2.5-pro-tts",
    voice: "Kore",
  },
});

for await (const event of stream) {
  // Process partial audio chunks as they arrive
  console.log("Chunk received:", event);
}

// Get final result after stream completes
const result = await stream.done();
```

**When to use:** Audio generation where progressive output is useful, real-time feedback scenarios.

---

## File Upload

Bun-native file upload using fal storage. Required when pipeline models need local files as input (e.g., image editing, video restyling, voice cloning).

```typescript
// Upload a local file
const url = await fal.storage.upload(Bun.file("./assets/hero-image.png"));

// Use the returned URL as input to any fal model
const result = await fal.subscribe("fal-ai/birefnet/v2", {
  input: {
    image_url: url,
    model: "Heavy",
  },
});
```

### Upload from Buffer

```typescript
// Upload from an in-memory buffer
const buffer = await generateSomeImage();
const blob = new Blob([buffer], { type: "image/png" });
const url = await fal.storage.upload(blob);
```

### Upload from URL (passthrough)

When the source is already a URL (e.g., output from a previous fal model), no upload is needed. Pass the URL directly:

```typescript
// Previous model output URL can be used directly
const bgRemovedResult = await fal.subscribe("fal-ai/birefnet/v2", {
  input: {
    image_url: previousResult.data.images[0].url,
    model: "Heavy",
  },
});
```

---

## Error Handling

### Error Types

```typescript
import { ValidationError, ApiError, QueueTimeoutError } from "@fal-ai/client";

try {
  const result = await fal.subscribe("fal-ai/flux-2-max", {
    input: { prompt: "..." },
    timeout: 120_000, // 2 minute timeout
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // Input validation failed (bad parameters, missing required fields)
    // Action: Fix input and retry
    console.error("Validation:", error.message, error.body);

  } else if (error instanceof QueueTimeoutError) {
    // Request stayed in queue longer than timeout
    // Action: Retry with longer timeout, or switch to queue pattern
    console.error("Timeout after", error.timeout, "ms");

  } else if (error instanceof ApiError) {
    const status = error.status;

    if (status === 422) {
      // Unprocessable entity -- model rejected the input
      // Common causes: NSFW content detected, invalid image format, unsupported resolution
      // Action: Adjust input parameters
      console.error("Model rejected input:", error.body);

    } else if (status === 429) {
      // Rate limited
      // Action: Exponential backoff, then retry
      console.error("Rate limited. Retry after backoff.");

    } else if (status === 500 || status === 502 || status === 503) {
      // Model infrastructure error
      // Action: Retry with exponential backoff, fall back to alternative model
      console.error("Server error:", status, error.message);

    } else if (status === 401) {
      // Authentication failure
      // Action: Check FAL_KEY environment variable
      console.error("Auth failed. Check FAL_KEY.");
    }

  } else {
    // Network or unknown error
    console.error("Unexpected:", error);
  }
}
```

### Retry with Exponential Backoff

```typescript
async function falSubscribeWithRetry<T>(
  endpoint: string,
  options: { input: Record<string, unknown> },
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fal.subscribe(endpoint, {
        ...options,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_QUEUE") {
            console.log(`[${endpoint}] Queue position: ${update.queue_position}`);
          }
        },
      }) as T;
    } catch (error) {
      lastError = error;

      if (error instanceof ValidationError) {
        throw error; // Don't retry validation errors
      }

      if (error instanceof ApiError && error.status === 401) {
        throw error; // Don't retry auth errors
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
      console.warn(`[${endpoint}] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      await Bun.sleep(delay);
    }
  }

  throw lastError;
}
```

---

## Effect Layer Wrapper Pattern

The skill wraps all fal.ai interactions in an Effect service layer for structured error handling, dependency injection, and composability.

### Service Definition

```typescript
import { Effect, Layer, Context, Data } from "effect";

// Error types
class FalAuthError extends Data.TaggedError("FalAuthError")<{
  message: string;
}> {}

class FalTimeoutError extends Data.TaggedError("FalTimeoutError")<{
  endpoint: string;
  timeoutMs: number;
}> {}

class FalRateLimitError extends Data.TaggedError("FalRateLimitError")<{
  endpoint: string;
  retryAfterMs: number;
}> {}

class FalModelError extends Data.TaggedError("FalModelError")<{
  endpoint: string;
  status: number;
  message: string;
  body: unknown;
}> {}

class FalNetworkError extends Data.TaggedError("FalNetworkError")<{
  endpoint: string;
  cause: unknown;
}> {}

// Service interface
class FalClient extends Context.Tag("FalClient")<
  FalClient,
  {
    readonly subscribe: <T>(
      endpoint: string,
      input: Record<string, unknown>,
      options?: { timeout?: number },
    ) => Effect.Effect<T, FalAuthError | FalTimeoutError | FalRateLimitError | FalModelError | FalNetworkError>;

    readonly upload: (
      file: Blob | File,
    ) => Effect.Effect<string, FalAuthError | FalNetworkError>;

    readonly queueSubmit: (
      endpoint: string,
      input: Record<string, unknown>,
    ) => Effect.Effect<string, FalAuthError | FalNetworkError>;

    readonly queueResult: <T>(
      endpoint: string,
      requestId: string,
    ) => Effect.Effect<T, FalAuthError | FalTimeoutError | FalModelError | FalNetworkError>;
  }
>() {}
```

### Live Implementation

```typescript
const FalClientLive = Layer.succeed(FalClient, {
  subscribe: <T>(
    endpoint: string,
    input: Record<string, unknown>,
    options?: { timeout?: number },
  ) =>
    Effect.tryPromise({
      try: () =>
        fal.subscribe(endpoint, {
          input,
          timeout: options?.timeout ?? 120_000,
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_QUEUE") {
              Effect.logDebug(`[${endpoint}] Queue: ${update.queue_position}`);
            }
          },
        }) as Promise<T>,
      catch: (error) => {
        if (error instanceof ValidationError || (error instanceof ApiError && error.status === 422)) {
          return new FalModelError({ endpoint, status: 422, message: String(error), body: (error as ApiError).body });
        }
        if (error instanceof QueueTimeoutError) {
          return new FalTimeoutError({ endpoint, timeoutMs: options?.timeout ?? 120_000 });
        }
        if (error instanceof ApiError && error.status === 429) {
          return new FalRateLimitError({ endpoint, retryAfterMs: 5_000 });
        }
        if (error instanceof ApiError && error.status === 401) {
          return new FalAuthError({ message: "FAL_KEY invalid or missing" });
        }
        if (error instanceof ApiError) {
          return new FalModelError({ endpoint, status: error.status, message: error.message, body: error.body });
        }
        return new FalNetworkError({ endpoint, cause: error });
      },
    }),

  upload: (file: Blob | File) =>
    Effect.tryPromise({
      try: () => fal.storage.upload(file),
      catch: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          return new FalAuthError({ message: "FAL_KEY invalid or missing" });
        }
        return new FalNetworkError({ endpoint: "storage/upload", cause: error });
      },
    }),

  queueSubmit: (endpoint: string, input: Record<string, unknown>) =>
    Effect.tryPromise({
      try: async () => {
        const { request_id } = await fal.queue.submit(endpoint, { input });
        return request_id;
      },
      catch: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          return new FalAuthError({ message: "FAL_KEY invalid or missing" });
        }
        return new FalNetworkError({ endpoint, cause: error });
      },
    }),

  queueResult: <T>(endpoint: string, requestId: string) =>
    Effect.tryPromise({
      try: () =>
        fal.queue.result(endpoint, { requestId }) as Promise<T>,
      catch: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          return new FalAuthError({ message: "FAL_KEY invalid or missing" });
        }
        if (error instanceof QueueTimeoutError) {
          return new FalTimeoutError({ endpoint, timeoutMs: 0 });
        }
        if (error instanceof ApiError) {
          return new FalModelError({ endpoint, status: error.status, message: error.message, body: error.body });
        }
        return new FalNetworkError({ endpoint, cause: error });
      },
    }),
});
```

### Usage in Pipeline

```typescript
const generateHeroImage = (prompt: string, style: string) =>
  Effect.gen(function* () {
    const client = yield* FalClient;

    // Generate image
    const result = yield* client.subscribe<{
      data: { images: Array<{ url: string }>; seed: number };
    }>("fal-ai/flux-2-max", {
      prompt,
      image_size: "landscape_16_9",
      num_images: 1,
    });

    const imageUrl = result.data.images[0].url;

    // Upload for background removal
    const bgRemoved = yield* client.subscribe<{
      data: { image: { url: string } };
    }>("fal-ai/birefnet/v2", {
      image_url: imageUrl,
      model: "Heavy",
    });

    return bgRemoved.data.image.url;
  });

// Run with provided layer
const program = generateHeroImage("...", "bauhaus").pipe(
  Effect.provide(FalClientLive),
);
```

---

## Common Input Parameters

### Image Generation

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | Text description of desired image |
| `negative_prompt` | string | What to avoid in the image |
| `image_size` | string | `"square_hd"`, `"square"`, `"portrait_4_3"`, `"portrait_16_9"`, `"landscape_4_3"`, `"landscape_16_9"` |
| `num_inference_steps` | number | Denoising steps (higher = more detail, slower) |
| `guidance_scale` | number | How closely to follow the prompt (typically 3.0-7.5) |
| `num_images` | number | Number of images to generate (1-4) |
| `seed` | number | Reproducibility seed (-1 for random) |
| `enable_safety_checker` | boolean | NSFW safety filter |
| `loras` | array | LoRA weights `[{ path, scale }]` |

### Video Generation

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | Text description with optional camera bracket notation |
| `negative_prompt` | string | What to avoid |
| `duration` | string | `"5s"`, `"6s"`, `"10s"`, `"15s"` (model-dependent) |
| `aspect_ratio` | string | `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"` |
| `image_url` | string | First-frame image URL for image-to-video |
| `seed` | number | Reproducibility seed |

---

## Parallel Pipeline Pattern

When multiple independent pipeline stages need to run on the same source, use parallel submission:

```typescript
const runParallelPipeline = (sourceImageUrl: string) =>
  Effect.gen(function* () {
    const client = yield* FalClient;

    // Run background removal, depth estimation, and upscaling in parallel
    const [bgRemoved, depthMap, upscaled] = yield* Effect.all([
      client.subscribe("fal-ai/birefnet/v2", {
        image_url: sourceImageUrl,
        model: "Heavy",
      }),
      client.subscribe("fal-ai/depth-anything/v2", {
        image_url: sourceImageUrl,
      }),
      client.subscribe("fal-ai/topaz/upscale/image", {
        image_url: sourceImageUrl,
        model: "CGI",
        scale: 2,
      }),
    ], { concurrency: 3 });

    return { bgRemoved, depthMap, upscaled };
  });
```

---

## Timeout Guidelines

| Operation Type | Recommended Timeout | Notes |
|---------------|--------------------:|-------|
| Image generation (fast tier) | 30s | Z-Image Turbo, ESRGAN |
| Image generation (standard/pro) | 120s | Flux, Recraft, Ideogram |
| Image generation (premium) | 180s | Flux 2 Max, GPT Image 1.5 |
| Video generation (short, <6s) | 180s | Most video models |
| Video generation (long, >6s) | 300s | Veo 3, Sora 2, Kling 3 |
| Upscaling (image) | 60s | Topaz, SeedVR |
| Upscaling (video) | 600s | Topaz Video |
| Background removal | 30s | BiRefNet, Bria RMBG |
| 3D mesh generation | 120s | Trellis, TripoSR |
| TTS / Audio | 60s | Gemini TTS, ElevenLabs |
| Avatar / Talking head | 300s | OmniHuman, Aurora |
