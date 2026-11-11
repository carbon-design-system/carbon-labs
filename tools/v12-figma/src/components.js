/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The components snapshot: for each manifest row, its logical key and
// mapping status, its stories, the props a component property would carry
// (with their values in code order), its states and motion items from
// `parameters.v12`, its departures, and the colours its styles mix per
// state and theme.

import fs from 'node:fs';
import path from 'node:path';
import { toId } from 'storybook/internal/csf';
import {
  INSTANCE_PROP,
  NOT_MAPPED,
  SLOT_PROP,
  SOURCES,
  THEME_MODES,
  VOCABULARY,
} from './config.js';
import { readManifest, validateFigmaBlocks } from './manifest.js';
import { PENDING, readResolved, stateColorsOf } from './state-colors.js';
import { ModuleReader, readStoryFile, workspacePackages } from './stories.js';

/**
 * Whether a value is one the reader could not resolve.
 *
 * @param {unknown} v The value.
 * @returns {boolean} Whether it is.
 */
const unresolved = (v) =>
  Boolean(v && typeof v === 'object' && '$unresolved' in v);

/**
 * A control's type, from `control: 'text'` or `control: { type: 'text' }`.
 *
 * @param {unknown} control The control.
 * @returns {string | false | null} The type.
 */
function controlOf(control) {
  if (control === false) {
    return false;
  }
  if (typeof control === 'string') {
    return control;
  }
  if (
    control &&
    typeof control === 'object' &&
    typeof control.type === 'string'
  ) {
    return control.type;
  }
  return null;
}

/**
 * The component property a prop becomes, or null for none.
 *
 * @param {string} name The prop.
 * @param {Record<string, unknown> | undefined} argType Its argType.
 * @param {unknown} arg A story's value for it.
 * @returns {object | null} The property.
 */
export function classifyProp(name, argType = {}, arg = undefined) {
  if (NOT_MAPPED.test(name) || argType.action) {
    return null;
  }
  const options = argType.options;
  if (Array.isArray(options)) {
    if (options.length && options.every((o) => typeof o === 'boolean')) {
      return { figma: 'BOOLEAN' };
    }
    const values = options.map((o) =>
      typeof o === 'string' ? o : unresolved(o) ? null : JSON.stringify(o)
    );
    return values.includes(null)
      ? { figma: 'VARIANT', values: null, unresolved: 'an option list entry' }
      : { figma: 'VARIANT', values };
  }
  if (unresolved(options)) {
    return { figma: 'VARIANT', values: null, unresolved: options.$unresolved };
  }
  const control = controlOf(argType.control);
  if (INSTANCE_PROP.test(name)) {
    return { figma: 'INSTANCE_SWAP' };
  }
  if (SLOT_PROP.test(name)) {
    return { figma: 'SLOT' };
  }
  if (control === 'boolean' || typeof arg === 'boolean') {
    return { figma: 'BOOLEAN' };
  }
  if (name === 'children') {
    return control === 'text' || typeof arg === 'string'
      ? { figma: 'TEXT', as: 'label' }
      : { figma: 'SLOT' };
  }
  if (control === 'text' || (control === null && typeof arg === 'string')) {
    return { figma: 'TEXT' };
  }
  return null;
}

/**
 * The labels of a component's departures, from the workbench's map.
 *
 * @param {Record<string, { kind: string, text: string }[]>} marks The map.
 * @param {string[]} titles The component's story titles.
 * @returns {string[]} The labels, sorted.
 */
function departuresOf(marks, titles) {
  const labels = new Set();
  for (const title of titles) {
    for (const mark of marks[title] ?? []) {
      const label = mark.text
        .split(/\s+—\s+/)[0]
        .replace(/`/g, '')
        .trim();
      labels.add(`${mark.kind}: ${label}`);
    }
  }
  return [...labels].sort();
}

/**
 * The docs page's id, when the folder has one: Storybook's docs name for
 * the component's title.
 *
 * @param {string} root The repository's root.
 * @returns {string} The docs entry's name.
 */
export function docsName(root) {
  const main = path.join(root, SOURCES.storybookMain);
  const m = fs.existsSync(main)
    ? /defaultName:\s*['"]([^'"]+)['"]/.exec(fs.readFileSync(main, 'utf8'))
    : null;
  return m ? m[1] : 'Docs';
}

/**
 * A row's story files, sorted, the one named after the folder first.
 *
 * @param {string} root The repository's root.
 * @param {string} rel The row's folder.
 * @returns {{ stories: string[], mdx: string[] }} The files, absolute.
 */
export function storyFilesOf(root, rel) {
  const dir = path.join(root, rel, '__stories__');
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return { stories: [], mdx: [] };
  }
  const folder = path.basename(rel);
  const names = fs.readdirSync(dir).sort();
  /**
   * Whether a file is not the folder's own story file.
   *
   * @param {string} f The file's name.
   * @returns {number} 0 for the folder's own, else 1.
   */
  const own = (f) => (f.startsWith(`${folder}.`) ? 0 : 1);
  const stories = names
    .filter((f) => /\.stories\.[jt]sx?$/.test(f))
    .sort((a, b) => own(a) - own(b) || (a < b ? -1 : 1))
    .map((f) => path.join(dir, f));
  const mdx = names
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(dir, f));
  return { stories, mdx };
}

/**
 * What a row's stories say: titles, story ids, props, states, motion.
 *
 * @param {ModuleReader} reader The reader.
 * @param {string[]} files The story files.
 * @returns {object} The facts.
 */
export function storiesFacts(reader, files) {
  const titles = [];
  const ids = [];
  const argTypes = {};
  const args = {};
  let v12 = null;
  for (const file of files) {
    const { title, meta, stories } = readStoryFile(reader, file);
    if (!title) {
      continue;
    }
    titles.push(title);
    const metaParams =
      meta.parameters && typeof meta.parameters === 'object'
        ? meta.parameters
        : {};
    v12 ??=
      metaParams.v12 && typeof metaParams.v12 === 'object'
        ? metaParams.v12
        : null;
    for (const [name, at] of Object.entries(meta.argTypes ?? {})) {
      argTypes[name] ??= at;
    }
    for (const [name, value] of Object.entries(meta.args ?? {})) {
      if (!(name in args)) {
        args[name] = value;
      }
    }
    for (const story of stories) {
      ids.push(story.id);
      for (const [name, at] of Object.entries(story.argTypes)) {
        argTypes[name] ??= at;
      }
      for (const [name, value] of Object.entries(story.args)) {
        if (!(name in args)) {
          args[name] = value;
        }
      }
      v12 ??=
        story.parameters.v12 && typeof story.parameters.v12 === 'object'
          ? story.parameters.v12
          : null;
    }
  }
  return { titles, ids, argTypes, args, v12 };
}

/**
 * A list of names from `parameters.v12`, or an empty one.
 *
 * @param {unknown} value The value.
 * @returns {string[]} The names.
 */
const names = (value) =>
  Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
    : [];

/**
 * The components snapshot.
 *
 * @param {string} root The repository's root.
 * @returns {Promise<{ snapshot: object, errors: string[], missing: string[] }>} The snapshot and the manifest's findings.
 */
export async function buildComponents(root) {
  const rows = readManifest(root);
  const { blocks, errors, missing } = validateFigmaBlocks(rows);
  const reader = new ModuleReader(
    root,
    workspacePackages(root, SOURCES.components)
  );
  const marks = fs.existsSync(path.join(root, SOURCES.marks))
    ? JSON.parse(fs.readFileSync(path.join(root, SOURCES.marks), 'utf8'))
    : {};
  const resolved = readResolved(root);
  const docs = docsName(root);
  const items = [];
  let pending = 0;
  let resolvedCount = 0;
  for (const row of [...rows].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const block = blocks.get(row.id);
    if (!block) {
      continue;
    }
    const { key, ...figma } = block;
    const item = {
      key,
      id: row.id,
      kind: row.kind,
      status: row.labsStatus ?? null,
      figma,
    };
    if (row.kind !== 'styles' && row.path) {
      const files = storyFilesOf(root, row.path);
      const facts = storiesFacts(reader, files.stories);
      const props = {};
      const notMapped = [];
      const surface = new Set([
        ...VOCABULARY,
        ...(Array.isArray(block.props) ? block.props : []),
      ]);
      for (const name of [
        ...Object.keys(facts.argTypes),
        ...Object.keys(facts.args),
      ]) {
        if (name in props || notMapped.includes(name)) {
          continue;
        }
        const prop = classifyProp(name, facts.argTypes[name], facts.args[name]);
        if (prop) {
          props[name] = {
            ...prop,
            ...(surface.has(name) ? { surface: true } : {}),
          };
        } else {
          notMapped.push(name);
        }
      }
      Object.assign(item, {
        title: facts.titles[0] ?? null,
        ...(facts.titles.length > 1 ? { titles: facts.titles } : {}),
        stories: facts.ids,
        docs:
          files.mdx.length && facts.titles[0]
            ? toId(facts.titles[0], docs)
            : null,
        props,
        notMapped: notMapped.sort(),
        state: names(facts.v12?.states),
        motion: names(facts.v12?.motion),
        reduced:
          facts.v12?.reduced &&
          typeof facts.v12.reduced === 'object' &&
          !unresolved(facts.v12.reduced)
            ? facts.v12.reduced
            : {},
        departures: departuresOf(marks, facts.titles),
      });
    }
    const colors = stateColorsOf(root, row, resolved);
    for (const c of colors) {
      for (const v of Object.values(c.values)) {
        if (v.pending) {
          pending += 1;
        } else {
          resolvedCount += 1;
        }
      }
    }
    item.stateColors = colors;
    items.push(item);
  }
  const snapshot = {
    schema: 'v12-figma/components@1',
    side: 'code',
    vocabulary: VOCABULARY,
    stateColors: {
      themes: THEME_MODES,
      placeholder: PENDING,
      resolvedFrom: SOURCES.resolvedStateColors,
      resolved: resolvedCount,
      pending,
    },
    items,
  };
  return { snapshot, errors, missing };
}
