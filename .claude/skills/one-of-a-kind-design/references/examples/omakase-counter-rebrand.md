# Omakase Counter Rebrand

## Scenario

User says: "I need a website for a 12-seat omakase restaurant in Brooklyn. The chef trained under Jiro Ono's lineage. No photos of food -- the site should feel like sitting at the counter: intimate, unhurried, seasonal."

This is a distinctive brief. The user has a strong creative vision and is explicitly rejecting the most common restaurant-site convention (food photography). The request carries emotional specificity ("feel like sitting at the counter") that maps directly to the wabi-sabi philosophy of presence, impermanence, and intentional imperfection.

---

## Creative Brief

| Field | Value |
|---|---|
| **Client** | Sushi Kioku (12-seat omakase, Brooklyn) |
| **Output type** | Website (responsive, single-page narrative scroll) |
| **Industry** | Food / hospitality |
| **Audience** | NYC food culture devotees, 30-50, comfortable with $200+ prix fixe |
| **Mood** | Warm, minimal, intimate, unhurried |
| **Style** | wabi-sabi |
| **Convention-breaking intent** | No food photography on a restaurant site. No menu prices. No reservation widget above the fold. |
| **Quality emphasis** | Distinctiveness (target 9), Hierarchy (target 8), Color harmony (target 8) |

---

## Pipeline Walkthrough

### Step 0: Message Enhancement

**Extraction across 7 dimensions:**

| Dimension | Detected? | Extracted Value |
|---|---|---|
| Output type | Yes | Website |
| Industry | Yes | Food / hospitality (restaurant) |
| Mood / aesthetic tags | Yes | warm, minimal, intimate, unhurried, seasonal |
| Audience segment | Yes | NYC food culture devotees, 30-50 (maps to Millennials/Gen X crossover) |
| Explicit style | No | Not named, but "intimate, unhurried, seasonal" + "feel like sitting at the counter" strongly signals wabi-sabi |
| Convention-breaking | Yes | "No photos of food" is an explicit convention break for restaurant sites |
| Quality emphasis | Partial | "intimate" and "unhurried" imply distinctiveness and hierarchy emphasis |

**Specificity score: 5/7 (Detailed spec)**

At 5/7, the brief is near-complete. The missing explicit style dimension is inferred with high confidence from the mood tags. Enhancement injects:

- **Style recommendation:** wabi-sabi (primary), with mono-ha as secondary option. Wabi-sabi's taxonomy tags (`organic, muted, textured, warm, asymmetric`) align precisely with the extracted mood. The user's phrase "unhurried, seasonal" maps directly to wabi-sabi's philosophy of impermanence and acceptance of natural cycles.
- **Industry route cross-reference:** AUDIENCE-ROUTES.md lists wabi-sabi under Healthcare/Wellness > Break the Mold ("imperfection-as-beauty directly serves mental health messaging"). For food/hospitality, cinematic is the safe default. Wabi-sabi is the convention break -- a restaurant site that feels like a meditation rather than a menu.
- **Audience validation:** Millennials (29-44) resonate with editorial-minimalism, scandinavian-minimalism, analog-film-grain. Wabi-sabi shares the warmth and restraint of these styles while adding the textural, philosophical depth that differentiates this project from generic minimal restaurant sites.
- **Convention-breaking activation:** The user's "no food photography" triggers CONVENTION-BREAKING.md logic. Design variance dial increased by +2 from wabi-sabi default (6 -> 8).

### Step 0c: UX Research

**Research queries executed:**

1. "omakase restaurant website design conventions 2025-2026"
2. "high-end restaurant sites without food photography"
3. "Japanese aesthetic web design wabi-sabi digital"
4. "12-seat prix fixe restaurant branding examples"

**Key findings:**

- **Convention: food photography dominates.** 94% of high-end restaurant sites lead with a hero image of plated food. The remaining 6% use atmospheric interior shots, and nearly zero use typography-only or texture-based heroes. This makes the user's "no food photos" request genuinely distinctive.
- **Convention: reservation widget above the fold.** Resy, OpenTable, or Tock integrations appear in the first viewport on 87% of prix fixe restaurant sites. The user explicitly rejects this. Reservation access should exist but should be discovered through the scroll narrative, not presented as the primary CTA.
- **Convention: menu with prices.** Omakase is inherently prix fixe and changes nightly. Listing menu items is impossible; listing the price is a philosophical mismatch with the "trust the chef" ethos. The site should communicate value through atmosphere, not numbers.
- **Opportunity: seasonal rotation.** No restaurant site studied implements a seasonally-rotating design system. Omakase is defined by seasonal ingredients (shun). A palette that shifts with the Japanese micro-seasons (72 sekki) would be genuinely unprecedented and deeply aligned with the wabi-sabi philosophy.
- **Opportunity: counter perspective.** The user's "feel like sitting at the counter" suggests a first-person spatial narrative. The site should unfold like the omakase experience itself: arrival, seating, the chef's greeting, the first course, the rhythm of service.

### Step 1: Style Resolution

**Style:** `wabi-sabi` (resolved via AUDIENCE-ROUTES.md mood-tag mapping)

**Full style configuration:**

```yaml
id: wabi-sabi
name: Wabi-Sabi
category: Cultural & Regional Aesthetics
tags: [organic, muted, textured, warm, asymmetric]

dials:
  design_variance: 8      # Elevated from default 6 due to convention-breaking signal
  motion_intensity: 2      # Default -- wabi-sabi is contemplative, motion is ambient
  visual_density: 2        # Default -- spacious, one element at a time
  audience_formality: 7    # Elevated from default 6 -- $200+ prix fixe demands authority

motion_signature: organic_drift
  css: cubic-bezier(0.37, 0, 0.63, 1)
  duration: 2000ms-20000ms (ambient loops)
  feel: natural, meditative, atmospheric

font_selection:
  display: Cormorant Garamond (variable, 300-700)
  body: Cormorant Garamond (400, 1.7 line-height)
  accent: Hand-brush script (Aoyagi Kouzan Gyousho or similar)

color_palette:
  type: warm earth with seasonal rotation
  base:
    surface: "#F5F0E8"        # Warm unbleached paper
    on_surface: "#2C2418"     # Rich brown-black (NOT pure black)
    muted: "#8B7D6B"          # Warm gray with earth undertone
  spring:
    primary: "#7B8B6F"        # Young bamboo green (wakatake-iro)
    accent: "#D4A0A0"         # Fading cherry (sakura-nezumi)
  summer:
    primary: "#4A6741"        # Deep moss (koke-iro)
    accent: "#C17817"         # Golden amber (kohaku-iro)
  autumn:
    primary: "#8B4513"        # Persimmon (kaki-iro)
    accent: "#C9A84C"         # Ginkgo gold (icho-iro)
  winter:
    primary: "#5B6E7A"        # Ink stone gray (suzuri-iro)
    accent: "#E8DCD0"         # First snow (hatsu-yuki)

premium_component_patterns:
  - grain-overlay             # Fixed noise texture breaking digital flatness
  - variable-font-morph       # Living typography via variable font axes

texture:
  grain: organic paper fiber at 0.04 opacity, fixed position
  background: never flat -- subtle warm gradient from #F5F0E8 to #EDE5D8

shadow_model: none           # Wabi-sabi rejects artificial depth signaling

anti_slop_overrides:
  - No pure black (#000000) -- use #2C2418 (warm brown-black)
  - No geometric perfection -- introduce 1-2px organic misalignment on borders
  - No uniform spacing -- vary section padding by 15-25% from base
  - No stock-photo food imagery
  - No reservation widget above the fold
  - Body line-height 1.7, never below 1.6
```

**Why wabi-sabi maps to omakase philosophy:**

Wabi-sabi and omakase share a root philosophy: trust in the maker, acceptance of impermanence, and reverence for the seasonal. Wabi-sabi's intentional imperfection ("every crack is placed, every asymmetry is designed") mirrors the omakase chef's deliberate sequencing -- nothing is arbitrary, but nothing is rigid. The style's `organic_drift` motion signature matches the unhurried rhythm of a multi-course meal. The warm earth palette references natural materials (hinoki wood counters, ceramic plates, handmade pottery) without depicting food. The grain texture simulates washi paper, connecting the digital surface to Japanese material culture.

This is not "Japanese-themed decoration." It is the philosophical framework of the cuisine applied to its digital representation.

### Step 2: Hero Asset Conception

**Selected archetype:** Typographic Statement

**Rationale:** The user explicitly rejected food photography, eliminating Photographic Drama and Panning Scene. The intimate, contemplative mood rules out Generative Canvas (too algorithmic) and 3D Object Showcase (too commercial). A Typographic Statement -- where the typography IS the hero -- aligns with wabi-sabi's principle that the message emerges from restraint. The restaurant's name, "Kioku" (memory), becomes the visual anchor.

**Archetype details from HERO-ASSET-ARCHETYPES.md:**
- Format: Large-scale type as primary visual element
- Works with: editorial-minimalism, minimalism-fine-art (and by extension, wabi-sabi's contemplative character)
- Key techniques: Extreme type scale contrast, variable font axes on scroll, mathematical type scale ratios

**Hero concept:** Vertical Japanese calligraphy of the kanji "記憶" (kioku -- memory) rendered in sumi ink on textured washi paper. The calligraphy is imperfect by design -- brush strokes thinning at edges, ink pooling at turns. Below it, "SUSHI KIOKU" in Cormorant Garamond Light at 14px tracking. The vertical orientation references traditional Japanese scroll painting (kakejiku) and immediately signals that this is not a standard restaurant website.

**Target model:** Flux 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`) -- selected for ultra-high resolution capability and wide aspect ratio support. The hero needs a tall, narrow aspect ratio (9:16 or similar) to accommodate vertical calligraphy, and Flux 1.1 Ultra handles non-standard dimensions well.

### Step 3: Prompt Crafting + Generation

**Crafter subagent:** `prompt-crafter-image-gen`

**Context provided to crafter:**

```yaml
style: wabi-sabi
subject: vertical Japanese calligraphy
purpose: hero asset for intimate omakase restaurant website
palette:
  surface: "#F5F0E8"
  on_surface: "#2C2418"
  accent: current-season
composition: vertical, centered calligraphy with asymmetric negative space
mood: intimate, unhurried, imperfect, seasonal
anti_slop:
  - no digital-perfect brush strokes
  - no generic "zen" decoration (no enso circles, no bamboo, no koi)
  - no bright red accents (cliche Japanese design marker)
```

**Crafted prompt (output from `prompt-crafter-image-gen`):**

```
Wabi-sabi calligraphic composition. Vertical Japanese brush calligraphy of two kanji characters rendered in sumi ink on aged washi paper, viewed straight-on as a hanging scroll. The brush strokes are confident but imperfect -- ink thins at the edges of horizontal strokes, pools slightly at directional changes, and shows the fiber texture of the brush. The paper surface #F5F0E8 has visible kozo fiber inclusions and subtle foxing marks suggesting age. The ink is warm brown-black #2C2418, not pure black. Asymmetric composition with the calligraphy placed slightly left of center, leaving generous negative space to the right. Soft diffuse natural light from above, casting no hard shadows. The paper edges are torn, not cut -- irregular organic borders. 8K resolution, extreme detail on brush fiber texture, fine art photography of calligraphy. No digital perfection, no geometric borders, no red seal stamps, no cherry blossoms, no zen garden elements, no generic Asian decoration.
```

**fal.ai API call parameters:**

```json
{
  "model": "fal-ai/flux-pro/v1.1-ultra",
  "prompt": "[crafted prompt above]",
  "image_size": {
    "width": 1024,
    "height": 1536
  },
  "num_images": 1,
  "seed": 7291,
  "guidance_scale": 7.5,
  "num_inference_steps": 50,
  "safety_tolerance": "2"
}
```

**Prompt-artifact alignment check (via `validate-prompt-artifact-alignment.ts`):**

| Criterion | Weight | Score | Rationale |
|---|---|---|---|
| style_fidelity | 0.25 | 8.5 | Unmistakably wabi-sabi -- the imperfect brush strokes, aged paper texture, and warm earth tones are immediately identifiable |
| palette_accuracy | 0.20 | 8.0 | Paper surface reads as warm cream (#F5F0E8 range), ink is warm brown-black. No pure black detected. |
| subject_clarity | 0.15 | 8.5 | Calligraphy is bold, legible (as brushwork), and clearly the focal element |
| composition_match | 0.15 | 8.0 | Slightly left-of-center placement achieved, generous negative space on right |
| anti_slop | 0.15 | 8.5 | Zero generic "zen" markers. No red stamps, no cherry blossoms, no enso. Pure calligraphy on paper. |
| texture_grain | 0.10 | 8.0 | Kozo fiber visible in paper surface, brush fiber texture in strokes |

**Weighted average: 8.3 -- PASS (threshold >= 7.0)**

The hero asset proceeds to integration.

### Step 4: One-Shot Generation

**Full website generation using resolved wabi-sabi configuration.**

**Tailwind v4 preset loaded:** `assets/tailwind-presets/wabi-sabi.css` with overrides:

```css
@theme inline {
  --color-primary: #7B8B6F;        /* Current season: spring (wakatake-iro) */
  --color-secondary: #2C2418;       /* Warm brown-black */
  --color-accent: #D4A0A0;          /* Fading cherry */
  --color-surface: #F5F0E8;         /* Warm unbleached paper */
  --color-on-surface: #2C2418;      /* NOT #111111 -- warmer */
  --color-muted: #8B7D6B;           /* Warm earth gray */

  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Cormorant Garamond', serif;

  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}
```

**Composition techniques applied (2+ required from style profile):**

1. **grain-overlay** (Pattern #6): Full-viewport noise texture at `position: fixed; pointer-events: none; mix-blend-mode: overlay; opacity: 0.04`. Simulates washi paper fiber across the entire page surface. The grain breaks the uncanny digital flatness and gives the screen a material presence.

2. **variable-font-morph** (Pattern #9): Cormorant Garamond's variable weight axis (300-700) animated on scroll via `font-variation-settings`. As the user scrolls through each section, heading weight shifts subtly from 300 to 400, creating a sense of the text "settling" into place -- like ink absorbing into paper.

**Seasonal palette system:**

The site implements a JavaScript-free seasonal rotation using CSS custom properties and a single `<meta>` tag:

```html
<meta name="season" content="spring">
```

A `data-season` attribute on `<html>` drives palette selection. The season is determined server-side based on the traditional Japanese 24 sekki calendar:

- **Spring (Risshun to Rikka, Feb 4 - May 5):** Young bamboo green + fading cherry
- **Summer (Rikka to Risshu, May 6 - Aug 7):** Deep moss + golden amber
- **Autumn (Risshu to Ritto, Aug 8 - Nov 7):** Persimmon + ginkgo gold
- **Winter (Ritto to Risshun, Nov 8 - Feb 3):** Ink stone gray + first snow

This means a visitor in April sees a different site than a visitor in November. The seasonal shift is subtle -- only the primary and accent colors change; the surface, on-surface, and muted tones remain constant. The effect mirrors the omakase experience: the structure is consistent, but the content (the seasonal catch) changes.

**Three-section narrative scroll structure:**

The website rejects the standard restaurant skeleton (hero > menu > about > reservation > footer). Instead, it unfolds as a three-act narrative mirroring the omakase experience:

**Act 1: Arrival (viewport 1-2)**
- Hero: Vertical calligraphy "記憶" with torn-edge washi paper texture, set against the warm paper surface. No navigation visible -- just the calligraphy and a single downward-pointing line (not an arrow -- a brushstroke line) inviting scroll.
- Transition: As the user scrolls, the calligraphy fades with `organic_drift` easing (2000ms, `cubic-bezier(0.37, 0, 0.63, 1)`), and a single line of text emerges: "Twelve seats. One evening. What the sea offers today."
- The rhythm is deliberately slow. Scroll distance between elements is 120vh, not 100vh. The user must commit to the pace.

**Act 2: The Counter (viewport 3-5)**
- A horizontal band of warm hinoki-wood-toned background (#D4C5A9) breaks the vertical scroll -- the counter. Text appears in two columns, asymmetrically placed (left column 40%, right 35%, 25% negative space):
  - Left: Chef Takeshi Moriyama's lineage, told in three sentences. Not a biography -- a provenance. "Trained at Sukiyabashi Jiro. Fifteen years at the cypress counter. Now, Brooklyn."
  - Right: The philosophy of the house, in the chef's voice. "I do not choose what to serve. The season chooses. I listen."
- Below the counter band: a single horizontal line (1px, #8B7D6B at 0.3 opacity) extends 60% of the viewport width, left-aligned. Intentionally not centered. The asymmetry is the wabi-sabi signature.

**Act 3: The Invitation (viewport 6-7)**
- Background shifts to the seasonal accent color at 0.08 opacity over the paper surface. The shift is so subtle it registers as a feeling, not a color change.
- "Seatings at 6:00 and 8:30. Wednesday through Saturday." -- no Resy widget, no calendar picker. A phone number in Cormorant Garamond Light. An email address. The friction is intentional: omakase requires commitment, and the reservation process should mirror that ethos.
- Final element: the seasonal kanji. In spring: "春" (haru). A single character, 200px, Cormorant Garamond weight 300, at 0.15 opacity. A watermark. A seal. A whisper.

**Motion implementation:**

All motion uses `organic_drift` at motion_intensity 2 (the lowest active tier):
- Scroll entry: `translateY(16px) + opacity: 0` with `cubic-bezier(0.37, 0, 0.63, 1)` over 600ms
- Stagger: `animation-delay: calc(var(--index) * 100ms)` -- slightly slower than the 80ms default, matching the "unhurried" brief
- Grain texture: static (no animation at intensity 2)
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)`

### Step 5: Quality Evaluation

**Composite quality scoring via `scripts/score-output-quality.ts`:**

```
+==========================================+
|         QUALITY SCORE CARD               |
+==========================================+
| Anti-Slop Gate     +++++++++- 9.0/10 (15%) |
| Code Standards     ++++++++-- 8.0/10 ( 8%) |
| Asset Quality      ++++++++-- 8.0/10 (12%) |
| Prompt Alignment   ++++++++-- 8.3/10 (15%) |
| Aesthetic          +++++++++- 9.0/10 (13%) |
| Style Fidelity     +++++++++- 9.0/10 (13%) |
| Distinctiveness    +++++++++- 9.0/10 (13%) |
| Hierarchy          ++++++++-- 8.5/10 ( 6%) |
| Color Harmony      ++++++++-- 8.5/10 ( 5%) |
+==========================================+
| COMPOSITE: 8.65/10  PASS                 |
| Minimum:   7.0/10                         |
+==========================================+
```

**Sub-score rationale:**

- **Anti-Slop Gate (9.0):** Zero banned patterns detected. No Inter font. No purple gradients. No pure black. No "Elevate your" copy. No hero-features-testimonials-CTA skeleton. The only deduction: body text and display use the same typeface family (Cormorant Garamond), which is intentional for wabi-sabi's restraint but technically reduces typographic contrast.

- **Code Standards (8.0):** Clean Tailwind v4 implementation. CSS custom properties for seasonal rotation. No JavaScript dependencies for core layout. Semantic HTML5 structure. Accessibility: WCAG AA contrast ratios verified for #2C2418 on #F5F0E8 (contrast ratio 9.4:1). Deduction: variable-font-morph implementation uses a scroll event listener instead of the preferred IntersectionObserver pattern.

- **Asset Quality (8.0):** Hero calligraphy generated at 1024x1536 (exceeds minimum). Washi paper grain texture SVG with proper viewBox. No raster images embedded in SVG. WebP format with PNG fallback configured. Deduction: single resolution provided (no 2x retina variant generated yet).

- **Prompt Alignment (8.3):** Strong match between crafted prompt and generated artifact. Calligraphy reads as authentic sumi ink. Paper texture has visible kozo fiber. Warm brown-black ink, not pure black. Asymmetric composition achieved. See Step 3 alignment breakdown for per-criterion scores.

- **Aesthetic (9.0):** The site makes you pause. The deliberate pacing, the extreme negative space, and the single calligraphic hero create an emotional gravity that is rare in restaurant websites. The hinoki-wood counter band is the moment of warmth in an otherwise austere composition. A design director would study this.

- **Style Fidelity (9.0):** Every wabi-sabi marker is present. Organic drift motion. Warm earth palette. Grain overlay. Asymmetric layout. Intentional imperfection (torn paper edges, 1-2px border irregularity). Variable font morph. Convention breaks from the taxonomy are meaningfully applied. The seasonal palette rotation is a premium pattern addition that deepens the style's philosophical commitment.

- **Distinctiveness (9.0):** This site would not be mistaken for any template or competitor. The "no food photography" decision, the seasonal palette rotation, the three-act narrative structure, and the vertical calligraphy hero are each individually distinctive. Together, they create a unified concept: the site IS the omakase experience. Someone encountering this site would remember it weeks later.

- **Hierarchy (8.5):** Clear three-tier hierarchy: calligraphy hero (primary), section headings in Cormorant Garamond 700 (secondary), body text in Cormorant Garamond 400 (supporting). The 120vh scroll distance between sections creates unambiguous separation. The single horizontal rule in Act 2 guides the eye without competing with the text. Slight deduction: the transition from Act 2 to Act 3 could use stronger spatial differentiation.

- **Color Harmony (8.5):** The warm earth palette is cohesive and unmistakably intentional. The seasonal rotation introduces only two new colors at a time, preserving harmony. The off-white surface (#F5F0E8) with warm brown-black text (#2C2418) creates a natural-material reading experience that avoids the harshness of white-on-black or the blandness of gray-on-white. Tinted neutrals throughout. Deduction: the hinoki-wood counter band (#D4C5A9) in Act 2 introduces a fifth color that is close to but not derived from the seasonal palette.

### Steps 6-10: Refinement

**Step 6: Annotation Findings**

The annotation agent (`prompt-crafter-annotation`) reviewed the generated output and flagged:

1. **Scroll listener concern:** The `variable-font-morph` pattern uses `window.addEventListener('scroll')` instead of `IntersectionObserver`. This violates the motion rules in VISUAL-REFINEMENT-VOCAB.md ("IntersectionObserver for scroll triggers -- never window scroll listeners"). **Fix:** Refactor to use IntersectionObserver with threshold array `[0, 0.25, 0.5, 0.75, 1.0]` to drive weight interpolation.

2. **Counter band color deviation:** The hinoki-wood background (#D4C5A9) is not in the defined palette. **Fix:** Derive from the muted token (#8B7D6B) at 0.15 opacity over the surface (#F5F0E8), producing a calculated warm-gray that stays within the palette system. The resulting color (#E8E0D4) reads as hinoki-adjacent without introducing an off-palette value.

3. **Mobile viewport pacing:** At 120vh section spacing, mobile users must scroll extensively through empty space. **Fix:** Reduce to 90vh on viewports below 768px via `@media (max-width: 767px)`. The intimacy is preserved; the physical effort is reduced.

4. **Missing lang attribute:** The hero calligraphy is Japanese, but the page `lang` is `en`. **Fix:** Wrap the calligraphy in `<span lang="ja">` for screen readers and proper font rendering.

**Step 7: Seasonal Rotation Enhancement**

The seasonal palette system was expanded to include a transition animation between seasons. On the day of a season change (determined by sekki calendar), the site displays a brief transition:

- The current season's kanji watermark fades out over 3 seconds (organic_drift curve)
- A 1-second pause (ma -- the intentional pause in Japanese aesthetics)
- The new season's kanji fades in over 3 seconds

This transition only fires on the exact date of the seasonal shift. For the remaining ~90 days, the palette is static. The rarity of the animation makes it a discovery moment -- a reward for returning visitors.

Server-side implementation: a simple date check returns the appropriate `data-season` value. No client-side JavaScript required for the base palette. The transition animation is CSS-only, triggered by a `data-season-transition` attribute added via a one-line server function that checks if today is a sekki transition date.

**Step 8: Image Optimization**

- Hero calligraphy: generated 2x retina variant at 2048x3072 via second fal.ai call with same seed (7291) and doubled dimensions. Both versions compressed to WebP with quality 85. File sizes: 1x = 142KB, 2x = 387KB. `<picture>` element with `srcset` for resolution switching.
- Grain texture: converted from PNG to inline SVG using `<feTurbulence>` filter, reducing from 48KB external asset to 0KB (generated in-browser). The SVG filter approach also ensures the grain scales perfectly at any resolution.

**Step 9: Convention Breaks Confirmed**

Final verification that all three user-requested convention breaks are maintained:

| Convention Break | Status | Implementation |
|---|---|---|
| No food photography | Confirmed | Hero is calligraphy. No `<img>` tags reference food. The single photographic element (if any) would be a texture, not a subject. |
| No menu prices | Confirmed | No price information anywhere on the page. The phrase "omakase" is used once; its meaning ("I'll leave it to you") is the price communication. |
| No reservation widget above the fold | Confirmed | Reservation information appears in Act 3 (viewport 6-7), behind approximately 500vh of scroll. Contact is phone + email, not a third-party widget. |

**Step 10: Accessibility Audit**

- Color contrast: #2C2418 on #F5F0E8 = 9.4:1 (passes WCAG AAA for normal text)
- Color contrast: #8B7D6B on #F5F0E8 = 3.8:1 (passes WCAG AA for large text only -- used only for muted/decorative elements)
- Focus indicators: custom `:focus-visible` ring using `outline: 2px solid #2C2418; outline-offset: 4px` -- visible, on-palette
- Reduced motion: all animations gated behind `@media (prefers-reduced-motion: no-preference)`. With reduced motion, content appears immediately without scroll entry animations.
- Screen reader: `aria-label` on the calligraphy hero ("Kioku, meaning memory, in Japanese calligraphy"). Alt text describes the visual for non-visual users.
- Keyboard navigation: tab order follows the three-act structure. Skip-to-content link provided.

### Step 11: Export

**Figma Tokens Studio JSON:**

```json
{
  "sushi-kioku": {
    "color": {
      "primary": { "value": "{season.primary}", "type": "color" },
      "secondary": { "value": "#2C2418", "type": "color" },
      "accent": { "value": "{season.accent}", "type": "color" },
      "surface": { "value": "#F5F0E8", "type": "color" },
      "on-surface": { "value": "#2C2418", "type": "color" },
      "muted": { "value": "#8B7D6B", "type": "color" }
    },
    "typography": {
      "display": {
        "fontFamily": { "value": "Cormorant Garamond", "type": "fontFamilies" },
        "fontWeight": { "value": "300", "type": "fontWeights" },
        "lineHeight": { "value": "1.2", "type": "lineHeights" },
        "letterSpacing": { "value": "-0.02em", "type": "letterSpacing" }
      },
      "body": {
        "fontFamily": { "value": "Cormorant Garamond", "type": "fontFamilies" },
        "fontWeight": { "value": "400", "type": "fontWeights" },
        "lineHeight": { "value": "1.7", "type": "lineHeights" },
        "letterSpacing": { "value": "0", "type": "letterSpacing" }
      }
    },
    "spacing": {
      "section-gap": { "value": "120vh", "type": "spacing", "description": "Reduced to 90vh on mobile" },
      "content-max-width": { "value": "680px", "type": "spacing" }
    },
    "motion": {
      "curve": { "value": "cubic-bezier(0.37, 0, 0.63, 1)", "type": "other" },
      "duration-entry": { "value": "600ms", "type": "other" },
      "duration-ambient": { "value": "3000ms", "type": "other" }
    },
    "season": {
      "spring": {
        "primary": { "value": "#7B8B6F", "type": "color" },
        "accent": { "value": "#D4A0A0", "type": "color" }
      },
      "summer": {
        "primary": { "value": "#4A6741", "type": "color" },
        "accent": { "value": "#C17817", "type": "color" }
      },
      "autumn": {
        "primary": { "value": "#8B4513", "type": "color" },
        "accent": { "value": "#C9A84C", "type": "color" }
      },
      "winter": {
        "primary": { "value": "#5B6E7A", "type": "color" },
        "accent": { "value": "#E8DCD0", "type": "color" }
      }
    }
  }
}
```

**Vercel deployment configuration:**

```json
{
  "framework": null,
  "buildCommand": null,
  "outputDirectory": ".",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```

The 1-hour cache on the root document allows seasonal palette changes to propagate within an hour of a sekki transition date. Assets are cached immutably since they include content hashes.

---

## Troubleshooting

### 1. Calligraphy hero looks too "digital-perfect"

**Symptom:** The generated calligraphy has uniform stroke width and pixel-perfect edges, losing the wabi-sabi imperfection.

**Cause:** The fal.ai model defaulted to a calligraphy style that is decorative rather than authentic. The prompt's anti-slop suffix may not have been weighted heavily enough.

**Fix:** Re-craft the prompt with stronger imperfection tokens: "visible brush fiber separation at stroke terminations, ink splatter micro-dots near directional changes, uneven ink density showing paper absorption variance." If the issue persists, escalate from Flux 1.1 Ultra to GPT Image 1.5 (`fal-ai/gpt-image-1.5`), which has stronger prompt adherence for specific textural details. Alternatively, run the generated image through `prompt-crafter-style-transfer` to apply a wabi-sabi texture pass.

### 2. Seasonal palette transition produces a flash of unstyled content

**Symptom:** On sekki transition dates, the page briefly shows the default palette before the seasonal class applies.

**Cause:** The `data-season` attribute is set by server-side logic, but if the page is served from a CDN edge cache, the previous season's HTML may be served.

**Fix:** Set `Cache-Control: public, max-age=3600` (1 hour) on the HTML document, not `immutable`. On sekki transition dates, the stale content expires within an hour. For immediate transition, add a client-side fallback: a `<script>` in `<head>` that checks `new Date()` against the sekki calendar and sets `data-season` before first paint. This is the only JavaScript on the page and executes in <1ms.

### 3. Grain overlay causes performance issues on mobile Safari

**Symptom:** Scroll jank on iPhone 12 and older when the grain overlay is active.

**Cause:** The `mix-blend-mode: overlay` on a full-viewport fixed element forces Safari to composite the entire page through the blend operation on every frame.

**Fix:** Replace the PNG/CSS grain with an SVG `<feTurbulence>` filter applied to a pseudo-element. Set `will-change: transform` on the grain layer and add `transform: translateZ(0)` to force GPU compositing. If jank persists on older devices, gate the grain behind `@supports (backdrop-filter: blur(1px))` as a proxy for GPU compositing support, or reduce grain opacity to 0.02 on mobile.

### 4. Cormorant Garamond renders inconsistently across browsers

**Symptom:** The variable font weight animation (300-700) works in Chrome but appears as discrete jumps in Firefox.

**Cause:** Firefox has limited support for `font-variation-settings` animation in some CSS animation contexts.

**Fix:** Use `@supports (font-variation-settings: normal)` to detect variable font support. For browsers without smooth interpolation, disable the weight animation and use static weight 400 for body, 300 for display. The wabi-sabi aesthetic does not depend on the animation -- it is a refinement, not a core feature. Ensure the Google Fonts import specifies the full axis range: `Cormorant+Garamond:ital,wght@0,300..700;1,300..700`.

### 5. Accessibility auditor flags the muted color contrast

**Symptom:** Automated accessibility tools flag #8B7D6B on #F5F0E8 as failing WCAG AA for normal text (3.8:1, needs 4.5:1).

**Cause:** The muted color is used for secondary text (dates, attribution lines) at body-text size.

**Fix:** Darken the muted token to #6B5D4B (contrast ratio 5.2:1, passing AA). Verify the new value still reads as "warm earth gray" and does not approach the on-surface color (#2C2418) too closely. The adjustment preserves the wabi-sabi warmth while meeting the accessibility floor.

---

## Anti-Slop Verification

Final anti-slop audit against the banned patterns in ANTI-SLOP.md:

### 1. Typography Check

| Check | Status | Evidence |
|---|---|---|
| No Inter font | PASS | Display and body use Cormorant Garamond exclusively |
| No Roboto / Open Sans | PASS | No sans-serif body text anywhere |
| No pure black (#000000) body text | PASS | All text uses #2C2418 (warm brown-black) |
| Minimum 3 weight tiers | PASS | Display 300, body 400, section headings 700 |
| Body line-height >= 1.5 | PASS | Set to 1.7 per wabi-sabi configuration |
| Heading tracking tight | PASS | letter-spacing: -0.02em on display type |

### 2. Color Check

| Check | Status | Evidence |
|---|---|---|
| No purple-to-blue gradient | PASS | Palette is exclusively warm earth tones |
| No Tailwind blue-500 default | PASS | No blue values in palette except winter primary (#5B6E7A, a gray-blue) |
| 60/30/10 color ratio | PASS | 60% surface (#F5F0E8), 30% on-surface (#2C2418), 10% seasonal accent |
| No pure #000000 backgrounds | PASS | Darkest background is the hinoki counter band (#E8E0D4), which is a warm mid-tone |
| Tinted neutrals, not gray | PASS | Muted (#8B7D6B) has warm earth undertone, not neutral gray |

### 3. Layout Check

| Check | Status | Evidence |
|---|---|---|
| No hero-features-testimonials-CTA skeleton | PASS | Three-act narrative structure replaces standard landing page skeleton |
| At least one section breaks column grid | PASS | Act 2 uses asymmetric two-column (40%/35%) with 25% negative space |
| Varied vertical padding | PASS | Section spacing varies: 120vh (Acts 1-2 transition), 80vh (within Act 2), 100vh (Acts 2-3 transition) |
| No identical card grids | PASS | No cards used. Content is text-only with calligraphic hero. |

### 4. Motion Check

| Check | Status | Evidence |
|---|---|---|
| No linear easing | PASS | All transitions use organic_drift curve: cubic-bezier(0.37, 0, 0.63, 1) |
| No simultaneous element mount | PASS | Staggered entry at 100ms intervals per element |
| No 300ms transition-all hover | PASS | Hover transitions use targeted opacity with 200ms organic_drift curve |
| No fade-in-from-bottom on every scroll entry | PASS | Entry animation varies: calligraphy fades in place (no transform), text enters with 16px translateY, counter band enters with 0px translateY (opacity only) |
| prefers-reduced-motion respected | PASS | All animation wrapped in @media query |

### 5. Copy Check

| Check | Status | Evidence |
|---|---|---|
| No "Elevate your" | PASS | Copy is written in the chef's voice, specific and concrete |
| No "Seamless experience" | PASS | No marketing superlatives anywhere on the page |
| No Lorem Ipsum | PASS | All copy is contextual: chef lineage, philosophy, seasonal reference |
| No generic placeholder names | PASS | Chef name (Takeshi Moriyama), restaurant name (Sushi Kioku) -- plausible and specific |
| No "Next-Gen" / "Game-changer" | PASS | The site does not describe itself. It presents the restaurant. |

**Anti-slop verdict: 0 violations detected. Score: 9.0/10.**

The 1-point deduction reflects the inherent risk of single-typeface-family usage (Cormorant Garamond for both display and body). While this is a deliberate wabi-sabi choice (restraint over variety), it triggers the "uniform font" concern at a surface level. The typographic hierarchy is maintained through weight contrast (300 vs 400 vs 700), size contrast (200px calligraphy vs 18px body), and tracking contrast (-0.02em display vs 0em body), which is sufficient to avoid the underlying problem the anti-slop rule targets.
