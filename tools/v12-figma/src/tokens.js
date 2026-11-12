/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The tokens snapshot: every value a design file's variables hold, read
// from code. The v12 themes (`themes.json`, OKLCH with a hex fallback) and
// Carbon's v11 value of each of their tokens; each component's proposed
// tokens (`proposals/tokens.json`); the numeric explorations; and
// carbon-motion's scalar tokens at the version the lane installs.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { gamutOf, parseColor, parseOklch } from './color.js';
import {
  COLLECTIONS,
  CONTEXT_MODES,
  PROPOSAL_MODES,
  SOURCES,
  THEME_MODES,
  V12_THEMES,
} from './config.js';

/** carbon-motion token types a variable can hold, and how. */
const MOTION_SCALARS = {
  duration: { type: 'number' },
  'carbon-motion.stagger-step': { type: 'number' },
  cubicBezier: { type: 'string' },
  dimension: { type: 'number' },
  number: { type: 'number' },
};

/**
 * A description's first sentence, on one line.
 *
 * @param {string | undefined} text The description.
 * @returns {string} The sentence.
 */
export function firstSentence(text) {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim();
  const m = /^(.+?[.!?])(?:\s|$)/.exec(flat);
  return m ? m[1] : flat;
}

/**
 * The scopes a design tool offers a variable in, from its type and name.
 *
 * @param {string} type The token's type.
 * @param {string} name Its CSS name without `--cds-`.
 * @returns {string[]} The scopes.
 */
function scopesFor(type, name) {
  if (type === 'color') {
    if (/(^|-)(text|label)(-|$)/.test(name)) {
      return ['TEXT_FILL'];
    }
    if (/(^|-)icon(-|$)/.test(name)) {
      return ['SHAPE_FILL', 'STROKE_COLOR'];
    }
    if (/(^|-)(border|stroke|rule|focus)(-|$)/.test(name)) {
      return ['STROKE_COLOR'];
    }
    return ['FRAME_FILL', 'SHAPE_FILL'];
  }
  if (type === 'dimension') {
    if (/radius|corner/.test(name)) {
      return ['CORNER_RADIUS'];
    }
    if (/gap|padding|spacing|inset|margin/.test(name)) {
      return ['GAP'];
    }
    return ['WIDTH_HEIGHT'];
  }
  return [];
}

/**
 * Every token under a DTCG group, with its path.
 *
 * @param {object} node The group.
 * @param {string[]} [trail] The path so far.
 * @returns {[string[], object][]} The tokens.
 */
function walk(node, trail = []) {
  if (
    node &&
    typeof node === 'object' &&
    ('$value' in node || '$type' in node)
  ) {
    return [[trail, node]];
  }
  return Object.entries(node ?? {})
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => walk(child, [...trail, key]));
}

/**
 * kebab-case to camelCase, as `@carbon/themes` names its tokens.
 *
 * @param {string} name The CSS name.
 * @returns {string} The JS name.
 */
const camel = (name) => name.replace(/-([a-z0-9])/g, (m, c) => c.toUpperCase());

/**
 * A rem or px dimension, in px at 16px to the rem.
 *
 * @param {string} text The value.
 * @returns {number | null} Pixels.
 */
function px(text) {
  const m = /^(-?[\d.]+)(rem|px)$/.exec(text.trim());
  if (!m) {
    return null;
  }
  return m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
}

/**
 * The v12 theme tokens, with Carbon's v11 value in each v11 mode.
 *
 * @param {string} root The repository's root.
 * @returns {object[]} The tokens.
 */
function themeTokens(root) {
  const { themes } = JSON.parse(
    fs.readFileSync(path.join(root, SOURCES.themes), 'utf8')
  );
  const require = createRequire(path.join(root, 'package.json'));
  const carbon = require('@carbon/themes');
  /** @type {Map<string, object>} */
  const byName = new Map();
  for (const [theme, mode] of Object.entries(V12_THEMES)) {
    for (const [trail, node] of walk(themes[theme])) {
      const css = trail.join('-');
      const ext = node.$extensions?.['org.carbon'] ?? {};
      let token = byName.get(css);
      if (!token) {
        token = {
          css: `--cds-${css}`,
          name: trail.join('/'),
          collection: COLLECTIONS.theme,
          type: 'color',
          status: ext.status ?? 'confirmed',
          rule: ext.source?.type ?? null,
          values: {},
          scopes: scopesFor('color', css),
          description: firstSentence(node.$description),
          origin: SOURCES.themes,
        };
        byName.set(css, token);
      }
      const v = node.$value;
      const lch = v.components.map((n) => Number(n.toFixed(4)));
      token.values[mode] = {
        hex: v.hex.toLowerCase(),
        alpha: v.alpha ?? 1,
        oklch: lch,
        gamut: gamutOf(v.components),
      };
    }
  }
  for (const token of byName.values()) {
    const key = camel(token.css.slice('--cds-'.length));
    for (const mode of THEME_MODES.filter((m) => !m.startsWith('v12-'))) {
      const value = carbon[mode]?.[key];
      const parsed = typeof value === 'string' ? parseColor(value) : null;
      if (parsed) {
        token.values[mode] = { ...parsed, origin: '@carbon/themes' };
      }
    }
    token.values = Object.fromEntries(
      THEME_MODES.filter((m) => token.values[m]).map((m) => [
        m,
        token.values[m],
      ])
    );
  }
  return [...byName.values()];
}

/**
 * One proposal value in one theme.
 *
 * @param {string} type The token's type.
 * @param {string} value The value, as `carbon.themes` holds it.
 * @param {string | undefined} fallback The hex fallback for an OKLCH value.
 * @returns {object} The value.
 */
function proposalValue(type, value, fallback) {
  const alias = /^\{(.+)\}$/.exec(value);
  if (alias) {
    return { alias: `--cds-${alias[1].toLowerCase()}` };
  }
  if (type === 'color') {
    const lch = parseOklch(value);
    if (lch) {
      const hex = parseColor(fallback ?? '');
      return {
        hex: hex ? hex.hex : null,
        alpha: lch.alpha,
        oklch: lch.oklch,
        gamut: gamutOf(lch.oklch),
      };
    }
    const parsed = parseColor(value);
    return parsed ?? { string: value };
  }
  if (type === 'dimension') {
    const n = px(value);
    return n === null
      ? { string: value }
      : { number: n, unit: 'px', css: value };
  }
  return { string: value };
}

/**
 * Every component's proposed tokens.
 *
 * @param {string} root The repository's root.
 * @returns {object[]} The tokens.
 */
function proposalTokens(root) {
  const base = path.join(root, SOURCES.components);
  const out = [];
  for (const folder of fs.readdirSync(base).sort()) {
    const rel = `${SOURCES.components}/${folder}/proposals/tokens.json`;
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) {
      continue;
    }
    for (const [trail, node] of walk(
      JSON.parse(fs.readFileSync(file, 'utf8'))
    )) {
      const themes = node.$extensions?.['carbon.themes'];
      if (!themes) {
        continue;
      }
      const fallback = node.$extensions?.['com.ibm.harness.fallback'] ?? {};
      const css = trail.join('-');
      const values = {};
      for (const [theme, modes] of Object.entries(PROPOSAL_MODES)) {
        if (themes[theme] == null) {
          continue;
        }
        const value = proposalValue(
          node.$type,
          String(themes[theme]),
          fallback[theme]
        );
        for (const mode of modes) {
          values[mode] = value;
        }
      }
      const ordered = Object.fromEntries(
        THEME_MODES.filter((m) => values[m]).map((m) => [m, values[m]])
      );
      const gamuts = Object.values(ordered)
        .map((v) => v.gamut)
        .filter(Boolean);
      out.push({
        css: `--cds-${css}`,
        name: trail.join('/'),
        collection: COLLECTIONS.proposals,
        type: node.$type,
        status: 'proposal',
        values: ordered,
        ...(gamuts.length
          ? { gamut: gamuts.includes('outside-srgb') ? 'outside-srgb' : 'srgb' }
          : {}),
        scopes: scopesFor(node.$type, css),
        description: firstSentence(node.$description),
        origin: rel,
      });
    }
  }
  return out;
}

/**
 * The explorations with a single numeric value: the ones a variable holds.
 * The rest (shadows, a whole look) are styles, not variables.
 *
 * @param {string} root The repository's root.
 * @returns {object[]} The tokens.
 */
function explorationTokens(root) {
  const { explorations } = JSON.parse(
    fs.readFileSync(path.join(root, SOURCES.explorations), 'utf8')
  );
  const out = [];
  for (const e of explorations) {
    const m = /^(-?[\d.]+)(px|%)\b/.exec(e.value);
    if (!m) {
      continue;
    }
    const type = m[2] === 'px' ? 'dimension' : 'number';
    out.push({
      css: null,
      scss: `$explore-${e.name}`,
      name: `explore/${e.name}`,
      collection: COLLECTIONS.explorations,
      type,
      status: 'exploring',
      values: {
        full:
          m[2] === 'px'
            ? { number: Number(m[1]), unit: 'px' }
            : { number: Number(m[1]), unit: '%' },
      },
      scopes: e.kind === 'radius' ? ['CORNER_RADIUS'] : [],
      description: '',
      origin: SOURCES.explorations,
    });
  }
  return out;
}

/**
 * The custom properties carbon-motion's stylesheet declares.
 *
 * @param {string} root The repository's root.
 * @returns {Set<string>} The properties.
 */
export function motionCustomProperties(root) {
  const css = fs.readFileSync(path.join(root, SOURCES.motionCss), 'utf8');
  return new Set(
    [...css.matchAll(/(--cds-motion-[\w-]+)\s*:/g)].map((m) => m[1])
  );
}

/**
 * carbon-motion's tokens a variable can hold: durations, easings,
 * distances, scales and stagger steps.
 *
 * @param {string} root The repository's root.
 * @returns {Promise<object[]>} The tokens.
 */
async function motionTokens(root) {
  const { tokens } = await import(
    pathToFileURL(path.join(root, SOURCES.motionTokens)).href
  );
  const declared = motionCustomProperties(root);
  const out = [];
  for (const t of Object.values(tokens)) {
    const scalar = MOTION_SCALARS[t.type];
    if (!scalar || t.visibility === 'internal') {
      continue;
    }
    const css = `--cds-motion-${t.name}`;
    let value;
    if (scalar.type === 'string') {
      value = { string: t.css };
    } else {
      // The unit as the CSS value writes it: a registry type is not always
      // the value's (a unitless scale typed as a dimension).
      const m = /^(-?[\d.]+)(px|ms|%)?$/.exec(String(t.css ?? t.value).trim());
      if (!m) {
        continue;
      }
      value = { number: Number(m[1]), ...(m[2] ? { unit: m[2] } : {}) };
    }
    out.push({
      css: declared.has(css) ? css : null,
      name: t.path.join('/'),
      collection: COLLECTIONS.motion,
      type: scalar.type,
      status: t.status,
      values: { full: value },
      scopes: [],
      description: firstSentence(t.description),
      origin: '@carbon-labs/motion-core',
    });
  }
  return out;
}

/**
 * The installed version of a package.
 *
 * @param {string} root The repository's root.
 * @param {string} file Its package.json, from the root.
 * @returns {string | null} The version.
 */
export function versionOf(root, file) {
  const p = path.join(root, file);
  return fs.existsSync(p)
    ? JSON.parse(fs.readFileSync(p, 'utf8')).version
    : null;
}

/**
 * The tokens snapshot.
 *
 * @param {string} root The repository's root.
 * @returns {Promise<object>} The snapshot.
 */
export async function buildTokens(root) {
  /**
   * Orders tokens by name.
   *
   * @param {{ name: string }} a A token.
   * @param {{ name: string }} b Another.
   * @returns {number} The order.
   */
  const byCss = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const tokens = [
    ...themeTokens(root).sort(byCss),
    ...proposalTokens(root).sort(byCss),
    ...explorationTokens(root).sort(byCss),
    ...(await motionTokens(root)).sort(byCss),
  ];
  return {
    schema: 'v12-figma/tokens@1',
    side: 'code',
    source: {
      carbonMotion: versionOf(root, SOURCES.motionPackage),
      carbonThemes: versionOf(root, SOURCES.carbonThemes),
    },
    modes: { theme: THEME_MODES, ...CONTEXT_MODES },
    collections: Object.values(COLLECTIONS),
    tokens,
  };
}
