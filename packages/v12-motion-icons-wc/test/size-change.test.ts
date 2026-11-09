/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `size` set after the first paint, from unset (which draws at 32), reaches
 * the controller: the element draws as one built at that size, not just a
 * resized box (a count keeps no 32px number at 16). A change between two
 * sizes, and back to unset, too.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

type IconEl = HTMLElement & { updateComplete: Promise<unknown> };

beforeAll(async () => {
  await import('../src/define-all');
});

const made: Element[] = [];
afterEach(() => made.splice(0).forEach((e) => e.remove()));

async function mount(html: string): Promise<IconEl> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  made.push(root);
  const el = root.firstElementChild as IconEl;
  await el.updateComplete;
  return el;
}
const ink = (el: Element) =>
  el.shadowRoot!.querySelector('g[data-mc-ink]')!.innerHTML;
const width = (el: Element) =>
  el.shadowRoot!.querySelector('svg')!.getAttribute('width');

describe('size set after the first paint', () => {
  for (const [what, tag, attrs] of [
    [
      'a count (a number at 32, the pip below)',
      'clabs-motion-icon-notification',
      'count="3"',
    ],
    ['a status icon', 'clabs-motion-icon-save', 'status="success"'],
    ['a hover icon', 'clabs-motion-icon-settings', ''],
    ['a toggle', 'clabs-motion-icon-bookmark-toggle', ''],
    ['the pip', 'clabs-motion-status-pip', 'count="120"'],
  ] as const) {
    it(`${what}: from unset to 16 draws as one built at 16, and back to unset as one at 32`, async () => {
      const at16 = ink(await mount(`<${tag} ${attrs} size="16"></${tag}>`));
      const at32 = ink(await mount(`<${tag} ${attrs}></${tag}>`));
      const el = await mount(`<${tag} ${attrs}></${tag}>`);
      el.setAttribute('size', '16');
      await el.updateComplete;
      expect(width(el)).toBe('16');
      expect(ink(el)).toBe(at16);
      el.removeAttribute('size');
      await el.updateComplete;
      expect(width(el)).toBe('32');
      expect(ink(el)).toBe(at32);
    });
  }

  it('the pip: a new `max` with the same count draws its cap ("99+" → "9+")', async () => {
    const want = ink(
      await mount(
        '<clabs-motion-status-pip count="120" max="9"></clabs-motion-status-pip>'
      )
    );
    const el = await mount(
      '<clabs-motion-status-pip count="120"></clabs-motion-status-pip>'
    );
    expect(ink(el)).not.toBe(want);
    el.setAttribute('max', '9');
    await el.updateComplete;
    expect(ink(el)).toBe(want);
  });

  it('the count really differs at 16 and 32 (the case above is not vacuous)', async () => {
    const a = await mount(
      '<clabs-motion-icon-notification count="3" size="16"></clabs-motion-icon-notification>'
    );
    const b = await mount(
      '<clabs-motion-icon-notification count="3"></clabs-motion-icon-notification>'
    );
    expect(ink(a)).not.toBe(ink(b));
  });
});
