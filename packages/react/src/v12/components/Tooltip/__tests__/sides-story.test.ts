/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Children, isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

// The story's own props are under test, not the parts it renders.
vi.mock('../__stories__/Tooltip.mdx', () => ({ default: () => null }));
vi.mock('@carbon-labs/react-button', () => ({ Button: () => null }));
vi.mock('../index', () => ({
  DefinitionTooltip: () => null,
  IconButton: () => null,
  Tooltip: () => null,
  TooltipGroup: () => null,
}));

type TipProps = { align?: string; label?: unknown; description?: unknown };

describe('the Sides story', () => {
  it('shows a label on every side, padded as the other labels are', async () => {
    const { Sides } = await import('../__stories__/Tooltip.stories');
    const stage = Sides.render() as ReactElement<{ children?: unknown }>;
    const tips = Children.toArray(stage.props.children).filter(
      isValidElement
    ) as ReactElement<TipProps>[];
    expect(tips.map((t) => t.props.align)).toEqual([
      'top',
      'right',
      'bottom',
      'left',
    ]);
    for (const t of tips) {
      // A description wraps and takes the reading padding (8px by 12px);
      // a label takes the compact one (2px by 8px) on every side.
      expect(t.props.label).toBeTruthy();
      expect(t.props.description).toBeUndefined();
    }
  });
});
