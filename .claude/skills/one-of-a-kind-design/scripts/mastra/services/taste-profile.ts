/**
 * services/taste-profile.ts — Taste profile system.
 * 7 axes: density, tone, colorEnergy, typePersonality, radius, elevation, motion.
 * Create, update from preferences, apply to style resolution.
 */

import { Context, Data, Effect, Layer } from "effect";

export class TasteProfileError extends Data.TaggedError("TasteProfileError")<{
  readonly operation: string;
  readonly cause: unknown;
}> {}

export interface TasteProfile {
  readonly density: number;
  readonly tone: number;
  readonly colorEnergy: number;
  readonly typePersonality: number;
  readonly radius: number;
  readonly elevation: number;
  readonly motion: number;
}

const DEFAULT_PROFILE: TasteProfile = {
  density: 5,
  tone: 5,
  colorEnergy: 5,
  typePersonality: 5,
  radius: 5,
  elevation: 5,
  motion: 5,
};

const AXIS_KEYS: readonly (keyof TasteProfile)[] = [
  "density",
  "tone",
  "colorEnergy",
  "typePersonality",
  "radius",
  "elevation",
  "motion",
];

const clampAxis = (v: number): number => Math.max(0, Math.min(10, v));

interface TasteProfileShape {
  readonly create: () => Effect.Effect<TasteProfile, TasteProfileError>;
  readonly update: (
    profile: TasteProfile,
    adjustments: Partial<TasteProfile>,
  ) => Effect.Effect<TasteProfile, TasteProfileError>;
  readonly applyToDialOverrides: (
    profile: TasteProfile,
  ) => Effect.Effect<Record<string, number>, TasteProfileError>;
}

export const TasteProfileService = Context.GenericTag<TasteProfileShape>("TasteProfileService");

export const TasteProfileLive = Layer.succeed(TasteProfileService, {
  create: () => Effect.succeed({ ...DEFAULT_PROFILE }),

  update: (profile, adjustments) =>
    Effect.try({
      try: () => {
        const updated = { ...profile };
        for (const key of AXIS_KEYS) {
          if (adjustments[key] !== undefined) {
            updated[key] = clampAxis(adjustments[key]);
          }
        }
        return updated;
      },
      catch: (e) => new TasteProfileError({ operation: "update", cause: e }),
    }),

  applyToDialOverrides: (profile) =>
    Effect.try({
      try: () => ({
        variance: Math.round(profile.density),
        saturation: Math.round(profile.colorEnergy),
        contrast: Math.round(profile.tone),
        typographicWeight: Math.round(profile.typePersonality),
        spatialFrequency: Math.round(profile.radius),
        depthLayering: Math.round(profile.elevation),
        motionIntensity: Math.round(profile.motion),
      }),
      catch: (e) => new TasteProfileError({ operation: "applyToDialOverrides", cause: e }),
    }),
});
