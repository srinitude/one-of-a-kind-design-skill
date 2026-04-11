/**
 * assemble-scene-prompt.ts — Builds a generation prompt from resolved scene slots.
 *
 * Each slot is filled from (in priority order):
 * 1. User's explicit input (highest priority)
 * 2. Scene template from taxonomy (style-specific)
 * 3. Industry vocabulary (industry-specific defaults)
 * 4. Style defaults (generic style tokens)
 *
 * The assembled prompt follows this order:
 * SUBJECT + ENVIRONMENT + PROPS + MATERIALS + LIGHTING + CAMERA + PALETTE + ATMOSPHERE + TIME + COMPOSITION + QUALITY
 *
 * This produces prompts that are SPECIFIC to both the style AND the business.
 */

// --- Industry Vocabularies ---

interface IndustryVocab {
  readonly materials: string[];
  readonly props: string[];
  readonly environments: string[];
  readonly heroObject: string;
}

const INDUSTRY_VOCAB: Record<string, IndustryVocab> = {
  architecture: {
    materials: ["reclaimed timber", "poured concrete", "corten steel"],
    props: ["architectural model", "blueprint fragment", "joint detail"],
    environments: ["studio with material samples", "construction site"],
    heroObject: "the joint where two materials meet",
  },
  food: {
    materials: ["hand-thrown ceramic", "lacquered hinoki wood", "hammered copper"],
    props: ["steam rising from broth", "condensation on cold glass", "a single perfect ingredient"],
    environments: ["intimate counter with 8 seats", "open kitchen pass", "seasonal ingredient display"],
    heroObject: "a single ceramic bowl with steam rising, the glaze catching warm light",
  },
  ramen: {
    materials: ["rough unglazed ceramic", "worn hinoki counter", "bamboo"],
    props: ["thick wheat noodles lifted by chopsticks", "soft-boiled egg halved", "nori sheet", "chashu pork"],
    environments: ["8-seat counter with steam", "behind the noren curtain"],
    heroObject: "a bowl of ramen with noodles lifted by chopsticks, steam rising between them, the broth surface reflecting a single warm overhead light",
  },
  "molecular-gastronomy": {
    materials: ["lab glass", "pipette", "stainless steel", "edible gel"],
    props: ["a spherified drop mid-air", "foam dissolving on a mirror plate", "tweezers placing a micro herb"],
    environments: ["laboratory-kitchen hybrid", "plating station under surgical light"],
    heroObject: "a single spherified droplet of liquid suspended mid-air above a mirror-black plate, the droplet refracting the surgical overhead light like a lens",
  },
  music: {
    materials: ["lacquered piano", "brass", "vinyl", "worn leather"],
    props: ["bourbon glass", "sheet music", "microphone", "record sleeve"],
    environments: ["club interior", "recording studio", "stage"],
    heroObject: "the instrument surface someone just touched",
  },
  crypto: {
    materials: ["dark glass", "brushed aluminum", "LED-lit edges"],
    props: ["abstract data pattern", "geometric light form", "screen glow"],
    environments: ["dark minimal workspace", "abstract void"],
    heroObject: "a single luminous data structure floating in darkness",
  },
  funeral: {
    materials: ["limestone", "aged wood", "frosted glass", "polished brass"],
    props: ["soft diffused light", "single stem", "water reflection"],
    environments: ["chapel threshold", "contemplation room", "garden"],
    heroObject: "light itself entering the space",
  },
  children: {
    materials: ["paper", "crayon texture", "painted wood", "fabric"],
    props: ["open storybook", "stacked blocks", "paper cutout characters"],
    environments: ["reading nook", "pillow fort", "treehouse corner"],
    heroObject: "an open book with illustrations spilling out",
  },
  perfume: {
    materials: ["glass flacon detail", "liquid amber", "dried botanicals"],
    props: ["raw ingredient", "smoke tendril from incense", "single droplet"],
    environments: ["perfumer's organ", "ingredient garden", "laboratory"],
    heroObject: "the raw ingredient that IS the scent",
  },
  photography: {
    materials: ["film negative", "contact sheet", "darkroom chemicals"],
    props: ["prints on a line", "light table", "film canister", "loupe"],
    environments: ["darkroom", "editing desk", "field"],
    heroObject: "a single frame from the work",
  },
  sustainability: {
    materials: ["living moss on reclaimed wood", "mycelium texture", "weathered driftwood"],
    props: ["seedling pushing through cracked earth", "cross-section of old-growth tree rings", "morning dew on leaf"],
    environments: ["greenhouse interior with condensation", "rewilded forest floor", "carbon sink wetland"],
    heroObject: "a seedling pushing through cracked dry earth, the crack pattern radiating outward like a map of the carbon cycle",
  },
  tech: {
    materials: ["matte black surface", "ambient LED edge", "frosted glass"],
    props: ["abstract interface element", "data flow visualization"],
    environments: ["dark workspace", "abstract digital space"],
    heroObject: "a single glowing interface element in darkness",
  },
  "real-estate": {
    materials: ["marble", "hardwood", "floor-to-ceiling glass"],
    props: ["architectural light shaft", "skyline reflection"],
    environments: ["penthouse", "lobby", "rooftop terrace"],
    heroObject: "the view — framed by architecture",
  },
  hospitality: {
    materials: ["linen", "natural stone", "aged wood", "rattan"],
    props: ["folded towel", "room key", "wine glass"],
    environments: ["suite threshold", "infinity pool edge", "lobby desk"],
    heroObject: "the first thing a guest touches",
  },
  fitness: {
    materials: ["rubber", "steel", "chalk dust", "sweat on surface"],
    props: ["barbell detail", "chalk handprint", "timer display"],
    environments: ["gym floor", "boxing ring corner", "starting block"],
    heroObject: "the equipment surface showing use",
  },
};

// --- Style Rendering Override ---
// For non-photorealistic styles, Flux needs explicit rendering instructions
const STYLE_RENDER: Record<string, string> = {
  claymorphism: "3D clay render, soft rounded forms, pastel matte material, Blender-style clay shader, NOT a photograph",
  "liquid-glass": "translucent glass-like material, refractive caustics, liquid transparency, see-through iridescent surface",
  glassmorphism: "frosted glass layers with blur and transparency, light bleeding through translucent panels",
  "pixel-art": "pixel art style, 16-bit retro game aesthetic, visible square pixels, NOT photorealistic",
  "risograph": "risograph print texture, limited ink colors with halftone dots, slight misregistration between color layers",
  "woodcut": "woodcut print style, bold black lines carved into wood, limited color with visible wood grain texture",
  "papercut": "layered paper cutout art, visible paper edges and shadows between layers, handcraft aesthetic",
  vaporwave: "vaporwave aesthetic, 80s/90s digital gradient, Roman busts, grid planes, sunset palette, retro-digital",
  afrofuturism: "Afrofuturist aesthetic, gold and indigo, geometric African patterns, sci-fi ceremonial, speculative design",
};

// --- Style Lighting Defaults ---

const STYLE_LIGHTING: Record<string, string> = {
  "wabi-sabi": "amber raking sidelight revealing surface texture",
  cinematic: "single practical overhead through atmospheric haze",
  "brutalist-web": "harsh overhead fluorescent on raw surface",
  "swiss-international": "soft diffused morning light through tall windows",
  "dark-mode-ui": "subtle rim light on dark surfaces, deep shadows",
  claymorphism: "soft diffused studio light, no harsh shadows",
  "liquid-glass": "refracted caustic light through translucent material",
  "art-nouveau": "dappled golden light through organic forms",
  "retro-vintage-print": "warm tungsten with slight color shift",
  glitch: "neon spill and scan line artifacts as light source",
  "editorial-minimalism": "clean directional light, controlled shadows",
  "scandinavian-minimalism": "soft north-facing window light, cool and even",
  afrofuturism: "gold and indigo split lighting, dramatic",
  glassmorphism: "backlit frosted surface with color bleed",
  "studio-product": "three-point studio lighting, clean and precise",
};

// --- Style Camera Defaults ---

const STYLE_CAMERA: Record<string, string> = {
  "wabi-sabi": "extreme close-up macro, shallow DOF",
  cinematic: "medium shot, anamorphic shallow DOF, film grain",
  "brutalist-web": "straight-on documentary framing",
  "swiss-international": "clean architectural framing, generous margins",
  "dark-mode-ui": "tight framing in darkness, selective focus",
  claymorphism: "slightly elevated angle, soft focus edges",
  "liquid-glass": "through-material perspective, refractive distortion",
  "art-nouveau": "medium close-up with organic framing elements",
  "retro-vintage-print": "slightly tilted, imperfect framing, vintage lens",
  glitch: "data-corrupted perspective, fragmented frame",
  "editorial-minimalism": "centered with mathematical precision",
  "scandinavian-minimalism": "eye-level, calm, geometric",
  afrofuturism: "low angle looking up, powerful perspective",
  glassmorphism: "shallow DOF through layered translucent planes",
  "studio-product": "hero angle with controlled negative space",
};

// --- Prompt Assembly ---

interface AssemblyInput {
  readonly intent: string;
  readonly styleId: string;
  readonly industry: string | null;
  readonly subjects: string[];
  readonly moods: string[];
  readonly constraints: string[];
  readonly sceneTemplate: string | null;
  readonly palette: string;
}

export function assembleScenePrompt(input: AssemblyInput): string {
  const vocab = input.industry
    ? INDUSTRY_VOCAB[input.industry] ?? null
    : null;

  const parts: string[] = [];

  // 1. SUBJECT — the most important part
  // Industry heroObject wins over generic style template
  if (vocab && vocab.heroObject) {
    parts.push(vocab.heroObject);
  } else if (input.subjects.length > 0) {
    parts.push(input.subjects.join(" and "));
  } else if (input.sceneTemplate) {
    parts.push(input.sceneTemplate);
  } else {
    parts.push(extractCoreConcept(input.intent));
  }

  // 2. ENVIRONMENT
  if (vocab) {
    parts.push(`in a ${vocab.environments[0]}`);
  }

  // 3. PROPS (industry-specific objects)
  if (vocab && vocab.props.length > 0) {
    const prop = vocab.props[0];
    if (!parts[0]?.includes(prop)) {
      parts.push(`with ${prop} nearby`);
    }
  }

  // 4. MATERIALS
  if (vocab && vocab.materials.length > 0) {
    parts.push(`${vocab.materials.slice(0, 2).join(" and ")} surfaces`);
  }

  // 5. LIGHTING
  const lighting = STYLE_LIGHTING[input.styleId] ?? "natural light";
  parts.push(lighting);

  // 6. CAMERA
  const camera = STYLE_CAMERA[input.styleId] ?? "medium shot";
  parts.push(camera);

  // 7. PALETTE
  if (input.palette) {
    parts.push(`palette: ${input.palette}`);
  }

  // 8. ATMOSPHERE
  if (input.moods.some((m) => ["smoky", "hazy"].includes(m))) {
    parts.push("atmospheric haze");
  }

  // 9. CONSTRAINTS (negative)
  for (const c of input.constraints.slice(0, 2)) {
    parts.push(c);
  }

  // 10. STYLE RENDERING (for non-photorealistic styles)
  const renderOverride = STYLE_RENDER[input.styleId];
  if (renderOverride) {
    parts.push(renderOverride);
  }

  // 11. QUALITY
  parts.push("sharp, detailed");

  return parts.join(", ");
}

function extractCoreConcept(intent: string): string {
  return intent
    .replace(
      /\b(design|create|build|make|for|a|an|the|my|our|we need|i need)\b/gi,
      "",
    )
    .replace(
      /\b(website|site|landing page|app|screen|poster|cover)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
