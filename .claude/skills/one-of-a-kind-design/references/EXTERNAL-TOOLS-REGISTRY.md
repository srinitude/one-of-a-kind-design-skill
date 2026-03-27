# EXTERNAL-TOOLS-REGISTRY.md
> Generated from visual-styles-taxonomy v0.1.0 | one-of-a-kind-design skill

Complete registry of 50+ external tools across 10 categories. Each entry documents official docs URL, export package contents, prompt format adaptation rules, and when to suggest the tool. Users can also register custom tools via the custom_tool_schema.

---

## Video Production (7 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Runway | https://docs.dev.runwayml.com/ | Gen-4.5/Aleph format prompts with @reference tag syntax, reference images for I2V, storyboard PDF, camera movement guide, aspect ratio specs | Plain text with @tag (3-16 alphanumeric), max 1000 chars, no negative prompt, reference images up to 3 | Multi-shot editing, VFX, professional video refinement, Runway UI preferred |
| CapCut | https://www.capcut.com/ | Video assets (MP4), audio tracks, subtitle SRT files, effect suggestions guide with taxonomy motion_signature mapping, timeline structure JSON | -- | Quick social media editing, TikTok/Reels/Shorts content |
| DaVinci Resolve | https://www.blackmagicdesign.com/products/davinciresolve | Video assets, color grading LUT files from taxonomy palette, audio stems, EDL/XML timeline, Fusion composition guide | -- | Professional color grading, compositing, high-end post-production |
| Adobe Premiere Pro | https://helpx.adobe.com/premiere-pro/ | Video assets, MOGRT templates for Essential Graphics, import guide, audio tracks, subtitle SRT, project structure XML | -- | Professional timeline editing in Adobe ecosystem |
| Adobe After Effects | https://helpx.adobe.com/after-effects/ | Video assets, motion graphics guide matching motion_signature, expression code snippets, layer composition structure, Lottie JSON via Bodymovin | -- | Motion graphics, particle effects, complex compositing |
| Remotion | https://www.remotion.dev/docs/ | React component code as Remotion compositions, asset files, package.json with remotion deps, remotion.config.ts, render script (bun run render) | -- | Programmatic video in TypeScript/React workflow, CI/CD video pipelines |
| FFmpeg | https://ffmpeg.org/documentation.html | Shell scripts for compression/conversion/frame extraction, concatenation scripts, audio mixing commands, filter chain recipes | -- | Batch video processing, custom encoding pipelines, automation |

---

## Image Design (7 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Figma | https://www.figma.com/developers/api | Design token JSON (Style Dictionary / Tokens Studio format), color Variables with Desktop/Tablet/Mobile modes, typography specs, component structure guide, SVG assets, spacing/radius/shadow tokens | Tokens Studio JSON format (not raw CSS) | Collaborative design iteration, developer handoff, design system |
| Adobe Photoshop | https://helpx.adobe.com/photoshop/ | PSD-ready layer structure guide, action scripts (.atn), assets (PNG/TIFF at 300dpi print, 72dpi web), color swatches (ASE), brush presets for texture styles | -- | Pixel-level photo editing, retouching, print compositing |
| Adobe Illustrator | https://helpx.adobe.com/illustrator/ | SVG assets from QuiverAI, Illustrator swatch files (ASE), artboard structure guide, typography specs, pattern fill definitions | -- | Professional vector editing, print-ready output, beyond QuiverAI capabilities |
| Canva | https://www.canva.com/developers/ | Asset files (PNG/SVG), brand kit guide (colors, fonts, logos from taxonomy), template structure suggestions, text content, layout guide | -- | Quick non-technical design iteration, social media graphics |
| Sketch | https://developer.sketch.com/ | Design token JSON, SVG assets, symbol/component structure guide, color palette, typography specs | -- | macOS design workflow, Sketch-native teams |
| Framer | https://www.framer.com/developers/ | React components with Framer Motion animation configs, design tokens as CSS variables, layout JSON, published site structure | -- | Design-to-live-site with Framer publishing, interactive prototypes |
| Penpot | https://community.penpot.app/ | SVG assets, design token JSON, component structure guide | -- | Open-source design tool preference, self-hosted design systems |

---

## Web Development (5 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Webflow | https://developers.webflow.com/ | HTML structure guide with Webflow class naming, asset files, Webflow-compatible interaction JSON, CMS collection structure | -- | Visual web building with Webflow CMS, no-code deployment |
| v0 by Vercel | https://v0.dev/ | Prompts optimized for v0 component generation, Tailwind tokens, shadcn/ui component suggestions, reference screenshots | Plain text, understands shadcn/ui natively | Rapid component iteration, shadcn/ui ecosystem |
| Bolt.new | https://bolt.new/ | Full project scaffold prompts, package.json, Tailwind config, component code, asset files | -- | Spin up a complete project from scratch in-browser |
| Lovable | https://lovable.dev/ | Project prompts, design specs, Supabase schema if backend needed, component structure | -- | Full-stack app generation with backend |
| Replit | https://docs.replit.com/ | Complete project files, .replit config, package.json, environment variable guide | -- | Instant cloud development, collaborative coding |

---

## AI/ML Platforms (7 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Google AI Studio | https://ai.google.dev/gemini-api/docs | Gemini-optimized prompts, system instructions format, multimodal input guide, API code snippets | Structured Gemini format: system_instruction + user message pairs | Google AI Studio UI for prompt iteration, Gemini models |
| OpenAI Platform | https://platform.openai.com/docs | GPT Image / DALL-E / Sora prompts, system prompts, API code, function calling schemas | -- | OpenAI playground, GPT Image generation |
| Replicate | https://replicate.com/docs | Model-specific prompts, cog.yaml config, prediction API code snippets | -- | Custom model deployment, model fine-tuning |
| Hugging Face | https://huggingface.co/docs | Model cards, Spaces deployment guide, Gradio interface code, inference API snippets | -- | Hugging Face ecosystem, open-source model hosting |
| ComfyUI | https://docs.comfy.org/ | Workflow JSON (complete node graph with KSampler, CLIPTextEncode, VAEDecode nodes), model checkpoint recommendations, LoRA suggestions per style, custom node guide | ComfyUI workflow JSON format (complete node graph, not text prompts) | Node-based visual AI workflow, fine-grained generation control |
| Stability AI | https://platform.stability.ai/docs | Stability-format prompts, API code, style preset mappings from taxonomy to Stability presets | Plain text with style_preset parameter mapping | Stable Diffusion platform, SDXL models |
| Midjourney | https://docs.midjourney.com/ | Midjourney-format prompts with parameter suffixes, reference image URLs, style guide | `{prompt} --ar {ratio} --style {style} --chaos {0-100} --weird {0-3000} --stylize {0-1000}` | Midjourney aesthetic engine, Discord-based workflow |

---

## Code IDEs (7 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Codex CLI | https://github.com/openai/codex | Codex-optimized prompts, AGENTS.md project context, task decomposition | -- | OpenAI coding agent workflows |
| Cursor | https://docs.cursor.com/ | .cursorrules file with taxonomy style conventions, project scaffold, component code, Tailwind config | .cursorrules format with style-specific coding conventions | Cursor IDE development |
| Claude Code | https://code.claude.com/docs/ | CLAUDE.md project context, .claude/rules/ files with style conventions, skill files (meta-export), agent definitions | -- | Continue in Claude Code environment (meta-export) |
| VS Code | https://code.visualstudio.com/docs | .vscode/settings.json, extensions.json with recommended extensions, code snippets for taxonomy components, task runners | -- | VS Code development |
| Windsurf | https://docs.windsurf.com/ | Project rules file, Cascade context, component code | -- | Windsurf IDE development |
| GitHub Copilot | https://docs.github.com/en/copilot | .github/copilot-instructions.md with style conventions, component code, test files | -- | Copilot-assisted development |
| Zed | https://zed.dev/docs | .zed/settings.json, assistant panel context, component code | -- | Zed editor development |

---

## 3D / Spatial (6 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Blender | https://docs.blender.org/ | GLB/OBJ mesh files, material setup guide (Cycles/EEVEE) with taxonomy palette, lighting rig, Python import scripts, texture files | -- | 3D modeling, animation, rendering |
| Spline | https://docs.spline.design/ | GLB mesh files, Spline import guide, material/lighting suggestions, interaction setup guide | -- | Browser-based 3D design, web-native 3D |
| Three.js | https://threejs.org/docs/ | GLB files, Three.js scene setup code, OrbitControls configuration, material definitions matching taxonomy palette, lighting rig code | -- | Code-based 3D web, WebGL applications |
| Unity | https://docs.unity3d.com/ | GLB/FBX mesh files, material setup guide (URP/HDRP), C# import scripts, prefab structure | -- | Game engine, interactive applications, XR |
| Unreal Engine | https://dev.epicgames.com/documentation/ | FBX mesh files, material instance guide, Blueprint import steps, lighting setup | -- | AAA real-time 3D, architectural visualization |
| Reality Composer Pro | https://developer.apple.com/documentation/realitykit/ | USDZ files, spatial composition guide, visionOS interaction patterns | -- | Apple Vision Pro, AR experiences, spatial computing |

---

## Audio / Music (6 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Ableton Live | https://www.ableton.com/en/manual/ | Audio stems (WAV), ALS project structure guide, MIDI data, tempo/key info, plugin chain suggestions matching style | -- | DAW-based music production |
| Logic Pro | https://support.apple.com/guide/logicpro/ | Audio stems (WAV), Logic project structure guide, MIDI data, tempo/key, Logic-specific routing guide | -- | macOS DAW production |
| ElevenLabs | https://elevenlabs.io/docs | ElevenLabs-format TTS prompts, voice ID references, API code, voice cloning audio samples | ElevenLabs format: map audience_formality dial to voice presets | ElevenLabs voice platform, premium TTS |
| Suno | https://suno.com/ | Suno-format music generation prompts, genre/mood/tempo specs from taxonomy, lyrics if applicable | -- | AI music generation with Suno |
| Udio | https://www.udio.com/ | Udio-format prompts, genre tags, reference track descriptions | -- | AI music generation with Udio |
| Soundraw | https://soundraw.io/ | Mood/genre/tempo/instrument specs from taxonomy style_affinity, usage rights guide | -- | Royalty-free custom background music |

---

## Collaboration (5 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Notion | https://developers.notion.com/ | Project brief, design spec, style guide, asset links, task breakdown, UX research findings -- all formatted as Notion-importable markdown | -- | Notion project management, design documentation |
| Linear | https://developers.linear.app/ | Issue descriptions for design implementation tasks, acceptance criteria from quality scoring, asset links | -- | Linear work tracking, engineering handoff |
| Miro | https://developers.miro.com/ | Moodboard structure, sticky note content, asset image URLs, UX research findings for Miro import | -- | Visual collaboration, design workshops |
| Slack | https://api.slack.com/docs | Summary message with asset previews, quality score, key decisions, next steps -- formatted for Slack channel posting | -- | Team updates, design review notifications |
| Weavy | https://www.weavy.com/docs | Chat-formatted design review, asset comment threads, approval workflows | -- | Embedded collaboration in custom apps |

---

## Presentation (4 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Google Slides | https://developers.google.com/slides | Slide content structure, assets at presentation resolution, speaker notes, style-matched color theme | -- | Presenting design work, client pitches |
| Keynote | https://support.apple.com/guide/keynote/ | Asset files, slide structure guide, Magic Move animation suggestions matching taxonomy motion_character | -- | macOS presentations |
| PowerPoint | https://learn.microsoft.com/en-us/office/client-developer/powerpoint-home | PPTX-ready structure, asset files, color theme XML, animation suggestions | -- | Enterprise presentations |
| Pitch | https://pitch.com/ | Slide content, asset files, brand kit export, collaboration link setup guide | -- | Modern collaborative presentations |

---

## Deployment (4 tools)

| Tool | Docs URL | Export Contents | Prompt Adaptation | Suggest When |
|------|----------|----------------|-------------------|--------------|
| Vercel | https://vercel.com/docs | vercel.json, Next.js/React project scaffold, environment variable guide, edge config | -- | Vercel deployment, Next.js projects |
| Netlify | https://docs.netlify.com/ | netlify.toml, static site scaffold, _redirects file, CDN-optimized assets | -- | Netlify deployment, static sites |
| Railway | https://docs.railway.com/ | railway.json, Dockerfile, environment variable template, deployment guide | -- | Railway deployment (preferred deployment target) |
| Cloudflare Pages | https://developers.cloudflare.com/pages/ | wrangler.toml, static assets, Workers route config | -- | Cloudflare deployment, edge computing |

---

## Prompt Format Adaptation Rules

When exporting prompts to external tools, raw prompts from prompt-crafter subagents are NEVER exported directly. They are always transformed to the target tool's native format.

### Midjourney Format
```
{prompt} --ar {ratio} --style {style_value} --chaos {0-100} --weird {0-3000} --stylize {0-1000}
```

**Dial Mapping:**
- design_variance -> `--chaos {value * 10}`
- visual_density -> `--stylize {value * 100}`
- High fidelity -> `--style raw`
- Artistic -> `--style 4b`

### ComfyUI Format
Generate complete node graph JSON with KSampler, CLIPTextEncode, VAEDecode, SaveImage nodes.

**Checkpoint Mapping:**
- Photographic styles -> `sd_xl_base_1.0.safetensors`
- Illustrative styles -> `dreamshaperXL_v2.safetensors`

### Runway Format
Plain text with `@reference` tags. Reference tag must be 3-16 alphanumeric characters starting with a letter.

**Model Mapping:**
- text_to_video -> `gen4.5`
- image_to_video -> `gen4_turbo`

### Google AI Studio Format
Structured `system_instruction` + `user` message pairs.

### Stability AI Format
Plain text with `style_preset` parameter mapped from taxonomy styles.

### ElevenLabs Format
Text with inline SSML-like delivery markers. Map `audience_formality` dial to voice presets.

### Figma Format
Tokens Studio / Style Dictionary JSON format. Export as Figma Variables JSON, not raw CSS.
