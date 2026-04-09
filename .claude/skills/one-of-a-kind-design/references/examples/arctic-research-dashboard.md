# Arctic Research Dashboard

> **Pipeline walkthrough example** | one-of-a-kind-design skill
> Demonstrates: swiss-international + generative-art cross-pollination, data dashboard output type, science industry routing, Generative Canvas hero archetype, composite quality scoring

---

## Scenario

User says:

> "We're a climate nonprofit. Our researchers need an internal dashboard showing real-time Arctic ice shelf fragmentation data. It needs to be beautiful enough that when we screenshot it for donor presentations, it tells the story without explanation."

This message is deceptively rich. It contains multiple extraction dimensions hiding beneath casual language, a tension between functional data density and emotional storytelling, and an explicit convention-breaking signal: a data dashboard that prioritizes beauty over information density. The pipeline must resolve all of these without asking clarifying questions.

---

## Creative Brief

| Field | Value | Extraction Source |
|-------|-------|-------------------|
| **Client** | Polar Watch Collective (climate nonprofit) | User message: "climate nonprofit" |
| **Output type** | web-app | User message: "dashboard" maps to dense web-app |
| **Industry** | Sustainability / Climate + Science | "climate nonprofit," "researchers," "Arctic ice shelf fragmentation data" |
| **Audience** | Climate researchers + donor board | "Our researchers" (primary), "donor presentations" (secondary) |
| **Age range** | 28-60 | Inferred: research scientists skew 30-55, board members 45-65 |
| **Mood** | Urgent, beautiful, authoritative | "beautiful enough," "tells the story," plus climate urgency context |
| **Primary style** | swiss-international | Authority + data clarity for scientific audience |
| **Secondary style** | generative-art | "Beautiful enough" + convention-breaking signal for donor impact |
| **Convention-breaking** | Data dashboard prioritizes emotional impact over information density | "tells the story without explanation" |
| **Quality emphasis** | Color harmony (9), Hierarchy (9), Aesthetic (8) | Donor presentation screenshot requirement demands visual polish |

---

## Pipeline Walkthrough

### Step 0: Message Enhancement

**Specificity score: 5/7** (output type, industry, mood, audience, convention-breaking detected; explicit style and quality emphasis inferred)

**Dimensions extracted:**

1. **Output type** -- "dashboard" detected. Maps to web-app with visual_density 6-8 baseline. However, the convention-breaking signal will modulate this downward.
2. **Industry** -- "climate nonprofit" triggers Sustainability / Climate route from AUDIENCE-ROUTES. Primary styles for this industry: solarpunk, wabi-sabi, scandinavian-minimalism, resonant-stark. Avoid list: y2k-revival, vaporwave, pop-art, hdr-hyperrealism. However, the user's emphasis on authority and data suggests swiss-international over the softer sustainability defaults.
3. **Mood** -- "beautiful" + "tells the story" + climate urgency = urgent, beautiful, authoritative. The word "story" signals narrative structure, not just data display.
4. **Audience** -- Dual audience creates a design tension. Researchers need data legibility and scientific credibility. Donor board needs emotional resonance and screenshot-ready polish. Swiss-international serves the researchers; generative-art serves the donors.
5. **Convention-breaking** -- "beautiful enough that when we screenshot it for donor presentations" is the key phrase. This breaks the dogma that dashboards are utilitarian information tools. The convention break: data visualization as art, not just communication.
6. **Quality emphasis** -- Inferred from "donor presentations" context. When someone screenshots a dashboard for a pitch deck, color harmony, visual hierarchy, and aesthetic quality are the difference between a compelling slide and a cluttered data dump.
7. **Explicit style** -- Not directly named, but the intersection of authority, data density, and scientific credibility points strongly to swiss-international as the structural foundation.

**Enhancement injection:** The system resolves this as a swiss-international primary with generative-art secondary, which maps precisely to the "Data Impressionism" cross-pollination territory -- but pulled toward precision rather than painterliness. We are not doing Data Impressionism (impressionism + noise-field). We are doing Swiss Data Art: strict Muller-Brockmann grid discipline governing generative particle visualizations.

### Step 0c: UX Research

**Research targets for data dashboard UX in scientific visualization:**

- **Edward Tufte's principles:** High data-ink ratio, small multiples, sparklines. The Swiss grid naturally enforces these.
- **Climate data visualization best practices:** Time-series as primary axis, geographic context always visible, severity color coding that avoids red-green colorblind conflicts.
- **Dashboard screenshot optimization:** At 1920x1080, every element must be legible without zooming. This means minimum 14px body text, high-contrast labels, and no tooltip-dependent information -- everything critical is always visible.
- **Dual-audience resolution:** Researchers get the data density they need through well-structured panels. Donors get the emotional impact through the generative hero visualization and the color narrative. The same dashboard serves both by layering: at a glance (donors see beauty and urgency), on closer inspection (researchers see data and precision).

### Step 1: Style Resolution

**Primary: swiss-international**

- **Source:** STYLE-INDEX.md -- Cultural & Regional Aesthetics category
- **Tags:** minimalist, precise, ordered, clean, monochromatic
- **Motion signature:** mechanical_snap -- `cubic-bezier(0.77, 0, 0.175, 1)`, 150-300ms duration
- **Why swiss-international gives authority:** Swiss/International Style was literally designed for information systems. Josef Muller-Brockmann's grid systems were created to organize complex data in Swiss railway timetables, pharmaceutical instructions, and municipal signage. When a researcher sees Helvetica on a mathematical grid with precise alignment, they unconsciously read "this data has been rigorously organized by someone who takes precision seriously." It is the opposite of decoration -- it is structural honesty. For a scientific audience, this typeface and grid system say "we respect the data enough to present it without embellishment."

**Secondary: generative-art**

- **Source:** STYLE-INDEX.md -- Generative / Algorithmic Styles category
- **Tags:** abstract, organic, futuristic, polychromatic, chaotic
- **Motion signature:** organic_drift -- `cubic-bezier(0.37, 0, 0.63, 1)`, 2000-20000ms ambient loops
- **Why generative-art for the hero:** The fragmentation data IS generative art. Real ice shelf calving events produce fractal patterns. Particle systems can represent actual fragmentation vectors -- each particle is a data point, each flow line is a fracture propagation path. The visualization is not decorative; it IS the data, rendered as art.

**Typography resolution:**

- **Display:** Helvetica Neue (swiss-international canonical choice from Tailwind preset `--font-display`)
- **Data/mono:** DM Mono (from TYPEFACE-LIBRARY Monospace section -- clean, readable, designed for data-dense interfaces)
- **Why not Inter:** Anti-slop rule -- Inter is the statistical mode of AI-generated UIs. Helvetica Neue is deliberate: it IS the Swiss International Style. Using Inter for swiss-international would be like doing Art Deco without geometric shapes.

**Color palette: Glacial-to-Volcanic**

| Token | Hex | Role |
|-------|-----|------|
| `--color-surface` | #0B1120 | Deep polar night -- primary background |
| `--color-on-surface` | #E8ECF1 | Ice-white text on dark surfaces |
| `--color-primary` | #3B82F6 | Glacial blue -- healthy ice indicator |
| `--color-accent` | #EF4444 | Volcanic red -- critical fragmentation alert |
| `--color-warning` | #F59E0B | Amber -- moderate stress zones |
| `--color-safe` | #06B6D4 | Cyan -- stable shelf regions |
| `--color-muted` | #475569 | Slate -- secondary labels, gridlines |

This palette serves dual duty: the blue-to-red severity gradient is scientifically intuitive (cold = stable, hot = fragmenting) and visually dramatic for donor screenshots. The dark surface (#0B1120 rather than pure #000000, per anti-slop rules) gives generative particle visualizations maximum contrast and a sense of the polar night.

**Creative dials:**

| Dial | Value | Rationale |
|------|-------|-----------|
| Design variance | 5 | Swiss grid provides structure; generative hero provides controlled variance |
| Motion intensity | 6 | Ambient particle drift for the hero (organic_drift), mechanical_snap for UI interactions |
| Visual density | 5 | Convention break: lower than typical dashboard density (7-8) to allow breathing room for donor-screenshot aesthetics |
| Color restraint | 4 | Five functional colors on dark background; not monochromatic (swiss default) but not polychromatic |

### Step 2: Hero Asset Conception

**Archetype selected: Generative Canvas**

- **Source:** HERO-ASSET-ARCHETYPES.md, Archetype #3
- **Why Generative Canvas:** The generative-art secondary style's motion_signature is organic_drift, which maps directly to the Generative Canvas archetype. The hero will be a real-time particle system visualization of Arctic ice shelf fragmentation data.
- **Format:** Canvas-based particle simulation with cursor interaction
- **Key techniques applied:**
  - Canvas-based particle simulation where each particle represents a data-derived fragmentation vector
  - Perlin noise field steering particle flow to simulate ice fracture propagation patterns
  - Parameter-driven variation: particle density maps to fragmentation severity, flow direction maps to crack propagation, color maps to temperature gradient
  - requestAnimationFrame-throttled at 60fps with will-change on the canvas element only
  - Cursor acts as a "heat probe" -- hovering over regions increases local particle energy, revealing fragmentation stress lines

**Composition technique selections (2+ premium_component_patterns required):**

1. **Asymmetric Bento Grid** (bento-grid) -- Variable-sized dashboard panels in CSS Grid. The hero particle visualization occupies a span-3 featured tile. Metric cards vary in size based on data importance. Works with swiss-international tags: geometric, ordered, precise, clean.

2. **Fixed Noise/Grain Texture** (grain-overlay) -- Full-viewport noise texture at 0.03 opacity with mix-blend-mode: overlay. This bridges the digital precision of the Swiss grid with the organic quality of the generative visualization. Adds analog depth to the dark surface. Works with generative-art tag: organic.

3. **Cursor-Tracking Spotlight Border** (spotlight-border) -- Applied to the primary data panels. The border illuminates glacial blue (#3B82F6) under cursor position, providing interactive feedback that reinforces the cold/ice theme. Works with tags: futuristic, dimensional.

### Step 3: Prompt Crafting + Generation

**Route:** `prompt-crafter-image-gen` via `scripts/generate-api-prompt.ts`
**Target:** fal.ai Flux Pro (high-fidelity image generation for the static hero fallback and OG image)

The hero is primarily a real-time canvas animation, but we generate a static image for: (a) the `<noscript>` fallback, (b) Open Graph social preview, and (c) the donor presentation screenshot mode where animation freezes to a single optimized frame.

**Crafted prompt (following FAL-PROMPT-SYSTEMS structure):**

```
Generative art algorithmic particle visualization. Thousands of luminous cyan #06B6D4
and glacial blue #3B82F6 particles flowing across a deep polar-night background #0B1120,
forming fracture-line patterns that suggest ice shelf calving viewed from satellite
altitude. Flow lines converge toward a central fragmentation zone where particles shift
to volcanic red #EF4444 and amber #F59E0B, density increasing to represent stress
concentration. Mathematical precision in particle distribution -- visible grid-alignment
in the calm blue regions dissolving into organic turbulence in the red zones. Perlin
noise flow field visible in particle trajectories. Sparse, atmospheric, vast negative
space in upper-left suggesting Arctic emptiness. 8K resolution, sharp particle edges,
no motion blur, scientific visualization aesthetic. No watermarks, no text, no blurry
edges, no generic gradient background, no centered-subject composition.
```

**Prompt structure audit:**
1. STYLE TOKEN: "Generative art algorithmic particle visualization" -- anchors to taxonomy style
2. SUBJECT: "Thousands of luminous cyan and glacial blue particles" -- concrete and specific
3. COMPOSITION: "Sparse, atmospheric, vast negative space in upper-left" -- asymmetric, not centered
4. LIGHTING & ATMOSPHERE: "deep polar-night background," "luminous particles" -- self-lit particles on dark field
5. MATERIAL & TEXTURE: "sharp particle edges, no motion blur" -- digital precision
6. COLOR PALETTE: Four hex values (#06B6D4, #3B82F6, #EF4444, #F59E0B) -- explicit from resolved palette
7. QUALITY MARKERS: "8K resolution, scientific visualization aesthetic"
8. ANTI-SLOP SUFFIX: "No watermarks, no text, no blurry edges, no generic gradient background, no centered-subject composition"

**Generation result:** Image generated at 2048x1152 (16:9 for dashboard hero proportions).

**Prompt-artifact alignment check:** Run via `scripts/validate-prompt-artifact-alignment.ts`

| Criterion | Weight | Score | Notes |
|-----------|--------|-------|-------|
| style_fidelity | 0.25 | 8.5 | Clearly generative-art; particle distribution reads as algorithmic |
| palette_accuracy | 0.20 | 8.0 | Blues and cyans dominant, red/amber zone present and correctly positioned |
| subject_clarity | 0.15 | 8.0 | Particle flow lines visible, fracture convergence zone clear |
| composition_match | 0.15 | 7.5 | Negative space in upper region; slightly less asymmetric than prompted |
| anti_slop | 0.15 | 9.0 | No watermarks, no text, no centered subject, no gradient cliche |
| texture_grain | 0.10 | 8.0 | Sharp particle edges, digital precision maintained |

**Weighted average: 8.2 -- PASS** (threshold: >= 7.0)

No auto-regeneration needed. Proceed to dashboard generation.

### Step 4: One-Shot Dashboard Generation

**Output type:** web-app using React with Tailwind v4
**Tailwind preset:** `assets/tailwind-presets/swiss-international.css` (customized with the glacial-to-volcanic palette overrides)

**Dashboard architecture (6 panels in asymmetric bento grid):**

```
+------------------------------------------+------------------+
|                                          |  TOTAL SHELF     |
|        FRAGMENTATION PARTICLE            |  AREA (km2)      |
|        VISUALIZATION (HERO)              |  [sparkline]     |
|        [Canvas, span-3]                  +------------------+
|                                          |  FRAGMENTATION   |
|                                          |  RATE (km2/day)  |
|                                          |  [sparkline]     |
+------------------+-----------------------+------------------+
|  SEVERITY MAP    |  TIME-SERIES: 12-MONTH FRAGMENTATION     |
|  [Arctic top-    |  [area chart, Helvetica Neue labels,     |
|   down view]     |   glacial-to-volcanic gradient fill]     |
+------------------+-----------------------------------------+
|  ACTIVE ALERTS                          |  SHELF STABILITY  |
|  [table: shelf name, status, trend]     |  INDEX: 3.2/10    |
+------------------------------------------+------------------+
```

**Swiss grid implementation:**

- 12-column grid at 1440px viewport: `grid-template-columns: repeat(12, 1fr)` with `gap: 2px` (Swiss precision -- hairline gaps, not chunky padding)
- Hero particle visualization: `grid-column: 1 / 10; grid-row: 1 / 3` -- dominant, asymmetric placement
- Metric cards: `grid-column: 10 / 13` -- right-aligned secondary column
- No border-radius anywhere: `--radius-sm: 0px; --radius-md: 0px; --radius-lg: 0px` (per swiss-international preset -- sharp corners are a style signature)
- Zero box-shadow on panels (per preset: `--shadow-sm: none; --shadow-md: none`) -- hierarchy through color and size, not elevation

**Severity color coding system:**

| Status | Color | Hex | Meaning |
|--------|-------|-----|---------|
| Stable | Cyan | #06B6D4 | No significant fragmentation detected |
| Moderate | Amber | #F59E0B | Increased stress, monitoring recommended |
| Critical | Red | #EF4444 | Active fragmentation, immediate attention |
| Baseline | Blue | #3B82F6 | Reference measurement, normal variance |

Colors are never used alone (GUARDRAILS: color independence). Every severity level pairs with: a text label ("STABLE," "CRITICAL"), an icon (shield-check, alert-triangle), and a shape-coded indicator (circle for stable, triangle for moderate, diamond for critical).

**Donor screenshot optimization:**

- The dashboard includes a "Presentation Mode" toggle (top-right, DM Mono label) that:
  - Freezes the particle animation to its most visually striking frame
  - Increases type size by 15% for projection legibility
  - Adds a subtle bottom attribution bar: "Polar Watch Collective | Arctic Ice Shelf Monitoring | [date]"
  - Ensures the viewport captures cleanly at 1920x1080 with no scrollbar

**Motion implementation:**

- Hero particle canvas: organic_drift signature, 8-second ambient loop, `cubic-bezier(0.37, 0, 0.63, 1)`
- Panel transitions on data refresh: mechanical_snap, `cubic-bezier(0.77, 0, 0.175, 1)`, 200ms
- Sparkline updates: 150ms mechanical_snap for number changes, staggered by `calc(var(--index) * 80ms)`
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)`
- Particle canvas respects reduced-motion by displaying the static fallback image

### Step 5: Quality Evaluation

**Composite Quality Score Card:**

| Sub-Score | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Anti-slop gate | 0.15 | 8.5 | Helvetica Neue (not Inter), off-black avoided via dark theme, no purple-blue gradient, no shadow-md, varied section rhythm, grain overlay on surface |
| Code standards | 0.08 | 8.0 | Bun-only runtime, Effect.gen for async, TypeScript strict, no any types, nesting depth <= 3 |
| Asset quality | 0.12 | 8.0 | Hero image at 2048x1152 WebP, canvas renders at device pixel ratio, proper viewBox on all SVG icons |
| Prompt-artifact alignment | 0.15 | 8.2 | See Step 3 detailed breakdown |
| Aesthetic | 0.13 | 8.5 | Dark polar atmosphere is striking, particle visualization creates emotional response, typography is precise and considered |
| Style fidelity | 0.13 | 8.0 | Swiss grid clearly implemented (12-col, zero radius, no shadows, Helvetica Neue), generative secondary visible in hero |
| Distinctiveness | 0.13 | 8.5 | No one has seen a climate dashboard that looks like this -- the particle hero is unique, the severity-as-temperature palette is original |
| Hierarchy | 0.06 | 9.0 | Hero dominates, metric cards are secondary, time-series provides detail, alerts are scannable -- four clear tiers of visual importance |
| Color harmony | 0.05 | 9.0 | Glacial-to-volcanic palette is internally coherent, scientifically meaningful, and visually dramatic against the dark surface |

**Composite calculation:**

```
(8.5 * 0.15) + (8.0 * 0.08) + (8.0 * 0.12) + (8.2 * 0.15) + (8.5 * 0.13)
+ (8.0 * 0.13) + (8.5 * 0.13) + (9.0 * 0.06) + (9.0 * 0.05)
= 1.275 + 0.64 + 0.96 + 1.23 + 1.105 + 1.04 + 1.105 + 0.54 + 0.45
= 8.345
```

**Composite: 8.3/10 -- PASS** (threshold: >= 7.0)

No sub-score below 7.0. No hard-stop triggered. Output is cleared for delivery.

### Steps 6-10: Refinement

**Step 6: Accessible contrast ratios**

The dark background (#0B1120) creates excellent contrast for light text (#E8ECF1), measuring 14.8:1 -- far exceeding WCAG AAA (7:1). However, the muted label color (#475569 slate) on dark background only achieves 4.2:1, which barely passes AA for normal text. Refinement: adjust muted to #94A3B8 (lighter slate), achieving 7.1:1 -- AAA compliant. All severity colors are tested against both the dark surface and the panel backgrounds. Amber (#F59E0B) on dark (#0B1120) achieves 8.4:1. Red (#EF4444) on dark achieves 5.2:1, meeting AA. Cyan (#06B6D4) on dark achieves 6.8:1, meeting AA for large text; add bold weight to cyan-labeled elements to qualify as large text equivalent.

**Step 7: Data density optimization**

The initial visual_density setting of 5 creates enough breathing room for donor aesthetics but risks frustrating researchers who need more data visible without scrolling. Resolution: implement a "Density" toggle (compact / comfortable / spacious) that adjusts `--spacing-md` from 12px to 16px to 24px and scales grid row heights proportionally. Default is "comfortable" (the designed density-5 state). Researchers can switch to "compact" for scan-heavy work sessions.

**Step 8: Particle performance optimization**

Canvas particle count calibrated by device capability. High-end devices (devicePixelRatio >= 2, navigator.hardwareConcurrency >= 8): 3000 particles. Mid-range: 1500 particles. Low-end / reduced-motion preference: static fallback image. requestAnimationFrame loop with delta-time normalization to maintain consistent flow speed regardless of frame rate. Canvas resolution matches device pixel ratio to prevent blur on Retina displays.

**Step 9: Typography refinement**

Three weight tiers established (per anti-slop typography rules):
- Display (panel titles): Helvetica Neue Bold (700), 13px, uppercase, tracking +0.08em
- Body (data labels): Helvetica Neue Regular (400), 14px, tracking +0.01em
- Data values: DM Mono Medium (500), 24px for primary metrics, 16px for secondary
- Max line length constrained to 65ch on any prose element (alert descriptions)
- Heading tracking is tight but not overly so -- Swiss style uses slightly wider tracking than editorial styles

**Step 10: Color-blind safe severity palette**

The glacial-to-volcanic gradient (blue-cyan-amber-red) is already relatively safe for the most common form of color blindness (deuteranopia/protanopia -- red-green confusion), because the palette uses blue-amber-red rather than green-amber-red. However, to fully safeguard: add pattern fills to severity zones on the map (diagonal hatch for critical, dots for moderate, solid for stable) and ensure shape-coding accompanies every color indicator.

### Step 11: Export

**Deployment configuration: Vercel**

```json
{
  "framework": "react",
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "env": {
    "POLAR_WATCH_API_ENDPOINT": "@polar-watch-api-url",
    "FAL_KEY": "@fal-key"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

Export package structure follows TOOL-EXPORT-TEMPLATES.md:

```
polar-watch-dashboard-vercel-export/
  README.md
  QUALITY-REPORT.md             # Composite: 8.3/10 PASS
  STYLE-SPEC.md                 # swiss-international + generative-art
  assets/
    images/
      hero-fallback.webp        # 2048x1152, static particle visualization
      og-image.png              # 1200x630, Open Graph preview
    svg/
      icon-shield-check.svg     # Stable status icon
      icon-alert-triangle.svg   # Moderate status icon
      icon-alert-diamond.svg    # Critical status icon
  design-tokens/
    tokens.json                 # Full glacial-to-volcanic palette + spacing
    variables.css               # CSS custom properties
  vercel.json                   # Deployment configuration
```

---

## Troubleshooting

### 1. Particle canvas causes layout shift on load

**Symptom:** The bento grid jumps when the canvas element initializes, pushing metric cards down momentarily.

**Cause:** Canvas element has no explicit dimensions before JavaScript executes, so the grid auto-sizes the cell to 0 height.

**Fix:** Set explicit `aspect-ratio: 16/9` on the canvas container and `min-height: 400px` as a CSS-only sizing baseline. The canvas then fills an already-allocated space rather than claiming it after load.

### 2. Severity colors appear washed out on low-contrast displays

**Symptom:** Amber and red severity indicators lose urgency on older monitors or projectors (the exact scenario for donor presentations).

**Cause:** The dark background absorbs light on low-brightness displays, reducing perceived contrast.

**Fix:** In Presentation Mode, increase the severity color saturation by 15% and add a subtle `text-shadow: 0 0 8px currentColor` glow to severity labels. This ensures legibility even on washed-out projectors. Also provide a light-mode Presentation Mode variant for high-ambient-light conference rooms.

### 3. DM Mono renders inconsistently across browsers

**Symptom:** Data values in DM Mono show different metrics alignment in Firefox vs. Chrome due to font metric differences.

**Fix:** Use `font-variant-numeric: tabular-nums` on all numeric data elements. This forces fixed-width digit rendering regardless of the default font metrics, ensuring columns of numbers align perfectly. Also add `font-feature-settings: 'tnum' 1` as a fallback for browsers with partial OpenType support.

### 4. Generative hero conflicts with prefers-reduced-motion

**Symptom:** Users with reduced-motion preferences see a blank hero area because the canvas animation is suppressed but no fallback is loaded.

**Fix:** Detect `prefers-reduced-motion: reduce` via `matchMedia` at initialization. When active, skip canvas setup entirely and render the static WebP fallback (`hero-fallback.webp`) via an `<img>` element with the same grid placement. The fallback image IS the most visually striking frame from the particle animation, so the aesthetic quality is preserved without motion.

### 5. Bento grid collapses poorly on mobile viewports

**Symptom:** Below 768px, the 12-column grid compresses panels into illegibly narrow columns.

**Fix:** At the `md` breakpoint (768px), switch to a single-column stacked layout with the hero visualization at half-height (aspect-ratio: 2/1 instead of 16/9), metric cards as a horizontal scroll row, and the time-series chart at full width. The alert table becomes a vertical card list. Mobile is not the primary use case (internal researchers use desktops) but must degrade gracefully for on-the-go board members checking on phones.

---

## Anti-Slop Verification

Every output must pass these checks before delivery. Each item references a specific rule from ANTI-SLOP.md.

### 1. Typography: No Inter, No Roboto, No Arial

**Check:** The dashboard uses Helvetica Neue for display/body and DM Mono for data values. Neither Inter nor Roboto appears anywhere in the font stack. The system fallback chain is `'Helvetica Neue', 'Helvetica', 'Arial', sans-serif` -- Arial appears only as a last-resort system fallback, never as a design choice.

**Anti-slop rule:** "Inter as the default typeface -- Statistical mode of every AI code generator." PASSED: Helvetica Neue is a deliberate choice that IS the Swiss International Style.

### 2. Color: No purple-to-blue gradient on white background

**Check:** The palette is glacial-to-volcanic (cyan, blue, amber, red) on a deep polar-night dark surface (#0B1120). There is no purple anywhere in the palette. The background is rich near-black with color undertone, not pure #000000 (anti-slop rule: "Pure #000000 backgrounds -- Lifeless and flat"). No Tailwind default blue-500 used -- the blue (#3B82F6) is contextually chosen to represent glacial ice, not because it is a framework default.

**Anti-slop rule:** "Purple-to-blue gradient on white background -- the single most overused AI-generated color scheme." PASSED: No purple, no white background, no gradient as decoration.

### 3. Layout: No hero-features-testimonials-CTA skeleton

**Check:** The dashboard is a bento grid with asymmetric panel sizes, not a stacked section layout. There is no "hero section with oversized H1, subtitle, and two buttons." The hero IS the data visualization itself. There are no "three-column features," no "testimonials," and no "CTA footer." The layout is a functional data instrument, not a marketing page.

**Anti-slop rule:** "Hero section -> three-column features -> testimonials -> CTA footer -- The skeleton of every AI-generated landing page." PASSED: Layout is purpose-built for data, not templated from a landing page.

### 4. Shadows: No Tailwind default shadow-md/lg/xl

**Check:** The swiss-international Tailwind preset explicitly sets all shadows to `none` (`--shadow-sm: none; --shadow-md: none; --shadow-lg: none`). Hierarchy is achieved through background color differences between panels and the dark surface, size variation in the bento grid, and typography weight. Zero box-shadows in the entire dashboard. The only shadow-like effect is the `text-shadow` glow on severity labels in Presentation Mode, which is a deliberate contextual choice, not a generic elevation.

**Anti-slop rule:** "Tailwind default shadow-md, shadow-lg, shadow-xl -- Generic depth that belongs to no style." PASSED: No shadows at all, consistent with swiss-international style profile.

### 5. Motion: No linear easing, no fade-in-from-bottom on everything

**Check:** Two motion signatures are used deliberately: mechanical_snap (`cubic-bezier(0.77, 0, 0.175, 1)`, 150-200ms) for UI state changes and data updates, and organic_drift (`cubic-bezier(0.37, 0, 0.63, 1)`, 2000-8000ms) for the ambient particle hero. No element uses `linear` easing. No element uses `fade-in-from-bottom` as its scroll entry animation. Panel entries on initial load use mechanical_snap with a stagger: `animation-delay: calc(var(--panel-index) * 80ms)` -- panels snap into place in sequence, not simultaneously, not with a bounce, and not from below.

**Anti-slop rule:** "Linear easing on all transitions -- Robotic" and "Fade-in-from-bottom on every scroll entry -- Overused AI default." PASSED: Easing curves match the resolved motion signatures exactly.

### 6. Copy: No slop phrases

**Check:** Dashboard labels use precise scientific language: "Fragmentation Rate (km2/day)" not "Seamless Ice Analytics." "Shelf Stability Index" not "Elevate Your Research." "Active Alerts" not "Unlock Insights." No marketing copy exists in the dashboard -- it is a data instrument with functional labels. The attribution bar reads "Polar Watch Collective | Arctic Ice Shelf Monitoring" -- factual, not aspirational.

**Anti-slop rule:** Implicit in the overall anti-slop philosophy: "every element passes the 'would a design director approve this?' test." PASSED: Zero AI-generated marketing language.

---

## Key Takeaways

1. **Dual-audience dashboards require layered design.** The same layout serves researchers (data density, precision) and donors (emotional impact, screenshot beauty) by making the hero visualization both functional and artistic.

2. **Swiss-international is the natural home for scientific dashboards.** Its zero-radius, zero-shadow, grid-strict philosophy communicates the rigor that scientific audiences expect. The generative-art secondary adds the emotional dimension that donor audiences need without compromising the structural authority.

3. **Convention-breaking "beautiful dashboard" is achieved through the hero visualization, not through decorating the data panels.** The data panels remain Swiss-precise and information-dense. The beauty comes from the particle canvas that occupies the dominant grid position -- a single element doing double duty as data visualization and hero art.

4. **Color palette should derive from the data domain.** Glacial-to-volcanic is not an arbitrary aesthetic choice -- it maps directly to the scientific meaning of the data (cold = stable, hot = fragmenting). When the palette IS the data, everything feels coherent rather than decorated.

5. **Donor-screenshot optimization is a legitimate design constraint.** Presentation Mode is not an afterthought -- it is a first-class feature that acknowledges the real workflow: researchers work in the dashboard daily, but the dashboard's impact on funding depends on how it looks in a slide deck. Designing for both contexts is the brief.
