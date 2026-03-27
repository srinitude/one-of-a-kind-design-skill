# CUSTOM-TOOL-SCHEMA.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete schema for user-defined custom external tools. Users register tools not in the built-in external_tool_registry by providing a YAML definition that follows this schema. Definitions are stored in `assets/custom-tools/{tool-id}.yaml` and are automatically discovered by the export system alongside built-in tools.

**Schema Version:** 1.0

---

## Schema Fields

### id (required)

| Property | Value |
|----------|-------|
| Type | `string` |
| Format | `kebab-case` |
| Required | **yes** |
| Description | Unique identifier for the tool |
| Examples | `"rive"`, `"my-internal-design-tool"`, `"custom-figma-plugin"` |

**Validation Rules:**
- Must be kebab-case (lowercase letters, numbers, hyphens)
- Must start with a letter
- Must not conflict with built-in tool IDs
- Maximum 64 characters

---

### name (required)

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | **yes** |
| Description | Human-readable display name |
| Examples | `"Rive"`, `"Internal Design System v3"`, `"Custom Figma Plugin"` |

**Validation Rules:**
- Maximum 128 characters
- No special characters except spaces, hyphens, periods, parentheses

---

### description (required)

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | **yes** |
| Description | What this tool does (1-2 sentences) |

**Validation Rules:**
- Minimum 10 characters
- Maximum 500 characters

---

### docs_url (optional)

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | no |
| Description | Official documentation URL |
| Format | Valid HTTP/HTTPS URL, or `null` if internal/undocumented |

---

### category (required)

| Property | Value |
|----------|-------|
| Type | `enum` |
| Required | **yes** |
| Description | Tool category for organization and filtering |
| Allowed values | `video`, `image-design`, `web-dev`, `ai-ml`, `code-ide`, `3d-spatial`, `audio-music`, `collaboration`, `presentation`, `deployment`, `animation`, `prototyping`, `other` |

---

### accepts (required)

Defines what asset types the tool can consume. This controls which assets are included in the export .zip.

| Field | Type | Description |
|-------|------|-------------|
| `images` | `boolean` | PNG/WebP/JPEG import support |
| `svg` | `boolean` | SVG import support |
| `video` | `boolean` | MP4/WebM import support |
| `audio` | `boolean` | MP3/WAV import support |
| `three_d` | `boolean` | GLB/FBX/USDZ import support |
| `code` | `boolean` | Code/component import support |
| `design_tokens` | `boolean` | Design token/variable import support |
| `prompts` | `boolean` | Text prompt/generation input support |

**Validation Rules:**
- All 8 fields must be present
- Each must be a boolean (`true` or `false`)
- At least one field must be `true` (a tool that accepts nothing is invalid)

---

### prompt_format (optional)

Defines how prompts should be formatted for this tool. Only relevant when `accepts.prompts` is `true`.

| Field | Type | Description |
|-------|------|-------------|
| `style` | `enum` | Format style: `plain_text`, `markdown`, `json`, `xml`, `custom` |
| `max_length` | `integer` | Maximum prompt character length |
| `supports_negative` | `boolean` | Whether the tool supports negative prompts |
| `special_syntax` | `string` | Tool-specific syntax documentation (e.g., `"--ar 16:9"`) |
| `example` | `string` | Example prompt in this tool's format |

**Validation Rules:**
- `style` must be one of the allowed enum values
- `max_length` must be a positive integer if present
- `example` should demonstrate the format described by `style` and `special_syntax`

---

### export_contents (required)

Defines what goes into the .zip export package.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `include_images` | `boolean` | -- | Include raster image assets |
| `include_svg` | `boolean` | -- | Include SVG vector assets |
| `include_video` | `boolean` | -- | Include video assets |
| `include_audio` | `boolean` | -- | Include audio assets |
| `include_3d` | `boolean` | -- | Include 3D mesh assets |
| `include_code` | `boolean` | -- | Include source code |
| `include_design_tokens` | `boolean` | -- | Include design token files |
| `include_prompts` | `boolean` | -- | Include adapted prompts |
| `include_quality_report` | `boolean` | `true` | Include QUALITY-REPORT.md |
| `include_style_spec` | `boolean` | `true` | Include STYLE-SPEC.md |
| `include_ux_research` | `boolean` | `true` | Include UX research findings |
| `custom_config_files` | `array` | `[]` | Additional tool-specific config files |

**custom_config_files array item schema:**

| Field | Type | Description |
|-------|------|-------------|
| `filename` | `string` | Output filename in the .zip |
| `description` | `string` | What this file contains / how it maps to taxonomy |
| `format` | `enum` | File format: `json`, `yaml`, `toml`, `xml`, `text`, `binary` |

**Validation Rules:**
- `include_*` boolean fields should align with `accepts` (e.g., `include_images: true` only makes sense when `accepts.images: true`)
- `custom_config_files[].filename` must be a valid filename (no path separators, no spaces)
- `custom_config_files[].format` must be one of the allowed enum values

---

### import_guide_hints (optional)

Provides information to help the export-guide-writer produce accurate import instructions.

| Field | Type | Description |
|-------|------|-------------|
| `import_method` | `string` | How to import files (e.g., `"File -> Import -> SVG"`) |
| `key_ui_elements` | `array of string` | Main UI areas (e.g., `["Canvas", "Timeline", "State Machine"]`) |
| `terminology.project` | `string` | What "project" is called in this tool |
| `terminology.component` | `string` | What "component" is called in this tool |
| `terminology.layer` | `string` | What "layer" is called in this tool |

---

### trigger_keywords (required)

| Property | Value |
|----------|-------|
| Type | `array of string` |
| Required | **yes** |
| Description | Words/phrases that suggest this tool in user messages (checked during message enhancement) |

**Validation Rules:**
- At least 1 keyword
- Maximum 20 keywords
- Each keyword must be lowercase
- No duplicates

---

### suggested_when (required)

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | **yes** |
| Description | Human-readable condition for proactively suggesting this tool |

**Validation Rules:**
- Minimum 10 characters
- Maximum 500 characters

---

## Complete Example Registration

```yaml
# assets/custom-tools/rive.yaml
id: rive
name: Rive
description: >-
  Interactive animation platform with state machines for web, mobile, and games.
  Supports SVG import and building interactive animations with code-driven control.
docs_url: https://rive.app/docs/
category: animation
accepts:
  images: true
  svg: true
  video: false
  audio: false
  three_d: false
  code: true
  design_tokens: false
  prompts: false
export_contents:
  include_images: true
  include_svg: true
  include_video: false
  include_audio: false
  include_3d: false
  include_code: true
  include_design_tokens: false
  include_prompts: false
  include_quality_report: true
  include_style_spec: true
  include_ux_research: true
  custom_config_files:
    - filename: rive-state-machine.json
      description: >-
        State machine definition mapping taxonomy motion_signature to Rive states.
        Each state corresponds to a scroll-driven section or interaction trigger.
      format: json
    - filename: rive-artboard-structure.md
      description: >-
        Recommended artboard and layer structure for the taxonomy style.
        Includes naming conventions and hierarchy.
      format: text
import_guide_hints:
  import_method: "File -> Import -> SVG or drag SVG onto canvas"
  key_ui_elements:
    - Canvas
    - Timeline
    - State Machine
    - Artboard
  terminology:
    project: File
    component: Artboard
    layer: Object
trigger_keywords:
  - rive
  - state machine animation
  - interactive animation
  - rive app
suggested_when: user needs interactive animations with state machines for web or mobile
```

---

## Lifecycle Operations

### Register

**Trigger:** User says "register [tool] as export tool"

**Flow:**
1. Web search for the tool's documentation
2. AskUserQuestion for any missing required fields
3. Validate the definition against this schema
4. Write YAML file to `assets/custom-tools/{tool-id}.yaml`
5. Confirm registration with summary of capabilities

```
User: "Register Rive as an export tool"
Skill: [web searches rive.app docs]
Skill: "I found Rive documentation. It accepts SVG and code. Does it also accept images?"
User: "Yes, PNG imports too"
Skill: [writes assets/custom-tools/rive.yaml]
Skill: "Registered Rive. It will receive: images, SVG, code, quality report, style spec,
       and 2 custom config files (state machine JSON, artboard structure)."
```

### Discover

The export system automatically discovers both:
- Built-in tools from `references/EXTERNAL-TOOLS-REGISTRY.md`
- Custom tools from all `assets/custom-tools/*.yaml` files

No manual registration step needed after YAML creation. The `generate-tool-export.ts` script reads both sources.

### Export

Custom tools use the same .zip structure as built-in tools:
- Standard core files (README.md, QUALITY-REPORT.md, STYLE-SPEC.md)
- Assets filtered by the `accepts` configuration
- Prompts adapted by the `prompt_format` configuration
- Custom config files from `export_contents.custom_config_files`
- Import guide generated using `import_guide_hints`

The export-guide-writer reads the custom YAML to produce accurate README.md instructions.

### Update

**Trigger:** User says "update [tool] definition"

**Flow:**
1. Load existing YAML from `assets/custom-tools/{tool-id}.yaml`
2. Re-run registration flow with existing values as defaults
3. Apply updates
4. Re-validate against schema
5. Write updated YAML
6. Confirm changes

### Remove

**Trigger:** User says "remove [tool] from my tools"

**Flow:**
1. Delete `assets/custom-tools/{tool-id}.yaml`
2. Confirm removal
3. Note: existing export packages are not affected

### List

**Trigger:** User says "show my custom tools"

**Flow:**
1. List all `.yaml` files in `assets/custom-tools/`
2. Display: id, name, category, accepted asset types for each

---

## Schema Validation

The following validation is performed when registering or updating a custom tool:

```typescript
function validateCustomTool(definition: unknown): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!definition.id) errors.push("id is required");
  if (!definition.name) errors.push("name is required");
  if (!definition.description) errors.push("description is required");
  if (!definition.category) errors.push("category is required");
  if (!definition.accepts) errors.push("accepts is required");
  if (!definition.export_contents) errors.push("export_contents is required");
  if (!definition.trigger_keywords?.length) errors.push("trigger_keywords requires at least 1 entry");
  if (!definition.suggested_when) errors.push("suggested_when is required");

  // Format validation
  if (definition.id && !/^[a-z][a-z0-9-]*$/.test(definition.id)) {
    errors.push("id must be kebab-case starting with a letter");
  }

  // Category enum validation
  const validCategories = [
    "video", "image-design", "web-dev", "ai-ml", "code-ide",
    "3d-spatial", "audio-music", "collaboration", "presentation",
    "deployment", "animation", "prototyping", "other"
  ];
  if (definition.category && !validCategories.includes(definition.category)) {
    errors.push(`category must be one of: ${validCategories.join(", ")}`);
  }

  // Accepts validation
  if (definition.accepts) {
    const acceptFields = ["images", "svg", "video", "audio", "three_d", "code", "design_tokens", "prompts"];
    for (const field of acceptFields) {
      if (typeof definition.accepts[field] !== "boolean") {
        errors.push(`accepts.${field} must be a boolean`);
      }
    }
    const hasAnyAccept = acceptFields.some((f) => definition.accepts[f] === true);
    if (!hasAnyAccept) {
      errors.push("accepts must have at least one true field");
    }
  }

  // Prompt format validation
  if (definition.prompt_format) {
    const validStyles = ["plain_text", "markdown", "json", "xml", "custom"];
    if (definition.prompt_format.style && !validStyles.includes(definition.prompt_format.style)) {
      errors.push(`prompt_format.style must be one of: ${validStyles.join(", ")}`);
    }
  }

  // Custom config files validation
  if (definition.export_contents?.custom_config_files) {
    const validFormats = ["json", "yaml", "toml", "xml", "text", "binary"];
    for (const file of definition.export_contents.custom_config_files) {
      if (!file.filename) errors.push("custom_config_files[].filename is required");
      if (!file.description) errors.push("custom_config_files[].description is required");
      if (file.format && !validFormats.includes(file.format)) {
        errors.push(`custom_config_files[].format must be one of: ${validFormats.join(", ")}`);
      }
      if (file.filename && /[\/\\]/.test(file.filename)) {
        errors.push("custom_config_files[].filename must not contain path separators");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```
