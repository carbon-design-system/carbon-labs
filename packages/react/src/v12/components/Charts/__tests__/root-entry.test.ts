/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The root entry loads no plot runtime: not the chart library, not its
// renderer, not the chart or GPU motion packages. Two checks: the root's
// whole import graph, as a bundler walks it, and a run-time import with
// those packages stubbed to record a load.

import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { describe, expect, it, vi } from 'vitest';

const PLOT_RUNTIME =
  /^(?:echarts|zrender|@carbon-labs\/motion-charts|@carbon-labs\/motion-gpu)(?:\/|$)/;

const loaded = vi.hoisted(() => new Set<string>());

vi.mock('echarts', () => {
  loaded.add('echarts');
  return {};
});
vi.mock('echarts/core', () => {
  loaded.add('echarts/core');
  return {};
});
vi.mock('zrender', () => {
  loaded.add('zrender');
  return {};
});
vi.mock('@carbon-labs/motion-charts', () => {
  loaded.add('@carbon-labs/motion-charts');
  return {};
});
vi.mock('@carbon-labs/motion-gpu', () => {
  loaded.add('@carbon-labs/motion-gpu');
  return {};
});

describe('the root entry', () => {
  it('imports nothing of the plot runtime, through any package', async () => {
    const reached: string[] = [];
    const result = await build({
      entryPoints: [fileURLToPath(new URL('../index.ts', import.meta.url))],
      bundle: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'browser',
      logLevel: 'silent',
      external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
      plugins: [
        {
          name: 'plot-runtime',
          setup(b) {
            b.onResolve({ filter: PLOT_RUNTIME }, (args) => {
              reached.push(`${args.path} from ${args.importer}`);
              return { path: args.path, external: true };
            });
            b.onResolve({ filter: /\.s?css$/ }, (args) => ({
              path: args.path,
              namespace: 'style',
            }));
            b.onLoad({ filter: /.*/, namespace: 'style' }, () => ({
              contents: '',
              loader: 'js',
            }));
          },
        },
      ],
    });
    expect(reached).toEqual([]);
    const inputs = Object.keys(result.metafile.inputs);
    // The walk went through the motion seam into the motion packages.
    expect(inputs.some((p) => p.includes('motion-core'))).toBe(true);
    expect(
      inputs.filter((p) =>
        /(?:^|\/)(?:echarts|zrender|motion-charts|motion-gpu)\//.test(p)
      )
    ).toEqual([]);
  });

  it('loads none of the four packages at run time', async () => {
    const root = await import('../index');
    expect(root.CHART_DESIGN.layout.sm.width).toBe(380);
    expect(typeof root.resolveChartMotion).toBe('function');
    expect([...loaded]).toEqual([]);
  });

  it('keeps the plot entry apart', async () => {
    const plot = await import('../plot');
    expect(Object.keys(plot)).toEqual([]);
  });
});
