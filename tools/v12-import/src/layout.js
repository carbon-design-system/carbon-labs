/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The files a lane package has besides the component's own: package.json,
// tsconfig, telemetry, the story and its MDX page.

import { CONFIG } from './config.js';
import { escapeMdx } from './doc.js';
import { escapeRegExp } from './rewrite.js';

/**
 * A component id in PascalCase: `split-button` is `SplitButton`.
 *
 * @param {string} id The id.
 * @returns {string} The name.
 */
export function pascal(id) {
  return id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Where a component file goes in the lane package.
 *
 * @param {string} rel The file, relative to the component's source folder.
 * @returns {string | null} The path in the package, or null when it doesn't travel.
 */
export function targetPath(rel) {
  if (/^index\.(ts|tsx)$/.test(rel)) {
    return rel;
  }
  if (/(^|\/)__tests__\//.test(rel)) {
    return `__tests__/${rel.replace(/^(.*\/)?__tests__\//, '')}`;
  }
  if (/\.test\.(ts|tsx|js)$/.test(rel)) {
    return `__tests__/${rel}`;
  }
  if (/\.stories\.(ts|tsx|js)$/.test(rel)) {
    return `__stories__/${rel}`;
  }
  if (/\.(ts|tsx|js|scss|css|json)$/.test(rel)) {
    return `components/${rel}`;
  }
  return null;
}

/**
 * A value as TypeScript source, with single-quoted strings.
 *
 * @param {unknown} value The value.
 * @param {string} indent The current indent.
 * @returns {string} The source.
 */
function literal(value, indent) {
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    if (!value.length) {
      return '[]';
    }
    return `[\n${value.map((v) => `${inner}${literal(v, inner)},`).join('\n')}\n${indent}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) {
      return '{}';
    }
    return `{\n${keys
      .map((k) => {
        const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`;
        return `${inner}${key}: ${literal(value[k], inner)},`;
      })
      .join('\n')}\n${indent}}`;
  }
  if (typeof value === 'string') {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  return String(value);
}

/**
 * The story file: title under `V12/`, tagged `alpha`, with `parameters.v12`
 * from the doc, and a TODO for what the doc doesn't settle.
 *
 * @param {object} o The parts.
 * @param {string} o.name The component's name.
 * @param {string} [o.file] The stories' file and title name: the lane folder (default: the name).
 * @param {string} o.header The license header.
 * @param {boolean} o.exported Whether the package index exports the name.
 * @param {{ motion: string[], reduced: Record<string, string>, todo: string[] }} o.params The motion parameters.
 * @returns {string} The story source.
 */
export function storySource({ name, file = name, header, exported, params }) {
  const v12 = { motion: params.motion, reduced: params.reduced };
  const todo = params.todo.map((t) => `      // TODO ${t}`).join('\n');
  const importLine = exported
    ? `import { ${name} } from '../index';`
    : `// TODO the package index does not export ${name}.\nimport * as Kit from '../index';\nconst ${name} = (Kit as Record<string, any>).${name};`;
  return `${header.trimEnd()}

import React from 'react';
${importLine}
import mdx from './${file}.mdx';

export default {
  title: 'V12/${file}',
  component: ${name},
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: ${literal(v12, '    ').replace(/\n {4}\}$/, `\n${todo ? `${todo}\n` : ''}    }`)},
  },
};

// TODO the kit page's sections (variants, sizes, states) as stories.
export const Default = {
  args: {},
  render: (args) => <${name} {...args} />,
};
`;
}

/**
 * The MDX page from the doc's kept sections.
 *
 * @param {object} o The parts.
 * @param {string} o.name The component's name.
 * @param {string} [o.file] The stories' file name: the lane folder (default: the name).
 * @param {string} o.title The doc's title.
 * @param {{ heading: string, body: string }[]} o.sections The kept sections, the opening text first.
 * @returns {string} The MDX.
 */
export function mdxSource({ name, file = name, title, sections }) {
  const parts = [
    `import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';`,
    `import * as ${name}Stories from './${file}.stories.tsx';`,
    '',
    `<Meta of={${name}Stories} />`,
    '',
    `# ${escapeMdx(title || name)}`,
  ];
  for (const s of sections) {
    parts.push('');
    if (s.heading === 'Summary') {
      parts.push(
        escapeMdx(s.body),
        '',
        `<Canvas of={${name}Stories.Default} />`
      );
    } else {
      parts.push(`## ${escapeMdx(s.heading)}`, '', escapeMdx(s.body));
    }
  }
  if (!sections.some((s) => /^props/i.test(s.heading))) {
    parts.push('', '## Props', '', `<ArgTypes of={${name}Stories} />`);
  }
  return `${parts.join('\n')}\n`;
}

/**
 * The package's package.json, `private` and `draft` until it is usable.
 *
 * @param {object} o The parts.
 * @param {string} o.name The component's name.
 * @param {string} o.id The component's id.
 * @param {string} o.dir The package's directory in the repo.
 * @param {string} o.labsPrefix The lane's package name prefix.
 * @param {string} [o.packageName] The package's name, when not the prefix and id.
 * @param {Record<string, string>} o.dependencies The dependencies.
 * @param {Record<string, string>} o.peers The peer dependencies.
 * @param {Record<string, string>} [o.devDependencies] More dev dependencies (the tests').
 * @param {boolean} [o.tests] Whether the package has tests to run.
 * @param {{ private: boolean, labsStatus: string }} o.pkg The package rule.
 * @returns {string} The JSON.
 */
export function packageJson({
  name,
  id,
  dir,
  labsPrefix,
  packageName,
  dependencies,
  peers,
  devDependencies = {},
  tests = false,
  pkg,
}) {
  /**
   * An object with its keys in order.
   *
   * @param {Record<string, string>} o The object.
   * @returns {Record<string, string>} The sorted object.
   */
  function sorted(o) {
    return Object.fromEntries(
      Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))
    );
  }
  const json = {
    name: packageName ?? `${labsPrefix}${id}`,
    version: '0.0.0',
    private: pkg.private,
    type: 'module',
    description: `Carbon Labs - ${name} for React (v12)`,
    labs: { status: pkg.labsStatus, title: `V12 ${id.replace(/-/g, ' ')}` },
    license: 'Apache-2.0',
    repository: {
      type: 'git',
      url: 'https://github.com/carbon-design-system/carbon-labs',
      directory: dir,
    },
    types: './es/index.d.ts',
    exports: {
      '.': { import: './es/index.js', require: './lib/index.js' },
      './es/*': './es/*',
      './lib/*': './lib/*',
      './scss/*': './scss/*',
    },
    files: ['es', 'lib', 'scss', 'telemetry.yml'],
    scripts: {
      build: 'node ../../../../tasks/build.js',
      clean: 'rimraf es lib scss',
      // No telemetry postinstall while private: nothing installs the package,
      // and many postinstalls racing for one binary break installs. The
      // publishable pull request adds it, with telemetry.yml already here.
      ...(tests ? { test: 'vitest run' } : {}),
    },
    dependencies: sorted(dependencies),
    peerDependencies: sorted(peers),
    devDependencies: sorted({
      '@carbon-labs/utilities': '0.28.0',
      ...devDependencies,
    }),
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

/**
 * The package's tsconfig, the lane's with the automatic JSX runtime the kit
 * is written for. Symlinks are kept as they are: the lane packages are
 * workspace links.
 *
 * @returns {string} The JSON.
 */
export function tsconfigJson() {
  const json = {
    extends: 'typescript-config-carbon/tsconfig.base.json',
    compilerOptions: {
      jsx: 'react-jsx',
      noImplicitAny: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: 'bundler',
      preserveSymlinks: true,
    },
    include: ['**/*.ts', '**/*.tsx'],
    exclude: [
      '**/__stories__/*.stories.tsx',
      '**/__tests__/*',
      '**/*.d.ts',
      'node_modules',
      'dist',
    ],
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

/**
 * The packages the tool brings whole that are not `react-` ones, inline in
 * tests as the seam is.
 *
 * @returns {string} One pattern a line, as the config's source writes it.
 */
function inlinePackages() {
  return Object.values(CONFIG.packages)
    .map((p) => p.name)
    .filter((n) => !n.startsWith(CONFIG.target.labsPrefix))
    .map((n) => `          /${escapeRegExp(n)}/,\n`)
    .join('');
}

/**
 * The package's vitest config: the kit's tests run as they do in the kit, in
 * Node (they render to strings and read no DOM; jsdom's URL is not the one
 * `node:fs` reads), with the seam's link to the motion packages kept by its
 * linked path.
 *
 * @param {string} header The license header.
 * @returns {string} The source.
 */
export function vitestConfig(header) {
  return `${header.trimEnd()}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Lane packages are workspace links; they, and the motion packages
  // behind the seam, run inline.
  resolve: { preserveSymlinks: true },
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: [
          /@carbon-labs\\/motion-/,
          /@carbon-labs\\/v12-motion/,
          /@carbon-labs\\/react-/,
${inlinePackages()}        ],
      },
    },
  },
});
`;
}
