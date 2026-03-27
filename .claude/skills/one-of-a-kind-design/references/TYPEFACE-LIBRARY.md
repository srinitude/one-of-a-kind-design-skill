# TYPEFACE LIBRARY
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Curated typeface recommendations mapped to styles, plus premium font stacks and anti-slop font rules.

---

## Premium Font Stacks

These stacks are referenced throughout the taxonomy's style implementations. Use them as starting points, then narrow to the specific typeface that best serves the style.

| Stack | Fonts |
|---|---|
| **Premium Sans** | 'Geist Sans', 'Satoshi', 'Outfit', 'Cabinet Grotesk', 'Switzer', 'General Sans', sans-serif |
| **Editorial Serif** | 'Lyon Text', 'Newsreader', 'Instrument Serif', 'Playfair Display', 'Fraunces', serif |
| **Monospace** | 'Geist Mono', 'JetBrains Mono', 'SF Mono', 'Berkeley Mono', 'Fira Code', monospace |
| **Display** | 'Clash Display', 'Space Grotesk', 'Syne', 'Plus Jakarta Sans', 'Manrope', sans-serif |

---

## Display Sans-Serif Typefaces

### Switzer
- **Foundry:** Jeremie Hornus (Black Foundry via Fontshare)
- **Character:** Swiss neo-grotesque with subtle humanist warmth
- **Best For:** scandinavian-minimalism, flat-design, dark-mode-ui

### Cabinet Grotesk
- **Foundry:** Indian Type Foundry
- **Character:** Geometric grotesque with distinctive 'g' and wide apertures
- **Best For:** bauhaus, swiss-international, material-design

### Satoshi
- **Foundry:** Indian Type Foundry via Fontshare
- **Character:** Modern geometric sans with friendly character and tight metrics
- **Best For:** flat-design, claymorphism, aurora-ui

### General Sans
- **Foundry:** Indian Type Foundry via Fontshare
- **Character:** Versatile sans-serif bridging geometric and grotesque
- **Best For:** bento-ui, material-design, scandinavian-minimalism

### Bricolage Grotesque
- **Foundry:** Mathieu Triay
- **Character:** Playful geometric sans with quirky details and excellent readability
- **Best For:** memphis-design, neubrutalism, claymorphism

### Erode
- **Foundry:** Indian Type Foundry via Fontshare
- **Character:** High-contrast display sans with dramatic thick/thin strokes
- **Best For:** art-deco, constructivism, duotone

### CoFo Kabeltouw
- **Foundry:** Contrast Foundry
- **Character:** Bold modular display inspired by maritime cargo infrastructure
- **Best For:** brutalist-web, neubrutalism, constructivism

### Aspekta
- **Foundry:** Indian Type Foundry via Fontshare
- **Character:** Neutral technical sans with 9 weights and excellent code UI pairing
- **Best For:** wireframe-mesh, dark-mode-ui, generative-art

---

## Display Serif Typefaces

### Instrument Serif
- **Foundry:** Google Fonts (Rodrigo Fuenzalida)
- **Character:** Elegant high-contrast transitional serif with sharp terminals
- **Best For:** cinematic, art-nouveau, editorial-minimalism

### Pliego
- **Foundry:** Juanjo Lopez
- **Character:** Renaissance calligraphic old-style with modern swash alternates
- **Best For:** rococo, art-nouveau, wabi-sabi

### Zodiak
- **Foundry:** Indian Type Foundry via Fontshare
- **Character:** Dramatic wedge-serif display with extreme contrast
- **Best For:** surrealism, cinematic, psychedelic

### Newsreader
- **Foundry:** Production Type for Google
- **Character:** Newspaper-inspired text serif with editorial authority
- **Best For:** swiss-international, editorial-minimalism, retro-vintage-print

### Fraunces
- **Foundry:** Undercase Type for Google
- **Character:** Variable 'wonky' old-style with optical size axis -- playful at display, serious at text
- **Best For:** wabi-sabi, arte-povera-digital, papercut

### Hagrid
- **Foundry:** Stefan Osterer (redesigned 2025)
- **Character:** Angular slab-serif with strong personality and dramatic Black weight
- **Best For:** woodcut, retro-vintage-print, neubrutalism

---

## Monospace Typefaces

### Geist Mono
- **Foundry:** Vercel
- **Character:** Developer-focused mono with tight metrics and clean tabular figures
- **Best For:** wireframe-mesh, dark-mode-ui, generative-art

### Commit Mono
- **Foundry:** Eigil Nikolajsen
- **Character:** Neutral code mono with smart kerning that avoids typical mono rigidity
- **Best For:** brutalist-web, cellular-automata, glitch

### Monaspace Argon
- **Foundry:** GitHub
- **Character:** Neon-inflected coding font from GitHub's superfamily, variable texture healing
- **Best For:** vaporwave, glitch, wireframe-mesh

---

## Anti-Slop Font Rules

### Never Use
These fonts are over-indexed by AI code generators and instantly signal "undesigned" output:

| Font | Reason |
|---|---|
| Inter | Over-indexed by every AI agent, instantly signals 'generated' |
| Roboto | Android system default, zero personality |
| Open Sans | Google Docs energy, reads as undesigned |
| Poppins | Massively overused in startup templates since 2019 |
| Space Grotesk | AI agents converge on this; it's becoming the new Inter |
| Montserrat | Ubiquitous in free template kits |

### Use With Caution
These fonts are legitimate but overused -- deploy only when the style specifically calls for them:

| Font | Reason |
|---|---|
| Helvetica | Only appropriate for Swiss International Style or deliberate homage |
| Playfair Display | Overused in luxury brand templates; pair carefully |
| DM Sans | Trending toward overuse in 2025-2026 SaaS |

---

## Typography Rules (Universal)

1. Body text is never #000000 -- use off-black (#111, #1a1a1a, #2F3437)
2. Body line-height: 1.5-1.7, never 1.0 or browser default
3. Headings get tight tracking (-0.01em to -0.04em), body gets normal or slightly loose
4. Max line length ~65ch for readability -- constrain with max-width
5. Establish at least 3 type scale tiers with visible contrast between them
6. Typography is the highest-leverage design decision -- the font communicates before a single word is read
