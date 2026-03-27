# CONFLICT MAP
> Generated from visual-styles-taxonomy v2.1.0 | one-of-a-kind-design skill

Comprehensive mapping of style conflicts: hard conflicts (never combine), soft conflicts (conditional combinations), and tag clash rules (automated validation).

---

## Hard Conflicts

These style pairs have fundamentally opposed philosophies. No compromise exists that preserves both identities.

| # | style_a | style_b | reason | clashing_tags |
|---|---|---|---|---|
| 1 | flat-design | skeuomorphism | Fundamentally opposed philosophies -- flat design explicitly rejects the textures, gradients, and realistic materials that define skeuomorphism. | flat / textured, clean / glossy |
| 2 | minimalism-fine-art | rococo | Minimalism eliminates all ornament; Rococo maximizes it. No middle ground exists that preserves either identity. | minimalist / maximalist, sparse / dense |
| 3 | brutalist-web | glassmorphism | Brutalism's raw, opaque, anti-polish aesthetic is incompatible with glassmorphism's refined translucent elegance. | lo-fi / hi-fi, opaque / translucent |
| 4 | pixel-art | hdr-hyperrealism | Pixel art requires visible discrete pixels and limited palettes; HDR demands maximum detail and tonal range. | lo-fi / hi-fi, geometric / photorealistic |
| 5 | de-stijl | art-nouveau | De Stijl permits only right angles and straight lines; Art Nouveau is defined by flowing organic curves. | angular / curvilinear, geometric / organic |
| 6 | swiss-international | psychedelic | Swiss rationality demands grid discipline and type clarity; psychedelic design intentionally dissolves both. | ordered / chaotic, minimalist / maximalist |
| 7 | bauhaus | rococo | Bauhaus eliminates decoration in service of function; Rococo exists purely for decorative excess. | minimalist / maximalist, clean / textured |
| 8 | scandinavian-minimalism | memphis-design | Scandinavian restraint and muted palettes clash with Memphis's clashing colors and anti-tasteful chaos. | muted / saturated, sparse / dense |
| 9 | line-art | hdr-hyperrealism | Line art's stroke-only abstraction is antithetical to HDR's demand for maximum photographic detail. | minimalist / dense, monochromatic / polychromatic |
| 10 | neomorphism | constructivism | Neomorphism's soft monochromatic subtlety is incompatible with constructivism's high-contrast angular dynamism. | monochromatic / high-contrast, sparse / dense |
| 11 | wabi-sabi | material-design | Wabi-sabi's deliberate imperfection and asymmetry fundamentally conflict with Material Design's systematic precision. | organic / ordered, asymmetric / precise |
| 12 | neubrutalism | liquid-glass | Neubrutalism demands opaque, thick-bordered, anti-polish surfaces -- liquid glass is the opposite: translucent, borderless, hyper-polished. | raw / translucent, opaque / clean |
| 13 | suprematism | rococo | Suprematism eliminates all representation in favor of pure geometry; Rococo exists for decorative representation. | abstract / dense, sparse / curvilinear |
| 14 | arte-povera-digital | y2k-revival | Arte Povera rejects industrial polish and celebrates humble materials; Y2K Revival celebrates chrome luxury and synthetic surfaces. | raw / glossy, matte / precious |
| 15 | mono-ha | memphis-design | Mono-ha demands singular material contemplation in vast silence; Memphis floods every surface with clashing color and pattern. | restrained / exuberant, sparse / dense |
| 16 | editorial-minimalism | psychedelic | Editorial minimalism enforces monochrome restraint and hairline borders; psychedelic dissolves all borders in saturated color. | restrained / chaotic, monochromatic / polychromatic |
| 17 | resonant-stark | glitch | Resonant stark achieves emotional presence through calm subtlety; glitch achieves it through aggressive disruption. | ambient / confrontational, restrained / chaotic |

---

## Soft Conflicts

These style pairs can work together under specific conditions and with documented compromises.

| # | style_a | style_b | condition | compromise |
|---|---|---|---|---|
| 1 | glassmorphism | dark-mode-ui | Works if glassmorphism panels use dark-tinted translucency over a controlled dark gradient background. | Limit glassmorphism to overlays/modals with predictable dark background beneath; ensure luminous borders remain visible. |
| 2 | flat-design | isometric | Works if isometric elements are treated as illustration content within a flat UI framework. | Keep UI chrome flat; use isometric only for hero illustrations and explanatory graphics, not interactive elements. |
| 3 | constructivism | duotone | Works if the duotone pair matches constructivism's limited red-black-white palette. | Restrict duotone to red-and-black or red-and-white pairs; apply only to photographic hero elements. |
| 4 | vaporwave | aurora-ui | Works if aurora gradients are shifted to vaporwave's pink-teal spectrum and retro UI chrome is preserved. | Use aurora-style gradients as backgrounds but overlay with retro window chrome and vaporwave typography. |
| 5 | woodcut | flat-design | Works if woodcut is confined to illustration assets while UI components remain flat. | Woodcut illustrations as spot art within flat-design card components; don't apply woodcut texture to UI chrome. |
| 6 | surrealism | swiss-international | Works if surrealism is limited to hero imagery while all UI grid structure follows Swiss principles. | Strict Swiss grid and typography for navigation/content; surrealist imagery contained within grid-aligned image modules. |
| 7 | claymorphism | material-design | Works if claymorphism's inner shadows replace Material's elevation shadows for playful product variants. | Use Material's systematic spacing and component structure but swap shadow model from elevation to clay-style inner shadow. |
| 8 | retro-vintage-print | dark-mode-ui | Works if vintage textures are adapted to dark backgrounds and aged-paper becomes aged-dark-surface. | Invert vintage texture tonality -- dark distressed surfaces instead of light; maintain vintage typography and layout on dark base. |
| 9 | pop-art | minimalism-fine-art | Works if pop art elements are isolated to single-image focal points within vast minimalist negative space. | One bold pop-art element per composition; surrounding space must be completely empty to maintain minimalist identity. |
| 10 | afrofuturism | scandinavian-minimalism | Works if Afrofuturism's geometric patterns are distilled to minimal motifs on clean Scandinavian surfaces. | Reduce cultural pattern density to single-motif accents; use Scandinavian spacing and neutrals as base with jewel-tone accent tokens. |
| 11 | psychedelic | line-art | Works if psychedelic coloring is applied to line-art forms, maintaining linework as the structural foundation. | Use line-art contours filled or stroked with psychedelic gradients; avoid dissolving the line structure into pure color field. |
| 12 | analog-film-grain | material-design | Works if film grain is limited to image content while Material UI surfaces remain clean. | Apply grain only to photographic content blocks; keep Material cards, buttons, and navigation surfaces grain-free. |
| 13 | neubrutalism | flat-design | Works if flat design provides the base component system and neubrutalism adds the thick borders and offset shadows as a skin. | Keep flat design's color system and spacing; overlay neubrutalism's border and shadow treatment on cards and buttons only. |
| 14 | liquid-glass | bento-ui | Works if glass panels are individual bento cells with controlled backgrounds beneath each cell. | Each bento cell gets its own solid or gradient background -- glass effect only on the cell surface, not spanning multiple cells. |
| 15 | solarpunk | wireframe-mesh | Works when wireframe mesh represents the technology layer and solarpunk provides the nature layer. | Split visual language: wireframe for data/tech sections, organic green for content/narrative sections. |
| 16 | deconstructivism | swiss-international | Works if Swiss grid provides the underlying structure that deconstructivism then deliberately violates. | Establish a clear grid first, then break it with intention -- the grid must be legible even in its broken state. |
| 17 | tactile-craft-digital | flat-design | Works if craft textures are confined to illustrations/accents while UI components remain flat and functional. | Buttons, forms, and navigation stay flat and accessible; background textures and decorative elements carry the craft aesthetic. |
| 18 | y2k-revival | glassmorphism | Works if chrome and iridescent effects are applied to glass panels -- Y2K provides the material, glass provides the structure. | Use iridescent/chrome as the color layer visible through glass blur -- limit to hero sections and decorative panels. |

---

## Tag Clash Rules

Automated validation rules for tag compatibility between any two styles.

### Hard Tag Clashes (Never Combine)

| tag_a | tag_b | severity |
|---|---|---|
| flat | dimensional | hard |
| minimalist | maximalist | hard |
| monochromatic | polychromatic | hard |
| angular | curvilinear | hard |
| lo-fi | hi-fi | hard |
| ordered | chaotic | hard |
| raw | glossy | hard |
| tactile | translucent | hard |
| editorial | chaotic | hard |
| restrained | exuberant | hard |
| ambient | confrontational | hard |

### Soft Tag Clashes (Conditional -- Use Resolution)

| tag_a | tag_b | resolution |
|---|---|---|
| clean | noisy | Confine noisy elements to decorative/illustrative zones; keep interactive UI surfaces clean. |
| geometric | organic | Use geometric for UI structure and organic for illustration/imagery content. |
| sparse | dense | Apply sparse layout at page level with dense elements contained in bounded card modules. |
| retro | futuristic | Frame as retro-futurism -- use retro materials and surfaces with futuristic forms and concepts. |
| hand-drawn | precise | Use hand-drawn for illustration and decoration; maintain precision in typography and layout grid. |
| translucent | opaque | Layer translucent elements over opaque base surfaces; don't mix transparency models within the same component. |
| warm | cool | Use one as dominant and the other as accent; avoid equal balance which reads as undecided. |
| glossy | matte | Assign glossy to interactive/accent elements and matte to background surfaces, or vice versa. |
| static | kinetic | Use kinetic elements sparingly as attention-directors within a predominantly static composition. |
| modular | chaotic | Use modular grid as containment vessel -- chaos happens within individual cells, never across the grid structure. |
| ephemeral | precise | Apply precision to layout and typography; confine ephemeral quality to textures, imagery, and animation. |
| vernacular | futuristic | Frame as speculative vernacular -- local craft traditions projected into future contexts (solarpunk pattern). |
