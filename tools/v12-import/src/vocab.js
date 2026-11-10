/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The vocabulary rule: every component a v12 folder exports, resolved with
// the TypeScript checker, against the shared words in vocab.json. A prop on a
// shared axis (frame, variant, kind, size, corners) takes only the axis's
// values; a banned name is not a prop; a prop Carbon v11 deprecates is not
// carried. Carbon v11's own names and values stay where its namesake
// component has them.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const COMPONENTS = 'packages/react/src/v12/components';

/**
 * The shared words, from vocab.json beside this file.
 *
 * @returns {object} The vocabulary.
 */
export function readVocab() {
  return JSON.parse(
    fs.readFileSync(new URL('./vocab.json', import.meta.url), 'utf8')
  );
}

/**
 * The lane's component folders with an index, by their package names.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ folder: string, name: string, index: string }[]} The folders.
 */
function laneFolders(labs) {
  const root = path.join(labs, COMPONENTS);
  if (!fs.existsSync(root)) {
    return [];
  }
  return fs
    .readdirSync(root)
    .sort()
    .map((folder) => {
      const dir = path.join(root, folder);
      const pkg = path.join(dir, 'package.json');
      const index = path.join(dir, 'index.ts');
      return fs.existsSync(pkg) && fs.existsSync(index)
        ? {
            folder,
            name: JSON.parse(fs.readFileSync(pkg, 'utf8')).name,
            index,
          }
        : null;
    })
    .filter(Boolean);
}

/**
 * A type's literal values and what else it allows, undefined and null aside.
 *
 * @param {object} ts The TypeScript module.
 * @param {object} checker The type checker.
 * @param {object} type The type.
 * @returns {{ values: (string | number)[], other: string[] }} Its parts.
 */
export function partsOf(ts, checker, type) {
  const values = [];
  const other = [];
  let booleans = 0;
  const constraint = type.isTypeParameter()
    ? checker.getBaseConstraintOfType(type)
    : null;
  const whole = constraint ?? type;
  for (const t of whole.isUnion() ? whole.types : [whole]) {
    if (t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) {
      continue;
    }
    if (t.isStringLiteral() || t.isNumberLiteral()) {
      values.push(t.value);
    } else if (t.flags & ts.TypeFlags.BooleanLiteral) {
      booleans++;
    } else {
      other.push(checker.typeToString(t));
    }
  }
  if (booleans) {
    other.push('boolean');
  }
  return { values, other };
}

/**
 * A component's props: the first parameter of its first call signature.
 *
 * @param {object} ts The TypeScript module.
 * @param {object} checker The type checker.
 * @param {object} symbol The exported symbol.
 * @returns {{ decl: object, props: object[] } | null} Its props, or null when it is not a component.
 */
export function componentOf(ts, checker, symbol) {
  const name = symbol.getName();
  if (!/^[A-Z]/.test(name) || /^[A-Z0-9_]+$/.test(name)) {
    return null;
  }
  let target = symbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    target = checker.getAliasedSymbol(symbol);
  }
  if (!(target.flags & ts.SymbolFlags.Value)) {
    return null;
  }
  const decl = target.valueDeclaration ?? target.declarations?.[0];
  if (!decl) {
    return null;
  }
  const [signature] = checker
    .getTypeOfSymbolAtLocation(target, decl)
    .getCallSignatures();
  const [param] = signature?.getParameters() ?? [];
  if (!param) {
    return null;
  }
  const type = checker.getTypeOfSymbolAtLocation(param, decl);
  return { decl, props: checker.getPropertiesOfType(type) };
}

/**
 * Carbon v11's components by name: their props, the values each allows, and
 * the props its type files mark deprecated.
 *
 * @param {object} ts The TypeScript module.
 * @param {object} checker The type checker.
 * @param {object | undefined} file Carbon's type entry point.
 * @returns {Map<string, { props: Map<string, (string | number)[]>, deprecated: Set<string> }>} The components.
 */
function carbonComponents(ts, checker, file) {
  const out = new Map();
  const module = file && checker.getSymbolAtLocation(file);
  if (!module) {
    return out;
  }
  for (const symbol of checker.getExportsOfModule(module)) {
    const component = componentOf(ts, checker, symbol);
    if (!component) {
      continue;
    }
    const props = new Map();
    const deprecated = new Set();
    for (const p of component.props) {
      const decl = p.declarations?.[0];
      props.set(
        p.getName(),
        partsOf(
          ts,
          checker,
          checker.getTypeOfSymbolAtLocation(p, decl ?? component.decl)
        ).values
      );
      if (p.getJsDocTags(checker).some((t) => t.name === 'deprecated')) {
        deprecated.add(p.getName());
      }
    }
    out.set(symbol.getName(), { props, deprecated });
  }
  return out;
}

/**
 * A TypeScript program over every lane component folder's index, with the
 * lane's packages resolved to their sources, so it reads the same built or
 * not, and Carbon v11's types beside them.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {{ ts: object, program: object, checker: object, folders: { folder: string, name: string, index: string }[], carbon: object | undefined }} The program.
 */
export function laneProgram(labs) {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const folders = laneFolders(labs);
  const paths = Object.fromEntries(
    folders.map((f) => [f.name, [path.relative(labs, f.index)]])
  );
  const packages = path.join(labs, 'packages');
  for (const d of fs.existsSync(packages) ? fs.readdirSync(packages) : []) {
    const pkg = path.join(packages, d, 'package.json');
    const src = `packages/${d}/src`;
    if (
      d.startsWith('v12-') &&
      fs.existsSync(pkg) &&
      fs.existsSync(path.join(labs, src, 'index.ts'))
    ) {
      const { name } = JSON.parse(fs.readFileSync(pkg, 'utf8'));
      paths[name] = [`${src}/index.ts`];
      paths[`${name}/*`] = [`${src}/*`, `${src}/*/index.ts`];
    }
  }
  const options = {
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    resolveJsonModule: true,
    esModuleInterop: true,
    allowImportingTsExtensions: true,
    types: [],
    baseUrl: labs,
    paths,
  };
  const carbon = ts.resolveModuleName(
    '@carbon/react',
    path.join(labs, COMPONENTS, 'index.ts'),
    options,
    ts.sys
  ).resolvedModule?.resolvedFileName;
  const program = ts.createProgram(
    [...folders.map((f) => f.index), ...(carbon ? [carbon] : [])],
    options
  );
  return {
    ts,
    program,
    checker: program.getTypeChecker(),
    folders,
    carbon: carbon && program.getSourceFile(carbon),
  };
}

/**
 * Whether a declaration is the lane's own: in its sources, not in a build or
 * a dependency.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {object | undefined} decl The declaration.
 * @returns {boolean} Whether it is.
 */
export function isOwn(labs, decl) {
  const rel = path.relative(labs, decl?.getSourceFile().fileName ?? '/');
  return (
    !rel.startsWith('..') &&
    !path.isAbsolute(rel) &&
    !/(^|[\\/])(node_modules|es|lib|dist)[\\/]/.test(rel)
  );
}

/**
 * The vocabulary findings over every lane component folder.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {object} [vocab] The shared words (vocab.json by default).
 * @param {ReturnType<typeof laneProgram>} [lane] The program, when already made.
 * @returns {{ kind: string, at: string, match: string }[]} The findings.
 */
export function vocabFindings(
  labs,
  vocab = readVocab(),
  lane = laneProgram(labs)
) {
  const { ts, program, checker, folders } = lane;
  const v11 = carbonComponents(ts, checker, lane.carbon);
  const found = new Map();
  /**
   * Records a finding once per declaration, with every export that has it.
   *
   * @param {string} kind The rule.
   * @param {object} decl Where the prop is declared.
   * @param {string} prop The prop.
   * @param {string} component The export.
   * @param {string} [detail] What is wrong with it.
   */
  const report = (kind, decl, prop, component, detail = '') => {
    const file = decl.getSourceFile();
    const line = file.getLineAndCharacterOfPosition(decl.getStart()).line + 1;
    const rel = path.relative(labs, file.fileName).split(path.sep).join('/');
    const at = `${rel}:${line}`;
    const key = `${kind}|${at}|${prop}|${detail}`;
    const entry = found.get(key) ?? {
      kind,
      at,
      prop,
      detail,
      components: new Set(),
    };
    found.set(key, entry.components.add(component) && entry);
  };

  for (const f of folders) {
    const module = checker.getSymbolAtLocation(program.getSourceFile(f.index));
    if (!module) {
      continue;
    }
    for (const symbol of checker.getExportsOfModule(module)) {
      const component = componentOf(ts, checker, symbol);
      if (!component) {
        continue;
      }
      const name = symbol.getName();
      // Its Carbon v11 namesake; a skeleton answers to its component's.
      const carbonTwin =
        v11.get(name) ?? v11.get(name.replace(/Skeleton$/, ''));
      const all = new Set(component.props.map((p) => p.getName()));
      for (const p of component.props) {
        const decl = p.declarations?.[0];
        if (!isOwn(labs, decl)) {
          continue;
        }
        const prop = p.getName();
        const axis = vocab.axes[prop];
        if (axis) {
          const { values, other } = partsOf(
            ts,
            checker,
            checker.getTypeOfSymbolAtLocation(p, decl)
          );
          const twin = carbonTwin?.props.get(prop) ?? [];
          const outside = [
            ...values
              .filter(
                (v) =>
                  !(typeof v === 'number' && axis.numbers) &&
                  !axis.values.includes(v) &&
                  !twin.includes(v)
              )
              .map((v) => `'${v}'`),
            ...other.filter((o) => !(o === 'number' && axis.numbers)),
          ];
          const mixed =
            axis.numbers &&
            values.some((v) => typeof v === 'number') &&
            values.some((v) => typeof v === 'string');
          if (outside.length || mixed) {
            report(
              `vocabulary: ${prop}`,
              decl,
              prop,
              name,
              outside.length ? outside.join(' | ') : 'names and pixels mixed'
            );
          }
        }
        const banned = vocab.banned[prop];
        if (
          banned &&
          !carbonTwin?.props.has(prop) &&
          !banned.except?.includes(name)
        ) {
          report('vocabulary: banned name', decl, prop, name, banned.why);
        }
        const beside = vocab.bannedBeside[prop];
        if (beside && all.has(beside.beside)) {
          report('vocabulary: banned name', decl, prop, name, beside.why);
        }
        if (vocab.deprecated[prop] || carbonTwin?.deprecated.has(prop)) {
          report('vocabulary: v11 deprecated', decl, prop, name);
        }
      }
    }
  }
  return [...found.values()].map((e) => ({
    kind: e.kind,
    at: e.at,
    match: `${e.prop} on ${[...e.components].join(', ')}${e.detail ? `: ${e.detail}` : ''}`,
  }));
}
