/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The component catalog, docs/v12/catalog.json: every v12 component package,
// its manifest status and motion, each component it exports and each of that
// component's props as a JSON schema, read from the lane's own sources with
// the TypeScript checker. A recipe or a generator names components and props
// from it. A prop the schema cannot say yet (an object or array shape) is
// marked `unchecked` with its type.

import fs from 'node:fs';
import path from 'node:path';
import { componentOf, isOwn, laneProgram } from './vocab.js';

export const CATALOG = 'docs/v12/catalog.json';

// DOM props a recipe needs, kept beside the component's own.
const DOM_KEEP = new Set([
  'onClick',
  'onChange',
  'onSubmit',
  'onKeyDown',
  'onFocus',
  'onBlur',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'id',
]);
// Props an instance never sets.
const DROP = new Set(['className', 'style', 'ref', 'key']);

/**
 * A prop's type as a JSON schema, as far as one can say it.
 *
 * @param {object} ts The TypeScript module.
 * @param {object} checker The type checker.
 * @param {object} type The type.
 * @returns {object} The schema.
 */
function schemaOf(ts, checker, type) {
  /**
   * The type as TypeScript writes it, cut short.
   *
   * @returns {string} The text.
   */
  const text = () => checker.typeToString(type).slice(0, 120);
  if (type.isUnion()) {
    const parts = type.types.filter(
      (t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
    );
    if (parts.length && parts.every((t) => t.isStringLiteral())) {
      return { enum: parts.map((t) => t.value).sort() };
    }
    if (parts.every((t) => t.flags & ts.TypeFlags.BooleanLiteral)) {
      return { type: 'boolean' };
    }
    if (parts.length === 1) {
      return schemaOf(ts, checker, parts[0]);
    }
    if (/ReactNode|ReactElement|JSX\.Element/.test(text())) {
      return { $ref: '#/$defs/node' };
    }
    const each = parts.map((t) => schemaOf(ts, checker, t));
    return each.every((s) => !s.unchecked)
      ? { anyOf: each }
      : { unchecked: text() };
  }
  if (type.isStringLiteral()) {
    return { const: type.value };
  }
  if (type.isNumberLiteral()) {
    return { const: type.value };
  }
  if (type.flags & ts.TypeFlags.String) {
    return { type: 'string' };
  }
  if (type.flags & ts.TypeFlags.Number) {
    return { type: 'number' };
  }
  if (type.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) {
    return { type: 'boolean' };
  }
  if (type.getCallSignatures().length) {
    return { $ref: '#/$defs/event' };
  }
  if (/ReactNode|ReactElement|JSX\.Element|ReactPortal/.test(text())) {
    return { $ref: '#/$defs/node' };
  }
  if (checker.isArrayType(type) || /\[\]$/.test(text())) {
    return { type: 'array', unchecked: text() };
  }
  return { type: 'object', unchecked: text() };
}

/**
 * The catalog.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {object} The catalog.
 */
export function buildCatalog(labs) {
  const { ts, program, checker, folders } = laneProgram(labs);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(labs, 'v12.manifest.json'), 'utf8')
  );
  const rows = new Map((manifest.items ?? manifest).map((i) => [i.path, i]));
  const packages = folders.map(({ folder, name, index }) => {
    const row = rows.get(`packages/react/src/v12/components/${folder}`);
    const components = [];
    const module = checker.getSymbolAtLocation(program.getSourceFile(index));
    for (const symbol of module ? checker.getExportsOfModule(module) : []) {
      const component = componentOf(ts, checker, symbol);
      if (!component) {
        continue;
      }
      const props = {};
      const required = [];
      for (const p of [...component.props].sort((a, b) =>
        a.getName() < b.getName() ? -1 : 1
      )) {
        const prop = p.getName();
        const decl = p.declarations?.[0];
        if (DROP.has(prop) || (!isOwn(labs, decl) && !DOM_KEEP.has(prop))) {
          continue;
        }
        const schema = schemaOf(
          ts,
          checker,
          checker.getTypeOfSymbolAtLocation(p, decl ?? component.decl)
        );
        const doc = ts
          .displayPartsToString(p.getDocumentationComment(checker))
          .split('\n')[0]
          .slice(0, 160);
        props[prop] = doc ? { ...schema, description: doc } : schema;
        if (!(p.flags & ts.SymbolFlags.Optional)) {
          required.push(prop);
        }
      }
      components.push({ name: symbol.getName(), required, props });
    }
    components.sort((a, b) => (a.name < b.name ? -1 : 1));
    // A component whose props are another's in the package (an icon set)
    // names that one instead of repeating them.
    const first = new Map();
    for (const [k, c] of components.entries()) {
      const key = JSON.stringify([c.required, c.props]);
      if (first.has(key)) {
        components[k] = { name: c.name, sameAs: first.get(key) };
      } else {
        first.set(key, c.name);
      }
    }
    return {
      name,
      folder,
      labsStatus: row?.labsStatus ?? null,
      motion: row?.motion ?? [],
      components,
    };
  });
  return {
    $defs: {
      node: {
        description: 'React content: text, an element or a list of them',
      },
      event: { description: 'A function the component calls' },
    },
    packages,
  };
}

/**
 * Writes the catalog, or with `check` says whether the committed one is current.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ check?: boolean }} [options] Options.
 * @returns {boolean} Whether the file is current (always true when writing).
 */
export function writeCatalog(labs, { check = false } = {}) {
  const file = path.join(labs, CATALOG);
  const text = `${JSON.stringify(buildCatalog(labs), null, 2)}\n`;
  if (check) {
    return fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return true;
}
