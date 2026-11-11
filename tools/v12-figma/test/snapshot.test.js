/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ROOT } from '../src/config.js';
import { runSnapshot } from '../src/snapshot.js';

// A small lane: one component with a story file, a docs page, a proposal
// and a mixed colour, and the real lane's installed packages.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-figma-'));
const COMPONENT = 'packages/react/src/v12/components/Widget';

/**
 * Writes a fixture file.
 *
 * @param {string} rel Its path in the fixture.
 * @param {string | object} body Its contents, or JSON.
 */
const write = (rel, body) => {
  fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, rel),
    typeof body === 'string' ? body : JSON.stringify(body, null, 2)
  );
};

const STORIES = `import { Widget, WidgetSizes } from '../index';
export default {
  title: 'V12/Widget',
  component: Widget,
  parameters: {
    v12: {
      motion: ['hover', 'press-and-release'],
      reduced: { hover: 'at-once' },
      states: ['rest', 'hover', 'press'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: WidgetSizes },
    kind: { control: 'select', options: ['primary', 'danger'] },
    onClick: { action: 'clicked' },
    className: { control: false },
  },
};
export const Default = { args: { children: 'Save', disabled: false } };
export const PressAndRelease = () => null;
`;

beforeAll(async () => {
  fs.symlinkSync(
    path.join(ROOT, 'node_modules'),
    path.join(tmp, 'node_modules')
  );
  write('package.json', { name: 'fixture', private: true });
  write('v12.manifest.json', {
    items: [
      {
        id: 'widget',
        kind: 'component',
        path: COMPONENT,
        labsStatus: 'draft',
        motion: ['attachRollover'],
        figma: { key: 'v12/widget', status: 'unmapped' },
      },
      {
        id: 'styles/thing',
        kind: 'styles',
        path: 'packages/v12-styles/src/styles/_thing.scss',
        labsStatus: 'draft',
      },
    ],
  });
  write(
    'packages/react/.storybook/main.js',
    "export default { docs: { defaultName: 'Overview' } };\n"
  );
  /**
   * A v12 theme token.
   *
   * @param {number} l Its OKLCH lightness.
   * @param {string} hex Its hex.
   * @returns {object} The token.
   */
  const token = (l, hex) => ({
    $type: 'color',
    $value: { colorSpace: 'oklch', components: [l, 0.004, 262], alpha: 1, hex },
    $description: 'Contextual surface for surface context 1. More.',
    $extensions: {
      'org.carbon': { status: 'confirmed', source: { type: 'fixed' } },
    },
  });
  write('packages/react/.storybook/v12-themes/themes.json', {
    themes: {
      light: { layer: { '01': token(0.97, '#f4f5f8') } },
      dark: { layer: { '01': token(0.24, '#1e1f21') } },
    },
  });
  write('packages/react/src/v12/explorations/explorations.json', {
    explorations: [
      { name: 'radius-field', kind: 'radius', value: '6px (0.375rem)' },
      { name: 'elevated', kind: 'elevation', value: 'drop 0 8px 24px' },
    ],
  });
  write('tools/v12-workbench/src/explorations.json', {
    'V12/Widget': [
      {
        kind: 'proposal',
        file: 'x',
        line: 1,
        text: '`api: widget-kinds` — why.',
      },
    ],
  });
  write(`${COMPONENT}/package.json`, {
    name: '@carbon-labs/react-widget',
    private: true,
  });
  write(`${COMPONENT}/index.ts`, "export * from './components/Widget';\n");
  write(
    `${COMPONENT}/components/Widget.tsx`,
    "export const WidgetSizes = ['sm', 'md', 'lg'] as const;\nexport function Widget() { return null; }\n"
  );
  write(
    `${COMPONENT}/components/widget.scss`,
    `.w {\n  &:hover {\n    background: color-mix(in oklch, var(--a) 50%, transparent);\n  }\n  --rollover-press: color-mix(\n    in srgb,\n    currentColor 20%,\n    transparent\n  );\n}\n`
  );
  write(`${COMPONENT}/__stories__/Widget.stories.tsx`, STORIES);
  write(
    `${COMPONENT}/__stories__/Widget.mdx`,
    "import * as S from './Widget.stories';\n\n# Widget\n\nA widget for tests. It does one thing.\n\n## Motion\n\nIt moves.\n"
  );
  write(`${COMPONENT}/proposals/tokens.json`, {
    widget: {
      fill: {
        $type: 'color',
        $description: 'A fill. More.',
        $extensions: {
          'carbon.themes': {
            white: 'oklch(0.454 0.2742 262.72)',
            g10: '{layer-01}',
            g90: '#ABCDEF',
            g100: 'oklch(0.5565 0.2605 261.96)',
          },
          'com.ibm.harness.fallback': { white: '#0043CF', g100: '#0F62FE' },
        },
      },
    },
  });
  write(
    'packages/v12-styles/src/styles/_thing.scss',
    '.t { color: color-mix(in oklab, red, blue); }\n'
  );
  // The contract as the import tool writes it, from the installed registry.
  const { tokens } = await import(
    pathToFileURL(
      path.join(
        ROOT,
        'node_modules/@carbon-labs/motion-core/generated/tokens.js'
      )
    ).href
  );
  const version = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, 'node_modules/@carbon-labs/motion-core/package.json'),
      'utf8'
    )
  ).version;
  const byStatus = {};
  for (const t of Object.values(tokens)) {
    (byStatus[t.status] ??= []).push(`\`${t.name}\``);
  }
  write(
    'docs/v12/motion-contract.md',
    `# The v12 motion contract\n\nIt re-exports \`@carbon-labs/motion-core\` and\n\`@carbon-labs/motion-react\` (${version}), item by item.\n\n${Object.entries(
      byStatus
    )
      .map(([s, n]) => `- \`${s}\` (${n.length}): ${n.join(', ')}`)
      .join(
        '\n'
      )}\n\n## The exports\n\n| Export | Kind | From | Used by |\n| --- | --- | --- | --- |\n| \`attachRollover\` | function | \`@carbon-labs/motion-core\` | Widget |\n| (every export) (\`@carbon-labs/v12-motion/selection\`) | module | \`@carbon-labs/motion-react/motion/selection\` | none yet |\n`
  );
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

/**
 * A snapshot the fixture wrote.
 *
 * @param {string} kind The kind.
 * @returns {any} The snapshot.
 */
const read = (kind) =>
  JSON.parse(
    fs.readFileSync(path.join(tmp, `figma-sync/${kind}.code.json`), 'utf8')
  );

describe('the snapshots', () => {
  it('writes all four, then finds them current', async () => {
    const wrote = await runSnapshot(tmp);
    expect(wrote.errors).toEqual([]);
    expect(wrote.written).toHaveLength(4);
    // The styles row has no block: it takes the default.
    expect(wrote.missing).toEqual(['styles/thing']);
    const checked = await runSnapshot(tmp, { check: true });
    expect(checked.stale).toEqual([]);
    expect(checked.errors).toEqual([]);
  });

  it('reads props, states and story ids from the stories', () => {
    const widget = read('components').items.find((i) => i.id === 'widget');
    expect(widget.key).toBe('v12/widget');
    expect(widget.figma).toEqual({ status: 'unmapped' });
    expect(widget.stories).toEqual([
      'v12-widget--default',
      'v12-widget--press-and-release',
    ]);
    expect(widget.docs).toBe('v12-widget--overview');
    expect(widget.props).toEqual({
      size: { figma: 'VARIANT', values: ['sm', 'md', 'lg'], surface: true },
      kind: { figma: 'VARIANT', values: ['primary', 'danger'], surface: true },
      children: { figma: 'TEXT', as: 'label' },
      disabled: { figma: 'BOOLEAN', surface: true },
    });
    expect(widget.notMapped).toEqual(['className', 'onClick']);
    expect(widget.state).toEqual(['rest', 'hover', 'press']);
    expect(widget.departures).toEqual(['proposal: api: widget-kinds']);
    const styles = read('components').items.find(
      (i) => i.id === 'styles/thing'
    );
    expect(styles.figma).toEqual({ status: 'code-only' });
  });

  it('carries each mixed colour with a placeholder per theme until a render resolves it', () => {
    const { items, stateColors } = read('components');
    const colors = items.find((i) => i.id === 'widget').stateColors;
    expect(
      colors.map((c) => [c.selector, c.property, c.state, c.spaces])
    ).toEqual([
      ['.w &:hover', 'background', 'hover', ['oklch']],
      ['.w', '--rollover-press', 'press', ['srgb']],
    ]);
    expect(colors[1].expression).toBe(
      'color-mix( in srgb, currentColor 20%, transparent )'
    );
    expect(colors[0].values['v12-dark']).toEqual({ pending: 'browser-render' });
    expect(Object.keys(colors[0].values)).toEqual(stateColors.themes);
  });

  it('takes a rendered value only while its expression is unchanged', async () => {
    const [hover, press] = read('components').items.find(
      (i) => i.id === 'widget'
    ).stateColors;
    write('figma-sync/state-colors.resolved.json', {
      entries: [
        {
          row: 'widget',
          ...hover,
          values: { white: { hex: '#808080', alpha: 0.5 } },
        },
        {
          row: 'widget',
          ...press,
          expression: 'an older expression',
          values: { white: { hex: '#000000', alpha: 1 } },
        },
      ],
    });
    // The snapshot is stale until it is written again.
    expect((await runSnapshot(tmp, { check: true })).stale).toEqual([
      'figma-sync/components.code.json',
    ]);
    await runSnapshot(tmp, { kinds: ['components'] });
    const after = read('components');
    const [h, p] = after.items.find((i) => i.id === 'widget').stateColors;
    expect(h.values.white).toEqual({ hex: '#808080', alpha: 0.5 });
    expect(h.values.g10).toEqual({ pending: 'browser-render' });
    expect(p.values.white).toEqual({ pending: 'browser-render', stale: true });
    expect(after.stateColors.resolved).toBe(1);
    fs.rmSync(path.join(tmp, 'figma-sync/state-colors.resolved.json'));
    await runSnapshot(tmp, { kinds: ['components'] });
  });

  it('reads theme, proposal, exploration and motion tokens', () => {
    const { tokens, modes } = read('tokens');
    expect(modes.theme).toEqual([
      'white',
      'g10',
      'g90',
      'g100',
      'v12-light',
      'v12-dark',
    ]);
    const layer = tokens.find((t) => t.css === '--cds-layer-01');
    expect(layer.name).toBe('layer/01');
    expect(layer.description).toBe('Contextual surface for surface context 1.');
    expect(layer.values['v12-light']).toEqual({
      hex: '#f4f5f8',
      alpha: 1,
      oklch: [0.97, 0.004, 262],
      gamut: 'srgb',
    });
    // Carbon's own value in a v11 mode.
    expect(layer.values.white).toEqual({
      hex: '#f4f4f4',
      alpha: 1,
      origin: '@carbon/themes',
    });
    const fill = tokens.find((t) => t.css === '--cds-widget-fill');
    expect(fill.collection).toBe('v12 / Proposals');
    expect(fill.values.white).toEqual(fill.values['v12-light']);
    expect(fill.values.white.hex).toBe('#0043cf');
    expect(fill.values.white.gamut).toBe('outside-srgb');
    expect(fill.values.g10).toEqual({ alias: '--cds-layer-01' });
    expect(fill.values.g90).toEqual({ hex: '#abcdef', alpha: 1 });
    expect(fill.gamut).toBe('outside-srgb');
    const radius = tokens.find((t) => t.name === 'explore/radius-field');
    expect(radius.values.full).toEqual({ number: 6, unit: 'px' });
    expect(tokens.some((t) => t.name === 'explore/elevated')).toBe(false);
    const fast = tokens.find((t) => t.css === '--cds-motion-duration-fast-01');
    expect(fast.values.full).toEqual({ number: 80, unit: 'ms' });
    expect(fast.scopes).toEqual([]);
  });

  it('reads motion items, their tokens and the seam', () => {
    const { items, seam } = read('motion');
    const widget = items.find((i) => i.id === 'widget');
    expect(widget.items[0]).toMatchObject({
      item: 'hover',
      reduced: 'at-once',
    });
    expect(widget.items[1].reduced).toBeNull();
    expect(widget.seam).toEqual(['attachRollover']);
    expect(seam).toEqual([
      {
        name: 'attachRollover',
        kind: 'function',
        from: '@carbon-labs/motion-core',
        entry: null,
      },
      {
        name: '*',
        kind: 'module',
        from: '@carbon-labs/motion-react/motion/selection',
        entry: '@carbon-labs/v12-motion/selection',
      },
    ]);
  });

  it('reads the docs summary', () => {
    const [doc] = read('docs').items;
    expect(doc).toMatchObject({
      key: 'v12/widget',
      title: 'V12/Widget',
      name: 'Widget',
      firstSentence: 'A widget for tests.',
      sections: ['Motion'],
    });
  });

  it('fails the check on a stale snapshot', async () => {
    const file = `${COMPONENT}/__stories__/Widget.stories.tsx`;
    write(
      file,
      STORIES.replace(
        "['primary', 'danger']",
        "['primary', 'secondary', 'danger']"
      )
    );
    const checked = await runSnapshot(tmp, { check: true });
    expect(checked.stale).toEqual(['figma-sync/components.code.json']);
    write(file, STORIES);
    expect((await runSnapshot(tmp, { check: true })).stale).toEqual([]);
  });

  it('fails on a wrong figma block', async () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmp, 'v12.manifest.json'), 'utf8')
    );
    manifest.items[0].figma = { key: 'v12/widget', status: 'mapped' };
    write('v12.manifest.json', manifest);
    const { errors } = await runSnapshot(tmp, {
      check: true,
      kinds: ['components'],
    });
    expect(errors).toEqual([
      'widget: figma.status "mapped" needs an export to check it against; use unmapped or code-only',
    ]);
    manifest.items[0].figma = { key: 'v12/widget', status: 'unmapped' };
    write('v12.manifest.json', manifest);
  });
});

describe('the lane', () => {
  it('has current snapshots', async () => {
    const { stale, errors } = await runSnapshot(ROOT, { check: true });
    expect(errors).toEqual([]);
    expect(stale).toEqual([]);
  });
});
