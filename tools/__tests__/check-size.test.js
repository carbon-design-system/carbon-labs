/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The size check on a fixture: a chart family with its own row and its
// runtime row, against a stand-in ECharts.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { compare, measureAll } from '../check-size.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'size-check-'));
const lane = 'packages/react/src/v12/components';

/**
 * Writes a fixture file.
 *
 * @param {string} rel Its path in the fixture.
 * @param {string} text Its contents.
 */
function put(rel, text) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
}

/**
 * Text that doesn't compress away, so a module has a size.
 *
 * @param {string} name A name for the module.
 * @param {number} n How many entries.
 * @returns {string} The module's source.
 */
function weight(name, n) {
  const rows = Array.from(
    { length: n },
    (_, k) => `'${name}-${(k * 7919).toString(36)}-${(k * 104729) % 9973}'`
  );
  return `export const ${name} = [${rows.join(', ')}];\n`;
}

// A stand-in ECharts: its core and two chart parts, the bar one heavier.
put(
  'node_modules/echarts/package.json',
  JSON.stringify({ name: 'echarts', version: '6.1.0' })
);
put(
  'node_modules/echarts/core.js',
  `${weight('core', 400)}export function use(parts) { return parts.length + core.length; }\n`
);
put(
  'node_modules/echarts/charts.js',
  `${weight('BarChart', 600)}${weight('PieChart', 200)}`
);
put(
  'node_modules/zrender/package.json',
  JSON.stringify({ name: 'zrender', version: '6.0.0' })
);
put('node_modules/zrender/lib/core/util.js', weight('util', 300));

/**
 * A family folder: an entry that imports ECharts (left out of its own row)
 * and, when given, a runtime module and its declaration.
 *
 * @param {string} folder The folder.
 * @param {object} [runtime] Its `labs.size.runtime`.
 * @param {string} [module] The runtime module's source.
 */
function family(folder, runtime, module) {
  put(
    `${lane}/${folder}/package.json`,
    JSON.stringify({
      name: folder.toLowerCase(),
      private: true,
      labs: { status: 'draft', ...(runtime && { size: { runtime } }) },
    })
  );
  put(
    `${lane}/${folder}/index.ts`,
    [
      "import { use } from 'echarts/core';",
      "import { BarChart } from 'echarts/charts';",
      "import { util } from 'zrender/lib/core/util';",
      `export const ${folder} = () => use([BarChart, util]);`,
      '',
    ].join('\n')
  );
  if (module) {
    put(`${lane}/${folder}/src/runtime.ts`, module);
  }
}

const registersBars = [
  "import { use } from 'echarts/core';",
  "import { BarChart } from 'echarts/charts';",
  '// Called at mount, never at module top.',
  'export function registerBars() { use([BarChart]); }',
  '',
].join('\n');

family('BarChart', { entry: 'src/runtime.ts', limitKb: 64 }, registersBars);
family('Plain');

after(() => fs.rmSync(root, { recursive: true, force: true }));

describe('the size check', () => {
  it("measures a family's own code without ECharts, and its runtime with it", async () => {
    const { sizes, limits, errors } = await measureAll(root);
    assert.deepEqual(errors, []);
    assert.deepEqual(Object.keys(sizes), [
      'BarChart',
      'BarChart:runtime',
      'Plain',
    ]);
    // Own code is the family's few lines; the runtime carries ECharts' parts.
    assert.ok(sizes.BarChart.gzip < 300, `own ${sizes.BarChart.gzip}`);
    assert.ok(
      sizes['BarChart:runtime'].gzip > 10 * sizes.BarChart.gzip,
      `runtime ${sizes['BarChart:runtime'].gzip}`
    );
    assert.equal(limits['BarChart:runtime'], 64 * 1024);
    assert.equal(limits.BarChart, undefined);
  });

  it('fails a runtime row over its limit, whatever the baseline says', () => {
    const sizes = { 'BarChart:runtime': { raw: 9000, gzip: 5000 } };
    const { failures, warnings } = compare(sizes, sizes, {
      'BarChart:runtime': 4096,
    });
    assert.equal(failures.length, 1);
    assert.match(
      failures[0],
      /BarChart:runtime: 4\.88 KB gzip, over its limit of 4\.00 KB/
    );
    assert.deepEqual(warnings, []);
  });

  it('warns on runtime growth under the limit, and fails the same growth in own code', () => {
    const before = {
      BarChart: { raw: 4000, gzip: 2000 },
      'BarChart:runtime': { raw: 9000, gzip: 4000 },
    };
    const now = {
      BarChart: { raw: 6000, gzip: 3200 },
      'BarChart:runtime': { raw: 12000, gzip: 6000 },
    };
    const { failures, warnings } = compare(now, before, {
      'BarChart:runtime': 64 * 1024,
    });
    assert.equal(failures.length, 1);
    assert.match(failures[0], /^BarChart: /);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^BarChart:runtime: /);
  });

  it('applies the limit to a runtime row not yet in the baseline', () => {
    const { failures, notes } = compare(
      { 'BarChart:runtime': { raw: 9000, gzip: 5000 } },
      {},
      { 'BarChart:runtime': 4096 }
    );
    assert.equal(failures.length, 1);
    assert.deepEqual(notes, []);
  });

  it('notes a runtime row the family no longer declares', () => {
    const { notes } = compare(
      { BarChart: { raw: 1, gzip: 1 } },
      { BarChart: { raw: 1, gzip: 1 }, 'BarChart:runtime': { raw: 1, gzip: 1 } }
    );
    assert.deepEqual(notes, [
      'BarChart:runtime: in the baseline but the family declares no runtime.',
    ]);
  });

  it('fails a runtime row with no entry, no limit, or no ECharts in it', async () => {
    family('NoEntry', { entry: 'src/missing.ts', limitKb: 64 });
    family('NoLimit', { entry: 'src/runtime.ts' }, registersBars);
    family(
      'NoCharts',
      { entry: 'src/runtime.ts', limitKb: 64 },
      'export const register = () => 1;\n'
    );
    try {
      const { sizes, errors } = await measureAll(root);
      assert.equal(errors.length, 3);
      assert.match(errors.join('\n'), /NoEntry:runtime: .*names no file/);
      assert.match(errors.join('\n'), /NoLimit:runtime: .*limitKb/);
      assert.match(errors.join('\n'), /NoCharts:runtime: .*bundles no ECharts/);
      // Their own rows are still measured.
      assert.ok(sizes.NoEntry && sizes.NoLimit && sizes.NoCharts);
    } finally {
      for (const folder of ['NoEntry', 'NoLimit', 'NoCharts']) {
        fs.rmSync(path.join(root, lane, folder), { recursive: true });
      }
    }
  });
});
