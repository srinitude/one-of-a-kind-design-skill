/**
 * generate-assets.ts — One-off generator script that reads the taxonomy YAML
 * and produces 66 Tailwind presets, 7 motion presets, and 66 Figma token sets.
 *
 * Run from project root: bun run generate-assets.ts
 */
import { parse as parseYaml } from "yaml";

const TAXONOMY_PATH = "./TAXONOMY.yaml";
const SKILL_DIR = ".";

// --- Load Taxonomy ---

const taxonomy = parseYaml(await Bun.file(TAXONOMY_PATH).text()) as Record<string, unknown>;
const categories = taxonomy.categories as Array<Record<string, unknown>>;
const implementation = taxonomy.implementation as Record<string, unknown> | undefined;
const implIntel = taxonomy.implementation_intelligence as Record<string, unknown> | undefined;

// Collect all styles
interface StyleEntry {
  id: string;
  name: string;
  category: string;
  dsp: Record<string, string>;
  tags: string[];
  genAi: Record<string, unknown>;
}

const styles: StyleEntry[] = [];
for (const cat of categories) {
  const catStyles = cat.styles as Array<Record<string, unknown>>;
  for (const s of catStyles) {
    styles.push({
      id: s.id as string,
      name: s.name as string,
      category: cat.category_name as string,
      dsp: (s.design_system_parameters ?? {}) as Record<string, string>,
      tags: (s.tags ?? []) as string[],
      genAi: (s.generative_ai ?? {}) as Record<string, unknown>,
    });
  }
}

// Collect style profiles
type ProfileMap = Record<string, Record<string, unknown>>;
const styleProfiles: ProfileMap = {};
if (implementation?.style_profiles) {
  for (const p of implementation.style_profiles as Array<Record<string, unknown>>) {
    styleProfiles[p.style_id as string] = p;
  }
}

const styleImpls: ProfileMap = {};
if (implIntel?.style_implementations) {
  for (const p of implIntel.style_implementations as Array<Record<string, unknown>>) {
    styleImpls[p.style_id as string] = p;
  }
}

// Collect motion vocabulary
const motionVocab = (implementation?.motion_vocabulary ?? {}) as Record<
  string,
  Record<string, unknown>
>;

console.log(`Found ${styles.length} styles, ${Object.keys(motionVocab).length} motion signatures`);

// --- Color Palette Mapping ---

function paletteToTokens(paletteType: string, styleId: string): Record<string, string> {
  const palettes: Record<string, Record<string, string>> = {
    "jewel tones with gold and black accents": {
      primary: "#C9A84C",
      secondary: "#1A1A1A",
      accent: "#8B0000",
      surface: "#0D0D0D",
      "on-surface": "#F5F0E8",
      muted: "#2A2420",
    },
    "soft pastels with warm highlights and cool shadows": {
      primary: "#E8B4B8",
      secondary: "#A8C4D8",
      accent: "#F0D58C",
      surface: "#FDF8F4",
      "on-surface": "#3D3835",
      muted: "#D4C5BE",
    },
    "red, black, white, occasional ochre": {
      primary: "#CC0000",
      secondary: "#000000",
      accent: "#CC8800",
      surface: "#FFFFFF",
      "on-surface": "#000000",
      muted: "#666666",
    },
    default: {
      primary: "#2563EB",
      secondary: "#1E293B",
      accent: "#F59E0B",
      surface: "#FFFFFF",
      "on-surface": "#111111",
      muted: "#64748B",
    },
  };

  const impl = styleImpls[styleId];
  const antiSlop = (impl?.anti_slop_overrides ?? []) as string[];

  // Check for specific color overrides
  for (const rule of antiSlop) {
    const goldMatch = rule.match(/#[0-9A-Fa-f]{6}/);
    if (goldMatch && rule.toLowerCase().includes("gold")) {
      const base = palettes[paletteType] ?? palettes.default;
      return { ...base, primary: goldMatch[0] };
    }
  }

  return palettes[paletteType] ?? palettes.default;
}

// --- Generate Tailwind Presets ---

async function generateTailwindPresets() {
  let count = 0;
  for (const style of styles) {
    const tokens = paletteToTokens(style.dsp.color_palette_type ?? "", style.id);
    const radius = style.dsp.border_radii ?? "8px";
    const shadow = style.dsp.shadow_model ?? "none";
    const typography = style.dsp.typography_family ?? "system-ui, sans-serif";

    const content = `/* ${style.name} — Tailwind v4 @theme preset
 * Category: ${style.category}
 * Tags: ${style.tags.join(", ")}
 * Generated from TAXONOMY v2.0
 */

@theme inline {
  --color-primary: ${tokens.primary};
  --color-secondary: ${tokens.secondary};
  --color-accent: ${tokens.accent};
  --color-surface: ${tokens.surface};
  --color-on-surface: ${tokens["on-surface"]};
  --color-muted: ${tokens.muted};

  --font-display: ${typography};
  --font-body: ${typography};

  --radius-sm: ${parseRadius(radius, 0.5)};
  --radius-md: ${parseRadius(radius, 1)};
  --radius-lg: ${parseRadius(radius, 1.5)};
  --radius-full: 9999px;

  --shadow-sm: ${parseShadow(shadow, "sm")};
  --shadow-md: ${parseShadow(shadow, "md")};
  --shadow-lg: ${parseShadow(shadow, "lg")};

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  --spacing-xl: 64px;
}
`;

    await Bun.write(`${SKILL_DIR}/assets/tailwind-presets/${style.id}.css`, content);
    count++;
  }
  console.log(`Generated ${count} Tailwind presets`);
}

function parseRadius(spec: string, multiplier: number): string {
  const match = spec.match(/(\d+)/);
  if (!match) return `${Math.round(8 * multiplier)}px`;
  const base = parseInt(match[1], 10);
  return `${Math.round(base * multiplier)}px`;
}

function parseShadow(model: string, size: "sm" | "md" | "lg"): string {
  const lower = model.toLowerCase();
  if (lower.includes("none") || lower === "none") return "none";
  if (lower.includes("metallic") || lower.includes("bevel")) {
    const offsets = { sm: "1px 1px", md: "2px 2px", lg: "4px 4px" };
    return `${offsets[size]} 0 0 rgba(201, 168, 76, 0.3)`;
  }
  if (lower.includes("diffused") || lower.includes("blur")) {
    const blurs = { sm: "4px", md: "12px", lg: "24px" };
    return `0 2px ${blurs[size]} rgba(0, 0, 0, 0.08)`;
  }
  if (lower.includes("hard") || lower.includes("drop")) {
    const offsets = { sm: "2px 2px", md: "4px 4px", lg: "8px 8px" };
    return `${offsets[size]} 0 rgba(0, 0, 0, 0.15)`;
  }
  const blurs = { sm: "2px", md: "8px", lg: "16px" };
  return `0 1px ${blurs[size]} rgba(0, 0, 0, 0.1)`;
}

// --- Generate Motion Presets ---

async function generateMotionPresets() {
  const signatures: Record<string, Record<string, unknown>> = {
    spring_physics: {
      css: "cubic-bezier(0.16, 1, 0.3, 1)",
      framer_motion: { type: "spring", stiffness: 100, damping: 20 },
      duration: "400ms-600ms",
      feel: "premium, weighty, physical",
      use_for: ["interactive elements", "page transitions", "modal reveals"],
    },
    slow_cinematic: {
      css: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      framer_motion: { type: "tween", duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] },
      duration: "800ms-1200ms",
      feel: "dramatic, editorial, contemplative",
      use_for: ["hero reveals", "full-page transitions", "photography-heavy layouts"],
    },
    mechanical_snap: {
      css: "cubic-bezier(0.77, 0, 0.175, 1)",
      framer_motion: { type: "tween", duration: 0.2, ease: [0.77, 0, 0.175, 1] },
      duration: "150ms-300ms",
      feel: "precise, industrial, no-nonsense",
      use_for: ["brutalist/constructivist", "toggle states", "grid reconfigurations"],
    },
    organic_drift: {
      css: "cubic-bezier(0.37, 0, 0.63, 1)",
      framer_motion: { type: "tween", duration: 5.0, ease: [0.37, 0, 0.63, 1], repeat: Infinity },
      duration: "2000ms-20000ms",
      feel: "natural, meditative, atmospheric",
      use_for: ["background gradients", "parallax layers", "wabi-sabi/impressionist"],
    },
    playful_bounce: {
      css: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      framer_motion: { type: "spring", stiffness: 200, damping: 15, mass: 0.8 },
      duration: "400ms-600ms",
      feel: "energetic, toy-like, joyful",
      use_for: ["claymorphism squish", "memphis/pop", "gamified elements"],
    },
    stutter_glitch: {
      css: "steps(4, jump-both)",
      framer_motion: { type: "tween", duration: 0.15, ease: "linear", repeat: 3 },
      duration: "100ms-300ms",
      feel: "broken, lo-fi, digital artifact",
      use_for: ["glitch art", "vaporwave transitions", "pixel art frame-stepping"],
    },
    scroll_entry: {
      css: "cubic-bezier(0.16, 1, 0.3, 1)",
      framer_motion: { type: "spring", stiffness: 100, damping: 20, delay: 0 },
      implementation: "IntersectionObserver",
      default_transform: "translateY(16px) + opacity: 0",
      stagger_formula: "animation-delay: calc(var(--index) * 80ms)",
      performance: "animate only transform and opacity",
    },
  };

  for (const [name, config] of Object.entries(signatures)) {
    await Bun.write(
      `${SKILL_DIR}/assets/motion-presets/${name}.json`,
      JSON.stringify(config, null, 2),
    );
  }
  console.log(`Generated ${Object.keys(signatures).length} motion presets`);
}

// --- Generate Figma Token Sets ---

async function generateFigmaTokenSets() {
  let count = 0;
  for (const style of styles) {
    const tokens = paletteToTokens(style.dsp.color_palette_type ?? "", style.id);
    const profile = styleProfiles[style.id] ?? {};
    const impl = styleImpls[style.id] ?? {};
    const fontSelection = (impl.typography ?? profile.font_selection ?? {}) as Record<
      string,
      string
    >;
    const dials = (impl.default_dials ?? profile.dials ?? {}) as Record<string, number>;

    const tokenSet = {
      $metadata: {
        tokenSetName: style.id,
        generatedFrom: "TAXONOMY v2.0",
        styleName: style.name,
        category: style.category,
      },
      color: {
        primary: { value: tokens.primary, type: "color" },
        secondary: { value: tokens.secondary, type: "color" },
        accent: { value: tokens.accent, type: "color" },
        surface: { value: tokens.surface, type: "color" },
        "on-surface": { value: tokens["on-surface"], type: "color" },
        muted: { value: tokens.muted, type: "color" },
      },
      typography: {
        display: {
          fontFamily: {
            value: fontSelection.display ?? style.dsp.typography_family ?? "system-ui",
            type: "fontFamilies",
          },
        },
        body: {
          fontFamily: {
            value: fontSelection.body ?? style.dsp.typography_family ?? "system-ui",
            type: "fontFamilies",
          },
        },
      },
      spacing: {
        xs: { value: "4", type: "spacing" },
        sm: { value: "8", type: "spacing" },
        md: { value: "16", type: "spacing" },
        lg: { value: "32", type: "spacing" },
        xl: { value: "64", type: "spacing" },
      },
      borderRadius: {
        sm: { value: parseRadius(style.dsp.border_radii ?? "8px", 0.5), type: "borderRadius" },
        md: { value: parseRadius(style.dsp.border_radii ?? "8px", 1), type: "borderRadius" },
        lg: { value: parseRadius(style.dsp.border_radii ?? "8px", 1.5), type: "borderRadius" },
      },
      shadow: {
        model: { value: style.dsp.shadow_model ?? "none", type: "other" },
      },
      dials: {
        designVariance: { value: String(dials.design_variance ?? 5), type: "other" },
        motionIntensity: { value: String(dials.motion_intensity ?? 5), type: "other" },
        visualDensity: { value: String(dials.visual_density ?? 5), type: "other" },
        formality: { value: String(dials.audience_formality ?? 5), type: "other" },
      },
    };

    await Bun.write(
      `${SKILL_DIR}/assets/figma-token-sets/${style.id}.json`,
      JSON.stringify(tokenSet, null, 2),
    );
    count++;
  }
  console.log(`Generated ${count} Figma token sets`);
}

// --- Run All ---

console.log("Generating assets from taxonomy...\n");
await generateTailwindPresets();
await generateMotionPresets();
await generateFigmaTokenSets();

const tailwindCount = (
  await Array.fromAsync(new Bun.Glob("*.css").scan(`${SKILL_DIR}/assets/tailwind-presets`))
).length;
const motionCount = (
  await Array.fromAsync(new Bun.Glob("*.json").scan(`${SKILL_DIR}/assets/motion-presets`))
).length;
const figmaCount = (
  await Array.fromAsync(new Bun.Glob("*.json").scan(`${SKILL_DIR}/assets/figma-token-sets`))
).length;

console.log(
  `\nTotal: ${tailwindCount} Tailwind + ${motionCount} motion + ${figmaCount} Figma = ${tailwindCount + motionCount + figmaCount} asset files`,
);
