# QUIVER-API-PATTERNS.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete reference for QuiverAI SDK integration patterns used for SVG generation in the one-of-a-kind-design skill.

**SDK:** `@quiverai/sdk` | **Docs:** https://docs.quiver.ai/ | **Runtime:** Bun | **Model:** `arrow-preview` | **Billing:** 1 credit per SVG | **Rate Limit:** 20 requests per 60 seconds per organization

---

## Authentication

```typescript
import { QuiverAI } from "@quiverai/sdk";

const client = new QuiverAI({
  bearerAuth: Bun.env.QUIVERAI_API_KEY,
});
```

The `QUIVERAI_API_KEY` environment variable must be set. The skill validates this at startup alongside `FAL_KEY`.

---

## Text-to-SVG Generation

Generate SVG graphics from text descriptions with optional style instructions and reference images.

### Basic Usage

```typescript
const response = await client.createSVGs.generateSVG({
  model: "arrow-preview",
  prompt: "A geometric logo for an architecture firm, centered hexagonal form",
  instructions: "Bauhaus style. Colors: #FF0000, #0000FF, #FFFF00 on white #FFFFFF. No gradients. Flat fills only. Clean vector paths.",
  n: 1,
  temperature: 0.4,
});

// Access generated SVG content
const svgContent = response.data[0].content; // Raw SVG markup string
const svgUrl = response.data[0].url;          // Hosted URL for the SVG
```

### With Reference Images

Provide up to 4 reference images to guide the generation:

```typescript
const response = await client.createSVGs.generateSVG({
  model: "arrow-preview",
  prompt: "A decorative section divider inspired by the reference art style",
  instructions: "Art-nouveau flowing curves, muted sage #6B705C and gold #C9A84C palette, whiplash vine motifs",
  references: [
    { url: "https://example.com/reference-art-nouveau-ornament.png" },
    { url: "https://example.com/reference-vine-pattern.png" },
  ],
  n: 3,
  temperature: 0.7,
});

// Iterate over variants
for (const svg of response.data) {
  console.log(`SVG URL: ${svg.url}`);
  console.log(`Content length: ${svg.content.length} characters`);
}
```

### With Streaming (SSE)

For real-time progress updates during generation:

```typescript
const response = await client.createSVGs.generateSVG({
  model: "arrow-preview",
  prompt: "An isometric 3D icon grid of office supplies",
  instructions: "Isometric 30-degree angle. Bright saturated colors. Flat-shaded 3D objects. No gradients within faces.",
  n: 1,
  temperature: 0.5,
  stream: true,
});

// Stream phases: reasoning -> draft -> content
for await (const event of response) {
  if (event.phase === "reasoning") {
    console.log("Planning:", event.text);
  } else if (event.phase === "draft") {
    console.log("Drafting SVG structure...");
  } else if (event.phase === "content") {
    console.log("Final SVG content ready");
    const svgContent = event.content;
  }
}
```

### Full Parameter Reference

```typescript
const response = await client.createSVGs.generateSVG({
  // Required
  model: "arrow-preview",
  prompt: "Description of desired SVG content",

  // Optional
  instructions: "Style and formatting directives",
  references: [
    { url: "https://..." },           // Reference by URL
    { base64: "data:image/png;..." },  // Reference by base64
  ], // Max 4 references
  n: 1,                    // Number of outputs (1-16)
  stream: false,           // Enable SSE streaming
  temperature: 1.0,        // Randomness (0-2)
  top_p: 1.0,             // Nucleus sampling (0-1)
  presence_penalty: 0.0,   // Pattern variety (-2 to 2)
  max_output_tokens: 8192, // Upper bound (1-131072)
});
```

---

## Image-to-SVG Vectorization

Convert raster images (PNG/JPEG/WebP) to SVG vector format.

### Basic Usage

```typescript
const response = await client.vectorizeSVG.vectorizeSVG({
  model: "arrow-preview",
  image: {
    url: "https://example.com/hero-image.png",
  },
  n: 1,
});

const svgContent = response.data[0].content;
const svgUrl = response.data[0].url;
```

### With Auto-Crop and Parameters

```typescript
const response = await client.vectorizeSVG.vectorizeSVG({
  model: "arrow-preview",
  image: {
    url: "https://example.com/bauhaus-composition.png",
  },
  autoCrop: true,       // Crop to dominant subject
  targetSize: 768,      // Pre-resize to 768x768 pixels
  n: 1,
  temperature: 0.3,     // Low for geometric precision
});
```

### Full Parameter Reference

```typescript
const response = await client.vectorizeSVG.vectorizeSVG({
  // Required
  model: "arrow-preview",
  image: {
    url: "https://...",              // Image by URL
    // OR
    base64: "data:image/png;...",    // Image by base64
  },

  // Optional
  autoCrop: false,         // Crop to dominant subject (default false)
  targetSize: 512,         // Square resize in pixels (128-4096)
  n: 1,                    // Number of outputs (1-16)
  stream: false,           // Enable SSE streaming
  temperature: 1.0,        // Randomness (0-2)
  top_p: 1.0,             // Nucleus sampling (0-1)
  presence_penalty: 0.0,   // Pattern variety (-2 to 2)
  max_output_tokens: 8192, // Upper bound (1-131072)
});
```

---

## Response Handling

### Response Structure

Both text-to-SVG and image-to-SVG return the same response structure:

```typescript
interface QuiverAIResponse {
  data: Array<{
    content: string; // Raw SVG markup (XML string)
    url: string;     // Hosted URL to access the SVG
  }>;
  usage: {
    credits: number; // Credits consumed (1 per SVG)
  };
}
```

### Extracting and Saving SVG Content

```typescript
const response = await client.createSVGs.generateSVG({
  model: "arrow-preview",
  prompt: "...",
  n: 1,
});

// Get raw SVG content
const svgMarkup = response.data[0].content;

// Write to file using Bun
await Bun.write("./assets/hero-decoration.svg", svgMarkup);

// Or get the hosted URL for direct use
const hostedUrl = response.data[0].url;
```

### Validating SVG Output

```typescript
function validateSvg(content: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!content.startsWith("<svg") && !content.startsWith("<?xml")) {
    issues.push("Content does not start with SVG or XML declaration");
  }

  if (!content.includes("viewBox")) {
    issues.push("Missing viewBox attribute — SVG may not scale correctly");
  }

  if (content.includes("width=") && content.includes("height=") && !content.includes("viewBox")) {
    issues.push("Fixed dimensions without viewBox — not responsive");
  }

  // Check for gradients when style prohibits them
  const hasGradients = content.includes("linearGradient") || content.includes("radialGradient");

  return {
    valid: issues.length === 0,
    issues,
  };
}
```

---

## Error Handling

### Error Types

```typescript
try {
  const response = await client.createSVGs.generateSVG({
    model: "arrow-preview",
    prompt: "...",
    n: 1,
  });
} catch (error) {
  if (error.status === 401) {
    // Authentication failure
    // Action: Check QUIVERAI_API_KEY environment variable
    console.error("QuiverAI auth failed. Check QUIVERAI_API_KEY.");

  } else if (error.status === 422) {
    // Validation error (bad parameters)
    // Action: Fix parameters and retry
    console.error("Invalid parameters:", error.message);

  } else if (error.status === 429) {
    // Rate limited (20 requests per 60 seconds)
    // Action: Wait and retry with backoff
    console.error("Rate limited. Max 20 requests per 60 seconds per org.");

  } else if (error.status === 402) {
    // Insufficient credits
    // Action: Alert user to top up credits
    console.error("Insufficient QuiverAI credits.");

  } else if (error.status >= 500) {
    // Server error
    // Action: Retry with exponential backoff
    console.error("QuiverAI server error:", error.status);

  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Retry with Backoff

```typescript
async function quiverWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry auth or validation errors
      if (error.status === 401 || error.status === 422 || error.status === 402) {
        throw error;
      }

      // Rate limit: wait longer
      if (error.status === 429) {
        const delay = 60_000; // Wait full rate limit window
        console.warn(`QuiverAI rate limited. Waiting ${delay}ms.`);
        await Bun.sleep(delay);
        continue;
      }

      // Server error: exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
      console.warn(`QuiverAI attempt ${attempt + 1} failed. Retrying in ${delay}ms.`);
      await Bun.sleep(delay);
    }
  }

  throw lastError;
}
```

---

## Effect Layer Wrapper Pattern

### Service Definition

```typescript
import { Effect, Layer, Context, Data } from "effect";

class QuiverAuthError extends Data.TaggedError("QuiverAuthError")<{
  message: string;
}> {}

class QuiverRateLimitError extends Data.TaggedError("QuiverRateLimitError")<{
  retryAfterMs: number;
}> {}

class QuiverCreditsError extends Data.TaggedError("QuiverCreditsError")<{
  message: string;
}> {}

class QuiverValidationError extends Data.TaggedError("QuiverValidationError")<{
  message: string;
  body: unknown;
}> {}

class QuiverServerError extends Data.TaggedError("QuiverServerError")<{
  status: number;
  message: string;
}> {}

class QuiverClient extends Context.Tag("QuiverClient")<
  QuiverClient,
  {
    readonly textToSvg: (params: {
      prompt: string;
      instructions?: string;
      references?: Array<{ url?: string; base64?: string }>;
      n?: number;
      temperature?: number;
    }) => Effect.Effect<
      Array<{ content: string; url: string }>,
      QuiverAuthError | QuiverRateLimitError | QuiverCreditsError | QuiverValidationError | QuiverServerError
    >;

    readonly imageToSvg: (params: {
      imageUrl: string;
      autoCrop?: boolean;
      targetSize?: number;
      n?: number;
      temperature?: number;
    }) => Effect.Effect<
      Array<{ content: string; url: string }>,
      QuiverAuthError | QuiverRateLimitError | QuiverCreditsError | QuiverValidationError | QuiverServerError
    >;
  }
>() {}
```

### Live Implementation

```typescript
const QuiverClientLive = Layer.succeed(QuiverClient, {
  textToSvg: (params) =>
    Effect.tryPromise({
      try: async () => {
        const response = await client.createSVGs.generateSVG({
          model: "arrow-preview",
          prompt: params.prompt,
          instructions: params.instructions,
          references: params.references,
          n: params.n ?? 1,
          temperature: params.temperature ?? 1.0,
        });
        return response.data.map((item) => ({
          content: item.content,
          url: item.url,
        }));
      },
      catch: (error: any) => {
        if (error.status === 401) return new QuiverAuthError({ message: "QUIVERAI_API_KEY invalid or missing" });
        if (error.status === 402) return new QuiverCreditsError({ message: "Insufficient credits" });
        if (error.status === 422) return new QuiverValidationError({ message: error.message, body: error.body });
        if (error.status === 429) return new QuiverRateLimitError({ retryAfterMs: 60_000 });
        return new QuiverServerError({ status: error.status ?? 500, message: String(error) });
      },
    }),

  imageToSvg: (params) =>
    Effect.tryPromise({
      try: async () => {
        const response = await client.vectorizeSVG.vectorizeSVG({
          model: "arrow-preview",
          image: { url: params.imageUrl },
          autoCrop: params.autoCrop ?? false,
          targetSize: params.targetSize,
          n: params.n ?? 1,
          temperature: params.temperature ?? 1.0,
        });
        return response.data.map((item) => ({
          content: item.content,
          url: item.url,
        }));
      },
      catch: (error: any) => {
        if (error.status === 401) return new QuiverAuthError({ message: "QUIVERAI_API_KEY invalid or missing" });
        if (error.status === 402) return new QuiverCreditsError({ message: "Insufficient credits" });
        if (error.status === 422) return new QuiverValidationError({ message: error.message, body: error.body });
        if (error.status === 429) return new QuiverRateLimitError({ retryAfterMs: 60_000 });
        return new QuiverServerError({ status: error.status ?? 500, message: String(error) });
      },
    }),
});
```

### Pipeline Usage

```typescript
const generateStyledSvg = (style: string, subject: string, palette: string[]) =>
  Effect.gen(function* () {
    const quiver = yield* QuiverClient;

    const paletteInstruction = palette.map((hex) => hex).join(", ");

    const svgs = yield* quiver.textToSvg({
      prompt: `${subject}`,
      instructions: `${style} style. Use colors: ${paletteInstruction}. No gradients. Clean vector paths, minimal anchor points.`,
      n: 3,
      temperature: 0.5,
    });

    // Return the best candidate (quality assessment selects winner)
    return svgs;
  });
```

---

## Per-Style SVG Adaptation Tips

### Geometric Styles (bauhaus, de-stijl, flat-design, constructivism, swiss-international, isometric)

```typescript
const instructions = `
  No gradients. Flat solid fills only.
  Mathematical grid alignment.
  Clean geometric primitives (rect, circle, polygon).
  Minimal anchor points.
  Use colors: ${paletteHexes.join(", ")}.
`;
const temperature = 0.3; // Low — precision matters
```

### Organic Styles (art-nouveau, wabi-sabi, impressionism, watercolor)

```typescript
const instructions = `
  Flowing organic curves, cubic Bezier paths.
  Allow soft edges and natural irregularity.
  Use colors: ${paletteHexes.join(", ")}.
  May use SVG filters (feTurbulence, feGaussianBlur) for texture.
`;
const temperature = 0.7; // Moderate — allow artistic interpretation
// Note: Run SVGO with mergePaths: true afterward to manage path count
```

### Dark/Glow Styles (dark-mode-ui, cyberpunk, aurora-ui, neon)

```typescript
const instructions = `
  Transparent background (no background rect).
  Luminous accent colors: ${paletteHexes.join(", ")}.
  Glow effects via feGaussianBlur filter.
  High contrast, crisp geometric shapes.
`;
const temperature = 0.5;
```

### Textured Styles (analog-film-grain, risograph, woodcut, cyanotype)

```typescript
const instructions = `
  Simulate texture via SVG feTurbulence filter.
  Limited color palette (2-3 spot colors): ${paletteHexes.join(", ")}.
  ${style === "risograph" ? "Halftone dot patterns via SVG pattern fills. Misregistration offset 1-2px." : ""}
  ${style === "woodcut" ? "Bold carved parallel lines, thick uniform strokes, cross-hatching for tone." : ""}
  ${style === "cyanotype" ? "Prussian blue #003153 and white only. Photogram silhouette aesthetic." : ""}
`;
const temperature = 0.5;
```

### Pattern Styles (generative-art, fractal, particle-systems, cellular-automata)

```typescript
const instructions = `
  Algorithmic pattern aesthetic.
  Use colors: ${paletteHexes.join(", ")}.
  Regular grid or mathematical curve structure.
  ${style === "fractal" ? "Self-similar recursive patterns, mathematical precision." : ""}
  ${style === "particle-systems" ? "Scattered dots at various scales, connecting lines between nearby elements." : ""}
`;
const temperature = 0.4;
const targetSize = 384; // Keep small, tile at application layer
```

---

## SVGO Post-Processing

After receiving SVG from QuiverAI, always run SVGO optimization:

```typescript
import { optimize } from "svgo";

function optimizeSvg(svgContent: string, style: string): string {
  const isGeometric = ["bauhaus", "de-stijl", "flat-design", "constructivism", "isometric"].includes(style);

  const result = optimize(svgContent, {
    plugins: [
      "removeDoctype",
      "removeComments",
      "removeMetadata",
      "removeEditorsNSData",
      "cleanupAttrs",
      "mergeStyles",
      { name: "convertPathData", params: { floatPrecision: isGeometric ? 1 : 2 } },
      "removeDimensions",          // Use viewBox instead
      "removeUselessStrokeAndFill",
      { name: "convertColors", params: { currentColor: false, shorthand: true } },
      ...(isGeometric
        ? [] // Preserve rect/circle primitives for animation
        : ["convertShapeToPath", "mergePaths", "removeOffCanvasPaths"]
      ),
    ],
  });

  return result.data;
}
```
