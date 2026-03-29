# QUALITY SCORING
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Composite quality scoring for the one-of-a-kind-design skill. Every generation session must achieve a composite score of 7.0/10 or higher. Below that threshold is a HARD STOP -- the output is not delivered to the user.

**Script:** `scripts/score-output-quality.ts` | **Agent:** `hooks/agents/quality-assessor.md` | **Hook:** Stop event (60s timeout)

---

## Composite Formula

```
composite = anti_slop_gate       * 0.15
          + code_standards_gate  * 0.08
          + asset_quality_avg    * 0.12
          + prompt_artifact_align * 0.15
          + aesthetic             * 0.13
          + style_fidelity       * 0.13
          + distinctiveness      * 0.13
          + hierarchy            * 0.06
          + color_harmony        * 0.05
```

**Weights sum to 1.00.** Each sub-score ranges from 1.0 to 10.0.

**MINIMUM COMPOSITE: 7.0/10. HARD STOP below this threshold.**

---

## Sub-Score Rubrics

### 1. Anti-Slop Gate (weight: 0.15)

Detects AI-generic patterns that mark output as synthetic. This is the highest-weighted gate because slop is the primary failure mode of AI-generated design.

**Validator:** `scripts/validate-output.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Inter font, purple-blue gradient hero, Lorem Ipsum text, `#000000` body text, `shadow-md` unchanged from Tailwind defaults, centered H1 + subtitle + two buttons hero, `transition: all 300ms linear` on everything. The output is indistinguishable from a template. |
| **3/10** | One or two fonts chosen deliberately but others are defaults. Palette has some custom colors but accent is still unmodified Tailwind blue-500. Layout follows hero-features-testimonials-CTA skeleton. Copy includes "Elevate your" or "Seamless experience." |
| **5/10** | Deliberate font pairing but from the banned list (e.g., Roboto + Open Sans). Custom palette but pure `#000000` body text. Shadows are tinted but still Tailwind presets. Layout has some variation but section rhythm is uniform `py-16`. |
| **7/10** | Style-specific font selection from taxonomy recommendations. Off-black body text (`#111`, `#1a1a1a`). Custom shadow tokens. No banned copy phrases. At least one section breaks the column grid. Background has grain or gradient, not flat solid. |
| **8/10** | All typography reflects the style's `font_selection` field. Tinted shadows derived from element colors. Realistic content (actual names, plausible numbers). Varied section rhythm. Motion uses the style's `motion_signature` curve. |
| **10/10** | Every element passes the "would a design director approve this?" test. Zero AI markers. Typography, color, spacing, motion, copy, and layout all reflect deliberate decisions traceable to the taxonomy style. If you swapped the font for Inter, you would immediately notice the design changed. |

---

### 2. Code Standards Gate (weight: 0.08)

Ensures generated code follows the skill's technical standards.

**Validator:** `scripts/validate-code-standards.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Uses `require()`, `process.env`, `__dirname`. Raw `try/catch` around async operations. `Promise.then()` chains. Function nesting depth 5+. Mixed Node.js and Bun APIs. No TypeScript types. |
| **3/10** | Mostly Bun-compatible but leaks `process.env` or uses `fs.readFileSync`. Some `async/await` without Effect wrapper. Nesting depth 4. Type annotations missing on key functions. |
| **5/10** | Bun-only runtime APIs but Effect patterns inconsistent. Some `Effect.tryPromise` but also bare `try/catch`. Nesting depth 3-4. Types present but incomplete (`any` in several places). |
| **7/10** | Clean Bun-only (`Bun.env`, `Bun.file`, `Bun.write`). Effect-native with `Effect.gen`, `Effect.tryPromise`, `pipe`. Nesting depth <= 3. TypeScript types on all public interfaces. |
| **8/10** | Proper Effect service composition with `Context.Tag`, `Layer.succeed`. Error types are tagged (`Data.TaggedError`). Resource management uses `Effect.acquireUseRelease` or `Effect.ensuring`. |
| **10/10** | Exemplary Effect architecture. Services composed via Layer. Errors are typed and recoverable. Tests exist. No `any` types. Code reads like a well-structured Effect application, not a script with Effect bolted on. |

---

### 3. Asset Quality Average (weight: 0.12)

Evaluates the technical quality of generated images, videos, SVGs, and other assets.

**Validator:** `scripts/validate-asset-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Images below 512px in either dimension. SVGs without `viewBox`. Videos under 480p. Files exceed 10MB uncompressed. Wrong aspect ratios. JPEG artifacts at quality < 50. SVG with inline raster data (base64 encoded images inside SVG). |
| **3/10** | Images at 512-768px. SVGs have `viewBox` but excessive nodes (>10,000 paths for simple graphics). Videos at 720p but with encoding artifacts. File sizes reasonable but no optimization. |
| **5/10** | Images at 1024px+. SVGs clean with viewBox and reasonable path counts. Videos at 1080p. Files are appropriately sized but not optimized (no WebP, no compressed SVG). |
| **7/10** | Images at 1024px+ in correct format (WebP for photos, PNG for graphics with transparency). SVGs have clean paths, no unnecessary attributes, proper viewBox. Videos at 1080p with good encoding. File sizes optimized (<500KB for images, <2MB for short video). |
| **8/10** | Multiple resolutions provided (1x, 2x for retina). SVGs are SVGO-optimized. Videos encoded with appropriate codec (H.264 for compatibility, VP9 for quality). Aspect ratios match the target container. |
| **10/10** | Production-ready assets. Images in WebP with fallback. SVGs minified, accessible (aria labels where appropriate), and resolution-independent. Videos with proper keyframe intervals. All assets pass Google PageSpeed audit. Thumbnails generated for preview. |

---

### 4. Prompt-Artifact Alignment (weight: 0.15)

Measures how closely the generated output matches the crafted prompt. This is the core quality signal -- did the generation produce what was requested?

**Validator:** `scripts/validate-prompt-artifact-alignment.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | The generated artifact has no resemblance to the prompt. Wrong subject, wrong style, wrong composition. The model hallucinated something entirely different. |
| **3/10** | The general subject is correct but key style tokens are missing. Prompt asked for "art-deco geometric ornament in gold (#C9A84C) on black" but output is a generic geometric pattern in random colors. |
| **5/10** | Most elements present but noticeable misalignment. Style is approximately correct but specific details are off (wrong color temperature, wrong aspect ratio, text baked into image when it should be native). Triggers AUTO-REGENERATE at this level. |
| **7/10** | Strong match. The style is clearly the one requested. Color palette is close. Composition follows the prompt guidance. Minor details may differ (e.g., exact number of ornamental elements) but the overall direction is aligned. |
| **8/10** | Excellent match. All positive prompt tokens are visible in the output. Negative prompt elements are absent. The artifact could serve as a reference image for the style. |
| **10/10** | Perfect alignment. Every style token from the crafted prompt is identifiable in the output. Color values match. Composition follows the specified layout. The artifact is exactly what a design director would expect from the prompt. |

**Threshold behavior:**
- **< 5.0:** AUTO-REGENERATE. Try different seed, escalate to higher-tier model, re-craft with misalignment feedback.
- **5.0-6.9:** FLAG for user review. Present the misalignment and ask if it's acceptable.
- **>= 7.0:** PASS. Proceed to next pipeline stage.

---

### 5. Aesthetic (weight: 0.13)

Overall visual quality independent of style correctness. A well-executed wrong style still scores high here; a poorly executed correct style scores low.

**Validator:** `scripts/run-perceptual-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Visually broken. Clipping issues, overflow, misaligned elements, unreadable text, color contrast failures. Would embarrass anyone who showed it to a client. |
| **3/10** | Functional but amateurish. Elements are visible and readable but the composition feels random. Spacing is inconsistent. The output looks like a first draft by a junior designer. |
| **5/10** | Competent but unremarkable. Everything is in the right place, nothing is obviously wrong, but nothing is memorable either. Standard template quality. You wouldn't show it in a portfolio. |
| **7/10** | Professional quality. Intentional composition. Clear visual rhythm. Spacing feels considered. The output could plausibly appear on a real website or in a real product. |
| **8/10** | Polished. The kind of output that earns compliments. Details like micro-interactions, subtle gradients, and thoughtful whitespace show craft beyond the obvious. |
| **10/10** | Striking. A design director would pause and study it. The composition, color, typography, and motion create an emotional response. Would win awards in a design competition. Memorable days after viewing. |

---

### 6. Style Fidelity (weight: 0.13)

How accurately the output implements the resolved taxonomy style. This checks against the style's `design_system_parameters`, `font_selection`, `motion_signature`, `premium_patterns`, and `anti_slop_overrides`.

**Validator:** `scripts/run-perceptual-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | The output doesn't match the resolved style at all. An art-deco brief produced a flat-design output. A brutalist brief produced a glassmorphism output. Complete style miss. |
| **3/10** | The style's category is vaguely correct (e.g., "something historical-looking" for an art-deco brief) but none of the specific style markers are present. No geometric symmetry, no metallic accents, wrong typography. |
| **5/10** | The general aesthetic direction is recognizable but key markers are missing. Art-deco with geometric shapes but using rounded corners (violation). Glassmorphism with blur but missing the refraction edge (missing premium_pattern). |
| **7/10** | Clearly identifiable as the target style by someone familiar with design. Typography matches `font_selection`. Color palette aligns with `color_palette_type`. Motion uses the correct `motion_signature`. 1+ `premium_patterns` implemented. |
| **8/10** | An expert would recognize the specific taxonomy style immediately. All `anti_slop_overrides` are respected. All `premium_patterns` are implemented. The `convention_breaks` are available but not required at this level. |
| **10/10** | The output is a reference implementation of the style. Every parameter from the style profile is visible. The `audience_market_fit` is demonstrated. At least one `convention_break` is meaningfully applied. The output could be added to the taxonomy as an exemplar. |

---

### 7. Distinctiveness (weight: 0.13)

How unique and memorable the output is. This is the "one-of-a-kind" score -- the skill's core value proposition.

**Validator:** `scripts/run-perceptual-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Indistinguishable from a template. Could be any AI-generated landing page. No personality, no opinion, no memorable element. You've seen this exact output a hundred times. |
| **3/10** | Has a style applied but the application is surface-level. Like a template with a color scheme swap. The layout, content structure, and interaction patterns are generic. |
| **5/10** | Some unique elements (a custom hero illustration, an unusual color pairing) but the overall structure is familiar. The distinctiveness is in the details, not the concept. |
| **7/10** | Clearly unique. The hero asset is memorable. The composition has at least one surprising element. The output wouldn't be mistaken for a template or a competitor's site. |
| **8/10** | Highly distinctive. Multiple elements work together to create a cohesive, original experience. The output has a "point of view" that reflects the taxonomy style's philosophy. |
| **10/10** | One-of-a-kind. The output has a concept that unifies every element. The hero archetype is perfectly matched to the content. The composition breaks conventions in ways that serve the message. Someone encountering this output would remember it weeks later. |

---

### 8. Hierarchy (weight: 0.06)

Visual hierarchy -- how effectively the design guides the eye through content in the intended reading order.

**Validator:** `scripts/run-perceptual-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Everything is the same visual weight. No clear entry point. Text sizes are uniform. Colors don't differentiate importance. The eye bounces randomly across the page. |
| **3/10** | A primary element is visible (largest text or image) but secondary and tertiary levels are unclear. The hierarchy is implicit (larger = more important) with no other reinforcement. |
| **5/10** | Three levels visible (heading, body, caption) but the visual weight transitions are abrupt. The hierarchy works if you read top-to-bottom but doesn't guide the eye spatially. |
| **7/10** | Clear 3-tier hierarchy: primary (hero), secondary (section headings), supporting (body, metadata). Visual weight transitions are smooth. Color, size, and spacing all reinforce the same reading order. |
| **8/10** | Strong hierarchy with focal points that draw the eye before reading begins. The hero asset anchors the page. Whitespace actively separates hierarchical levels. Interactive elements are clearly differentiated from content. |
| **10/10** | Masterful hierarchy. The eye follows a deliberate path designed by the creator. Every element's visual weight is intentional. The hierarchy works at a glance (scannable) and on close reading (parseable). Squint test passes cleanly. |

---

### 9. Color Harmony (weight: 0.05)

How effectively the color palette creates visual cohesion, communicates the style's identity, and maintains functional contrast.

**Validator:** `scripts/run-perceptual-quality.ts`

| Score | What It Looks Like |
|---|---|
| **1/10** | Colors clash without intention. Random hues with no relationship. Background and text contrast fails WCAG AA. Accent colors compete with primary actions. The palette communicates nothing about the style. |
| **3/10** | A recognizable palette exists but the application is inconsistent. Too many accent colors (5+) with no hierarchy. Some elements use off-palette colors. Contrast ratios are borderline. |
| **5/10** | Functional palette with 3-4 colors that don't clash. Contrast ratios pass AA. But the palette is generic (could belong to any style) and doesn't reinforce the taxonomy style's identity. |
| **7/10** | Cohesive palette matching the taxonomy style's `color_palette_type`. Tinted neutrals, not pure gray. Accent colors are intentional and scarce. 60/30/10 balance (dominant/secondary/accent). WCAG AA on all text. |
| **8/10** | Expert color application. Shadows carry element hue (tinted-shadows pattern). Background has subtle color temperature (warm or cool, not neutral). Dark mode (if applicable) has its own elevation system, not inverted colors. |
| **10/10** | Color theory mastery. The palette tells a story that reinforces the content. Semantic color use (warm for positive, cool for analytical). Gradient transitions feel natural. Color contrast creates depth without shadows. A color-blind simulation still reads correctly. |

---

## Score Card ASCII Format

The score card is generated by `scripts/score-output-quality.ts` and displayed in the conversation. The bar uses filled (`█`) and empty (`░`) blocks.

```
╔══════════════════════════════════════════╗
║         QUALITY SCORE CARD               ║
╠══════════════════════════════════════════╣
║ Anti-Slop Gate     ████████░░ 8.0/10 (15%) ║
║ Code Standards     █████████░ 9.0/10 ( 8%) ║
║ Asset Quality      ████████░░ 8.0/10 (12%) ║
║ Prompt Alignment   ████████░░ 7.5/10 (15%) ║
║ Aesthetic          ████████░░ 7.8/10 (13%) ║
║ Style Fidelity     ████████░░ 8.2/10 (13%) ║
║ Distinctiveness    ███████░░░ 7.0/10 (13%) ║
║ Hierarchy          ████████░░ 7.5/10 ( 6%) ║
║ Color Harmony      ████████░░ 8.0/10 ( 5%) ║
╠══════════════════════════════════════════╣
║ COMPOSITE: 7.84/10  PASS                 ║
║ Minimum:   7.0/10                         ║
╚══════════════════════════════════════════╝
```

### FAIL Example

```
╔══════════════════════════════════════════╗
║         QUALITY SCORE CARD               ║
╠══════════════════════════════════════════╣
║ Anti-Slop Gate     ████░░░░░░ 4.0/10 (15%) ║
║ Code Standards     ███████░░░ 7.0/10 ( 8%) ║
║ Asset Quality      ██████░░░░ 6.0/10 (12%) ║
║ Prompt Alignment   █████░░░░░ 5.0/10 (15%) ║
║ Aesthetic          ██████░░░░ 6.5/10 (13%) ║
║ Style Fidelity     █████░░░░░ 5.5/10 (13%) ║
║ Distinctiveness    ████░░░░░░ 4.0/10 (13%) ║
║ Hierarchy          ██████░░░░ 6.0/10 ( 6%) ║
║ Color Harmony      █████░░░░░ 5.0/10 ( 5%) ║
╠══════════════════════════════════════════╣
║ COMPOSITE: 5.33/10  FAIL -- HARD STOP    ║
║ Minimum:   7.0/10                         ║
╚══════════════════════════════════════════╝
```

---

## HARD STOP Behavior

When composite falls below 7.0/10:

1. **Display the score card** with `FAIL -- HARD STOP` status.
2. **Identify the weakest sub-scores** (lowest 2-3 scores dragging the composite down).
3. **Provide specific remediation steps** for each weak area:
   - Anti-slop < 7: "Replace Inter with style-specific font. Remove purple gradient. Use off-black for body text."
   - Prompt alignment < 5: "AUTO-REGENERATE with different seed. Escalate to higher-tier model. Re-craft prompt with misalignment feedback."
   - Distinctiveness < 7: "The hero asset is generic. Re-conceive using a different archetype from HERO-ASSET-ARCHETYPES.md."
   - Style fidelity < 7: "Missing premium_patterns from style profile. Implement spotlight-border and parallax-card-stack."
4. **Do NOT deliver the output** to the user. The output stays internal.
5. **Re-generate or refine** based on the remediation steps.
6. **Re-score** after changes. Repeat until composite >= 7.0.

---

## Weighted Contribution Analysis

The contribution of each sub-score to the composite helps identify leverage points:

| Sub-Score | Weight | Score Needed for 1.0 Contribution | Impact |
|---|---|---|---|
| Anti-Slop Gate | 0.15 | 6.67/10 | High -- every point here moves composite by 0.15 |
| Prompt Alignment | 0.15 | 6.67/10 | High -- same leverage as anti-slop |
| Aesthetic | 0.13 | 7.69/10 | Medium-high -- the visual quality floor |
| Style Fidelity | 0.13 | 7.69/10 | Medium-high -- taxonomy compliance |
| Distinctiveness | 0.13 | 7.69/10 | Medium-high -- the "one-of-a-kind" factor |
| Asset Quality | 0.12 | 8.33/10 | Medium -- technical correctness |
| Code Standards | 0.08 | 12.5/10 | Lower -- hard to fail here with proper tooling |
| Hierarchy | 0.06 | 16.7/10 | Low individual impact -- but a floor of 6.0+ is easy |
| Color Harmony | 0.05 | 20.0/10 | Lowest individual impact -- still must be >= 5.0 |

**To achieve 7.0 composite with uniform scores:** every sub-score must average 7.0.
**To achieve 7.0 with one weak area:** if one sub-score is 4.0, the others must average ~7.5-8.0 to compensate.

---

## Score Computation Code

From `scripts/score-output-quality.ts`:

```typescript
const WEIGHTS: Record<keyof SubScores, number> = {
  antiSlopGate: 0.15,
  codeStandardsGate: 0.08,
  assetQualityAvg: 0.12,
  promptArtifactAlign: 0.15,
  aesthetic: 0.13,
  styleFidelity: 0.13,
  distinctiveness: 0.13,
  hierarchy: 0.06,
  colorHarmony: 0.05,
}

const MINIMUM_COMPOSITE = 7.0

function computeComposite(scores: SubScores): QualityReport {
  let composite = 0
  const breakdown: Record<string, { score: number; weight: number; contribution: number }> = {}

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = scores[key as keyof SubScores]
    const contribution = score * weight
    composite += contribution
    breakdown[key] = {
      score,
      weight,
      contribution: Math.round(contribution * 100) / 100,
    }
  }

  composite = Math.round(composite * 100) / 100
  const passed = composite >= MINIMUM_COMPOSITE

  return { composite, passed, minimum: MINIMUM_COMPOSITE, subScores: scores, weightedBreakdown: breakdown, scoreCard: formatScoreCard(scores, breakdown, composite, passed) }
}
```

---

## Score Card Generation

```typescript
function formatScoreCard(
  scores: SubScores,
  breakdown: Record<string, { score: number; weight: number; contribution: number }>,
  composite: number,
  passed: boolean,
): string {
  const lines: string[] = [
    "╔══════════════════════════════════════════╗",
    "║         QUALITY SCORE CARD               ║",
    "╠══════════════════════════════════════════╣",
  ]

  const labels: Record<string, string> = {
    antiSlopGate: "Anti-Slop Gate",
    codeStandardsGate: "Code Standards",
    assetQualityAvg: "Asset Quality",
    promptArtifactAlign: "Prompt Alignment",
    aesthetic: "Aesthetic",
    styleFidelity: "Style Fidelity",
    distinctiveness: "Distinctiveness",
    hierarchy: "Hierarchy",
    colorHarmony: "Color Harmony",
  }

  for (const [key, entry] of Object.entries(breakdown)) {
    const label = labels[key] ?? key
    const bar = "\u2588".repeat(Math.round(entry.score))
      + "\u2591".repeat(10 - Math.round(entry.score))
    const pct = `${(entry.weight * 100).toFixed(0)}%`
    lines.push(
      `\u2551 ${label.padEnd(18)} ${bar} ${entry.score.toFixed(1)}/10 (${pct.padStart(3)}) \u2551`
    )
  }

  lines.push("╠══════════════════════════════════════════╣")
  lines.push(
    `\u2551 COMPOSITE: ${composite.toFixed(2)}/10  ${passed ? "PASS" : "FAIL \u2014 HARD STOP"}${" ".repeat(passed ? 14 : 4)}\u2551`
  )
  lines.push(`\u2551 Minimum:   ${MINIMUM_COMPOSITE.toFixed(1)}/10${" ".repeat(26)}\u2551`)
  lines.push("╚══════════════════════════════════════════╝")

  return lines.join("\n")
}
```

---

## Image-Only Workflows (L5 fix)

When generating images, video, or SVG without code output, the `codeStandardsGate` sub-score is not applicable. Setting it to `null` triggers weight redistribution:

**Weight Redistribution Formula:**

When `codeStandardsGate` is null, its 0.08 weight distributes proportionally across the remaining 8 sub-scores based on their original weights. The remaining weights sum to 0.92, so each active weight receives a proportional share of the 0.08:

```
effective_weight[k] = base_weight[k] + (base_weight[k] / 0.92) * 0.08
```

**Resulting effective weights for image-only:**

| Sub-Score | Base Weight | Image-Only Weight |
|---|---|---|
| Anti-Slop Gate | 0.15 | 0.163 |
| ~~Code Standards~~ | ~~0.08~~ | N/A (0.00) |
| Asset Quality | 0.12 | 0.130 |
| Prompt Alignment | 0.15 | 0.163 |
| Aesthetic | 0.13 | 0.141 |
| Style Fidelity | 0.13 | 0.141 |
| Distinctiveness | 0.13 | 0.141 |
| Hierarchy | 0.06 | 0.065 |
| Color Harmony | 0.05 | 0.054 |

**Impact:** An image-only workflow with all visual sub-scores at 8.0 scores 8.0 composite (vs 7.76 when codeStandardsGate defaults to 5.0). This prevents non-applicable scores from dragging the composite below the 7.0 gate.

**Score card display:** The Code Standards row shows `N/A` with 0% weight.

**`validate-output.ts` behavior for non-code assets:** Returns `{ passed: true, score: 9.0 }` with a note that anti-slop code checks are N/A for non-code assets. Visual anti-slop (palette, composition, AI artifacts) is handled by `run-perceptual-quality.ts`.

---

## Style Consistency Sub-Score (L3 addition)

For multi-frame workflows (e.g., 10 seed frames for a concept), `scripts/validate-style-consistency.ts` checks cross-frame coherence:

**Formula:** `score = 5.0 + stylePresenceRatio * 2.0 + brandPresenceRatio * 1.5 + paletteOverlap * 1.5`

| Component | Range | How Measured |
|---|---|---|
| Style Presence Ratio | 0.0-1.0 | % of frames where target style name/keywords detected in MoonDreamNext description |
| Brand Presence Ratio | 0.0-1.0 | % of frames where product/brand terms detected |
| Palette Overlap | 0.0-1.0 | Average Jaccard similarity of color vocabulary across all frame pairs |

**Gate:** 8.0 (configurable via `--gate`). Not included in the composite score — it's a separate consistency check that runs after Step 5 for multi-frame outputs.

---

## CLI Usage

```bash
# Run with explicit scores (full workflow)
bun run scripts/score-output-quality.ts --scores '{"antiSlopGate":8.5,"codeStandardsGate":9.0,"assetQualityAvg":8.0,"promptArtifactAlign":7.5,"aesthetic":7.8,"styleFidelity":8.2,"distinctiveness":7.0,"hierarchy":7.5,"colorHarmony":8.0}'

# Run for image-only workflow (codeStandardsGate: null, weight redistributed)
bun run scripts/score-output-quality.ts --scores '{"antiSlopGate":9,"codeStandardsGate":null,"assetQualityAvg":9,"promptArtifactAlign":8,"aesthetic":8.5,"styleFidelity":8,"distinctiveness":8,"hierarchy":8,"colorHarmony":8}' --workflow "image-only"

# Run in demo mode (uses default scores)
bun run scripts/score-output-quality.ts

# Run style consistency check (multi-frame)
bun run scripts/validate-style-consistency.ts --descriptions '["frame 1 description","frame 2 description"]' --style-id "pop-art" --gate 8.0
```

Output includes both the ASCII score card and a JSON report:

```json
{
  "composite": 7.84,
  "passed": true,
  "minimum": 7.0,
  "workflow": "full",
  "subScores": { "antiSlopGate": 8.5, "..." : "..." },
  "weightedBreakdown": {
    "antiSlopGate": { "score": 8.5, "weight": 0.15, "contribution": 1.28 },
    "..."
  },
  "scoreCard": "╔══...══╝"
}
```
