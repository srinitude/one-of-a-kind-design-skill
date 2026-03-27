/**
 * validate-output.ts — Anti-slop gate: font/copy/color bans, WCAG, motion a11y, layout.
 * LOCAL deterministic validation. No API calls.
 *
 * Run: bun run scripts/validate-output.ts --file "<path to generated code>"
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface ValidationResult {
  readonly passed: boolean;
  readonly score: number;
  readonly violations: Violation[];
  readonly warnings: Warning[];
}

interface Violation {
  readonly rule: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly line?: number;
}

type Warning = Violation;

// --- Anti-Slop Rules ---

const BANNED_FONTS = [
  { pattern: /font-family[^;]*inter\b/gi, why: "Inter is the #1 AI-generated default font" },
  { pattern: /font-family[^;]*roboto\b/gi, why: "Roboto signals zero typographic opinion" },
  { pattern: /font-family[^;]*open\s*sans/gi, why: "Open Sans is a 2012-era safe pick" },
  { pattern: /font-family[^;]*arial\b/gi, why: "Arial is a system fallback, not a choice" },
];

const BANNED_COLORS = [
  {
    pattern: /from-purple.*to-blue|bg-gradient.*purple.*blue/gi,
    why: "Purple-to-blue gradient is the #1 AI color scheme",
  },
  { pattern: /#000000(?!\s*\/)/g, why: "Pure #000000 is too harsh — use off-black" },
  { pattern: /text-black(?!\s*\/)/g, why: "text-black (#000000) flattens hierarchy" },
];

const BANNED_SHADOWS = [
  {
    pattern: /shadow-md|shadow-lg|shadow-xl|shadow-2xl/g,
    why: "Default Tailwind shadows belong to no style",
  },
];

const BANNED_LAYOUT = [
  { pattern: /max-w-4xl\s+mx-auto/g, why: "Centered max-w-4xl is the generic blog layout" },
];

const BANNED_MOTION = [
  { pattern: /transition-all\s+duration-300/g, why: "transition-all duration-300 is robotic" },
  {
    pattern: /ease-linear|linear\b(?!-gradient)/g,
    why: "Linear easing — nothing moves linearly in nature",
  },
];

const BANNED_COPY_WORDS = [
  "elevate",
  "seamless",
  "unleash",
  "next-gen",
  "game-changer",
  "delve",
  "cutting-edge",
  "revolutionize",
  "supercharge",
  "empower",
];

const BANNED_PLACEHOLDERS = [
  "lorem ipsum",
  "john doe",
  "jane doe",
  "acme corp",
  "example@email.com",
];

// --- WCAG Checks ---

function checkWcagPatterns(content: string): Violation[] {
  const violations: Violation[] = [];

  // Check for prefers-reduced-motion respect
  if (content.includes("animation") || content.includes("transition")) {
    if (!content.includes("prefers-reduced-motion")) {
      violations.push({
        rule: "wcag-motion",
        severity: "warning",
        message: "Animation/transition found without prefers-reduced-motion media query",
      });
    }
  }

  // Check for focus-visible on interactive elements
  if (content.includes("button") || content.includes("input") || content.includes("<a ")) {
    if (!content.includes("focus-visible") && !content.includes("focus:")) {
      violations.push({
        rule: "wcag-focus",
        severity: "warning",
        message: "Interactive elements should have visible focus indicators",
      });
    }
  }

  // Check for alt text on images
  const imgTags = content.match(/<img[^>]*>/g) ?? [];
  for (const img of imgTags) {
    if (!img.includes("alt=") && !img.includes("alt =")) {
      violations.push({
        rule: "wcag-alt",
        severity: "error",
        message: `Image tag missing alt attribute: ${img.slice(0, 60)}...`,
      });
    }
  }

  return violations;
}

// --- Main Validation ---

export function validateContent(content: string): ValidationResult {
  const violations: Violation[] = [];
  const warnings: Warning[] = [];
  const lower = content.toLowerCase();

  // Font bans
  for (const rule of BANNED_FONTS) {
    if (rule.pattern.test(content)) {
      violations.push({ rule: "anti-slop-font", severity: "error", message: rule.why });
    }
    rule.pattern.lastIndex = 0;
  }

  // Color bans
  for (const rule of BANNED_COLORS) {
    if (rule.pattern.test(content)) {
      violations.push({ rule: "anti-slop-color", severity: "error", message: rule.why });
    }
    rule.pattern.lastIndex = 0;
  }

  // Shadow bans
  for (const rule of BANNED_SHADOWS) {
    if (rule.pattern.test(content)) {
      warnings.push({ rule: "anti-slop-shadow", severity: "warning", message: rule.why });
    }
    rule.pattern.lastIndex = 0;
  }

  // Layout bans
  for (const rule of BANNED_LAYOUT) {
    if (rule.pattern.test(content)) {
      warnings.push({ rule: "anti-slop-layout", severity: "warning", message: rule.why });
    }
    rule.pattern.lastIndex = 0;
  }

  // Motion bans
  for (const rule of BANNED_MOTION) {
    if (rule.pattern.test(content)) {
      violations.push({ rule: "anti-slop-motion", severity: "error", message: rule.why });
    }
    rule.pattern.lastIndex = 0;
  }

  // Copy bans
  for (const word of BANNED_COPY_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      violations.push({
        rule: "anti-slop-copy",
        severity: "error",
        message: `Banned marketing word: "${word}"`,
      });
    }
  }

  // Placeholder bans
  for (const placeholder of BANNED_PLACEHOLDERS) {
    if (lower.includes(placeholder.toLowerCase())) {
      violations.push({
        rule: "anti-slop-placeholder",
        severity: "error",
        message: `Banned placeholder: "${placeholder}"`,
      });
    }
  }

  // WCAG checks
  violations.push(...checkWcagPatterns(content));

  // Score: 10.0 minus deductions
  const errorDeduction = violations.filter((v) => v.severity === "error").length * 1.0;
  const warningDeduction = warnings.length * 0.3;
  const score = Math.max(0, Math.min(10, 10 - errorDeduction - warningDeduction));

  return {
    passed: violations.filter((v) => v.severity === "error").length === 0,
    score,
    violations,
    warnings,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const inputIdx = args.indexOf("--input");
  let content: string;

  if (fileIdx >= 0 && args[fileIdx + 1]) {
    content = yield* Effect.tryPromise({
      try: () => Bun.file(args[fileIdx + 1]).text(),
      catch: (e) => new Error(`Failed to read file: ${e}`),
    });
  } else if (inputIdx >= 0 && args[inputIdx + 1]) {
    content = args[inputIdx + 1];
  } else {
    yield* Effect.fail(new Error("Provide --file <path> or --input <content>"));
    return;
  }

  const result = validateContent(content);

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exit(1);
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Validation failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
