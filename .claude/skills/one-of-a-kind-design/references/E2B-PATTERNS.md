# E2B-PATTERNS.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete reference for E2B sandbox patterns used in the one-of-a-kind-design skill. E2B provides isolated cloud sandboxes for running untrusted code, file processing, and pipeline operations.

**SDK:** `@e2b/code-interpreter` or `e2b` | **Docs:** https://e2b.dev/docs | **Runtime:** Bun

---

## Authentication

```typescript
import { Sandbox } from "e2b";

const sandbox = await Sandbox.create({
  apiKey: Bun.env.E2B_API_KEY,
});
```

The `E2B_API_KEY` environment variable must be set. The skill validates this at startup alongside `FAL_KEY` and `QUIVERAI_API_KEY`.

---

## Sandbox Creation

### Basic Sandbox

```typescript
import { Sandbox } from "e2b";

const sandbox = await Sandbox.create({
  apiKey: Bun.env.E2B_API_KEY,
  // Optional: specify a template for pre-installed dependencies
  // template: "custom-template-id",
});

// Sandbox is now running and ready for use
console.log(`Sandbox ID: ${sandbox.sandboxId}`);
```

### With Timeout

```typescript
const sandbox = await Sandbox.create({
  apiKey: Bun.env.E2B_API_KEY,
  timeout: 300_000, // 5 minutes max lifetime
});
```

### With Custom Template

For pipelines that need specific tools pre-installed (e.g., SVGO, Sharp, FFmpeg):

```typescript
const sandbox = await Sandbox.create({
  apiKey: Bun.env.E2B_API_KEY,
  template: "one-of-a-kind-design-pipeline", // Pre-built template with design tools
});
```

---

## File Upload / Download

### Upload a File

```typescript
// Upload from local path
const localContent = await Bun.file("./assets/hero-image.png").arrayBuffer();
await sandbox.files.write("/home/user/hero-image.png", new Uint8Array(localContent));

// Upload from string content
await sandbox.files.write("/home/user/config.json", JSON.stringify({
  style: "bauhaus",
  palette: ["#FF0000", "#0000FF", "#FFFF00"],
}));

// Upload SVG content
const svgContent = "<svg viewBox='0 0 100 100'>...</svg>";
await sandbox.files.write("/home/user/decoration.svg", svgContent);
```

### Download a File

```typescript
// Read file content
const content = await sandbox.files.read("/home/user/output/optimized.svg");

// Save to local filesystem
await Bun.write("./output/optimized.svg", content);
```

### List Files

```typescript
const files = await sandbox.files.list("/home/user/output/");
for (const file of files) {
  console.log(`${file.name} (${file.type}, ${file.size} bytes)`);
}
```

---

## Code Execution

### Run Code

```typescript
const result = await sandbox.runCode("console.log('Hello from sandbox');");

console.log("stdout:", result.logs.stdout);
console.log("stderr:", result.logs.stderr);
console.log("exit code:", result.exitCode);
```

### Run Shell Commands

```typescript
const result = await sandbox.commands.run("ls -la /home/user/");
console.log(result.stdout);
```

### Run Complex Pipeline

```typescript
// Install dependencies in the sandbox
await sandbox.commands.run("npm install svgo sharp");

// Run SVGO optimization
const svgoResult = await sandbox.commands.run(
  `npx svgo /home/user/input.svg -o /home/user/output.svg --config='${JSON.stringify({
    plugins: [
      "removeDoctype",
      "removeComments",
      "removeMetadata",
      "convertPathData",
      "removeDimensions",
    ],
  })}'`
);

if (svgoResult.exitCode !== 0) {
  console.error("SVGO failed:", svgoResult.stderr);
}
```

### Run with Timeout

```typescript
const result = await sandbox.commands.run("npm install && npm run build", {
  timeout: 60_000, // 60 second timeout for this specific command
});
```

---

## Lifecycle Management

### Create, Use, Destroy Pattern

```typescript
let sandbox: Sandbox | null = null;

try {
  // Create
  sandbox = await Sandbox.create({
    apiKey: Bun.env.E2B_API_KEY,
    timeout: 300_000,
  });

  // Use: upload files
  await sandbox.files.write("/home/user/input.svg", svgContent);

  // Use: execute processing
  await sandbox.commands.run("npx svgo /home/user/input.svg -o /home/user/output.svg");

  // Use: download results
  const optimized = await sandbox.files.read("/home/user/output.svg");

  return optimized;
} finally {
  // Destroy: always clean up
  if (sandbox) {
    await sandbox.kill();
  }
}
```

### Keep-Alive for Sequential Operations

When multiple sequential operations need the same sandbox:

```typescript
const sandbox = await Sandbox.create({
  apiKey: Bun.env.E2B_API_KEY,
  timeout: 600_000, // 10 minutes for multi-step pipeline
});

try {
  // Step 1: Upload and optimize SVG
  await sandbox.files.write("/home/user/raw.svg", rawSvg);
  await sandbox.commands.run("npx svgo /home/user/raw.svg -o /home/user/optimized.svg");

  // Step 2: Generate PNG preview
  await sandbox.commands.run(
    "npx sharp-cli /home/user/optimized.svg -o /home/user/preview.png --width 1200"
  );

  // Step 3: Create thumbnail
  await sandbox.commands.run(
    "npx sharp-cli /home/user/optimized.svg -o /home/user/thumb.png --width 300"
  );

  // Download all results
  const optimizedSvg = await sandbox.files.read("/home/user/optimized.svg");
  const preview = await sandbox.files.read("/home/user/preview.png");
  const thumb = await sandbox.files.read("/home/user/thumb.png");

  return { optimizedSvg, preview, thumb };
} finally {
  await sandbox.kill();
}
```

---

## Effect Layer Wrapping Pattern

### Service Definition

```typescript
import { Effect, Layer, Context, Data } from "effect";

class E2BAuthError extends Data.TaggedError("E2BAuthError")<{
  message: string;
}> {}

class E2BTimeoutError extends Data.TaggedError("E2BTimeoutError")<{
  operation: string;
  timeoutMs: number;
}> {}

class E2BExecutionError extends Data.TaggedError("E2BExecutionError")<{
  command: string;
  exitCode: number;
  stderr: string;
}> {}

class E2BFileError extends Data.TaggedError("E2BFileError")<{
  operation: "read" | "write" | "list";
  path: string;
  cause: unknown;
}> {}

class E2BSandboxError extends Data.TaggedError("E2BSandboxError")<{
  operation: "create" | "kill";
  cause: unknown;
}> {}

class E2BSandboxService extends Context.Tag("E2BSandboxService")<
  E2BSandboxService,
  {
    readonly withSandbox: <A, E>(
      fn: (sandbox: {
        writeFile: (path: string, content: string | Uint8Array) => Effect.Effect<void, E2BFileError>;
        readFile: (path: string) => Effect.Effect<string, E2BFileError>;
        runCommand: (cmd: string, timeout?: number) => Effect.Effect<{ stdout: string; stderr: string }, E2BExecutionError | E2BTimeoutError>;
        runCode: (code: string) => Effect.Effect<{ stdout: string; stderr: string }, E2BExecutionError>;
      }) => Effect.Effect<A, E>,
      options?: { timeout?: number },
    ) => Effect.Effect<A, E | E2BAuthError | E2BSandboxError>;
  }
>() {}
```

### Live Implementation

```typescript
const E2BSandboxServiceLive = Layer.succeed(E2BSandboxService, {
  withSandbox: (fn, options) =>
    Effect.acquireUseRelease(
      // Acquire: create sandbox
      Effect.tryPromise({
        try: () =>
          Sandbox.create({
            apiKey: Bun.env.E2B_API_KEY,
            timeout: options?.timeout ?? 300_000,
          }),
        catch: (error) => {
          if (String(error).includes("401") || String(error).includes("auth")) {
            return new E2BAuthError({ message: "E2B_API_KEY invalid or missing" });
          }
          return new E2BSandboxError({ operation: "create", cause: error });
        },
      }),

      // Use: execute the function with sandbox utilities
      (sandbox) =>
        fn({
          writeFile: (path, content) =>
            Effect.tryPromise({
              try: () => sandbox.files.write(path, content),
              catch: (error) => new E2BFileError({ operation: "write", path, cause: error }),
            }),

          readFile: (path) =>
            Effect.tryPromise({
              try: () => sandbox.files.read(path),
              catch: (error) => new E2BFileError({ operation: "read", path, cause: error }),
            }),

          runCommand: (cmd, timeout) =>
            Effect.tryPromise({
              try: async () => {
                const result = await sandbox.commands.run(cmd, {
                  timeout: timeout ?? 60_000,
                });
                if (result.exitCode !== 0) {
                  throw { exitCode: result.exitCode, stderr: result.stderr, cmd };
                }
                return { stdout: result.stdout, stderr: result.stderr };
              },
              catch: (error: any) => {
                if (error.exitCode !== undefined) {
                  return new E2BExecutionError({
                    command: error.cmd,
                    exitCode: error.exitCode,
                    stderr: error.stderr,
                  });
                }
                return new E2BTimeoutError({ operation: cmd, timeoutMs: timeout ?? 60_000 });
              },
            }),

          runCode: (code) =>
            Effect.tryPromise({
              try: async () => {
                const result = await sandbox.runCode(code);
                return {
                  stdout: result.logs.stdout.join("\n"),
                  stderr: result.logs.stderr.join("\n"),
                };
              },
              catch: (error) =>
                new E2BExecutionError({
                  command: "runCode",
                  exitCode: 1,
                  stderr: String(error),
                }),
            }),
        }),

      // Release: always destroy sandbox
      (sandbox) =>
        Effect.tryPromise({
          try: () => sandbox.kill(),
          catch: () => new E2BSandboxError({ operation: "kill", cause: "Failed to kill sandbox" }),
        }).pipe(Effect.orElseSucceed(() => void 0)), // Don't fail on cleanup errors
    ),
});
```

### Pipeline Usage

```typescript
const optimizeSvgPipeline = (rawSvg: string, style: string) =>
  Effect.gen(function* () {
    const e2b = yield* E2BSandboxService;

    const optimized = yield* e2b.withSandbox(
      (sandbox) =>
        Effect.gen(function* () {
          // Install SVGO
          yield* sandbox.runCommand("npm install svgo", 30_000);

          // Write input SVG
          yield* sandbox.writeFile("/home/user/input.svg", rawSvg);

          // Write SVGO config based on style
          const isGeometric = ["bauhaus", "de-stijl", "flat-design"].includes(style);
          const config = {
            plugins: [
              "removeDoctype",
              "removeComments",
              "removeMetadata",
              "cleanupAttrs",
              "convertPathData",
              "removeDimensions",
              ...(isGeometric ? [] : ["convertShapeToPath", "mergePaths"]),
            ],
          };
          yield* sandbox.writeFile("/home/user/svgo.config.json", JSON.stringify(config));

          // Run SVGO
          yield* sandbox.runCommand(
            "npx svgo /home/user/input.svg -o /home/user/output.svg --config /home/user/svgo.config.json",
            15_000,
          );

          // Read result
          return yield* sandbox.readFile("/home/user/output.svg");
        }),
      { timeout: 120_000 },
    );

    return optimized;
  });

// Run with provided layer
const program = optimizeSvgPipeline("<svg>...</svg>", "bauhaus").pipe(
  Effect.provide(E2BSandboxServiceLive),
);
```

---

## Timeout and Error Handling

### Timeout Strategy

| Operation | Recommended Timeout | Notes |
|-----------|--------------------:|-------|
| Sandbox creation | 30s | Usually fast, but cold starts can be slower |
| npm install (small) | 30s | Few dependencies |
| npm install (large) | 60s | Many dependencies or native modules |
| SVGO optimization | 15s | Single file processing |
| Sharp image processing | 30s | Depends on image size |
| FFmpeg video processing | 120s | Depends on video length |
| Full pipeline | 300s | Multi-step operations |
| Maximum sandbox lifetime | 600s | Hard upper bound |

### Error Recovery

```typescript
const robustSandboxOperation = <A>(
  operation: (sandbox: any) => Effect.Effect<A, any>,
  maxRetries = 2,
) =>
  Effect.gen(function* () {
    const e2b = yield* E2BSandboxService;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = yield* e2b.withSandbox(operation, { timeout: 300_000 }).pipe(
        Effect.map((a) => ({ _tag: "success" as const, value: a })),
        Effect.catchAll((error) =>
          Effect.succeed({ _tag: "failure" as const, error }),
        ),
      );

      if (result._tag === "success") {
        return result.value;
      }

      lastError = result.error;

      // Don't retry auth errors
      if (result.error instanceof E2BAuthError) {
        return yield* Effect.fail(result.error);
      }

      if (attempt < maxRetries) {
        yield* Effect.logWarning(
          `Sandbox operation failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying...`,
        );
      }
    }

    return yield* Effect.fail(lastError);
  });
```

---

## Pool Management for Sequential Operations

When processing multiple assets in sequence, reuse a single sandbox to avoid creation overhead:

```typescript
const batchProcessAssets = (assets: Array<{ name: string; content: string }>) =>
  Effect.gen(function* () {
    const e2b = yield* E2BSandboxService;

    const results = yield* e2b.withSandbox(
      (sandbox) =>
        Effect.gen(function* () {
          // One-time setup
          yield* sandbox.runCommand("npm install svgo sharp", 60_000);

          const processed: Array<{ name: string; optimized: string }> = [];

          // Process each asset sequentially in the same sandbox
          for (const asset of assets) {
            const inputPath = `/home/user/input/${asset.name}`;
            const outputPath = `/home/user/output/${asset.name}`;

            yield* sandbox.writeFile(inputPath, asset.content);

            if (asset.name.endsWith(".svg")) {
              yield* sandbox.runCommand(
                `npx svgo ${inputPath} -o ${outputPath}`,
                15_000,
              );
            }

            const result = yield* sandbox.readFile(outputPath);
            processed.push({ name: asset.name, optimized: result });
          }

          return processed;
        }),
      { timeout: 600_000 }, // Longer timeout for batch
    );

    return results;
  });
```

---

## Common Pipeline Recipes

### SVG Optimization

```typescript
await sandbox.commands.run("npm install svgo");
await sandbox.files.write("/home/user/input.svg", rawSvg);
await sandbox.commands.run("npx svgo /home/user/input.svg -o /home/user/output.svg");
const optimized = await sandbox.files.read("/home/user/output.svg");
```

### Image Format Conversion

```typescript
await sandbox.commands.run("npm install sharp");
await sandbox.files.write("/home/user/input.png", imageBuffer);
await sandbox.commands.run(
  "npx sharp-cli /home/user/input.png -o /home/user/output.webp --format webp --quality 85"
);
```

### Video Frame Extraction

```typescript
await sandbox.commands.run("apt-get update && apt-get install -y ffmpeg");
await sandbox.files.write("/home/user/video.mp4", videoBuffer);
await sandbox.commands.run(
  "ffmpeg -i /home/user/video.mp4 -vf fps=1 /home/user/frames/frame_%04d.png"
);
const files = await sandbox.files.list("/home/user/frames/");
```

### Design Token Generation

```typescript
await sandbox.commands.run("npm install style-dictionary");
await sandbox.files.write("/home/user/tokens.json", JSON.stringify(designTokens));
await sandbox.files.write("/home/user/config.json", JSON.stringify({
  source: ["/home/user/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "/home/user/output/",
      files: [{ destination: "variables.css", format: "css/variables" }],
    },
  },
}));
await sandbox.commands.run("npx style-dictionary build --config /home/user/config.json");
const cssVars = await sandbox.files.read("/home/user/output/variables.css");
```

---

## Security Notes

- Sandboxes are fully isolated -- no access to the host filesystem or network beyond what E2B allows
- Each sandbox runs in its own container with resource limits
- Sandboxes are destroyed after use (or on timeout), leaving no persistent state
- Never pass sensitive credentials (FAL_KEY, QUIVERAI_API_KEY) into sandbox environments
- Use E2B for untrusted code execution (user-provided scripts, package installations) only
