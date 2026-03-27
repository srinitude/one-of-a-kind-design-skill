# VISUAL REFINEMENT VOCABULARY
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

All 7 motion signatures from the taxonomy's motion_vocabulary section. Each signature defines the physical feel of animation for a group of styles, with CSS cubic-bezier curves, Framer Motion configs, durations, and appropriate use cases.

---

## 1. Spring Physics

- **CSS:** `cubic-bezier(0.16, 1, 0.3, 1)`
- **Framer Motion:** `type: 'spring', stiffness: 100, damping: 20`
- **Duration:** Determined by spring parameters (typically 300-500ms to settle)
- **Feel:** Premium, weighty, physical
- **Use For:**
  - Interactive elements (buttons, cards, toggles)
  - Page transitions
  - Modal/sheet reveals

**Styles using this signature:** flat-design, material-design, neomorphism, glassmorphism, skeuomorphism, claymorphism, dark-mode-ui, duotone, papercut, tilt-shift, miniature-diorama, studio-product, neubrutalism, liquid-glass, bento-ui, y2k-revival, tactile-craft-digital

**Implementation Notes:** Spring physics is the baseline premium motion. The stiffness/damping ratio controls character: high stiffness + low damping = snappy and energetic (claymorphism); moderate stiffness + high damping = weighty and controlled (material-design). Always prefer spring over timed easing for interactive elements.

---

## 2. Slow Cinematic

- **CSS:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Duration:** 800ms-1200ms
- **Feel:** Dramatic, editorial, contemplative
- **Use For:**
  - Hero reveals
  - Full-page transitions
  - Photography-heavy layouts

**Styles using this signature:** art-deco, minimalism-fine-art, scandinavian-minimalism, afrofuturism, ukiyo-e, fractal, ai-diffusion, cinematic, analog-film-grain, hdr-hyperrealism, infrared, cyanotype, double-exposure, line-art, resonant-stark, editorial-minimalism, minimalist-maximalism, suprematism, arte-povera-digital, mono-ha

**Implementation Notes:** Slow cinematic motion should never feel sluggish -- the 800ms+ duration works because the easing curve front-loads the perceptible movement. The element moves quickly through the first 30% of the transition, then decelerates dramatically. Use for viewport-entry reveals and section transitions, not for interactive hover states.

---

## 3. Mechanical Snap

- **CSS:** `cubic-bezier(0.77, 0, 0.175, 1)`
- **Duration:** 150ms-300ms
- **Feel:** Precise, industrial, no-nonsense
- **Use For:**
  - Brutalist/constructivist interfaces
  - Toggle states
  - Grid reconfigurations

**Styles using this signature:** constructivism, bauhaus, de-stijl, swiss-international, isometric, low-poly, wireframe-mesh

**Implementation Notes:** Mechanical snap has a distinctive symmetric ease -- it accelerates and decelerates with equal force, creating a feeling of mechanical precision. The short duration (150-300ms) reinforces the snappy character. Do not use ease-out here; the deceleration phase is as important as the acceleration. Ideal for grid-to-grid layout transitions and binary state toggles.

---

## 4. Organic Drift

- **CSS:** `cubic-bezier(0.37, 0, 0.63, 1)`
- **Duration:** 2000ms-20000ms (ambient loops)
- **Feel:** Natural, meditative, atmospheric
- **Use For:**
  - Background gradient movement
  - Parallax layers
  - Wabi-sabi / impressionist contexts

**Styles using this signature:** impressionism, art-nouveau, surrealism, aurora-ui, psychedelic, vaporwave, generative-art, noise-field, particle-systems, solarpunk

**Implementation Notes:** Organic drift is for ambient motion that the user should feel but not consciously notice. At 2-20 second cycle times and very low opacity (0.02-0.04 for gradient blobs), it creates a sense of life without demanding attention. The CSS curve is nearly linear but with just enough ease to prevent the mathematical-feeling of true linear movement. Pair with `animation-iteration-count: infinite` and `animation-direction: alternate`.

---

## 5. Playful Bounce

- **CSS:** `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Duration:** 400ms-600ms
- **Feel:** Energetic, toy-like, joyful
- **Use For:**
  - Claymorphism squish
  - Memphis/pop interactions
  - Gamified elements

**Styles using this signature:** rococo, pop-art, memphis-design, claymorphism

**Implementation Notes:** The overshoot in this cubic-bezier (the 1.56 control point) creates the bounce -- the element overshoots its target position and springs back. This is the most personality-rich motion signature. Use it for entry animations, click feedback, and reward moments. Avoid for navigation or content reading -- the bounce creates cognitive load that fights comprehension. Pair with `scaleY(0.95)` on :active for squish-and-bounce interactions.

---

## 6. Stutter Glitch

- **CSS:** `steps(4, jump-both)`
- **Duration:** 100ms-300ms, randomized
- **Feel:** Broken, lo-fi, digital artifact
- **Use For:**
  - Glitch art interfaces
  - Vaporwave transitions
  - Pixel art frame-stepping

**Styles using this signature:** brutalist-web, risograph, woodcut, retro-vintage-print, pixel-art, glitch, cellular-automata, deconstructivism

**Implementation Notes:** Stutter glitch uses CSS `steps()` rather than cubic-bezier -- there is no smooth interpolation. The element jumps between discrete positions. For glitch effects, randomize the timing using JavaScript to set `animation-duration` to `Math.random() * 200 + 100` ms on each trigger. For pixel art, use `steps()` with a count matching sprite sheet frames. Critical accessibility note: respect the three-flashes-per-second rule (max 3Hz frequency) to avoid seizure triggers.

---

## 7. Scroll Entry

- **CSS:** N/A (scroll-triggered, not animation-curve)
- **Implementation:** IntersectionObserver (never `window.addEventListener('scroll')`)
- **Default Transform:** `translateY(16px) + opacity: 0` resolving to final position
- **Stagger Formula:** `animation-delay: calc(var(--index) * 80ms)`
- **Performance:** Animate only transform and opacity -- never layout-triggering properties

**Used across all styles** -- this is the universal entry animation system, not style-specific. The motion_signature of the style determines which *curve* the scroll entry uses:

| Style's Motion Signature | Scroll Entry Curve |
|---|---|
| spring_physics | `cubic-bezier(0.16, 1, 0.3, 1)` over 400ms |
| slow_cinematic | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` over 800ms |
| mechanical_snap | `cubic-bezier(0.77, 0, 0.175, 1)` over 200ms |
| organic_drift | `cubic-bezier(0.37, 0, 0.63, 1)` over 600ms |
| playful_bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` over 500ms |
| stutter_glitch | `steps(3, jump-both)` over 150ms |

**Implementation Notes:** The 16px translateY default is subtle enough for professional contexts but perceptible enough to create reading rhythm. For radical/creative styles (design_variance 7+), increase to 24-32px. The stagger formula of 80ms per element creates a cascade that reads as choreographed, not simultaneous. Always wrap in `@media (prefers-reduced-motion: no-preference)` -- with reduced motion, elements should appear instantly without animation.

---

## Motion Signature Quick Reference

| Signature | CSS Curve | Duration | Character |
|---|---|---|---|
| spring_physics | `cubic-bezier(0.16, 1, 0.3, 1)` | spring-determined | Premium, physical |
| slow_cinematic | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 800-1200ms | Dramatic, editorial |
| mechanical_snap | `cubic-bezier(0.77, 0, 0.175, 1)` | 150-300ms | Precise, industrial |
| organic_drift | `cubic-bezier(0.37, 0, 0.63, 1)` | 2000-20000ms | Natural, meditative |
| playful_bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 400-600ms | Energetic, joyful |
| stutter_glitch | `steps(4, jump-both)` | 100-300ms | Broken, lo-fi |
| scroll_entry | varies by signature | varies | Choreographed reveal |
