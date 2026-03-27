# one-of-a-kind-design

## Rules (ENFORCED via hooks — violations are BLOCKED, not warned)

1. **Bun-only** — No Node.js APIs. Use Bun.file(), Bun.write(), Bun.env, Bun.spawn(). No require(), no node: imports, no fs/path/child_process. No npm/npx/yarn/pnpm/deno.
2. **Effect-native** — No raw Promises, try/catch, async/await, throw, console.log. Use Effect.gen, Effect.tryPromise, Effect.catchAll, Console.log from effect. Exemptions: async inside Effect.tryPromise({ try: async () => }), console inside Effect.sync, JSON.parse inside Effect.try.
3. **Max nesting depth 3** — No more than 3 levels of Effect.gen/flatMap per function scope.

These rules are enforced at EVERY gate: PreToolUse (before write/edit), PostToolUse (after write/edit), Stop (agent review). There is no way to bypass them.

## Commands

| Command | What it does |
|---------|-------------|
| `bun run test` | Run tests (bun test) |
| `bun run build` | Typecheck (tsc --noEmit, zero errors) |
| `bun run lint` | Biome lint |
| `bun run enforce` | 3-rule enforcer (ZERO violations) |
| `bun run validate` | Full pipeline: build + lint + enforce + test |
| `bun run ci` | CI validation (Bun + Effect script) |
| `bun run check-keys` | Verify FAL_KEY, E2B_API_KEY, QUIVERAI_API_KEY |
| `bun run validate:full` | validate + check-keys |

ALWAYS run `bun run validate` before delivering ANY code. ALWAYS run `bun run check-keys` before API calls.

## Autonomous Workflow (MANDATORY — execute in order, skip nothing)

### 0. Enhance Message
Automatic via UserPromptSubmit hook. Extracts: output_type, industry, mood, audience, style, convention_breaking, quality_emphasis. Computes specificity (0-7). If specificity < 3: AskUserQuestion (1-3 questions, 2-4 options). See `.claude/skills/one-of-a-kind-design/references/MESSAGE-ENHANCEMENT-RULES.md`.

### 0c. UX Research
ALWAYS web-search UX best practices for the artifact type + industry BEFORE generating. Inject findings into context.

### 1. Resolve Style
Run `.claude/skills/one-of-a-kind-design/scripts/resolve-style.ts`. Reads `.claude/skills/one-of-a-kind-design/references/AUDIENCE-ROUTES.md`, `.claude/skills/one-of-a-kind-design/references/CONFLICT-MAP.md`, `.claude/skills/one-of-a-kind-design/references/CREATIVE-DIALS.md`. Returns full style config.

### 2. Conceive Hero Asset
Read `.claude/skills/one-of-a-kind-design/references/HERO-ASSET-ARCHETYPES.md`. Select archetype. Run `.claude/skills/one-of-a-kind-design/scripts/select-fal-models.ts` + `.claude/skills/one-of-a-kind-design/scripts/select-pipeline-models.ts`.

### 3. Craft Prompt + Generate + Verify
- **Route**: `.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt.ts` selects from 15 prompt-crafter subagents
- **Craft**: Invoke subagent. It outputs EXACTLY one prompt, zero commentary
- **Generate**: Execute via `.claude/skills/one-of-a-kind-design/scripts/run-fal-generation.ts` or `.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-generation.ts`
- **Verify**: `.claude/skills/one-of-a-kind-design/scripts/validate-prompt-artifact-alignment.ts` — <5.0 AUTO-REGENERATE, 5.0-6.9 FLAG, >=7.0 PASS
- **Enhance**: Background removal, upscaling, depth, vectorization as needed

### 4. One-Shot Generation
Generate COMPLETE artifact in single pass using resolved style tokens, UX findings, hero asset, premium patterns, motion. NEVER Lorem Ipsum. NEVER Acme Corp.

### 5. Quality Evaluation (MANDATORY — HARD STOP below 7.0)
Run ALL validators then `.claude/skills/one-of-a-kind-design/scripts/score-output-quality.ts`. 9 sub-scores, weighted composite. Minimum 7.0/10. Display score card. If below: identify lowest dimension, fix, re-score.

### 6-10. Annotate + Refine + Optimize
Screenshot annotate (`.claude/skills/one-of-a-kind-design/scripts/run-screenshot-annotation.ts`), refine from findings, optimize assets (`.claude/skills/one-of-a-kind-design/scripts/optimize-assets.ts`).

### 11. Export
On request: identify tool from `.claude/skills/one-of-a-kind-design/references/EXTERNAL-TOOLS-REGISTRY.md`, run `.claude/skills/one-of-a-kind-design/scripts/generate-tool-export.ts` to produce .zip.

## Anti-Slop (HARD RULES — see .claude/skills/one-of-a-kind-design/references/ANTI-SLOP.md for full list)

1. NO Inter/Roboto/Open Sans — use style-specific typography
2. NO purple-to-blue gradients — derive from style's color_palette_type
3. NO Tailwind default shadows — use style's shadow_model
4. NO hero/features/testimonials/CTA skeleton — restructure per style
5. NO linear easing — spring physics or style-appropriate curves
6. NO #000000 body text — use off-black (#111, #1a1a1a, #2F3437)
7. NO Lorem Ipsum / Acme Corp — realistic content
8. NO "Elevate/Seamless/Unleash" — specific, human copy
9. NO identical card grids — vary sizes for hierarchy
10. NO simultaneous element mount — stagger 80ms per index

## Subagents

15 prompt-crafters in `.claude/agents/prompt-crafter-*.md` (model: haiku, tools: Read). Each outputs EXACTLY one prompt — zero markdown, zero commentary. System prompts: `.claude/skills/one-of-a-kind-design/references/FAL-PROMPT-SYSTEMS.md`.

3 quality agents: `quality-assessor.md` (composite scoring), `style-guard.md` (taxonomy compliance), `ux-reviewer.md` (UX best practices).

1 export agent: `export-guide-writer.md` (tool-specific import guides).

## Environment

Three API keys required in `.env`: FAL_KEY (fal.ai), E2B_API_KEY (E2B sandboxes), QUIVERAI_API_KEY (QuiverAI SVG).

Patterns: `.claude/skills/one-of-a-kind-design/references/FAL-API-PATTERNS.md`, `.claude/skills/one-of-a-kind-design/references/QUIVER-API-PATTERNS.md`, `.claude/skills/one-of-a-kind-design/references/E2B-PATTERNS.md`.

## Structure

| Directory | Contents |
|-----------|----------|
| `.claude/skills/one-of-a-kind-design/` | Skill definition (SKILL.md) + all supporting files |
| `.claude/skills/one-of-a-kind-design/scripts/` | 28+ Bun + Effect TypeScript scripts |
| `.claude/skills/one-of-a-kind-design/scripts/hooks/` | 5 hook handler scripts |
| `.claude/skills/one-of-a-kind-design/references/` | 29 reference documents from taxonomy |
| `.claude/skills/one-of-a-kind-design/assets/` | 66 Tailwind presets, 7 motion presets, 66 Figma tokens |
| `.claude/skills/one-of-a-kind-design/custom-tools/` | User-registered external tool YAML files |
| `.claude/agents/` | 19 subagent definitions |
| `.claude/rules/` | Conditional instruction files |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| fal.ai timeout | Increase to 5min. Check fal.ai/dashboard |
| QuiverAI 401 | Verify QUIVERAI_API_KEY |
| E2B sandbox fails | Check E2B_API_KEY, verify quota |
| Alignment < 5.0 after 3 retries | Escalate to higher-tier model |
| Composite < 7.0 | Fix lowest sub-score first |
| Style conflict | Check `.claude/skills/one-of-a-kind-design/references/CONFLICT-MAP.md` |
