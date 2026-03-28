# one-of-a-kind-design

A Claude Code skill that generates unique websites, web apps, mobile screens, images, SVGs, and video. It combines a 66-style visual taxonomy, 184 AI models (fal.ai + QuiverAI), 15 prompt-crafter subagents, anti-slop guardrails, and quality scoring into an autonomous design pipeline.

## What it does

Give it a design brief ("luxury hotel landing page", "art-deco SVG logo", "cyberpunk mobile app") and it will:

1. **Resolve a visual style** from a taxonomy of 66 styles (Art Deco, Brutalist Web, Vaporwave, Solarpunk, etc.)
2. **Research UX best practices** for your artifact type and industry
3. **Conceive a hero asset** using one of 7 archetypes (Panning Scene, Parallax Depth, 3D Showcase, SVG Vector, etc.)
4. **Craft an optimized prompt** via a specialized subagent (never passes raw user words to APIs)
5. **Generate via AI** using 184 models across fal.ai (generation, pipeline, enhancement) and QuiverAI (SVG)
6. **Validate alignment** between what was requested and what was produced (auto-regenerates if < 5.0/10)
7. **Score quality** across 9 dimensions (anti-slop, aesthetics, style fidelity, distinctiveness, etc.) with a hard minimum of 7.0/10
8. **Export** for 50+ external tools (Figma, Runway, Midjourney, ComfyUI, After Effects, etc.)

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- API keys for:
  - [fal.ai](https://fal.ai) — image and video generation
  - [E2B](https://e2b.dev) — sandboxed code execution
  - [QuiverAI](https://quiverai.com) — SVG generation

## Install

```bash
bunx skills add srinitude/one-of-a-kind-design-skill
```

Or clone manually:

```bash
git clone https://github.com/srinitude/one-of-a-kind-design-skill.git
cd one-of-a-kind-design-skill
bun install
```

Configure API keys in `.env`:

```
FAL_KEY=your-fal-ai-key
E2B_API_KEY=your-e2b-key
QUIVERAI_API_KEY=your-quiverai-key
```

Validate the setup:

```bash
bun run validate:full
```

Then ask it to design something:
- "Design a landing page for a sustainable fashion brand"
- "Create an art-deco SVG logo for a jazz bar"
- "Build a mobile app screen for a meditation app in glassmorphism style"

## Importing into another project

This skill is designed to be portable. To add it to an existing Claude Code project:

### 1. Copy the skill files

```bash
# From the target project root
cp -r /path/to/one-of-a-kind-design-skill/.claude/skills/one-of-a-kind-design \
      .claude/skills/one-of-a-kind-design

cp -r /path/to/one-of-a-kind-design-skill/.claude/agents \
      .claude/agents

cp -r /path/to/one-of-a-kind-design-skill/.claude/rules \
      .claude/rules
```

### 2. Install dependencies

Add the required dependencies to your project:

```bash
bun add effect @effect/platform @fal-ai/client @quiverai/sdk @e2b/code-interpreter yaml archiver
bun add -d @types/bun @types/archiver @biomejs/biome typescript
```

### 3. Add scripts to your package.json

```json
{
  "scripts": {
    "enforce": "bun run .claude/skills/one-of-a-kind-design/scripts/enforce-rules.ts",
    "check-keys": "bun run .claude/skills/one-of-a-kind-design/scripts/check-api-keys.ts"
  }
}
```

### 4. Configure API keys

Create a `.env` file with:

```
FAL_KEY=your-fal-ai-key
E2B_API_KEY=your-e2b-key
QUIVERAI_API_KEY=your-quiverai-key
```

### 5. Merge CLAUDE.md

Append the rules from this project's `CLAUDE.md` to your existing `CLAUDE.md`, or copy it if you don't have one:

```bash
cp /path/to/one-of-a-kind-design-skill/CLAUDE.md ./CLAUDE.md
```

### 6. Merge settings

The skill defines hooks in `.claude/settings.json`. Merge the `hooks` object from this project's settings into your own. The skill's `SKILL.md` frontmatter also declares hooks using `${CLAUDE_SKILL_DIR}` for portability -- these are resolved automatically by Claude Code when the skill is loaded.

### 7. Verify

```bash
bun run check-keys    # API keys valid
bun run enforce       # Code rules pass
claude                # Start Claude Code and test with a design prompt
```

## Project structure

```
.
├── CLAUDE.md                              # Project rules (enforced via hooks)
├── package.json                           # Bun project config
├── biome.json                             # Linter/formatter config
├── tsconfig.json                          # TypeScript config
├── .env                                   # API keys (not committed)
│
└── .claude/
    ├── settings.json                      # Hooks, permissions, sandbox config
    │
    ├── skills/one-of-a-kind-design/
    │   ├── SKILL.md                       # Skill definition + hook declarations
    │   ├── visual-styles-taxonomy.yaml    # 66 complete visual style definitions
    │   │
    │   ├── scripts/                       # 38 TypeScript pipeline scripts
    │   │   ├── resolve-style.ts           # Intent → style config
    │   │   ├── select-fal-models.ts       # Style → fal.ai model selection
    │   │   ├── generate-api-prompt.ts     # Route → subagent + API
    │   │   ├── run-fal-generation.ts      # fal.ai execution
    │   │   ├── run-quiver-svg-generation.ts
    │   │   ├── validate-prompt-artifact-alignment.ts
    │   │   ├── score-output-quality.ts    # 9-dimension quality scoring
    │   │   ├── optimize-assets.ts
    │   │   ├── generate-tool-export.ts    # Export .zip for external tools
    │   │   └── hooks/                     # 7 hook handler scripts
    │   │
    │   ├── references/                    # 28 reference documents
    │   │   ├── STYLE-INDEX.md             # Index of all 66 styles
    │   │   ├── ANTI-SLOP.md              # 10 banned generic patterns
    │   │   ├── MODEL-REGISTRY-FAL.md     # 48 image + 45 video models
    │   │   ├── PIPELINE-MODELS.md        # 89 utility/enhancement models
    │   │   ├── EXTERNAL-TOOLS-REGISTRY.md # 50+ export targets
    │   │   └── ...
    │   │
    │   ├── assets/
    │   │   ├── tailwind-presets/          # 66 style-specific CSS presets
    │   │   ├── motion-presets/           # 7 motion configurations
    │   │   └── figma-token-sets/         # 66 Figma token JSON files
    │   │
    │   └── custom-tools/                 # User-registered external tool configs
    │
    ├── agents/                           # 19 subagent definitions
    │   ├── prompt-crafter-image-gen.md   # 15 prompt crafters (one per job type)
    │   ├── prompt-crafter-video-gen.md
    │   ├── prompt-crafter-svg-gen.md
    │   ├── quality-assessor.md           # Composite scoring
    │   ├── style-guard.md                # Taxonomy compliance
    │   ├── ux-reviewer.md                # UX best practices
    │   └── export-guide-writer.md        # Tool-specific import guides
    │
    └── rules/                            # 4 enforcement rule documents
        ├── bun-effect-patterns.md        # Bun-only + Effect-native rules
        ├── quality-scoring.md            # 9 sub-scores, weights, thresholds
        ├── design-generation.md          # Hero archetypes, routing tables
        └── api-integration.md            # fal.ai, QuiverAI, E2B patterns
```

## Commands

| Command | Description |
|---------|-------------|
| `bun run build` | Typecheck (`tsc --noEmit`) |
| `bun run lint` | Biome lint |
| `bun run test` | Run tests |
| `bun run enforce` | Verify 3-rule compliance (Bun-only, Effect-native, max nesting 3) |
| `bun run validate` | Full pipeline: build + lint + enforce + test |
| `bun run check-keys` | Verify API keys are set and valid |
| `bun run validate:full` | validate + check-keys |
| `bun run ci` | CI validation script |

## Architecture

### Autonomous workflow

Every design request follows a 12-step pipeline:

```
User prompt
  → Step 0: Enhance message (extract 7 dimensions, compute specificity)
  → Step 0c: UX research (web-search best practices)
  → Step 1: Resolve style (map intent → 1 of 66 styles)
  → Step 2: Conceive hero asset (select from 7 archetypes)
  → Step 3: Craft prompt → Generate → Verify alignment
  → Step 4: One-shot generation (complete artifact in single pass)
  → Step 5: Quality evaluation (9 sub-scores, composite >= 7.0)
  → Steps 6-10: Annotate → Refine → Optimize
  → Step 11: Export for external tools
```

### Code rules (enforced via hooks)

1. **Bun-only** -- no Node.js APIs (`require()`, `fs`, `path`, `process.env`)
2. **Effect-native** -- no raw Promises, try/catch, async/await, throw, console.log
3. **Max nesting depth 3** -- no more than 3 levels of `Effect.gen`/`flatMap` per function

These are enforced at every gate: PreToolUse (before write), PostToolUse (after write), Stop (final review). Violations are blocked, not warned.

### Quality scoring

Every output is scored across 9 weighted dimensions:

| Dimension | Weight |
|-----------|--------|
| Anti-slop gate | 0.15 |
| Prompt-artifact alignment | 0.15 |
| Aesthetic quality | 0.13 |
| Style fidelity | 0.13 |
| Distinctiveness | 0.13 |
| Asset quality | 0.12 |
| Code standards | 0.08 |
| Hierarchy | 0.06 |
| Color harmony | 0.05 |

Composite score must be >= 7.0/10 to deliver. Below that is a hard stop.

### Anti-slop rules

10 hard rules prevent generic AI output:

1. No Inter/Roboto/Open Sans -- use style-specific typography
2. No purple-to-blue gradients -- derive from style palette
3. No Tailwind default shadows -- use style's shadow model
4. No hero/features/testimonials/CTA skeleton -- restructure per style
5. No linear easing -- spring physics or style-appropriate curves
6. No `#000000` body text -- use off-black (`#111`, `#1a1a1a`, `#2F3437`)
7. No Lorem Ipsum / Acme Corp -- realistic content
8. No "Elevate/Seamless/Unleash" -- specific, human copy
9. No identical card grids -- vary sizes for hierarchy
10. No simultaneous element mount -- stagger 80ms per index

## Troubleshooting

| Issue | Fix |
|-------|-----|
| fal.ai timeout | Increase timeout to 5 min. Check [fal.ai dashboard](https://fal.ai/dashboard) |
| QuiverAI 401 | Verify `QUIVERAI_API_KEY`. Regenerate at quiverai.com |
| E2B sandbox fails | Check `E2B_API_KEY`. Verify quota at [e2b.dev/dashboard](https://e2b.dev/dashboard) |
| Alignment < 5.0 after 3 retries | Escalate to higher-tier model |
| Composite < 7.0 | Fix lowest sub-score first, then re-score |
| Style conflict | Check `references/CONFLICT-MAP.md` for hard vs soft conflicts |

## License

[MIT](LICENSE)
