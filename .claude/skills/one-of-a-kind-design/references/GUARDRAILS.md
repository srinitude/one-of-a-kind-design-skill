# GUARDRAILS
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Universal guardrails for accessibility, performance, and quality that apply across all style implementations. These are non-negotiable requirements.

---

## Accessibility Non-Negotiables

### 1. Text Contrast
**Rule:** Text contrast ratio must meet WCAG 2.2 AA minimum (4.5:1 normal, 3:1 large) in ALL styles, no exceptions.

**Styles at risk:**
- neomorphism -- low-contrast shadow pairs
- glassmorphism -- variable backgrounds behind translucent panels
- liquid-glass -- dynamic tinting creates unpredictable contrast
- aurora-ui -- gradient backgrounds make consistent contrast difficult

### 2. Motion Respect
**Rule:** All animation must respect prefers-reduced-motion -- wrap in @media query or provide toggle.

**Styles at risk:**
- psychedelic -- continuous color cycling and pattern pulsing
- glitch -- rapid visual disruption
- particle-systems -- continuous particle motion
- vaporwave -- VHS tracking effects and color cycling

### 3. Color Independence
**Rule:** No content conveyed through color alone -- always pair with shape, icon, or text label.

**Styles at risk:**
- duotone -- two-color mapping as primary differentiator
- de-stijl -- primary colors as compositional elements
- pop-art -- saturated color as primary hierarchy
- bauhaus -- primary color system

### 4. Focus Indicators
**Rule:** Focus indicators must be visible in all interactive states -- never suppress outline.

**Styles at risk:**
- neomorphism -- subtle surface variations hide focus
- glassmorphism -- translucent surfaces obscure focus rings
- brutalist-web -- raw structure may inadvertently suppress focus styles

### 5. Flash Safety
**Rule:** No flashing content exceeding 3 per second -- seizure trigger.

**Styles at risk:**
- glitch -- rapid visual disruption
- psychedelic -- color cycling and pattern pulsing
- vaporwave -- VHS tracking effects
- pixel-art -- frame-by-frame sprite animation at high speeds

---

## Anti-Slop Rules

### 1. Cross-Category Pairing
**Rule:** Never combine more than 2 styles from the same category -- cross-category pairing creates distinction.
**Severity:** Strong recommendation

### 2. Style-Driven Composition
**Rule:** Never apply a style purely as skin over generic layout -- the style must inform spatial composition.
**Severity:** Mandatory

### 3. Deliberate Typography
**Rule:** Every font choice must be justified by the style's typographic architecture -- no default system fonts (unless the style specifically calls for them, as in brutalist-web).
**Severity:** Mandatory

### 4. Shadow Consistency
**Rule:** Shadows must be style-appropriate -- do not add Material Design elevation to Art Deco components.
**Severity:** Hard conflict

### 5. Motion Personality
**Rule:** Animation curves must match the style's motion personality -- no spring physics on Swiss International.
**Severity:** Hard conflict

### 6. Palette Consistency
**Rule:** Color palettes must be internally consistent -- do not mix Art Deco jewel tones with Scandinavian pastels.
**Severity:** Hard conflict

### 7. Tag Compatibility Check
**Rule:** If two selected styles share fewer than 1 tag, check the conflict map before proceeding.
**Severity:** Automated check

### 8. Surface Treatment Exclusivity
**Rule:** Texture grain and translucency are mutually exclusive surface treatments -- pick one per element.
**Severity:** Hard conflict

---

## Performance Guardrails

### 1. Backdrop Filter Limits
**Rule:** Limit simultaneous backdrop-filter: blur() elements to 3-4 on screen.
**Affected Styles:** glassmorphism, liquid-glass, aurora-ui
**Why:** backdrop-filter is GPU-intensive and causes frame drops on mid-range devices with more than 4 simultaneous blurred surfaces.

### 2. Animation Properties
**Rule:** Animate only transform and opacity -- never layout-triggering properties (width, height, top, left, margin, padding).
**Affected Styles:** All styles with motion
**Why:** Layout-triggering animations cause reflow, which drops frames. Transform and opacity are composited on the GPU.

### 3. Will-Change Discipline
**Rule:** Use will-change sparingly -- apply only to actively animating elements, remove after animation completes.
**Affected Styles:** particle-systems, generative-art, noise-field
**Why:** will-change creates a new compositor layer for each element. Too many layers exhaust GPU memory.

### 4. Texture Asset Size
**Rule:** Texture overlays must be optimized -- maximum 200KB per full-screen texture asset.
**Affected Styles:** wabi-sabi, analog-film-grain, risograph, arte-povera-digital, tactile-craft-digital
**Why:** Unoptimized texture images (especially at 2x/3x resolution) can add megabytes to page weight. Use WebP/AVIF and consider CSS-generated grain as an alternative.

### 5. Particle Limits
**Rule:** Particle systems must cap at 200 active particles on mobile, 500 on desktop.
**Affected Styles:** particle-systems, generative-art
**Why:** Each particle requires per-frame calculation. Uncapped particle counts cause severe frame drops on mobile devices.

---

## Quality Validation Checklist

Before shipping any style implementation, verify:

- [ ] Text contrast meets WCAG 2.2 AA (4.5:1 normal, 3:1 large)
- [ ] All motion wrapped in @media (prefers-reduced-motion: no-preference)
- [ ] No color-only information -- shapes, icons, or labels supplement color
- [ ] Focus indicators visible on all interactive elements
- [ ] No content flashes more than 3 times per second
- [ ] Font choice is deliberate and matches style's typographic architecture
- [ ] Shadow model matches style specification (not Tailwind defaults)
- [ ] Animation curves match style's motion_signature
- [ ] Color palette is internally consistent with style's color_palette_type
- [ ] Layout reflects style's layout_philosophy, not generic template
- [ ] Backdrop-filter count is 4 or fewer simultaneous on screen
- [ ] Only transform and opacity are animated
- [ ] Texture assets are under 200KB per full-screen image
- [ ] Particle systems capped at 200 (mobile) / 500 (desktop)
- [ ] Tested on low-end device at 60fps target
- [ ] Solid-color fallbacks provided for browsers without backdrop-filter support
