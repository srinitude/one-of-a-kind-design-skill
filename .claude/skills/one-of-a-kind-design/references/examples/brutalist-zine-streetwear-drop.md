# Brutalist Zine Streetwear Drop

> Reference example walkthrough | one-of-a-kind-design skill
> Output type: image (series) | Styles: brutalist-web + risograph | Industry: fashion

---

## Scenario

User says: "Tokyo streetwear label dropping a 12-piece capsule collection. Need a digital zine -- not a lookbook. Think photocopied flyers stapled together, but for $400 hoodies. Raw, confrontational, illegible on purpose."

This request carries a productive contradiction at its core: the client is selling luxury-priced garments but wants the visual language of anti-establishment print culture. A lookbook says "please buy this." A zine says "we don't care if you buy this." That studied indifference is exactly what makes $400 hoodies sell to the target audience. The pipeline must honor this tension at every stage -- producing something that looks careless but is, in fact, meticulously constructed.

---

## Creative Brief

- **Client:** KURO (Tokyo streetwear label)
- **Output type:** image (series of 6 zine spreads)
- **Industry:** fashion
- **Audience:** Streetwear collectors, 18-30, hypebeast-adjacent but with design literacy. They know who Neville Brody is. They can spot a fake distressed texture from thirty feet away.
- **Mood:** raw, confrontational, illegible-on-purpose
- **Style:** brutalist-web crossed with risograph
- **Convention-breaking:** Luxury product photography that is intentionally lo-fi. Typography barely readable. No product grid. No "Shop Now" button energy.
- **Quality emphasis:** Style fidelity (target 9/10), Distinctiveness (target 9/10)
- **Dials (resolved):**
  - `design_variance`: 9 (radical -- broken grid, elements bleeding off-frame, art-direction-level composition)
  - `motion_intensity`: 1 (static images -- no motion needed)
  - `visual_density`: 7 (dense -- multiple overlapping layers per spread, minimal padding, information overload aesthetic)
  - `audience_formality`: 2 (casual verging on confrontational -- zine culture is anti-formality by definition)

---

## Pipeline Walkthrough

### Step 0: Message Enhancement (specificity 6/7)

**Extraction across 7 dimensions:**

| Dimension | Detected | Signal |
|-----------|----------|--------|
| Output type | image (series) | "digital zine," "6 spreads" |
| Industry | fashion / streetwear | "Tokyo streetwear label," "capsule collection," "$400 hoodies" |
| Mood / Aesthetic tags | raw, confrontational, lo-fi, chaotic | "photocopied flyers," "illegible on purpose," "raw" |
| Audience segment | Gen Z / young millennial collectors | "streetwear collectors, 18-30, hypebeast-adjacent" |
| Explicit style | brutalist-web + risograph | "brutalist" and "risograph" detected as taxonomy style IDs |
| Convention-breaking | Yes | "not a lookbook," "illegible on purpose," "no product grid" |
| Quality emphasis | Style fidelity, Distinctiveness | Implicit from "one-of-a-kind" zine framing |

**Specificity score: 6/7 (Expert brief).** All dimensions detected except explicit quality/accessibility signals. No clarifying questions needed. Proceed directly to style resolution.

**Enhancement injections:**
- Both `brutalist-web` and `risograph` share the `stutter_glitch` motion_signature -- they are natural siblings in the taxonomy.
- Cross-reference with AUDIENCE-ROUTES: Gen Z resonates with neubrutalism, y2k-revival, and glitch -- `brutalist-web` is a validated choice. Risograph's noisy lo-fi texture aligns with the "anti-polish" signal.
- Convention-breaking activated: increase `design_variance` from brutalist-web's default 9 (already maximal) to 9. Override risograph's default `audience_formality` of 3 down to 2 for zine-culture rawness.

### Step 0c: UX Research (Zine Design Conventions, Anti-Lookbook Patterns)

Before generating, the pipeline researches the visual conventions it needs to either honor or deliberately violate:

**Zine conventions to honor:**
- Photocopier degradation: toner smear, registration offset, halftone visible at macro scale
- Staple-bound format: content bleeds across the gutter (center fold)
- Mixed media on a single spread: collage of photography, hand-lettering, found text, stamps
- Deliberate pagination errors: page numbers in wrong places or missing entirely
- Paper stock variation: some pages feel like newsprint, others like card stock

**Lookbook conventions to violate:**
- No white background product isolation
- No centered model poses
- No clean sans-serif price tags
- No "available in sizes S-XXL" metadata
- No grid of colorways

**Anti-lookbook patterns identified:**
- Product obscured or cropped aggressively -- show 30% of the hoodie, not 100%
- Text over product, not beside it -- the typography competes with the garment
- Price as provocation, not information -- "$400" in 8pt type buried in a paragraph, or in 200pt type across the gutter as a dare

### Step 1: Style Resolution (Brutalist-Web + Risograph Cross-Pollination)

Neither `brutalist-web` alone nor `risograph` alone captures the brief. The pipeline resolves a cross-pollination hybrid.

**Parent style profiles:**

| Parameter | brutalist-web | risograph | Hybrid Resolution |
|-----------|--------------|-----------|-------------------|
| Tags | high-contrast, monochromatic, angular, chaotic, lo-fi | textured, noisy, lo-fi, retro, warm | high-contrast, noisy, lo-fi, chaotic, textured |
| motion_signature | stutter_glitch | stutter_glitch | stutter_glitch (unanimous) |
| design_variance | 9 | 6 | 9 (take the more extreme parent for zine rawness) |
| visual_density | 6 | 5 | 7 (override: zine spreads are dense collages) |
| audience_formality | 7 | 3 | 2 (override: zine culture is anti-formality) |
| color_palette_type | monochromatic | spot-color (2-3 inks) | Spot-color on near-black: fluorescent pink #FF2D6F, toxic green #39FF14, off-white #F0EDE5 on newsprint #1A1A18 |
| texture_grain | none (raw HTML aesthetic) | halftone dots, misregistration | Halftone at visible scale, misregistered color layers offset 2-4px |
| typography | System monospace at multiple scales | Hand-stamped, imperfect registration | Monospace (Geist Mono) at extreme scales + deliberate kerning errors |

**Hybrid synthesis description:** Brutalist web's confrontational rawness applied to risograph's tactile print vernacular. The spreads should feel like someone ran a brutalist website through a Riso printer -- monospace type rendered in fluorescent spot inks with registration drift, laid over aggressively cropped product photography treated with halftone screens and toner-smear degradation. Every element that would be clean in a lookbook is intentionally degraded. Every element that would be hidden in a zine (the price, the brand) is confrontationally oversized.

**Typography selection:**
- Display: **Geist Mono** at 120pt+ for spread titles -- monospace at this scale becomes a visual texture, not readable text
- Body: **Geist Mono** at 9pt for body copy -- deliberately small, dense, wrapping without hyphenation
- Accent: **Space Grotesk** Bold at 48pt for price callouts and product names -- the one clean typeface in the system, used sparingly to create hierarchy through contrast with the monospace

**Anti-slop overrides specific to this hybrid:**
- No purple-to-blue gradients (the #1 AI-generation tell)
- No clean drop shadows -- if shadows exist, they are hard-offset block shadows in a spot color
- No rounded corners anywhere -- brutalist-web demands sharp edges
- No smooth gradients -- all color transitions are halftone-stepped
- Body text in off-white #F0EDE5, never pure white #FFFFFF (pure white on near-black is a digital tell; newsprint off-white signals analog origin)

### Step 2: Hero Asset Conception

**Archetype selected: Photographic Drama** (with degradation treatment)

From HERO-ASSET-ARCHETYPES.md, Photographic Drama is the natural fit: "Photography as atmosphere -- the image treatment is as important as the subject matter." For this zine, the treatment IS the concept. The product photography exists to be degraded.

**6-frame series concept:**

| Spread | Concept | Dominant Color Layer | Typography Treatment |
|--------|---------|---------------------|---------------------|
| 1 (Cover) | KURO logotype filling entire frame, halftone-screened product photo bleeding underneath | Fluorescent pink #FF2D6F | "KURO" in Geist Mono 200pt, tracked at -0.08em, partially obscured by halftone |
| 2 (Manifesto) | Dense monospace text block covering 80% of spread, product glimpsed through gaps | Toxic green #39FF14 | Full-page text set in 9pt Geist Mono, no paragraph breaks, justified |
| 3 (Product 01-03) | Three hoodies photographed mid-motion (thrown, crumpled, hanging), risograph color separation | Pink + green spot overlap | Product names stamped diagonally across garments in Space Grotesk 48pt |
| 4 (Editorial) | Model shot cropped to show only torso and hands, double-exposure with Tokyo street scene | Off-white #F0EDE5 layer | Price "$400" in Geist Mono 160pt running vertically along the gutter |
| 5 (Detail) | Extreme macro of fabric texture, treated with halftone screen at 45 LPI | Monochrome with pink accent | Garment care symbols repurposed as decorative elements, scattered |
| 6 (Back Cover) | Solid near-black field with KURO URL in barely-visible 7pt type, centered | Near-black #1A1A18 | URL only: "kuro.tokyo" -- the anti-CTA |

**Model selection:** Flux Pro 1.1 (`fal-ai/flux-pro/v1.1`) for all 6 frames. Chosen for professional-grade generation quality with strong prompt adherence. The degradation effects (halftone, misregistration, toner smear) will be described in the prompt rather than applied in post, because Flux Pro handles stylistic constraints well and prompt-described degradation produces more authentic-feeling artifacts than post-processing filters.

**Consistency strategy for multi-frame series:**
- All 6 prompts share a common style prefix establishing the visual language
- Color palette locked to 4 hex values across all frames
- Aspect ratio fixed at 3:2 landscape (1536x1024) to simulate a zine spread viewed flat
- Seed variation: sequential seeds from a common base to maintain model-internal consistency

### Step 3: Prompt Crafting + Generation

All prompts routed through `prompt-crafter-image-gen` via `scripts/generate-api-prompt.ts`. The crafter follows the 8-part prompt structure: Style Token, Subject, Composition, Lighting, Material/Texture, Color Palette, Quality Markers, Anti-Slop Suffix.

**Spread 1 -- Cover:**

```
Brutalist risograph zine cover. Massive monospace logotype "KURO" filling the entire frame edge-to-edge, letterforms partially obscured by a halftone-screened photograph of a black hoodie bleeding through from underneath. Asymmetric composition with the "K" cropped by the left edge. Flat overhead fluorescent lighting casting no shadows, photocopy-machine aesthetic. Visible halftone dots at 45 LPI, deliberate color misregistration offset 3px between layers. Fluorescent pink #FF2D6F ink layer over near-black #1A1A18 ground, off-white #F0EDE5 halftone dots, toxic green #39FF14 registration marks in corners. 8K, sharp focus, print-quality scan of physical risograph. No gradients, no drop shadows, no rounded corners, no clean digital edges, no stock-photo lighting, no watermarks.
```

**Spread 2 -- Manifesto:**

```
Brutalist risograph zine interior spread. Dense wall of monospace text covering 85 percent of the frame, set in approximately 9pt with no paragraph breaks, justified alignment creating harsh right edges. Through gaps in the text blocks, fragments of product photography are visible -- a sleeve here, a hood there. Composition weighted heavily to the left page, right page nearly empty except for a single garment tag reproduced at 400 percent scale. Flat scanner-bed lighting, toner-density variation across the spread. Toxic green #39FF14 text on off-white #F0EDE5 newsprint ground with near-black #1A1A18 photographic fragments. Halftone texture throughout at visible scale. 8K, sharp focus, flatbed scan of zine page. No smooth gradients, no centered layout, no readable body copy at thumbnail scale, no clean digital typography, no watermarks.
```

**Spread 3 -- Product 01-03:**

```
Brutalist risograph zine product spread. Three black hoodies captured in chaotic states -- one thrown mid-air with sleeves extended, one crumpled on concrete, one hanging from a chain-link fence. Shot from above at oblique angle, frames overlapping and bleeding into each other with no separation. Risograph color separation creating pink and green ghost layers offset from the base image. Harsh direct flash creating blown-out highlights and pitch-black shadows. Fluorescent pink #FF2D6F and toxic green #39FF14 spot-color layers misregistered over near-black #1A1A18 garments on off-white #F0EDE5 newsprint ground. Halftone screen at 35 LPI, visible paper fiber texture. 8K, sharp focus, overexposed flash photography scanned on risograph. No product isolation, no white background, no centered composition, no gentle studio lighting, no watermarks.
```

**Spread 4 -- Editorial:**

```
Brutalist risograph zine editorial spread. Torso and hands of a figure wearing a black oversized hoodie, cropped at neck and mid-thigh, double-exposed with a high-contrast Tokyo street scene -- neon signs, overhead cables, concrete. The figure and city merge at the boundaries. Vertical text "$400" running along the left edge in massive monospace letterforms acting as a compositional spine. Off-white #F0EDE5 double-exposure layer blending with near-black #1A1A18 shadows, fluorescent pink #FF2D6F accent on the price typography, toxic green #39FF14 misregistration ghost on the street scene layer. Halftone dot pattern and toner smear visible. 8K, sharp focus, analog print artifact aesthetic. No clean edges, no gradient backgrounds, no product-catalog posing, no readable price as information, no watermarks.
```

**Spread 5 -- Detail:**

```
Brutalist risograph zine detail spread. Extreme macro photograph of heavyweight cotton hoodie fabric texture filling the entire frame, shot so close the individual yarn fibers are visible. Treated with an aggressive halftone screen at 45 LPI converting continuous tone to visible dot pattern. Scattered across the surface are laundry care instruction symbols enlarged to decorative scale -- a triangle, a circle, a square with an X -- reproduced as if rubber-stamped with uneven ink density. Monochromatic near-black #1A1A18 fabric with fluorescent pink #FF2D6F halftone dots and off-white #F0EDE5 care symbols. Paper texture overlay. 8K, sharp focus, macro photography through risograph screen. No smooth continuous-tone rendering, no small care labels, no product context, no watermarks.
```

**Spread 6 -- Back Cover:**

```
Brutalist risograph zine back cover. Near-solid field of near-black #1A1A18 filling the entire frame with only the faintest visible paper fiber texture preventing pure flatness. Dead center, a single line of text "kuro.tokyo" in approximately 7pt monospace, barely distinguishable from the ground -- the viewer must lean in to read it. No other content. Off-white #F0EDE5 text at approximately 15 percent opacity on near-black ground. One toxic green #39FF14 registration crosshair in the bottom-right corner at crop-mark scale. 8K, sharp focus, minimalist anti-commercial back cover. No logo, no social handles, no QR code, no call to action, no gradients, no watermarks.
```

**Alignment scores per frame (after generation via `validate-prompt-artifact-alignment.ts`):**

| Spread | style_fidelity | palette_accuracy | subject_clarity | composition_match | anti_slop | texture_grain | Weighted Avg |
|--------|---------------|-----------------|-----------------|-------------------|-----------|---------------|-------------|
| 1 Cover | 9.0 | 8.5 | 8.0 | 9.0 | 8.5 | 9.0 | **8.7 PASS** |
| 2 Manifesto | 8.5 | 9.0 | 7.0 | 8.5 | 9.0 | 8.5 | **8.4 PASS** |
| 3 Product | 8.0 | 8.0 | 8.5 | 8.0 | 8.0 | 9.0 | **8.2 PASS** |
| 4 Editorial | 9.0 | 8.5 | 7.5 | 9.0 | 8.5 | 8.5 | **8.5 PASS** |
| 5 Detail | 8.5 | 9.0 | 8.0 | 8.5 | 9.0 | 9.5 | **8.7 PASS** |
| 6 Back Cover | 9.0 | 9.5 | 7.0 | 9.5 | 9.5 | 8.0 | **8.8 PASS** |

All 6 frames score >= 7.0. No auto-regeneration triggered. Proceed to quality evaluation.

### Step 4: One-Shot Generation

N/A for image-only workflow. No HTML/React code is generated. The deliverable is the 6 zine spreads as high-resolution images. However, the visual output is described here for completeness:

The 6 spreads form a coherent visual narrative that reads as a single artifact -- a digital zine scanned from a physical risograph production. The color palette is brutally restricted: fluorescent pink, toxic green, off-white, and near-black. Every spread shares the visible halftone texture, the misregistered color layers, and the monospace typography. The product appears in the series but is never the hero -- the visual language is the hero. A viewer flipping through should feel the same confrontational energy as handling a zine picked up from a counter in a Shimokitazawa record shop.

### Step 5: Quality Evaluation

**Image-only workflow:** `codeStandardsGate` set to null. Weight redistributed across remaining 8 sub-scores per the L5 image-only formula.

**Style consistency check (multi-frame):** Run via `validate-style-consistency.ts` across all 6 frame descriptions.

- Style presence ratio: 1.0 (all 6 frames contain brutalist + risograph markers)
- Brand presence ratio: 1.0 (KURO brand terms detected in 6/6 frames)
- Palette overlap (Jaccard): 0.95 (all frames share the 4-color palette, minor variation in which colors dominate)
- **Style consistency score: 5.0 + (1.0 * 2.0) + (1.0 * 1.5) + (0.95 * 1.5) = 9.93 PASS** (gate: 8.0)

**Composite quality score:**

```
+============================================+
|         QUALITY SCORE CARD                 |
+============================================+
| Anti-Slop Gate     ||||||||| 9.0/10  (16%) |
| Code Standards     N/A             (  0%)  |
| Asset Quality      ||||||||  8.5/10 (13%)  |
| Prompt Alignment   |||||||||  8.5/10 (16%) |
| Aesthetic          ||||||||   8.0/10 (14%) |
| Style Fidelity     |||||||||  9.0/10 (14%) |
| Distinctiveness    |||||||||  9.0/10 (14%) |
| Hierarchy          |||||||    7.0/10 ( 7%) |
| Color Harmony      ||||||||   8.0/10 ( 5%) |
+============================================+
| COMPOSITE: 8.49/10  PASS                   |
| Minimum:   7.0/10                          |
+============================================+
```

**Sub-score rationale:**

- **Anti-Slop Gate (9.0):** Zero banned patterns. No Inter, no purple gradient, no centered-hero-with-two-buttons, no shadow-md, no smooth gradients. Monospace typography is a deliberate brutalist choice, not a default. Off-white body color, not pure white or black.
- **Code Standards (N/A):** Image-only workflow. Weight redistributed.
- **Asset Quality (8.5):** All frames generated at 1536x1024 (3:2 landscape). Appropriate for digital zine display. File sizes within target range. No encoding artifacts beyond the intentional halftone treatment.
- **Prompt Alignment (8.5):** Average of per-frame alignment scores (8.7, 8.4, 8.2, 8.5, 8.7, 8.8) = 8.55, rounded to 8.5.
- **Aesthetic (8.0):** The deliberate degradation reads as intentional, not accidental. The halftone screens and misregistration create visual richness. Marked down from 9 because Spread 3 (Product) has slightly muddy tonal separation in the overlapping frames.
- **Style Fidelity (9.0):** Unmistakably brutalist-web + risograph. Monospace typography at extreme scales, visible halftone, color misregistration, aggressive cropping, near-black ground -- every style marker from both parent profiles is present.
- **Distinctiveness (9.0):** This series would not be mistaken for any template or any other AI-generated output. The restricted palette, the zine format, the anti-lookbook posture, and the confrontational typography create a singular visual identity. Someone encountering these images would remember them.
- **Hierarchy (7.0):** Deliberately complicated. The zine format intentionally flattens hierarchy (everything competes for attention), which is stylistically correct but scores lower on the hierarchy rubric by design. The cover and back cover provide entry and exit points. Internal spreads are intentionally chaotic.
- **Color Harmony (8.0):** The 4-color spot-ink system is inherently harmonious through restriction. Fluorescent pink and toxic green create a vibrating complementary tension that is ugly-on-purpose but cohesive. The off-white and near-black provide stable ground.

**Composite: 8.49 >= 7.0 PASS.** Output cleared for delivery.

### Steps 6-10: Refinement

For this image-only workflow, refinement focuses on enhancing the risograph effect and ensuring cross-frame consistency.

**Risograph color separation technique:**

The core visual effect of risograph printing is color separation with deliberate misregistration. Digitally, this is achieved by:

1. **Decompose each frame into spot-color layers.** The original image is analyzed for regions dominated by each of the 4 palette colors. Each color becomes a separate layer -- pink layer, green layer, off-white layer, near-black layer.

2. **Convert each layer to halftone.** Continuous-tone regions within each color layer are converted to halftone dot patterns at a deliberately coarse screen frequency (35-45 LPI). Different layers use different screen angles to prevent moire: pink at 15 degrees, green at 75 degrees, near-black at 45 degrees. This coarse halftone is what creates the "photocopied" texture -- the dots are large enough to see at reading distance.

3. **Offset each layer by 2-4 pixels in a consistent direction.** Real risograph printers have slight misregistration between color passes because each ink drum is physically separate. The pink layer shifts 3px right and 1px down. The green layer shifts 2px left and 2px up. The near-black layer stays registered (it is the base pass). This offset creates the characteristic color fringing at edges -- a pink ghost to the right of every dark element, a green ghost to the left.

4. **Composite with multiply blending.** The layers are recombined using multiply blend mode, which simulates the way spot inks overprint on paper. Where pink and green overlap, a dirty brown-black appears. Where any color overlaps near-black, it disappears into the darkness. This overprinting behavior is critical to authenticity -- additive (screen) blending would look like projected light, not printed ink.

5. **Add toner-density variation.** Real risograph output has inconsistent ink coverage -- some areas are saturated, others are starved. A low-frequency noise map (Perlin noise at 0.02 frequency) modulates the opacity of each color layer by 10-20%, creating the characteristic mottled coverage of a drum printer running low on ink.

6. **Paper texture overlay.** A scanned newsprint texture is composited at 3-5% opacity using overlay blend mode across the entire frame. This breaks the mathematical smoothness of the digital halftone and adds the fiber-texture authenticity that separates "risograph-inspired" from "just halftone."

**Cross-frame consistency validation:**

After refinement, all 6 frames are checked for visual coherence:
- Halftone frequency consistent across all spreads (45 LPI, verified)
- Misregistration direction and magnitude consistent (pink: +3px right +1px down across all frames)
- Paper texture from the same source scan applied to all frames
- Toner-density noise at the same frequency but different seeds per frame (variation within consistency)

### Step 11: Export

**Deliverable format:**
- 6 PNG files at 1536x1024 (3:2 landscape), lossless compression
- Naming convention: `kuro-zine-spread-01-cover.png` through `kuro-zine-spread-06-back.png`
- Color space: sRGB (standard for digital display)
- Optional: 2x versions at 3072x2048 for retina screens

No web export (HTML/CSS) needed for this image-only deliverable. If the client later requests the zine as a web experience, the pipeline would route to a Tailwind v4 implementation with scroll-snap pagination, using the brutalist-web preset from `assets/tailwind-presets/brutalist-web.css`.

---

## Troubleshooting

### 1. Halftone dots appear too uniform and mathematically perfect
**Symptom:** The halftone screen looks like a Photoshop filter, not a risograph print.
**Fix:** Add jitter to the halftone dot positions. Real risograph drums introduce micro-vibration during printing. Apply a 0.5-1px random offset to each dot center using a high-frequency noise map. Also modulate dot size by 5-10% using a second noise layer. The goal is "mostly regular with organic imperfection," not "random scatter."

### 2. Color misregistration looks like a CSS transform bug, not a print artifact
**Symptom:** The offset layers feel like a glitch effect, not misregistration.
**Fix:** Misregistration in real printing is consistent within a page (the drum is offset by a fixed amount for the entire pass) but varies between pages (each sheet feeds slightly differently). Within each spread, all elements in a color layer should shift by the same vector. Between spreads, vary the offset direction and magnitude slightly (2-4px range). This creates the "each page is a different print run" feeling.

### 3. The product is too visible and the spreads read as a lookbook despite the treatment
**Symptom:** Style fidelity is high but distinctiveness drops because the product-centric layout shows through the degradation.
**Fix:** Crop more aggressively. If the full hoodie is visible, the eye resolves "product photo" before it resolves "zine spread." Show 30% of each garment. Let the typography and color treatment occupy the primary visual hierarchy. The product should be discovered inside the spread, not presented by it. Reduce subject_clarity in the prompt: use phrases like "fragment of," "partially obscured by," "glimpsed through."

### 4. The typography is TOO illegible and the spread reads as abstract art, not a zine
**Symptom:** The anti-readability has gone too far. No text is parseable even at full resolution. The spreads lose their zine identity and become pure texture.
**Fix:** Maintain one anchor text element per spread that IS readable -- the brand name on the cover, the price on the editorial spread, the URL on the back cover. Illegibility is the background texture; the readable element is the focal point that identifies the object as a zine rather than an abstract print. This is the "barely readable" threshold, not "completely unreadable."

### 5. Fluorescent pink and toxic green create eye-fatiguing vibration at screen brightness
**Symptom:** The complementary pair vibrates at full saturation on bright displays, causing visual discomfort.
**Fix:** Desaturate both spot colors by 10-15% for digital display. Real fluorescent inks on paper are viewed under ambient light, which naturally desaturates them. Digital screens emit light directly, making fluorescents harsher than their physical counterparts. Adjusted values: pink from #FF2D6F to #F04070, green from #39FF14 to #45E82A. Revalidate palette_accuracy after adjustment.

---

## Anti-Slop Verification

Every output must pass these 5 checks before delivery. Each check references a specific anti-slop rule from the taxonomy.

### 1. Typography is not Inter, Roboto, or Open Sans
**Check:** All text elements use Geist Mono (display and body) or Space Grotesk Bold (accent). Neither is on the banned typeface list. Geist Mono is from the Monospace premium font stack. Space Grotesk is from the Display premium font stack. Both are deliberate choices that match the style's typographic voice -- monospace for brutalist raw-HTML energy, geometric grotesque for the one clean contrast element.
**Status:** PASS

### 2. No purple-to-blue gradient anywhere in the palette
**Check:** The entire 6-spread series uses exactly 4 colors: fluorescent pink #FF2D6F, toxic green #39FF14, off-white #F0EDE5, and near-black #1A1A18. Zero gradients exist anywhere in the output. All color transitions are halftone-stepped (discrete dots, not continuous gradients). Purple does not appear. Blue does not appear. The palette is derived from risograph spot-ink conventions, not from Tailwind defaults.
**Status:** PASS

### 3. No hero-section-with-H1-subtitle-and-two-buttons pattern
**Check:** The cover spread (Spread 1) uses the brand logotype as the entire visual field, partially obscured by halftone product photography. There is no subtitle. There are no buttons. There is no call-to-action. The back cover contains only a URL at near-invisible opacity. The series deliberately inverts the landing-page pattern by providing no clear user action path -- this is a zine, not a conversion funnel.
**Status:** PASS

### 4. Body text is not pure #000000 black or pure #FFFFFF white
**Check:** Body text uses off-white #F0EDE5 -- a warm newsprint-toned near-white with a yellow-brown undertone. Background uses near-black #1A1A18 -- not pure black but a dark tone with the faintest warm undertone suggesting aged paper viewed in low light. Both choices avoid the digital harshness of pure black/white and reference the analog print origin of the zine format.
**Status:** PASS

### 5. Realistic content replaces all placeholder text
**Check:** No Lorem Ipsum appears in any spread. Spread 2 (Manifesto) contains dense text that, while intentionally illegible at thumbnail scale, is composed of real content about the KURO collection philosophy when viewed at full resolution. Product names are plausible Japanese-English hybrid names (e.g., "KURO-001 SHADOW HOOD," "KURO-004 CONCRETE PARKA"). The price "$400" is a realistic price point for premium Japanese streetwear. The URL "kuro.tokyo" follows real Japanese domain conventions.
**Status:** PASS

---

## Key Takeaways

**The luxury-vs-anti-establishment tension is the feature, not a bug.** The entire zine works because it embodies the paradox that drives streetwear culture: the product is expensive because it looks like it doesn't care about looking expensive. The pipeline honors this by treating the degradation as the premium technique. The halftone screens, the misregistration, the illegible typography -- each of these is a deliberate, labor-intensive post-processing step that requires more production effort than a clean lookbook. Rawness, when done well, is harder than polish. The composite quality score of 8.49 reflects this: high marks on style fidelity and distinctiveness because the output is uncompromisingly committed to its aesthetic, not because it looks conventionally "good."

**Risograph color separation is the technical backbone.** The 5-step separation process (decompose, halftone, offset, composite with multiply, add density variation) transforms any generated image into a convincing risograph print. The key insight is that risograph is a subtractive process (ink on paper) simulated in an additive medium (light on screen), so multiply blending is mandatory. Screen or overlay blending produces projected-light artifacts that immediately break the illusion.

**Cross-frame consistency in a multi-image series demands systematic constraints.** Locking the palette to 4 hex values, the halftone frequency to 45 LPI, the misregistration vectors to fixed per-color offsets, and the paper texture to a single source scan ensures the 6 spreads read as pages from the same physical object rather than 6 independent generations. The style consistency score of 9.93 validates this approach.
