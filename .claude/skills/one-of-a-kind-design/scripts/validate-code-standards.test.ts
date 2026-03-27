import { describe, expect, test } from "bun:test";
import { checkNestingDepth, validateCodeStandards } from "./validate-code-standards";

describe("validateCodeStandards", () => {
  test("fails on require()", () => {
    const code = `const fs = require("fs")`;
    const result = validateCodeStandards(code);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "no-require")).toBe(true);
  });

  test("fails on fs.readFile", () => {
    const code = `fs.readFile("data.txt", "utf-8")`;
    const result = validateCodeStandards(code);
    expect(result.violations.some((v) => v.rule === "no-node-fs")).toBe(true);
  });

  test("detects new Promise( as anti-Effect", () => {
    const code = `const p = new Promise((resolve) => resolve(1))`;
    const result = validateCodeStandards(code);
    expect(result.violations.some((v) => v.rule === "no-raw-promise")).toBe(true);
  });

  test("detects try { } catch", () => {
    const code = `try {\n  doStuff()\n} catch (e) {\n  handleError(e)\n}`;
    const result = validateCodeStandards(code);
    expect(result.violations.some((v) => v.rule === "no-try-catch")).toBe(true);
  });

  test("passes clean Effect-native code", () => {
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
    const result = validateCodeStandards(code);
    expect(result.passed).toBe(true);
  });

  test("checks nesting depth", () => {
    const deepCode = [
      `Effect.gen(function* () {`,
      `  Effect.gen(function* () {`,
      `    Effect.gen(function* () {`,
      `      Effect.gen(function* () {`,
      `      })`,
      `    })`,
      `  })`,
      `})`,
    ].join("\n");
    const violations = checkNestingDepth(deepCode, 3);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].rule).toBe("max-nesting");
  });
});
