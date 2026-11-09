/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Every status cut grows from nothing, as the web components draw it (the
 * core's statusGrow.test.ts measures the cut itself): for every status
 * element, every status in and out at 16 and 32, and the counts (the pill at
 * 32, the pip at 16), the ink the drawing changes against the plain icon,
 * frame by frame on the fake clock, its status mark aside, held to
 * growCheck.ts: the cut starts at CUT_START, grows monotonically, no frame
 * after the start taking more than DOM_LIMITS' step (the bindings' frames
 * fall at their own phase in a four-frame transition); out, the mirror.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { STATUS_ICONS } from '@carbon-labs/motion-icons-core/icons/statusIcons';
import {
  changed,
  DOM_LIMITS,
  domShapes,
  growthProblems,
} from '../../v12-motion-icons-core/test/growCheck';
import { list, setup } from './full/harness';

type WC = HTMLElement & { updateComplete: Promise<unknown> };
const FRAME = 1000 / 60;
beforeAll(async () => {
  await setup();
});
afterAll(() => vi.useRealTimers());

const frame = async () => {
  vi.advanceTimersByTime(FRAME);
  await new Promise<void>((r) => setImmediate(r));
};
async function mount(
  tag: string,
  size: number,
  attrs: Record<string, string>
): Promise<WC> {
  const el = document.createElement(tag) as WC;
  el.setAttribute('animated', '');
  el.setAttribute('size', String(size));
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  document.body.append(el);
  await el.updateComplete;
  return el;
}
/** The drawing's change against the plain icon, every frame for `ms`, from `from` to `to` (attributes). */
async function series(
  tag: string,
  size: number,
  from: Record<string, string>,
  to: Record<string, string>,
  ms = 450
): Promise<number[]> {
  const plain = await mount(tag, size, {});
  const reference = domShapes(plain.shadowRoot!);
  plain.remove();
  const el = await mount(tag, size, from);
  for (let i = 0; i < 30; i++) {
    await frame();
  } // at rest
  const out = [changed(reference, domShapes(el.shadowRoot!))];
  for (const k of Object.keys(from)) {
    if (!(k in to)) {
      el.removeAttribute(k);
    }
  }
  for (const [k, v] of Object.entries(to)) {
    el.setAttribute(k, v);
  }
  await el.updateComplete;
  for (let t = 0; t < ms; t += FRAME) {
    await frame();
    out.push(changed(reference, domShapes(el.shadowRoot!)));
  }
  el.remove();
  return out;
}

const SPECS = STATUS_ICONS as unknown as Record<
  string,
  { statuses: readonly string[]; count?: boolean }
>;
// The status checkmarks' drawing changes as a whole as a status arrives (their base settles into Carbon's status
// art), so against the plain icon their change isn't the cut's: core's statusGrow.test.ts measures their cut against
// the base of each frame.
const CHECKMARKS = new Set([
  'CheckmarkOutline',
  'CheckmarkFilled',
  'InProgress',
  'Incomplete',
]);
const ELEMENTS = list().filter(
  (e) => e.kind === 'status' && SPECS[e.name] && !CHECKMARKS.has(e.name)
);

describe.each(ELEMENTS.map((e) => [e.name, e.tag] as const))(
  '%s: the cut grows from nothing (web component)',
  (name, tag) => {
    const L = SPECS[name];
    const statuses = L.statuses.filter((s) => s !== 'notification' || !L.count);
    for (const size of [16, 32]) {
      it(`@${size}: every status in and out`, async () => {
        const problems: string[] = [];
        for (const s of statuses) {
          problems.push(
            ...growthProblems(
              await series(tag, size, {}, { status: s }),
              'in',
              `${name} none→${s} @${size}`,
              DOM_LIMITS
            )
          );
          problems.push(
            ...growthProblems(
              await series(tag, size, { status: s }, {}),
              'out',
              `${name} ${s}→none @${size}`,
              DOM_LIMITS
            )
          );
        }
        expect(problems.join('\n')).toBe('');
      });
    }
    if (L.count) {
      it('counts: the pill at 32, the pip at 16, in and out', async () => {
        const problems = [
          ...growthProblems(
            await series(tag, 32, {}, { count: '3' }),
            'in',
            `${name} none→3 overhang @32`,
            DOM_LIMITS
          ),
          ...growthProblems(
            await series(tag, 32, { count: '3' }, {}),
            'out',
            `${name} 3→none overhang @32`,
            DOM_LIMITS
          ),
          ...growthProblems(
            await series(tag, 16, {}, { status: 'notification' }),
            'in',
            `${name} none→pip @16`,
            DOM_LIMITS
          ),
          ...growthProblems(
            await series(tag, 16, { status: 'notification' }, {}),
            'out',
            `${name} pip→none @16`,
            DOM_LIMITS
          ),
        ];
        expect(problems.join('\n')).toBe('');
      });
    }
  }
);
