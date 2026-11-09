/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The development / production switch, the one place it is read.
 *
 * `DEV` is false in a production build, and every development-only
 * diagnostic sits behind `if (DEV)` at its call site, so a production build
 * drops the check, the message text and the warn-once bookkeeping together.
 * The safe behaviour around a diagnostic (clamping `max`, refusing an unknown
 * state, ignoring a bad `action-then`) never sits behind it.
 *
 * How `DEV` gets its value:
 *  - from source (the React package, the workspace): `process.env.NODE_ENV`,
 *    which every bundler replaces (webpack's `mode`, Vite, esbuild's
 *    `define`, Rollup's replace plugin), as React and Carbon read it. Test
 *    runners (Vitest's `NODE_ENV=test`) count as development. A bundler then
 *    folds `DEV` to `false` and drops the guarded code in every module that
 *    imports it (Rollup, esbuild, webpack and Vite all do; size.mjs checks).
 *  - in the web components' published build (pre-bundled, loadable without a
 *    bundler): the build defines `process.env.NODE_ENV` itself, once per
 *    variant: `dist/` is production and `dist/development/` development,
 *    picked by the `development` export condition, as Lit's own builds are.
 *    Neither variant reads `process` at run time.
 *
 * The shapes every bundler drops (esbuild is the strict one: it folds an
 * imported `DEV` only when it links, after tree-shaking):
 *  - a call site is one statement, `if (DEV) warnOnce(key, message)` or
 *    `if (DEV) console.warn(message)`; a block under `if (DEV)` declares no
 *    variables (esbuild keeps a block that does);
 *  - a helper that holds message text is `const f = DEV ? (…) => {…} : noop`,
 *    never a function declaration (esbuild keeps one reached only from dead
 *    code, text and all);
 *  - dev-only data is `DEV ? value : undefined`.
 * scripts/size.mjs fails if any production bundle (Rollup, esbuild, webpack)
 * still carries a "[motion-icons] " message.
 */

// Declared here, not globally, so it doesn't collide with @types/node where a package has it.
declare const process: { env: { NODE_ENV?: string } };

/** True in development builds (and tests); false in production builds, which drop what it guards. */
export const DEV: boolean = process.env.NODE_ENV !== 'production';

const warned = new Set<string>();

/**
 * `console.warn(message)` once per `key` for the page's life. Call it only
 * behind `if (DEV)`, so production builds carry neither the message nor the
 * bookkeeping. Keys are namespaced by the caller (`state|…`, `max|…`).
 */
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(message);
}
