/**
 * 02 - E2B Sandbox SVG Optimization: create sandbox -> upload SVG -> run SVGO -> download
 *
 * Run: bun run examples/02-e2b-svg-optimization/run.ts
 */
import { Console, Effect, pipe } from "effect";
import {
  E2bSandboxService,
  E2bSandboxDefaultLayer,
} from "../../.claude/skills/one-of-a-kind-design/scripts/e2b-sandbox-manager";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect x="10" y="10" width="180" height="180" fill="#FF0000" stroke="#000000" stroke-width="2"/>
  <circle cx="100" cy="100" r="60" fill="#0000FF" stroke="#000000" stroke-width="2"/>
  <text x="100" y="105" text-anchor="middle" font-size="16" fill="#FFFFFF">SVG</text>
</svg>`;

const optimizeSvg = Effect.gen(function* () {
  yield* Console.log("=== 02: E2B Sandbox SVG Optimization ===\n");

  const svc = yield* E2bSandboxService;
  const originalSize = new TextEncoder().encode(SAMPLE_SVG).length;
  yield* Console.log(`Original SVG size: ${originalSize} bytes`);

  const result = yield* svc.withSandbox((sandbox) =>
    Effect.gen(function* () {
      const exec = (code: string) => svc.exec(sandbox, code);

      yield* exec(`
        const fs = require('fs');
        fs.writeFileSync('/tmp/input.svg', ${JSON.stringify(SAMPLE_SVG)});
      `);
      yield* Console.log("Uploaded SVG to sandbox");

      yield* exec("const { execSync } = require('child_process'); execSync('npm install -g svgo');");
      yield* Console.log("Installed SVGO in sandbox");

      const svgoResult = yield* exec("const { execSync } = require('child_process'); const out = execSync('svgo /tmp/input.svg -o /tmp/output.svg --multipass 2>&1').toString(); console.log(out);");
      yield* Console.log(`SVGO output: ${svgoResult.stdout}`);

      const readResult = yield* exec("const fs = require('fs'); console.log(fs.readFileSync('/tmp/output.svg', 'utf8'));");
      return readResult.stdout;
    }),
  );

  const optimizedSize = new TextEncoder().encode(result).length;
  yield* Console.log(`\nOptimized SVG size: ${optimizedSize} bytes`);
  yield* Console.log(`Savings: ${originalSize - optimizedSize} bytes (${Math.round((1 - optimizedSize / originalSize) * 100)}%)`);
});

if (import.meta.main) {
  pipe(
    optimizeSvg,
    Effect.provide(E2bSandboxDefaultLayer),
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`SVG optimization failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
