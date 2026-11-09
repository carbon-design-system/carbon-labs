/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  dropUnknownDisables,
  fixWritten,
  formatWritten,
  importedOnly,
  laneName,
  laneReaches,
  planImport,
} from '../src/importer.js';
import { vitestConfig } from '../src/layout.js';
import {
  dropTokenFallbacks,
  rewritePrefix,
  tokenValues,
} from '../src/rewrite.js';
import { planStyles } from '../src/styles.js';

const BIN = fileURLToPath(new URL('../bin/v12-import.js', import.meta.url));
const HEADER = `/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

const FILES = {
  'packages/kit/src/widget/index.ts': `${HEADER}
export { Widget } from './Widget';
`,
  'packages/kit/src/widget/Widget.tsx': `${HEADER}
import { usePrefersReducedMotion } from '@carbon-motion/react';
import { IconButton } from '../tooltip';
import './widget.scss';

export function Widget({ size = 'md' }: { size?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={\`cn-widget cn-widget--\${size}\`} data-cn-zone="">
      <IconButton className="cn-widget__close" data-reduced={reduced} />
    </div>
  );
}
`,
  'packages/kit/src/widget/widget.scss': `@use '../styles/rollover' as *;

.cn-widget {
  padding: 8px;
  background: var(--cn-surface, #f4f4f4);
}

.cn-widget__close.cn-widget--md {
  color: var(--a);
}
`,
  'packages/kit/src/tooltip/index.ts': `${HEADER}
export const IconButton = () => null;
`,
  'packages/kit/src/styles/_rollover.scss': '',
  'docs/components/widget.md': `# Widget

A small surface with a close button. Page: \`#/components/widget\`. Code:
\`packages/kit/src/widget/\`.

## Motion

| Pattern | Where | Values |
| --- | --- | --- |
| Fade | Opening | In on fast-02 |
| Reduced motion | Every change | The fade lands at once |

## Props beyond Carbon's

| Prop | What it does |
| --- | --- |
| \`size\` | The size. Default md. |

## Decisions

- 2026-10-28, TASK-001: the widget fades.

## Open questions

1. Should it slide? See OQ-001.
`,
  'docs/carbon-labs/departures-ledger.md': `# Departures ledger

## Entries

| Name | Kind | Domain | What it is | Our value | Carbon fallback | Used in | Source | Chat stack / harness |
|---|---|---|---|---|---|---|---|---|
| \`widget-fill\` | explore | color | The widget's quiet fill | \`--cn-surface\` | \`$layer-01\` | \`widget/widget.scss:5\`; \`card/card.scss:3\` | doc | none |
| \`widget-axes\` | proposal | api | The widget's size axis | \`size\` | none | \`widget/\` | doc | none |

## Counts
`,
  'scripts/check-content.mjs': `export const NAMES = ['Zed'];\n`,
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
 * Runs the command line.
 *
 * @param {...string} args The arguments.
 * @returns {{ status: number, stdout: string, stderr: string }} The result.
 */
function cli(...args) {
  const res = spawnSync(process.execPath, [BIN, ...args, '--labs', labs], {
    encoding: 'utf8',
    env: { ...process.env, INIT_CWD: tmp },
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

/**
 * One output of a plan.
 *
 * @param {object} plan The plan.
 * @param {string} p The output's path.
 * @returns {string} Its content.
 */
function output(plan, p) {
  return plan.outputs.find((o) => o.path === p)?.content;
}

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-import-'));
  source = path.join(tmp, 'source');
  labs = path.join(tmp, 'labs');
  fs.mkdirSync(source);
  git('init', '-q');
  base = commit(FILES, 'fixture');
  fs.mkdirSync(path.join(labs, 'packages/v12-motion/src'), { recursive: true });
  fs.writeFileSync(
    path.join(labs, 'packages/v12-motion/src/index.ts'),
    "export { usePrefersReducedMotion } from '@carbon-motion/react';\n"
  );
  fs.writeFileSync(
    path.join(labs, 'package.json'),
    JSON.stringify({ devDependencies: { '@carbon/react': '^1.0.0' } })
  );
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('rewrites', () => {
  it('maps motion to the seam and kit imports to lane packages', () => {
    const plan = planImport({ id: 'widget', from: source, ref: base, labs });
    const tsx = output(plan, 'components/Widget.tsx');
    expect(tsx).toContain("from '@carbon-labs/v12-motion'");
    expect(tsx).toContain("from '@carbon-labs/react-tooltip'");
    expect(tsx).not.toContain('@carbon-motion');
    expect(output(plan, 'index.ts')).toContain("from './components/Widget'");
    expect(plan.rewrites.imports['motion → seam']).toBe(1);
    expect(plan.rewrites.imports['kit relative → labs package']).toBe(1);
    expect(plan.dependencies.kit.map((d) => d.package)).toEqual([
      '@carbon-labs/react-tooltip',
    ]);
    expect(plan.dependencies.kit[0].symbols).toEqual(['IconButton']);
    expect(plan.dependencies.seamGaps).toEqual([]);
    expect(plan.motion).toEqual(['usePrefersReducedMotion']);
  });

  it('rewrites the cn prefix to cds, by kind', () => {
    const plan = planImport({ id: 'widget', from: source, ref: base, labs });
    const tsx = output(plan, 'components/Widget.tsx');
    const scss = output(plan, 'components/widget.scss');
    expect(tsx).toContain('`cds-widget cds-widget--${size}`');
    expect(tsx).toContain('className="cds-widget__close"');
    expect(tsx).toContain('data-cds-zone');
    expect(scss).toContain('.cds-widget__close.cds-widget--md');
    expect(scss).toContain('var(--cds-surface, #f4f4f4)');
    expect(scss).toContain(
      "@use '@carbon-labs/v12-styles/scss/rollover' as *;"
    );
    expect(`${tsx}${scss}`).not.toMatch(/(?<![\w-])cn-/);
    expect(plan.rewrites.prefix).toEqual({
      'class string': 3,
      'custom property': 1,
      'data attribute': 1,
      selector: 3,
    });
  });

  it("gives every file carbon-labs' license header, keeping the first year", () => {
    const plan = planImport({
      id: 'widget',
      from: source,
      ref: base,
      labs,
      year: 2026,
    });
    expect(output(plan, 'components/Widget.tsx')).toMatch(
      /^\/\*\*\n \* Copyright IBM Corp\. 2025, 2026\n/
    );
    expect(output(plan, 'components/widget.scss')).toMatch(
      /^\/\/\n\/\/ Copyright IBM Corp\. 2026\n/
    );
    expect(plan.rewrites.license).toEqual({ replaced: 2, added: 1 });
  });

  it('counts each kind of prefix on its own', () => {
    const { text, counts } = rewritePrefix(
      "el.dataset.cnKey = 'cn-a'; // .cn-b",
      'ts',
      { from: 'cn', to: 'cds' }
    );
    expect(text).toBe("el.dataset.cdsKey = 'cds-a'; // .cds-b");
    expect(counts).toEqual({ 'dataset key': 1, 'class string': 1, comment: 1 });
  });
});

describe('marks', () => {
  it('marks the ledger rows that name the component', () => {
    const plan = planImport({ id: 'widget', from: source, ref: base, labs });
    const scss = output(plan, 'components/widget.scss').split('\n');
    const at = scss.findIndex((l) => l.includes('@carbon-explore widget-fill'));
    expect(scss[at]).toBe(
      "  // @carbon-explore widget-fill — The widget's quiet fill. TBD"
    );
    expect(scss[at + 1]).toContain('background: var(--cds-surface');
    expect(plan.marks.proposals).toEqual([
      "api: widget-axes — The widget's size axis. TBD",
    ]);
    expect(output(plan, 'proposals/README.md')).toContain('api: widget-axes');
  });
});

describe('the doc and the story', () => {
  it('keeps the travelling sections and drops the rest', () => {
    const plan = planImport({ id: 'widget', from: source, ref: base, labs });
    const mdx = output(plan, '__stories__/Widget.mdx');
    expect(mdx).toContain('## Motion');
    expect(mdx).toContain("## Props beyond Carbon's");
    expect(mdx).not.toContain('Decisions');
    expect(mdx).not.toContain('2026-10-28');
    expect(mdx).not.toContain('Page:');
    expect(plan.doc.dropped.map((d) => d.heading)).toEqual([
      'Decisions',
      'Open questions',
    ]);
    expect(plan.findings).toEqual([]);
  });

  it('keeps fenced code in the opening text as it is', () => {
    const ref = commit(
      {
        'docs/components/widget.md': FILES['docs/components/widget.md'].replace(
          '`packages/kit/src/widget/`.\n',
          '`packages/kit/src/widget/`.\n\n```tsx\nimport { Widget } from \'@carbon-next/kit/widget\';\n\n<Widget size="sm" />\n```\n\nA closing line\nover two lines.\n'
        ),
      },
      'code in the summary'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    const mdx = output(plan, '__stories__/Widget.mdx');
    expect(mdx).toContain(
      '```tsx\nimport { Widget } from \'@carbon-labs/react-widget\';\n\n<Widget size="sm" />\n```'
    );
    expect(mdx).toContain('A closing line over two lines.');
    expect(mdx).not.toContain('Page:');
    git('reset', '-q', '--hard', base);
  });

  it('writes the story under V12 with the motion parameters', () => {
    const plan = planImport({ id: 'widget', from: source, ref: base, labs });
    const story = output(plan, '__stories__/Widget.stories.tsx');
    expect(story).toContain("title: 'V12/Widget'");
    expect(story).toContain("tags: ['alpha']");
    expect(plan.story.motion).toEqual(['fade']);
    expect(plan.story.reduced).toEqual({ fade: 'at-once' });
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.name).toBe('@carbon-labs/react-widget');
    expect(pkg.private).toBe(true);
    expect(pkg.labs.status).toBe('draft');
    expect(pkg.dependencies['@carbon-labs/v12-motion']).toBe('workspace:*');
    expect(pkg.dependencies['@carbon-labs/react-tooltip']).toBe('workspace:*');
  });
});

describe('refusals', () => {
  it('refuses a date left in kept text, and writes nothing', () => {
    const ref = commit(
      {
        'docs/components/widget.md': FILES['docs/components/widget.md'].replace(
          'In on fast-02',
          'In on fast-02 since 2026-10-01'
        ),
      },
      'leak'
    );
    const out = path.join(tmp, 'out-leak');
    const res = cli('widget', '--from', source, '--ref', ref, '--out', out);
    expect(res.status).toBe(1);
    expect(res.stdout).toContain('leak (date)');
    expect(res.stdout).toContain('Refused: nothing written.');
    expect(fs.existsSync(out)).toBe(false);
    git('reset', '-q', '--hard', base);
  });

  it('refuses a doc that points back at the source repository', () => {
    const ref = commit(
      {
        'docs/components/widget.md': FILES['docs/components/widget.md'].replace(
          'In on fast-02',
          'In on fast-02, as in apps/prototypes'
        ),
      },
      'source pointer'
    );
    const out = path.join(tmp, 'out-source');
    const res = cli('widget', '--from', source, '--ref', ref, '--out', out);
    expect(res.status).toBe(1);
    expect(res.stdout).toContain('leak (source repository)');
    expect(fs.existsSync(out)).toBe(false);
    git('reset', '-q', '--hard', base);
  });

  it('refuses a name, an unmapped import and a motion literal', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/widget.scss': `${FILES['packages/kit/src/widget/widget.scss']}
.cn-widget--open {
  transition: opacity 240ms cubic-bezier(0.2, 0, 0.38, 0.9);
}
`,
        'packages/kit/src/widget/extra.ts': `${HEADER}
// As Zed asked.
import debounce from 'lodash/debounce';
export const later = debounce;
`,
      },
      'refusals'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    const kinds = plan.findings.map((f) => f.kind).sort();
    expect(kinds).toEqual([
      'leak (name)',
      'motion literal',
      'motion literal',
      'unmapped import',
    ]);
    git('reset', '-q', '--hard', base);
  });

  it('refuses a package name another workspace has', () => {
    const rootFile = path.join(labs, 'package.json');
    const root = fs.readFileSync(rootFile, 'utf8');
    const other = path.join(labs, 'packages/react/src/components/Widget');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(
      path.join(other, 'package.json'),
      JSON.stringify({ name: '@carbon-labs/react-widget' })
    );
    fs.writeFileSync(
      rootFile,
      JSON.stringify({
        ...JSON.parse(root),
        workspaces: ['packages/*/src/components/*'],
      })
    );
    try {
      const plan = planImport({ id: 'widget', from: source, ref: base, labs });
      expect(plan.findings).toContainEqual({
        kind: 'package name taken',
        where: 'package.json',
        detail:
          '@carbon-labs/react-widget is packages/react/src/components/Widget',
      });
    } finally {
      fs.writeFileSync(rootFile, root);
      fs.rmSync(path.join(labs, 'packages/react'), {
        recursive: true,
        force: true,
      });
    }
  });
});

describe("another folder's style sheet", () => {
  it('keeps its path when a script imports it for its side effect', () => {
    const ref = commit(
      {
        'packages/kit/src/panel/index.ts': `${HEADER}
export { Panel } from './Panel';
`,
        'packages/kit/src/panel/Panel.tsx': `${HEADER}
import '../tooltip/tooltip.scss';

export const Panel = () => null;
`,
        'packages/kit/src/tooltip/tooltip.scss': '',
      },
      'panel'
    );
    const plan = planImport({ id: 'panel', from: source, ref, labs });
    expect(output(plan, 'components/Panel.tsx')).toContain(
      "import '@carbon-labs/react-tooltip/scss/tooltip.scss';"
    );
  });
});

describe('a file at the kit root', () => {
  it('imports props.ts and its test as their own package', () => {
    const ref = commit(
      {
        'packages/kit/src/props.ts': `${HEADER}
import { useMemo } from 'react';
import { IconButton } from './tooltip';

export type Frame = 'ghost' | 'inset';
export const useFrame = (f: Frame) => useMemo(() => [f, IconButton], [f]);
`,
        'packages/kit/src/props.test.ts': `import { it } from 'vitest';
import { useFrame } from './props';

it('takes a frame', () => useFrame('ghost'));
`,
      },
      'props'
    );
    const plan = planImport({ id: 'props', from: source, ref, labs });
    expect(plan.findings).toEqual([]);
    expect(plan.target).toBe('packages/react/src/v12/components/Props');
    expect(plan.files.map((f) => [f.from, f.to])).toEqual([
      ['props.test.ts', '__tests__/props.test.ts'],
      ['props.ts', 'components/props.ts'],
    ]);
    // A sibling folder is another package; the test still reaches the file.
    expect(output(plan, 'components/props.ts')).toContain(
      "from '@carbon-labs/react-tooltip'"
    );
    expect(output(plan, '__tests__/props.test.ts')).toContain(
      "from '../components/props'"
    );
    expect(output(plan, 'index.ts')).toContain(
      "export * from './components/props';"
    );
    expect(plan.dependencies.kit.map((d) => d.id)).toEqual(['tooltip']);
    // Its test runs with vitest, in the package.
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.devDependencies.vitest).toBeDefined();
    expect(pkg.devDependencies.jsdom).toBeUndefined();
    expect(output(plan, 'vitest.config.ts')).toContain("environment: 'node'");
    // Sibling lane packages load the seam, so they run inline as it does.
    expect(output(plan, 'vitest.config.ts')).toContain(
      '/@carbon-labs\\/react-/'
    );
    git('reset', '-q', '--hard', base);
  });

  it('still refuses an id that is neither a folder nor a file', () => {
    expect(() =>
      planImport({ id: 'nothing', from: source, ref: base, labs })
    ).toThrow(/empty or missing/);
  });
});

/**
 * A second carbon-labs checkout with the seam and these lane packages, each
 * with a package.json and the index given.
 *
 * @param {string} name The checkout's folder name.
 * @param {Record<string, string>} lane The lane packages: folder to index source.
 * @param {Record<string, string>} [files] More files, by path.
 * @returns {string} The checkout.
 */
function labsWith(name, lane, files = {}) {
  const dir = path.join(tmp, name);
  fs.cpSync(labs, dir, { recursive: true });
  fs.rmSync(path.join(dir, 'packages/react'), { recursive: true, force: true });
  fs.rmSync(path.join(dir, 'v12.manifest.json'), { force: true });
  for (const [folder, index] of Object.entries(lane)) {
    const pkg = path.join(dir, 'packages/react/src/v12/components', folder);
    fs.mkdirSync(pkg, { recursive: true });
    const id = folder.replace(
      /[A-Z]/g,
      (c, i) => `${i ? '-' : ''}${c.toLowerCase()}`
    );
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      JSON.stringify({ name: `@carbon-labs/react-${id}` })
    );
    fs.writeFileSync(path.join(pkg, 'index.ts'), index);
  }
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

describe('test-only kit dependencies', () => {
  it('holds back the tests that wait on a kit folder not in the lane', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/widget.test.tsx': `import { it } from 'vitest';
import { Widget } from './Widget';

it('renders', () => Widget({}));
`,
        'packages/kit/src/widget/with-card.test.tsx': `import { expect, it } from 'vitest';
import { Card } from '../card';
import { IconButton } from '../tooltip';
import { Widget } from './Widget';

it('sits in a card', () => expect([Card, IconButton, Widget]).toBeDefined());
it('waits', () => expect('120ms').toBeTruthy());
`,
      },
      'test-only deps'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.testsWaiting).toEqual([
      {
        file: '__tests__/with-card.test.tsx',
        from: 'with-card.test.tsx',
        waitingOn: ['card'],
      },
    ]);
    // Its findings and its file go with it; the other test stays.
    expect(plan.findings).toEqual([]);
    expect(plan.outputs.map((o) => o.path)).toContain(
      '__tests__/widget.test.tsx'
    );
    expect(plan.outputs.map((o) => o.path)).not.toContain(
      '__tests__/with-card.test.tsx'
    );
    expect(plan.dependencies.kit.map((d) => d.id)).toEqual(['tooltip']);
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.dependencies['@carbon-labs/react-card']).toBeUndefined();
    expect(pkg.devDependencies['@carbon-labs/react-card']).toBeUndefined();
    expect(pkg.scripts.test).toBe('vitest run');
    expect(plan.manifest.testsWaiting).toEqual([
      { file: 'with-card.test.tsx', waitingOn: ['card'] },
    ]);
    git('reset', '-q', '--hard', base);
  });

  it('keeps a test whose kit folder is in the lane, as a dev dependency', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/with-card.test.tsx': `import { expect, it } from 'vitest';
import { Card } from '../card';

it('sits in a card', () => expect(Card).toBeDefined());
`,
      },
      'test-only dep in the lane'
    );
    const lane = labsWith('labs-card', {
      Card: 'export const Card = () => null;\n',
    });
    const plan = planImport({ id: 'widget', from: source, ref, labs: lane });
    expect(plan.testsWaiting).toEqual([]);
    const card = plan.dependencies.kit.find((d) => d.id === 'card');
    expect(card).toMatchObject({ inLane: true, testOnly: true });
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.dependencies['@carbon-labs/react-card']).toBeUndefined();
    expect(pkg.devDependencies['@carbon-labs/react-card']).toBe('workspace:*');
    expect(plan.manifest.testsWaiting).toBeUndefined();
    git('reset', '-q', '--hard', base);
  });

  it('writes no test runner when every test waits', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/with-card.test.tsx': `import { it } from 'vitest';
import { Card } from '../card';

it('sits in a card', () => Card);
`,
      },
      'every test waits'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.testsWaiting.map((t) => t.file)).toEqual([
      '__tests__/with-card.test.tsx',
    ]);
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.scripts.test).toBeUndefined();
    expect(pkg.devDependencies.vitest).toBeUndefined();
    expect(output(plan, 'vitest.config.ts')).toBeUndefined();
    git('reset', '-q', '--hard', base);
  });
});

const TOKENS_CSS = `:root {
  --cds-motion-distance-sm: 8px;
  --cds-motion-duration-instant: 0ms;
  --cds-motion-duration-fast-02: 120ms;
  --cds-motion-easing-standard-productive: cubic-bezier(0.4, 0, 0.2, 1);
  --cds-motion-role-exit-duration: var(--cds-motion-duration-fast-02);
}
@media (prefers-reduced-motion: reduce) {
  :root { --cds-motion-role-exit-duration: 1ms; }
}
`;

describe('motion token fallbacks', () => {
  it('drops a fallback equal to the token, and keeps one that differs', () => {
    const tokens = tokenValues(TOKENS_CSS);
    // A token two rules give two values has no one value.
    expect(tokens.has('--cds-motion-role-exit-duration')).toBe(false);
    const { text, dropped } = dropTokenFallbacks(
      `.a {
  transition: opacity var(--cds-motion-duration-fast-02, 120ms)
    var(--cds-motion-easing-standard-productive, cubic-bezier(0.4,0,0.2,1));
  /* var(--cds-motion-duration-fast-02, 120ms) */
  transition-delay: var(--cds-motion-duration-fast-02, 110ms);
  transition-duration: var(--cds-motion-role-exit-duration, 120ms);
  translate: var(--cds-motion-distance-sm, 8px);
  transition-delay: var(--cds-motion-duration-instant, 0ms);
}
`,
      'scss',
      tokens
    );
    expect(dropped).toBe(2);
    expect(text).toContain(
      'opacity var(--cds-motion-duration-fast-02)\n    var(--cds-motion-easing-standard-productive);'
    );
    expect(text).toContain('/* var(--cds-motion-duration-fast-02, 120ms) */');
    expect(text).toContain('var(--cds-motion-duration-fast-02, 110ms)');
    expect(text).toContain('var(--cds-motion-role-exit-duration, 120ms)');
    // Not a timing: left as written.
    expect(text).toContain('var(--cds-motion-distance-sm, 8px)');
    expect(text).toContain('var(--cds-motion-duration-instant, 0ms)');
  });

  it('passes a component whose fallbacks equal their tokens', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/widget.scss': `${FILES['packages/kit/src/widget/widget.scss']}
.cn-widget--open {
  transition: opacity var(--cds-motion-duration-fast-02, 120ms);
}
`,
      },
      'token fallback'
    );
    const lane = labsWith(
      'labs-tokens',
      {},
      {
        'packages/v12-motion/es/tokens.css': TOKENS_CSS,
      }
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs: lane });
    expect(plan.findings).toEqual([]);
    expect(plan.rewrites.tokenFallbacks).toEqual({ dropped: 1 });
    expect(output(plan, 'components/widget.scss')).toContain(
      'transition: opacity var(--cds-motion-duration-fast-02);'
    );
    // Without the token layer nothing is dropped, and the literal refuses.
    const bare = planImport({ id: 'widget', from: source, ref, labs });
    expect(bare.findings.map((f) => f.kind)).toEqual(['motion literal']);
    git('reset', '-q', '--hard', base);
  });
});

describe('motion modules taken whole', () => {
  it('maps export * from a motion subpath to the seam subpath', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/index.ts': `${FILES['packages/kit/src/widget/index.ts']}export * from '@carbon-motion/react/motion/selection';
export * from '@carbon-motion/react/motion/placement';
`,
        'packages/kit/src/widget/ns.ts': `${HEADER}
import * as sel from '@carbon-motion/react/motion/selection';
export const engine = sel;
`,
      },
      'motion wildcards'
    );
    const lane = labsWith(
      'labs-subpath',
      {},
      {
        'packages/v12-motion/package.json': JSON.stringify({
          name: '@carbon-labs/v12-motion',
          exports: {
            '.': './es/index.js',
            './selection': './es/selection.js',
            './scss/*': './scss/*',
          },
        }),
        'packages/v12-motion/src/selection.ts':
          "export * from '@carbon-motion/react/motion/selection';\n",
      }
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs: lane });
    const index = output(plan, 'index.ts');
    expect(index).toContain(
      "export * from '@carbon-labs/v12-motion/selection';"
    );
    expect(output(plan, 'components/ns.ts')).toContain(
      "import * as sel from '@carbon-labs/v12-motion/selection';"
    );
    expect(plan.rewrites.imports['motion → seam subpath']).toBe(2);
    // No subpath forwards placement: refused, not the whole seam.
    expect(plan.findings).toEqual([
      expect.objectContaining({
        kind: 'unmapped import',
        where: 'index.ts:10',
        detail: expect.stringContaining(
          'export * from @carbon-motion/react/motion/placement'
        ),
      }),
    ]);
    expect(index).not.toMatch(/export \* from '@carbon-labs\/v12-motion';/);
    git('reset', '-q', '--hard', base);
  });
});

describe('names taken from a sibling package file', () => {
  const SNAP = {
    'packages/kit/src/snap/index.ts': `${HEADER}
export { surfaceBox } from './by-size';
`,
    'packages/kit/src/snap/by-size.ts': `${HEADER}
export const surfaceBox = 1;
`,
    'packages/kit/src/snap/ease.ts': `${HEADER}
export const exitPullbackStyle = {};
export type Ease = 'pull';
const hidden = 2;
`,
    'packages/kit/src/widget/pull.ts': `${HEADER}
import { exitPullbackStyle, type Ease } from '../snap/ease';
import { surfaceBox } from '../snap';
export const pull: [unknown, Ease, number] = [exitPullbackStyle, 'pull', surfaceBox];
`,
    'packages/kit/src/tooltip/hide.ts': `${HEADER}
import { hidden } from '../snap/ease';
export const h = hidden;
`,
  };

  it("adds to a package's index what other folders take from its files", () => {
    const ref = commit(SNAP, 'snap');
    const plan = planImport({ id: 'snap', from: source, ref, labs });
    const index = output(plan, 'index.ts');
    expect(index).toContain(
      "export { exitPullbackStyle } from './components/ease';"
    );
    expect(index).toContain("export type { Ease } from './components/ease';");
    expect(index).not.toContain('hidden');
    expect(plan.indexAdded.map((a) => [a.name, a.type, a.usedBy])).toEqual([
      ['Ease', true, ['widget']],
      ['exitPullbackStyle', false, ['widget']],
    ]);
    expect(plan.warnings).toContainEqual(
      expect.stringContaining('hidden, which tooltip take from snap/ease')
    );
    git('reset', '-q', '--hard', base);
  });

  it("reports a name a lane package's index doesn't export, without refusing", () => {
    const ref = commit(SNAP, 'snap');
    const lane = labsWith('labs-snap', {
      Snap: "export { surfaceBox } from './components/by-size';\n",
    });
    const plan = planImport({ id: 'widget', from: source, ref, labs: lane });
    expect(plan.findings).toEqual([]);
    const snap = plan.dependencies.kit.find((d) => d.id === 'snap');
    expect(snap.missingExports).toEqual([
      {
        name: 'Ease',
        subpaths: ['ease'],
        users: ['components/pull.ts'],
      },
      {
        name: 'exitPullbackStyle',
        subpaths: ['ease'],
        users: ['components/pull.ts'],
      },
    ]);
    expect(plan.warnings).toContainEqual(
      expect.stringContaining(
        "@carbon-labs/react-snap's index does not export exitPullbackStyle (taken from snap/ease by components/pull.ts)"
      )
    );
    // A package not in the lane yet is not checked.
    expect(
      plan.dependencies.kit.find((d) => d.id === 'tooltip').missingExports
    ).toEqual([]);
    git('reset', '-q', '--hard', base);
  });
});

describe('shared styles', () => {
  const STYLES = {
    'packages/kit/src/styles/_rollover.scss': `${HEADER}
@use '@carbon/react/scss/theme';

@mixin rollover {
  --cn-rollover: 1;
  transition: color var(--cds-motion-duration-fast-02, 120ms);
}
`,
    'packages/kit/src/styles/_ghost.scss': `${HEADER}
@use 'sass:map';
@use 'rollover' as *;

.cn-ghost {
  @include rollover;
}
`,
  };

  it('brings a partial and the partials it uses, rewritten', () => {
    const ref = commit(STYLES, 'styles');
    const lane = labsWith(
      'labs-styles',
      {},
      {
        'packages/v12-motion/es/tokens.css': TOKENS_CSS,
      }
    );
    const plan = planStyles({
      styles: ['ghost'],
      from: source,
      ref,
      labs: lane,
      year: 2026,
    });
    expect(plan.findings).toEqual([]);
    expect(plan.partials.map((p) => [p.to, p.pulledBy])).toEqual([
      ['src/styles/_ghost.scss', null],
      ['src/styles/_rollover.scss', 'ghost'],
    ]);
    const ghost = output(plan, 'src/styles/_ghost.scss');
    expect(ghost).toMatch(/^\/\/\n\/\/ Copyright IBM Corp\. 2025, 2026\n/);
    expect(ghost).toContain("@use 'rollover' as *;");
    expect(ghost).toContain('.cds-ghost');
    const rollover = output(plan, 'src/styles/_rollover.scss');
    expect(rollover).toContain('--cds-rollover: 1;');
    expect(rollover).toContain('color var(--cds-motion-duration-fast-02);');
    expect(rollover).toContain("@use '@carbon/react/scss/theme';");
    expect(plan.manifest.map((m) => [m.id, m.kind])).toEqual([
      ['styles/ghost', 'styles'],
      ['styles/rollover', 'styles'],
    ]);
    git('reset', '-q', '--hard', base);
  });

  it('refuses a literal, a leak and an import outside the styles', () => {
    const ref = commit(
      {
        ...STYLES,
        'packages/kit/src/styles/_ghost.scss': `${STYLES['packages/kit/src/styles/_ghost.scss']}
// As Zed asked.
@use '../tokens/sizes';
.cn-ghost--slow {
  transition-duration: 240ms;
}
`,
      },
      'styles refusals'
    );
    const plan = planStyles({ styles: ['ghost'], from: source, ref, labs });
    expect(plan.findings.map((f) => f.kind).sort()).toEqual([
      'import outside the shared styles',
      'leak (name)',
      'motion literal',
      'motion literal',
    ]);
    git('reset', '-q', '--hard', base);
  });

  it('writes the partials with --styles and records them', () => {
    const ref = commit(STYLES, 'styles');
    const lane = labsWith(
      'labs-styles-cli',
      {},
      {
        'packages/v12-motion/es/tokens.css': TOKENS_CSS,
      }
    );
    const res = spawnSync(
      process.execPath,
      [
        BIN,
        '--styles',
        'ghost',
        '--from',
        source,
        '--ref',
        ref,
        '--labs',
        lane,
      ],
      { encoding: 'utf8', env: { ...process.env, INIT_CWD: tmp } }
    );
    expect(res.stderr).toBe('');
    expect(res.status).toBe(0);
    for (const f of ['_ghost.scss', '_rollover.scss']) {
      expect(
        fs.existsSync(path.join(lane, 'packages/v12-styles/src/styles', f))
      ).toBe(true);
    }
    const manifest = JSON.parse(
      fs.readFileSync(path.join(lane, 'v12.manifest.json'), 'utf8')
    );
    expect(manifest.items.map((i) => i.id)).toEqual([
      'styles/ghost',
      'styles/rollover',
    ]);
    const missing = spawnSync(
      process.execPath,
      [
        BIN,
        '--styles',
        'nothing',
        '--from',
        source,
        '--ref',
        ref,
        '--labs',
        lane,
      ],
      { encoding: 'utf8', env: { ...process.env, INIT_CWD: tmp } }
    );
    expect(missing.status).toBe(2);
    expect(missing.stderr).toContain('empty or missing');
    git('reset', '-q', '--hard', base);
  });
});

describe('false positives', () => {
  it('passes Sass modules, curves built from tokens and test titles', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/widget.scss': `@use 'sass:map';
${FILES['packages/kit/src/widget/widget.scss']}`,
        'packages/kit/src/widget/curve.ts': `${HEADER}
import { toEasing } from '@carbon-motion/core';
export const curve = () =>
  \`cubic-bezier(\${toEasing({ name: 'standard' }).join(', ')})\`;
`,
        'packages/kit/src/widget/curve.test.ts': `import { it } from 'vitest';
it('a wide panel: 220ms in, 160ms out', () => {});
it.each([1])('cubic-bezier(%s) in a title', () => {});
`,
      },
      'false positives'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.findings).toEqual([]);
    git('reset', '-q', '--hard', base);
  });

  it('passes a Node built-in in a test, and moves the file it reads', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/leaf.test.ts': `import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
it('reads its source', () =>
  expect(readFileSync(new URL('./Widget.tsx', import.meta.url), 'utf8')).toBeTruthy());
`,
      },
      'node built-in'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.findings).toEqual([]);
    const test = output(plan, '__tests__/leaf.test.ts');
    expect(test).toContain("from 'node:fs'");
    expect(test).toContain(
      "new URL('../components/Widget.tsx', import.meta.url)"
    );
    expect(JSON.stringify(plan)).not.toContain('"node:fs":');
    git('reset', '-q', '--hard', base);
  });

  it('refuses a Node built-in in a component file, and a URL to no file', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/fs.ts': `${HEADER}
import { readFileSync } from 'node:fs';
export const read = () => readFileSync(new URL('./gone.ts', import.meta.url));
`,
      },
      'node built-in in a component'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.findings.map((f) => [f.kind, f.detail])).toEqual([
      ['unmapped import', 'node:fs (a Node built-in, in a component file)'],
      ['unresolved import', './gone.ts'],
    ]);
    git('reset', '-q', '--hard', base);
  });

  it('still refuses a written curve and a duration in a test body', () => {
    const ref = commit(
      {
        'packages/kit/src/widget/curve.ts': `${HEADER}
export const curve = 'cubic-bezier(0.2, 0, 0.38, 0.9)';
`,
        'packages/kit/src/widget/curve.test.ts': `import { expect, it } from 'vitest';
it('waits', () => expect('120ms').toBe('120ms'));
`,
      },
      'literals'
    );
    const plan = planImport({ id: 'widget', from: source, ref, labs });
    expect(plan.findings.map((f) => f.kind)).toEqual([
      'motion literal',
      'motion literal',
      'motion literal',
    ]);
    git('reset', '-q', '--hard', base);
  });
});

describe('writing', () => {
  it('prints the plan on a dry run and writes nothing', () => {
    const res = cli('widget', '--from', source, '--ref', base, '--dry-run');
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('components/Widget.tsx  ← Widget.tsx');
    expect(res.stdout).toContain('Dry run: nothing written.');
    expect(fs.existsSync(path.join(labs, 'v12.manifest.json'))).toBe(false);
  });

  it('writes the package into the lane and records it in the manifest', () => {
    const res = cli('widget', '--from', source, '--ref', 'HEAD');
    expect(res.status).toBe(0);
    const dir = path.join(labs, 'packages/react/src/v12/components/Widget');
    for (const f of [
      'package.json',
      'telemetry.yml',
      'index.ts',
      'components/Widget.tsx',
      '__stories__/Widget.stories.tsx',
      '__stories__/Widget.mdx',
    ]) {
      expect(fs.existsSync(path.join(dir, f))).toBe(true);
    }
    // The seam's carbon-motion link resolves only by its linked path.
    expect(
      JSON.parse(fs.readFileSync(path.join(dir, 'tsconfig.json'), 'utf8'))
        .compilerOptions.preserveSymlinks
    ).toBe(true);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(labs, 'v12.manifest.json'), 'utf8')
    );
    expect(manifest.items).toEqual([
      {
        id: 'widget',
        kind: 'component',
        path: 'packages/react/src/v12/components/Widget',
        labsStatus: 'draft',
        publishable: false,
        motion: ['usePrefersReducedMotion'],
        source: { repo: 'carbon-next', ref: base },
      },
    ]);
    // A second import into the repo refuses to overwrite.
    const again = cli('widget', '--from', source, '--ref', base);
    expect(again.status).toBe(1);
    expect(again.stderr).toContain('exists');
  });

  it("formats what it writes with the repository's Prettier", () => {
    const repo = fileURLToPath(new URL('../../..', import.meta.url));
    const ts = path.join(tmp, 'format.ts');
    const json = path.join(tmp, 'format.json');
    fs.writeFileSync(ts, 'export const a = {b:1}\n');
    fs.writeFileSync(json, '{"a":1}\n');
    expect(formatWritten(repo, [ts, json])).toBe(true);
    expect(fs.readFileSync(ts, 'utf8')).toBe('export const a = { b: 1 };\n');
    expect(fs.readFileSync(json, 'utf8')).toBe('{"a":1}\n');
    // A checkout without Prettier leaves them as written.
    expect(formatWritten(labs, [ts])).toBe(false);
  });

  it("fixes braces and property order with the repository's linters", () => {
    const repo = fileURLToPath(new URL('../../..', import.meta.url));
    // Inside the lane's paths, where the overrides apply.
    const dir = fs.mkdtempSync(
      path.join(repo, 'packages/react/src/v12/components/fix-test-')
    );
    try {
      const ts = path.join(dir, 'a.ts');
      const scss = path.join(dir, 'a.scss');
      fs.writeFileSync(
        ts,
        [
          '// eslint-disable-next-line react-hooks/refs',
          'export const a = (x: number): number => {',
          '  if (x) return 1;',
          '  return 2;',
          '};',
          '',
        ].join('\n')
      );
      fs.writeFileSync(
        scss,
        '.a {\n  color: var(--a);\n  display: block;\n}\n'
      );
      expect(fixWritten(repo, [ts, scss])).toEqual([]);
      const code = fs.readFileSync(ts, 'utf8');
      expect(code).not.toContain('react-hooks/refs');
      expect(code).toContain('if (x) {');
      expect(fs.readFileSync(scss, 'utf8')).toBe(
        '.a {\n  display: block;\n  color: var(--a);\n}\n'
      );
      // What no fixer can fix is reported.
      fs.writeFileSync(scss, '.a {\n  color: red;\n}\n');
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const left = fixWritten(repo, [ts, scss]);
      spy.mockRestore();
      expect(left.join('\n')).toContain('color-named');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('drops a disable comment naming only a rule the lane lacks', () => {
    const src = [
      'a();',
      '// eslint-disable-next-line react-hooks/refs',
      'b();',
      '// eslint-disable-next-line react-hooks/exhaustive-deps',
      'c();',
      '  // eslint-disable-next-line react-hooks/immutability -- a reason',
      'd();',
      '',
    ].join('\n');
    expect(dropUnknownDisables(src)).toBe(
      'a();\nb();\n// eslint-disable-next-line react-hooks/exhaustive-deps\nc();\nd();\n'
    );
  });

  it('writes under --out instead of the repo', () => {
    const out = path.join(tmp, 'out');
    const res = cli('widget', '--from', source, '--ref', base, '--out', out);
    expect(res.status).toBe(0);
    expect(fs.existsSync(path.join(out, 'Widget/package.json'))).toBe(true);
    expect(fs.existsSync(path.join(out, 'v12.manifest.json'))).toBe(true);
  });
});

describe('packages the tool brings whole', () => {
  it('maps the motion icons to their lane package, a workspace dependency', () => {
    const ref = commit(
      {
        'packages/kit/src/badge/index.ts': `${HEADER}
export { Badge } from './Badge';
`,
        'packages/kit/src/badge/Badge.tsx': `${HEADER}
import { Close, type MotionIconHandle } from '@carbon-next/motion-icons';

export function Badge({ handle }: { handle?: MotionIconHandle }) {
  return <Close data-handle={handle ? 1 : 0} />;
}
`,
      },
      'a badge'
    );
    const plan = planImport({ id: 'badge', from: source, ref, labs });
    expect(plan.findings).toEqual([]);
    expect(output(plan, 'components/Badge.tsx')).toContain(
      "from '@carbon-labs/react-motion-icons'"
    );
    const pkg = JSON.parse(output(plan, 'package.json'));
    expect(pkg.dependencies['@carbon-labs/react-motion-icons']).toBe(
      'workspace:*'
    );
    // The core goes inline in tests, as the seam does.
    expect(vitestConfig('')).toContain('/@carbon-labs\\/motion-icons-core/');
  });

  it('names a folder as the config says, and so do the folders that import it', () => {
    const ref = commit(
      {
        'packages/kit/src/processing/index.ts': `${HEADER}
export const Processing = () => null;
`,
        'packages/kit/src/gauge/index.ts': `${HEADER}
export { Processing as Gauge } from '../processing';
`,
      },
      'processing'
    );
    const processing = planImport({
      id: 'processing',
      from: source,
      ref,
      labs,
    });
    expect(JSON.parse(output(processing, 'package.json')).name).toBe(
      '@carbon-labs/react-processing-v2'
    );
    expect(laneName('processing')).toBe('@carbon-labs/react-processing-v2');
    expect(laneName('gauge')).toBe('@carbon-labs/react-gauge');
    const gauge = planImport({ id: 'gauge', from: source, ref, labs });
    expect(output(gauge, 'index.ts')).toContain(
      "from '@carbon-labs/react-processing-v2'"
    );
  });
});

describe("times that aren't motion, and indexes that forward a package", () => {
  it("allows text-input's autofill hold, with its reason, and only there", () => {
    const hold = `${HEADER}
.cn-x:-webkit-autofill {
  transition: background-color 600000s 0s;
}
`;
    const ref = commit(
      {
        'packages/kit/src/text-input/index.ts': `${HEADER}
import './text-input.scss';
export const TextInput = () => null;
`,
        'packages/kit/src/text-input/text-input.scss': hold,
        'packages/kit/src/text-area/index.ts': `${HEADER}
import './text-area.scss';
export const TextArea = () => null;
`,
        'packages/kit/src/text-area/text-area.scss': hold,
      },
      'autofill holds'
    );
    const input = planImport({ id: 'text-input', from: source, ref, labs });
    expect(input.findings).toEqual([]);
    expect(input.warnings).toContainEqual(
      expect.stringMatching(
        /^components\/text-input\.scss:\d+: allowed literal .*600000s \(the autofill hold/
      )
    );
    const area = planImport({ id: 'text-area', from: source, ref, labs });
    expect(area.findings.map((f) => f.kind)).toEqual(['motion literal']);
  });

  it("checks the names a folder takes from another's files when that index forwards a package whole", () => {
    const ref = commit(
      {
        'packages/kit/src/selection-kit/index.ts': `${HEADER}
export * from '@carbon-motion/react/motion/selection';
export { useDirection } from './direction';
`,
        'packages/kit/src/selection-kit/direction.ts': `${HEADER}
export const useDirection = () => 'ltr';
export function isRtl(): boolean {
  return false;
}
`,
        'packages/kit/src/side-sheet/index.ts': `${HEADER}
import { attachSelection } from '../selection-kit';
import { isRtl, useDirection } from '../selection-kit/direction';
export const SideSheet = () => [attachSelection, isRtl, useDirection];
`,
      },
      'a folder forwarding the seam'
    );
    const lane = labsWith('labs-forward', {
      SelectionKit: `export * from '@carbon-labs/v12-motion/selection';
export { useDirection } from './components/direction';
`,
    });
    const sheet = planImport({
      id: 'side-sheet',
      from: source,
      ref,
      labs: lane,
    });
    const kit = sheet.dependencies.kit.find((d) => d.id === 'selection-kit');
    // isRtl is the folder's own, so its index must name it; attachSelection
    // may come through the package it forwards.
    expect(kit.missingExports.map((m) => m.name)).toEqual(['isRtl']);
    // Imported, the folder's index gains it.
    const selection = planImport({
      id: 'selection-kit',
      from: source,
      ref,
      labs: lane,
    });
    expect(selection.indexAdded.map((a) => a.name)).toEqual(['isRtl']);
    expect(output(selection, 'index.ts')).toContain(
      "export { isRtl } from './components/direction';"
    );
  });
});

describe('laneReaches', () => {
  it('follows runtime dependencies, not dev ones', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lane-'));
    const lane = new Map();
    const pkg = (name, deps = {}, dev = {}) => {
      const dir = path.join(root, name);
      fs.mkdirSync(dir);
      fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify({ name, dependencies: deps, devDependencies: dev })
      );
      lane.set(name, dir);
    };
    pkg('a', { b: 'workspace:*' });
    pkg('b', { c: 'workspace:*' });
    pkg('c', {}, { a: 'workspace:*' });
    expect(laneReaches(lane, 'a', 'c')).toBe(true);
    expect(laneReaches(lane, 'c', 'a')).toBe(false);
    expect(laneReaches(lane, 'b', 'a')).toBe(false);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe('scanLeaks in a script', () => {
  it('takes a date in a comment, not in a string', async () => {
    const { scanLeaks } = await import('../src/doc.js');
    const src = [
      "const day = '2001-10-03';",
      '// Checked 2026-10-29.',
      'const t = `${2026}-10-29`;',
    ].join('\n');
    const dates = scanLeaks(src, [], { code: true }).filter(
      (l) => l.kind === 'date'
    );
    expect(dates.map((l) => l.line)).toEqual([2]);
    expect(scanLeaks(src, []).filter((l) => l.kind === 'date')).toHaveLength(2);
  });
});

describe('importedOnly', () => {
  it("keeps the lane packages the manifest records, not carbon-labs' own", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'labs-'));
    const lane = new Map([
      ['@x/react-date-picker', path.join(root, 'lane/DatePicker')],
      ['@x/react-tag', path.join(root, 'lane/Tag')],
    ]);
    const manifest = path.join(root, 'v12.manifest.json');
    fs.writeFileSync(
      manifest,
      JSON.stringify({ items: [{ path: 'lane/Tag' }] })
    );
    expect([...importedOnly(lane, root, manifest).keys()]).toEqual([
      '@x/react-tag',
    ]);
    expect(importedOnly(lane, root, path.join(root, 'none.json')).size).toBe(2);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
