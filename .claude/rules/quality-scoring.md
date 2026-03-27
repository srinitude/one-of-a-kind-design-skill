---
description: Quality scoring breakdown - 9 sub-scores, weights, validators, thresholds
---

## Composite Quality Score (MANDATORY for every output)

| Sub-score | Weight | Validator Script |
|-----------|--------|-----------------|
| Anti-slop gate | 0.15 | `.claude/skills/one-of-a-kind-design/scripts/validate-output.ts` |
| Code standards | 0.08 | `.claude/skills/one-of-a-kind-design/scripts/validate-code-standards.ts` |
| Asset quality | 0.12 | `.claude/skills/one-of-a-kind-design/scripts/validate-asset-quality.ts` |
| Prompt-artifact alignment | 0.15 | `.claude/skills/one-of-a-kind-design/scripts/validate-prompt-artifact-alignment.ts` |
| Aesthetic | 0.13 | `.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts` |
| Style fidelity | 0.13 | `.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts` |
| Distinctiveness | 0.13 | `.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts` |
| Hierarchy | 0.06 | `.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts` |
| Color harmony | 0.05 | `.claude/skills/one-of-a-kind-design/scripts/run-perceptual-quality.ts` |

**Composite = weighted sum of all 9 sub-scores.**

## Thresholds

- **>= 7.0**: PASS. Display score card and deliver.
- **< 7.0**: HARD STOP. Do NOT deliver. Identify lowest sub-score, fix, re-score.

## Prompt-Artifact Alignment (per-job)

Run after EVERY fal.ai/QuiverAI call via `.claude/skills/one-of-a-kind-design/scripts/validate-prompt-artifact-alignment.ts`:
- **< 5.0**: AUTO-REGENERATE (different seed -> higher-tier model -> re-craft with feedback)
- **5.0-6.9**: FLAG for user review
- **>= 7.0**: PASS

Reference: `.claude/skills/one-of-a-kind-design/references/PROMPT-ARTIFACT-ALIGNMENT.md` for per-job criteria.
Reference: `.claude/skills/one-of-a-kind-design/references/QUALITY-SCORING.md` for detailed rubrics.

## Quality Agents

- `quality-assessor.md`: Composite scoring, score card, PASS/FAIL verdict
- `style-guard.md`: Taxonomy compliance, anti-slop, dial reflection, font selection
- `ux-reviewer.md`: Navigation, hierarchy, accessibility, responsiveness
