/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Reads a component's story files without running them: each file's meta
// (title, argTypes, args, `parameters.v12`) and its stories, with every
// constant an option list names followed through the imports of the lane.
// What cannot be read statically (a call, a computed list) is kept as
// `{ $unresolved: '<source>' }`, so the snapshot says so instead of guessing.

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { storyNameFromExport, toId } from 'storybook/internal/csf';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const MAX_DEPTH = 24;

/**
 * An expression's source, on one line and cut short.
 *
 * @param {ts.Node} node The expression.
 * @param {ts.SourceFile} sf Its file.
 * @returns {string} The text.
 */
function sourceOf(node, sf) {
  const text = node.getText(sf).replace(/\s+/g, ' ').trim();
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

/**
 * A property name's text, when it is static.
 *
 * @param {ts.PropertyName} name The name.
 * @returns {string | null} The text.
 */
function nameOf(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name) ||
    ts.isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text;
  }
  if (ts.isComputedPropertyName(name)) {
    const e = name.expression;
    return ts.isStringLiteral(e) || ts.isNumericLiteral(e) ? e.text : null;
  }
  return null;
}

/** Reads modules of the lane and evaluates the constants in them. */
export class ModuleReader {
  /**
   * @param {string} root The repository's root.
   * @param {Record<string, string>} packages Workspace package names to their entry file.
   */
  constructor(root, packages = {}) {
    this.root = root;
    this.packages = packages;
    /** @type {Map<string, object>} */
    this.modules = new Map();
  }

  /**
   * A module's file, from a specifier in another.
   *
   * @param {string} spec The specifier.
   * @param {string} from The importing file.
   * @returns {string | null} The file, or null outside the lane.
   */
  resolve(spec, from) {
    let base;
    if (spec.startsWith('.')) {
      base = path.resolve(path.dirname(from), spec);
    } else if (this.packages[spec]) {
      return this.packages[spec];
    } else {
      return null;
    }
    const candidates = [
      base,
      ...EXTENSIONS.map((e) => base + e),
      ...EXTENSIONS.map((e) => path.join(base, `index${e}`)),
    ];
    // An import written with `.js` that is a TypeScript source.
    if (/\.js$/.test(base)) {
      candidates.push(
        base.replace(/\.js$/, '.ts'),
        base.replace(/\.js$/, '.tsx')
      );
    }
    return (
      candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ??
      null
    );
  }

  /**
   * A module's declarations, imports and exports, read once.
   *
   * @param {string} file The file.
   * @returns {{ sf: ts.SourceFile, file: string, locals: Map<string, ts.Expression>, imports: Map<string, { spec: string, name: string }>, exports: Map<string, { local?: string, spec?: string, name?: string }>, stars: string[], statements: ts.Statement[] }} The module.
   */
  load(file) {
    const known = this.modules.get(file);
    if (known) {
      return known;
    }
    const text = fs.readFileSync(file, 'utf8');
    const kind = /\.tsx$|\.jsx$/.test(file)
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      kind
    );
    const mod = {
      sf,
      file,
      locals: new Map(),
      imports: new Map(),
      exports: new Map(),
      stars: [],
      statements: [...sf.statements],
    };
    for (const st of sf.statements) {
      const exported = ts
        .getModifiers?.(st)
        ?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.initializer) {
            mod.locals.set(d.name.text, d.initializer);
            if (exported) {
              mod.exports.set(d.name.text, { local: d.name.text });
            }
          }
        }
      } else if (ts.isImportDeclaration(st) && st.importClause) {
        const spec = st.moduleSpecifier.text;
        const clause = st.importClause;
        if (clause.name) {
          mod.imports.set(clause.name.text, { spec, name: 'default' });
        }
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) {
          for (const el of bindings.elements) {
            mod.imports.set(el.name.text, {
              spec,
              name: (el.propertyName ?? el.name).text,
            });
          }
        } else if (bindings && ts.isNamespaceImport(bindings)) {
          mod.imports.set(bindings.name.text, { spec, name: '*' });
        }
      } else if (ts.isExportDeclaration(st)) {
        const spec = st.moduleSpecifier?.text;
        if (!st.exportClause && spec) {
          mod.stars.push(spec);
        } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
          for (const el of st.exportClause.elements) {
            const inner = (el.propertyName ?? el.name).text;
            mod.exports.set(
              el.name.text,
              spec ? { spec, name: inner } : { local: inner }
            );
          }
        }
      } else if (ts.isExportAssignment(st) && !st.isExportEquals) {
        mod.locals.set('default', st.expression);
        mod.exports.set('default', { local: 'default' });
      } else if (
        (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) &&
        st.name
      ) {
        mod.locals.set(st.name.text, st);
        if (exported) {
          mod.exports.set(st.name.text, { local: st.name.text });
        }
      }
    }
    this.modules.set(file, mod);
    return mod;
  }

  /**
   * The value a module exports under a name.
   *
   * @param {string} file The module.
   * @param {string} name The export.
   * @param {number} depth How many steps deep the reader is.
   * @returns {unknown} The value, or `{ $unresolved }`.
   */
  exported(file, name, depth) {
    const mod = this.load(file);
    const entry = mod.exports.get(name);
    if (entry?.local) {
      return this.local(mod, entry.local, depth + 1);
    }
    if (entry?.spec) {
      const target = this.resolve(entry.spec, file);
      return target
        ? this.exported(target, entry.name, depth + 1)
        : { $unresolved: `${entry.name} from ${entry.spec}` };
    }
    for (const spec of mod.stars) {
      const target = this.resolve(spec, file);
      if (!target) {
        continue;
      }
      const value = this.exported(target, name, depth + 1);
      if (!(value && typeof value === 'object' && '$unresolved' in value)) {
        return value;
      }
    }
    return { $unresolved: name };
  }

  /**
   * A name in a module's scope.
   *
   * @param {object} mod The module.
   * @param {string} name The name.
   * @param {number} depth How many steps deep the reader is.
   * @returns {unknown} The value.
   */
  local(mod, name, depth) {
    if (depth > MAX_DEPTH) {
      return { $unresolved: name };
    }
    if (mod.locals.has(name)) {
      const node = mod.locals.get(name);
      if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
        return { $code: 'function' };
      }
      return this.evaluate(node, mod, depth + 1);
    }
    const imported = mod.imports.get(name);
    if (imported) {
      const target = this.resolve(imported.spec, mod.file);
      if (!target) {
        return { $unresolved: `${imported.name} from ${imported.spec}` };
      }
      if (imported.name === '*') {
        return { $module: target };
      }
      return this.exported(target, imported.name, depth + 1);
    }
    if (name === 'undefined') {
      return undefined;
    }
    return { $unresolved: name };
  }

  /**
   * An expression's value, as far as it is static.
   *
   * @param {ts.Node} node The expression.
   * @param {object} mod Its module.
   * @param {number} [depth] How many steps deep the reader is.
   * @returns {unknown} The value.
   */
  evaluate(node, mod, depth = 0) {
    const sf = mod.sf;
    if (depth > MAX_DEPTH) {
      return { $unresolved: sourceOf(node, sf) };
    }
    while (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isNonNullExpression(node)
    ) {
      node = node.expression;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      return Number(node.text);
    }
    if (
      ts.isPrefixUnaryExpression(node) &&
      node.operator === ts.SyntaxKind.MinusToken &&
      ts.isNumericLiteral(node.operand)
    ) {
      return -Number(node.operand.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }
    if (ts.isArrayLiteralExpression(node)) {
      const out = [];
      for (const el of node.elements) {
        if (ts.isSpreadElement(el)) {
          const spread = this.evaluate(el.expression, mod, depth + 1);
          if (Array.isArray(spread)) {
            out.push(...spread);
          } else {
            return { $unresolved: sourceOf(node, sf) };
          }
        } else {
          out.push(this.evaluate(el, mod, depth + 1));
        }
      }
      return out;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const out = {};
      for (const p of node.properties) {
        if (ts.isPropertyAssignment(p)) {
          const key = nameOf(p.name);
          if (key !== null) {
            out[key] = this.evaluate(p.initializer, mod, depth + 1);
          }
        } else if (ts.isShorthandPropertyAssignment(p)) {
          out[p.name.text] = this.local(mod, p.name.text, depth + 1);
        } else if (ts.isSpreadAssignment(p)) {
          const spread = this.evaluate(p.expression, mod, depth + 1);
          if (
            spread &&
            typeof spread === 'object' &&
            !('$unresolved' in spread)
          ) {
            Object.assign(out, spread);
          }
        } else if (ts.isMethodDeclaration(p)) {
          const key = nameOf(p.name);
          if (key !== null) {
            out[key] = { $code: 'function' };
          }
        }
      }
      return out;
    }
    if (ts.isIdentifier(node)) {
      return this.local(mod, node.text, depth + 1);
    }
    if (ts.isPropertyAccessExpression(node)) {
      const object = this.evaluate(node.expression, mod, depth + 1);
      if (object && typeof object === 'object' && '$module' in object) {
        return this.exported(object.$module, node.name.text, depth + 1);
      }
      if (
        object &&
        typeof object === 'object' &&
        !('$unresolved' in object) &&
        node.name.text in object
      ) {
        return object[node.name.text];
      }
      return { $unresolved: sourceOf(node, sf) };
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'Object' &&
        node.arguments.length === 1
      ) {
        const object = this.evaluate(node.arguments[0], mod, depth + 1);
        if (
          object &&
          typeof object === 'object' &&
          !('$unresolved' in object)
        ) {
          if (callee.name.text === 'keys') {
            return Object.keys(object);
          }
          if (callee.name.text === 'values') {
            return Object.values(object);
          }
        }
      }
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.name.text === 'bind'
      ) {
        return { $code: 'function' };
      }
      return { $unresolved: sourceOf(node, sf) };
    }
    if (
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isClassExpression(node)
    ) {
      return { $code: 'function' };
    }
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      return { $code: 'jsx' };
    }
    return { $unresolved: sourceOf(node, sf) };
  }
}

/**
 * The workspace packages of the v12 components, by name, to their entry.
 *
 * @param {string} root The repository's root.
 * @param {string} components The components' folder, from the root.
 * @returns {Record<string, string>} The map.
 */
export function workspacePackages(root, components) {
  const base = path.join(root, components);
  const out = {};
  for (const folder of fs.readdirSync(base).sort()) {
    const pkg = path.join(base, folder, 'package.json');
    if (!fs.existsSync(pkg)) {
      continue;
    }
    const { name } = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    const entry = ['index.ts', 'index.tsx', 'src/index.ts']
      .map((f) => path.join(base, folder, f))
      .find((f) => fs.existsSync(f));
    if (name && entry) {
      out[name] = entry;
    }
  }
  return out;
}

/**
 * A plain object, or an empty one.
 *
 * @param {unknown} value The value.
 * @returns {Record<string, unknown>} The object.
 */
const plain = (value) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !('$unresolved' in value)
    ? value
    : {};

/**
 * One story file: its meta and its stories.
 *
 * @param {ModuleReader} reader The reader.
 * @param {string} file The story file.
 * @returns {{ title: string | null, componentId: string | null, meta: Record<string, unknown>, stories: { id: string, exportName: string, args: Record<string, unknown>, argTypes: Record<string, unknown>, parameters: Record<string, unknown> }[] }} The file's stories.
 */
export function readStoryFile(reader, file) {
  const mod = reader.load(file);
  const meta = plain(
    mod.locals.has('default') ? reader.local(mod, 'default', 0) : {}
  );
  const title = typeof meta.title === 'string' ? meta.title : null;
  const componentId =
    typeof meta.id === 'string' ? meta.id : title ? toId(title) : null;
  const exportNames = [...mod.exports.keys()].filter(
    (n) => n !== 'default' && n !== '__namedExportsOrder'
  );
  const exclude = Array.isArray(meta.excludeStories) ? meta.excludeStories : [];
  const stories = [];
  for (const exportName of exportNames) {
    if (exclude.includes(exportName)) {
      continue;
    }
    const entry = mod.exports.get(exportName);
    if (!entry.local) {
      continue;
    }
    const value = reader.local(mod, entry.local, 0);
    const story = { ...plain(value) };
    // `Name.args = {...}` and the like, after the declaration.
    for (const st of mod.statements) {
      if (
        ts.isExpressionStatement(st) &&
        ts.isBinaryExpression(st.expression) &&
        st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(st.expression.left) &&
        ts.isIdentifier(st.expression.left.expression) &&
        st.expression.left.expression.text === entry.local
      ) {
        story[st.expression.left.name.text] = reader.evaluate(
          st.expression.right,
          mod,
          0
        );
      }
    }
    if (!componentId) {
      continue;
    }
    stories.push({
      id: toId(componentId, storyNameFromExport(exportName)),
      exportName,
      args: plain(story.args),
      argTypes: plain(story.argTypes),
      parameters: plain(story.parameters),
    });
  }
  return { title, componentId, meta, stories };
}
