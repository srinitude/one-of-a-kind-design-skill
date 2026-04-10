/**
 * services/project-context.ts — Project context persistence.
 * Stores style lock, palette, character refs, generation history, pHash library.
 */

import { Context, Data, Effect, Layer } from "effect";

export class ProjectContextError extends Data.TaggedError("ProjectContextError")<{
  readonly operation: string;
  readonly cause: unknown;
}> {}

interface ProjectState {
  readonly styleId: string | null;
  readonly palette: readonly string[];
  readonly characterRefs: readonly string[];
  readonly generationHistory: readonly GenerationRecord[];
  readonly pHashLibrary: readonly string[];
  readonly tasteDials: Record<string, number>;
}

interface GenerationRecord {
  readonly timestamp: number;
  readonly promptId: string;
  readonly artifactUrl: string;
  readonly composite: number;
  readonly styleId: string;
}

interface ProjectContextShape {
  readonly load: (projectId: string) => Effect.Effect<ProjectState, ProjectContextError>;
  readonly save: (
    projectId: string,
    state: ProjectState,
  ) => Effect.Effect<void, ProjectContextError>;
  readonly lockStyle: (
    projectId: string,
    styleId: string,
  ) => Effect.Effect<void, ProjectContextError>;
  readonly addGeneration: (
    projectId: string,
    record: GenerationRecord,
  ) => Effect.Effect<void, ProjectContextError>;
  readonly addPHash: (projectId: string, hash: string) => Effect.Effect<void, ProjectContextError>;
}

export const ProjectContextService =
  Context.GenericTag<ProjectContextShape>("ProjectContextService");

const EMPTY_STATE: ProjectState = {
  styleId: null,
  palette: [],
  characterRefs: [],
  generationHistory: [],
  pHashLibrary: [],
  tasteDials: {},
};

export const ProjectContextLive = Layer.succeed(
  ProjectContextService,
  (() => {
    const store = new Map<string, ProjectState>();

    const getState = (id: string): ProjectState => store.get(id) ?? { ...EMPTY_STATE };

    return {
      load: (projectId) =>
        Effect.try({
          try: () => getState(projectId),
          catch: (e) => new ProjectContextError({ operation: "load", cause: e }),
        }),

      save: (projectId, state) =>
        Effect.try({
          try: () => {
            store.set(projectId, state);
          },
          catch: (e) => new ProjectContextError({ operation: "save", cause: e }),
        }),

      lockStyle: (projectId, styleId) =>
        Effect.try({
          try: () => {
            const s = getState(projectId);
            store.set(projectId, { ...s, styleId });
          },
          catch: (e) => new ProjectContextError({ operation: "lockStyle", cause: e }),
        }),

      addGeneration: (projectId, record) =>
        Effect.try({
          try: () => {
            const s = getState(projectId);
            store.set(projectId, {
              ...s,
              generationHistory: [...s.generationHistory, record],
            });
          },
          catch: (e) => new ProjectContextError({ operation: "addGeneration", cause: e }),
        }),

      addPHash: (projectId, hash) =>
        Effect.try({
          try: () => {
            const s = getState(projectId);
            store.set(projectId, {
              ...s,
              pHashLibrary: [...s.pHashLibrary, hash],
            });
          },
          catch: (e) => new ProjectContextError({ operation: "addPHash", cause: e }),
        }),
    };
  })(),
);
