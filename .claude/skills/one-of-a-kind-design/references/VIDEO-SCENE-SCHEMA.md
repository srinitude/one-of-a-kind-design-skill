# Video Scene Ontology, Schema, and Prompt System

This document consolidates:
1. A strict scene-element ontology
2. A reusable JSON/YAML scene schema
3. A prompt template system for video generation tools
4. An evaluation rubric for generated outputs

---

## 1) Complete Ontology of Video Scene Elements

A scene is not just characters plus background. It is best modeled as:

**Entities + Composition + Motion + Light + Materials + Atmosphere + Audio + Narrative + Edit**

### 1.1 Entities
#### Characters
- Humans
- Animals / creatures
- Stylized beings
- Crowd / extras

**Character attributes**
- Wardrobe / costume
- Hair / makeup
- Carried props
- Physical state
- Emotion
- Pose
- Screen placement

#### Objects / Props
- Handheld items
- Set dressing
- Interactive objects
- Vehicles / tools

**Prop classes**
- Hero props
- Background props

#### Environment
- Interior / exterior
- Specific location
- Architecture / structures
- Terrain / surfaces
- Natural formations

#### Background layers
- Foreground
- Midground
- Background
- Sky / horizon

---

### 1.2 Visual Composition
#### Framing & shot type
- Establishing shot
- Wide shot
- Medium shot
- Close-up
- Extreme close-up
- Over-the-shoulder
- POV

#### Camera properties
- Position
- Angle
- Height
- Lens feel
- Focus behavior
- Camera movement

#### Spatial relationships
- Distance between entities
- Occlusion
- Staging
- Left/right/center weighting

#### Composition rules
- Rule of thirds
- Leading lines
- Symmetry / asymmetry
- Negative space

---

### 1.3 Motion & Time
#### Character motion
- Body movement
- Facial movement
- Gestures

#### Object motion
- Physics-driven motion
- Mechanical motion
- Held-object motion

#### Camera motion
- Static
- Pan
- Tilt
- Dolly
- Crane
- Handheld
- Push-in

#### Environmental motion
- Wind
- Water
- Particles
- Fire / smoke / fog

#### Timing
- Real-time
- Slow motion
- Shot duration
- Pacing
- Cuts vs continuous motion

---

### 1.4 Lighting & Color
#### Light sources
- Sun / moon
- Lamps
- Screens
- Neon
- Fire
- Practicals

#### Lighting qualities
- Direction
- Intensity
- Softness / hardness
- Contrast
- Color temperature

#### Shadows
- Hard shadows
- Soft shadows
- Ambient occlusion
- Rim highlights

#### Color system
- Dominant colors
- Accent colors
- Saturation
- Contrast
- Grade / LUT

---

### 1.5 Materials & Surface Behavior
- Metal
- Glass
- Skin
- Fabric
- Concrete
- Wood
- Water
- Plastic

**Properties**
- Reflectivity
- Roughness
- Transparency
- Wetness
- Surface detail
- Texture fidelity

---

### 1.6 Atmosphere & Effects
- Rain
- Snow
- Fog
- Haze
- Dust
- Embers
- Sparks
- Smoke
- Volumetric light
- Reflections
- Explosions
- Fire

---

### 1.7 Audio
- Dialogue
- Foley
- Environmental sound
- Music / score
- Silence

---

### 1.8 Narrative & Intent
- Scene purpose
- Story beat
- Goal / conflict
- Emotional tone
- Symbolism
- Viewer takeaway

---

### 1.9 Editing & Post
- Cuts
- Dissolves
- Match cuts
- Motion blur
- Bloom
- Lens flare
- Grain
- Glitch effects
- Timing / rhythm

---

### 1.10 Technical / Metadata
- Continuity rules
- Style constraints
- Genre
- Era
- Aspect ratio
- Resolution
- Frame rate
- Duration

---

## 2) Full JSON Example

```json
{
  "scene_id": "scene_001",
  "title": "Rooftop confrontation at dusk",
  "summary": "Two rivals face each other on a windy rooftop as neon lights flicker below.",
  "intent": {
    "narrative_role": "climax",
    "emotional_tone": ["tense", "cinematic", "melancholic"],
    "story_beat": "final warning before conflict",
    "viewer_takeaway": "impending irreversible decision"
  },
  "world": {
    "setting": {
      "location_type": "exterior",
      "specific_location": "urban rooftop",
      "era": "near-future",
      "time_of_day": "dusk",
      "geography": "dense city center"
    },
    "environment": {
      "weather": ["windy", "light mist"],
      "atmospherics": ["haze", "distant steam"],
      "hazards": [],
      "surfaces": ["wet concrete", "metal railings", "glass skylight"]
    }
  },
  "characters": [
    {
      "id": "char_a",
      "name": "Mara",
      "role": "protagonist",
      "description": {
        "species": "human",
        "age_range": "30s",
        "build": "lean",
        "presentation": "focused, exhausted"
      },
      "appearance": {
        "wardrobe": ["dark trench coat", "black boots"],
        "hair": "short dark hair blown by wind",
        "makeup": "minimal",
        "distinguishing_features": ["scar over eyebrow"]
      },
      "state": {
        "emotion": "controlled anger",
        "physical_condition": ["wet", "slightly injured"],
        "pose": "standing, shoulders squared"
      },
      "placement": {
        "layer": "foreground",
        "screen_position": "left-third",
        "orientation": "facing right"
      },
      "action": {
        "primary": "stares at rival",
        "secondary": ["tightens grip on briefcase"]
      }
    }
  ],
  "objects": [
    {
      "id": "prop_001",
      "name": "metal briefcase",
      "category": "hero_prop",
      "material": "brushed aluminum",
      "state": ["scratched", "wet"],
      "placement": {
        "owner": "char_a",
        "layer": "foreground"
      },
      "narrative_significance": "contains the core evidence"
    }
  ],
  "background": {
    "foreground_elements": ["antenna cables"],
    "midground_elements": ["roof access door", "hvac units"],
    "background_elements": ["skyscrapers with lit windows"],
    "sky": "blue-purple dusk sky with cloud cover",
    "horizon": "dense neon skyline"
  },
  "cinematography": {
    "shot_type": "medium wide",
    "framing": "two-shot",
    "camera_angle": "eye level",
    "camera_height": "standing height",
    "lens_feel": "slightly telephoto",
    "depth_of_field": "shallow",
    "focus_target": ["char_a", "char_b"],
    "camera_motion": {
      "type": "slow push-in",
      "stability": "smooth",
      "speed": "slow"
    },
    "composition": {
      "rules": ["rule of thirds", "foreground framing"],
      "negative_space": "upper-right quadrant",
      "symmetry": "asymmetrical tension"
    }
  },
  "motion": {
    "character_motion": [
      {
        "character_id": "char_a",
        "movement": "subtle forward step",
        "timing": "late in shot"
      }
    ],
    "object_motion": [
      {
        "object_id": "prop_001",
        "movement": "slight sway from grip tension"
      }
    ],
    "environmental_motion": ["coat flapping", "mist drifting", "distant blinking signage"]
  },
  "lighting": {
    "motivated_sources": [
      "ambient dusk sky",
      "pink-blue city neon",
      "roof access security light"
    ],
    "quality": {
      "contrast": "medium-high",
      "hardness": "soft ambient with sharp rim highlights",
      "directionality": "back rim from skyline, fill from sky"
    },
    "color_temperature": {
      "key": "cool",
      "practicals": "mixed neon magenta/cyan"
    },
    "shadows": "soft ambient shadows with occasional hard edge highlights"
  },
  "color": {
    "palette": {
      "dominant": ["slate blue", "charcoal", "steel gray"],
      "accent": ["magenta neon", "cyan neon"],
      "skin_tone_strategy": "slightly desaturated natural skin"
    },
    "saturation": "moderate",
    "contrast": "elevated",
    "grade": "cinematic teal-magenta restrained"
  },
  "materials": [
    {
      "surface": "concrete",
      "properties": ["wet", "rough", "lightly reflective"]
    },
    {
      "surface": "coat fabric",
      "properties": ["matte wool", "wind-reactive"]
    }
  ],
  "effects": {
    "practical_or_simulated": ["mist", "wind movement", "neon flicker"],
    "post_effects": ["subtle bloom", "light film grain", "gentle motion blur"],
    "avoid": ["heavy lens flare", "overdone smoke", "cartoonish particles"]
  },
  "audio": {
    "dialogue": {
      "present": true,
      "style": "low, restrained, confrontational"
    },
    "sfx": [
      "wind gusts",
      "distant sirens",
      "fabric rustle",
      "shoe scrape on wet concrete"
    ],
    "music": {
      "present": true,
      "style": "minimal synth tension bed",
      "intensity_curve": "slow rise"
    },
    "silence_moments": ["half-second pause before response"]
  },
  "continuity": {
    "must_preserve": [
      "briefcase remains in left hand",
      "coat stays wet",
      "wind direction remains consistent",
      "neon colors remain magenta/cyan"
    ],
    "forbidden_changes": [
      "do not change wardrobe",
      "do not change weather",
      "do not switch time of day",
      "do not add extra characters"
    ]
  },
  "technical": {
    "aspect_ratio": "16:9",
    "resolution_target": "1920x1080",
    "frame_rate": 24,
    "duration_seconds": 8,
    "delivery_format": "cinematic video"
  },
  "generation_notes": {
    "priority_order": [
      "character identity consistency",
      "briefcase visibility",
      "wind + dusk mood",
      "smooth push-in camera"
    ],
    "failure_modes_to_avoid": [
      "extra fingers",
      "floating props",
      "overly bright daytime look",
      "background becoming generic",
      "unmotivated camera shake"
    ]
  }
}
```

---

## 3) YAML Version

```yaml
scene_id: scene_001
title: Rooftop confrontation at dusk
summary: Two rivals face each other on a windy rooftop as neon lights flicker below.

intent:
  narrative_role: climax
  emotional_tone:
    - tense
    - cinematic
    - melancholic
  story_beat: final warning before conflict
  viewer_takeaway: impending irreversible decision

world:
  setting:
    location_type: exterior
    specific_location: urban rooftop
    era: near-future
    time_of_day: dusk
    geography: dense city center
  environment:
    weather: [windy, light mist]
    atmospherics: [haze, distant steam]
    hazards: []
    surfaces: [wet concrete, metal railings, glass skylight]

characters:
  - id: char_a
    name: Mara
    role: protagonist
    description:
      species: human
      age_range: 30s
      build: lean
      presentation: focused, exhausted
    appearance:
      wardrobe: [dark trench coat, black boots]
      hair: short dark hair blown by wind
      makeup: minimal
      distinguishing_features: [scar over eyebrow]
    state:
      emotion: controlled anger
      physical_condition: [wet, slightly injured]
      pose: standing, shoulders squared
    placement:
      layer: foreground
      screen_position: left-third
      orientation: facing right
    action:
      primary: stares at rival
      secondary: [tightens grip on briefcase]

objects:
  - id: prop_001
    name: metal briefcase
    category: hero_prop
    material: brushed aluminum
    state: [scratched, wet]
    placement:
      owner: char_a
      layer: foreground
    narrative_significance: contains the core evidence

background:
  foreground_elements: [antenna cables]
  midground_elements: [roof access door, hvac units]
  background_elements: [skyscrapers with lit windows]
  sky: blue-purple dusk sky with cloud cover
  horizon: dense neon skyline

cinematography:
  shot_type: medium wide
  framing: two-shot
  camera_angle: eye level
  camera_height: standing height
  lens_feel: slightly telephoto
  depth_of_field: shallow
  focus_target: [char_a, char_b]
  camera_motion:
    type: slow push-in
    stability: smooth
    speed: slow
  composition:
    rules: [rule of thirds, foreground framing]
    negative_space: upper-right quadrant
    symmetry: asymmetrical tension

motion:
  character_motion:
    - character_id: char_a
      movement: subtle forward step
      timing: late in shot
  object_motion:
    - object_id: prop_001
      movement: slight sway from grip tension
  environmental_motion:
    - coat flapping
    - mist drifting
    - distant blinking signage

lighting:
  motivated_sources:
    - ambient dusk sky
    - pink-blue city neon
    - roof access security light
  quality:
    contrast: medium-high
    hardness: soft ambient with sharp rim highlights
    directionality: back rim from skyline, fill from sky
  color_temperature:
    key: cool
    practicals: mixed neon magenta/cyan
  shadows: soft ambient shadows with occasional hard edge highlights

color:
  palette:
    dominant: [slate blue, charcoal, steel gray]
    accent: [magenta neon, cyan neon]
    skin_tone_strategy: slightly desaturated natural skin
  saturation: moderate
  contrast: elevated
  grade: cinematic teal-magenta restrained

materials:
  - surface: concrete
    properties: [wet, rough, lightly reflective]
  - surface: coat fabric
    properties: [matte wool, wind-reactive]

effects:
  practical_or_simulated: [mist, wind movement, neon flicker]
  post_effects: [subtle bloom, light film grain, gentle motion blur]
  avoid: [heavy lens flare, overdone smoke, cartoonish particles]

audio:
  dialogue:
    present: true
    style: low, restrained, confrontational
  sfx: [wind gusts, distant sirens, fabric rustle, shoe scrape on wet concrete]
  music:
    present: true
    style: minimal synth tension bed
    intensity_curve: slow rise
  silence_moments: [half-second pause before response]

continuity:
  must_preserve:
    - briefcase remains in left hand
    - coat stays wet
    - wind direction remains consistent
    - neon colors remain magenta/cyan
  forbidden_changes:
    - do not change wardrobe
    - do not change weather
    - do not switch time of day
    - do not add extra characters

technical:
  aspect_ratio: "16:9"
  resolution_target: 1920x1080
  frame_rate: 24
  duration_seconds: 8
  delivery_format: cinematic video

generation_notes:
  priority_order:
    - character identity consistency
    - briefcase visibility
    - wind + dusk mood
    - smooth push-in camera
  failure_modes_to_avoid:
    - extra fingers
    - floating props
    - overly bright daytime look
    - background becoming generic
    - unmotivated camera shake
```

---

## 4) Minimal Reusable Skeleton

```yaml
scene_id: ""
summary: ""

intent:
  narrative_role: ""
  emotional_tone: []
  story_beat: ""

world:
  location: ""
  time_of_day: ""
  era: ""
  weather: []
  atmospherics: []

characters: []
objects: []
background: {}

cinematography:
  shot_type: ""
  framing: ""
  camera_angle: ""
  lens_feel: ""
  depth_of_field: ""
  camera_motion: {}

motion:
  character_motion: []
  object_motion: []
  environmental_motion: []

lighting:
  sources: []
  quality: {}
  color_temperature: {}

color:
  palette: {}
  grade: ""

materials: []
effects: {}
audio: {}

continuity:
  must_preserve: []
  forbidden_changes: []

technical:
  aspect_ratio: ""
  frame_rate: 24
  duration_seconds: 0

generation_notes:
  priority_order: []
  failure_modes_to_avoid: []
```

---

## 5) Prompt Template System

### Master template

```text
[SCENE CORE]
A [shot_type] of [subject/characters] in/on [location], during [time_of_day], with [weather/atmosphere].

[CHARACTERS]
Primary subject: [appearance, wardrobe, emotional state, action].
Secondary subject(s): [appearance, wardrobe, emotional state, action].

[ENVIRONMENT]
The environment includes [foreground elements], [midground elements], and [background elements].
Important surfaces/materials: [materials, textures, reflectivity].

[CAMERA]
Camera position: [angle/height].
Lens feel: [wide/normal/telephoto].
Camera movement: [static/pan/tilt/dolly/handheld/slow push-in].
Focus behavior: [deep focus/shallow DOF/rack focus].

[LIGHTING]
Lighting is [soft/hard/high contrast/low contrast], motivated by [light sources].
Color temperature: [warm/cool/mixed].
Shadows/highlights: [description].

[COLOR & STYLE]
Color palette: [dominant + accent colors].
Visual style: [photoreal / stylized / cinematic / archival / ad-like / anime / painterly].
Overall mood: [tone].

[MOTION]
Character motion: [exact actions].
Environmental motion: [wind, rain, particles, reflections].
Object motion: [if relevant].

[EFFECTS]
Include [mist, rain, bloom, film grain, motion blur, etc.] only if natural and restrained.

[CONSTRAINTS]
Maintain consistent character identity, wardrobe, prop placement, time of day, and weather.
Do not add extra characters or objects.
Do not distort anatomy or hands.
Do not change the background into a generic setting.

[OUTPUT TARGET]
[duration] seconds, [aspect ratio], [fps], [quality target].
```

### Compressed template

```text
Cinematic [shot_type] of [subject] at [location] during [time_of_day], [weather] atmosphere. [Subject description, wardrobe, emotion, action]. Foreground: [x]. Midground: [y]. Background: [z]. [Camera angle], [lens feel], [camera motion], [focus behavior]. Lighting motivated by [sources], [contrast] contrast, [color temperature] tones. Palette of [dominant colors] with [accent colors]. [Environmental motion]. [Post effects if any]. Maintain identity consistency, prop continuity, weather continuity, and scene realism. Avoid extra limbs, extra characters, warped objects, and generic backgrounds. [duration], [aspect ratio], [fps].
```

---

## 6) Tool-Oriented Prompt Variants

### Runway-style
```text
A cinematic medium-wide shot of a woman in a dark trench coat standing on a wet rooftop at dusk, facing her rival. Wind blows her coat and hair. Neon magenta and cyan city lights glow in the background through light mist. Slow push-in camera, shallow depth of field, eye-level framing, slightly telephoto lens feel. Soft cool dusk light mixed with neon rim light. Wet concrete reflections, restrained bloom, subtle film grain. Tense, melancholic mood. Keep character appearance, wardrobe, and briefcase consistent. No extra people, no anatomy distortion, no daylight look.
```

### Sora-style
```text
A near-future urban rooftop at dusk overlooking a dense neon skyline. Two rivals face each other in silence near a roof access door and several HVAC units. The main subject is a woman in her 30s with short dark hair, a scar over her eyebrow, a dark wet trench coat, and a scratched aluminum briefcase in her left hand. Wind pushes mist across the roof and moves her coat naturally. The camera begins in a medium-wide two-shot at eye level and slowly pushes in. The image has shallow depth of field, soft ambient dusk lighting, cyan and magenta neon accents, wet concrete reflections, and restrained cinematic grain. Preserve the woman’s identity, the briefcase placement, the wet weather, and the dusk lighting throughout the shot. Avoid extra characters, warped hands, unstable props, or sudden background changes.
```

### Pika-style
```text
Moody cinematic rooftop confrontation at dusk, wet concrete, neon skyline, light mist, wind moving coat and hair. Medium-wide two-shot, slow push-in, shallow depth of field. Woman in dark trench coat holding a scratched metal briefcase, facing a rival. Cool dusk light with magenta and cyan neon highlights. Tense, polished, realistic motion. No extra people, no surreal distortions, no bright daytime lighting.
```

---

## 7) Best-Practice Constraint Blocks

### Identity lock
```text
Character consistency is critical: preserve face structure, hairstyle, wardrobe, body proportions, and age presentation across the entire shot.
```

### Continuity lock
```text
Continuity is critical: preserve prop positions, weather, lighting direction, time of day, and background layout across all frames.
```

### Motion realism block
```text
Motion should feel physically believable: natural walking mechanics, realistic cloth movement, stable object interaction, no unnatural jitter or float.
```

### Anti-failure block
```text
Avoid: extra fingers, broken anatomy, duplicate objects, floating accessories, warped faces, unstable background geometry, sudden lighting shifts, generic substitutions.
```

---

## 8) Practical Agent Pipeline

1. Scene spec  
   Write the source-of-truth YAML or JSON.

2. Prompt compiler  
   Convert structured fields into natural-language prompt text.

3. Constraint injector  
   Append continuity locks and anti-failure clauses.

4. Tool variant emitter  
   Produce:
   - runway_prompt
   - sora_prompt
   - pika_prompt

5. Evaluator  
   Score outputs against consistency and target match.

---

## 9) Evaluation Rubric

```yaml
evaluation:
  character_identity_match: 0-5
  wardrobe_consistency: 0-5
  prop_continuity: 0-5
  environment_specificity: 0-5
  lighting_accuracy: 0-5
  camera_match: 0-5
  motion_realism: 0-5
  anatomy_integrity: 0-5
  mood_alignment: 0-5
  overall_submission_readiness: 0-5
```

---

## 10) Recommended Separation of Concerns

Use:
- **YAML/JSON** as the source of truth
- **compiled prompt text** as a derived artifact
- **evaluation rubric** as a separate derived artifact

That makes scene generation more deterministic and easier to validate.
