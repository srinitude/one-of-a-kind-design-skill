# one-of-a-kind-design

Every output is unique. Every output is high-quality. Every time.

This is an agent skill that generates websites, apps, images, SVGs, and videos that don't look like anything else — and never look like each other.

## The problem

AI-generated design looks like AI-generated design. The same gradients, the same layouts, the same stock-photo compositions, the same Inter font on the same purple-to-blue hero section. You can spot it instantly. Your audience can too.

## What this solves

Tell your coding agent what you need. The skill handles everything else — and what comes back is genuinely yours.

```
"Design a website for my 12-seat omakase restaurant in Brooklyn. No food photos."
```

What you get: a wabi-sabi website with hand-textured typography, seasonal palette that changes with the menu, deliberate imperfection that feels like sitting at the counter. No food photography — because you said so, and the skill understood why.

```
"Album cover for a jazz trio's debut record. Smoky, intimate, blue."
```

What you get: cinematic artwork with atmospheric lighting, shadows that have weight, a palette built from three specific hex values pulled from the jazz-appropriate color theory — not "blue" the way every AI tool interprets blue.

```
"15-second trailer for our deconstructed Madama Butterfly staging"
```

What you get: a video with fractured visual language, camera movements that mirror the opera's emotional arc, shot transitions that feel like set design — because the skill understands deconstructivism as a philosophy, not a filter.

## Why every output is unique

The skill maintains a fingerprint library. Every image it generates gets a perceptual hash. Before delivering anything, it checks that hash against every previous generation. If two outputs are too similar — even across different sessions, different prompts, different projects — it regenerates with a different seed until the result is genuinely distinct.

Run the same prompt twice. You'll get two different images that both nail the brief. The creative decisions are identical (same style, same palette, same composition logic). The pixels are not.

## Why every output is high-quality

A vision model (LLaVA 13B) evaluates every generation across 10 dimensions: style fidelity, color harmony, composition, distinctiveness, prompt alignment, aesthetic quality, asset quality, hierarchy, anti-slop compliance, and convention break adherence. Each dimension gets a real score from the vision model actually looking at the output — not a simulated number.

The minimum composite score to deliver is 7.0 out of 10. Below that, the pipeline automatically retries — adjusting the prompt, bumping the seed, escalating one model tier at a time. After 3 failed attempts, it stops and tells you honestly rather than delivering something mediocre.

## Why every output is deterministic

Given the same request, the skill makes the same creative decisions every time:

- Same style resolution (wabi-sabi for the omakase, cinematic for the jazz album)
- Same dial settings (design variance 7, motion intensity 3, visual density 3)
- Same convention breaks (no food photography on a restaurant site — deterministic, not random)
- Same prompt structure (subject first, 2-3 hex colors, composition directive, 300 char max)
- Same model selection (Flux Pro 1.1 for cinematic, Seedance 2.0 for video)
- Same quality threshold (7.0/10 minimum, same scoring weights)

The pipeline is fixed. The judgment is fixed. Only the pixels vary — and that's the point.

## What you can make

**Websites** — Landing pages, portfolios, product sites. The skill generates hero images, selects typography, builds Tailwind presets, and composes realistic content. No Lorem Ipsum, no Acme Corp.

**Web apps** — Dashboards, admin panels, internal tools. Data visualization that serves the data, not the other way around.

**Images** — Album covers, event posters, book covers, product photography, editorial illustrations. Style-transferred, composited, or generated from scratch.

**SVGs** — Logos, icon sets, decorative patterns. Real vector paths, not rasters wrapped in SVG tags.

**Videos** — Trailers, product reveals, logo animations, architectural flythroughs. Image-to-video via Seedance 2.0 with timeline notation for multi-shot sequences.

**Mobile apps** — Onboarding flows, settings pages, social feeds. Phone-framed mockups with touch-appropriate design.

## How it works (for the curious)

The skill resolves your request against a taxonomy of 66 visual styles — from wabi-sabi to brutalist web to afrofuturism to liquid glass. Each style carries its own color theory, typography rules, motion signatures, and convention-breaking pairs (the things that style intentionally violates).

It then applies four tunable dials — design variance (how experimental), motion intensity (how kinetic), visual density (how much breathing room), and audience formality (how polished). These dials are set by the style but can be overridden.

A prompt gets crafted by a dedicated agent — 300 characters max, subject-first, with exact hex values and composition directives. The prompt goes to fal.ai for generation, then through an E2B sandbox for post-processing, then through pixel-level verification (4 layers: exact pixel diff, structural similarity, perceptual fingerprint, uniqueness check), then through vision-model scoring.

If the output doesn't pass, the pipeline time-travels back to prompt crafting with feedback from the scorer and tries again. No manual intervention needed.

## Works everywhere

This skill follows the [agentskills.io](https://agentskills.io) open standard. It runs in:

Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI, Windsurf, Augment, OpenCode, Antigravity — and any other coding agent that reads the standard.

No platform-specific features. No vendor lock-in.

## Get started

```bash
npx skills add srinitude/one-of-a-kind-design-skill
```

Add your API keys to `.env`:

```
FAL_KEY=your-key-from-fal.ai
E2B_API_KEY=your-key-from-e2b.dev
QUIVERAI_API_KEY=your-key-from-quiver.ai
```

Then ask your coding agent to design something.

## Interactive vs. headless

**In a coding agent:** The skill streams progress as it works. When the quality gate fires, it shows you the scores and asks what to do — accept, retry with feedback, or adjust the creative direction. You're in the loop.

**In CI/CD:** The skill runs autonomously with zero human input. Pass, retry, or fail. Exit code 0 or 1. Snapshots saved on failure for debugging.

```bash
bun run scripts/mastra/modes/ci.ts '{"userIntent":"...","outputType":"image"}'
```

## License

[MIT](LICENSE)
