# COMPOSITION TECHNIQUES
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

All 10 premium component patterns from the taxonomy's component_patterns section. Each pattern breaks a conventional UI assumption and maps to specific style tags.

---

## 1. Asymmetric Bento Grid
- **Pattern ID:** bento-grid
- **Description:** Variable-sized tiles in CSS Grid creating visual hierarchy through size, not just content.
- **Implementation Hint:** `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` with span-2 featured items
- **Works With Tags:** geometric, ordered, precise, clean
- **Breaks Convention:** Rejects the equal-card grid that makes everything equally unimportant.

**Used by styles:** bento-ui, flat-design, material-design, bauhaus, de-stijl, swiss-international, isometric, pop-art, pixel-art, memphis-design, editorial-minimalism, cellular-automata, duotone, scandinavian-minimalism

---

## 2. Cursor-Tracking Spotlight Border
- **Pattern ID:** spotlight-border
- **Description:** Card border that illuminates dynamically under the cursor position.
- **Implementation Hint:** radial-gradient on border-image following pointer coordinates
- **Works With Tags:** futuristic, dimensional, glossy
- **Breaks Convention:** Adds interactivity to what is usually a static decorative element.

**Used by styles:** art-deco, glassmorphism, dark-mode-ui, wireframe-mesh, studio-product, skeuomorphism, afrofuturism, rococo, particle-systems, miniature-diorama, low-poly, liquid-glass

---

## 3. Scroll-Driven Card Stack
- **Pattern ID:** parallax-card-stack
- **Description:** Sections that stick and physically stack over each other during scroll.
- **Implementation Hint:** `position: sticky` with incrementing z-index and slight scale reduction
- **Works With Tags:** dimensional, dense, ordered
- **Breaks Convention:** Vertical space becomes a physical dimension rather than just sequence.

**Used by styles:** art-deco, cinematic, isometric, duotone, hdr-hyperrealism, studio-product, papercut, tilt-shift, miniature-diorama, ukiyo-e, ai-diffusion

---

## 4. Typography as Window
- **Pattern ID:** text-mask-reveal
- **Description:** Large text acting as a clipping mask to video or animated imagery behind it.
- **Implementation Hint:** `background-clip: text` with video/animation background
- **Works With Tags:** maximalist, abstract, kinetic
- **Breaks Convention:** Text becomes a viewport rather than content -- inverts the reading hierarchy.

**Used by styles:** constructivism, surrealism, pop-art, glitch, afrofuturism, double-exposure, psychedelic

---

## 5. Opposing Scroll Halves
- **Pattern ID:** split-scroll
- **Description:** Two screen halves sliding in opposite directions.
- **Implementation Hint:** CSS scroll-snap with inverted translateY on alternating columns
- **Works With Tags:** asymmetric, futuristic, dense
- **Breaks Convention:** Rejects the assumption that all content moves in one direction.

**Used by styles:** constructivism, de-stijl

---

## 6. Fixed Noise/Grain Texture
- **Pattern ID:** grain-overlay
- **Description:** Full-viewport noise texture that breaks digital flatness.
- **Implementation Hint:** `position: fixed, pointer-events: none, mix-blend-mode: overlay, opacity: 0.03-0.06`
- **Works With Tags:** textured, noisy, retro, organic
- **Breaks Convention:** Adds analog imperfection to a digital medium -- fights the uncanny smoothness of CSS.

**Used by styles:** wabi-sabi, risograph, brutalist-web, cinematic, analog-film-grain, woodcut, retro-vintage-print, infrared, cyanotype, vaporwave, glitch, afrofuturism, noise-field, generative-art, impressionism

---

## 7. Hue-Matched Colored Shadows
- **Pattern ID:** tinted-shadows
- **Description:** Shadows carry the hue of the element or background rather than generic black.
- **Implementation Hint:** box-shadow using hsla() derived from the element's background-color
- **Works With Tags:** dimensional, warm, cool, saturated
- **Breaks Convention:** Replaces the universal black shadow that flattens color relationships.

**Used by styles:** flat-design, material-design, neomorphism, claymorphism, skeuomorphism, dark-mode-ui

---

## 8. Horizontal Curtain Part on Scroll
- **Pattern ID:** curtain-reveal
- **Description:** Hero section splitting horizontally like curtains as user scrolls.
- **Implementation Hint:** Two absolute-positioned halves with scroll-driven translateX
- **Works With Tags:** kinetic, maximalist, dimensional
- **Breaks Convention:** The hero is not a static billboard -- it has a physical opening gesture.

**Used by styles:** rococo, surrealism, cinematic, memphis-design, fractal

---

## 9. Continuous Font Weight/Width Animation
- **Pattern ID:** variable-font-morph
- **Description:** Variable font axes interpolated on scroll or hover for living typography.
- **Implementation Hint:** font-variation-settings animated via CSS custom properties
- **Works With Tags:** kinetic, futuristic, organic
- **Breaks Convention:** Typography is usually static -- this makes it a dynamic material.

**Used by styles:** impressionism, art-nouveau, surrealism, wabi-sabi, aurora-ui, noise-field, line-art, generative-art, psychedelic, minimalism-fine-art

---

## 10. True Glassmorphism with Edge Refraction
- **Pattern ID:** inner-refraction-glass
- **Description:** Beyond backdrop-filter: blur -- adds 1px inner border and inner shadow simulating glass edge light.
- **Implementation Hint:** `backdrop-filter: blur(12px)` + inset box-shadow + 1px rgba white border
- **Works With Tags:** translucent, dimensional, glossy, cool
- **Breaks Convention:** Most glassmorphism is just blur -- the refraction edge is what makes it feel like real glass.

**Used by styles:** glassmorphism, art-nouveau, aurora-ui, dark-mode-ui, vaporwave, ai-diffusion, liquid-glass

---

## Pattern Compatibility Matrix

Patterns can be combined. This matrix shows which patterns commonly appear together in style implementations:

| Pattern | Compatible Patterns |
|---|---|
| bento-grid | tinted-shadows, spotlight-border |
| spotlight-border | bento-grid, inner-refraction-glass, parallax-card-stack |
| parallax-card-stack | spotlight-border, grain-overlay, curtain-reveal |
| text-mask-reveal | grain-overlay, split-scroll |
| split-scroll | text-mask-reveal |
| grain-overlay | parallax-card-stack, variable-font-morph, text-mask-reveal |
| tinted-shadows | bento-grid |
| curtain-reveal | parallax-card-stack, grain-overlay |
| variable-font-morph | grain-overlay, inner-refraction-glass |
| inner-refraction-glass | spotlight-border, variable-font-morph |

## Pattern Selection by Project Type

| Project Type | Recommended Patterns |
|---|---|
| SaaS Dashboard | bento-grid, tinted-shadows, spotlight-border |
| Portfolio / Agency | curtain-reveal, text-mask-reveal, parallax-card-stack |
| E-commerce | parallax-card-stack, spotlight-border, bento-grid |
| Editorial / Magazine | variable-font-morph, grain-overlay, split-scroll |
| Creative Tool | inner-refraction-glass, spotlight-border, grain-overlay |
| Data Visualization | bento-grid, tinted-shadows |
| Landing Page | curtain-reveal, text-mask-reveal, parallax-card-stack |
