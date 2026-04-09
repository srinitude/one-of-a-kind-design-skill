# Somatic Therapist Practice App

> Pipeline walkthrough: scandinavian-minimalism + wabi-sabi | mobile-app | healthcare

---

## Scenario

User says:

> "I'm a somatic therapist leaving a group practice. Need app screens for booking and intake. My clients are trauma survivors -- the interface needs to feel safe. Not clinical, not too playful. Warm but boundaried."

This request is deceptively simple. On the surface it is three mobile screens. Underneath, it is a design problem where the interface itself must function as a therapeutic container. Trauma survivors evaluate safety within three seconds of seeing a new environment. The colors, the shapes, the spacing, the weight of the typography -- all of it communicates before a single word is read. A healthcare app that looks like every other healthcare app (white, blue, sterile) says "institution." An app that looks too casual says "unprofessional." The space between those two failures is narrow, and that is exactly where this design must live.

---

## Creative Brief

| Field | Value |
|-------|-------|
| **Client** | Dr. Maren Voss, somatic therapist in private practice |
| **Output type** | mobile-app (three screens: booking calendar, intake form, session confirmation) |
| **Industry** | Healthcare / Wellness |
| **Audience** | Trauma survivors seeking somatic therapy, ages 25-55, therapy-experienced |
| **Mood** | Safe, warm, boundaried, grounded |
| **Primary style** | scandinavian-minimalism |
| **Secondary influence** | wabi-sabi |
| **Convention-breaking** | Healthcare app rejects the standard blue-and-white clinical palette. Uses warm neutrals and intentional imperfection to communicate that healing is not sterile. |
| **Quality emphasis** | Hierarchy (target: 9), Color harmony (target: 9), Aesthetic (target: 8) |

---

## Pipeline Walkthrough

### Step 0: Message Enhancement (specificity 5/7)

The user message is analyzed across the seven extraction dimensions from MESSAGE-ENHANCEMENT-RULES.md:

| Dimension | Detected? | Signal | Enhancement |
|-----------|-----------|--------|-------------|
| Output type | Yes | "app screens for booking and intake" | mobile-app with phone-frame wrapper |
| Industry | Yes | "somatic therapist," "practice" | Healthcare / Wellness |
| Mood / aesthetic | Yes | "safe," "warm," "boundaried," "not clinical, not too playful" | Warm, restrained, grounded |
| Audience segment | Yes | "trauma survivors" | Specialized healthcare users requiring high-trust, low-stimulation UI |
| Explicit style | No | -- | Inferred from industry + mood mapping |
| Convention-breaking | Yes | "not clinical" explicitly rejects the industry default | Activate CONVENTION-BREAKING logic |
| Quality emphasis | Partial | Safety and warmth imply hierarchy and color harmony priority | Hierarchy 9, Color harmony 9, Aesthetic 8 |

**Specificity score: 5/7.** Five dimensions detected. This is a well-formed brief. The missing explicit style and partial quality emphasis are filled by the enhancement engine.

**Key enhancement decision:** The phrase "not clinical" is a convention-breaking signal. The standard Healthcare / Wellness route in AUDIENCE-ROUTES.md recommends scandinavian-minimalism and flat-design as safe defaults. But the user explicitly rejects clinical sterility, which means flat-design is eliminated. The "warm but boundaried" phrasing maps directly to scandinavian-minimalism's tag profile (minimalist, warm, clean, sparse, matte) -- warmth through material honesty, boundaries through generous negative space. The wabi-sabi secondary influence is injected because the user's "not too playful" and "safe" signals align with wabi-sabi's philosophy of imperfection-as-beauty, which the AUDIENCE-ROUTES healthcare section specifically calls out: "Imperfection-as-beauty directly serves mental health messaging; the aesthetic IS the therapy."

### Step 0c: UX Research

Before any visual work begins, the pipeline runs UX research across three domains relevant to this project:

**Trauma-informed UI design.** The core principle is predictability. Trauma survivors have hyperactive threat-detection systems. Unexpected animations, ambiguous navigation, and unclear state changes register as environmental instability. Every interaction must telegraph what will happen before it happens. This means: no surprise modals, no auto-advancing carousels, no elements that move without user initiation. Touch targets must be generous (minimum 48px, ideally 56px for this audience) because fine motor control is compromised during stress responses. Form fields should never disappear or rearrange -- spatial consistency is a form of emotional containment.

**Healthcare booking UX.** Booking flows in healthcare have a unique constraint: the user is often in a vulnerable emotional state when they initiate the process. The decision to book a therapy appointment may have taken weeks of deliberation. Any friction in the booking flow -- a confusing calendar, an unclear cancellation policy, a form that asks too many questions upfront -- can abort the process. Best practice: show availability first (reduce decision fatigue), limit the intake form to essential fields (name, concern, preferred contact method), and confirm immediately with clear next-steps. The confirmation screen must explicitly state what happens next and when.

**Somatic therapy client needs.** Somatic therapy is body-based. Clients are learning to notice physical sensations. This has a direct design implication: the interface should not provoke physical tension. Sharp corners, high contrast, and dense layouts create unconscious muscular guarding. Rounded corners, warm tones, and generous spacing invite the nervous system to settle. This is not metaphorical -- it is literally how the autonomic nervous system responds to environmental cues. The polyvagal theory underpinning somatic work describes how visual environments activate either the ventral vagal (safe, social) or sympathetic (fight, flight) nervous system branches. The design goal is ventral vagal activation: "I can relax here."

### Step 1: Style Resolution

**Primary: scandinavian-minimalism**

From the STYLE-INDEX: tags are `minimalist, warm, clean, sparse, matte` with motion_signature `slow_cinematic`.

Style resolution loads the full profile:
- **Layout philosophy:** Less but better. Every element earns its place. Generous negative space is not emptiness -- it is rest.
- **Color palette type:** Warm neutrals. No pure white (#FFFFFF). Instead, warm off-whites like #F7F3EE (parchment) and #EDE8E0 (linen). Accent colors are muted earth tones: #B8A898 (warm stone), #8B7E6A (weathered wood), #C4A882 (dried clay).
- **Typography:** Switzer (display sans) -- Swiss neo-grotesque with subtle humanist warmth. Paired with General Sans (body) for versatile readability. Both from the TYPEFACE-LIBRARY recommendations for scandinavian-minimalism.
- **Shadow model:** Minimal. Tinted warm shadows at very low opacity (0.04-0.08). No Tailwind defaults. Shadows carry the hue of the surface beneath them.
- **Border radius:** Moderate (8-12px). Not sharp (clinical), not pill-shaped (playful). The middle ground that reads as "considered."

**Secondary: wabi-sabi influence**

From the STYLE-INDEX: tags are `organic, muted, textured, warm, asymmetric` with motion_signature `organic_drift`.

The wabi-sabi influence is not a full style application -- it is a philosophical overlay. What it contributes:
- **Texture:** A fixed grain overlay (composition technique #6 from COMPOSITION-TECHNIQUES.md) at 0.03 opacity. This breaks the digital flatness and introduces analog warmth. The grain says "handmade" without saying "unfinished."
- **Asymmetry:** Slight asymmetric alignment in the layout. The booking calendar does not sit dead-center. Section headings have uneven spacing above and below. This is the visual equivalent of a hand-thrown ceramic bowl -- functional but not machine-perfect.
- **Imperfection as signal:** The convention-breaking insight. In healthcare, imperfection is usually a negative signal (sloppy = untrustworthy). But for a somatic therapy practice, controlled imperfection communicates: "We are not an institution. We understand that healing is not linear. Imperfection is welcome here." The wabi-sabi influence makes this philosophical position visible.

**Palette resolution (warm neutrals):**

| Token | Hex | Role |
|-------|-----|------|
| surface-primary | #F7F3EE | Main background -- warm parchment |
| surface-secondary | #EDE8E0 | Card backgrounds -- linen |
| text-primary | #2F3437 | Body text -- off-black with cool undertone |
| text-secondary | #6B6560 | Secondary text -- warm gray |
| accent-warm | #B8A898 | Interactive elements -- warm stone |
| accent-earth | #8B7E6A | Selected states -- weathered wood |
| accent-clay | #C4A882 | Highlights and confirmations -- dried clay |
| border-soft | #D9D2C9 | Subtle borders -- barely there |

This palette rejects healthcare blue entirely. Every color is derived from natural materials: stone, linen, wood, clay. The warmth is not decorative -- it is functional. Color temperature research shows that warm tones (color temperatures below 4000K in lighting, analogous warm hues in UI) activate parasympathetic nervous system responses. Cool blues and whites, while "clean," can register as institutional and trigger sympathetic (stress) responses in trauma-sensitized individuals.

**Touch targets:** Minimum 56px height for all interactive elements. This exceeds the standard 48px WCAG recommendation. The additional 8px is a trauma-informed decision: stress reduces fine motor precision, and generous targets communicate "you do not need to be precise here."

**Creative dials:**
- Design variance: 4 (creative but not radical -- safety requires some predictability)
- Motion intensity: 2 (near-static -- color shifts on hover, simple opacity fades, no scroll-driven effects)
- Visual density: 2 (spacious -- one concept per viewport section, dramatic breathing room)
- Audience alignment: 9 (every decision traced back to trauma-informed principles)

### Step 2: Hero Asset Conception

**Selected archetype: Parallax Depth Stack**

From HERO-ASSET-ARCHETYPES.md, the Parallax Depth Stack creates "multiple visual planes moving at different rates, creating perceived depth without 3D rendering." However, for this project the parallax motion is disabled (motion_intensity: 2, and trauma-informed design prohibits unsolicited movement). Instead, the depth stack is used as a static composition: layered organic textures at different opacities creating perceived depth without any animation.

The hero asset concept: three overlapping layers of organic texture -- a paper grain base, a watercolor wash middle layer at 0.15 opacity, and a fine linen weave top layer at 0.08 opacity. Together they create a warm, tactile surface that suggests handmade paper. This is the background texture for all three screens, providing visual continuity and the sensory impression of a physical therapy space.

**Pipeline:** `prompt-crafter-image-gen` -> fal.ai (Flux Pro) -> depth estimation (for layer separation) -> manual opacity compositing in the phone-frame wrapper.

### Step 3: Prompt Crafting + Generation

The prompt-crafter-image-gen subagent receives the resolved style data and produces the following prompt:

```
Scandinavian minimalist organic texture study. Layered handmade paper 
surfaces in warm parchment #F7F3EE and linen #EDE8E0 tones, suggesting 
safety and gentle containment. Subtle wabi-sabi influence -- uneven fiber 
density, faint watercolor wash in warm stone #B8A898 at the edges, visible 
paper grain throughout. Overhead flat composition, no objects, purely 
abstract material surface. Natural diffuse lighting from above, no 
directional shadows. Matte finish with tactile depth. 8K, sharp focus on 
paper fiber detail, macro texture photography. No text, no watermarks, no 
blurry edges, no glossy surfaces, no geometric patterns, no digital 
gradients.
```

**Prompt architecture notes:**
1. Style token first ("Scandinavian minimalist") anchors the model.
2. Subject is specific ("layered handmade paper surfaces") not vague ("a nice background").
3. Hex colors are embedded explicitly to prevent palette drift.
4. Wabi-sabi influence is described materially ("uneven fiber density") not abstractly ("imperfect feeling").
5. Anti-slop suffix negates the most likely failure modes for this prompt type.

**Generation parameters:** Flux Pro, 1024x1792 (portrait for mobile), seed randomized, guidance_scale 7.5.

**Prompt-artifact alignment verification:** After generation, the alignment validator runs per the criteria in PROMPT-ARTIFACT-ALIGNMENT.md for the image-gen job type. The key criteria:

| Criterion | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| style_fidelity | 0.25 | 8 | Unmistakably Scandinavian minimalist -- warm, matte, sparse |
| palette_accuracy | 0.20 | 8 | Dominant tones within perceptual tolerance of specified hex values |
| subject_clarity | 0.15 | 9 | Paper texture is the subject, and it is clearly rendered |
| composition_match | 0.15 | 8 | Flat overhead composition as specified |
| anti_slop | 0.15 | 8 | No AI artifacts, no generic stock-photo feel |
| texture_grain | 0.10 | 9 | Texture matches wabi-sabi organic grain specification |

**Weighted alignment score: 8.3 -- PASS (>= 7.0).** No auto-regeneration needed.

### Step 4: One-Shot Generation

Three mobile screens are generated in a single pass, wrapped in phone-frame containers. Each screen uses the texture asset as its background layer.

**Screen 1: Booking Calendar**

The calendar rejects the standard grid-of-numbers pattern. Instead, available slots are presented as a vertical list grouped by day, each slot a full-width card with generous padding (20px vertical, 24px horizontal). Date headers use Switzer at 600 weight, 18px, in text-primary #2F3437. Time slots use General Sans at 400 weight, 16px, in text-secondary #6B6560. Available slots have a left border accent in accent-clay #C4A882 (4px wide, border-radius 2px). The selected state fills the card background with surface-secondary #EDE8E0 and deepens the left border to accent-earth #8B7E6A. There is no hover state that changes position or size -- only color transitions at 400ms using the slow_cinematic easing curve (cubic-bezier(0.25, 0.46, 0.45, 0.94)).

The "Book This Time" button sits fixed at the bottom of the viewport with 24px padding from screen edges. Button height: 56px. Background: accent-earth #8B7E6A. Text: surface-primary #F7F3EE. Border-radius: 10px. The button text reads "Hold This Time" rather than "Book Now" -- language matters in trauma-informed design. "Book Now" implies urgency and commitment. "Hold This Time" implies safety and reversibility.

**Screen 2: Intake Form**

The intake form is chunked into three progressive sections, only one visible at a time: (1) basic information (name, email, phone), (2) session preferences (in-person or virtual, preferred day/time range), and (3) an optional free-text field: "Is there anything you would like me to know before our first session?" Each section has a progress indicator -- three small circles at the top, the current one filled with accent-earth #8B7E6A, the others outlined in border-soft #D9D2C9.

Form fields use a bottom-border-only style (no full box borders -- boxes feel like containment, and this audience has complex relationships with containment). The bottom border is border-soft #D9D2C9, thickening to accent-warm #B8A898 on focus. Labels sit above the field in General Sans 14px, text-secondary #6B6560. Input text is General Sans 16px, text-primary #2F3437. Field spacing is 32px vertical -- nearly double the standard 16-20px. This breathing room is not wasted space. It is the interface equivalent of a therapist pausing between questions.

The optional free-text field (section 3) has a note beneath it in 13px italic: "Share as much or as little as feels right." This is body-aware copy. It does not demand. It does not cajole. It acknowledges that the user has agency over their own disclosure.

**Screen 3: Session Confirmation**

The confirmation screen has the least content and the most space. A single centered icon (a simple circle with a soft checkmark in accent-earth #8B7E6A, 64px, stroke-width 1.5px -- thin lines feel gentler than thick ones). Below it, Switzer 600 weight, 22px: "Your session is held." Not "confirmed" (too transactional) or "booked" (too final). "Held" -- the same language as a therapist holding space.

Below the heading, three information blocks with consistent formatting:
- Date and time
- Session type (in-person or virtual)
- Location or video link

Each block is text-secondary #6B6560 in General Sans 15px. Between the blocks and the heading: 40px. Between each block: 16px.

At the bottom, two quiet links in 14px text-secondary: "Add to calendar" and "Reschedule or cancel." The word "cancel" is not red. It is the same warm gray as everything else. Red cancel buttons punish the act of changing your mind. In trauma-informed design, changing your mind is always safe.

**Phone-frame wrapper:** All three screens are wrapped in a device frame with 8px bezel radius, subtle warm shadow (0 8px 32px rgba(143, 130, 115, 0.12)), and the grain overlay from the hero asset at 0.03 opacity fixed behind all content.

### Step 5: Quality Evaluation

The quality-assessor agent runs the full composite scoring rubric from QUALITY-SCORING.md:

| Sub-score | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| Anti-slop gate | 0.15 | 8.5 | Switzer + General Sans (not Inter/Roboto). Off-black text (#2F3437). No purple-blue gradients. No generic hero layout. Grain overlay. Warm tinted shadows. |
| Code standards | 0.08 | 8.0 | Tailwind v4 tokens from scandinavian-minimalism preset. No inline styles. Responsive within phone frame. |
| Asset quality | 0.12 | 8.0 | Texture asset at 1024x1792, correct format, optimized file size, proper viewBox if SVG elements present. |
| Prompt-artifact alignment | 0.15 | 8.3 | Verified in Step 3. Texture matches specification. |
| Aesthetic | 0.13 | 8.5 | Warm, restrained, tactile. The screens feel like holding a handmade notebook. Material quality communicates care. |
| Style fidelity | 0.13 | 8.0 | scandinavian-minimalism is clearly the dominant style. Wabi-sabi is present in grain and asymmetry without overpowering. |
| Distinctiveness | 0.13 | 8.5 | This does not look like any other healthcare app. The warm neutral palette and texture-first approach are genuinely distinctive. |
| Hierarchy | 0.06 | 9.0 | Clear three-tier typographic hierarchy (display, body, secondary). Interactive elements are immediately identifiable by accent color. Spatial hierarchy via breathing room. |
| Color harmony | 0.05 | 9.0 | Monochromatic warm palette with zero hue clashes. Every color derives from the same natural-material family. The accent-earth and accent-clay tones relate as neighbors, not strangers. |

**Composite score: 0.15(8.5) + 0.08(8.0) + 0.12(8.0) + 0.15(8.3) + 0.13(8.5) + 0.13(8.0) + 0.13(8.5) + 0.06(9.0) + 0.05(9.0) = 8.37**

**Verdict: PASS (8.37 >= 7.0).** Score card displayed. Output delivered.

### Steps 6-10: Refinement

Even with a passing composite score, five refinement passes address specific concerns:

**Step 6: Touch target audit.** Every interactive element is measured. The calendar time slots measure 56px height -- pass. The "Hold This Time" button measures 56px -- pass. Form field tap areas measure 52px (field + label combined) -- upgraded to 56px by increasing field vertical padding from 12px to 16px. The progress indicator circles measure 32px tap area -- upgraded to 44px by adding transparent padding around the 12px visible circle.

**Step 7: Color temperature fine-tuning.** The initial accent-warm #B8A898 tested slightly cool when rendered on the warm parchment background. Shifted to #BDA995 (3 points warmer in the hue channel) to maintain perceptual warmth consistency across all surface combinations. The border-soft token shifted from #D9D2C9 to #DBD4CB to match.

**Step 8: Intake form chunking validation.** The three-section progressive disclosure is tested for cognitive load. Section 1 (name, email, phone) has 3 fields -- well within working memory limits. Section 2 (preferences) has 2 fields -- good. Section 3 (free text) has 1 field -- ideal for an emotionally loaded question. The "Next" button between sections uses the same 56px height and slow_cinematic transition. Label: "Continue" (not "Next" -- "Continue" implies the user is already in motion, "Next" implies the system is directing them).

**Step 9: Confirmation screen spacing.** The checkmark icon was initially 48px. Increased to 64px to occupy more vertical space and reduce the feeling of density. The space between the icon and "Your session is held" increased from 24px to 32px. The overall effect: the confirmation screen breathes. It says "you are done, and that is enough."

**Step 10: Grain overlay calibration.** The 0.03 opacity grain was tested on both light (surface-primary) and dark (text-primary) elements. On light backgrounds it reads as subtle paper texture -- correct. On dark text it was imperceptible -- correct (grain should texture surfaces, not text). On the accent-earth button, the grain at 0.03 adds a matte tactile quality without degrading text legibility. No adjustment needed.

### Step 11: Export

The three screens are exported as:
- Individual PNG renders at 2x resolution (750x1624 for iPhone frame)
- A combined presentation image showing all three screens side by side
- Tailwind v4 CSS preset with all design tokens for developer handoff
- Component markup (React) for each screen with all spacing, typography, and color tokens applied

---

## Troubleshooting

### 1. "The calendar looks too sparse -- clients might think nothing is available"

This is a density concern. The vertical list format shows fewer slots per viewport than a traditional grid calendar. Resolution: add a subtle count indicator at the top of each day group: "4 times available" in text-secondary 13px. This provides information density without visual density. Do not switch to a grid layout -- grids create decision fatigue, and this audience is already managing cognitive load from their therapeutic process.

### 2. "The warm palette feels too feminine / too spa-like"

This is a valid concern when warm neutrals are used without structural counterweight. Resolution: increase the presence of accent-earth #8B7E6A (the cooler, darker tone) in structural elements like the header bar and progress indicators. Add a single 1px border-soft rule under the header to create visual authority. The combination of warm surfaces with structured, darker accents reads as "grounded professional" rather than "wellness retreat." Check that the Switzer typeface is rendering at 600 weight (not 500) for headings -- the additional weight adds gravitas.

### 3. "The intake form free-text field feels intimidating despite the gentle copy"

Large empty text areas can trigger performance anxiety ("I need to fill this"). Resolution: reduce the visible height of the textarea to 3 lines (approximately 72px) and allow it to auto-expand as the user types. Add placeholder text in text-secondary at 0.5 opacity: "e.g., I have been working with anxiety for several years..." The example normalizes the response and reduces the blank-page problem. Ensure the field is explicitly marked "Optional" with the word visible, not hidden in a tooltip.

### 4. "The muted palette does not provide enough contrast for accessibility"

Run a WCAG 2.2 AA contrast check on every text/background combination:
- text-primary #2F3437 on surface-primary #F7F3EE: ratio 9.8:1 -- passes AAA
- text-secondary #6B6560 on surface-primary #F7F3EE: ratio 4.6:1 -- passes AA
- surface-primary #F7F3EE on accent-earth #8B7E6A (button): ratio 3.2:1 -- passes AA for large text (the button text is 16px+ at 500+ weight, qualifying as large text under WCAG)
- If any combination fails, darken the text token by 10% in lightness before adjusting the palette globally.

### 5. "Clients are confused about whether their session is in-person or virtual"

The confirmation screen (Screen 3) shows session type but may not differentiate clearly enough. Resolution: add a small icon next to the session type line -- a simple building outline for in-person, a camera outline for virtual. Icons should be 20px, stroke-width 1.5px, colored in text-secondary #6B6560. Do not use filled icons -- outline icons at this weight maintain the gentle, unhurried quality of the design.

---

## Anti-Slop Verification

The following checks are run against the ANTI-SLOP reference to confirm the output is free of AI-generic markers:

### 1. Typography verification
**Check:** Is Inter, Roboto, Open Sans, or Arial used anywhere?
**Result:** PASS. Switzer (display) and General Sans (body) are used throughout. Both are style-specific recommendations from the TYPEFACE-LIBRARY for scandinavian-minimalism. If you swapped Switzer for Inter, the design would immediately lose its humanist warmth -- the "would anyone notice?" test passes.

### 2. Color palette verification
**Check:** Is there a purple-to-blue gradient, unmodified Tailwind blue-500, or pure #000000 anywhere?
**Result:** PASS. The entire palette is derived from warm neutrals. Body text uses #2F3437 (off-black with cool undertone for readability against warm backgrounds). No Tailwind default colors appear. No gradients are used. Every color is traceable to a natural material reference.

### 3. Layout skeleton verification
**Check:** Does the layout follow the hero-features-testimonials-CTA template?
**Result:** PASS. There is no hero section. There is no features grid. There is no testimonial carousel. Each screen is a single-purpose functional interface. The booking screen is a list. The intake screen is a progressive form. The confirmation screen is a single statement with details. No screen follows a marketing template pattern.

### 4. Shadow and elevation verification
**Check:** Are Tailwind default shadow-md/shadow-lg/shadow-xl used? Are shadows pure black rgba(0,0,0,x)?
**Result:** PASS. The phone-frame wrapper uses a warm-tinted shadow: rgba(143, 130, 115, 0.12). Card-level shadows (on calendar slots in selected state) use rgba(139, 126, 106, 0.06) -- derived from the accent-earth hue. No element uses a Tailwind shadow preset. No shadow uses pure black.

### 5. Copy and microcopy verification
**Check:** Does any text contain "Elevate your," "Seamless experience," "Transform your," "Unlock," or other AI-generic marketing phrases?
**Result:** PASS. All copy is specific to the therapeutic context. "Hold This Time" (not "Book Now"). "Your session is held" (not "Booking Confirmed!"). "Share as much or as little as feels right" (not "Tell us about yourself"). "Continue" (not "Next Step"). Every piece of microcopy was written with awareness of how language lands in a trauma-sensitized nervous system.

### 6. Motion verification
**Check:** Is `transition: all 300ms linear` applied uniformly? Are there unnecessary entrance animations?
**Result:** PASS. The only transitions are color/opacity changes on interactive states, using the slow_cinematic curve (cubic-bezier(0.25, 0.46, 0.45, 0.94)) at 400ms. No scroll-triggered animations. No entrance animations. No parallax. Motion-intensity dial is set to 2 (near-static), consistent with trauma-informed design principles. The `prefers-reduced-motion` media query is respected, reducing all transitions to instant state changes.

---

## Key Design Principles Demonstrated

**Why healthcare UI must earn trust in the first three seconds.** The autonomic nervous system evaluates environmental safety faster than conscious thought. When a trauma survivor opens an app for the first time, their nervous system is scanning: Is this familiar? Is this predictable? Does this feel like a place where I will be seen, or a place where I will be processed? The warm parchment background, the unhurried spacing, the absence of aggressive calls-to-action -- all of these register as safety cues before the user reads a single word. The standard clinical palette (white, blue, sans-serif, sharp corners) registers as "institution," and for many trauma survivors, institutions are not safe places.

**How color temperature affects perceived safety.** Warm color temperatures (analogous to lighting below 4000K) correlate with parasympathetic nervous system activation. This is not pseudoscience -- it is the same principle that makes warm lighting in restaurants encourage lingering while cool fluorescent lighting in hospitals encourages efficiency. By choosing a palette anchored in warm parchment, linen, stone, and clay, the interface creates a chromatic environment that encourages the nervous system to settle rather than brace.

**Body-aware design as a design methodology.** Somatic therapy works with the body. The interface should, too. No sharp corners (corners above 4px radius -- the 8-12px used here reads as soft without being childish). Generous touch targets (56px -- the hand does not need to be precise). Ample spacing between form fields (32px -- the eye can rest between questions). Gentle transitions (400ms slow_cinematic -- nothing snaps or jumps). These are not merely aesthetic choices. They are embodied design decisions that acknowledge the user has a body, and that body is paying attention to the interface even when the conscious mind is focused on content.

**Scandinavian minimalism's "less but better" maps to trauma-informed design.** Dieter Rams' principle, adopted by Scandinavian design, is not about deprivation. It is about removing everything that does not serve the user. In a trauma-informed context, this principle becomes therapeutic: every element that is not necessary is a potential source of overwhelm. The booking calendar shows only available times (not a full month grid with grayed-out days). The intake form shows one section at a time (not all fields at once). The confirmation screen shows only what the user needs to know (not upsells, reviews, or social sharing prompts). Less is not a style preference here. It is a clinical consideration.
