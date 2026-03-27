# HERO ASSET ARCHETYPES
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Seven hero asset archetypes synthesized from style_profiles, motion_signatures, and premium_component_patterns. Each archetype defines a dominant visual approach for hero sections and maps which styles naturally use it.

---

## 1. Panning Scene

**Format:** Video / animated sequence
**Character:** Cinematic motion -- slow dolly, pan, or tracking shot with dramatic lighting and shallow depth of field. Film grain, color grading, and letterboxed aspect ratios.

**Key Techniques:**
- Slow parallax pan across a scene
- Letterboxed 2.35:1 or 16:9 containers
- Film grain overlay at 0.03-0.06 opacity
- Color grade via CSS filter stacks (saturate, contrast, hue-rotate)
- Vignette via radial-gradient overlay

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| cinematic | slow_cinematic | Dramatic dolly forward, establishing sweeps, rack focus transitions |
| analog-film-grain | slow_cinematic | Film-advance slides with grain texture shifting, projector-cadence flicker |
| hdr-hyperrealism | slow_cinematic | Smooth immersive zoom with progressive detail reveal, panoramic pan |
| double-exposure | slow_cinematic | Slow cross-fade blend between layered image composites |
| afrofuturism | slow_cinematic | Majestic cosmic drift with geometric pattern pulse, stately entrance |
| ukiyo-e | slow_cinematic | Slow deliberate parallax layer depth, scroll-driven compositional reveal |
| minimalist-maximalism | slow_cinematic | Dramatic contrast between vast empty pacing and dense zone activation |
| infrared | slow_cinematic | Slow ethereal drift with spectral color transitions |

---

## 2. Parallax Depth Stack

**Format:** Scroll-driven layered composition
**Character:** Multiple visual planes moving at different rates, creating perceived depth without 3D rendering. Layers peel, stack, or drift past each other on scroll.

**Key Techniques:**
- position: sticky with incrementing z-index and slight scale reduction
- Different scroll rates per layer via CSS scroll-driven animations
- Curtain-reveal: hero splitting horizontally as user scrolls
- Layer-by-layer build-up and reveal

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| impressionism | organic_drift | Independently drifting tinted atmospheric planes |
| art-deco | slow_cinematic | Vertical reveal animations staggered along symmetry axis |
| papercut | spring_physics | Parallax scroll with different rates per paper layer, fold/unfold transforms |
| isometric | mechanical_snap | Sequential assembly animations revealing isometric scenes block-by-block |
| rococo | playful_bounce | Parallax depth between foreground ornament and background content |
| miniature-diorama | spring_physics | Camera-position exploration of scene layers |
| surrealism | organic_drift | Layers moving in contradictory directions for impossible depth |
| ukiyo-e | slow_cinematic | Z-index and scale layering for atmospheric perspective |
| studio-product | spring_physics | Parallax card stacks with product reveal |

---

## 3. Generative Canvas

**Format:** Real-time algorithmic / canvas-based animation
**Character:** Outputs emerge from coded parameters -- particle swarms, noise fields, fractal renders, or cellular automata. The hero is alive, unique per visit, and optionally interactive.

**Key Techniques:**
- Canvas-based particle simulation with cursor interaction
- Perlin/Simplex noise field steering particle flow
- WebGL fractal renders as hero backgrounds
- requestAnimationFrame-throttled generation stepping
- Parameter-driven variation (seed, frequency, octaves as design tokens)

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| generative-art | organic_drift | Canvas generative backgrounds with parameter-driven variation |
| noise-field | organic_drift | Particle flow with Perlin noise steering, cursor distortion |
| particle-systems | organic_drift | Physics-based particle swarms with cursor as attractor/repulsor |
| fractal | slow_cinematic | WebGL fractal renders with zoom-on-click detail levels |
| cellular-automata | stutter_glitch | Grid canvas with generation stepping, click-to-toggle cell state |
| aurora-ui | organic_drift | Multi-stop angular gradients animated via hue-rotate or keyframe cycling |

---

## 4. 3D Object Showcase

**Format:** 3D render / isometric / product rotation
**Character:** Dimensional objects presented for inspection -- either isometric illustration, low-poly geometry, wireframe mesh, or studio-lit product photography with rotation capability.

**Key Techniques:**
- 360-degree product rotation via scroll or drag
- Isometric grid with piece-by-piece assembly animation
- CSS 3D perspective grid using transform: perspective() + rotateX()
- SVG polygon backgrounds from Delaunay triangulation
- Three-face color derivation (top/left/right shading from base hue)

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| isometric | mechanical_snap | 30-degree angle assembly build-up, block-by-block reveal |
| low-poly | mechanical_snap | Faceted SVG hero images with hover-triggered facet color transitions |
| wireframe-mesh | mechanical_snap | 3D perspective grid with fill toggle, mesh rotation |
| studio-product | spring_physics | Smooth 360-degree rotation, zoom-to-detail inspection |
| claymorphism | playful_bounce | Puffy 3D elements with squish-on-press and bounce-on-release |
| skeuomorphism | spring_physics | Physically accurate rotation, knob interaction, material simulation |
| material-design | spring_physics | Elevation-based surface hierarchy, container transforms |

---

## 5. Typographic Statement

**Format:** Large-scale type as primary visual element
**Character:** Typography IS the hero -- oversized display type acting as compositional anchor, clipping mask, or kinetic element. Text communicates visually before it communicates verbally.

**Key Techniques:**
- background-clip: text with video/animation behind large type
- Variable font axes interpolated on scroll or hover (font-variation-settings animation)
- Extreme type scale contrast (80px+ headlines vs 12px body)
- Mathematical type scale ratios (golden, Fibonacci)
- Flush-left ragged-right with grid-locked positioning

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| swiss-international | mechanical_snap | Mathematical grid with extreme Helvetica at display scale |
| constructivism | mechanical_snap | Extreme scale contrast, rotated text blocks at 15-45 degrees |
| brutalist-web | stutter_glitch | Monospace text at multiple scales for hierarchy, raw bold type |
| editorial-minimalism | slow_cinematic | Serif display with tight tracking, warm monochrome |
| de-stijl | mechanical_snap | Uppercase geometric sans, grid-locked type positioning |
| minimalism-fine-art | slow_cinematic | Single restrained type element in vast negative space |
| bauhaus | mechanical_snap | One typeface, mathematical proportions, type as shape |
| neubrutalism | spring_physics | Bold grotesque sans with thick borders, anti-polish type |

---

## 6. Photographic Drama

**Format:** Full-bleed photography with post-processing treatment
**Character:** Photography as atmosphere -- the image treatment (color grading, double exposure, infrared mapping, duotone, film grain) is as important as the subject matter. Minimal UI chrome competes with the image.

**Key Techniques:**
- CSS filter + SVG feColorMatrix for gradient-map duotone
- mix-blend-mode: screen between positioned image layers (double exposure)
- CSS filter hue-rotate + invert for infrared simulation
- Grain noise overlay at multiple density levels
- Full-bleed images with overlay gradient for text readability

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| cinematic | slow_cinematic | Color-graded hero with film grain and vignette |
| double-exposure | slow_cinematic | Two blended image layers with screen/multiply compositing |
| analog-film-grain | slow_cinematic | Film-stock specific grain and color grade overlays |
| infrared | slow_cinematic | False-color landscape with deep blue sky and white vegetation |
| cyanotype | slow_cinematic | Prussian blue monochrome with paper texture overlay |
| duotone | spring_physics | Two-color gradient map over photography |
| hdr-hyperrealism | slow_cinematic | Extreme detail visibility across full tonal range |
| tilt-shift | spring_physics | Selective focus band with saturation boost |

---

## 7. SVG Vector Graphic

**Format:** Scalable vector illustration / pattern / decorative element
**Character:** Resolution-independent graphics serving as logos, icons, decorative borders, pattern backgrounds, or animated illustrations. Can be inline SVG for animation control.

**Key Techniques:**
- SVG stroke-dasharray/dashoffset for progressive draw-on animation
- SVG whiplash-curve section dividers (Art Nouveau)
- Repeating CSS pattern backgrounds (dots, squiggles, terrazzo)
- Organic clip-path shapes for hand-cut edge feel
- Ben-Day dot patterns via radial-gradient repeating tiles

**Styles Using This Archetype:**

| Style | Motion Signature | How It Manifests |
|---|---|---|
| line-art | slow_cinematic | Progressive stroke draw-on via dashoffset animation |
| art-nouveau | organic_drift | Vine/tendril SVG growth animations, ornamental corner frames |
| pop-art | playful_bounce | Ben-Day dot patterns, comic burst clip-path animations |
| memphis-design | playful_bounce | Repeating pattern tiles (dots, squiggles, terrazzo) |
| risograph | stutter_glitch | Halftone pattern backgrounds, misregistration offset layers |
| woodcut | stutter_glitch | Carved hatching pattern backgrounds, decorative border frames |
| pixel-art | stutter_glitch | Sprite-sheet animation via background-position stepping |
| suprematism | slow_cinematic | Floating geometric primitives (circle, square, rectangle) |
| bauhaus | mechanical_snap | Shape-primitive icon system, geometric compositions |

---

## Archetype Selection Guide

| If the hero needs to feel... | Use Archetype | Top Style Picks |
|---|---|---|
| Cinematic and immersive | Panning Scene | cinematic, analog-film-grain, afrofuturism |
| Layered and dimensional | Parallax Depth Stack | papercut, impressionism, surrealism |
| Living and interactive | Generative Canvas | particle-systems, noise-field, generative-art |
| Product-focused and inspectable | 3D Object Showcase | studio-product, isometric, low-poly |
| Bold and content-driven | Typographic Statement | swiss-international, constructivism, editorial-minimalism |
| Atmospheric and emotional | Photographic Drama | cinematic, double-exposure, infrared |
| Graphic and resolution-independent | SVG Vector Graphic | line-art, art-nouveau, pop-art |
