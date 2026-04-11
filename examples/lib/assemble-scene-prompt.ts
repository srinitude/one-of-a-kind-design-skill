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
    materials: ["ceramic", "lacquered wood", "copper", "hand-thrown pottery"],
    props: ["signature dish", "chef's knife", "steam rising", "condensation"],
    environments: ["kitchen counter", "prep station", "dining counter"],
    heroObject: "the surface where food is served",
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
    materials: ["living moss", "reclaimed wood", "glacial ice", "rich soil"],
    props: ["seedling", "growth cycle", "satellite data abstracted"],
    environments: ["greenhouse", "forest floor", "research station"],
    heroObject: "the moment of transformation — decay becoming growth",
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
  if (input.sceneTemplate) {
    parts.push(input.sceneTemplate);
  } else if (input.subjects.length > 0) {
    parts.push(input.subjects.join(" and "));
  } else if (vocab) {
    parts.push(vocab.heroObject);
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

  // 10. QUALITY
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
