# HOOKS-CONFIG.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete hook configuration documentation for the one-of-a-kind-design skill. Hooks are lifecycle events that intercept tool calls and agent actions at specific points, enabling automatic message enhancement, code validation, quality assessment, and runtime enforcement. Hooks execute externally to the conversation -- the harness invokes them, not Claude.

---

## Hook Overview

| Hook | Event | Script | Timeout | Purpose |
|------|-------|--------|---------|---------|
| UserPromptSubmit | Before user message is processed | `enhance-message.ts` | 5s | Enhance user messages with taxonomy context, detect style keywords |
| PreToolUse (Bash) | Before Bash tool executes | `enforce-bash-safety.ts` | 5s | Block Node.js runtimes, destructive commands, dangerous git ops, code injection |
| PreToolUse (Write) | Before Write tool executes | `enforce-rules-pre-write.ts` | 10s | Validate content against 3 rules before write |
| PreToolUse (Edit) | Before Edit tool executes | `enforce-rules-pre-edit.ts` | 10s | Validate new_string against 3 rules before edit |
| PreToolUse (Read) | Before Read tool executes | `enforce-safe-read.ts` | 5s | Block .env file reads (credential protection) |
| PostToolUse (Write/Edit) | After Write/Edit completes | `enforce-rules-post-write.ts` | 15s | Full-file rule validation after save (exit 2 on violation) |
| PostToolUse (Bash) | After Bash completes | inline | 3s | Detect non-Bun lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml) |
| Stop | Before final response | quality-assessor agent | 60s | Composite quality scoring, HARD STOP if below 7.0 |

> **Note:** With `bypassPermissions` mode, PreToolUse hooks are the sole safety layer. The `PermissionRequest` hook was removed (dead code in bypass mode). All safety rules from the former allow/deny lists are enforced via `enforce-bash-safety.ts` and `enforce-safe-read.ts`.

---

## Hook 1: UserPromptSubmit -- enhance-message.ts

**Event:** `UserPromptSubmit` -- fires before the user's message is processed by the agent.

**Timeout:** <50ms (must be deterministic, no API calls)

**Script:** `enhance-message.ts`

### Behavior

1. **Style Keyword Detection:** Scan the user message for taxonomy style names (all 66 styles) and set the active style context.
2. **Tool Keyword Detection:** Scan for external tool trigger keywords (from EXTERNAL-TOOLS-REGISTRY.md and custom tools) and flag suggested tools.
3. **Abbreviation Expansion:** Expand common shorthand:
   - "bg" -> "background"
   - "img" -> "image"
   - "gen" -> "generate"
   - "vid" -> "video"
   - "ctrl" -> "control"
4. **Context Injection:** If a style is detected, inject the resolved style's palette, typography, and motion signature as context metadata.
5. **Passthrough:** If no enhancements apply, return the message unchanged with zero latency cost.

### Implementation

```typescript
// hooks/enhance-message.ts
import { TAXONOMY_STYLES } from "../data/style-names";
import { TOOL_KEYWORDS } from "../data/tool-keywords";

interface EnhancedMessage {
  text: string;
  metadata: {
    detectedStyle?: string;
    suggestedTools?: string[];
    enhanced: boolean;
  };
}

export function enhanceMessage(raw: string): EnhancedMessage {
  const lower = raw.toLowerCase();
  let text = raw;
  const metadata: EnhancedMessage["metadata"] = { enhanced: false };

  // Style detection (exact match on taxonomy style slugs)
  for (const style of TAXONOMY_STYLES) {
    if (lower.includes(style.slug) || lower.includes(style.name.toLowerCase())) {
      metadata.detectedStyle = style.slug;
      metadata.enhanced = true;
      break;
    }
  }

  // Tool keyword detection
  const suggestedTools: string[] = [];
  for (const [toolId, keywords] of Object.entries(TOOL_KEYWORDS)) {
    if (keywords.some((kw: string) => lower.includes(kw))) {
      suggestedTools.push(toolId);
    }
  }
  if (suggestedTools.length > 0) {
    metadata.suggestedTools = suggestedTools;
    metadata.enhanced = true;
  }

  // Abbreviation expansion (only in natural language context, not code)
  const abbreviations: Record<string, string> = {
    " bg ": " background ",
    " img ": " image ",
    " gen ": " generate ",
    " vid ": " video ",
    " ctrl ": " control ",
  };
  for (const [abbr, full] of Object.entries(abbreviations)) {
    if (lower.includes(abbr)) {
      text = text.replace(new RegExp(abbr, "gi"), full);
      metadata.enhanced = true;
    }
  }

  return { text, metadata };
}
```

### Rules
- MUST complete in <50ms. No network calls, no file I/O beyond in-memory data.
- MUST be deterministic: same input always produces same output.
- MUST NOT modify the user's intent, only enrich with context.
- MUST NOT block or reject any message.

---

## Hook 2: PostToolUse -- validate-code-standards.ts

**Event:** `PostToolUse` -- fires after the Write or Edit tool completes on a source file.

**Timeout:** 15s

**Script:** `validate-code-standards.ts`

**Triggers on:** Write tool, Edit tool (when operating on `.ts`, `.tsx`, `.css`, `.svg` files)

### Behavior

1. **Bun Compliance:** Verify no `node:` built-in imports that are not Bun-compatible. Flag `require()` calls.
2. **Effect Pattern Compliance:** For `.ts` files in the `src/` directory, verify:
   - Error types extend `Data.TaggedError`
   - Service interfaces use `Context.Tag`
   - No raw `throw` statements (must use `Effect.fail`)
   - No untyped `catch` blocks (must use `Effect.catchAll` or `Effect.catchTag`)
3. **Import Hygiene:** Verify no circular imports, no `* as` namespace imports, no default exports from barrel files.
4. **SVG Compliance:** For `.svg` files, verify:
   - Has `viewBox` attribute
   - No fixed `width`/`height` without `viewBox`
   - No inline `style` attributes (must use class or presentation attributes)
5. **CSS/Tailwind Compliance:** For `.css` files, verify no `!important` except in utility overrides.

### Implementation

```typescript
// hooks/validate-code-standards.ts

interface ValidationResult {
  passed: boolean;
  violations: Array<{
    rule: string;
    severity: "error" | "warning";
    message: string;
    line?: number;
  }>;
}

export function validateCodeStandards(
  filePath: string,
  content: string,
): ValidationResult {
  const violations: ValidationResult["violations"] = [];

  const ext = filePath.split(".").pop();

  if (ext === "ts" || ext === "tsx") {
    validateTypeScript(content, violations);
  }

  if (ext === "svg") {
    validateSvg(content, violations);
  }

  if (ext === "css") {
    validateCss(content, violations);
  }

  return {
    passed: violations.filter((v) => v.severity === "error").length === 0,
    violations,
  };
}

function validateTypeScript(
  content: string,
  violations: ValidationResult["violations"],
) {
  // Bun compliance
  if (content.includes("require(")) {
    violations.push({
      rule: "bun-compliance",
      severity: "error",
      message: "Use ESM import instead of require()",
    });
  }

  // Effect pattern compliance
  if (/\bthrow\b/.test(content) && !content.includes("// throw-ok")) {
    violations.push({
      rule: "effect-no-throw",
      severity: "error",
      message: "Use Effect.fail() instead of throw. Add // throw-ok comment if intentional.",
    });
  }

  if (/catch\s*\(/.test(content) && !content.includes("Effect.catchAll") && !content.includes("Effect.catchTag")) {
    violations.push({
      rule: "effect-typed-catch",
      severity: "warning",
      message: "Prefer Effect.catchAll or Effect.catchTag over try/catch blocks.",
    });
  }

  // Import hygiene
  if (/import \* as/.test(content)) {
    violations.push({
      rule: "no-namespace-import",
      severity: "warning",
      message: "Avoid namespace imports (import * as). Use named imports.",
    });
  }
}

function validateSvg(
  content: string,
  violations: ValidationResult["violations"],
) {
  if (!content.includes("viewBox")) {
    violations.push({
      rule: "svg-viewbox",
      severity: "error",
      message: "SVG must have a viewBox attribute for responsive scaling.",
    });
  }

  if (/style="/.test(content)) {
    violations.push({
      rule: "svg-no-inline-style",
      severity: "warning",
      message: "Prefer class or presentation attributes over inline style in SVG.",
    });
  }
}

function validateCss(
  content: string,
  violations: ValidationResult["violations"],
) {
  const importantCount = (content.match(/!important/g) || []).length;
  if (importantCount > 2) {
    violations.push({
      rule: "css-no-important",
      severity: "warning",
      message: `Found ${importantCount} !important declarations. Minimize usage.`,
    });
  }
}
```

### Rules
- MUST complete in <15s.
- Errors (severity "error") block the tool action and require correction.
- Warnings (severity "warning") are logged but do not block.
- Only triggers on source files, not on generated assets or data files.

---

## Hook 3: Stop -- quality-assessor agent

**Event:** `Stop` -- fires before the agent sends its final response to the user.

**Timeout:** 60s

**Agent:** quality-assessor (dedicated subagent for composite scoring)

### Behavior

1. **Collect Artifacts:** Gather all generated artifacts from the current session (images, videos, SVGs, code, audio).
2. **Score Each Sub-Dimension:** Evaluate all 9 sub-scores:
   - anti_slop_gate (0.15)
   - code_standards_gate (0.08)
   - asset_quality_avg (0.12)
   - prompt_artifact_align (0.15)
   - aesthetic (0.13)
   - style_fidelity (0.13)
   - distinctiveness (0.13)
   - hierarchy (0.06)
   - color_harmony (0.05)
3. **Compute Composite:** Weighted sum of all sub-scores.
4. **Threshold Check:** If composite >= 7.0, PASS. Include score card in response.
5. **HARD STOP:** If composite < 7.0, DO NOT send the response. Instead:
   - Log all sub-scores
   - Identify the lowest-scoring dimensions
   - Trigger automatic regeneration of the weakest artifacts
   - Re-score after regeneration
   - Repeat until composite >= 7.0 or max 3 regeneration attempts

### HARD STOP Protocol

```
IF composite < 7.0:
  1. Identify sub-scores below 6.0
  2. For each failing sub-score:
     - If asset_quality_avg or prompt_artifact_align: regenerate the weakest asset
     - If style_fidelity or aesthetic: re-run style transfer or regenerate with adjusted prompt
     - If anti_slop_gate: regenerate with strengthened anti-slop suffix
     - If code_standards_gate: re-run validation and auto-fix
     - If distinctiveness: regenerate with higher variance parameters
  3. Re-score all artifacts
  4. If composite >= 7.0: PASS, include score card
  5. If composite < 7.0 after 3 attempts: PASS with warning, include score card with advisory
```

### Score Card Format

```
============================================
 QUALITY SCORE CARD
============================================
 Composite:                  7.8 / 10  PASS
--------------------------------------------
 Anti-Slop Gate       (0.15) 8.0
 Code Standards Gate  (0.08) 9.0
 Asset Quality Avg    (0.12) 7.5
 Prompt-Artifact Align(0.15) 8.0
 Aesthetic            (0.13) 7.5
 Style Fidelity       (0.13) 8.0
 Distinctiveness      (0.13) 7.0
 Hierarchy            (0.06) 8.0
 Color Harmony        (0.05) 7.5
============================================
```

### Rules
- MUST complete within 60s including any regeneration attempts.
- MUST NOT suppress the response indefinitely -- after 3 regeneration attempts, pass with warning.
- MUST always include the score card in the final response.
- Score card is appended to the response, not replacing it.

---

## Hook 4: PreToolUse -- Bash Safety Gate

**Event:** `PreToolUse` -- fires before the Bash tool executes a command.

**Script:** `enforce-bash-safety.ts`

**Timeout:** 5s

### Behavior

Comprehensive safety gate with 4 categories of blocked patterns:

| Category | Patterns | Reason |
|----------|----------|--------|
| Runtime | node, npm, npx, yarn, pnpm, deno, tsx, ts-node | Bun-only project |
| Destructive | sudo, su, rm -r /, rm -r ., rm -r ~, chmod 777, chown | System safety |
| Git danger | git push --force/-f, git reset --hard, git clean -fd, git branch -D | History safety |
| Injection | curl\|bash, curl\|sh, wget\|bash, wget\|sh, eval | Code injection |

### Implementation

```typescript
// hooks/bun-enforcement.ts

interface PreToolUseResult {
  allowed: boolean;
  reason?: string;
  suggestion?: string;
}

export function enforceBunRuntime(command: string): PreToolUseResult {
  const trimmed = command.trim();

  // Extract the primary executable (first word, ignoring env vars and prefixes)
  const parts = trimmed.split(/\s+/);
  let executable = parts[0];

  // Skip environment variable assignments
  let i = 0;
  while (i < parts.length && parts[i].includes("=")) {
    i++;
  }
  if (i < parts.length) {
    executable = parts[i];
  }

  // Block node
  if (executable === "node" || executable.endsWith("/node")) {
    return {
      allowed: false,
      reason: "node is not allowed. This skill uses Bun exclusively.",
      suggestion: trimmed.replace(/\bnode\b/, "bun"),
    };
  }

  // Block npm
  if (executable === "npm" || executable.endsWith("/npm")) {
    return {
      allowed: false,
      reason: "npm is not allowed. This skill uses Bun exclusively.",
      suggestion: trimmed.replace(/\bnpm\b/, "bun"),
    };
  }

  // Block npx
  if (executable === "npx" || executable.endsWith("/npx")) {
    return {
      allowed: false,
      reason: "npx is not allowed. This skill uses Bun exclusively.",
      suggestion: trimmed.replace(/\bnpx\b/, "bunx"),
    };
  }

  // Also block within piped commands
  if (/\|\s*(node|npm|npx)\b/.test(trimmed)) {
    return {
      allowed: false,
      reason: "node/npm/npx found in piped command. Use bun/bunx equivalents.",
      suggestion: trimmed
        .replace(/\bnode\b/g, "bun")
        .replace(/\bnpm\b/g, "bun")
        .replace(/\bnpx\b/g, "bunx"),
    };
  }

  return { allowed: true };
}
```

### Mapping

| Blocked | Replacement |
|---------|-------------|
| `node script.ts` | `bun script.ts` |
| `npm install` | `bun install` |
| `npm run build` | `bun run build` |
| `npm test` | `bun test` |
| `npx svgo` | `bunx svgo` |
| `npx tsc` | `bunx tsc` |

### Rules
- MUST complete in <10ms. Pure string matching, no I/O.
- MUST block the command and provide a Bun equivalent suggestion.
- MUST NOT block commands where node/npm/npx appears as an argument rather than executable (e.g., `echo "use npm"` is allowed).

---

## Template settings.json

Complete settings.json configuration with all 4 hooks:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bun run ./hooks/enhance-message.ts"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run ./hooks/bun-enforcement.ts"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bun run ./hooks/validate-code-standards.ts",
            "timeout": 15000
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bun run ./hooks/quality-assessor.ts",
            "timeout": 60000
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(bun *)",
      "Bash(bunx *)",
      "Bash(git *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Bash(node *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(rm -rf /)",
      "Bash(sudo *)"
    ]
  },
  "env": {
    "FAL_KEY": "${FAL_KEY}",
    "QUIVERAI_API_KEY": "${QUIVERAI_API_KEY}",
    "E2B_API_KEY": "${E2B_API_KEY}"
  }
}
```

---

## Hook Execution Order

For a typical user interaction, hooks fire in this sequence:

```
1. User submits message
   -> UserPromptSubmit: enhance-message.ts (<50ms)
   -> Enhanced message enters agent processing

2. Agent decides to run a shell command
   -> PreToolUse (Bash): bun-enforcement.ts (<10ms)
   -> Bash command executes (if allowed)

3. Agent writes/edits a file
   -> Write/Edit tool executes
   -> PostToolUse: validate-code-standards.ts (<15s)
   -> If violations: agent sees errors and self-corrects

4. Agent prepares final response
   -> Stop: quality-assessor agent (<60s)
   -> If composite < 7.0: HARD STOP, regenerate
   -> Score card appended to response
   -> Response delivered to user
```
