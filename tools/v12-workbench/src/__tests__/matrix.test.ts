/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { matrixStory } from '../matrix';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const Probe = ({ label }: { label?: string }) =>
  createElement('span', { className: 'probe' }, label);

let host: HTMLElement | null = null;

/** Renders a matrix story into the document. */
function render(story: ReturnType<typeof matrixStory>) {
  host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(story.render()));
  return { host, unmount: () => act(() => root.unmount()) };
}

afterEach(() => {
  host?.remove();
  host = null;
});

describe('the matrix', () => {
  it('draws a column per v12 theme and density, each cell a zone of its theme', () => {
    const { host, unmount } = render(
      matrixStory(Probe, { args: { label: 'x' }, states: ['rest', 'disabled'] })
    );
    const cells = [...host.querySelectorAll<HTMLElement>('[data-state]')];
    // Two states, by two themes, by three densities.
    expect(cells).toHaveLength(12);
    const themes = cells.slice(0, 6).map((c) => c.dataset.cdsTheme);
    expect(themes).toEqual(['light', 'light', 'light', 'dark', 'dark', 'dark']);
    for (const cell of cells) {
      const light = cell.dataset.cdsTheme === 'light';
      expect(cell.classList.contains('cds--v12-light')).toBe(light);
      expect(cell.classList.contains('cds--v12-dark')).toBe(!light);
      expect(cell.className).not.toMatch(/cds--(white|g10|g90|g100)\b/);
      expect(cell.classList.contains('cds--layer-one')).toBe(true);
    }
    const heads = [...host.querySelectorAll('div')]
      .filter((d) => d.children.length === 0)
      .map((d) => d.textContent ?? '')
      .filter((t) => t.includes(' · '));
    expect(heads).toEqual([
      'v12 light · compact',
      'v12 light · default',
      'v12 light · spacious',
      'v12 dark · compact',
      'v12 dark · default',
      'v12 dark · spacious',
    ]);
    unmount();
  });

  it('draws only the themes asked for', () => {
    const { host, unmount } = render(
      matrixStory(Probe, { themes: ['v12-dark'], densities: ['default'] })
    );
    const cells = [...host.querySelectorAll<HTMLElement>('[data-state]')];
    expect(cells.map((c) => c.className.includes('cds--v12-dark'))).toEqual([
      true,
    ]);
    unmount();
  });
});
