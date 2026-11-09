/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The names a package's module exports, read from its source: what another
// package can import from its root.

import path from 'node:path';
import { withoutComments, regions } from './regions.js';

const posix = path.posix;

/**
 * Finds a module in a package by a relative specifier, as TypeScript does.
 *
 * @param {(p: string) => string | null} read Reads a file in the package.
 * @param {string} from The importing file.
 * @param {string} spec The specifier.
 * @returns {string | null} The file, or null when there is none.
 */
function resolve(read, from, spec) {
  const base = posix.normalize(posix.join(posix.dirname(from), spec));
  const tries = /\.(tsx?|js)$/.test(base)
    ? [base]
    : [
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        `${base}/index.ts`,
        `${base}/index.tsx`,
      ];
  return tries.find((t) => read(t) !== null) ?? null;
}

/**
 * The names a module exports, following its `export * from` of the
 * package's own files. A wildcard from another package is listed
 * (`external`): names may come through it, but not the package's own; a
 * wildcard of its own files that doesn't resolve makes the list open.
 *
 * @param {(p: string) => string | null} read Reads a file in the package.
 * @param {string} file The module.
 * @param {Set<string>} [seen] The modules already read.
 * @returns {{ names: Set<string>, types: Set<string>, external: string[], open: boolean }} The names (`types` the type-only ones), the other packages it forwards whole, and whether the list is open.
 */
export function exportedNames(read, file, seen = new Set()) {
  const out = { names: new Set(), types: new Set(), external: [], open: false };
  const src = read(file);
  if (src === null || seen.has(file)) {
    return out;
  }
  seen.add(file);
  const code = withoutComments(src, regions(src, 'ts'));
  for (const m of code.matchAll(
    /\bexport\s+(type\s+)?\{([^}]*)\}(?:\s*from\s*['"][^'"]+['"])?/g
  )) {
    for (const part of m[2].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      const own = bits[0].trim();
      const name = (bits[1] ?? own).replace(/^type\s+/, '').trim();
      if (!name) {
        continue;
      }
      out.names.add(name);
      if (m[1] || /^type\s/.test(own)) {
        out.types.add(name);
      }
    }
  }
  for (const m of code.matchAll(
    /\bexport\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:abstract\s+)?(const|let|var|function\*?|class|type|interface|enum)\s+([\w$]+)/g
  )) {
    out.names.add(m[2]);
    if (m[1] === 'type' || m[1] === 'interface') {
      out.types.add(m[2]);
    }
  }
  if (/\bexport\s+default\b/.test(code)) {
    out.names.add('default');
  }
  for (const m of code.matchAll(/\bexport\s+\*\s+as\s+([\w$]+)\s+from/g)) {
    out.names.add(m[1]);
  }
  for (const m of code.matchAll(/\bexport\s+\*\s+from\s*['"]([^'"]+)['"]/g)) {
    if (!m[1].startsWith('.')) {
      out.external.push(m[1]);
      continue;
    }
    const target = resolve(read, file, m[1]);
    if (!target) {
      out.open = true;
      continue;
    }
    const inner = exportedNames(read, target, seen);
    inner.names.forEach((n) => n !== 'default' && out.names.add(n));
    inner.types.forEach((n) => out.types.add(n));
    out.external.push(...inner.external);
    out.open ||= inner.open;
  }
  return out;
}
