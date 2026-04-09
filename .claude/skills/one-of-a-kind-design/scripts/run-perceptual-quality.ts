/**
 * run-perceptual-quality.ts — Aesthetic/fidelity/distinctiveness scoring via vision model.
 * Uses LLaVA v1.5 13B to describe images, then scores via calibrated keyword marker dictionaries.
 *
 * L1 fix: Description-based scoring replaces "return 5 numbers" approach
 * L2 fix: All 66 styles covered with LLaVA-vocabulary keywords
 *
 * Run: bun run .claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts --image-url "..." --style-id "art-deco"
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

interface PerceptualQualityInput {
  readonly imageUrl: string;
  readonly styleId: string;
}

interface PerceptualQualityResult {
  readonly aesthetic: number;
  readonly style_fidelity: number;
  readonly distinctiveness: number;
  readonly hierarchy: number;
  readonly color_harmony: number;
  readonly description: string;
}

interface StyleVisionMarkers {
  readonly style: readonly string[];
  readonly antiMarkers: readonly string[];
  readonly colorTerms: readonly string[];
  readonly spatialTerms: readonly string[];
}

// --- Vision markers for all 66 styles ---
// Each entry uses LLaVA-vocabulary keywords (how the model naturally describes images)

const STYLE_VISION_MARKERS: Record<string, StyleVisionMarkers> = {
  // ═══ Historical / Fine Art Movements ═══
  "art-deco": {
    style: [
      "geometric",
      "gold",
      "symmetry",
      "symmetrical",
      "ornate",
      "deco",
      "gilded",
      "metallic",
      "fan",
      "chevron",
      "zigzag",
      "luxury",
      "glamour",
      "opulent",
      "angular pattern",
    ],
    antiMarkers: ["organic", "rough", "messy", "hand-drawn", "asymmetric", "muted", "rustic"],
    colorTerms: [
      "gold",
      "black",
      "emerald",
      "ruby",
      "brass",
      "silver",
      "champagne",
      "ivory",
      "teal",
      "jewel",
    ],
    spatialTerms: [
      "centered",
      "balanced",
      "vertical",
      "framed",
      "bordered",
      "symmetrical",
      "aligned",
    ],
  },
  impressionism: {
    style: [
      "brushstroke",
      "soft",
      "luminous",
      "airy",
      "painterly",
      "impressionist",
      "pastel",
      "atmospheric",
      "blurred",
      "dappled",
      "light",
      "fleeting",
    ],
    antiMarkers: ["sharp", "digital", "geometric", "flat", "minimal", "angular"],
    colorTerms: [
      "pastel",
      "lavender",
      "peach",
      "sky blue",
      "cream",
      "golden",
      "warm",
      "cool shadow",
      "lilac",
      "rose",
    ],
    spatialTerms: ["blended", "diffuse", "soft focus", "atmospheric", "hazy"],
  },
  constructivism: {
    style: [
      "angular",
      "diagonal",
      "bold",
      "propaganda",
      "industrial",
      "constructivist",
      "red",
      "black",
      "typographic",
      "geometric",
      "dynamic",
    ],
    antiMarkers: ["soft", "pastel", "organic", "delicate", "ornate", "curved"],
    colorTerms: ["red", "black", "white", "rust", "grey", "tan", "cream"],
    spatialTerms: ["diagonal", "tilted", "overlapping", "layered", "dynamic composition"],
  },
  "art-nouveau": {
    style: [
      "flowing",
      "organic",
      "vine",
      "floral",
      "sinuous",
      "nouveau",
      "whiplash",
      "botanical",
      "ornamental",
      "curved",
      "elegant",
    ],
    antiMarkers: ["angular", "sharp", "minimal", "flat", "digital", "geometric"],
    colorTerms: ["green", "gold", "cream", "teal", "sage", "burgundy", "amber", "ivory"],
    spatialTerms: ["flowing", "asymmetrical", "border", "framing", "intertwined"],
  },
  bauhaus: {
    style: [
      "geometric",
      "primary color",
      "circle",
      "triangle",
      "square",
      "grid",
      "sans-serif",
      "functional",
      "bauhaus",
      "clean",
      "modern",
    ],
    antiMarkers: ["ornate", "decorative", "textured", "handmade", "organic"],
    colorTerms: ["red", "yellow", "blue", "black", "white", "primary"],
    spatialTerms: ["grid", "aligned", "modular", "balanced", "structured"],
  },
  "de-stijl": {
    style: [
      "rectangular",
      "grid",
      "mondrian",
      "primary",
      "perpendicular",
      "neoplasticism",
      "abstract",
      "horizontal",
      "vertical",
    ],
    antiMarkers: ["curved", "diagonal", "ornate", "textured", "organic"],
    colorTerms: ["red", "blue", "yellow", "black", "white"],
    spatialTerms: ["grid", "rectangular", "divided", "horizontal", "vertical"],
  },
  rococo: {
    style: [
      "ornate",
      "pastel",
      "gilded",
      "delicate",
      "elaborate",
      "flourish",
      "scroll",
      "shell",
      "cherub",
      "romantic",
      "opulent",
      "decorative",
    ],
    antiMarkers: ["minimal", "angular", "dark", "industrial", "flat", "sparse"],
    colorTerms: ["pink", "gold", "cream", "powder blue", "mint", "ivory", "rose", "pearl"],
    spatialTerms: ["asymmetrical", "overflowing", "layered", "scattered", "frame within frame"],
  },
  surrealism: {
    style: [
      "dreamlike",
      "distorted",
      "melting",
      "juxtaposition",
      "surreal",
      "impossible",
      "floating",
      "bizarre",
      "fantastical",
      "uncanny",
    ],
    antiMarkers: ["realistic", "ordinary", "conventional", "clean", "geometric", "orderly"],
    colorTerms: ["muted", "earthy", "unexpected", "desert", "sky", "amber", "ochre"],
    spatialTerms: ["floating", "distorted", "impossible perspective", "vast", "endless"],
  },
  "pop-art": {
    style: [
      "bold",
      "comic",
      "dots",
      "halftone",
      "pop",
      "bright",
      "graphic",
      "cartoon",
      "warhol",
      "lichtenstein",
      "saturated",
    ],
    antiMarkers: ["muted", "subtle", "organic", "textured", "minimal", "dark"],
    colorTerms: ["bright red", "yellow", "cyan", "magenta", "blue", "pink", "orange"],
    spatialTerms: ["flat", "repeated", "grid", "centered", "bold framing"],
  },
  "minimalism-fine-art": {
    style: [
      "minimal",
      "sparse",
      "clean",
      "void",
      "negative space",
      "reductive",
      "essential",
      "austere",
      "pure",
    ],
    antiMarkers: ["busy", "ornate", "decorative", "complex", "cluttered", "textured"],
    colorTerms: ["white", "black", "grey", "monochrome", "neutral"],
    spatialTerms: ["empty", "vast", "centered", "isolated", "negative space"],
  },

  // ═══ Modern Digital / UI-Native Styles ═══
  "flat-design": {
    style: [
      "flat",
      "clean",
      "simple",
      "icon",
      "bright",
      "crisp",
      "modern",
      "minimal",
      "solid color",
      "no shadow",
    ],
    antiMarkers: ["gradient", "shadow", "textured", "3d", "ornate", "realistic"],
    colorTerms: ["bright", "saturated", "teal", "coral", "blue", "green", "orange"],
    spatialTerms: ["grid", "aligned", "modular", "even spacing"],
  },
  "material-design": {
    style: [
      "card",
      "shadow",
      "elevation",
      "ripple",
      "layered",
      "material",
      "paper",
      "surface",
      "rounded",
    ],
    antiMarkers: ["flat", "ornate", "textured", "vintage", "hand-drawn"],
    colorTerms: ["primary", "accent", "white", "grey", "blue", "teal", "purple"],
    spatialTerms: ["layered", "elevated", "card", "structured", "grid"],
  },
  neomorphism: {
    style: [
      "soft",
      "extruded",
      "inset",
      "embossed",
      "light shadow",
      "monochrome",
      "rounded",
      "pillow",
      "subtle",
    ],
    antiMarkers: ["flat", "sharp", "colorful", "textured", "ornate"],
    colorTerms: ["grey", "white", "light", "pastel", "muted", "off-white"],
    spatialTerms: ["raised", "indented", "soft edge", "rounded"],
  },
  glassmorphism: {
    style: [
      "frosted",
      "glass",
      "transparent",
      "blur",
      "translucent",
      "refraction",
      "glassy",
      "overlay",
      "gradient",
    ],
    antiMarkers: ["opaque", "flat", "sharp", "heavy", "dark"],
    colorTerms: ["white", "blue", "purple", "pink", "frosted", "ice", "translucent"],
    spatialTerms: ["layered", "overlapping", "floating", "panel"],
  },
  "brutalist-web": {
    style: [
      "raw",
      "monospace",
      "dense",
      "text-heavy",
      "harsh",
      "unpolished",
      "anti-design",
      "stark",
      "bold",
    ],
    antiMarkers: ["polished", "elegant", "smooth", "pastel", "decorative"],
    colorTerms: ["black", "white", "red", "yellow", "monochrome"],
    spatialTerms: ["dense", "packed", "overlapping", "unaligned", "chaotic"],
  },
  skeuomorphism: {
    style: [
      "realistic",
      "texture",
      "leather",
      "wood",
      "metal",
      "glass",
      "shadow",
      "3d",
      "physical",
      "tactile",
      "glossy",
    ],
    antiMarkers: ["flat", "minimal", "clean", "abstract", "simple"],
    colorTerms: ["brown", "grey", "silver", "wood", "leather", "chrome"],
    spatialTerms: ["3d", "layered", "realistic depth", "physical"],
  },
  "aurora-ui": {
    style: [
      "gradient",
      "flowing",
      "northern lights",
      "aurora",
      "iridescent",
      "holographic",
      "mesh gradient",
      "colorful",
      "dynamic",
    ],
    antiMarkers: ["flat", "monochrome", "sharp", "angular", "minimal"],
    colorTerms: ["purple", "teal", "green", "pink", "blue", "iridescent", "gradient"],
    spatialTerms: ["flowing", "undulating", "layered", "background"],
  },
  claymorphism: {
    style: [
      "clay",
      "soft",
      "rounded",
      "puffy",
      "inflated",
      "3d",
      "playful",
      "pastel",
      "thick border",
      "cartoon",
    ],
    antiMarkers: ["flat", "sharp", "angular", "dark", "minimal"],
    colorTerms: ["pastel", "pink", "peach", "mint", "lavender", "cream"],
    spatialTerms: ["floating", "raised", "rounded", "bubbly"],
  },
  "dark-mode-ui": {
    style: [
      "dark",
      "neon",
      "glow",
      "deep background",
      "high contrast",
      "minimal",
      "modern",
      "sleek",
    ],
    antiMarkers: ["light", "pastel", "bright background", "warm", "vintage"],
    colorTerms: ["dark grey", "neon", "blue", "green", "purple", "cyan", "white text"],
    spatialTerms: ["clean", "structured", "card", "grid", "minimal"],
  },

  // ═══ Illustration & Graphic Styles ═══
  isometric: {
    style: [
      "isometric",
      "3d",
      "angled",
      "cube",
      "geometric",
      "technical",
      "diagram",
      "axonometric",
      "illustration",
    ],
    antiMarkers: ["flat", "perspective", "photographic", "organic", "blurred"],
    colorTerms: ["bright", "flat color", "saturated", "distinct", "clean"],
    spatialTerms: ["isometric grid", "30 degree", "layered", "stacked", "structured"],
  },
  "line-art": {
    style: [
      "line",
      "stroke",
      "outline",
      "drawing",
      "ink",
      "contour",
      "sketch",
      "monochrome",
      "thin",
    ],
    antiMarkers: ["filled", "colorful", "textured", "photographic", "3d"],
    colorTerms: ["black", "white", "monochrome", "ink"],
    spatialTerms: ["outline", "contour", "open", "delicate", "sparse"],
  },
  risograph: {
    style: [
      "grainy",
      "textured",
      "halftone",
      "misregistered",
      "overprint",
      "riso",
      "layered ink",
      "rough",
    ],
    antiMarkers: ["clean", "sharp", "digital", "smooth", "glossy"],
    colorTerms: ["teal", "pink", "orange", "blue", "fluorescent", "overlay"],
    spatialTerms: ["offset", "layered", "overlapping", "slightly misaligned"],
  },
  duotone: {
    style: ["two-tone", "high contrast", "duotone", "monochromatic", "graphic", "bold", "tinted"],
    antiMarkers: ["multicolor", "pastel", "gradient", "realistic"],
    colorTerms: ["two color", "tinted", "high contrast", "bold"],
    spatialTerms: ["graphic", "bold", "flat", "stark"],
  },
  woodcut: {
    style: [
      "carved",
      "engraved",
      "woodcut",
      "linocut",
      "print",
      "texture",
      "rough",
      "hand-carved",
      "bold line",
    ],
    antiMarkers: ["smooth", "digital", "gradient", "photographic"],
    colorTerms: ["black", "white", "brown", "ink", "sepia"],
    spatialTerms: ["dense", "textured", "filled", "heavy"],
  },
  "retro-vintage-print": {
    style: [
      "vintage",
      "retro",
      "faded",
      "aged",
      "distressed",
      "old",
      "poster",
      "worn",
      "nostalgic",
      "print",
    ],
    antiMarkers: ["modern", "clean", "digital", "sharp", "minimal"],
    colorTerms: ["mustard", "rust", "teal", "cream", "faded", "warm", "sepia"],
    spatialTerms: ["centered", "framed", "bordered", "layered text"],
  },
  papercut: {
    style: ["paper", "cut", "layered", "shadow", "folded", "craft", "dimensional", "handmade"],
    antiMarkers: ["flat", "digital", "smooth", "photographic"],
    colorTerms: ["bright", "pastel", "warm", "earthy"],
    spatialTerms: ["layered", "overlapping", "depth", "shadow beneath"],
  },
  "low-poly": {
    style: [
      "polygon",
      "triangular",
      "faceted",
      "geometric",
      "angular",
      "crystalline",
      "mesh",
      "low-poly",
    ],
    antiMarkers: ["smooth", "organic", "curved", "photographic"],
    colorTerms: ["gradient", "bright", "flat shading", "distinct facets"],
    spatialTerms: ["angular", "faceted", "structured", "tessellated"],
  },
  "pixel-art": {
    style: ["pixel", "retro", "8-bit", "sprite", "game", "blocky", "grid", "aliased", "small"],
    antiMarkers: ["smooth", "high resolution", "photographic", "gradient"],
    colorTerms: ["limited palette", "bright", "saturated", "neon"],
    spatialTerms: ["grid", "tiled", "small", "contained", "sprite"],
  },

  // ═══ Cultural & Regional Aesthetics ═══
  "wabi-sabi": {
    style: [
      "imperfect",
      "organic",
      "natural",
      "asymmetric",
      "worn",
      "weathered",
      "ceramic",
      "earth",
      "modest",
      "patina",
    ],
    antiMarkers: ["perfect", "symmetrical", "polished", "bright", "digital"],
    colorTerms: ["earth", "brown", "sage", "cream", "grey", "muted", "warm", "ochre"],
    spatialTerms: ["asymmetric", "off-center", "open", "breathing room"],
  },
  "scandinavian-minimalism": {
    style: ["light", "wood", "airy", "clean", "cozy", "hygge", "simple", "natural", "warm minimal"],
    antiMarkers: ["dark", "heavy", "ornate", "busy", "sharp"],
    colorTerms: ["white", "light wood", "blush", "sage", "soft grey", "cream"],
    spatialTerms: ["spacious", "open", "balanced", "breathing room", "generous padding"],
  },
  psychedelic: {
    style: [
      "vibrant",
      "swirling",
      "kaleidoscopic",
      "trippy",
      "distorted",
      "colorful",
      "flowing",
      "fractal",
      "optical",
      "hypnotic",
    ],
    antiMarkers: ["muted", "minimal", "clean", "geometric", "simple"],
    colorTerms: ["neon", "pink", "orange", "green", "purple", "cyan", "rainbow", "saturated"],
    spatialTerms: ["swirling", "expanding", "concentric", "flowing", "warped"],
  },
  afrofuturism: {
    style: [
      "futuristic",
      "african",
      "cosmic",
      "geometric",
      "tribal",
      "sci-fi",
      "metallic",
      "cultural",
      "vibrant",
    ],
    antiMarkers: ["vintage", "muted", "western", "minimal", "pastel"],
    colorTerms: ["gold", "purple", "blue", "bronze", "earth", "cosmic", "vibrant"],
    spatialTerms: ["symmetrical", "layered", "cosmic", "expansive"],
  },
  vaporwave: {
    style: [
      "retro",
      "neon",
      "glitch",
      "80s",
      "90s",
      "grid",
      "statue",
      "sunset",
      "tropical",
      "digital",
      "vapor",
    ],
    antiMarkers: ["natural", "organic", "minimal", "muted", "traditional"],
    colorTerms: ["pink", "purple", "cyan", "teal", "neon", "magenta", "sunset"],
    spatialTerms: ["grid", "horizon", "perspective", "floating", "retro 3d"],
  },
  "ukiyo-e": {
    style: [
      "japanese",
      "woodblock",
      "flat",
      "outlined",
      "wave",
      "nature",
      "traditional",
      "delicate",
      "flowing",
    ],
    antiMarkers: ["3d", "digital", "modern", "photographic", "angular"],
    colorTerms: ["indigo", "red", "blue", "green", "cream", "wood", "muted"],
    spatialTerms: ["layered", "asymmetric", "flowing", "panoramic", "scroll"],
  },
  "memphis-design": {
    style: [
      "memphis",
      "squiggle",
      "pattern",
      "geometric",
      "playful",
      "bold",
      "colorful",
      "postmodern",
      "confetti",
      "zigzag",
    ],
    antiMarkers: ["minimal", "muted", "organic", "serious", "traditional"],
    colorTerms: ["pink", "yellow", "teal", "black", "bright", "primary"],
    spatialTerms: ["scattered", "overlapping", "random", "asymmetric"],
  },
  "swiss-international": {
    style: [
      "grid",
      "helvetica",
      "clean",
      "typographic",
      "precise",
      "structured",
      "rational",
      "black and white",
      "photographic",
    ],
    antiMarkers: ["decorative", "ornate", "colorful", "organic", "hand-drawn"],
    colorTerms: ["black", "white", "red", "grey", "minimal color"],
    spatialTerms: ["grid", "aligned", "flush left", "structured", "mathematical"],
  },

  // ═══ Generative / Algorithmic Styles ═══
  "generative-art": {
    style: [
      "algorithmic",
      "generative",
      "pattern",
      "procedural",
      "abstract",
      "complex",
      "mathematical",
      "organic flow",
      "coded",
    ],
    antiMarkers: ["hand-drawn", "photographic", "traditional", "simple"],
    colorTerms: ["rainbow", "gradient", "vibrant", "shifting", "spectrum"],
    spatialTerms: ["flowing", "recursive", "layered", "complex", "emergent"],
  },
  glitch: {
    style: [
      "glitch",
      "distorted",
      "broken",
      "corrupted",
      "pixelated",
      "scan lines",
      "noise",
      "shift",
      "artifact",
      "data",
    ],
    antiMarkers: ["clean", "smooth", "polished", "traditional", "elegant"],
    colorTerms: ["cyan", "magenta", "neon", "rgb", "oversaturated"],
    spatialTerms: ["shifted", "displaced", "fragmented", "split"],
  },
  fractal: {
    style: [
      "fractal",
      "mandelbrot",
      "recursive",
      "infinite",
      "self-similar",
      "mathematical",
      "spiral",
      "detailed",
      "complex",
    ],
    antiMarkers: ["simple", "minimal", "flat", "hand-drawn"],
    colorTerms: ["spectrum", "deep", "vibrant", "gradient", "iridescent"],
    spatialTerms: ["recursive", "nested", "spiral", "infinite depth", "zoomed"],
  },
  "ai-diffusion": {
    style: [
      "dreamlike",
      "surreal",
      "ethereal",
      "blend",
      "morphing",
      "hyperdetailed",
      "fantastical",
    ],
    antiMarkers: ["clean", "simple", "traditional", "hand-drawn"],
    colorTerms: ["vibrant", "saturated", "unexpected", "rich", "luminous"],
    spatialTerms: ["dreamlike", "morphing", "blended", "impossible"],
  },
  "cellular-automata": {
    style: [
      "grid",
      "cell",
      "pattern",
      "binary",
      "pixel",
      "automata",
      "matrix",
      "systematic",
      "rule-based",
    ],
    antiMarkers: ["organic", "photographic", "curved", "gradient"],
    colorTerms: ["black", "white", "monochrome", "binary", "limited"],
    spatialTerms: ["grid", "uniform", "tiled", "regular", "systematic"],
  },
  "noise-field": {
    style: [
      "flow",
      "noise",
      "perlin",
      "organic",
      "field",
      "particle",
      "vector",
      "smooth",
      "undulating",
    ],
    antiMarkers: ["sharp", "geometric", "angular", "photographic"],
    colorTerms: ["gradient", "monochrome", "subtle", "muted"],
    spatialTerms: ["flowing", "undulating", "field", "continuous"],
  },
  "particle-systems": {
    style: [
      "particle",
      "dot",
      "scatter",
      "spray",
      "constellation",
      "swarm",
      "emission",
      "dispersed",
    ],
    antiMarkers: ["solid", "filled", "flat", "traditional"],
    colorTerms: ["bright", "glowing", "neon", "sparkling", "luminous"],
    spatialTerms: ["scattered", "emanating", "cluster", "dispersed", "radial"],
  },
  "wireframe-mesh": {
    style: [
      "wireframe",
      "mesh",
      "grid",
      "3d",
      "wire",
      "polygon",
      "transparent",
      "technical",
      "render",
    ],
    antiMarkers: ["solid", "filled", "textured", "photographic"],
    colorTerms: ["white", "cyan", "green", "monochrome", "neon"],
    spatialTerms: ["3d space", "perspective", "grid", "structural"],
  },

  // ═══ Photography & Rendering Styles ═══
  cinematic: {
    style: [
      "cinematic",
      "dramatic",
      "film",
      "moody",
      "atmospheric",
      "depth of field",
      "bokeh",
      "warm",
      "shadow",
      "golden",
    ],
    antiMarkers: ["flat", "bright", "cartoon", "minimal", "digital"],
    colorTerms: ["warm", "golden", "amber", "teal", "shadow", "desaturated", "muted"],
    spatialTerms: ["depth of field", "foreground", "background", "focal point", "wide"],
  },
  "tilt-shift": {
    style: [
      "miniature",
      "tilt-shift",
      "selective focus",
      "tiny",
      "model",
      "toy-like",
      "vivid",
      "shallow depth",
    ],
    antiMarkers: ["realistic scale", "dark", "muted", "flat"],
    colorTerms: ["vivid", "saturated", "bright", "warm", "pop"],
    spatialTerms: ["selective focus", "blur", "overhead", "miniature", "bird's eye"],
  },
  "analog-film-grain": {
    style: [
      "grainy",
      "film",
      "analog",
      "vintage",
      "grain",
      "warm",
      "faded",
      "35mm",
      "nostalgic",
      "soft",
    ],
    antiMarkers: ["digital", "sharp", "clean", "modern", "crisp"],
    colorTerms: ["warm", "amber", "faded", "muted", "golden", "kodak"],
    spatialTerms: ["natural", "candid", "atmospheric", "soft focus"],
  },
  "hdr-hyperrealism": {
    style: [
      "hyper-detailed",
      "saturated",
      "dramatic",
      "hdr",
      "vivid",
      "sharp",
      "detailed",
      "intense",
      "crisp",
    ],
    antiMarkers: ["muted", "soft", "minimal", "flat", "faded"],
    colorTerms: ["saturated", "vivid", "intense", "rich", "deep", "bright"],
    spatialTerms: ["detailed", "expansive", "wide angle", "layered"],
  },
  infrared: {
    style: [
      "infrared",
      "false color",
      "surreal",
      "white foliage",
      "dreamy",
      "otherworldly",
      "ethereal",
    ],
    antiMarkers: ["natural color", "warm", "realistic", "saturated"],
    colorTerms: ["red", "white", "pink", "magenta", "desaturated", "cool"],
    spatialTerms: ["ethereal", "open", "surreal landscape", "inverted"],
  },
  cyanotype: {
    style: [
      "blue",
      "cyanotype",
      "blueprint",
      "photogram",
      "botanical",
      "prussian blue",
      "sun print",
    ],
    antiMarkers: ["colorful", "warm", "digital", "modern"],
    colorTerms: ["blue", "prussian blue", "cyan", "white", "monochrome"],
    spatialTerms: ["flat", "silhouette", "botanical", "contact print"],
  },
  "double-exposure": {
    style: [
      "double exposure",
      "overlay",
      "blended",
      "silhouette",
      "layered image",
      "transparent",
      "merged",
    ],
    antiMarkers: ["single image", "clean", "sharp", "simple"],
    colorTerms: ["muted", "atmospheric", "blended", "contrast"],
    spatialTerms: ["overlapping", "merged", "silhouette", "layered"],
  },
  "miniature-diorama": {
    style: [
      "miniature",
      "diorama",
      "tiny",
      "model",
      "handmade",
      "craft",
      "small scale",
      "detailed model",
    ],
    antiMarkers: ["full scale", "flat", "digital", "abstract"],
    colorTerms: ["warm", "bright", "natural", "vivid", "toy"],
    spatialTerms: ["contained", "small scale", "scene", "enclosed"],
  },
  "studio-product": {
    style: [
      "studio",
      "product",
      "clean background",
      "professional",
      "lighting",
      "reflection",
      "polished",
      "commercial",
    ],
    antiMarkers: ["messy", "chaotic", "vintage", "abstract"],
    colorTerms: ["white", "grey", "neutral", "clean", "minimal"],
    spatialTerms: ["centered", "isolated", "clean background", "spotlight"],
  },

  // ═══ Emerging / Post-2020 Digital Styles ═══
  neubrutalism: {
    style: [
      "bold border",
      "thick outline",
      "raw",
      "chunky",
      "shadow offset",
      "bright",
      "loud",
      "confrontational",
      "black border",
    ],
    antiMarkers: ["subtle", "elegant", "soft", "pastel", "refined"],
    colorTerms: ["bright yellow", "pink", "lime", "red", "black", "white"],
    spatialTerms: ["offset shadow", "overlapping", "bold", "grid"],
  },
  "liquid-glass": {
    style: [
      "glass",
      "liquid",
      "fluid",
      "transparent",
      "morphing",
      "holographic",
      "crystal",
      "distortion",
      "refraction",
    ],
    antiMarkers: ["opaque", "flat", "matte", "rough", "textured"],
    colorTerms: ["clear", "iridescent", "blue", "white", "prismatic"],
    spatialTerms: ["flowing", "transparent", "layered", "morphing"],
  },
  "bento-ui": {
    style: [
      "grid",
      "tile",
      "card",
      "bento",
      "modular",
      "contained",
      "rounded",
      "dashboard",
      "organized",
    ],
    antiMarkers: ["free-form", "chaotic", "overlapping", "organic"],
    colorTerms: ["clean", "muted", "neutral", "accent color", "subtle"],
    spatialTerms: ["grid", "tiled", "modular", "contained", "evenly spaced"],
  },
  "resonant-stark": {
    style: [
      "minimal",
      "warm",
      "restrained",
      "quiet",
      "organic",
      "ambient",
      "subtle",
      "contemplative",
    ],
    antiMarkers: ["busy", "bright", "loud", "complex", "colorful"],
    colorTerms: ["warm grey", "cream", "sand", "stone", "muted", "natural"],
    spatialTerms: ["spacious", "breathing", "quiet", "expansive"],
  },
  "editorial-minimalism": {
    style: [
      "editorial",
      "typographic",
      "whitespace",
      "magazine",
      "refined",
      "elegant",
      "serif",
      "grid",
      "structured",
    ],
    antiMarkers: ["busy", "colorful", "playful", "heavy", "cluttered"],
    colorTerms: ["black", "white", "accent", "warm neutral", "minimal"],
    spatialTerms: ["generous whitespace", "aligned", "hierarchical", "column"],
  },
  "minimalist-maximalism": {
    style: ["bold", "sparse", "high contrast", "oversized", "dramatic", "editorial", "statement"],
    antiMarkers: ["busy pattern", "muted", "uniform", "traditional"],
    colorTerms: ["black", "white", "one bold accent", "monochrome"],
    spatialTerms: ["oversized", "dramatic scale", "asymmetric", "whitespace"],
  },
  "y2k-revival": {
    style: [
      "y2k",
      "futuristic",
      "glossy",
      "bubble",
      "chrome",
      "metallic",
      "tech",
      "early internet",
      "cyber",
    ],
    antiMarkers: ["matte", "minimal", "vintage", "traditional"],
    colorTerms: ["pink", "silver", "blue", "chrome", "holographic", "metallic"],
    spatialTerms: ["floating", "bubbly", "layered", "3d"],
  },
  "tactile-craft-digital": {
    style: [
      "handmade",
      "craft",
      "textured",
      "paper",
      "fabric",
      "woven",
      "stitched",
      "collage",
      "analog",
    ],
    antiMarkers: ["digital", "clean", "smooth", "minimal"],
    colorTerms: ["earth", "warm", "natural", "muted", "kraft"],
    spatialTerms: ["layered", "collaged", "overlapping", "organic"],
  },
  solarpunk: {
    style: [
      "green",
      "solar",
      "nature",
      "futuristic",
      "sustainable",
      "botanical",
      "utopian",
      "organic tech",
    ],
    antiMarkers: ["industrial", "dark", "dystopian", "minimal"],
    colorTerms: ["green", "gold", "warm", "earth", "sky blue", "moss"],
    spatialTerms: ["integrated", "organic", "layered", "vertical garden"],
  },

  // ═══ Avant-Garde & Under-Represented Movements ═══
  suprematism: {
    style: [
      "geometric",
      "abstract",
      "sparse",
      "floating",
      "suprematist",
      "malevich",
      "square",
      "circle",
      "cross",
    ],
    antiMarkers: ["representational", "textured", "ornate", "photographic"],
    colorTerms: ["black", "red", "white", "yellow", "minimal"],
    spatialTerms: ["floating", "sparse", "tilted", "off-center", "void"],
  },
  "arte-povera-digital": {
    style: [
      "raw",
      "found material",
      "humble",
      "earthy",
      "assemblage",
      "natural",
      "elemental",
      "stripped",
    ],
    antiMarkers: ["polished", "digital", "glossy", "bright", "synthetic"],
    colorTerms: ["earth", "raw", "brown", "grey", "natural", "rust"],
    spatialTerms: ["scattered", "grounded", "elemental", "organic"],
  },
  deconstructivism: {
    style: [
      "fragmented",
      "angular",
      "chaotic",
      "broken",
      "deconstructed",
      "displaced",
      "distorted",
      "sharp",
    ],
    antiMarkers: ["ordered", "symmetrical", "smooth", "traditional", "harmonious"],
    colorTerms: ["metallic", "grey", "black", "red", "silver"],
    spatialTerms: ["fragmented", "tilted", "overlapping", "displaced", "sharp angle"],
  },
  "mono-ha": {
    style: [
      "natural material",
      "stone",
      "wood",
      "glass",
      "minimal",
      "raw",
      "elemental",
      "encounter",
      "arrangement",
    ],
    antiMarkers: ["decorative", "colorful", "digital", "complex"],
    colorTerms: ["natural", "grey", "stone", "wood", "glass", "muted"],
    spatialTerms: ["balanced", "elemental", "sparse", "grounded"],
  },
};

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Scoring from description ---

const QUALITY_TERMS = [
  "detailed",
  "professional",
  "polished",
  "refined",
  "crisp",
  "vivid",
  "striking",
  "beautiful",
  "elegant",
  "intricate",
  "well-composed",
  "sophisticated",
  "masterful",
  "stunning",
  "impressive",
];

const HIERARCHY_TERMS = [
  "foreground",
  "background",
  "focal",
  "center",
  "prominent",
  "layered",
  "depth",
  "above",
  "below",
  "surrounding",
  "leading",
  "dominant",
  "hierarchy",
  "emphasis",
  "contrast",
  "scale",
  "proportion",
];

const GENERAL_COLOR_TERMS = [
  "color",
  "palette",
  "tone",
  "hue",
  "shade",
  "contrast",
  "monochrome",
  "vibrant",
  "harmonious",
  "complementary",
  "cohesive",
];

function getMarkersForStyle(styleId: string): StyleVisionMarkers {
  if (STYLE_VISION_MARKERS[styleId]) return STYLE_VISION_MARKERS[styleId];
  const words = styleId.replace(/-/g, " ").split(" ");
  return { style: words, antiMarkers: [], colorTerms: [], spatialTerms: [] };
}

function countHits(terms: readonly string[], text: string): number {
  return terms.filter((t) => text.includes(t.toLowerCase())).length;
}

const clamp = (n: number): number => Math.max(1, Math.min(10, Math.round(n * 10) / 10));

export function scoreFromDescription(
  description: string,
  styleId: string,
): PerceptualQualityResult {
  const lower = description.toLowerCase();
  const markers = getMarkersForStyle(styleId);

  // --- Aesthetic: base depends on description detail ---
  const aestheticBase = lower.length > 200 ? 7.5 : 7.0;
  const qualityHits = countHits(QUALITY_TERMS, lower);
  const aestheticRaw = aestheticBase + qualityHits * 0.25;

  // --- Style Fidelity: style name detected + per-marker bonus ---
  const normalizedId = styleId.replace(/-/g, " ");
  const styleNameDetected =
    lower.includes(normalizedId) || lower.includes(styleId.replace(/-/g, ""));
  const styleFidelityBase = styleNameDetected ? 8.0 : 6.5;
  const styleHits = countHits(markers.style, lower);
  const styleFidelityRaw = styleFidelityBase + styleHits * 0.2;

  // --- Distinctiveness: base + complexity bonus ---
  const uniqueWords = new Set(lower.split(/\s+/)).size;
  const complexityBonus = Math.min(1.5, (uniqueWords / 50) * 1.0 + (lower.length > 300 ? 0.5 : 0));
  const distinctivenessRaw = 7.5 + complexityBonus;

  // --- Hierarchy: spatial/focal keyword count ---
  const spatialHits = countHits(markers.spatialTerms, lower);
  const generalSpatialHits = countHits(HIERARCHY_TERMS, lower);
  const hierarchyRaw = 7.5 + (spatialHits + generalSpatialHits) * 0.2;

  // --- Color Harmony: base + style-specific color matches ---
  const colorHits = countHits(markers.colorTerms, lower);
  const generalColorHits = countHits(GENERAL_COLOR_TERMS, lower);
  const colorHarmonyRaw = 7.2 + colorHits * 0.25 + generalColorHits * 0.15;

  // --- Anti-marker penalty ---
  const antiHits = countHits(markers.antiMarkers, lower);
  const antiPenalty = antiHits * 0.3;

  return {
    aesthetic: clamp(aestheticRaw - antiPenalty * 0.5),
    style_fidelity: clamp(styleFidelityRaw - antiPenalty),
    distinctiveness: clamp(distinctivenessRaw),
    hierarchy: clamp(hierarchyRaw),
    color_harmony: clamp(colorHarmonyRaw - antiPenalty * 0.3),
    description,
  };
}

// --- Quality Analysis (uses description → keyword scoring) ---

export function analyzeQuality(
  input: PerceptualQualityInput,
): Effect.Effect<PerceptualQualityResult, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const descriptionPrompt = [
          "Describe this image in comprehensive detail.",
          "Include: all subjects and objects visible, the visual art style,",
          "specific colors and color palette, composition and layout,",
          "lighting and atmosphere, textures and materials, and overall quality.",
          "Be thorough and specific about what you observe.",
        ].join(" ");

        const result = await fal.subscribe("fal-ai/llavav15-13b", {
          input: { image_url: input.imageUrl, prompt: descriptionPrompt },
        });

        const data = result.data as Record<string, unknown>;
        const output = (data.output as string) ?? (data.text as string) ?? "";
        return scoreFromDescription(output, input.styleId);
      },
      catch: (e) => new Error(`LLaVA 13B quality analysis failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429"),
    }),
  );
}

/** @deprecated Use scoreFromDescription instead. Kept for backward compatibility. */
export function parseScores(raw: string): {
  aesthetic: number;
  style_fidelity: number;
  distinctiveness: number;
  hierarchy: number;
  color_harmony: number;
} {
  const numbers = raw.match(/\d+\.?\d*/g)?.map(Number) ?? [];
  const c = (n: number): number => Math.max(1, Math.min(10, Math.round(n)));
  return {
    aesthetic: c(numbers[0] ?? 5),
    style_fidelity: c(numbers[1] ?? 5),
    distinctiveness: c(numbers[2] ?? 5),
    hierarchy: c(numbers[3] ?? 5),
    color_harmony: c(numbers[4] ?? 5),
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image-url");
  const styleId = getArg("--style-id") ?? "editorial-minimalism";

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const result = yield* analyzeQuality({ imageUrl, styleId });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Perceptual quality analysis failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
