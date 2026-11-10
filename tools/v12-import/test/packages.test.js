/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { planPackage, writePackage } from '../src/packages.js';

const CORE = 'packages/motion-icons-core';
const CORE_TO = 'packages/v12-motion-icons-core';
const REACT = 'packages/motion-icons';
const LANE = 'packages/react/src/v12/components/MotionIcons';

const FILES = {
  [`${CORE}/src/index.ts`]: `export { animate } from './engine/animate';\nexport { motionTokens } from './tokens';\n`,
  [`${CORE}/src/engine/animate.ts`]: `export const animate = (d: number) => d;\n`,
  [`${CORE}/src/tokens.ts`]: `import Add16 from '@carbon/icons/es/add/16.js';
// The tokens, read from \`@carbon-motion/core\`.
export { motionTokens } from '@carbon-motion/core/tokens';
export const art = Add16;
`,
  [`${CORE}/src/adapters/motionAnimate.ts`]: `import { animate } from 'motion';\nexport { animate };\n`,
  [`${CORE}/src/ink.ts`]: `export const hook = 'fill 1ms linear';\n`,
  [`${CORE}/test/helper.ts`]: `export const stub = () => null;\n`,
  [`${CORE}/test/engine.test.ts`]: `import { it } from 'vitest';
import { animate as m } from 'motion';
import { animate } from '../src/engine/animate';
import Add16 from '@carbon/icons/es/add/16.js';
it('runs', () => void [m, animate, Add16]);
`,
  [`${REACT}/src/index.ts`]: `export { Add } from './icons/Add';\n`,
  [`${REACT}/src/icons/Add.tsx`]: `import React from 'react';
import { animate } from '@carbon-next/motion-icons-core/engine/animate';
export const Add = () => <svg data-d={animate(1)} />;
`,
  [`${REACT}/src/__dev__/Probe.tsx`]: `export const Probe = () => null;\n`,
  [`${REACT}/src/icons/AddGallery.tsx`]: `import React from 'react';
import { playContentSwap } from '@carbon-motion/core';
import { Add } from './Add';
import { TOGGLES } from './gallery.registry';
export const AddGallery = () => <Add data-n={TOGGLES.length} data-p={typeof playContentSwap} />;
export const SAMPLE = "import { Add } from '@carbon-next/motion-icons';";
`,
  [`${REACT}/src/icons/gallery.registry.ts`]: `export const TOGGLES = [];\n`,
  [`${REACT}/src/icons/Gallery.stories.tsx`]: `import React from 'react';
import type { Meta } from '@storybook/react';
import { AddGallery } from './AddGallery';
const meta: Meta = {
  title: 'Motion Icons/Gallery',
  parameters: { layout: 'fullscreen' },
};
export default meta;
export const Gallery = { render: () => <AddGallery /> };
`,
  'docs/components/motion-icons.md': `# Motion icons

Icons that move. Code: \`packages/motion-icons\`.

## Motion

| Pattern | Where | Values |
| --- | --- | --- |
| Hover | The icon | In on moderate-01 |

## Decisions

- 2001-01-01, OQ-001: the handle.
`,
  [`${REACT}/src/__tests__/add.test.tsx`]: `import path from 'node:path';
import { it, vi } from 'vitest';
import { stub } from '../../../motion-icons-core/test/helper';
import { Add } from '../icons/Add';
vi.mock('@carbon-next/motion-icons-core/engine/animate', async (o) => o());
const dir = path.resolve(__dirname, '../../../motion-icons-core/src/engine');
it('renders', () => void [stub, Add, dir]);
`,
  'scripts/check-content.mjs': `export const NAMES = ['Zed'];\n`,
  'packages/motion-icons-wc/src/globals/register.ts': `export const prefix = 'cn';\n`,
  'packages/motion-icons-wc/src/index.ts': `export { prefix } from './globals/register';
export { CNIconCopy } from './icons/copy/copy';
export { CNMotionIcon } from './motion-icon';
`,
  'packages/motion-icons-wc/src/icons/copy/copy.ts': `import { prefix } from '../../globals/register';
import { animate } from '@carbon-next/motion-icons-core/engine/animate';
import { LitElement } from 'lit';
export class CNIconCopy extends LitElement {
  static readonly is = \`\${prefix}-icon-copy\`;
  static readonly changed = \`\${prefix}-icon-changed\`;
  run = animate;
}
`,
  'packages/motion-icons-wc/src/motion-icon.ts': `import { prefix } from './globals/register';
export class CNMotionIcon {
  static readonly is = \`\${prefix}-motion-icon\`;
}
`,
  'packages/motion-icons-wc/src/preupgrade.css': `:is(cn-status-pip, cn-icon-copy):not(:defined) { display: inline-block; width: 1em; height: 1em }\n`,
  'packages/motion-icons-wc/src/motion.ts': `export const motion = 1;\n`,
  'packages/motion-icons-wc/test/tags.test.ts': `import { it } from 'vitest';
it('names', () => void ['cn-icon-copy', 'cn-motion-icon', 'cn-status-pip', 'CNStatusPip']);
`,
  'packages/motion-icons-wc/docs/WebComponents.stories.tsx': `import React from 'react';
import '../src/icons/copy/index';
import '../src/motion-icon';
const meta = { title: 'Motion Icons/Web components/Examples' };
export default meta;
export const Copy = { render: () => React.createElement('cn-icon-copy') };
`,
  'packages/motion-icons-wc/docs/Other.stories.tsx': `export default { title: 'Elsewhere' };\n`,
  'packages/motion-icons-wc/custom-elements.json': `{ "modules": [{ "tagName": "cn-icon-copy", "name": "CNIconCopy" }] }\n`,
};

let tmp;
let source;
let labs;
let base;

/**
 * Runs git in the fixture source.
 *
 * @param {...string} args The git arguments.
 * @returns {string} The output.
 */
function git(...args) {
  return execFileSync(
    'git',
    [
      '-C',
      source,
      '-c',
      'user.name=fixture',
      '-c',
      'user.email=fixture@example.com',
      '-c',
      'commit.gpgsign=false',
      '-c',
      'core.hooksPath=/dev/null',
      ...args,
    ],
    { encoding: 'utf8' }
  ).trim();
}

/**
 * Writes files into the fixture source and commits them.
 *
 * @param {Record<string, string>} files The files.
 * @param {string} message The commit message.
 * @returns {string} The commit.
 */
function commit(files, message) {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(source, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  git('add', '-A');
  git('commit', '-q', '-m', message);
  return git('rev-parse', 'HEAD');
}

/**
 * One output of a plan.
 *
 * @param {object} plan The plan.
 * @param {string} p The output's path.
 * @returns {string | undefined} Its content.
 */
function output(plan, p) {
  return plan.outputs.find((o) => o.path === p)?.content;
}

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-import-pkg-'));
  source = path.join(tmp, 'source');
  labs = path.join(tmp, 'labs');
  fs.mkdirSync(source);
  git('init', '-q');
  base = commit(FILES, 'fixture');
  fs.mkdirSync(path.join(labs, 'packages/v12-motion'), { recursive: true });
  fs.writeFileSync(
    path.join(labs, 'packages/v12-motion/package.json'),
    JSON.stringify({
      dependencies: {
        '@carbon-labs/motion-core': 'portal:../../../motion/packages/core',
      },
    })
  );
  fs.writeFileSync(
    path.join(labs, 'package.json'),
    JSON.stringify({
      devDependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
    })
  );
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('a core package', () => {
  it('keeps its tree, leaves out what does not travel and licenses each file', () => {
    const plan = planPackage({
      id: 'motion-icons-core',
      from: source,
      ref: base,
      labs,
      year: 2026,
    });
    expect(plan.findings).toEqual([]);
    expect(plan.target).toBe(CORE_TO);
    expect(plan.skipped).toEqual(['src/adapters/motionAnimate.ts']);
    expect(output(plan, 'src/engine/animate.ts')).toMatch(
      /^\/\*\*\n \* Copyright IBM Corp\. 2026\n/
    );
    expect(output(plan, 'src/index.ts')).toContain(
      "export { animate } from './engine/animate';"
    );
  });

  it('names its dependencies: the seam link re-rooted, test-only ones as dev dependencies', () => {
    const plan = planPackage({
      id: 'motion-icons-core',
      from: source,
      ref: base,
      labs,
    });
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.name).toBe('@carbon-labs/motion-icons-core');
    expect(pkg.private).toBe(true);
    expect(pkg.sideEffects).toBe(false);
    expect(output(plan, 'src/tokens.ts')).toContain(
      "export { motionTokens } from '@carbon-labs/motion-core/tokens';"
    );
    // And named so in its comments: carbon-motion by its published name.
    expect(output(plan, 'src/tokens.ts')).toContain(
      '// The tokens, read from `@carbon-labs/motion-core`.'
    );
    expect(pkg.dependencies).toEqual({
      '@carbon-labs/motion-core': 'portal:../../../motion/packages/core',
      '@carbon/icons': '^11.89.0 || ^12.0.0',
    });
    expect(pkg.devDependencies.motion).toBe('^12.0.0 || ^13.0.0');
    expect(pkg.exports['./*']).toEqual({
      types: './es/*.d.ts',
      default: './es/*.js',
    });
    expect(output(plan, 'tsconfig.build.json')).toContain('"outDir": "es"');
    expect(pkg.scripts.build).toContain('node scripts/extensions.js');
  });

  it('names each relative import in es/ after tsc, so the modules load in Node', () => {
    const plan = planPackage({
      id: 'motion-icons-core',
      from: source,
      ref: base,
      labs,
    });
    const dir = fs.mkdtempSync(path.join(tmp, 'es-'));
    fs.writeFileSync(
      path.join(dir, 'ext.js'),
      output(plan, 'scripts/extensions.js')
    );
    const es = path.join(dir, 'es');
    fs.mkdirSync(path.join(es, 'engine'), { recursive: true });
    fs.writeFileSync(
      path.join(es, 'index.js'),
      "export { a } from './a';\nexport * from './engine';\nimport './a.js';\nconst b = () => import('./a');\n"
    );
    fs.writeFileSync(path.join(es, 'index.d.ts'), "export { a } from './a';\n");
    fs.writeFileSync(
      path.join(es, 'a.js'),
      "export const a = 1;\nimport '@carbon/icons/es/add/16.js';\n"
    );
    fs.writeFileSync(
      path.join(es, 'engine/index.js'),
      "export * from '../a';\n"
    );
    execFileSync(process.execPath, [path.join(dir, 'ext.js'), es]);
    expect(fs.readFileSync(path.join(es, 'index.js'), 'utf8')).toBe(
      "export { a } from './a.js';\nexport * from './engine/index.js';\nimport './a.js';\nconst b = () => import('./a.js');\n"
    );
    expect(fs.readFileSync(path.join(es, 'index.d.ts'), 'utf8')).toContain(
      "'./a.js'"
    );
    expect(fs.readFileSync(path.join(es, 'engine/index.js'), 'utf8')).toContain(
      "'../a.js'"
    );
    expect(fs.readFileSync(path.join(es, 'a.js'), 'utf8')).toContain(
      "'@carbon/icons/es/add/16.js'"
    );
  });

  it('allows a listed literal, with its reason, and refuses another', () => {
    const ref = commit(
      {
        [`${CORE}/src/engine/animate.ts`]: `export const animate = () => '200ms';\n`,
      },
      'a timing'
    );
    const plan = planPackage({
      id: 'motion-icons-core',
      from: source,
      ref,
      labs,
    });
    expect(plan.warnings).toContainEqual(
      expect.stringMatching(/^allowed literal ×1: src\/ink\.ts: 1ms \(/)
    );
    expect(plan.findings).toEqual([
      {
        kind: 'motion literal',
        where: 'src/engine/animate.ts:1',
        detail: '200ms',
      },
    ]);
  });
});

describe('a lane package', () => {
  it('renames the source packages, in imports and in mocks', () => {
    const plan = planPackage({
      id: 'motion-icons',
      from: source,
      ref: base,
      labs,
    });
    expect(plan.findings).toEqual([]);
    expect(plan.target).toBe(LANE);
    expect(plan.skipped).toEqual(['src/__dev__/Probe.tsx']);
    expect(output(plan, 'icons/Add.tsx')).toContain(
      "from '@carbon-labs/motion-icons-core/engine/animate'"
    );
    expect(output(plan, '__tests__/add.test.tsx')).toContain(
      "vi.mock('@carbon-labs/motion-icons-core/engine/animate'"
    );
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.dependencies['@carbon-labs/motion-icons-core']).toBe(
      'workspace:*'
    );
    expect(pkg.peerDependencies.react).toBe('^18.2.0 || ^19.0.0');
    // An entry beside the index: the lane build reads it, the exports name it.
    expect(pkg.labs.entries).toEqual(['clock.ts']);
    expect(pkg.exports['./clock']).toEqual({
      types: './es/clock.d.ts',
      import: './es/clock.js',
      require: './lib/clock.js',
    });
  });

  it("re-roots a test's paths into the core at the core's place in the checkout", () => {
    const plan = planPackage({
      id: 'motion-icons',
      from: source,
      ref: base,
      labs,
    });
    const test = output(plan, '__tests__/add.test.tsx');
    const up = '../../../../../../v12-motion-icons-core';
    expect(test).toContain(`from '${up}/test/helper'`);
    expect(test).toContain(`'${up}/src/engine'`);
  });

  it('refuses an import of a file that does not travel, a leak and an unmapped import', () => {
    const ref = commit(
      {
        [`${REACT}/src/icons/Add.tsx`]: `import React from 'react';
import { Probe } from '../__dev__/Probe';
import { thing } from 'left-pad';
// Tuned with Zed.
export const Add = () => <Probe thing={thing} />;
`,
      },
      'refusals'
    );
    const plan = planPackage({ id: 'motion-icons', from: source, ref, labs });
    expect(plan.findings.map((f) => [f.kind, f.where])).toEqual([
      ['import of a file that does not travel', 'icons/Add.tsx:2'],
      ['unmapped import', 'icons/Add.tsx:3'],
      ['leak (name)', 'icons/Add.tsx:11'],
    ]);
  });
});

describe("a lane package's stories", () => {
  it('moves the stories and what they render to __stories__/, its imports re-pointed', () => {
    const plan = planPackage({
      id: 'motion-icons',
      from: source,
      ref: base,
      labs,
    });
    expect(plan.findings).toEqual([]);
    const gallery = output(plan, '__stories__/AddGallery.tsx');
    expect(gallery).toContain("from '../icons/Add'");
    expect(gallery).toContain("from '../icons/gallery.registry'");
    // Through the seam, and the source's package named by its lane name.
    expect(gallery).toContain("from '@carbon-labs/v12-motion'");
    expect(gallery).toContain("from '@carbon-labs/react-motion-icons'");
    const story = output(plan, '__stories__/Gallery.stories.tsx');
    expect(story).toContain(
      "title: 'V12/Motion Icons/Gallery',\n  tags: ['alpha'],"
    );
    expect(story).toContain("from './AddGallery'");
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.devDependencies['@carbon-labs/v12-motion']).toBe('workspace:*');
    expect(pkg.dependencies['@carbon-labs/v12-motion']).toBeUndefined();
  });

  it('writes the docs page from the component doc, without its pointers or decisions', () => {
    const plan = planPackage({
      id: 'motion-icons',
      from: source,
      ref: base,
      labs,
    });
    const mdx = output(plan, '__stories__/MotionIcons.mdx');
    expect(mdx).toContain('<Meta title="V12/Motion Icons/Overview" />');
    expect(mdx).toContain('## Motion');
    expect(mdx).not.toContain('Code:');
    expect(mdx).not.toContain('Decisions');
  });
});

describe('the web components', () => {
  it("take carbon-labs' element names, through the registration prefix", () => {
    const plan = planPackage({
      id: 'motion-icons-wc',
      from: source,
      ref: base,
      labs,
    });
    expect(plan.findings).toEqual([]);
    expect(plan.skipped).toEqual(['src/motion.ts']);
    expect(output(plan, 'src/globals/register.ts')).toContain(
      "prefix = 'clabs-motion'"
    );
    const copy = output(plan, 'src/icons/copy/copy.ts');
    expect(copy).toContain('class ClabsMotionIconCopy');
    expect(copy).toContain('`${prefix}-icon-copy`');
    expect(copy).toContain(
      "from '@carbon-labs/motion-icons-core/engine/animate'"
    );
    // The generic element: `clabs-motion-icon`, not `clabs-motion-motion-icon`.
    const generic = output(plan, 'src/motion-icon.ts');
    expect(generic).toContain('class ClabsMotionIcon ');
    expect(generic).toContain('`${prefix}-icon`');
    expect(output(plan, 'test/tags.test.ts')).toContain(
      "'clabs-motion-icon-copy', 'clabs-motion-icon', 'clabs-motion-status-pip', 'ClabsMotionStatusPip'"
    );
    expect(output(plan, 'src/preupgrade.css')).toContain(
      ':is(clabs-motion-status-pip, clabs-motion-icon-copy)'
    );
    // The manifest at the root, renamed too.
    expect(output(plan, 'custom-elements.json')).toContain(
      '"tagName": "clabs-motion-icon-copy", "name": "ClabsMotionIconCopy"'
    );
  });

  it('build with tsc, the stylesheets copied, and register on import', () => {
    const plan = planPackage({
      id: 'motion-icons-wc',
      from: source,
      ref: base,
      labs,
    });
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.name).toBe('@carbon-labs/wc-motion-icons');
    expect(pkg.dependencies).toEqual({
      '@carbon-labs/motion-icons-core': 'workspace:*',
      lit: '^3.1.0',
    });
    expect(pkg.scripts.build).toMatch(
      /&& cp src\/preupgrade\.css src\/carbon-compat\.css es\/$/
    );
    expect(pkg.sideEffects).toContain('./es/icons/*/index.js');
    expect(pkg.customElements).toBe('custom-elements.json');
    expect(pkg.files).toEqual(['es', 'custom-elements.json']);
    expect(pkg.exports['./icons/*']).toEqual({
      types: './es/icons/*/index.d.ts',
      default: './es/icons/*/index.js',
    });
    expect(pkg.exports['./preupgrade.css']).toBe('./es/preupgrade.css');
    expect(pkg.exports['./*']).toBeUndefined();
    expect(
      JSON.parse(output(plan, 'tsconfig.json')).compilerOptions
        .useDefineForClassFields
    ).toBe(false);
  });
});

describe("another package's stories", () => {
  it('come into __stories__/, the elements by their exports, the title inline', () => {
    const plan = planPackage({
      id: 'motion-icons',
      from: source,
      ref: base,
      labs,
    });
    expect(plan.findings).toEqual([]);
    const story = output(plan, '__stories__/WebComponents.stories.tsx');
    expect(story).toContain(
      "import '@carbon-labs/wc-motion-icons/icons/copy';"
    );
    expect(story).toContain(
      "import '@carbon-labs/wc-motion-icons/motion-icon';"
    );
    expect(story).toContain(
      "{ title: 'V12/Motion Icons/Web components/Examples', tags: ['alpha'] }"
    );
    expect(story).toContain("createElement('clabs-motion-icon-copy')");
    expect(output(plan, '__stories__/Other.stories.tsx')).toBeUndefined();
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.devDependencies['@carbon-labs/wc-motion-icons']).toBe(
      'workspace:*'
    );
  });
});

describe('writing a package', () => {
  it('refuses a package already there unless it replaces it, keeping what the lane built', () => {
    const out = path.join(tmp, 'labs-write');
    fs.cpSync(labs, out, { recursive: true });
    const plan = planPackage({
      id: 'motion-icons-core',
      from: source,
      ref: base,
      labs: out,
    });
    writePackage(plan, { labs: out });
    const dir = path.join(out, CORE_TO);
    expect(fs.existsSync(path.join(dir, 'src/engine/animate.ts'))).toBe(true);
    fs.mkdirSync(path.join(dir, 'es'));
    fs.writeFileSync(path.join(dir, 'es/index.js'), '');
    fs.writeFileSync(path.join(dir, 'src/stale.ts'), '');
    expect(() => writePackage(plan, { labs: out })).toThrow(/--replace/);
    writePackage(plan, { labs: out, replace: true });
    expect(fs.existsSync(path.join(dir, 'es/index.js'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'src/stale.ts'))).toBe(false);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(out, 'v12.manifest.json'), 'utf8')
    );
    expect(manifest.items.map((i) => [i.id, i.kind, i.path])).toEqual([
      ['package/motion-icons-core', 'package', CORE_TO],
    ]);
  });
});
