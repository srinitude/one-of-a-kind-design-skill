# CAMERA CHOREOGRAPHY
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Camera bracket sequences for video generation mapped to all 66 styles via their motion_signatures. Each motion signature type defines characteristic camera movements, and styles inherit those movements based on their assigned signature.

---

## Camera Brackets by Motion Signature

### slow_cinematic

Camera moves are measured, deliberate, and dramatic. Every movement serves the narrative. Long takes, minimal cuts.

| Bracket | Description | Best For |
|---|---|---|
| `[Push in] Slow dolly forward` | Gradual forward movement creating intimacy and focus, 3-5 second duration | Hero reveals, product spotlights, emotional moments |
| `[Pan left] Establishing sweep` | Horizontal sweep revealing a scene from left to right at measured pace | Scene-setting, environment reveals, wide establishing shots |
| `[Rack focus] Foreground to background` | Focus transition from near element to distant element, depth revelation | Layered compositions, before/after, dual-subject narratives |
| `[Crane up] Ascending reveal` | Vertical ascent revealing context and scale, from detail to overview | Grand reveals, architectural showcases, landscape openings |
| `[Dolly out] Slow retreat` | Gradual backward movement revealing wider context around subject | Context reveals, endings, pulling back to see the whole picture |

**Styles:** art-deco, minimalism-fine-art, scandinavian-minimalism, afrofuturism, ukiyo-e, fractal, ai-diffusion, cinematic, analog-film-grain, hdr-hyperrealism, infrared, cyanotype, double-exposure, line-art, resonant-stark, editorial-minimalism, minimalist-maximalism, suprematism, arte-povera-digital, mono-ha

---

### spring_physics

Camera has weight and momentum. Movements feel physical -- they overshoot slightly and settle. Responsive and tactile.

| Bracket | Description | Best For |
|---|---|---|
| `[Snap to] Quick settle with overshoot` | Rapid movement to target with slight overshoot and spring-back settle | Product transitions, UI state changes, card reveals |
| `[Follow] Tracking with inertia` | Camera follows subject with slight lag, creating physical weight | Product rotation, interactive showcases, following motion |
| `[Bounce land] Drop with spring` | Camera drops to position and bounces 1-2 times before settling | Playful reveals, landing moments, arrival states |
| `[Orbit] Weighted circular path` | Smooth orbital path around subject with momentum-based speed variation | 360-degree product views, object inspection, scene exploration |

**Styles:** flat-design, material-design, neomorphism, glassmorphism, skeuomorphism, claymorphism, dark-mode-ui, duotone, papercut, tilt-shift, miniature-diorama, studio-product, neubrutalism, liquid-glass, bento-ui, y2k-revival, tactile-craft-digital

---

### mechanical_snap

Camera moves are precise, grid-locked, and decisive. No smooth curves -- movements are calculated and stop exactly on target.

| Bracket | Description | Best For |
|---|---|---|
| `[Slide right] Grid-locked lateral` | Horizontal slide that stops exactly on grid line, no ease-out drift | Grid transitions, panel reveals, tabbed content |
| `[Cut to] Hard angle switch` | Instantaneous camera angle change with no transition | State changes, perspective switches, confrontational reveals |
| `[Step zoom] Discrete zoom increments` | Zoom that happens in 2-3 distinct steps rather than smooth continuous | Detail inspection, data zoom, map-like navigation |
| `[Lock rotate] 90-degree snap rotation` | Rotation in exact 90-degree increments with mechanical precision | Isometric transitions, grid rotations, architectural views |

**Styles:** constructivism, bauhaus, de-stijl, swiss-international, isometric, low-poly, wireframe-mesh

---

### organic_drift

Camera moves like it is floating on water or carried by wind. No start/stop points -- continuous gentle movement.

| Bracket | Description | Best For |
|---|---|---|
| `[Float] Gentle ambient drift` | Continuous slow movement in varying directions, never fully stopping | Atmospheric backgrounds, ambient scenes, mood establishment |
| `[Breathe] Subtle zoom oscillation` | Very slow in-out zoom cycle (10-20 second period), barely perceptible | Meditation scenes, ambient loops, living backgrounds |
| `[Meander] Irregular path wander` | Camera follows a lazy, non-linear path through the scene | Nature scenes, abstract compositions, dreamscapes |
| `[Parallax drift] Layered plane separation` | Different scene layers move at different speeds, creating depth | Atmospheric depth, layered compositions, impressionist scenes |

**Styles:** impressionism, art-nouveau, surrealism, aurora-ui, psychedelic, vaporwave, generative-art, noise-field, particle-systems, solarpunk

---

### playful_bounce

Camera has cartoon physics -- exaggerated overshoot, squash-and-stretch energy, joyful momentum.

| Bracket | Description | Best For |
|---|---|---|
| `[Pop in] Scale from zero with overshoot` | Element/camera scales from nothing to full size with bounce past target | Character intros, product reveals, celebration moments |
| `[Wiggle] Oscillating micro-rotation` | Small rapid rotational oscillation (2-3 degrees), like excited nodding | Attention-grabbing moments, interactive feedback, idle states |
| `[Catapult] Fast launch with arc` | Rapid launch along curved path, arriving at destination with bounce | Transitions between sections, navigation, state changes |
| `[Squash zoom] Compress before expand` | Camera squashes vertically before expanding into zoom, like winding up | Dramatic reveals, reward moments, surprise content |

**Styles:** rococo, pop-art, memphis-design, claymorphism

---

### stutter_glitch

Camera movement is deliberately broken -- frame skips, position jitter, channel artifacts. The imperfection is intentional.

| Bracket | Description | Best For |
|---|---|---|
| `[Jitter hold] Static with random micro-displacement` | Camera holds position but jumps 1-3 pixels randomly at irregular intervals | Tension building, glitch aesthetic, VHS static |
| `[Frame skip] Dropped-frame jump cuts` | Movement that skips frames, creating jerky progression through space | Corrupted footage, time-lapse glitch, error states |
| `[Channel split] RGB displacement divergence` | Three copies of the frame offset in different directions per RGB channel | Glitch reveals, data corruption, digital artifact |
| `[Tracking error] VHS tracking band roll` | Horizontal distortion band rolling vertically through the frame | Retro video, vaporwave atmosphere, tape-damage aesthetic |

**Styles:** brutalist-web, risograph, woodcut, retro-vintage-print, pixel-art, glitch, cellular-automata, deconstructivism

---

## Complete Style-to-Camera Mapping

| Style | Motion Signature | Primary Camera Brackets |
|---|---|---|
| art-deco | slow_cinematic | Push in, Crane up, Rack focus |
| impressionism | organic_drift | Float, Parallax drift, Breathe |
| constructivism | mechanical_snap | Cut to, Slide right, Lock rotate |
| art-nouveau | organic_drift | Float, Meander, Parallax drift |
| bauhaus | mechanical_snap | Slide right, Lock rotate, Step zoom |
| de-stijl | mechanical_snap | Slide right, Cut to, Lock rotate |
| rococo | playful_bounce | Pop in, Wiggle, Squash zoom |
| surrealism | organic_drift | Meander, Float, Parallax drift |
| pop-art | playful_bounce | Pop in, Catapult, Wiggle |
| minimalism-fine-art | slow_cinematic | Push in, Dolly out, Crane up |
| flat-design | spring_physics | Snap to, Follow, Orbit |
| material-design | spring_physics | Snap to, Follow, Bounce land |
| neomorphism | spring_physics | Snap to, Bounce land, Follow |
| glassmorphism | spring_physics | Snap to, Orbit, Follow |
| brutalist-web | stutter_glitch | Jitter hold, Frame skip, Cut to |
| skeuomorphism | spring_physics | Follow, Orbit, Snap to |
| aurora-ui | organic_drift | Float, Breathe, Parallax drift |
| claymorphism | playful_bounce | Pop in, Wiggle, Squash zoom |
| dark-mode-ui | spring_physics | Snap to, Follow, Orbit |
| isometric | mechanical_snap | Lock rotate, Slide right, Step zoom |
| line-art | slow_cinematic | Push in, Pan left, Dolly out |
| risograph | stutter_glitch | Jitter hold, Frame skip, Channel split |
| duotone | spring_physics | Snap to, Follow, Orbit |
| woodcut | stutter_glitch | Frame skip, Jitter hold, Cut to |
| retro-vintage-print | stutter_glitch | Frame skip, Tracking error, Jitter hold |
| papercut | spring_physics | Bounce land, Snap to, Follow |
| low-poly | mechanical_snap | Lock rotate, Step zoom, Slide right |
| pixel-art | stutter_glitch | Frame skip, Jitter hold, Channel split |
| wabi-sabi | organic_drift | Float, Breathe, Meander |
| scandinavian-minimalism | slow_cinematic | Push in, Pan left, Dolly out |
| psychedelic | organic_drift | Meander, Breathe, Parallax drift |
| afrofuturism | slow_cinematic | Crane up, Push in, Pan left |
| vaporwave | organic_drift | Float, Parallax drift, Breathe |
| ukiyo-e | slow_cinematic | Pan left, Push in, Rack focus |
| memphis-design | playful_bounce | Pop in, Catapult, Wiggle |
| swiss-international | mechanical_snap | Slide right, Cut to, Step zoom |
| generative-art | organic_drift | Float, Breathe, Meander |
| glitch | stutter_glitch | Channel split, Frame skip, Jitter hold |
| fractal | slow_cinematic | Push in (infinite zoom), Rack focus, Crane up |
| ai-diffusion | slow_cinematic | Push in, Pan left, Dolly out |
| cellular-automata | stutter_glitch | Frame skip, Jitter hold, Step zoom |
| noise-field | organic_drift | Float, Breathe, Parallax drift |
| particle-systems | organic_drift | Float, Parallax drift, Meander |
| wireframe-mesh | mechanical_snap | Lock rotate, Slide right, Step zoom |
| cinematic | slow_cinematic | Push in, Pan left, Rack focus, Crane up |
| tilt-shift | spring_physics | Snap to, Follow, Bounce land |
| analog-film-grain | slow_cinematic | Push in, Pan left, Dolly out |
| hdr-hyperrealism | slow_cinematic | Push in, Pan left, Rack focus |
| infrared | slow_cinematic | Float (slow), Pan left, Dolly out |
| cyanotype | slow_cinematic | Push in (exposure reveal), Dolly out |
| double-exposure | slow_cinematic | Push in, Rack focus, Pan left |
| miniature-diorama | spring_physics | Orbit, Follow, Snap to |
| studio-product | spring_physics | Orbit, Snap to, Follow |
| neubrutalism | spring_physics | Snap to, Bounce land, Follow |
| liquid-glass | spring_physics | Snap to, Follow, Orbit |
| bento-ui | spring_physics | Snap to, Follow, Orbit |
| resonant-stark | slow_cinematic | Push in (barely perceptible), Breathe, Dolly out |
| editorial-minimalism | slow_cinematic | Push in, Pan left, Dolly out |
| minimalist-maximalism | slow_cinematic | Push in, Crane up, Rack focus |
| y2k-revival | spring_physics | Snap to, Bounce land, Orbit |
| tactile-craft-digital | spring_physics | Bounce land, Snap to, Follow |
| solarpunk | organic_drift | Float, Breathe, Meander |
| suprematism | slow_cinematic | Push in, Dolly out, Crane up |
| arte-povera-digital | slow_cinematic | Push in (slow), Dolly out, Pan left |
| deconstructivism | stutter_glitch | Frame skip, Channel split, Cut to |
| mono-ha | slow_cinematic | Push in (near-imperceptible), Breathe, Dolly out |
