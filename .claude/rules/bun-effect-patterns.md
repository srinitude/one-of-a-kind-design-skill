---
description: Detailed Bun-only and Effect-native code patterns, exemptions, and replacements
paths:
  - ".claude/skills/one-of-a-kind-design/scripts/**/*.ts"
---

## Rule 1: Bun-Only (42 violation patterns)

### Banned Node.js Patterns -> Bun Replacements

| Banned | Replacement |
|--------|------------|
| `require()` | `import` (ESM) |
| `module.exports` | `export` (ESM) |
| `import * from "fs"` | `Bun.file()`, `Bun.write()` |
| `import * from "path"` | `URL` API, `import.meta.dir` |
| `import * from "child_process"` | `Bun.spawn()` |
| `import * from "http"` / `"https"` | `Bun.serve()`, `fetch()` |
| `import * from "crypto"` | `Bun.CryptoHasher`, Web Crypto |
| `process.env` | `Bun.env` |
| `__dirname` | `import.meta.dir` |
| `__filename` | `import.meta.file` |
| `fs.readFile` / `fs.writeFile` | `Bun.file().text()` / `Bun.write()` |
| `path.join()` / `path.resolve()` | `new URL()` with `import.meta.url` |

All `node:*` built-in imports are banned: fs, path, child_process, http, https, crypto, buffer, stream, url, os, events, util, zlib, worker_threads, assert.

## Rule 2: Effect-Native (19 violation patterns)

### Banned Async Patterns -> Effect Replacements

| Banned | Replacement |
|--------|------------|
| `new Promise()` | `Effect.tryPromise()` |
| `.then()` / `.catch()` | `Effect.map()` / `Effect.catchAll()` |
| `Promise.all()` | `Effect.all()` |
| `Promise.race()` | `Effect.race()` |
| `async function` / `async () =>` | `Effect.gen(function*() {})` |
| `try { } catch { }` | `Effect.catchAll()`, `Effect.catchTag()` |
| `throw new Error()` | `Effect.fail()`, `Effect.die()` |
| `console.log()` | `Console.log` from effect |
| `setTimeout()` | `Effect.sleep()` |
| `setInterval()` | `Effect.repeat()` |
| `JSON.parse()` (unguarded) | `Effect.try(() => JSON.parse(...))` |
| Custom Error classes | `Data.TaggedError` from effect |
| `EventEmitter` / `.on()` | Effect Stream or Queue |

### Exemptions (NOT violations)

- `async` inside `Effect.tryPromise({ try: async () => ... })` — required by the API
- `console` inside `Effect.sync(() => { console.log(...) })` — wrapped in Effect
- `JSON.parse` inside `Effect.try(() => JSON.parse(...))` — wrapped in Effect
- `.test.ts` files — test files are exempt from all rules

## Rule 3: Max Nesting Depth 3

Count `Effect.gen(` and `Effect.flatMap(` openings vs `)` closings per function scope. Maximum 3 levels. Fix: extract into intermediate variables or helper Effects.
