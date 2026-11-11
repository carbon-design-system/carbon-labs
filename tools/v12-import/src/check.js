/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's own checks, over every folder the manifest records and the v12
// packages: every component folder has a manifest row, the import's leak and
// motion-literal checks, and that motion comes only through the seam. CI runs
// it; an import runs the same checks per file. A finding is an error, or a
// warning when it is recorded as allowed; only errors fail the check.
//
// Rules that report as warnings only, until the lane moves onto what they
// ask for: how motion is reduced, timed and eased (the motion rules below),
// and the shared prop vocabulary (vocab.js). A `// v12-allow <rule>: <why>`
// comment on the line, or the one above, allows one site; the check counts
// those.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { CONFIG } from './config.js';
import { scanLeaks } from './doc.js';
import { motionLiterals } from './importer.js';
import { vocabFindings } from './vocab.js';

const SEAM_DIR = 'packages/v12-motion';
// Built output, and the changelog the release writes (dated, by design).
const SKIP =
  /(^|\/)(node_modules|es|lib|dist|scss|storybook-static)(\/|$)|(^|\/)CHANGELOG\.md$/;
// Motion from anywhere but the seam.
const DIRECT_MOTION =
  /^(?:@carbon-labs\/motion-(?:core|react)|@carbon-motion\/[\w-]+|@carbon\/motion|@carbon\/styles\/scss\/motion)(?:\/|$)/;

/**
 * The language the import's checks read a file as.
 *
 * @param {string} file The file.
 * @returns {'ts' | 'scss' | 'other' | null} The language, or null to skip it.
 */
function langOf(file) {
  if (/\.[cm]?[jt]sx?$/.test(file)) {
    return 'ts';
  }
  if (/\.scss$/.test(file)) {
    return 'scss';
  }
  return /\.(mdx?|css)$/.test(file) ? 'other' : null;
}

/**
 * Every checked file under a folder, by its path in the folder.
 *
 * @param {string} root The folder.
 * @returns {string[]} The files.
 */
function filesIn(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  if (fs.statSync(root).isFile()) {
    return langOf(root) ? [''] : [];
  }
  return fs
    .readdirSync(root, { recursive: true })
    .map((f) => f.split(path.sep).join('/'))
    .filter(
      (f) =>
        !SKIP.test(f) && langOf(f) && fs.statSync(path.join(root, f)).isFile()
    );
}

/**
 * The specifiers a source imports, with their lines.
 *
 * @param {string} text The source.
 * @returns {{ spec: string, line: number }[]} The specifiers.
 */
function specifiersOf(text) {
  const out = [];
  const re =
    /(?:\bfrom\s*|\bimport\s*\(?\s*|@(?:use|forward|import)\s+)['"]([^'"]+)['"]/g;
  for (const m of text.matchAll(re)) {
    out.push({ spec: m[1], line: text.slice(0, m.index).split('\n').length });
  }
  return out;
}

/**
 * The reason a `// v12-allow <rule>: <why>` comment gives, on the line or the
 * one above.
 *
 * @param {string[]} lines The file's lines.
 * @param {number} line The line, from 1.
 * @param {string} rule The rule's first word.
 * @returns {string | null} The reason, or null when there is none.
 */
function allowance(lines, line, rule) {
  const re = new RegExp(`v12-allow ${rule}:\\s*(\\S.*?)\\s*(\\*/)?$`);
  for (const l of [lines[line - 1], lines[line - 2]]) {
    const m = l === undefined ? null : re.exec(l);
    if (m) {
      return m[1];
    }
  }
  return null;
}

/**
 * The motion rules' findings in a script: reduced motion read past the seam,
 * hand-built curves, literal and padded timer delays, arithmetic on a
 * duration token, and local helpers that shadow a seam export.
 *
 * @param {string} text The source.
 * @param {string} file Its path, for the parser.
 * @returns {{ kind: string, line: number, match: string, level: 'warning' | 'allowed' }[]} The findings.
 */
export function scriptMotion(text, file) {
  const ts = createRequire(import.meta.url)('typescript');
  const rules = CONFIG.motionRules;
  const lines = text.split('\n');
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    /x$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const out = [];
  /**
   * Records a finding, allowed when a comment says why.
   *
   * @param {string} kind The rule.
   * @param {object} node Where.
   * @param {string} match What it found.
   * @param {string[]} [classes] The words an allowance must start with.
   */
  const add = (kind, node, match, classes) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    const why = allowance(lines, line, kind.split(':')[0]);
    const ok =
      why !== null && (!classes || classes.includes(why.split(/[\s:,]/)[0]));
    out.push({ kind, line, match, level: ok ? 'allowed' : 'warning' });
  };
  /**
   * The number an expression is, through `as` and parentheses.
   *
   * @param {object | undefined} node The expression.
   * @returns {number | null} The number, or null.
   */
  const numberOf = (node) => {
    let n = node;
    while (
      n &&
      (ts.isAsExpression(n) ||
        ts.isParenthesizedExpression(n) ||
        ts.isSatisfiesExpression(n))
    ) {
      n = n.expression;
    }
    return n && ts.isNumericLiteral(n) ? Number(n.text) : null;
  };
  // Numbers the file binds: constants, defaults, and constant objects' fields.
  const numbers = new Map();
  const objects = new Map();
  /**
   * Records the numbers a node binds, and walks on.
   *
   * @param {object} node The node.
   */
  const bind = (node) => {
    if (
      (ts.isVariableDeclaration(node) ||
        ts.isBindingElement(node) ||
        ts.isParameter(node)) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const init = node.initializer;
      let value = numberOf(init);
      if (
        value === null &&
        ts.isPropertyAccessExpression(init) &&
        ts.isIdentifier(init.expression)
      ) {
        value = objects.get(init.expression.text)?.get(init.name.text) ?? null;
      }
      if (value !== null) {
        numbers.set(node.name.text, value);
      }
      let object = init;
      while (ts.isAsExpression(object) || ts.isSatisfiesExpression(object)) {
        object = object.expression;
      }
      if (ts.isObjectLiteralExpression(object)) {
        const fields = new Map();
        for (const p of object.properties) {
          const v = ts.isPropertyAssignment(p) ? numberOf(p.initializer) : null;
          if (
            v !== null &&
            (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))
          ) {
            fields.set(p.name.text, v);
          }
        }
        objects.set(node.name.text, fields);
      }
    }
    ts.forEachChild(node, bind);
  };
  bind(sf);
  /**
   * Whether a delay holds a literal time: a number above zero, or a name the
   * file binds to a number above one (a scale of 1 is not a time), and no
   * motion clock.
   *
   * @param {object} expr The delay.
   * @returns {boolean} Whether it does.
   */
  const literalDelay = (expr) => {
    let found = false;
    let clocked = false;
    /**
     * Notes a literal time or a clock in a node and under it.
     *
     * @param {object} n The node.
     */
    const walk = (n) => {
      if (ts.isNumericLiteral(n) && Number(n.text) > 0) {
        found = true;
      } else if (ts.isIdentifier(n)) {
        const field =
          ts.isPropertyAccessExpression(n.parent) && n.parent.name === n;
        if (rules.clockSources.includes(n.text)) {
          clocked = true;
        } else if (!field && (numbers.get(n.text) ?? 0) > 1) {
          found = true;
        }
      }
      if (
        ts.isPropertyAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        (objects.get(n.expression.text)?.get(n.name.text) ?? 0) > 1
      ) {
        found = true;
      }
      ts.forEachChild(n, walk);
    };
    walk(expr);
    return found && !clocked;
  };
  /**
   * Whether a node multiplies or divides.
   *
   * @param {object | undefined} n The node.
   * @returns {boolean} Whether it does.
   */
  const isScale = (n) =>
    n &&
    ts.isBinaryExpression(n) &&
    (n.operatorToken.kind === ts.SyntaxKind.AsteriskToken ||
      n.operatorToken.kind === ts.SyntaxKind.SlashToken);
  /**
   * Checks a node against the rules, and walks on.
   *
   * @param {object} node The node.
   */
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : '';
      const [first, second] = node.arguments;
      if (
        name === 'matchMedia' &&
        first &&
        (ts.isStringLiteral(first) ||
          ts.isNoSubstitutionTemplateLiteral(first)) &&
        /^\(\s*prefers-reduced-motion/.test(first.text)
      ) {
        add('reduced: direct media query', node, first.text);
      }
      if ((name === 'setTimeout' || name === 'setInterval') && second) {
        const delay = second.getText(sf).replace(/\s+/g, ' ');
        if (rules.paddedDelay.test(delay)) {
          add('timer: padded fallback', node, delay);
        }
        if (literalDelay(second)) {
          add('timer: literal delay', node, delay, rules.timerClasses);
        }
      }
    }
    if (
      ts.isTemplateExpression(node) &&
      /^\s*cubic-bezier\(\s*$/.test(node.head.text)
    ) {
      add('easing: hand-built', node, node.getText(sf).slice(0, 72));
    }
    // A whole product or quotient, once, that scales a duration token by a
    // number other than 0 or 1.
    if (isScale(node) && !isScale(node.parent)) {
      let token = false;
      let number = false;
      /**
       * Notes a duration token or a number under a node.
       *
       * @param {object} n The node.
       */
      const walk = (n) => {
        if (
          ts.isElementAccessExpression(n) &&
          n.expression.getText(sf) === 'motionTokens.duration'
        ) {
          token = true;
        } else if (ts.isNumericLiteral(n) && !['0', '1'].includes(n.text)) {
          number = true;
        } else {
          ts.forEachChild(n, walk);
        }
      };
      walk(node);
      if (token && number) {
        add(
          'duration: token arithmetic',
          node,
          node.getText(sf).replace(/\s+/g, ' ')
        );
      }
    }
    if (
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      rules.seamHelpers.includes(node.name.text)
    ) {
      add('helper: shadows seam', node, node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/**
 * The end of a block that opens at `start`.
 *
 * @param {string} code The stylesheet.
 * @param {number} start Just after its `{`.
 * @returns {number} Just after its `}`.
 */
function blockEnd(code, start) {
  let depth = 1;
  let i = start;
  for (; i < code.length && depth; i++) {
    depth += code[i] === '{' ? 1 : code[i] === '}' ? -1 : 0;
  }
  return i;
}

/**
 * The motion rules' findings in a stylesheet: arithmetic on a duration token,
 * and a transition or animation that moves something without the seam's
 * clock function, which carries the reduced-motion scales. A declaration in
 * a `prefers-reduced-motion` block is the answer, not the question.
 *
 * @param {string} text The stylesheet.
 * @returns {{ kind: string, line: number, match: string, level: 'warning' | 'allowed' }[]} The findings.
 */
export function styleMotion(text) {
  const rules = CONFIG.motionRules;
  const lines = text.split('\n');
  // Comments blanked, lines kept.
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:])\/\/.*$/gm,
      (m, a) => a + ' '.repeat(m.length - a.length)
    );
  const out = [];
  /**
   * Records a finding, allowed when a comment says why.
   *
   * @param {string} kind The rule.
   * @param {number} index Where, in the stylesheet.
   * @param {string} match What it found.
   */
  const add = (kind, index, match) => {
    const line = code.slice(0, index).split('\n').length;
    const why = allowance(lines, line, kind.split(':')[0]);
    out.push({
      kind,
      line,
      match,
      level: why === null ? 'warning' : 'allowed',
    });
  };
  for (const m of code.matchAll(
    /calc\(\s*var\(--cds-motion-duration-[\w-]+\)\s*[*/]\s*[\d.]+\s*\)/g
  )) {
    add('duration: token arithmetic', m.index, m[0].replace(/\s+/g, ' '));
  }
  /**
   * Whether a property moves something on the page.
   *
   * @param {string} name The property.
   * @returns {boolean} Whether it does.
   */
  const spatial = (name) => rules.spatial.some((re) => re.test(name));
  // Keyframes that move something, by name.
  const moving = [];
  for (const m of code.matchAll(/@keyframes\s+([^\s{]+)\s*\{/g)) {
    const body = code.slice(m.index, blockEnd(code, m.index + m[0].length));
    if ([...body.matchAll(/([\w-]+)\s*:/g)].some((p) => spatial(p[1]))) {
      moving.push(m[1].replace(/^#\{[^}]*\}/, ''));
    }
  }
  const reduced = [
    ...code.matchAll(/@media[^{]*prefers-reduced-motion[^{]*\{/g),
  ].map((m) => [m.index, blockEnd(code, m.index + m[0].length)]);
  for (const m of code.matchAll(
    /(?<![\w-])(transition|transition-property|animation|animation-name)\s*:\s*((?:#\{[^}]*\}|[^;{}])+)/g
  )) {
    const [, prop, value] = m;
    if (
      reduced.some(([a, b]) => m.index > a && m.index < b) ||
      /^\s*(none|initial|inherit|unset)\s*$/.test(value) ||
      rules.clockFunctions.test(value)
    ) {
      continue;
    }
    const parts = value.split(/,(?![^(]*\))/).map((p) => p.trim());
    const moves = prop.startsWith('transition')
      ? parts.some(
          (p) => spatial(p.split(/\s+/)[0]) && !/^\S+\s+0m?s\b/.test(p)
        )
      : parts.some((p) =>
          p.split(/\s+/).some((w) => moving.some((k) => k && w.endsWith(k)))
        );
    if (moves) {
      add(
        'stylesheet: unreduced motion',
        m.index,
        `${prop}: ${value.replace(/\s+/g, ' ').trim().slice(0, 72)}`
      );
    }
  }
  return out;
}

/**
 * The findings in the lane.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ directMotion?: { file: string, spec: string }[], vocabulary?: boolean }} [options]
 *   The recorded allowances, when not the configured ones; whether to run the
 *   vocabulary rule (on by default).
 * @returns {{ kind: string, at: string, match: string, level: 'error' | 'warning' | 'allowed' }[]} The findings.
 */
export function checkLane(
  labs,
  { directMotion = CONFIG.directMotion, vocabulary = true } = {}
) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(labs, 'v12.manifest.json'), 'utf8')
  );
  const items = Array.isArray(manifest) ? manifest : (manifest.items ?? []);
  const roots = [
    ...items
      .filter((i) => i.path)
      .map((i) => ({ id: i.id, kind: i.kind, dir: i.path })),
    ...fs
      .readdirSync(path.join(labs, 'packages'))
      .filter((d) => d.startsWith('v12-'))
      .map((d) => ({ id: null, kind: 'lane', dir: `packages/${d}` })),
    { id: null, kind: 'docs', dir: 'docs/v12' },
  ];
  // A folder once, as the manifest records it when it does.
  const unique = roots.filter(
    (r, k) => roots.findIndex((o) => o.dir === r.dir) === k
  );
  const findings = [];
  /**
   * Records a finding.
   *
   * @param {string} kind The rule.
   * @param {string} at The file and line.
   * @param {string} match What it found.
   * @param {'error' | 'warning' | 'allowed'} [level] Whether it fails the
   *   check, or only reports, or a comment allows it.
   */
  const report = (kind, at, match, level = 'error') =>
    findings.push({ kind, at, match, level });
  // Every component folder has a row, so every check below opens it.
  const components = path.join(labs, 'packages/react/src/v12/components');
  const folders = fs.existsSync(components) ? fs.readdirSync(components) : [];
  for (const d of folders) {
    const dir = `packages/react/src/v12/components/${d}`;
    if (
      fs.existsSync(path.join(labs, dir, 'package.json')) &&
      !unique.some((r) => r.dir === dir)
    ) {
      report('unlisted folder', dir, d);
    }
  }
  // A v12 package stays private until its publishable pull request; a row
  // marked publishable is a package carbon-labs already publishes.
  const publishable = new Set(
    items.filter((i) => i.publishable === true).map((i) => i.path)
  );
  for (const { kind, dir } of unique) {
    const file = path.join(labs, dir, 'package.json');
    if (kind === 'styles' || publishable.has(dir) || !fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (pkg.private !== true) {
      report('not private', `${dir}/package.json`, pkg.name);
    }
  }
  // A lane package the manifest doesn't record (a draft brought as its own
  // branch) is private too: the release publishes every package that isn't.
  for (const d of folders) {
    const dir = `packages/react/src/v12/components/${d}`;
    const file = path.join(labs, dir, 'package.json');
    if (unique.some((r) => r.dir === dir) || !fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (pkg.labs?.status === 'draft' && pkg.private !== true) {
      report('not private', `${dir}/package.json`, pkg.name);
    }
  }
  const used = new Set();
  // A file once: a styles row is a file in a v12 package that is a root too.
  const scanned = new Set();
  for (const { id, kind, dir } of unique) {
    const isSeam = dir === SEAM_DIR;
    // A package brought whole keeps its own allowances and its own
    // dependency on carbon-motion, as the import does.
    const isPackage = kind === 'package';
    const allowances = isPackage
      ? (CONFIG.packages[id.replace(/^package\//, '')]?.literals ?? [])
      : (CONFIG.kitLiterals[id] ?? []);
    for (const rel of filesIn(path.join(labs, dir))) {
      const at = rel ? `${dir}/${rel}` : dir;
      const text = fs.readFileSync(path.join(labs, at), 'utf8');
      const lang = langOf(at);
      const isTest = /(^|\/)(__tests__|test)\/|\.test\.[jt]sx?$/.test(rel);
      for (const leak of scanLeaks(text, [], { code: lang === 'ts' })) {
        report(`leak (${leak.kind})`, `${at}:${leak.line}`, leak.match);
      }
      if (isSeam || lang === 'other') {
        continue;
      }
      // Literals: in source and in imported tests (titles aside), never in
      // stories, whose prose names timings; the lane's own tests assert the
      // values a build gives.
      const isStory = /(^|\/)__stories__\/|\.stories\.[jt]sx?$/.test(rel);
      const literals =
        isStory || (isTest && kind === 'lane')
          ? []
          : motionLiterals(text, lang, isTest).found;
      for (const l of literals) {
        const allowed = allowances.some(
          (a) => a.file.test(rel) && a.match.test(l.match)
        );
        if (!allowed) {
          report('motion literal', `${at}:${l.line}`, l.match);
        }
      }
      for (const { spec, line } of specifiersOf(text)) {
        if (!isPackage && DIRECT_MOTION.test(spec)) {
          const known = directMotion.findIndex(
            (a) => a.file === at && a.spec === spec
          );
          if (known >= 0) {
            used.add(known);
          }
          report(
            'motion not through the seam',
            `${at}:${line}`,
            spec,
            known >= 0 ? 'warning' : 'error'
          );
        }
      }
      // The motion rules, on the lane's own source: not a package brought
      // whole, which keeps its own engine, and not tests or stories.
      if (isPackage || isTest || isStory || scanned.has(at)) {
        continue;
      }
      scanned.add(at);
      const motion =
        lang === 'ts'
          ? /\.d\.ts$/.test(at)
            ? []
            : scriptMotion(text, at)
          : styleMotion(text);
      for (const f of motion) {
        report(f.kind, `${at}:${f.line}`, f.match, f.level);
      }
    }
  }
  // The shared prop vocabulary, over every component folder's exports.
  if (vocabulary) {
    for (const f of vocabFindings(labs)) {
      report(f.kind, f.at, f.match, 'warning');
    }
  }
  // An allowance whose import is gone comes off the list.
  directMotion.forEach((a, k) => {
    if (!used.has(k)) {
      report('stale allowance', a.file, a.spec);
    }
  });
  return findings;
}
