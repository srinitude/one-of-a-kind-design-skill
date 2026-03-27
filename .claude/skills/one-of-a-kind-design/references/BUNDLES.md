# BUNDLES
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

All 16 curated bundles and 4 accessibility bundles. Each bundle groups styles that share a coherent design thread for specific project types.

---

## Curated Bundles

### 1. Retro-Futurist Toolkit
- **Styles:** vaporwave, glitch, wireframe-mesh, pixel-art
- **Design Thread:** Digital nostalgia meeting speculative futures -- all styles reference computing history while pointing forward.
- **Sample Use Case:** A retro-themed gaming platform with nostalgic UI chrome and futuristic generative elements.

### 2. Editorial Luxe
- **Styles:** art-deco, cinematic, swiss-international, duotone
- **Design Thread:** Premium visual authority through disciplined composition, dramatic imagery, and restrained color.
- **Sample Use Case:** A high-end fashion magazine digital platform with bold typographic hierarchy.

### 3. Organic Craft
- **Styles:** wabi-sabi, risograph, papercut, analog-film-grain
- **Design Thread:** Handmade imperfection as design value -- every style celebrates visible process and material character.
- **Sample Use Case:** An artisan ceramics e-commerce site with editorial storytelling.

### 4. Playful Product
- **Styles:** claymorphism, memphis-design, isometric, pop-art
- **Design Thread:** Joyful, approachable 3D energy with bold color -- every style brings dimensionality and play.
- **Sample Use Case:** A children's educational app with gamified learning interactions.

### 5. Tech-Forward Dashboard
- **Styles:** dark-mode-ui, material-design, wireframe-mesh, particle-systems
- **Design Thread:** Professional technical interfaces with data visualization flair and systematic design foundations.
- **Sample Use Case:** A developer analytics dashboard with real-time data visualization.

### 6. Generative Canvas
- **Styles:** generative-art, noise-field, fractal, particle-systems
- **Design Thread:** Algorithm-driven visual creation -- all outputs emerge from coded parameters rather than manual drawing.
- **Sample Use Case:** A generative art platform where users control parameters to create unique outputs.

### 7. Cultural Fusion
- **Styles:** afrofuturism, ukiyo-e, art-nouveau, psychedelic
- **Design Thread:** Cross-cultural visual richness with shared commitment to ornamental density and cultural narrative.
- **Sample Use Case:** A global music streaming platform with culturally diverse visual theming.

### 8. Nordic Digital
- **Styles:** scandinavian-minimalism, flat-design, line-art, studio-product
- **Design Thread:** Clean, functional, understated -- every style prioritizes clarity and restraint.
- **Sample Use Case:** A wellness app with editorial content, product marketplace, and mindful UX.

### 9. Cosmic Immersive
- **Styles:** aurora-ui, ai-diffusion, glassmorphism, surrealism, double-exposure
- **Design Thread:** Ethereal, dreamlike visual layers creating immersive atmospheric experiences.
- **Sample Use Case:** A meditation and breathwork app with ambient visual environments.

### 10. Print Revival
- **Styles:** woodcut, retro-vintage-print, risograph, constructivism
- **Design Thread:** Physical print processes translated to digital -- each style carries the mark of a specific printing technique.
- **Sample Use Case:** A craft brewery brand identity spanning labels, menus, and web presence.

### 11. 2026 Premium SaaS Kit
- **Styles:** bento-ui, liquid-glass, editorial-minimalism, dark-mode-ui
- **Design Thread:** The dominant 2025-2026 tech product aesthetic -- modular grids, dynamic translucency, editorial typography, and day/night adaptability.
- **Sample Use Case:** An AI-powered productivity tool with dashboard, settings, and content views.

### 12. Anti-AI Authenticity
- **Styles:** tactile-craft-digital, arte-povera-digital, wabi-sabi, analog-film-grain, risograph
- **Design Thread:** Human-made, material-honest, deliberately imperfect -- every style signals 'a human made this' as antidote to generated perfection.
- **Sample Use Case:** An artisan marketplace celebrating handcraft and slow production.

### 13. Bold Indie Platform
- **Styles:** neubrutalism, pop-art, memphis-design, pixel-art
- **Design Thread:** Maximum personality, zero corporate polish -- thick borders, saturated colors, and deliberate anti-good-taste energy.
- **Sample Use Case:** A creator economy platform for indie game developers and zine makers.

### 14. Contemplative Material
- **Styles:** mono-ha, resonant-stark, minimalism-fine-art, studio-product
- **Design Thread:** Extreme restraint, material honesty, vast negative space -- every element earns its presence through sheer quality.
- **Sample Use Case:** A high-end architecture firm's portfolio with full-bleed material photography.

### 15. Eco-Optimist
- **Styles:** solarpunk, papercut, scandinavian-minimalism, noise-field
- **Design Thread:** Green-tech hope with handcraft warmth -- nature, sustainability, and organic generative patterns.
- **Sample Use Case:** A climate tech startup's investor-facing site with data visualization.

### 16. Chrono-Nostalgia
- **Styles:** y2k-revival, vaporwave, pixel-art, skeuomorphism
- **Design Thread:** Digital nostalgia spanning three decades of computing history -- from 8-bit to chrome millennium.
- **Sample Use Case:** A retro-themed streaming music platform targeting 25-35 year olds.

---

## Accessibility Bundles

### A1. WCAG-AAA Safe Foundation
- **Styles:** flat-design, swiss-international, material-design, scandinavian-minimalism
- **Accessibility Features:**
  - **Contrast:** All styles support AAA contrast ratios (7:1+) with standard token configuration
  - **Typography:** Sans-serif type systems with generous x-height and clear letterforms at all sizes
  - **Motion Safety:** Minimal animation by default; all motion is functional and respects prefers-reduced-motion
  - **WCAG Compliance:** WCAG 2.2 AAA achievable with standard implementation
- **Excluded Styles:**
  - `neomorphism` -- Monochromatic low-contrast shadow pairs fail AA contrast requirements for interactive elements
  - `glassmorphism` -- Translucent panels over variable backgrounds create unpredictable contrast ratios
  - `aurora-ui` -- Gradient backgrounds make consistent text contrast extremely difficult to guarantee
  - `psychedelic` -- Saturated color cycling and pattern density can trigger photosensitive seizures

### A2. Reduced-Motion Safe
- **Styles:** flat-design, swiss-international, line-art, duotone, de-stijl
- **Accessibility Features:**
  - **Contrast:** High-contrast styles that communicate hierarchy through color and size rather than motion
  - **Typography:** Clear typographic hierarchy that functions without animation to establish reading order
  - **Motion Safety:** All styles are inherently static -- visual interest comes from composition, not movement
  - **WCAG Compliance:** WCAG 2.2 AA minimum; respects prefers-reduced-motion by requiring zero animation
- **Excluded Styles:**
  - `glitch` -- Core aesthetic relies on rapid visual disruption that violates three-flashes-per-second rule
  - `particle-systems` -- Continuous particle motion is the defining feature and cannot be reduced without losing identity
  - `psychedelic` -- Pulsing, cycling colors and patterns are the core of the style and are motion-unsafe
  - `vaporwave` -- VHS tracking effects and color cycling animations may trigger vestibular disorders

### A3. High-Readability Editorial
- **Styles:** swiss-international, scandinavian-minimalism, dark-mode-ui, studio-product
- **Accessibility Features:**
  - **Contrast:** Minimum 4.5:1 for body text, 7:1 for small text; dark mode uses tested surface hierarchy
  - **Typography:** Large body text (16px+), generous line-height (1.5+), maximum line-length constraints (65ch)
  - **Motion Safety:** Static by default; any motion limited to page transitions respecting system preferences
  - **WCAG Compliance:** WCAG 2.2 AA with straightforward path to AAA through spacing and sizing adjustments
- **Excluded Styles:**
  - `brutalist-web` -- Irregular spacing and system-font defaults create unpredictable reading experiences
  - `constructivism` -- Extreme type scale compression and diagonal layouts impair reading flow for screen readers and low-vision users
  - `surrealism` -- Intentionally disorienting spatial relationships conflict with cognitive accessibility needs

### A4. Neurodivergent-Safe Editorial
- **Styles:** editorial-minimalism, resonant-stark, bento-ui, flat-design
- **Accessibility Features:**
  - **Contrast:** Off-black (#111111) on warm white (#F7F6F3) achieves 15.4:1 -- far exceeds AAA
  - **Typography:** Large body text (16px+), line-height 1.6, max-width 65ch -- optimized for ADHD and dyslexia readability
  - **Motion Safety:** All motion gated behind prefers-reduced-motion; entry animations only, no continuous loops
  - **WCAG Compliance:** WCAG 2.2 AAA achievable with standard implementation
- **Excluded Styles:**
  - `liquid-glass` -- Dynamic tinting over variable content creates unpredictable contrast -- requires per-instance auditing
  - `psychedelic` -- Pattern density and color cycling trigger photosensitive seizures and overwhelm neurodivergent users
  - `deconstructivism` -- Deliberate spatial disorientation and overlapping text conflict with cognitive accessibility
  - `glitch` -- Rapid visual disruption violates seizure safety and creates anxiety for users with PTSD
