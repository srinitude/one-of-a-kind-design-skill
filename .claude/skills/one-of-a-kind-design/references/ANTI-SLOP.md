# ANTI-SLOP
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Comprehensive anti-slop reference merging both the `implementation.anti_slop` and `implementation_intelligence.anti_slop` sections. These patterns mark output as machine-generated template work and must be actively avoided.

---

## Typography Bans

| Banned Pattern | Why | Fix |
|---|---|---|
| Inter as the default typeface | Statistical mode of every AI code generator -- appears in 80%+ of generated UIs, instantly signals 'undesigned' | Select a typeface with character that matches the style's era and mood |
| Roboto or Open Sans for body text | Google Fonts popularity bias in training data. Android system default treated as 'good enough' -- it's not a choice, it's an absence of choice | Use the style's own typography_family recommendation |
| Arial as default | System fallback masquerading as a design decision | Use a deliberate type choice from the typeface library |
| #000000 pure black for body text | Too harsh for screens -- fatigues eyes and flattens hierarchy | Off-black (#111111, #1a1a1a, #2F3437) or style-appropriate dark tone |
| Uniform font-weight across all text | Destroys typographic hierarchy -- everything looks equally important | Minimum three weight tiers (display: 700+, body: 400, secondary: 300-400) |

### Typography Rules
- Body line-height: 1.5-1.7, never 1.0 or browser default
- Headings get tight tracking (-0.01em to -0.04em), body gets normal or slightly loose
- Max line length ~65ch for readability -- constrain with max-width
- Establish at least 3 type scale tiers with visible contrast between them
- **Principle:** Typography is the highest-leverage design decision. The font you choose communicates before a single word is read. Every style MUST specify a deliberate typographic voice -- never rely on framework defaults. The test: if you swapped the font for Inter, would anyone notice the design changed? If yes, you chose well. If no, you chose nothing.

---

## Color Bans

| Banned Pattern | Why | Fix |
|---|---|---|
| Purple-to-blue gradient on white background | The single most overused AI-generated color scheme -- the #1 AI-generated color pattern, instantly marks output as synthetic | Derive palette from the style's color_palette_type, not from Tailwind defaults |
| Oversaturated accent colors at full brightness | Vibrates against neutrals, looks unprofessional | Desaturate accents 15-30% to blend with the palette's neutral base |
| Evenly distributed rainbow palettes | Reads as 'no decision was made' -- using every color equally means you chose none | 60/30/10 ratio -- dominant surface, secondary structure, accent spark |
| blue-500 primary with gray-100 background | Tailwind default palette used without modification | Use a deliberate palette derived from the style |
| Pure #000000 backgrounds | Lifeless and flat | Use rich near-blacks with color undertone (#0a0a0a, #111827, #1c1917) |

### Color Rules
- Desaturate accents to blend with neutrals -- oversaturation is the default AI tell
- Tinted shadows that carry the hue of the object, not generic rgba(0,0,0,x)
- Background is never just a flat solid -- add grain, subtle gradient, or texture
- Dark mode is not light mode inverted -- redesign surface hierarchy from scratch
- **Principle:** Color is scarce or it's noise. Either commit to restraint (2-3 hues max with the rest neutral) or commit to maximalism (full palette with intentional relationships). The middle ground -- 4-5 random bright accents on gray -- is where generic lives.

---

## Shadow Bans

| Banned Pattern | Why | Fix |
|---|---|---|
| Tailwind default shadow-md, shadow-lg, shadow-xl | Generic depth that belongs to no style -- every AI app looks identically 'floaty' | Derive shadow model from style's shadow_model field -- many styles use none |
| Pure black rgba(0,0,0,x) shadows everywhere | Unnatural -- real shadows carry the hue of their environment | Tint shadows with the dominant background hue at low saturation |
| Neon outer-glow box-shadows | Overused glow effect | Use style-appropriate glow only where warranted |
| Uniform shadow on every element | Shadows are hierarchy, not decoration | Define 3-5 elevation tiers, apply purposefully |

### Shadow Rules
- If using shadows, define a consistent light direction (top-left is convention, break it if the style demands)
- Shadow opacity below 0.15 for sophistication, above 0.3 for graphic boldness
- Elevation-based shadow scales: define 3-5 tiers, never ad-hoc per element
- Consider colored shadows, inner shadows, or no shadows as alternatives to the drop-shadow default
- **Principle:** Shadows communicate physical truth. Generic shadows say nothing about the world the UI inhabits. Every shadow choice implies a light source, a surface material, and a distance. Choose those things deliberately or use no shadows at all.

---

## Layout Bans

| Banned Pattern | Why | Fix |
|---|---|---|
| Centered single-column with max-w-4xl for everything | Safe but forgettable -- the 'blog post' layout regardless of content type | Let the style's layout_philosophy drive structure -- asymmetric, grid, organic, etc. |
| Identical card grids with uniform sizing | Pinterest/dashboard homogeneity -- nothing has visual priority | Vary card sizes to create hierarchy -- bento grids, masonry, or featured+supporting |
| Hero section -> three-column features -> testimonials -> CTA footer | The skeleton of every AI-generated landing page | Restructure around the style's spatial logic and the content's actual narrative |
| Hero section with oversized H1, subtitle, and two buttons | Generic hero pattern | Let style and content dictate hero composition |

### Layout Rules
- At least one section per page should break the column grid
- Vary vertical padding between sections -- not uniform py-16 everywhere
- Negative space is a design element, not empty space waiting to be filled
- Overlap, bleed, and offset are tools -- use them when the style permits
- **Principle:** The most damaging AI default is structural -- the same page skeleton with different paint. Break the template. This means: vary section rhythms (tall sparse followed by dense grid), use asymmetric compositions, let content dictate structure instead of structure constraining content.

---

## Motion Bans

| Banned Pattern | Why | Fix |
|---|---|---|
| Linear easing on all transitions | Robotic -- nothing in the physical world moves linearly | Spring physics or style-appropriate curve from rive_motion.animation_curves |
| All elements appearing simultaneously on page load | Overwhelming, no narrative pacing | Stagger entry -- animation-delay: calc(var(--index) * 60-100ms) |
| Hover effects that only change opacity or color | Missed opportunity for tactile feedback | Combine with subtle transform (scale, translateY) matched to style's interaction_patterns |
| 300ms transition-all on hover | Lazy default that applies to everything | Use targeted transitions with style-appropriate curves and durations |
| Fade-in-from-bottom on every scroll entry | Overused AI default | Vary entry animations based on style -- some styles should snap, others drift, others build |
| Simultaneous mount of all elements | No choreography | Stagger and sequence entries for narrative pacing |

### Motion Rules
- Animate only transform and opacity -- never layout-triggering properties
- Use will-change sparingly, only on actively animating elements
- IntersectionObserver for scroll triggers -- never window scroll listeners
- Wrap all motion in @media (prefers-reduced-motion: no-preference)
- Target 60fps -- test on low-end devices
- **Principle:** Motion is choreography or it's jitter. Stagger entries. Use spring physics (stiffness: 100, damping: 20 as baseline). Differentiate between structural motion (page transitions, layout shifts) and gestural motion (hover, press, drag). Always respect prefers-reduced-motion.

---

## Copy Bans

### Banned Words
These words appear in 80%+ of AI-generated marketing copy and instantly mark content as synthetic:

| Word | Alternative Approach |
|---|---|
| Elevate | Describe the specific improvement |
| Seamless | Describe what actually works and how |
| Unleash | Describe the specific capability |
| Next-Gen | Describe the actual technical advancement |
| Game-changer | Describe the specific impact with numbers |
| Delve | Use direct language: explore, examine, analyze |
| Cutting-edge | Describe what's actually new |
| Revolutionize | Describe the specific change |
| Supercharge | Describe the performance gain with metrics |
| Empower | Describe what the user can now do |

### Banned Placeholders
| Placeholder | Rule |
|---|---|
| Lorem Ipsum | Use realistic, contextual content that a real user of this style would encounter |
| John Doe / Jane Doe | Use realistic names appropriate to the target audience |
| Acme Corp | Use plausible company names |
| example@email.com | Use contextual placeholder emails |

**Principle:** Write like a human who knows the product, not a brochure generator. Specificity beats superlatives. "Processes 10,000 rows in 2 seconds" beats "blazingly fast performance." Realistic content (actual names, plausible numbers, contextual detail) beats Lorem Ipsum every time.

---

## Icon Guidance

### Preferred Icon Sets
| Set | Weight | Why |
|---|---|---|
| Phosphor Icons | Bold or Fill -- thicker stroke reads as intentional | Distinctive without being decorative -- works across most styles |
| Radix UI Icons | Default | Technical precision, good for UI-native and minimalist styles |
| Tabler Icons | 1.5px stroke | Extensive set with consistent geometry |

### Rules
- Standardize stroke-width globally within a project -- mixing weights looks accidental
- **Override:** For styles tagged 'hand-drawn' or 'retro', hand-illustrated icons may replace icon sets entirely
