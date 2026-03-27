/**
 * E2B Sandbox Manager — Effect-native lifecycle management for E2B sandboxes.
 * Provides create/exec/upload/download/destroy as Effect services.
 */

import { Sandbox } from "@e2b/code-interpreter";
import { Context, Effect, Layer, pipe } from "effect";

// --- Service Interface ---

export interface E2bSandboxConfig {
  readonly apiKey: string;
  readonly timeoutMs: number;
}

export interface SandboxExecResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly artifacts: string[];
}

export class E2bSandboxService extends Context.Tag("E2bSandboxService")<
  E2bSandboxService,
  {
    readonly create: () => Effect.Effect<Sandbox, Error>;
    readonly exec: (sandbox: Sandbox, code: string) => Effect.Effect<SandboxExecResult, Error>;
    readonly uploadFile: (
      sandbox: Sandbox,
      localPath: string,
      remotePath: string,
    ) => Effect.Effect<void, Error>;
    readonly downloadFile: (
      sandbox: Sandbox,
      remotePath: string,
    ) => Effect.Effect<Uint8Array, Error>;
    readonly destroy: (sandbox: Sandbox) => Effect.Effect<void, Error>;
    readonly withSandbox: <A>(
      fn: (sandbox: Sandbox) => Effect.Effect<A, Error>,
    ) => Effect.Effect<A, Error>;
  }
>() {}

// --- Live Implementation ---

export const E2bSandboxLive = (config: E2bSandboxConfig) =>
  Layer.succeed(E2bSandboxService, {
    create: () =>
      Effect.tryPromise({
        try: () =>
          Sandbox.create({
            apiKey: config.apiKey,
            timeoutMs: config.timeoutMs,
          }),
        catch: (e) => new Error(`E2B sandbox creation failed: ${e}`),
      }),

    exec: (sandbox: Sandbox, code: string) =>
      Effect.tryPromise({
        try: async () => {
          const execution = await sandbox.runCode(code);
          return {
            stdout: execution.logs.stdout.join("\n"),
            stderr: execution.logs.stderr.join("\n"),
            exitCode: execution.error ? 1 : 0,
            artifacts: execution.results.map((r) => JSON.stringify(r)),
          } satisfies SandboxExecResult;
        },
        catch: (e) => new Error(`E2B execution failed: ${e}`),
      }),

    uploadFile: (sandbox: Sandbox, localPath: string, remotePath: string) =>
      Effect.tryPromise({
        try: async () => {
          const content = await Bun.file(localPath).text();
          await sandbox.files.write(remotePath, content as unknown as string);
        },
        catch: (e) => new Error(`E2B upload failed: ${e}`),
      }),

    downloadFile: (sandbox: Sandbox, remotePath: string) =>
      Effect.tryPromise({
        try: async () => {
          const content = await sandbox.files.read(remotePath);
          return typeof content === "string"
            ? new TextEncoder().encode(content)
            : new Uint8Array(content);
        },
        catch: (e) => new Error(`E2B download failed: ${e}`),
      }),

    destroy: (sandbox: Sandbox) =>
      Effect.tryPromise({
        try: () => sandbox.kill(),
        catch: (e) => new Error(`E2B sandbox destroy failed: ${e}`),
      }),

    withSandbox: <A>(fn: (sandbox: Sandbox) => Effect.Effect<A, Error>) =>
      Effect.gen(function* () {
        const sandbox = yield* Effect.tryPromise({
          try: () =>
            Sandbox.create({
              apiKey: config.apiKey,
              timeoutMs: config.timeoutMs,
            }),
          catch: (e) => new Error(`E2B sandbox creation failed: ${e}`),
        });
        const result = yield* pipe(
          fn(sandbox),
          Effect.ensuring(
            pipe(
              Effect.tryPromise({
                try: () => sandbox.kill(),
                catch: (e) => new Error(`E2B sandbox destroy failed: ${e}`),
              }),
              Effect.catchAll(() => Effect.void),
            ),
          ),
        );
        return result;
      }),
  });

// --- Default config from env ---

export const E2bSandboxDefaultConfig: E2bSandboxConfig = {
  apiKey: Bun.env.E2B_API_KEY ?? "",
  timeoutMs: 300_000,
};

export const E2bSandboxDefaultLayer = E2bSandboxLive(E2bSandboxDefaultConfig);
