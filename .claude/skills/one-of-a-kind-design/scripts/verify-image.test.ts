import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  checkUniqueness,
  comparePixels,
  computePHash,
  computeSSIM,
  type HashEntry,
  hammingDistance,
} from "./verify-image";

// --- Test helpers ---

function makeSolidPng(w: number, h: number, r: number, g: number, b: number, a = 255): Uint8Array {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return data;
}

function makeCheckerboard(w: number, h: number, size: number): Uint8Array {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const isWhite = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0;
      const idx = (y * w + x) * 4;
      const v = isWhite ? 255 : 0;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  return data;
}

function makeNoise(w: number, h: number, seed: number): Uint8Array {
  const data = new Uint8Array(w * h * 4);
  let s = seed;
  for (let i = 0; i < w * h; i++) {
    // Simple LCG PRNG
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const v = (s >>> 16) & 0xff;
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  return data;
}

const W = 64;
const H = 64;

// --- Layer 1: Pixelmatch ---

describe("comparePixels", () => {
  test("identical images produce 0% diff", async () => {
    const img = makeSolidPng(W, H, 128, 128, 128);
    const result = await Effect.runPromise(comparePixels(img, img, W, H));
    expect(result.diffPixels).toBe(0);
    expect(result.diffPercent).toBe(0);
    expect(result.verdict).toBe("identical");
  });

  test("slightly modified image produces small diff", async () => {
    const a = makeSolidPng(W, H, 128, 128, 128);
    const b = new Uint8Array(a);
    // Modify 10 pixels
    for (let i = 0; i < 10; i++) {
      b[i * 4] = 255;
    }
    const result = await Effect.runPromise(comparePixels(a, b, W, H));
    expect(result.diffPercent).toBeGreaterThan(0);
    expect(result.diffPercent).toBeLessThan(5);
    expect(result.verdict).toBe("minor-diff");
  });

  test("completely different images produce high diff", async () => {
    const a = makeSolidPng(W, H, 0, 0, 0);
    const b = makeSolidPng(W, H, 255, 255, 255);
    const result = await Effect.runPromise(comparePixels(a, b, W, H));
    expect(result.diffPercent).toBeGreaterThan(30);
    expect(result.verdict).toBe("completely-different");
  });
});

// --- Layer 2: SSIM ---

describe("computeSSIM", () => {
  test("identical images produce SSIM of 1.0", async () => {
    const img = makeCheckerboard(W, H, 8);
    const result = await Effect.runPromise(computeSSIM(img, img, W, H));
    expect(result.ssimIndex).toBeCloseTo(1.0, 1);
  });

  test("completely different images produce low SSIM", async () => {
    const a = makeSolidPng(W, H, 0, 0, 0);
    const b = makeNoise(W, H, 42);
    const result = await Effect.runPromise(computeSSIM(a, b, W, H));
    expect(result.ssimIndex).toBeLessThan(0.5);
  });

  test("SSIM is symmetric: ssim(a,b) === ssim(b,a)", async () => {
    const a = makeCheckerboard(W, H, 8);
    const b = makeNoise(W, H, 99);
    const ab = await Effect.runPromise(computeSSIM(a, b, W, H));
    const ba = await Effect.runPromise(computeSSIM(b, a, W, H));
    expect(ab.ssimIndex).toBeCloseTo(ba.ssimIndex, 5);
  });
});

// --- Layer 3: pHash ---

describe("computePHash", () => {
  test("identical images produce same hash (hamming 0)", async () => {
    const img = makeCheckerboard(W, H, 8);
    const hashA = await Effect.runPromise(computePHash(img, W, H));
    const hashB = await Effect.runPromise(computePHash(img, W, H));
    expect(hashA).toBe(hashB);
    expect(hashA.length).toBe(64);
    expect(hammingDistance(hashA, hashB)).toBe(0);
  });

  test("completely different images produce high hamming distance", async () => {
    const a = makeSolidPng(W, H, 0, 0, 0);
    const b = makeCheckerboard(W, H, 4);
    const hashA = await Effect.runPromise(computePHash(a, W, H));
    const hashB = await Effect.runPromise(computePHash(b, W, H));
    expect(hammingDistance(hashA, hashB)).toBeGreaterThan(10);
  });

  test("same inputs always produce same results (deterministic)", async () => {
    const img = makeNoise(W, H, 777);
    const h1 = await Effect.runPromise(computePHash(img, W, H));
    const h2 = await Effect.runPromise(computePHash(img, W, H));
    const h3 = await Effect.runPromise(computePHash(img, W, H));
    expect(h1).toBe(h2);
    expect(h2).toBe(h3);
  });

  test("pHash of resized image is similar to original", async () => {
    // Create a 128x128 image
    const big = makeCheckerboard(128, 128, 16);
    const small = makeCheckerboard(W, H, 8);
    const hashBig = await Effect.runPromise(computePHash(big, 128, 128));
    const hashSmall = await Effect.runPromise(computePHash(small, W, H));
    // Same pattern at different sizes should be somewhat similar
    expect(hammingDistance(hashBig, hashSmall)).toBeLessThan(20);
  });
});

// --- Hamming distance ---

describe("hammingDistance", () => {
  test("identical hashes return 0", () => {
    const h = "1010101010101010101010101010101010101010101010101010101010101010";
    expect(hammingDistance(h, h)).toBe(0);
  });

  test("opposite hashes return 64", () => {
    const a = "0".repeat(64);
    const b = "1".repeat(64);
    expect(hammingDistance(a, b)).toBe(64);
  });

  test("single bit difference returns 1", () => {
    const a = "0".repeat(64);
    const b = `1${"0".repeat(63)}`;
    expect(hammingDistance(a, b)).toBe(1);
  });
});

// --- Layer 4: Uniqueness ---

describe("checkUniqueness", () => {
  test("empty library returns unique", () => {
    const result = checkUniqueness("0".repeat(64), []);
    expect(result.isUnique).toBe(true);
    expect(result.nearestMatchDistance).toBe(64);
    expect(result.closestMatchId).toBeNull();
  });

  test("hash with hamming > 10 to all known is unique", () => {
    const library: HashEntry[] = [{ hash: "1".repeat(64), source: "test-1", style: "cinematic" }];
    const result = checkUniqueness("0".repeat(64), library);
    expect(result.isUnique).toBe(true);
    expect(result.nearestMatchDistance).toBe(64);
  });

  test("near-duplicate (hamming <= 10) is not unique", () => {
    const known = "0".repeat(64);
    const similar = "1".repeat(5) + "0".repeat(59); // hamming = 5
    const library: HashEntry[] = [{ hash: known, source: "test-1", style: "cinematic" }];
    const result = checkUniqueness(similar, library);
    expect(result.isUnique).toBe(false);
    expect(result.nearestMatchDistance).toBe(5);
    expect(result.closestMatchId).toBe("test-1");
  });

  test("finds closest match among multiple entries", () => {
    const library: HashEntry[] = [
      { hash: "1".repeat(64), source: "far-1", style: "s1" },
      { hash: "1".repeat(10) + "0".repeat(54), source: "close-1", style: "s2" },
    ];
    const query = "0".repeat(64);
    const result = checkUniqueness(query, library);
    expect(result.closestMatchId).toBe("close-1");
    expect(result.nearestMatchDistance).toBe(10);
  });
});
