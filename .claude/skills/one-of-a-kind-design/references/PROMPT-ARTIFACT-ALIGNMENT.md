# PROMPT-ARTIFACT-ALIGNMENT.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Per-job alignment criteria for all 15 job types. Each criterion evaluates whether the generated artifact faithfully reflects the prompt and taxonomy style requirements. Used by the quality-assessor agent to score prompt-artifact alignment (weight 0.15 in composite score).

---

## Scoring Scale

All criteria use a 1-10 scale:
- **1-3:** Misaligned -- the artifact contradicts or ignores the criterion
- **4-6:** Partially aligned -- some aspects match, others drift
- **7-8:** Aligned -- the artifact meets the criterion with minor deviations
- **9-10:** Perfectly aligned -- the artifact is an exemplary match

**Passing threshold:** Weighted average >= 7.0 per job type.

**Auto-regeneration trigger:** Any single criterion scoring <= 3, OR weighted average < 5.0.

---

## 1. image-gen

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| style_fidelity | 0.25 | Does the image unmistakably belong to the specified taxonomy style? | 1: wrong style entirely. 5: recognizable but generic. 10: instantly identifiable, could appear in a style textbook. |
| palette_accuracy | 0.20 | Do the dominant colors match the specified hex palette within perceptual tolerance? | 1: completely different colors. 5: right family, wrong specific values. 10: exact palette match, colors dominate as specified. |
| subject_clarity | 0.15 | Is the requested subject clearly present and correctly rendered? | 1: subject absent or unrecognizable. 5: present but poorly rendered. 10: subject is sharp, correct, and prominent. |
| composition_match | 0.15 | Does the spatial arrangement match the requested composition? | 1: random layout. 5: partially matches intent. 10: framing, balance, and focal point exactly as specified. |
| anti_slop | 0.15 | Is the image free of generic AI artifacts? | 1: watermarks, blurry edges, generic stock feel. 5: some minor artifacts. 10: zero detectable AI cliches. |
| texture_grain | 0.10 | Does the surface texture match the taxonomy style's texture_grain? | 1: wrong texture entirely. 5: neutral/absent texture. 10: texture perfectly matches style specification. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- style_fidelity <= 3 (wrong style is unrecoverable)
- palette_accuracy <= 3 (wrong colors cannot be fixed by editing)
- Weighted average < 5.0

**Aligned example:** Bauhaus-style hero image with exact #FF0000/#0000FF/#FFFF00 palette, geometric primitives, flat fills, mathematical composition, zero ornament.

**Misaligned example:** Bauhaus-style request that produces a photorealistic gradient-heavy image with organic curves and muted earthy colors.

---

## 2. image-edit

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| edit_accuracy | 0.30 | Does the edit match exactly what was requested? | 1: wrong area edited or wrong change. 5: approximately right. 10: surgically precise edit. |
| preservation | 0.30 | Are all non-edited regions completely unchanged? | 1: widespread unintended changes. 5: minor drift in adjacent areas. 10: pixel-perfect preservation outside edit zone. |
| lighting_consistency | 0.15 | Does the edited region match the existing lighting? | 1: obvious lighting mismatch. 5: acceptable but noticeable. 10: seamless integration. |
| style_consistency | 0.15 | Does the edited region maintain the taxonomy style? | 1: edit introduces a different style. 5: partially consistent. 10: edit is indistinguishable from original style. |
| edge_quality | 0.10 | Are the boundaries between edited and unedited regions seamless? | 1: visible hard edges or halos. 5: soft but detectable boundary. 10: completely invisible transition. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- preservation <= 3 (unintended changes are destructive)
- edit_accuracy <= 3 (wrong edit is worse than no edit)
- Weighted average < 5.0

**Aligned example:** Background replacement where the product remains pixel-perfect, new background lighting matches product lighting direction.

**Misaligned example:** Background replacement where product edges have halos, product color has shifted, and background lighting comes from opposite direction.

---

## 3. style-transfer

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| identity_preservation | 0.25 | Are recognizable subjects (faces, logos, products) still identifiable? | 1: subjects unrecognizable. 5: recognizable but distorted. 10: identity fully preserved. |
| style_application | 0.25 | Has the target taxonomy style been convincingly applied? | 1: no visible style change. 5: partial style application. 10: complete convincing transformation. |
| composition_preservation | 0.20 | Is the spatial layout and framing unchanged? | 1: completely recomposed. 5: mostly preserved with shifts. 10: identical composition. |
| palette_transformation | 0.15 | Has the color palette shifted to the target style's hex values? | 1: original palette unchanged. 5: partially shifted. 10: exact target palette applied. |
| artifact_freedom | 0.15 | Is the transfer free of blending artifacts, ghosting, or seams? | 1: heavy artifacts. 5: minor visible artifacts. 10: artifact-free. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- identity_preservation <= 3 (identity loss is unacceptable)
- style_application <= 3 (failed transfer provides no value)
- Weighted average < 5.0

**Aligned example:** Corporate headshot transferred to wabi-sabi: face clearly recognizable, earth-tone palette applied, organic grain texture added, composition identical.

**Misaligned example:** Corporate headshot transferred to wabi-sabi: face distorted, original blue corporate colors remain, composition shifted to landscape.

---

## 4. video-gen

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| opening_frame | 0.20 | Does the first frame match the described opening? | 1: completely different scene. 5: approximately right. 10: exact match to opening frame description. |
| motion_quality | 0.20 | Is the motion smooth, physically plausible, and artifact-free? | 1: jittery, morphing, broken. 5: mostly smooth with minor issues. 10: cinema-quality motion. |
| camera_execution | 0.20 | Does the camera follow the specified movement? | 1: wrong camera movement. 5: right direction, wrong speed/timing. 10: exact camera choreography. |
| style_consistency | 0.20 | Does the style remain consistent across all frames? | 1: style changes mid-video. 5: mostly consistent with drift. 10: rock-solid style throughout. |
| temporal_coherence | 0.20 | Are there any flickering, morphing, or temporal artifacts? | 1: constant flickering/morphing. 5: occasional minor artifacts. 10: perfectly coherent temporal flow. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- motion_quality <= 3 (unwatchable motion)
- temporal_coherence <= 3 (severe flickering)
- Weighted average < 5.0

**Aligned example:** 6-second cinematic video with smooth Push-in camera, consistent art-deco style throughout, no morphing artifacts.

**Misaligned example:** Video where the style shifts from art-deco to photorealistic at frame 60, camera drifts sideways instead of pushing in.

---

## 5. video-camera

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| movement_accuracy | 0.35 | Does the camera execute the specified bracket movements? | 1: wrong movement entirely. 5: right direction, wrong execution. 10: precise bracket movement match. |
| speed_match | 0.25 | Does the camera speed match the specified energy? | 1: wildly wrong speed. 5: approximately right. 10: exact speed/energy match. |
| sequencing | 0.20 | Are multiple movements executed in the correct order? | 1: movements reversed or simultaneous. 5: mostly correct sequence. 10: perfect chronological execution. |
| stability | 0.20 | Is the camera stable (no unintended shake or drift)? | 1: unwanted shake throughout. 5: minor instability. 10: perfectly controlled. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- movement_accuracy <= 3 (wrong camera movement is fundamental failure)
- Weighted average < 5.0

**Aligned example:** [Pedestal up] followed by [Static shot] executes as slow vertical rise then holds perfectly still.

**Misaligned example:** [Pedestal up] executes as a horizontal pan.

---

## 6. video-restyle

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| motion_preservation | 0.30 | Are all subject motions, timings, and camera paths preserved exactly? | 1: motion significantly altered. 5: mostly preserved with drift. 10: frame-accurate motion preservation. |
| style_application | 0.25 | Has the target taxonomy style been convincingly applied across all frames? | 1: no visible restyle. 5: inconsistent application. 10: complete, consistent style transformation. |
| temporal_consistency | 0.20 | Is the applied style consistent across all frames (no flickering between styles)? | 1: constant style flickering. 5: occasional inconsistency. 10: rock-solid consistency. |
| palette_transformation | 0.15 | Has the color palette shifted to the target hex values? | 1: original colors remain. 5: partially transformed. 10: exact target palette applied across all frames. |
| face_preservation | 0.10 | If faces are present, are identities preserved? | 1: faces distorted or changed. 5: recognizable but altered. 10: identity perfectly preserved. N/A if no faces. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- motion_preservation <= 3 (motion loss defeats the purpose of restyling)
- Weighted average < 5.0

**Aligned example:** Product demo video restyled to brutalist-web: every hand movement and product interaction preserved, monochrome palette applied consistently, no flickering.

**Misaligned example:** Restyled video where subject's hand movements are altered, style flickers between brutalist and original corporate look.

---

## 7. 3d-gen

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| geometry_accuracy | 0.30 | Does the 3D mesh match the described subject? | 1: unrecognizable shape. 5: approximately correct. 10: accurate, clean geometry. |
| material_fidelity | 0.20 | Do materials match the taxonomy style palette and texture? | 1: default gray materials. 5: partially correct. 10: exact style materials applied. |
| mesh_cleanliness | 0.20 | Is the mesh clean (no floating vertices, no self-intersection, no holes)? | 1: broken mesh. 5: minor artifacts. 10: production-ready clean mesh. |
| background_isolation | 0.15 | Is the object isolated without baked-in background/ground geometry? | 1: background baked into mesh. 5: minor background artifacts. 10: perfectly isolated object. |
| viewing_angle | 0.15 | Was the optimal viewing angle used for mesh extraction? | 1: unusable angle. 5: suboptimal but workable. 10: optimal 3/4 view or style-appropriate angle. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- mesh_cleanliness <= 3 (broken mesh is unusable)
- background_isolation <= 3 (baked background requires full redo)
- Weighted average < 5.0

**Aligned example:** Art-nouveau vase with clean organic curves, sage green #6B705C ceramic material, no floating geometry, no ground plane.

**Misaligned example:** Vase mesh with visible ground plane baked in, default gray material, self-intersecting geometry at the base.

---

## 8. controlnet

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| structural_adherence | 0.30 | Does the generated image respect the control signal's spatial structure? | 1: structure ignored. 5: loosely followed. 10: precise structural match. |
| material_quality | 0.25 | Are the materials/surfaces/textures as specified in the prompt? | 1: wrong materials. 5: partially correct. 10: exact material specification match. |
| palette_accuracy | 0.20 | Do colors match the specified hex values? | 1: completely different. 5: right family. 10: exact match. |
| control_strength_balance | 0.15 | Is the balance between control adherence and creative freedom appropriate for the style? | 1: too rigid or too loose. 5: acceptable balance. 10: perfect balance for the style category. |
| anti_slop | 0.10 | Is the output free of generic AI artifacts despite structural constraints? | 1: heavy artifacts. 5: minor issues. 10: clean output. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- structural_adherence <= 3 (defeats purpose of ControlNet)
- Weighted average < 5.0

**Aligned example:** Canny-edge guided bauhaus composition where every geometric edge is preserved at 0.9 strength, with exact primary color fills.

**Misaligned example:** Canny-edge guided bauhaus where the model ignores the edge structure and generates organic curves.

---

## 9. upscale

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| detail_enhancement | 0.25 | Has the upscale added meaningful detail without hallucination? | 1: blurry or hallucinated detail. 5: moderate improvement. 10: crisp, faithful detail enhancement. |
| artifact_freedom | 0.25 | Is the upscaled image free of new artifacts (halos, ringing, over-sharpening)? | 1: heavy new artifacts. 5: minor visible artifacts. 10: artifact-free. |
| texture_preservation | 0.20 | Is the intended texture (grain, noise, smoothness) preserved or correctly applied? | 1: texture destroyed or wrong. 5: partially preserved. 10: exact texture match to specification. |
| face_quality | 0.15 | If faces are present, are they natural and undistorted? | 1: uncanny/distorted faces. 5: acceptable. 10: natural, enhanced faces. N/A if no faces. |
| color_fidelity | 0.15 | Are colors unchanged (no color shift from upscaling)? | 1: significant color shift. 5: minor shift. 10: color-perfect. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- artifact_freedom <= 3 (artifacts defeat the purpose)
- face_quality <= 3 (distorted faces are unacceptable)
- Weighted average < 5.0

**Aligned example:** 2x upscale of analog-film-grain hero image: crisp detail, film grain texture preserved at specified 0.55, no halos or ringing.

**Misaligned example:** Upscale that removes all film grain (treating it as noise), introduces halo ringing around high-contrast edges.

---

## 10. audio-tts

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| voice_match | 0.25 | Does the selected voice match the taxonomy style's formality and mood? | 1: completely wrong voice character. 5: acceptable but not ideal. 10: perfect voice-style match. |
| emotion_accuracy | 0.25 | Are the emotion markers correctly reflected in the audio? | 1: flat delivery, markers ignored. 5: partially expressive. 10: markers executed naturally and accurately. |
| pacing_match | 0.20 | Does the pacing match the specified speed and the style's motion_character? | 1: completely wrong pace. 5: acceptable pace. 10: perfect pacing for the style. |
| intelligibility | 0.15 | Is every word clearly understandable? | 1: unintelligible sections. 5: mostly clear. 10: crystal clear throughout. |
| naturalness | 0.15 | Does the speech sound natural (not robotic or artificially processed)? | 1: obviously synthetic. 5: acceptable quality. 10: indistinguishable from human. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- intelligibility <= 3 (unintelligible audio is useless)
- Weighted average < 5.0

**Aligned example:** Scandinavian-minimalism voiceover with calm, unhurried Aoede voice, gentle pacing, natural pauses, warm but measured tone.

**Misaligned example:** Scandinavian-minimalism voiceover delivered in a fast, excited voice with aggressive emphasis.

---

## 11. audio-music

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| genre_match | 0.25 | Does the generated music match the specified genre? | 1: wrong genre entirely. 5: related genre. 10: exact genre match. |
| mood_alignment | 0.25 | Does the emotional tone match the specified mood and taxonomy style? | 1: opposite mood. 5: neutral/ambiguous. 10: perfect mood alignment. |
| tempo_accuracy | 0.20 | Is the BPM within range of the specified tempo? | 1: wildly different tempo. 5: approximately right. 10: exact BPM match. |
| instrumentation | 0.15 | Are the specified instruments audible and prominent? | 1: wrong instruments. 5: some correct instruments. 10: all specified instruments present and balanced. |
| production_quality | 0.15 | Is the audio well-produced (no clipping, distortion, or digital artifacts)? | 1: poor quality, artifacts. 5: acceptable. 10: professional production quality. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- genre_match <= 3 (wrong genre is unrecoverable)
- Weighted average < 5.0

**Aligned example:** Cinematic orchestral track at 75 BPM with warm cellos and brass, building gradually over 15 seconds.

**Misaligned example:** Request for cinematic orchestral produces an uptempo electronic track at 140 BPM.

---

## 12. annotation

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| screenshot_preservation | 0.25 | Is the underlying screenshot completely unaltered? | 1: screenshot modified. 5: minor alterations. 10: pixel-perfect preservation. |
| finding_accuracy | 0.25 | Are annotation markers placed at the correct locations? | 1: markers in wrong positions. 5: approximately placed. 10: precisely placed at finding locations. |
| readability | 0.20 | Are margin notes legible and callout lines clear? | 1: unreadable annotations. 5: mostly readable. 10: crisp, clear annotations. |
| numbering_consistency | 0.15 | Are findings consistently numbered and visually uniform? | 1: inconsistent numbering. 5: mostly consistent. 10: perfectly uniform numbering system. |
| color_coding | 0.15 | Are colors used correctly (red=issue, green=positive, yellow=suggestion)? | 1: wrong or absent color coding. 5: partially correct. 10: consistent correct color coding. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- screenshot_preservation <= 3 (altered screenshot invalidates the annotation)
- Weighted average < 5.0

**Aligned example:** Landing page screenshot with 5 numbered findings, red circles at exact issue locations, clear callout lines to margin notes, underlying design untouched.

**Misaligned example:** Annotation pass where GPT Image 1 "fixes" the design instead of annotating it, or markers placed at wrong locations.

---

## 13. avatar

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| lipsync_accuracy | 0.25 | Do lip movements match the audio precisely? | 1: no sync. 5: approximate sync. 10: frame-accurate lipsync. |
| emotion_expression | 0.20 | Do facial expressions match the emotion mapping? | 1: flat/wrong expressions. 5: partially expressive. 10: natural, mapped emotions visible. |
| movement_style | 0.20 | Does head/body movement match the taxonomy style's energy level? | 1: completely wrong energy. 5: acceptable. 10: perfect movement-style match. |
| visual_quality | 0.20 | Is the avatar video free of uncanny valley effects and artifacts? | 1: deeply uncanny. 5: minor oddities. 10: natural, convincing. |
| background_match | 0.15 | Does the background match the taxonomy style? | 1: wrong background. 5: neutral/generic. 10: perfectly style-matched. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- lipsync_accuracy <= 3 (lip desync is immediately noticeable)
- visual_quality <= 3 (uncanny valley is unacceptable)
- Weighted average < 5.0

**Aligned example:** Editorial-minimalism avatar with minimal head movement, measured delivery, clean off-white background, natural expressions transitioning between confident and warm.

**Misaligned example:** Editorial-minimalism avatar with hyperactive gesturing, neon background, and flat expressionless face despite emotion markers.

---

## 14. svg-gen

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| vector_quality | 0.25 | Are paths clean with minimal anchor points? | 1: messy, excessive points. 5: acceptable complexity. 10: optimally clean paths. |
| palette_accuracy | 0.20 | Do colors match the specified hex values? | 1: wrong colors. 5: approximately right. 10: exact hex match. |
| style_fidelity | 0.20 | Does the SVG match the per_style_svg_guidance from the taxonomy? | 1: wrong style. 5: generic vector. 10: unmistakably the specified style. |
| composition_match | 0.15 | Does the layout match the requested composition? | 1: wrong layout. 5: approximately right. 10: exact composition match. |
| gradient_compliance | 0.10 | If "no gradients" was specified, are there zero gradients? | 1: gradients present when prohibited. 10: compliant. N/A if gradients allowed. |
| scalability | 0.10 | Does the SVG render correctly from 16px to 4K? | 1: breaks at extreme sizes. 5: mostly scalable. 10: perfect at all sizes. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- gradient_compliance <= 3 (violates explicit constraint)
- vector_quality <= 3 (unusable paths)
- Weighted average < 5.0

**Aligned example:** Bauhaus section divider with clean geometric primitives, exact #FF0000/#0000FF/#FFFF00 fills, zero gradients, minimal anchor points.

**Misaligned example:** Bauhaus section divider with gradient fills, organic curves, complex paths with hundreds of unnecessary anchors.

---

## 15. svg-vectorize

| Criterion | Weight | Question | Scoring Rubric |
|-----------|--------|----------|----------------|
| source_fidelity | 0.30 | Does the SVG faithfully represent the source raster image? | 1: unrecognizable. 5: approximate. 10: faithful reproduction in vector form. |
| path_efficiency | 0.25 | Is the path count reasonable for the content complexity? | 1: bloated with unnecessary paths. 5: acceptable. 10: optimally efficient paths. |
| svgo_optimization | 0.20 | Has SVGO post-processing been correctly applied? | 1: no optimization. 5: partial optimization. 10: all specified SVGO plugins applied. |
| crop_accuracy | 0.15 | If autoCrop was enabled, is the subject correctly isolated? | 1: subject cropped incorrectly. 5: approximate crop. 10: precise subject isolation. N/A if autoCrop false. |
| color_mapping | 0.10 | Are colors accurately mapped from source to vector? | 1: significant color drift. 5: approximately right. 10: color-accurate vectorization. |

**Passing threshold:** >= 7.0 weighted average

**Auto-regeneration triggers:**
- source_fidelity <= 3 (unrecognizable vectorization)
- Weighted average < 5.0

**Aligned example:** Bauhaus composition vectorized at temperature 0.3 with clean geometric paths, autoCrop correctly isolating the composition, shapes preserved as SVG primitives.

**Misaligned example:** Vectorization that converts simple geometric shapes into complex multi-point paths, losing the mathematical precision of the original.
