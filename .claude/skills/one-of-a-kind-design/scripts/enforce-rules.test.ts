import { describe, expect, test } from "bun:test";
import { checkNestingDepth, enforceRules } from "./enforce-rules";

describe("enforceRules", () => {
  test("detects require() as bun-only violation", () => {
    const code = `const x = require("fs")`;
    const report = enforceRules(code, "test-file.ts");
    const bunOnly = report.violations.filter((v) => v.rule === "bun-only");
    expect(bunOnly.some((v) => v.pattern.includes("require"))).toBe(true);
  });

  test("detects process.env. as bun-only violation", () => {
    const code = `const key = process.env.SECRET`;
    const report = enforceRules(code, "test-file.ts");
    const bunOnly = report.violations.filter((v) => v.rule === "bun-only");
    expect(bunOnly.some((v) => v.pattern.includes("process\\.env\\."))).toBe(true);
  });

  test('detects from "node:fs" as bun-only violation', () => {
    // enforceRules skips lines starting with `import`/`export`, so embed the pattern in a comment or string on a code line
    const code = `const mod = loadModule(from "node:fs")`;
    const report = enforceRules(code, "test-file.ts");
    const bunOnly = report.violations.filter((v) => v.rule === "bun-only");
    expect(bunOnly.some((v) => v.pattern.includes("node:"))).toBe(true);
  });

  test("detects new Promise( as effect-native violation", () => {
    const code = `import { Effect } from "effect"\nconst p = new Promise((resolve) => resolve(1))`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("new\\s+Promise"))).toBe(true);
  });

  test("detects try { } catch as effect-native violation", () => {
    const code = `import { Effect } from "effect"\ntry {\n  doStuff()\n} catch (e) {}`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("try"))).toBe(true);
  });

  test("detects async function as effect-native violation", () => {
    const code = `import { Effect } from "effect"\nasync function fetchData() { return 1 }`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("async\\s+function"))).toBe(true);
  });

  test("detects console.log( as effect-native violation", () => {
    const code = `import { Effect } from "effect"\nconsole.log("hello")`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("console\\.log"))).toBe(true);
  });

  test("detects throw new Error as effect-native violation", () => {
    const code = `import { Effect } from "effect"\nthrow new Error("oops")`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("throw\\s+new\\s+Error"))).toBe(true);
  });

  test("detects setTimeout( as effect-native violation", () => {
    const code = `import { Effect } from "effect"\nsetTimeout(() => {}, 1000)`;
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.some((v) => v.pattern.includes("setTimeout"))).toBe(true);
  });

  test("detects nesting depth > 3", () => {
    const code = [
      `Effect.gen(function* () {`,
      `  Effect.gen(function* () {`,
      `    Effect.gen(function* () {`,
      `      Effect.gen(function* () {`,
      `      })`,
      `    })`,
      `  })`,
      `})`,
    ].join("\n");
    const violations = checkNestingDepth(code, 3);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].rule).toBe("nesting-depth");
  });

  test("passes clean Effect-native Bun code", () => {
    const code = [
      `import { Effect, pipe } from "effect"`,
      ``,
      `const program = Effect.gen(function* () {`,
      `  const data = yield* Effect.tryPromise({`,
      `    try: () => Bun.file("data.json").text(),`,
      `    catch: (e) => new Error(String(e)),`,
      `  })`,
      `  return data`,
      `})`,
    ].join("\n");
    const report = enforceRules(code, "src/clean.ts");
    expect(report.violations.length).toBe(0);
    expect(report.passed).toBe(true);
  });

  test("skips test files for effect-native rules", () => {
    const code = `import { Effect } from "effect"\nconsole.log("test")\nnew Promise((r) => r(1))`;
    const report = enforceRules(code, "src/module.test.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    expect(effectNative.length).toBe(0);
  });

  test("exempts code inside Effect.tryPromise body", () => {
    const code = [
      `import { Effect } from "effect"`,
      ``,
      `const x = Effect.tryPromise({`,
      `  try: async () => {`,
      `    const res = await fetch("https://example.com")`,
      `    return res.json()`,
      `  },`,
      `  catch: (e) => new Error(String(e)),`,
      `})`,
    ].join("\n");
    const report = enforceRules(code, "src/module.ts");
    const effectNative = report.violations.filter((v) => v.rule === "effect-native");
    // async and fetch inside Effect.tryPromise should be exempt
    const asyncViolations = effectNative.filter(
      (v) => v.pattern.includes("async") || v.pattern.includes("fetch"),
    );
    expect(asyncViolations.length).toBe(0);
  });
});
