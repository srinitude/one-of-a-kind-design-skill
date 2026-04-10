/**
 * services/taste-profile.test.ts — Tests for taste profile system.
 */

import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type { TasteProfile } from "./taste-profile";
import { TasteProfileError, TasteProfileLive, TasteProfileService } from "./taste-profile";

describe("TasteProfileService", () => {
  it("creates default profile with all axes at 5", async () => {
    const profile = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* TasteProfileService;
          return yield* svc.create();
        }),
        TasteProfileLive,
      ),
    );

    expect(profile.density).toBe(5);
    expect(profile.tone).toBe(5);
    expect(profile.colorEnergy).toBe(5);
  });

  it("updates specific axes", async () => {
    const profile = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* TasteProfileService;
          const base = yield* svc.create();
          return yield* svc.update(base, { density: 8, tone: 2 });
        }),
        TasteProfileLive,
      ),
    );

    expect(profile.density).toBe(8);
    expect(profile.tone).toBe(2);
    expect(profile.colorEnergy).toBe(5);
  });

  it("clamps values to 0-10 range", async () => {
    const profile = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* TasteProfileService;
          const base = yield* svc.create();
          return yield* svc.update(base, { density: 15, tone: -3 });
        }),
        TasteProfileLive,
      ),
    );

    expect(profile.density).toBe(10);
    expect(profile.tone).toBe(0);
  });

  it("applies profile to dial overrides", async () => {
    const overrides = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* TasteProfileService;
          const profile: TasteProfile = {
            density: 8,
            tone: 3,
            colorEnergy: 7,
            typePersonality: 6,
            radius: 4,
            elevation: 9,
            motion: 2,
          };
          return yield* svc.applyToDialOverrides(profile);
        }),
        TasteProfileLive,
      ),
    );

    expect(overrides.variance).toBe(8);
    expect(overrides.contrast).toBe(3);
    expect(overrides.saturation).toBe(7);
    expect(overrides.motionIntensity).toBe(2);
  });

  it("TasteProfileError has correct tag", () => {
    const err = new TasteProfileError({ operation: "test", cause: "boom" });
    expect(err._tag).toBe("TasteProfileError");
  });
});
