/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Add, Save, Send } from '@carbon-labs/react-motion-icons';
import { Button } from '../components/Button';

const Plain = (p: { className?: string }) => <svg className={p.className} />;
const Marked = Object.assign(
  (p: { className?: string }) => <svg className={p.className} />,
  { ownPending: true }
);

const busy = (Icon: unknown) =>
  renderToStaticMarkup(
    <Button busy renderIcon={Icon as typeof Plain}>
      Go
    </Button>
  );

describe('Button busy: icons that keep their own pending motion', () => {
  it('Save and Send keep the icon slot, without the kit spinner', () => {
    for (const Icon of [Save, Send])
      expect(busy(Icon)).not.toContain('cds-btn__spinner');
  });

  it('an icon marked ownPending keeps the slot too', () => {
    expect(busy(Marked)).not.toContain('cds-btn__spinner');
  });

  it('any other icon swaps to the spinner', () => {
    for (const Icon of [Add, Plain])
      expect(busy(Icon)).toContain('cds-btn__spinner');
  });
});
