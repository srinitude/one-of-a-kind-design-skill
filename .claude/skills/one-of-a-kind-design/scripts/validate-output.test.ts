import { describe, expect, test } from "bun:test";
import { validateContent } from "./validate-output";

describe("validateContent", () => {
  test("fails on Inter font", () => {
    const content = `font-family: Inter, sans-serif;`;
    const result = validateContent(content);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "anti-slop-font")).toBe(true);
  });

  test("fails on purple-to-blue gradient", () => {
    const content = `<div class="from-purple-500 to-blue-500 bg-gradient-to-r">Hello</div>`;
    const result = validateContent(content);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "anti-slop-color")).toBe(true);
  });

  test('fails on "Lorem Ipsum"', () => {
    const content = `<p>Lorem Ipsum dolor sit amet</p>`;
    const result = validateContent(content);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "anti-slop-placeholder")).toBe(true);
  });

  test('fails on banned word "Elevate"', () => {
    const content = `<h1>Elevate your business today</h1>`;
    const result = validateContent(content);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "anti-slop-copy")).toBe(true);
  });

  test("fails on linear easing", () => {
    const content = `transition: all 0.3s ease-linear;`;
    const result = validateContent(content);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.rule === "anti-slop-motion")).toBe(true);
  });

  test("passes clean styled content", () => {
    const content = [
      `font-family: "Playfair Display", serif;`,
      `background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);`,
      `<h1>Crafted with intention</h1>`,
      `<p>Every detail matters in thoughtful design.</p>`,
    ].join("\n");
    const result = validateContent(content);
    expect(result.passed).toBe(true);
    expect(result.violations.filter((v) => v.severity === "error").length).toBe(0);
  });

  test("detects missing alt text", () => {
    const content = `<img src="hero.jpg" width="800">`;
    const result = validateContent(content);
    expect(result.violations.some((v) => v.rule === "wcag-alt")).toBe(true);
  });
});
