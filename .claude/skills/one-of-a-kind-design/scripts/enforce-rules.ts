/**
 * enforce-rules.ts — Unified enforcement of the 3 project rules:
 *   Rule 1: Bun-only (no Node.js APIs)
 *   Rule 2: Effect-native (no vanilla TS async patterns)
 *   Rule 3: Max nesting depth 3
 *
 * Run: bun run scripts/enforce-rules.ts              (scan all scripts)
 * Run: bun run scripts/enforce-rules.ts --file <path> (scan single file)
 */
import { Console, Effect, pipe } from "effect";

// --- Types ---

export interface RuleViolation {
  readonly rule: "bun-only" | "effect-native" | "nesting-depth";
  readonly pattern: string;
  readonly replacement: string;
  readonly line: number;
  readonly snippet: string;
}

export interface FileReport {
  readonly filePath: string;
  readonly passed: boolean;
  readonly violations: RuleViolation[];
}

export interface EnforcementReport {
  readonly passed: boolean;
  readonly totalFiles: number;
  readonly totalViolations: number;
  readonly files: FileReport[];
}

// --- Rule 1: Bun-only patterns ---

interface PatternRule {
  readonly regex: RegExp;
  readonly replacement: string;
}

const BUN_ONLY_RULES: PatternRule[] = [
  // Module system
  { regex: /\brequire\s*\(/g, replacement: "ESM import" },
  { regex: /\bmodule\.exports\b/g, replacement: "ESM export" },
  { regex: /\bexports\.\w+/g, replacement: "ESM export" },

  // Node.js built-in imports
  { regex: /from\s+['"]node:/g, replacement: "Bun equivalent (no node: imports)" },
  { regex: /from\s+['"]fs['"]/g, replacement: "Bun.file() / Bun.write()" },
  { regex: /from\s+['"]path['"]/g, replacement: "URL / import.meta.dir" },
  { regex: /from\s+['"]child_process['"]/g, replacement: "Bun.spawn()" },
  { regex: /from\s+['"]http['"]/g, replacement: "fetch() / Bun.serve()" },
  { regex: /from\s+['"]https['"]/g, replacement: "fetch() / Bun.serve()" },
  { regex: /from\s+['"]crypto['"]/g, replacement: "Bun.CryptoHasher / Web Crypto" },
  { regex: /from\s+['"]buffer['"]/g, replacement: "Buffer (global in Bun)" },
  { regex: /from\s+['"]stream['"]/g, replacement: "Web Streams API" },
  { regex: /from\s+['"]url['"]/g, replacement: "URL (global)" },
  { regex: /from\s+['"]os['"]/g, replacement: "Bun.env / navigator" },
  { regex: /from\s+['"]events['"]/g, replacement: "EventTarget / Effect Stream" },
  { regex: /from\s+['"]util['"]/g, replacement: "Not needed — Bun APIs are promise-based" },
  { regex: /from\s+['"]zlib['"]/g, replacement: "Bun.gzipSync / Bun.gunzipSync" },
  { regex: /from\s+['"]worker_threads['"]/g, replacement: "new Worker() (Bun Web Workers)" },
  { regex: /from\s+['"]assert['"]/g, replacement: "expect() from bun test" },

  // Node.js fs API
  { regex: /\bfs\.readFile/g, replacement: "Bun.file(path).text()" },
  { regex: /\bfs\.writeFile/g, replacement: "Bun.write(path, content)" },
  { regex: /\bfs\.existsSync\b/g, replacement: "Bun.file(path).exists()" },
  { regex: /\bfs\.mkdir/g, replacement: 'Bun.spawn(["mkdir", "-p", dir])' },
  { regex: /\bfs\.readdir/g, replacement: "new Bun.Glob(pattern).scan(dir)" },
  { regex: /\bfs\.stat/g, replacement: "Bun.file(path).size" },
  { regex: /\bfs\.unlink/g, replacement: 'Bun.spawn(["rm", path])' },
  { regex: /\bfs\.rmSync\b/g, replacement: 'Bun.spawn(["rm", path])' },
  { regex: /\bfs\.createReadStream\b/g, replacement: "Bun.file(path).stream()" },
  { regex: /\bfs\.createWriteStream\b/g, replacement: "Bun.write() or Bun.spawn pipe" },

  // Node.js path API
  { regex: /\bpath\.join\s*\(/g, replacement: "template literal or new URL()" },
  { regex: /\bpath\.resolve\s*\(/g, replacement: "import.meta.dir + relative" },
  { regex: /\bpath\.basename\s*\(/g, replacement: "str.split('/').pop()" },
  { regex: /\bpath\.dirname\s*\(/g, replacement: "new URL('.', import.meta.url).pathname" },
  { regex: /\bpath\.extname\s*\(/g, replacement: "str.split('.').pop()" },

  // Node.js child_process
  { regex: /\bexecSync\s*\(/g, replacement: "Bun.spawn()" },
  { regex: /\bexec\s*\(\s*['"`]/g, replacement: "Bun.spawn()" },

  // Node.js http
  { regex: /\bhttp\.createServer\b/g, replacement: "Bun.serve()" },

  // Node.js crypto
  { regex: /\bcrypto\.randomBytes\b/g, replacement: "crypto.getRandomValues()" },
  { regex: /\bcrypto\.createHash\b/g, replacement: "Bun.CryptoHasher" },

  // Node.js globals
  { regex: /\bprocess\.env\./g, replacement: "Bun.env." },
  { regex: /\bprocess\.cwd\s*\(\)/g, replacement: "import.meta.dir" },
  { regex: /\b__dirname\b/g, replacement: "import.meta.dir" },
  { regex: /\b__filename\b/g, replacement: "import.meta.file" },

  // Package manager references
  { regex: /\bnpm\s+(install|run|test|exec)\b/g, replacement: "bun" },
  { regex: /\bnpx\s+/g, replacement: "bunx " },
];

// --- Rule 2: Effect-native patterns ---

const EFFECT_NATIVE_RULES: PatternRule[] = [
  // Promise patterns
  { regex: /\bnew\s+Promise\s*\(/g, replacement: "Effect.tryPromise or Effect.promise" },
  { regex: /\.then\s*\(/g, replacement: "Effect.flatMap / Effect.map" },
  { regex: /\.catch\s*\(\s*(?:function|\(|err|e\b)/g, replacement: "Effect.catchAll" },
  { regex: /\bPromise\.all\s*\(/g, replacement: "Effect.all" },
  { regex: /\bPromise\.race\s*\(/g, replacement: "Effect.race" },
  { regex: /\bPromise\.allSettled\s*\(/g, replacement: "Effect.all with { mode: 'either' }" },

  // Async/await
  { regex: /\basync\s+function\b/g, replacement: "Effect.gen(function* () {})" },
  { regex: /\basync\s*\(/g, replacement: "Effect.gen(function* () {})" },

  // Error handling
  { regex: /\btry\s*\{/g, replacement: "Effect.catchAll / Effect.catchTag" },
  { regex: /\bthrow\s+new\s+Error\s*\(/g, replacement: "Effect.fail(new Error(...))" },
  { regex: /\bthrow\s+/g, replacement: "Effect.fail or Effect.die" },

  // Timers
  { regex: /\bsetTimeout\s*\(/g, replacement: "Effect.sleep + Effect.delay" },
  { regex: /\bsetInterval\s*\(/g, replacement: "Effect.repeat with Schedule" },

  // Console
  { regex: /\bconsole\.log\s*\(/g, replacement: "Console.log from effect" },
  { regex: /\bconsole\.error\s*\(/g, replacement: "Console.error from effect" },
  { regex: /\bconsole\.warn\s*\(/g, replacement: "Console.warn from effect" },

  // Process
  { regex: /\bprocess\.exit\s*\(/g, replacement: "Effect.die or Effect.fail" },

  // Raw fetch
  { regex: /(?<!\.)fetch\s*\(/g, replacement: "Effect.tryPromise wrapping fetch" },

  // JSON.parse unguarded
  { regex: /\bJSON\.parse\s*\(/g, replacement: "Effect.try(() => JSON.parse(...))" },

  // Error classes
  { regex: /\bclass\s+\w+\s+extends\s+Error\b/g, replacement: "Data.TaggedError from effect" },

  // Event patterns
  { regex: /\bEventEmitter\b/g, replacement: "Effect Stream or Queue" },
  { regex: /\.on\s*\(\s*['"`]\w+['"`]/g, replacement: "Effect Stream or Queue" },

  // Missing Effect import
  // (Checked separately since it's an absence, not a pattern match)
];

// --- Rule 3: Nesting depth ---

export function checkNestingDepth(content: string, maxDepth: number): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const lines = content.split("\n");
  let depth = 0;
  let maxFoundInScope = 0;
  let maxLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Reset at top-level function/const boundaries (new scope)
    if (/^(export\s+)?(const|function|class)\s/.test(line.trim())) {
      if (maxFoundInScope > maxDepth) {
        violations.push({
          rule: "nesting-depth",
          pattern: `Effect nesting depth ${maxFoundInScope} (max ${maxDepth})`,
          replacement: "Flatten with intermediate variables or helper Effects",
          line: maxLine,
          snippet: lines[maxLine - 1]?.trim() ?? "",
        });
      }
      depth = 0;
      maxFoundInScope = 0;
    }

    const opens = (line.match(/Effect\.gen\s*\(|Effect\.flatMap\s*\(/g) ?? []).length;
    const closes = (line.match(/\)\s*\)\s*$/g) ?? []).length;

    depth += opens;
    if (depth > maxFoundInScope) {
      maxFoundInScope = depth;
      maxLine = i + 1;
    }
    depth = Math.max(0, depth - closes);
  }

  // Check final scope
  if (maxFoundInScope > maxDepth) {
    violations.push({
      rule: "nesting-depth",
      pattern: `Effect nesting depth ${maxFoundInScope} (max ${maxDepth})`,
      replacement: "Flatten with intermediate variables or helper Effects",
      line: maxLine,
      snippet: lines[maxLine - 1]?.trim() ?? "",
    });
  }

  return violations;
}

// --- Context-aware exemption checking ---

function isExemptContext(
  _line: string,
  lineIndex: number,
  lines: string[],
): {
  bunOnly: boolean;
  effectNative: boolean;
} {
  // Inside Effect.tryPromise({ try: async () => ... }) — await is allowed
  const surroundingContext = lines.slice(Math.max(0, lineIndex - 5), lineIndex + 1).join("\n");
  const inTryPromise = /Effect\.tryPromise\s*\(\s*\{[\s\S]*?try\s*:/m.test(surroundingContext);

  // Inside Effect.sync(() => { ... }) — console is allowed
  const inEffectSync = /Effect\.sync\s*\(\s*\(\)\s*=>\s*\{/.test(surroundingContext);

  // Inside Effect.try(() => ...) or Effect.try({ try: () => ... }) — JSON.parse is allowed
  const inEffectTry = /Effect\.try\s*\(/.test(surroundingContext);

  return {
    bunOnly: false, // No bun-only exemptions in code context
    effectNative: inTryPromise || inEffectSync || inEffectTry,
  };
}

// --- Core enforcement ---

export function enforceRules(content: string, filePath: string): FileReport {
  const lines = content.split("\n");
  const violations: RuleViolation[] = [];
  const isTestFile = filePath.endsWith(".test.ts");

  // Check for Effect import (Rule 2)
  if (!isTestFile && !content.includes('from "effect"') && !content.includes("from 'effect'")) {
    violations.push({
      rule: "effect-native",
      pattern: "Missing Effect import",
      replacement: 'import { Effect, pipe } from "effect"',
      line: 1,
      snippet: lines[0]?.trim() ?? "",
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comments and import.meta.main guards
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
    if (trimmed.includes("import.meta.main")) continue;
    if (trimmed.startsWith("import ") || trimmed.startsWith("export ")) continue;

    // Skip process.argv (CLI arg parsing exemption)
    if (trimmed.includes("process.argv")) continue;

    const exemptions = isExemptContext(line, i, lines);

    // Rule 1: Bun-only
    for (const rule of BUN_ONLY_RULES) {
      rule.regex.lastIndex = 0;
      if (rule.regex.test(line)) {
        violations.push({
          rule: "bun-only",
          pattern: rule.regex.source,
          replacement: rule.replacement,
          line: i + 1,
          snippet: trimmed.slice(0, 80),
        });
      }
    }

    // Rule 2: Effect-native (skip test files entirely)
    if (!isTestFile && !exemptions.effectNative) {
      for (const rule of EFFECT_NATIVE_RULES) {
        rule.regex.lastIndex = 0;
        if (rule.regex.test(line)) {
          violations.push({
            rule: "effect-native",
            pattern: rule.regex.source,
            replacement: rule.replacement,
            line: i + 1,
            snippet: trimmed.slice(0, 80),
          });
        }
      }
    }
  }

  // Rule 3: Nesting depth
  violations.push(...checkNestingDepth(content, 3));

  return {
    filePath,
    passed: violations.length === 0,
    violations,
  };
}

// --- Scan all scripts ---

export async function enforceAllScripts(baseDir: string): Promise<EnforcementReport> {
  const glob = new Bun.Glob("**/*.ts");
  const files: FileReport[] = [];

  for await (const path of glob.scan({ cwd: baseDir, absolute: false })) {
    // Skip: node_modules, test files, hook scripts, self (contains regex patterns that match rules)
    if (path.includes("node_modules")) continue;
    // hooks/ directory is no longer exempt — all scripts follow the 3 rules
    if (path.endsWith(".test.ts")) continue;
    // These files contain regex patterns that match rule patterns (false positives)
    if (path === "enforce-rules.ts") continue;
    if (path === "validate-code-standards.ts") continue;
    if (path === "ci-validate.ts") continue;

    const fullPath = `${baseDir}/${path}`;
    const content = await Bun.file(fullPath).text();
    const report = enforceRules(content, path);
    files.push(report);
  }

  const totalViolations = files.reduce((sum, f) => sum + f.violations.length, 0);

  return {
    passed: totalViolations === 0,
    totalFiles: files.length,
    totalViolations,
    files,
  };
}

// --- CLI Entry ---

if (import.meta.main) {
  const program = Effect.gen(function* () {
    const args = Bun.argv.slice(2);
    const fileIdx = args.indexOf("--file");

    if (fileIdx >= 0 && args[fileIdx + 1]) {
      const filePath = args[fileIdx + 1];
      const content = yield* Effect.tryPromise({
        try: () => Bun.file(filePath).text(),
        catch: (e) => new Error(`Failed to read ${filePath}: ${e}`),
      });

      const report = enforceRules(content, filePath);
      yield* Console.log(JSON.stringify(report, null, 2));

      if (!report.passed) {
        yield* Effect.fail(new Error(`${report.violations.length} violations found`));
      }
    } else {
      const baseDir = `${import.meta.dir}`;
      const scriptsDir = baseDir;
      const report = yield* Effect.tryPromise({
        try: () => enforceAllScripts(scriptsDir),
        catch: (e) => new Error(`Scan failed: ${e}`),
      });

      for (const file of report.files) {
        if (file.violations.length > 0) {
          yield* Console.error(`\n${file.filePath}: ${file.violations.length} violations`);
          for (const v of file.violations) {
            yield* Console.error(`  L${v.line} [${v.rule}] ${v.pattern} → ${v.replacement}`);
          }
        }
      }

      yield* Console.log(
        `\n${report.totalFiles} files scanned, ${report.totalViolations} violations`,
      );

      if (!report.passed) {
        yield* Effect.fail(new Error("Rule enforcement failed"));
      }

      yield* Console.log("All rules passed.");
    }
  });

  pipe(
    program,
    Effect.catchAll((error) =>
      pipe(
        Console.error(`\n${error}`),
        Effect.flatMap(() => Effect.sync(() => { process.exitCode = 1; })),
      ),
    ),
    Effect.runPromise,
  );
}
