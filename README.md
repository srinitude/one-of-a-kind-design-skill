# one-of-a-kind-design

Every output is unique. Every output is high-quality. Every time.

This is an agent skill that generates websites, apps, images, SVGs, and videos that don't look like anything else — and never look like each other.

## The problem

AI-generated design looks like AI-generated design. The same gradients, the same layouts, the same stock-photo compositions, the same Inter font on the same purple-to-blue hero section. You can spot it instantly. Your audience can too.

Generic design skills generate generic output. They pick a template, fill in the blanks, and ship. There's no taste, no verification, no guarantee that what comes back actually matches what was asked for — or that it's any different from what they made for the last person.

## What makes this different

### Deterministic creative decisions

Given the same request, this skill makes the same creative decisions every time. Same style resolution, same dial settings, same convention breaks, same prompt structure, same model selection, same quality threshold. The pipeline is fixed. The judgment is fixed. Only the pixels vary.

Other skills roll the dice. This one doesn't.

### Verified uniqueness

Every generation gets a perceptual fingerprint. Before delivering anything, the skill checks that fingerprint against every previous output. If two results are too similar — across sessions, prompts, or projects — it regenerates until the output is genuinely distinct.

Other skills have no memory. This one accumulates a uniqueness baseline that gets stricter over time.

### Real quality scoring

A vision model (LLaVA 13B) evaluates every output across 10 dimensions. Real scores from a model actually looking at the image — not simulated numbers. Minimum 7.0/10 composite to deliver. Below that, auto-retry with adjusted prompts and escalated models. After 3 failures, honest reporting instead of mediocre delivery.

Other skills trust the first generation. This one verifies.

### 4-layer pixel verification

Every output passes through pixelmatch (exact pixel diff), SSIM (structural similarity), pHash (perceptual fingerprint), and uniqueness checking. Style transfers are validated for the right similarity range. Refinement loops are confirmed to have actually changed something. Convergence is detected automatically.

Other skills generate and hope. This one measures.

### 66-style taxonomy with convention breaking

Not "modern" or "minimalist" — specific styles like wabi-sabi, brutalist-web, afrofuturism, liquid-glass, retro-vintage-print, each with their own color theory, typography, motion signatures, and documented rules about which design conventions they intentionally violate.

Other skills have a handful of themes. This one has a design education.

## When to use this skill

Use when the user asks to design, build, create, generate, or make anything visual:

- "Design a website for..." → website with hero image, Tailwind preset, realistic content
- "Create a logo for..." → SVG with real vector paths, multi-size tested
- "Make an album cover..." → image with style-specific composition, exact hex palette
- "Build an app screen for..." → mobile mockup with touch-appropriate design
- "Generate a video for..." → image-to-video via Seedance 2.0 with camera choreography
- "Redesign this in art deco style" → image-to-image style transfer with similarity verification

Do NOT use for backend code, database schemas, API design, or non-visual work.

## What you can make

**Websites** — Landing pages, portfolios, product sites. Hero images, typography, Tailwind presets, realistic content. No Lorem Ipsum, no Acme Corp.

**Web apps** — Dashboards, admin panels, internal tools. Data visualization that serves the data.

**Images** — Album covers, posters, book covers, product photography, editorial illustrations. Style-transferred, composited, or generated from scratch.

**SVGs** — Logos, icon sets, patterns. Real vector paths, not rasters in SVG wrappers.

**Videos** — Trailers, reveals, animations, flythroughs. Timeline notation for multi-shot sequences. Native audio generation.

**Mobile apps** — Onboarding, settings, feeds. Phone-framed with platform-appropriate patterns.

## Examples

```
"Design a website for my 12-seat omakase restaurant in Brooklyn. No food photos."
```

→ Wabi-sabi style, hand-textured typography, seasonal palette, deliberate imperfection. Convention break: no food photography on a restaurant site. Composite score 7.9/10.

```
"Album cover for a jazz trio's debut record. Smoky, intimate, blue."
```

→ Cinematic style, atmospheric lighting, shadows with weight. Three hex values from jazz-appropriate color theory. Composite score 7.7/10.

```
"15-second trailer for our deconstructed Madama Butterfly staging"
```

→ Deconstructivism style, fractured visual language, camera movements mirroring emotional arc. Keyframe generated, then animated via Seedance 2.0. Composite score 7.2/10.

```
"Logo for a sustainable fashion brand called Thread"
```

→ Editorial-minimalism, single-color vector mark, tested at 16px favicon and 4K. Real SVG paths via Recraft V3. Composite score 7.5/10.

## How it works (for the curious)

The skill resolves your request against 66 visual styles, applies 4 tunable dials (variance, motion, density, formality), crafts a 300-character prompt with exact hex values, generates via fal.ai, post-processes in an E2B sandbox, verifies through 4 pixel-level checks, scores with a vision model, and gates at 7.0/10 minimum.

If the output fails, the pipeline time-travels back to prompt crafting with scorer feedback and tries again. No manual intervention needed.

The full pipeline runs as a Mastra workflow — typed steps with Zod schemas, streaming progress, snapshot persistence, and time-travel debugging. Interactive mode suspends at quality gates for human feedback. Headless mode runs fully autonomous for CI/CD.

## Works everywhere

Follows the [agentskills.io](https://agentskills.io) open standard. Runs in Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI, Windsurf, Augment, OpenCode, Antigravity, and any other agent that reads the spec.

No platform-specific features. No vendor lock-in. All agent directories are symlinked to one canonical source.

## Get started

```bash
npx skills add srinitude/one-of-a-kind-design-skill
```

Add API keys to `.env`:

```
FAL_KEY=your-key-from-fal.ai
E2B_API_KEY=your-key-from-e2b.dev
QUIVERAI_API_KEY=your-key-from-quiver.ai
```

Then ask your coding agent to design something.

## Interactive vs. headless

**Interactive (default):**
```
/one-of-a-kind-design Design a portfolio site for an architecture firm
```
Streams progress. Shows scores. Asks what to do at quality gates. You stay in the loop.

**Headless (`--print`):**
```
/one-of-a-kind-design --print Album cover for a jazz trio
```
Zero human input. Pass, retry, or fail. No quality gate prompts. Auto-retries up to 3 times.

For CI/CD scripts:
```bash
bun run .claude/skills/one-of-a-kind-design/scripts/mastra/modes/ci.ts '{"userIntent":"...","outputType":"image"}'
```

## License

[MIT](LICENSE)
