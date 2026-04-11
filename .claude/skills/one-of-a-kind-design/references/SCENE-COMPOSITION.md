# Scene Composition System

Every generated image is a composed scene, not a texture. Each scene is assembled from independently controllable slots that combine the STYLE's visual language with the BUSINESS's specific world.

## Scene Slots

Every scene template resolves these 10 slots before generating:

### 1. SUBJECT (what is the focal point?)
- **From user brief:** The specific thing the image is about
- **Style influence:** How the style TREATS the subject (macro detail, silhouette, abstracted, fragmented)
- **Example:** "a rocks glass of bourbon" (from jazz brief) treated with "cinematic shallow depth of field" (from style)

### 2. ENVIRONMENT (where is this?)
- **From user brief:** The physical context (restaurant, warehouse, office, studio, clinic)
- **Style influence:** How the style renders environments (raw concrete, polished wood, frosted glass, layered paper)
- **Example:** "jazz club interior" (from brief) rendered as "dark intimate room with practical lights" (from cinematic style)

### 3. LIGHTING (how is it lit?)
- **From style:** Each style has a signature lighting approach
- **From user mood:** warm/cool/dramatic/soft modulates the style's default
- Options: practical overhead, raking sidelight, diffused caustics, neon bleed, single strobe, ambient bounce, golden hour, laboratory fluorescent, candlelight, infrared

### 4. CAMERA (how are we looking at it?)
- **From style:** Each style has preferred framing (macro, wide, medium, bird's-eye)
- Options: extreme close-up macro, close-up detail, medium shot, wide establishing, bird's-eye, worm's-eye, dutch angle, over-the-shoulder, POV
- Lens: shallow DOF telephoto, deep DOF wide-angle, anamorphic letterbox, tilt-shift miniature

### 5. PALETTE (what colors?)
- **From style taxonomy:** 3 specific hex values per style
- **From user brief:** "blue" or "warm" modulates toward that temperature
- Always specified as exact hex codes, never generic color words

### 6. MATERIALS (what surfaces/textures?)
- **From style:** Each style has signature materials (concrete, timber, silk, glass, ceramic, rust, paper, chrome)
- **From user brief:** Industry-specific materials (piano lacquer for jazz, steel for architecture, porcelain for ramen)

### 7. PROPS (what objects support the story?)
- **From user brief:** Industry-specific objects that tell the business's story
- **Style influence:** How props are rendered (pristine, weathered, fragmented, glowing)
- **Rule:** At least ONE prop must be specific to the user's industry. Generic props = generic output.

### 8. ATMOSPHERE (what fills the air?)
- **From style + mood:** Smoke, haze, dust, steam, rain, fog, particles, clean air
- **Density:** Subtle to heavy (maps to visual_density dial)

### 9. TIME/ERA (when does this feel like?)
- **From style:** Film grain (analog), clean digital, weathered patina, futuristic sheen
- **From user brief:** Vintage, modern, timeless, futuristic

### 10. COMPOSITION GEOMETRY (how is the frame organized?)
- **From style:** Rule of thirds, centered symmetry, broken grid, golden spiral, diagonal tension
- **From dial:** design_variance modulates how conventional the composition is

## Template Format

Scene templates in the taxonomy should use slot placeholders:

```yaml
scene_templates:
  website_hero:
    subject: "the junction where {industry_material_a} meets {industry_material_b}"
    environment: "{industry_space} interior"
    lighting: "amber raking sidelight from upper left"
    camera: "extreme close-up macro, shallow DOF"
    palette: "{style_palette}"
    materials: "{style_material}, {industry_material_a}, {industry_material_b}"
    props: "{industry_hero_prop} catching light"
    atmosphere: "dust motes in the light beam"
    time_era: "decades of patina, aged surfaces"
    composition: "asymmetric, subject off-center left third"
```

## Slot Resolution

The pipeline resolves slots in this order:

1. **Parse user brief** → extract: industry, subject keywords, specific objects mentioned, mood words
2. **Load style profile** → get: default lighting, default camera, palette hex, materials, atmosphere
3. **Load industry vocabulary** → get: industry-specific materials, props, environments, hero objects
4. **Merge:** user specifics override style defaults. Style defaults fill any gaps.
5. **Assemble prompt:** combine all resolved slots into a single generation prompt

## Industry Vocabularies

Each industry has a set of objects, materials, and environments that make images SPECIFIC:

### architecture
- materials: reclaimed timber, poured concrete, corten steel, rammed earth, recycled glass
- props: architectural model, blueprint, material sample, joint detail, tool marks
- environments: studio, site, workshop, gallery space
- hero_object: the joint/connection/detail where craft is visible

### restaurant/food
- materials: ceramic, lacquered wood, linen, copper, hand-thrown pottery
- props: specific dish components, utensils, ingredients, steam, condensation
- environments: counter, kitchen, dining room, prep station
- hero_object: the signature dish or the surface where food is served

### music/jazz
- materials: lacquered piano, brass instrument, vinyl, leather, worn wood
- props: bourbon glass, sheet music, microphone, pick, rosin, record sleeve
- environments: club interior, recording studio, stage, practice room
- hero_object: the instrument surface or the glass that someone set down

### tech/crypto
- materials: dark glass, brushed aluminum, carbon fiber, LED-lit edges
- props: screen reflections, data visualizations, abstract geometric forms
- environments: dark minimal workspace, server room, trading floor abstracted
- hero_object: a single interface element or data pattern that represents the product

### funeral/memorial
- materials: stone, aged wood, frosted glass, polished brass, linen
- props: soft light, a single flower (not arrangements), candle flame, water reflection
- environments: chapel, garden, contemplation room, threshold
- hero_object: light itself — how it enters the space

### children/education
- materials: paper, crayon, clay, fabric, painted wood
- props: open book, stacked blocks, finger paintings, chalk marks, paper cutouts
- environments: reading nook, classroom corner, treehouse, pillow fort
- hero_object: the specific book or toy that anchors the scene

### fashion
- materials: fabric textures, stitching details, zipper hardware, leather grain
- props: thread spool, tailor's chalk, dress form detail, fabric swatch
- environments: atelier, fitting room, backstage, fabric warehouse
- hero_object: the garment detail that shows the craft

### photography/documentary
- materials: film negative, contact sheet, darkroom chemical stains, camera body
- props: prints hanging on a line, light table, loupe, film canister
- environments: darkroom, field (abstracted), editing desk
- hero_object: a single frame from the work — the photo within the photo

### sustainability/climate
- materials: reclaimed materials, living moss, weathered wood, glacial ice, soil
- props: growth/decay cycle, seedling, data visualization, satellite imagery abstracted
- environments: greenhouse, field research site, laboratory, forest floor
- hero_object: the material transformation — before/after, growth, renewal

### perfume/fragrance
- materials: glass (flacon detail), liquid amber, dried botanicals, raw ingredients
- props: single ingredient in isolation, droplet, smoke tendril from incense
- environments: laboratory, garden, ingredient origin landscape
- hero_object: the raw ingredient that IS the scent, not the bottle

### vinyl/music retail
- materials: vinyl grooves (macro), cardboard sleeve texture, turntable felt
- props: record label detail, needle on groove, stack of spines, hand-lettered price tag
- environments: crate digging, listening station, shop counter
- hero_object: the vinyl groove itself — sound made physical
