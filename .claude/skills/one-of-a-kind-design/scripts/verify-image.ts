/**
 * verify-image.ts — Four-layer deterministic image verification stack.
 * Layer 1: Pixelmatch (pixel-level diff)
 * Layer 2: SSIM (structural similarity)
 * Layer 3: pHash (perceptual hash, DCT-based)
 * Layer 4: Uniqueness (pHash vs known library)
 *
 * Run: bun run scripts/verify-image.ts --a <url> --b <url>
 */
import { Effect, pipe } from "effect";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { ssim as computeSSIMLib } from "ssim.js";

// --- Types ---

export interface PixelDiffResult {
  readonly totalPixels: number;
  readonly diffPixels: number;
  readonly diffPercent: number;
  readonly verdict: "identical" | "minor-diff" | "significant-diff" | "completely-different";
}

export interface SSIMResult {
  readonly ssimIndex: number;
  readonly luminance: number;
  readonly contrast: number;
  readonly structure: number;
}

export interface PerceptualHashResult {
  readonly hashA: string;
  readonly hashB: string;
  readonly hammingDistance: number;
  readonly similarity: number;
}

export interface UniquenessResult {
  readonly nearestMatchDistance: number;
  readonly isUnique: boolean;
  readonly closestMatchId: string | null;
}

export interface HashEntry {
  readonly hash: string;
  readonly source: string;
  readonly style: string;
}

export interface VerificationResult {
  readonly pixelDiff: PixelDiffResult;
  readonly structuralSimilarity: SSIMResult;
  readonly perceptualHash: PerceptualHashResult;
  readonly uniqueness: UniquenessResult;
}

// --- Layer 1: Pixelmatch ---

function classifyDiff(diffPercent: number): PixelDiffResult["verdict"] {
  if (diffPercent === 0) return "identical";
  if (diffPercent < 5) return "minor-diff";
  if (diffPercent < 30) return "significant-diff";
  return "completely-different";
}

export const comparePixels = (
  a: Uint8Array,
  b: Uint8Array,
  w: number,
  h: number,
): Effect.Effect<PixelDiffResult, Error> =>
  Effect.try({
    try: () => {
      const totalPixels = w * h;
      const diff = new Uint8Array(totalPixels * 4);
      const diffPixels = pixelmatch(a, b, diff, w, h, { threshold: 0.1 });
      const diffPercent = (diffPixels / totalPixels) * 100;
      return { totalPixels, diffPixels, diffPercent, verdict: classifyDiff(diffPercent) };
    },
    catch: (e) => new Error(`Pixelmatch failed: ${e}`),
  });

// --- Layer 2: SSIM ---

export const computeSSIM = (
  a: Uint8Array,
  b: Uint8Array,
  w: number,
  h: number,
): Effect.Effect<SSIMResult, Error> =>
  Effect.try({
    try: () => {
      const imgA = {
        data: new Uint8ClampedArray(a.buffer, a.byteOffset, a.length),
        width: w,
        height: h,
        channels: 4 as const,
      };
      const imgB = {
        data: new Uint8ClampedArray(b.buffer, b.byteOffset, b.length),
        width: w,
        height: h,
        channels: 4 as const,
      };
      const result = computeSSIMLib(imgA, imgB);
      return {
        ssimIndex: result.mssim,
        luminance: result.performance ?? result.mssim,
        contrast: result.performance ?? result.mssim,
        structure: result.performance ?? result.mssim,
      };
    },
    catch: (e) => new Error(`SSIM computation failed: ${e}`),
  });

// --- Layer 3: pHash (DCT-based, 64-bit) ---

function toGrayscale(rgba: Uint8Array, w: number, h: number): Float64Array {
  const gray = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

function resizeBilinear(
  src: Float64Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): Float64Array {
  const dst = new Float64Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const sx = x * xRatio;
      const sy = y * yRatio;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);
      const xFrac = sx - x0;
      const yFrac = sy - y0;
      const top = src[y0 * srcW + x0] * (1 - xFrac) + src[y0 * srcW + x1] * xFrac;
      const bot = src[y1 * srcW + x0] * (1 - xFrac) + src[y1 * srcW + x1] * xFrac;
      dst[y * dstW + x] = top * (1 - yFrac) + bot * yFrac;
    }
  }
  return dst;
}

function dct32(input: Float64Array): Float64Array {
  const N = 32;
  const output = new Float64Array(N * N);
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          sum +=
            input[i * N + j] *
            Math.cos(((2 * i + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * j + 1) * v * Math.PI) / (2 * N));
        }
      }
      output[u * N + v] = sum;
    }
  }
  return output;
}

function extractTopLeft8x8(dct: Float64Array): Float64Array {
  const block = new Float64Array(64);
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      block[i * 8 + j] = dct[i * 32 + j];
    }
  }
  return block;
}

export const computePHash = (
  imageData: Uint8Array,
  width: number,
  height: number,
): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => {
      const gray = toGrayscale(imageData, width, height);
      const resized = resizeBilinear(gray, width, height, 32, 32);
      const dct = dct32(resized);
      const topLeft = extractTopLeft8x8(dct);
      const acValues = Array.from(topLeft.slice(1));
      const sorted = [...acValues].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      let hash = "";
      for (let i = 0; i < 64; i++) {
        hash += topLeft[i] > median ? "1" : "0";
      }
      return hash;
    },
    catch: (e) => new Error(`pHash computation failed: ${e}`),
  });

// --- Layer 3b: Hamming distance (pure) ---

export function hammingDistance(hashA: string, hashB: string): number {
  let dist = 0;
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// --- Layer 4: Uniqueness check (pure) ---

export function checkUniqueness(hash: string, library: HashEntry[]): UniquenessResult {
  if (library.length === 0) {
    return { nearestMatchDistance: 64, isUnique: true, closestMatchId: null };
  }
  let minDist = 64;
  let closestId: string | null = null;
  for (const entry of library) {
    const dist = hammingDistance(hash, entry.hash);
    if (dist < minDist) {
      minDist = dist;
      closestId = entry.source;
    }
  }
  return { nearestMatchDistance: minDist, isUnique: minDist > 10, closestMatchId: closestId };
}

// --- PNG/Fetch helpers ---

const loadPng = (
  buffer: Uint8Array,
): Effect.Effect<{ data: Uint8Array; width: number; height: number }, Error> =>
  Effect.tryPromise({
    try: async () => {
      const png = PNG.sync.read(Buffer.from(buffer));
      return { data: new Uint8Array(png.data), width: png.width, height: png.height };
    },
    catch: (e) => new Error(`PNG decode failed: ${e}`),
  });

const fetchImage = (url: string): Effect.Effect<Uint8Array, Error> =>
  Effect.tryPromise({
    try: async () => {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
      return new Uint8Array(await resp.arrayBuffer());
    },
    catch: (e) => new Error(`Image fetch failed: ${e}`),
  });

const loadKnownHashes = (): Effect.Effect<HashEntry[], Error> =>
  Effect.tryPromise({
    try: async () => {
      const path = new URL("../references/known-hashes.json", import.meta.url).pathname;
      const content = await Bun.file(path).text();
      const parsed = JSON.parse(content) as { hashes: HashEntry[] };
      return parsed.hashes;
    },
    catch: (e) => new Error(`Failed to load known hashes: ${e}`),
  });

export const addToLibrary = (
  hash: string,
  source: string,
  style: string,
): Effect.Effect<void, Error> =>
  Effect.tryPromise({
    try: async () => {
      const path = new URL("../references/known-hashes.json", import.meta.url).pathname;
      const content = await Bun.file(path).text();
      const parsed = JSON.parse(content) as { hashes: HashEntry[] };
      parsed.hashes.push({ hash, source, style });
      await Bun.write(path, JSON.stringify(parsed, null, 2));
    },
    catch: (e) => new Error(`Failed to add to library: ${e}`),
  });

// --- Orchestrator ---

export const verifyImage = (
  generatedUrl: string,
  referenceUrl: string | null,
  style?: string,
): Effect.Effect<VerificationResult, Error> =>
  Effect.gen(function* () {
    const genBytes = yield* fetchImage(generatedUrl);
    const genPng = yield* loadPng(genBytes);

    const refPng = referenceUrl
      ? yield* pipe(fetchImage(referenceUrl), Effect.flatMap(loadPng))
      : genPng;

    const pixelDiff = yield* comparePixels(genPng.data, refPng.data, genPng.width, genPng.height);
    const structuralSimilarity = yield* computeSSIM(
      genPng.data,
      refPng.data,
      genPng.width,
      genPng.height,
    );
    const hashA = yield* computePHash(genPng.data, genPng.width, genPng.height);
    const hashB = yield* computePHash(refPng.data, refPng.width, refPng.height);
    const hamming = hammingDistance(hashA, hashB);

    const library = yield* loadKnownHashes();
    const uniqueness = checkUniqueness(hashA, library);

    yield* addToLibrary(hashA, generatedUrl, style ?? "unknown");

    return {
      pixelDiff,
      structuralSimilarity,
      perceptualHash: {
        hashA,
        hashB,
        hammingDistance: hamming,
        similarity: 1 - hamming / 64,
      },
      uniqueness,
    };
  });

// --- CLI ---

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const urlA = getArg("--a") ?? "";
  const urlB = getArg("--b") ?? null;
  const style = getArg("--style");

  pipe(
    verifyImage(urlA, urlB, style),
    Effect.tap((result) =>
      Effect.sync(() => {
        console.log(JSON.stringify(result, null, 2));
      }),
    ),
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Verification failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
