# one-of-a-kind-design

An agent skill that generates unique, high-quality websites, apps, images, SVGs, and videos. Deterministic pipeline, every time. Works in any coding agent.

Built on [Mastra](https://mastra.ai) for typed workflows, streaming, time-travel debugging, and persistence. Follows the [agentskills.io](https://agentskills.io) specification.

## What it does

Describe what you want. The skill handles the rest.

```
"Design a website for my omakase restaurant in Brooklyn. No food photos."
```

The pipeline:

1. **Parses your intent** — extracts output type, industry, mood, audience, specificity
2. **Resolves a visual style** from a taxonomy of 66 styles (wabi-sabi, art deco, brutalist, glitch, etc.)
3. **Applies creative dials** — design variance, motion intensity, visual density, audience formality
4. **Selects convention breaks** — deterministic subversion of design dogma based on variance level
5. **Crafts an optimized prompt** via a Mastra agent (never passes raw user words to generation APIs)
6. **Generates via fal.ai** — text-to-image, image-to-image, image-to-video (Seedance 2.0), text-to-video
7. **Post-processes in E2B** — sandbox execution for format conversion, optimization, compositing
8. **Verifies with 4 layers** — pixelmatch (pixel diff), SSIM (structural), pHash (perceptual), uniqueness check
9. **Scores quality** via LLaVA 13B vision model — real measured scores, not simulated
10. **Gates at 7.0/10** — below that, auto-retries with seed bump and time-travel back to prompt crafting

Same inputs produce the same creative decisions every time. The pixels change, the taste doesn't.

## Supported coding agents

This skill works in any agent that reads the [agentskills.io](https://agentskills.io) specification:

| Agent | Skill Path |
|---|---|
| Claude Code | `.claude/skills/one-of-a-kind-design/` |
| Cursor | `.cursor/skills/one-of-a-kind-design/` |
| GitHub Copilot | `.github/skills/one-of-a-kind-design/` |
| OpenAI Codex | `.codex/skills/one-of-a-kind-design/` |
| Gemini CLI | `.gemini/skills/one-of-a-kind-design/` |
| Windsurf | `.windsurf/skills/one-of-a-kind-design/` |
| Augment | `.augment/skills/one-of-a-kind-design/` |
| OpenCode | `.opencode/skills/one-of-a-kind-design/` |
| Antigravity | `.agent/skills/one-of-a-kind-design/` |
| Cross-platform | `.agents/skills/one-of-a-kind-design/` |

All paths are symlinks to the canonical `.claude/skills/one-of-a-kind-design/` directory.

## Install

```bash
npx skills add srinitude/one-of-a-kind-design-skill
```

Or clone manually:

```bash
git clone https://github.com/srinitude/one-of-a-kind-design-skill.git
cd one-of-a-kind-design-skill
bun install
```

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- API keys (in `.env` at project root):

```
FAL_KEY=your-fal-ai-key
E2B_API_KEY=your-e2b-key
QUIVERAI_API_KEY=your-quiverai-key
```

Get keys from: [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys), [e2b.dev/dashboard](https://e2b.dev/dashboard), [app.quiver.ai](https://app.quiver.ai)

## Two execution modes

### Interactive (coding agent)

Type a request in your coding agent. The Mastra workflow streams progress, suspends at quality gates for your feedback, and supports "try again" via time-travel.

```
> "Design a portfolio site for an architecture firm that builds with reclaimed materials"
```

The agent runs `bun run scripts/mastra/modes/interactive.ts` with your request and streams each pipeline step.

### Headless (CI/CD)

Fully autonomous. No suspend, no human input. Auto-retries via time-travel on failure. Exit code 0 for success, 1 for failure.

```bash
bun run scripts/mastra/modes/ci.ts '{"userIntent":"album cover for a jazz trio","outputType":"image"}'
```

## Output types

| Type | Generation chain | Models |
|---|---|---|
| Website | t2i → E2B → website build | Flux Pro 1.1 |
| Web App | t2i → E2B → app build | Flux Pro 1.1 |
| Image | t2i (or t2i → i2i for style transfer) | Flux Pro, Recraft V3 |
| SVG | QuiverAI Arrow (or Recraft V3 vector) | QuiverAI, Recraft |
| Video | t2i → i2v (or t2v direct) | Seedance 2.0, WAN T2V |
| Mobile App | t2i → E2B → phone frame | Flux Pro 1.1 |
| Style Transfer | i2i with reference | Flux Dev I2I |

## Architecture

### Mastra workflow pipeline

```
resolveStyle → selectModels → craftPrompt → generate → postProcess → verify → score → qualityGate → persistContext
```

Each step is a typed Mastra `createStep()` with Zod input/output schemas, streaming via `writer`, and automatic snapshot persistence for time-travel.

### Mastra tools (typed, traceable)

| Tool | Purpose |
|---|---|
| `fal-generate-image` | Text-to-image via fal.ai |
| `fal-generate-video` | Text/image-to-video (Seedance 2.0, WAN) |
| `fal-i2i` | Image-to-image style transfer |
| `llava-score` | LLaVA 13B vision quality scoring |
| `e2b-process` | E2B sandbox post-processing |
| `verify-image` | 4-layer pixel verification |

### Verification stack

Every generation passes through 4 deterministic checks:

| Layer | What it measures | Used for |
|---|---|---|
| Pixelmatch | Exact pixel diff | Confirming refinement changes were applied |
| SSIM | Structural similarity (0-1) | Style transfer validation (target 0.4-0.7) |
| pHash | Perceptual fingerprint | Convergence detection (hamming 0 = stop) |
| Uniqueness | Distance to known outputs | Ensuring every output is one-of-a-kind |

### Quality scoring (LLaVA 13B)

Real vision model evaluation — no simulated scores:

| Dimension | Weight |
|---|---|
| Anti-slop gate | 0.15 |
| Prompt-artifact alignment | 0.15 |
| Aesthetic quality | 0.13 |
| Style fidelity | 0.13 |
| Distinctiveness | 0.13 |
| Asset quality | 0.12 |
| Code standards | 0.03 |
| Hierarchy | 0.06 |
| Color harmony | 0.05 |
| Convention break adherence | 0.05 |

Composite must reach 7.0/10 to pass.

### MCP server

The skill exposes its tools as an MCP server for use by any MCP-compatible client:

```bash
bun run scripts/mastra/mcp/server.ts
```

### Project context persistence

Across a session, the skill remembers:
- Locked style (same visual DNA for all subsequent generations)
- Extracted palette (exact hex values enforced)
- Character references (consistent faces/subjects)
- Generation history (prompt + seed + URL for every output)
- pHash library (growing uniqueness baseline)

### Taste profiles

Learned user preferences across 7 axes: density, tone, color energy, type personality, radius, elevation, motion. Built from pair ranking and accept/reject signals.

## Code rules

Enforced across all scripts:

1. **Bun-only** — `Bun.file`, `Bun.write`, `Bun.env`, `Bun.argv` (no Node.js APIs)
2. **Effect-native** — `Effect.gen`, `Effect.tryPromise`, `Data.TaggedError` (no raw promises, try/catch)
3. **Max nesting depth 3** — no more than 3 levels of `Effect.gen`/`flatMap` per function
4. **50-line limit** — all functions, types, interfaces, classes

## Commands

| Command | Description |
|---|---|
| `bun run build` | Typecheck |
| `bun run lint` | Biome lint |
| `bun run test` | Run 267 tests |
| `bun run enforce` | Verify code rules (75 files, 0 violations) |
| `bun run validate` | Full: build + lint + enforce + test |
| `bun run check-keys` | Verify API keys |

## Examples

See `examples/` for project-based walkthroughs showing real user invocations across all output types. Each example has a README.md documenting the skill invocation experience — what you type, what the pipeline does, what scores it gets.

## Troubleshooting

| Issue | Fix |
|---|---|
| fal.ai 404 | Model endpoint deprecated. Run `bun run test` to verify working endpoints |
| Composite below 7.0 | In interactive mode, provide feedback. In headless, auto-retries 3 times |
| E2B sandbox fails | Check `E2B_API_KEY` quota at [e2b.dev/dashboard](https://e2b.dev/dashboard) |
| QuiverAI timeout | Falls back to Recraft V3 vector illustration mode |
| Same output twice | Uniqueness check catches it — auto-bumps seed |

## License

[MIT](LICENSE)
