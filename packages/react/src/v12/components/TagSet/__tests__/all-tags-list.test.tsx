/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import { TagSet } from '../components/TagSet';

setReducedMotion(true);

const TAGS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', onClose: () => {} },
  { id: 'd', label: 'Delta' },
];

describe('TagSet: the modal of every tag', () => {
  it('lists each tag as an item of the list', async () => {
    render(
      <TagSet tags={TAGS} maxVisible={1} allTagsModalSearchThreshold={1} />
    );

    fireEvent.click(screen.getByRole('button', { name: '3 more tags' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'View all tags' })
    );

    const list = await screen.findByRole('list', { name: 'Tags' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(TAGS.length);
    expect(items.every((item) => item.parentElement === list)).toBe(true);
    expect(items.map((item) => item.textContent)).toEqual(
      expect.arrayContaining(TAGS.map((t) => expect.stringContaining(t.label)))
    );
  });
});
