# MESSAGE ENHANCEMENT RULES
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Rules for extracting design intent from user messages and enhancing them with taxonomy-informed specificity. Defines extraction dimensions, scoring, and injection logic.

---

## 7 Extraction Dimensions

When a user message arrives, analyze it across these seven dimensions to determine how specific the design intent is and what additional context should be injected.

### 1. Output Type
**What it detects:** The deliverable format the user expects.
**Signal words:** landing page, dashboard, mobile app, portfolio, logo, hero section, email template, social post, icon set, design system, component library, marketing page, onboarding flow, checkout, settings panel, data visualization

**If detected:** Map to appropriate layout_philosophy patterns. A "dashboard" implies dense visual_density (6-8); a "landing page" implies narrative scroll structure; a "portfolio" implies image-hero layouts.

**If missing:** Default to responsive web page. Note the ambiguity in enhancement.

### 2. Industry
**What it detects:** The business domain or vertical the design serves.
**Signal words:** fintech, healthcare, education, e-commerce, SaaS, music, gaming, fashion, restaurant, real estate, legal, fitness, travel, sustainability, developer tools, social media, crypto, automotive, architecture

**If detected:** Cross-reference with AUDIENCE-ROUTES.md. Inject primary_styles and avoid_styles for the detected industry. Flag any style selections that conflict with industry avoid lists.

**If missing:** Do not assume an industry. The enhancement should ask or work with style-first rather than industry-first logic.

### 3. Mood / Aesthetic Tags
**What it detects:** Emotional or visual qualities the user wants.
**Signal words:** clean, bold, playful, minimalist, luxurious, warm, dark, futuristic, organic, vintage, industrial, ethereal, dramatic, calm, energetic, professional, raw, elegant, rebellious, contemplative

**If detected:** Map directly to taxonomy tags. Use tag_clash_rules from CONFLICT-MAP.md to validate combinations. Inject matching styles sorted by tag overlap count.

**If missing:** Extract implicit mood from industry and output type. A healthcare dashboard implies "clean, calm, trustworthy." A music app implies "expressive, immersive, dark."

### 4. Audience Segment
**What it detects:** Who will use or view the design.
**Signal words:** enterprise, consumer, Gen Z, millennials, developers, children, seniors, professionals, creators, executives, patients, students, shoppers

**If detected:** Cross-reference with audience_routes.by_audience_age and market segment routes. Inject resonant_styles and anti_patterns for the detected segment.

**If missing:** Infer from industry and output type. A "SaaS dashboard" implies professional users; a "game UI" implies consumer/entertainment.

### 5. Explicit Style
**What it detects:** The user directly naming a visual style.
**Signal words:** Any of the 66 style names or ids (e.g., "art deco", "glassmorphism", "brutalist", "wabi-sabi", "neubrutalism", "bento grid", "retro", "swiss style")

**If detected:** Load the full style profile including dials, font_selection, motion_signature, premium_patterns, convention_breaks, and anti_slop_overrides. This is the highest-confidence dimension.

**If missing:** Recommend 2-3 styles based on the other detected dimensions. Present with rationale for each.

### 6. Convention-Breaking Signals
**What it detects:** Indicators that the user wants something unexpected or non-obvious.
**Signal words:** unexpected, surprising, different, unique, not typical, break the mold, stand out, distinctive, unconventional, fresh, not like other, creative, experimental, bold choice, rebel

**If detected:** Activate CONVENTION-BREAKING.md logic. Instead of safe defaults, recommend unexpected_applications from style_profiles. Increase design_variance dial by 2 points. Present "break the mold" options from audience_router.

**If missing:** Use safe defaults for the detected industry/audience. Note convention-breaking options as alternatives.

### 7. Quality Emphasis
**What it detects:** Specific quality concerns or requirements.
**Signal words:** accessible, WCAG, performance, fast, lightweight, mobile-first, responsive, animation, motion, interactive, static, print, dark mode, light mode, high contrast, dyslexia-friendly, reduce motion

**If detected:** Apply relevant guardrails from GUARDRAILS.md. For accessibility signals, recommend from accessibility_bundles. For performance signals, enforce performance_guardrails. For motion signals, set motion_intensity dial accordingly.

**If missing:** Apply universal guardrails as baseline. Do not reduce to minimum -- apply the style's default motion and density.

---

## Specificity Scoring Formula

**Score range:** 0-7 (one point per dimension detected)

| Score | Dimensions Detected | Label | Enhancement Strategy |
|---|---|---|---|
| 0 | None | Blank canvas | Ask clarifying questions before proceeding. Cannot produce quality output without at least 2 dimensions. |
| 1 | One | Seed | Heavy enhancement required. Single dimension gives direction but not destination. Inject defaults from 3-4 other dimensions. |
| 2 | Two | Sketch | Moderate enhancement. Two dimensions create a design vector. Fill remaining dimensions with informed defaults. |
| 3 | Three | Brief | Light enhancement. Three dimensions define the project well enough to begin. Inject style-specific detail. |
| 4 | Four | Specification | Minimal enhancement. Validate choices against conflict map and guardrails. Inject premium patterns and anti-slop overrides. |
| 5 | Five | Detailed spec | Near-complete. Inject convention-breaking options as "did you consider" prompts. Validate tag compatibility. |
| 6 | Six | Expert brief | Complete specification. Validate for conflicts, inject anti-slop overrides, and proceed directly to implementation. |
| 7 | Seven | Full directive | Nothing to add. Validate, confirm, execute. Flag any internal contradictions (e.g., "accessible" + "psychedelic"). |

---

## Enhancement Rules by Dimension

### When output_type is detected:
- Inject appropriate layout_philosophy from matched styles
- Set visual_density dial based on output type (dashboard: 6-8, landing page: 3-5, portfolio: 2-4)
- Select component_patterns appropriate to the output type
- Apply section rhythm expectations (dashboard = uniform, landing page = varied, portfolio = image-dominant)

### When industry is detected:
- Load industry route from AUDIENCE-ROUTES.md
- Inject primary_styles as recommendations
- Flag avoid_styles as warnings if user has selected them
- Include "break the mold" options when convention-breaking signals are also present

### When mood/aesthetic tags are detected:
- Map each tag to the tag_vocabulary
- Run tag pairs through tag_clash_rules -- flag hard clashes as errors, soft clashes with resolution suggestions
- Rank all 66 styles by tag overlap count and present top 3-5
- Inject motion_signature that matches the mood (calm = organic_drift, energetic = playful_bounce, precise = mechanical_snap)

### When audience_segment is detected:
- Load age-based resonant_styles and anti_patterns
- Cross-reference with industry routes if industry is also detected
- Set audience_formality dial based on segment (Gen Z = 1-3, enterprise = 7-9, children = 1-2)
- Flag accessibility concerns for senior or children audiences (enforce WCAG-AAA Safe Foundation bundle styles)

### When explicit_style is detected:
- Load complete style profile: dials, font_selection, motion_signature, premium_patterns
- Load anti_slop_overrides for the style
- Load convention_breaks for inspiration/alternatives
- Check audience_market_fit.strong to validate against detected industry
- Check audience_market_fit.unexpected to surface creative alternatives

### When convention_breaking signals are detected:
- Increase design_variance by +2 (cap at 10)
- Load unexpected_applications from CONVENTION-BREAKING.md matching any detected styles
- Present "break the mold" recommendations from audience_router
- Load cross_pollination recipes involving any detected styles
- Frame recommendations as "instead of the expected, consider..."

### When quality_emphasis is detected:
- For "accessible" / "WCAG": enforce accessibility_non_negotiables, recommend accessibility_bundles
- For "performance" / "fast": enforce performance_guardrails, recommend styles with low motion_intensity
- For "animation" / "motion": increase motion_intensity by +2, load premium_motion_catalog
- For "static": set motion_intensity to 1, recommend Reduced-Motion Safe bundle styles
- For "dark mode": ensure dark-mode-ui compatibility, check soft_conflicts for style + dark-mode pairing
- For "mobile-first": enforce particle limits, backdrop-filter limits, texture size limits

---

## Enhancement Examples

### Example 1: Vague Message

**User message:** "I need a website for my business"

**Extraction:**
- output_type: website (1 point)
- industry: not detected
- mood: not detected
- audience: not detected
- style: not detected
- convention_breaking: not detected
- quality: not detected

**Score: 1/7 (Seed)**

**Enhancement action:** Ask clarifying questions:
- What does your business do? (industry)
- Who visits your website? (audience)
- How should it feel? (mood)
- Any visual references you admire? (style)

### Example 2: Moderate Message

**User message:** "Design a dark, minimal fintech dashboard for millennials"

**Extraction:**
- output_type: dashboard (1 point)
- industry: fintech (1 point)
- mood: dark, minimal (1 point)
- audience: millennials (1 point)
- style: not explicitly named but "dark minimal" maps to dark-mode-ui + editorial-minimalism
- convention_breaking: not detected
- quality: not detected

**Score: 4/7 (Specification)**

**Enhancement injections:**
- **Industry route:** fintech primary = material-design, dark-mode-ui, bento-ui, swiss-international. Avoid: psychedelic, memphis-design, glitch.
- **Mood mapping:** "dark" = dark-mode-ui, "minimal" = minimalist tag. Top style matches: dark-mode-ui, editorial-minimalism, bento-ui.
- **Audience:** Millennials resonate with editorial-minimalism, bento-ui, dark-mode-ui, scandinavian-minimalism. Anti-pattern: avoid hyper-youth aesthetics.
- **Dial settings:** visual_density: 7 (dashboard), audience_formality: 6 (professional millennial), motion_intensity: 3 (data-focused).
- **Anti-slop overrides:** No purple-gradient. Gray scale needs 10+ stops. Accent colors desaturated vs light mode. No pure white text.
- **Premium patterns:** bento-grid for layout, spotlight-border for cards, tinted-shadows for depth.

### Example 3: Specific Message

**User message:** "Build a solarpunk landing page for a climate tech startup targeting Gen Z investors. Make it feel hopeful but professional. Needs to be accessible and fast."

**Extraction:**
- output_type: landing page (1 point)
- industry: sustainability / climate tech (1 point)
- mood: hopeful, professional (1 point)
- audience: Gen Z investors (1 point)
- style: solarpunk (1 point)
- convention_breaking: not detected
- quality: accessible, fast (1 point)

**Score: 6/7 (Expert brief)**

**Enhancement injections:**
- **Style loaded:** solarpunk -- dials: design_variance 5, motion_intensity 4, visual_density 4, audience_formality 4. Motion: organic_drift. Fonts: rounded humanist sans-serif.
- **Industry validation:** Sustainability route confirms solarpunk as primary_style. Validated.
- **Audience tension:** Gen Z resonates with neubrutalism, y2k-revival, claymorphism -- but "professional" + "investors" pushes formality to 6-7. Override solarpunk's default formality (4) to 6.
- **Accessibility:** Enforce WCAG-AAA. Solarpunk has no accessibility risks flagged. Motion gated behind prefers-reduced-motion. Use Neurodivergent-Safe bundle patterns for text handling.
- **Performance:** Enforce texture asset <200KB. Limit organic_drift animations. No backdrop-filter (solarpunk doesn't require it).
- **Pairing suggestion:** solarpunk + scandinavian-minimalism (recommended pairing from PAIRINGS.md) provides structural discipline.
- **Anti-slop:** No purple-gradient-on-white. Verdant greens, solar gold, sky blue palette. Rounded humanist sans-serif (not Inter). Organic section dividers, not horizontal rules.
