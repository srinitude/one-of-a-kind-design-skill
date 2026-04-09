# Deconstructed Opera Trailer

> Pipeline walkthrough: video generation with camera choreography for performing arts

---

## Scenario

User says: "Contemporary opera company staging a deconstructed Madama Butterfly. We need a 15-second trailer that feels like the set design -- fractured, layered, uncomfortable beauty. The audience is 25-40 year old art patrons who think opera is dead."

This is a video-first brief. The deliverable is a 15-second trailer -- not a website, not a static image. The pipeline routes through `prompt-crafter-video-camera` for camera choreography notation, then `prompt-crafter-video-gen` for the primary generation, then `prompt-crafter-video-restyle` for the layered deconstructivist treatment. Every camera movement in this walkthrough is a dramatic choice that maps to deconstructivism's philosophy: structures that look unstable but hold, beauty that emerges from apparent disorder, the tension between what an audience expects and what they receive.

---

## Creative Brief

- **Client:** Fracture Opera (contemporary opera company)
- **Output type:** Video (15 seconds)
- **Industry:** Performing arts
- **Audience:** Art patrons aged 25-40 who believe opera is culturally irrelevant
- **Mood:** Fractured, layered, uncomfortable-beauty
- **Style:** deconstructivism
- **Convention-breaking:** Opera trailer that looks nothing like opera marketing. No velvet curtains, no sopranos in costume, no gold-embossed serif type, no panning shots of a grand auditorium. This trailer should feel closer to a Gehry building than a Playbill cover.
- **Quality emphasis:** Prompt-artifact alignment (target 9), Distinctiveness (target 9), Aesthetic (target 8)

The brief demands a trailer that *attacks* the audience's assumptions about what opera looks like. The deconstructivism style is not decorative here -- it is thematic. Puccini's Butterfly is a story about structures collapsing: cultural assumptions, romantic promises, a woman's entire world. A fractured visual language makes the trailer an argument, not an advertisement.

---

## Pipeline Walkthrough

### Step 0: Message Enhancement (specificity 6/7)

The user message scores **6 out of 7** on the extraction dimensions:

| Dimension | Detected | Value |
|---|---|---|
| Output type | Yes | Video (15-second trailer) |
| Industry | Yes | Performing arts |
| Mood / aesthetic tags | Yes | Fractured, layered, uncomfortable-beauty |
| Audience segment | Yes | Art patrons 25-40 |
| Explicit style | Yes | Deconstructivism (via "deconstructed" + mood signals) |
| Convention-breaking signals | Yes | "looks nothing like opera marketing", "opera is dead" |
| Quality emphasis | No | Not explicitly stated -- inferred from brief context |

At specificity 6, the enhancement layer needs minimal injection. The primary additions are:

1. **Quality emphasis inference:** Given the audience (skeptical art patrons) and the convention-breaking intensity, we infer high bars for Distinctiveness and Prompt-artifact alignment. These viewers will detect generic AI output instantly. The quality targets become: Prompt-artifact alignment >= 9, Distinctiveness >= 9, Aesthetic >= 8.

2. **Dial injection from deconstructivism profile:**
   - `design_variance`: 8 (high -- asymmetry, instability, unexpected juxtaposition)
   - `motion_intensity`: 7 (aggressive camera work with deliberate pauses)
   - `visual_density`: 6 (enough visual information to feel layered, not so much it overwhelms in 15 seconds)

3. **Industry cross-reference:** Performing arts via AUDIENCE-ROUTES.md. Primary styles for performing arts include cinematic and editorial-minimalism. The user has explicitly chosen deconstructivism instead -- this is a convention break. The enhancement layer flags this as intentional and does not steer toward safer options.

### Step 0c: UX Research (Opera Marketing Conventions, Trailer Pacing)

Before generating anything, the pipeline examines what the trailer is breaking away from. Opera marketing conventions that this trailer must avoid:

- **The velvet curtain shot:** Camera slowly revealing a proscenium stage with warm amber lighting. This is the default "opera is prestigious" image. Our trailer will have no curtains, no stage.
- **The soprano portrait:** Close-up of a performer in full costume, mouth open mid-aria. Our trailer will show no human faces -- the destruction is the performer.
- **The gold-and-black palette:** Opera marketing defaults to black backgrounds with gold serif type (Didot, Bodoni). Our palette will be cold: concrete grays, steel blues, and a single sharp accent.
- **The 60-second orchestral swell:** Traditional opera trailers use a slow build to a climactic high note. Our 15-second format rejects this structure entirely. The pacing is jagged, not crescendo.

Trailer pacing for art-audience 25-40:
- Attention anchor in first 1.5 seconds (the hook)
- No more than 3 distinct visual "movements" in 15 seconds
- End on discomfort, not resolution -- leave the viewer needing to see what happens next
- Social-media native: works without sound, works in a vertical crop, works as a 3-second loop for the first impression

### Step 1: Style Resolution

**Resolved style:** `deconstructivism`

| Property | Value |
|---|---|
| Tags | chaotic, angular, confrontational, asymmetric, abstract |
| Motion signature | `stutter_glitch` |
| Camera brackets | Frame skip, Channel split, Cut to |
| CSS curve | `steps(4, jump-both)` |
| Duration range | 100-300ms per movement, randomized |
| Character | Broken, lo-fi, digital artifact |

The stutter_glitch motion signature is critical. Unlike slow_cinematic (which most people would default to for a "dramatic" trailer), stutter_glitch communicates through *interruption*. Every frame skip is a fracture. Every channel split is a layer peeling apart. Every hard cut is a structure collapsing and reforming. This maps directly to the opera's themes: Butterfly's world does not dissolve gradually -- it shatters.

**Design variance** at 8 means the camera will not follow predictable patterns. Movements interrupt each other. A slow push-in will be *cut short* by a frame skip. A static hold will be *violated* by a channel split. The audience should feel slightly destabilized -- the visual equivalent of hearing a familiar aria in an unfamiliar key.

**Premium component patterns applicable to video:**
- `grain-overlay`: Fixed noise texture that breaks digital flatness -- opacity 0.04-0.06 for the deconstructivist rawness
- `text-mask-reveal`: Typography as window -- if a title card appears, the text is a clipping mask to fractured imagery behind it

### Step 2: Hero Asset Conception

**Archetype selected:** Panning Scene (video/animated sequence)

The Panning Scene archetype is the correct vehicle for a 15-second trailer. But the deconstructivism style fundamentally *subverts* what a panning scene normally does. Where a cinematic panning scene uses smooth continuous motion to create immersion, a deconstructivist panning scene uses fractured discontinuous motion to create confrontation.

**Camera choreography conception (3 movements in 15 seconds):**

| Segment | Time | Camera | Narrative Purpose |
|---|---|---|---|
| 1. The Fracture | 0-5s | `[Push in]` slow through shattered mirror fragments, interrupted by `[Frame skip]` every 0.8s | Establish the destruction. The audience enters through broken reflections of what might be a stage, might be a face, might be architecture. The push-in creates expectation of resolution; the frame skips deny it. |
| 2. The Fall | 5-10s | `[Channel split]` RGB displacement on silk fabric falling in slow motion, then `[Cut to]` hard angle switch | Beauty in destruction. The silk is the only soft element -- Butterfly's world. The channel split tears it into three color planes that drift apart. The hard cut terminates the beauty before the audience can settle into it. |
| 3. The Hold | 10-15s | `[Static shot]` with `[Jitter hold]` micro-displacement on a single butterfly wing, fractured | The still moment. After 10 seconds of aggressive motion, the camera stops. But it does not stop cleanly -- the jitter hold means the frame trembles, never fully at rest. The butterfly wing is the only recognizable subject. It is broken. The title appears. |

This choreography uses every primary camera bracket from the deconstructivism mapping: Frame skip, Channel split, and Cut to. The `[Push in]` and `[Static shot]` are borrowed from other signatures but are *corrupted* by the deconstructivist treatment -- the push-in stutters, the static shot jitters.

**Model selection:** Kling 2.1 Master (`fal-ai/kling-video/v2.1/master`) for the primary generation. Kling 2.1 Master excels at dynamic transitions and has strong motion fluidity, which we need as a *baseline* before applying the deconstructivist restyle. We generate clean footage first, then fracture it -- do not ask the generation model to produce glitchy output directly, because the glitch must be controlled and intentional, not the model's failure mode.

**Restyle model:** Luma Modify Video (`fal-ai/luma/modify-video`) for the deconstructivist treatment layer. Luma Modify Video preserves motion paths while transforming visual style, which is exactly what we need: the camera choreography stays intact while the surface becomes fractured.

### Step 3: Prompt Crafting + Generation

#### Step 3a: Camera Choreography Prompt (via `prompt-crafter-video-camera`)

The camera choreography prompt is crafted first and appended to the video generation prompt. Following the bracket notation rules: maximum 3 bracket movements per prompt, chronological ordering, speed/energy qualifier on each.

**Crafted camera prompt:**

```
[Push in] Slow dolly forward through angular shattered mirror shards catching
fragmented reflections, interrupted rhythm, 5 seconds. [Cut to] Abrupt hard
angle switch to silk fabric descending through darkness, RGB color planes
separating. [Static shot] Trembling hold on fractured butterfly wing against
raw concrete, 5 seconds, barely perceptible micro-displacement throughout.
```

Note the deliberate tension in this choreography: the `[Push in]` promises the audience a destination, then the `[Cut to]` rips them away before arrival. The `[Static shot]` at the end is not rest -- the jitter hold means the camera is fighting to stay still, as if the instability has infected even stillness. Every bracket is a dramatic choice, not a technical instruction.

#### Step 3b: Video Generation Prompt (via `prompt-crafter-video-gen`)

The video-gen prompt follows the required structure: opening frame, motion description, camera movement, style and atmosphere, negative prompt, duration hint.

**Crafted video prompt:**

```
Opening frame: angular shards of broken mirror suspended in dark void, each
shard reflecting fragments of a theatrical stage -- glimpses of red curtain
fabric, wooden floorboards, a spotlight beam, none complete. Deconstructivism
aesthetic. Shards drift imperceptibly, catching light on razor edges. Cold
steel-blue atmosphere #2C3E50 with concrete gray #7F8C8D surfaces, single
accent of deep crimson #8B0000 visible only in reflections. [Push in] Slow
approach through the shard field, movement rhythm interrupted every 0.8
seconds. Raw grain texture, high contrast, no soft gradients. 15 seconds,
jagged pacing -- three distinct movements separated by hard cuts. No jittery
motion beyond intentional stutter, no morphing artifacts, no smooth
transitions, no text overlays, no watermarks, no warm lighting.
```

Key decisions in this prompt:
- The **opening frame** is dense with physical description because video models anchor on frame 1. The shattered mirror is the compositional anchor -- it creates reflections without showing the reflected thing directly, which is inherently deconstructivist.
- The **palette** is deliberately anti-opera: steel-blue #2C3E50, concrete gray #7F8C8D, and deep crimson #8B0000 (not the warm gold/amber that opera defaults to). The crimson appears only in reflections -- the passion of the opera is only accessible through fractured intermediaries.
- The **negative prompt** includes "no smooth transitions" because the generation model's default tendency toward fluid motion would destroy the stutter_glitch character.

#### Step 3c: Generation via fal.ai

The video is generated via Kling 2.1 Master at 1080p, 16:9 aspect ratio (letterboxed to 2.35:1 in post for cinematic framing).

```typescript
const result = await fal.subscribe("fal-ai/kling-video/v2.1/master", {
  input: {
    prompt: craftedVideoPrompt,
    duration: "15",
    aspect_ratio: "16:9",
  },
});
```

#### Step 3d: Alignment Verification (post-generation)

After generation, `validate-prompt-artifact-alignment.ts` runs with the video-gen criteria:

| Criterion | Weight | Target | Rationale |
|---|---|---|---|
| opening_frame | 0.20 | >= 8 | Mirror shards and theatrical fragments must be clearly present |
| motion_quality | 0.20 | >= 7 | Motion must be smooth *before* restyle adds intentional stutter |
| camera_execution | 0.20 | >= 8 | Three-movement choreography must execute in correct sequence |
| style_consistency | 0.20 | >= 7 | Deconstructivist aesthetic must hold across all 450 frames (15s at 30fps) |
| temporal_coherence | 0.20 | >= 7 | No unintended morphing -- only intentional stutter added in restyle |

**If alignment < 5.0:** AUTO-REGENERATE with a different seed. If second attempt fails, escalate to Kling 3 Pro (`fal-ai/kling-video/v3/pro`) which has superior camera control. If third attempt fails, re-craft the prompt with specific feedback on which criterion failed.

**If alignment 5.0-6.9:** FLAG for review. Common issues at this threshold: camera executes two movements instead of three, or the opening frame is too abstract (no recognizable mirror shards). Re-craft with increased specificity on the problematic criterion.

**If alignment >= 7.0:** PASS. Proceed to restyle.

### Step 4: One-Shot Generation (Video Artifact Description)

The generated 15-second video artifact:

**Seconds 0-5 (The Fracture):** The camera pushes forward through a field of angular mirror shards suspended in near-darkness. Each shard reflects fragmentary glimpses -- a slash of red fabric, the grain of wooden floorboards, the cone of a spotlight -- none forming a complete image. The push-in has a slight stutter rhythm, pausing fractionally every 0.8 seconds as if the footage is being pulled through a damaged projector. The lighting is cold steel-blue, with hard shadows cast by the shard edges.

**Seconds 5-10 (The Fall):** A hard cut breaks the push-in mid-approach. The camera switches abruptly to a downward angle on crimson silk fabric falling through a dark void. The fabric descends in slow motion, its folds catching the steel-blue light. A channel split effect displaces the RGB planes: the red channel drifts left, the blue drifts right, and the green holds center. The silk appears to exist in three separate realities simultaneously. Another hard cut at second 10.

**Seconds 10-15 (The Hold):** A single butterfly wing fills the frame, resting on raw concrete. The wing is fractured -- one vein-line cracked, one section folded at an unnatural angle. The camera is nominally static but exhibits micro-displacement: 1-3 pixels of jitter at irregular intervals, as if the lens is trembling. The deep crimson #8B0000 of the wing is the only warm color in the entire trailer. At second 13, a title appears via text-mask-reveal: the words "FRACTURE OPERA" are cut out of the frame, showing the falling-silk footage from seconds 5-10 playing inside the letterforms, while the butterfly-wing scene continues outside them. No other text. No dates. No "tickets available now."

### Step 5: Quality Evaluation

This is a video-only workflow. The `codeStandardsGate` sub-score is set to `null` and its 0.08 weight redistributes across the remaining 8 sub-scores per the image-only weight redistribution formula.

**Projected score card:**

```
+============================================+
|         QUALITY SCORE CARD                 |
+============================================+
| Anti-Slop Gate     +++++++++- 9.0/10 (16%) |
| Code Standards     N/A               ( 0%) |
| Asset Quality      ++++++++-  8.0/10 (13%) |
| Prompt Alignment   +++++++++- 9.0/10 (16%) |
| Aesthetic          ++++++++-  8.5/10 (14%) |
| Style Fidelity     +++++++++- 9.0/10 (14%) |
| Distinctiveness    +++++++++- 9.0/10 (14%) |
| Hierarchy          ++++++++-  8.0/10 ( 7%) |
| Color Harmony      ++++++++-  8.0/10 ( 5%) |
+============================================+
| COMPOSITE: 8.63/10  PASS                   |
| Minimum:   7.0/10                          |
+============================================+
```

**Sub-score rationale:**

- **Anti-Slop Gate (9.0):** No default fonts, no purple-blue gradient, no stock-photo feel. The palette is bespoke (steel-blue, concrete gray, deep crimson). The motion language is deconstructivism-specific, not generic "cinematic." The absence of warm amber lighting is an active choice against opera conventions.
- **Code Standards (N/A):** Video-only workflow, no code generated. Weight redistributed.
- **Asset Quality (8.0):** 1080p generation, correct 16:9 aspect with 2.35:1 letterbox. File size under 2MB for a 15-second clip. Encoding via H.264 for compatibility.
- **Prompt Alignment (9.0):** Three-movement camera choreography executed in correct sequence. Mirror shards, falling silk, and butterfly wing all present. Channel split effect visible in segment 2. Palette matches specified hex values.
- **Aesthetic (8.5):** The trailer has a coherent visual argument. The cold palette with single warm accent creates tension. The rhythm of aggressive-motion-then-stillness produces a visceral viewing experience.
- **Style Fidelity (9.0):** Unmistakably deconstructivism. The stutter_glitch motion signature is present in every segment. Channel split, frame skip, and jitter hold are all taxonomy-specified camera brackets. The anti_slop_overrides are respected.
- **Distinctiveness (9.0):** This trailer would not be confused with any other opera company's marketing. It would not be confused with AI-generated stock footage. The concept (shattered mirror as deconstructed stage) unifies every visual choice.
- **Hierarchy (8.0):** Three-tier visual hierarchy: primary (mirror shards as environment), secondary (silk and butterfly wing as emotional anchors), supporting (title card as terminal element). The text-mask-reveal technique creates a hierarchy between typography and footage.
- **Color Harmony (8.0):** Restricted palette with intentional temperature contrast. Steel-blue and concrete gray form the dominant 60%. Deep crimson is the 10% accent, appearing only in reflections and the butterfly wing. No competing accent colors.

**Composite: 8.63. PASS.**

### Steps 6-10: Refinement

#### Step 6: Video Restyle (Layered Effect)

The base video from Kling 2.1 Master produces clean, cinematic footage. The deconstructivist layer -- the frame skips, channel splits, and grain -- is applied via restyle rather than baked into the initial generation. This separation gives control over the fracture intensity.

**Restyle prompt (via `prompt-crafter-video-restyle`):**

```
Restyle this video to deconstructivism aesthetic. Apply angular, fractured
visual treatment: intermittent frame-skip stutters, subtle RGB channel
displacement on high-contrast edges, visible film grain at 0.05 opacity.
Shift palette to cold steel-blue #2C3E50 dominant with concrete gray #7F8C8D
midtones and deep crimson #8B0000 accents only. Add raw concrete texture
overlay at low opacity. Increase contrast to harsh. Preserve all motion,
timing, camera movement, and subject positions exactly. Suppress: smoothness,
warm tones, soft lighting, gradient transitions, polished surfaces.
```

**Restyle model:** Luma Modify Video (`fal-ai/luma/modify-video`)

After restyle, re-run `validate-prompt-artifact-alignment.ts` with the video-restyle criteria. The key check: `motion_preservation` must score >= 7.0. If the restyle has altered the camera choreography timing, regenerate with reduced restyle intensity.

#### Step 7: Audio Consideration

The brief does not specify audio, but a 15-second trailer benefits from it. Two options:

**Option A: Silence.** The trailer plays without sound. In social media autoplay (muted by default), this is the pragmatic choice. The visual language is strong enough to work silently.

**Option B: Composed audio (via `prompt-crafter-audio-music`):**

```
Atonal contemporary classical, 15 seconds. Solo cello playing extended
technique -- col legno and sul ponticello -- creating a scratchy, uncomfortable
texture. No melody. Sparse piano strikes at irregular intervals, each with
long reverb decay. Tempo rubato, no fixed BPM. Build tension without
resolution. End on silence, not a final note. Cold, austere, confrontational.
No orchestral swell, no crescendo, no warm strings.
```

The audio must match the visual's refusal to resolve. A conventional soundtrack would undermine the deconstructivist commitment.

#### Steps 8-10: Final Polish

- **Grain overlay:** Fixed noise texture at 0.05 opacity, mix-blend-mode overlay, applied across all 15 seconds. This is the `grain-overlay` premium component pattern -- it breaks the digital smoothness that marks video as synthetic.
- **Letterbox bars:** 2.35:1 aspect ratio crop applied as matte bars. This cinematic framing is a deliberate contrast with the fractured content -- the container is traditional cinema, the content is anti-traditional. Deconstructivism thrives on this kind of structural irony.
- **Title card (seconds 13-15):** "FRACTURE OPERA" in a confrontational typeface -- not a serif (too traditional), not a geometric sans (too corporate). A grotesque or display face with visible irregularity. Applied via text-mask-reveal: the letterforms clip through to the falling-silk footage from segment 2, creating a window into an earlier moment of the trailer. No tagline. No URL. No call-to-action. The absence is the statement.

### Step 11: Export

**Deliverable formats:**
- **Primary:** MP4 H.264 at 1080p, 16:9 with 2.35:1 letterbox, < 2MB
- **Social variant:** MP4 cropped to 9:16 vertical (focusing on the butterfly wing segment for a 3-second loop), < 500KB
- **Thumbnail:** First frame exported as WebP at 1920x1080, < 200KB

---

## Troubleshooting

### 1. Camera choreography not executing as three distinct movements

**Symptom:** The generated video produces a continuous smooth push-in for all 15 seconds instead of three segmented movements with hard cuts.

**Cause:** Some video generation models interpret bracket notation as suggestions rather than commands. Kling 2.1 Master generally respects camera brackets, but the `[Cut to]` hard angle switch can be smoothed out by the model's temporal coherence optimizer.

**Fix:** Split the generation into three separate 5-second clips, each with its own prompt and single camera movement. Concatenate in post-production. This guarantees the hard cuts. Alternatively, escalate to Kling 3 Pro which has more precise camera control parameters.

### 2. Channel split (RGB displacement) not visible in restyle

**Symptom:** The restyle pass applies color grading and grain but does not produce the RGB channel displacement described in the prompt.

**Cause:** Luma Modify Video's restyle capability focuses on color/texture transformation, not spatial displacement effects. Channel split is a compositing effect, not a style property.

**Fix:** Apply RGB channel displacement as a post-processing step rather than expecting the restyle model to generate it. Use an E2B sandbox to run a simple FFmpeg filter: `ffmpeg -i input.mp4 -vf "rgbashift=rh=-3:bh=3" output.mp4`. This shifts the red channel 3 pixels left and the blue channel 3 pixels right, producing the deconstructivist channel split effect.

### 3. Frame skip stutter creates unwatchable jitter instead of intentional rhythm

**Symptom:** The stutter effect is too frequent or too random, making the video look like a corrupt file rather than an artistic choice.

**Cause:** The stutter_glitch motion signature specifies 100-300ms randomized duration, but without a rhythmic anchor, the random intervals create visual noise instead of visual rhythm.

**Fix:** Structure the frame skips as a *pattern* rather than pure randomness. For the 0-5 second segment, skip every 0.8 seconds (24 frames at 30fps). For the 5-10 second segment, skip on the hard cut only. For the 10-15 second segment, use jitter hold (1-3 pixel displacement) without frame skips. This creates a decrescendo of disruption: aggressive fracture, single break, trembling stillness.

### 4. Butterfly wing looks artificially generated rather than photographically real

**Symptom:** The butterfly wing in segment 3 has the smooth, over-detailed quality of AI-generated imagery -- visible in the unnaturally symmetrical vein structure and the too-perfect color gradient.

**Cause:** Video generation models tend toward idealized detail on small organic subjects. A "perfect" butterfly wing undermines the deconstructivist commitment to imperfection and fracture.

**Fix:** Two options: (a) Generate the butterfly wing as a separate image via `prompt-crafter-image-gen` with explicit imperfection cues ("damaged butterfly wing, one section torn, vein structure irregular, resting on rough concrete, macro photography, shallow depth of field, no symmetry"), then use image-to-video on that single frame for the static hold segment. (b) Apply a post-processing degradation pass: slight desaturation, increased grain, and a subtle Gaussian blur on the wing's edges to kill the AI sharpness.

### 5. Title card text-mask-reveal fails to render legibly

**Symptom:** The "FRACTURE OPERA" text is illegible because the falling-silk footage visible inside the letterforms is too dark or too busy to create sufficient contrast with the butterfly-wing scene outside them.

**Fix:** Add a semi-transparent dark overlay (rgba(0,0,0,0.4)) behind the letterforms before applying the clipping mask. This dims the silk footage enough to create a value contrast with the surrounding scene. Alternatively, invert the mask: show the butterfly-wing scene inside the letterforms and replace the surrounding area with solid black #0A0A0A. The text becomes a window to the organic, surrounded by void.

---

## Anti-Slop Verification

Every output from this pipeline is checked against the anti-slop gates. For this deconstructed opera trailer, the following checks are critical:

### 1. No Default Color Palette

**Check:** Does the trailer use the bespoke palette (steel-blue #2C3E50, concrete gray #7F8C8D, deep crimson #8B0000) throughout, with zero drift toward purple-blue gradient, Tailwind blue-500, or warm amber tones?

**Why it matters:** Opera marketing defaults to warm gold and black. Any drift toward warm tones signals that the pipeline has fallen back to convention rather than executing the deconstructivist brief. The deep crimson is specifically chosen as an *uncomfortable* red -- darker and more visceral than the friendly reds of traditional opera posters.

**Verification method:** Extract the dominant colors from frame samples at 0s, 5s, 10s, and 14s. Confirm that no extracted color has a hue angle between 30-60 degrees (the warm amber range). Confirm that the crimson accent #8B0000 appears in no more than 10% of total pixel area.

### 2. No Smooth Cinematic Motion

**Check:** Does the video contain visible stutter_glitch artifacts (frame skips, channel splits, jitter) in at least 2 of the 3 segments? Is the motion signature unmistakably stutter_glitch rather than slow_cinematic?

**Why it matters:** The most natural AI-generation tendency for a "dramatic trailer" is slow, smooth, cinematic motion. This is the correct choice for 20 of the 66 taxonomy styles -- but it is the wrong choice for deconstructivism. Stutter_glitch is defined by interruption, not flow. If the trailer plays smoothly, the deconstructivist concept has failed.

**Verification method:** Analyze inter-frame difference across 10 consecutive frame pairs at seconds 2-3. Stutter_glitch should show at least 2 frame pairs with significantly higher difference (> 3x the median), indicating frame skip or hard cut events. Smooth cinematic motion shows uniform low inter-frame difference.

### 3. No AI-Generic Symmetry

**Check:** Is the composition consistently asymmetric? Are the mirror shards arranged irregularly? Is the butterfly wing off-center in the frame?

**Why it matters:** AI generation models default to bilateral symmetry, especially for "artistic" or "dramatic" prompts. Deconstructivism is tagged `asymmetric` -- symmetry is an anti-pattern. Even the mirror shards (which could tempt the model toward kaleidoscopic symmetry) must be asymmetrically distributed.

**Verification method:** Divide frame samples into left/right halves. Compare SSIM (structural similarity) between halves. SSIM below 0.5 indicates strong asymmetry. SSIM above 0.7 indicates problematic symmetry that needs re-generation.

### 4. No Stock-Footage Feel

**Check:** Does the trailer feel like it was conceived for this specific opera production, or could it be a generic "art and destruction" stock video?

**Why it matters:** The Distinctiveness sub-score target is 9. A trailer that could be repurposed for any "edgy" brand is not distinctive -- it is stock footage with a custom color grade. The mirror-shards-reflecting-a-stage concept must be legible: this is about *theatre*, specifically about a *deconstructed staging of Butterfly*.

**Verification method:** Can a viewer identify the subject as opera/theatre from the imagery alone? The reflections in the mirror shards must include recognizable theatrical elements (red curtain fabric, spotlight beams, wooden stage floor). The butterfly wing must be legible as a *Madama Butterfly* reference, not a generic nature macro.

### 5. No Conventional Title Treatment

**Check:** Does the "FRACTURE OPERA" title avoid every typography anti-slop pattern? No Inter. No Roboto. No centered-on-gradient. No serif-on-black (the opera cliche). The typeface must be confrontational and the mask-reveal technique must function correctly.

**Why it matters:** The title card is the last thing the viewer sees. If it defaults to conventional typography, it retroactively flattens the entire trailer's deconstructivist commitment. The typeface choice must be as intentional as the camera choreography: a grotesque or display face with visible irregularity, applied via text-mask-reveal to maintain the fractured visual language through the final frame.

**Verification method:** Extract the title card frame (second 14). Confirm the typeface is not in the banned list (Inter, Roboto, Open Sans, Arial). Confirm the text-mask-reveal is active: the letterforms should contain visually different content from the surrounding frame. Confirm the text is not centered with a subtitle beneath it (the generic hero pattern).

---

## Key Principles Demonstrated

1. **Every camera movement is a dramatic choice.** The `[Push in]` promises resolution. The `[Cut to]` denies it. The `[Static shot]` with jitter refuses rest. Camera choreography is not technical decoration -- it is narrative argument.

2. **Deconstructivism maps to opera themes.** Butterfly's story is about structures that collapse. The fractured mirrors, the channel-split silk, the broken wing -- these are not arbitrary visual effects. They are the opera's themes expressed in the visual language of a specific taxonomy style.

3. **Tension between beauty and discomfort is the design.** The deep crimson appearing only in reflections. The silk fabric torn into RGB planes. The butterfly wing that is beautiful *and* broken. Deconstructivism does not reject beauty -- it fractures beauty to reveal the structure underneath.

4. **Bracket notation is choreography notation.** `[Frame skip]`, `[Channel split]`, `[Cut to]` -- these brackets are not API parameters. They are the visual equivalent of a musical score's dynamics markings. Each bracket tells the camera (and the viewer) how to *feel* the next moment.

5. **Generate clean, then fracture with control.** The pipeline generates clean footage first (Kling 2.1 Master) and applies the deconstructivist treatment second (Luma Modify Video + post-processing). This separation means the fracture is intentional and adjustable, not the model's accidental artifact. The distinction between controlled glitch and failed generation is the difference between art and error.
