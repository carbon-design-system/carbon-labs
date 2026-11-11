/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Children, isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

// The story's own tree is under test, not the parts it renders.
vi.mock('../__stories__/SelectionKit.mdx', () => ({ default: () => null }));
vi.mock('../components/selection-kit.scss', () => ({}));
vi.mock('@carbon-labs/react-content-switcher', () => ({
  ContentSwitcher: function ContentSwitcher() {
    return null;
  },
  Switch: function Switch() {
    return null;
  },
}));
vi.mock('../index', () => ({
  SelectionPanels: function SelectionPanels() {
    return null;
  },
}));
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  // The story's render is a component: its state, outside React, is its first.
  return { ...react, default: react, useState: (v: unknown) => [v, () => {}] };
});

const nameOf = (el: ReactElement) =>
  typeof el.type === 'string'
    ? el.type
    : ((el.type as { name?: string }).name ?? '');

describe('the Panels story', () => {
  it('switches its panels from the content switcher, not bare buttons', async () => {
    const { Panels } = await import('../__stories__/SelectionKit.stories');
    const tree = Panels.render(Panels.args) as ReactElement<{
      children?: unknown;
    }>;
    const parts = Children.toArray(tree.props.children).filter(
      isValidElement
    ) as ReactElement<{ children?: unknown }>[];
    expect(parts.map(nameOf)).toEqual(['ContentSwitcher', 'SelectionPanels']);
    const switches = Children.toArray(parts[0]!.props.children).filter(
      isValidElement
    ) as ReactElement[];
    expect(switches.map(nameOf)).toEqual(['Switch', 'Switch', 'Switch']);
  });
});
