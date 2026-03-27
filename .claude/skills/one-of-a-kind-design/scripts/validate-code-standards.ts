/**
 * validate-code-standards.ts — Bun-only, Effect-native, nesting ≤ 3 validation.
 * LOCAL deterministic AST-like checks on generated code.
 *
 * Run: bun run scripts/validate-code-standards.ts --input "<file path>"
 */
import { Effect, pipe } from "effect";

// --- Types ---

interface CodeStandardsResult {
  readonly passed: boolean;
  readonly score: number;
  readonly violations: CodeViolation[];
}

interface CodeViolation {
  readonly rule: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly line?: number;
}

// --- Node.js Detection ---

const NODE_API_PATTERNS = [
  {
    pattern: /\brequire\s*\(/g,
    rule: "no-require",
    message: "CommonJS require() — use ESM import",
  },
  {
    pattern: /\bfs\.\w+/g,
    rule: "no-node-fs",
    message: "Node.js fs API — use Bun.file() / Bun.write()",
  },
  {
    pattern: /\bpath\.join|path\.resolve/g,
    rule: "no-node-path",
    message: "Node.js path API — use URL / import.meta",
  },
  { pattern: /\bprocess\.env\b/g, rule: "prefer-bun-env", message: "process.env — prefer Bun.env" },
  {
    pattern: /from\s+['"]node:/g,
    rule: "no-node-prefix",
    message: "Node.js built-in import — use Bun equivalent",
  },
  { pattern: /\bnpm\s+|npx\s+/g, rule: "no-npm", message: "npm/npx reference — use bun" },
];

// --- Effect Pattern Checks ---

const ANTI_EFFECT_PATTERNS = [
  {
    pattern: /new Promise\s*\(/g,
    rule: "no-raw-promise",
    message: "Raw Promise — use Effect.tryPromise",
  },
  {
    pattern: /\btry\s*\{[\s\S]*?\}\s*catch/g,
    rule: "no-try-catch",
    message: "try/catch — use Effect.catchAll or Effect.catchTag",
  },
  {
    pattern: /\.then\s*\(/g,
    rule: "no-then-chain",
    message: ".then() chain — use Effect.flatMap or Effect.gen",
  },
  {
    pattern: /async\s+function\b/g,
    rule: "prefer-effect-gen",
    message: "async function — prefer Effect.gen for Effect-native code",
  },
];

// --- Nesting Depth Check ---

export function checkNestingDepth(content: string, maxDepth: number): CodeViolation[] {
  const violations: CodeViolation[] = [];
  const lines = content.split("\n");
  let effectGenDepth = 0;
  let maxFound = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("Effect.gen") || line.includes("Effect.flatMap")) {
      effectGenDepth++;
      maxFound = Math.max(maxFound, effectGenDepth);
    }
    // Simple heuristic: closing brace at reduced indentation
    if (line.trim() === "})") {
      effectGenDepth = Math.max(0, effectGenDepth - 1);
    }
  }

  if (maxFound > maxDepth) {
    violations.push({
      rule: "max-nesting",
      severity: "error",
      message: `Effect nesting depth ${maxFound} exceeds max ${maxDepth}`,
    });
  }

  return violations;
}

// --- Import Validation ---

function checkImports(content: string): CodeViolation[] {
  const violations: CodeViolation[] = [];

  // Must import from effect
  if (!content.includes('from "effect"') && !content.includes("from 'effect'")) {
    violations.push({
      rule: "requires-effect",
      severity: "warning",
      message: "No Effect import found — scripts should be Effect-native",
    });
  }

  return violations;
}

// --- Main Validation ---

export function validateCodeStandards(content: string): CodeStandardsResult {
  const violations: CodeViolation[] = [];

  // Node.js API detection
  for (const check of NODE_API_PATTERNS) {
    const matches = content.match(check.pattern);
    if (matches) {
      violations.push({
        rule: check.rule,
        severity: check.rule === "prefer-bun-env" ? "warning" : "error",
        message: `${check.message} (${matches.length} occurrence${matches.length > 1 ? "s" : ""})`,
      });
    }
  }

  // Anti-Effect patterns (warnings, not errors, since some are valid in specific contexts)
  for (const check of ANTI_EFFECT_PATTERNS) {
    const matches = content.match(check.pattern);
    if (matches) {
      violations.push({
        rule: check.rule,
        severity: "warning",
        message: `${check.message} (${matches.length} occurrence${matches.length > 1 ? "s" : ""})`,
      });
    }
  }

  // Nesting depth
  violations.push(...checkNestingDepth(content, 3));

  // Import validation
  violations.push(...checkImports(content));

  const errors = violations.filter((v) => v.severity === "error").length;
  const warnings = violations.filter((v) => v.severity === "warning").length;
  const score = Math.max(0, Math.min(10, 10 - errors * 2 - warnings * 0.5));

  return {
    passed: errors === 0,
    score,
    violations,
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");

  if (inputIdx < 0 || !args[inputIdx + 1]) {
    yield* Effect.fail(new Error("Provide --input <file path>"));
    return;
  }

  const filePath = args[inputIdx + 1];
  const content = yield* Effect.tryPromise({
    try: () => Bun.file(filePath).text(),
    catch: (e) => new Error(`Failed to read ${filePath}: ${e}`),
  });

  const result = validateCodeStandards(content);

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
        console.error(`Code standards check failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
