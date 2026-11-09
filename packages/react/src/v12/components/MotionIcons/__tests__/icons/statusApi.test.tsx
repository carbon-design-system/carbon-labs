/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status API on the 26 exports and StatusPip: each offers only its statuses; a
 * status draws at first render, still or animated; hover is inert while a
 * status shows; counts cap at 9+ and can hang off the
 * frame's corner; Download and Upload take no status.
 */
import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Calendar,
  Chat,
  CheckmarkFilled,
  CheckmarkOutline,
  Copy,
  Download,
  Email,
  Export,
  Notification,
  Save,
  Settings,
  ShoppingCart,
  StatusPip,
  Upload,
  User,
  UserAvatar,
} from '../../index';
import {
  CHECK_STATUSES,
  CHECKMARK_ICONS,
  PROCESS_STATUSES,
  STATUS_ALIASES,
  STATUS_ICONS,
} from '../../icons/statusIcons';
import * as CarbonReact from '@carbon/icons-react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import * as Lib from '../../index';
import {
  COUNT,
  countAt,
  countCentre,
  countWidth,
  statusZone,
  TONE,
  type Placement,
} from '../../utils/statusLayer';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const d = (c: HTMLElement, k: string) =>
  c.querySelector(`[data-k="${k}"]`)?.getAttribute('d');

describe('status API', () => {
  it('offers each icon only its statuses (26 icons; Download, Upload and Export take none)', () => {
    expect(Object.keys(STATUS_ICONS)).toHaveLength(26);
    expect(STATUS_ICONS).not.toHaveProperty('Export');
    expect(STATUS_ICONS).not.toHaveProperty('Download');
    expect(STATUS_ICONS).not.toHaveProperty('Upload');
    expect(STATUS_ICONS.Save.status.statuses).toEqual(PROCESS_STATUSES);
    expect(STATUS_ICONS.Notification.status.statuses).toEqual(['notification']);
    expect(STATUS_ICONS.Notification.status.count).toBe(true);
    expect(STATUS_ICONS.Save.status.count).toBeFalsy();
    // @ts-expect-error a process icon takes no pip
    void (<Save status="notification" />);
    // @ts-expect-error a notification icon takes no check
    void (<Chat status="success" />);
    // @ts-expect-error a process icon takes no count
    void (<Copy count={3} />);
    // @ts-expect-error Download is a plain hover icon again
    void (<Download status="success" />);
    // @ts-expect-error Upload is a plain hover icon again
    void (<Upload status="success" />);
    // @ts-expect-error Export is a plain hover icon again
    void (<Export status="success" />);
    // @ts-expect-error only notification icons place a count
    void (<Save countPlacement="overhang" />);
  });

  it('keeps the plain statics and names', () => {
    expect(Save.displayName).toBe('Save');
    expect(typeof (Save as unknown as { geo: unknown }).geo).toBe('function');
    expect(Notification.displayName).toBe('Notification');
  });

  it('draws a status at first render, at rest, animated and still', () => {
    for (const animated of [true, false]) {
      const { container, unmount } = render(
        <Save status="success" animated={animated} />
      );
      expect(d(container, 'status-check')).not.toBe('');
      unmount();
    }
    const still = render(<Copy status="pending" animated={false} />);
    expect(d(still.container, 'status-dots')).not.toBe('');
    expect(d(still.container, 'status-spin')).toBe('');
  });

  it('takes the status layer on when a status arrives', () => {
    const { container, rerender } = render(<Save animated />);
    expect(container.querySelector('[data-k="status-check"]')).toBeNull();
    act(() => rerender(<Save animated status="warning" />));
    expect(container.querySelector('[data-k="status-warn"]')).not.toBeNull();
  });

  it('holds still on hover while a status shows: neither the base nor the mark moves', async () => {
    for (const el of [
      <Save key="s" status="success" animated />,
      <Copy key="c" status="error" animated />,
      <Chat key="h" count={3} animated />,
      <Notification key="n" status="notification" animated />,
    ]) {
      const { container, unmount } = render(el);
      const before = container.innerHTML;
      fireEvent.mouseEnter(container.querySelector('svg')!);
      await act(() => new Promise((r) => setTimeout(r, 300)));
      expect(container.innerHTML).toBe(before);
      fireEvent.mouseLeave(container.querySelector('svg')!);
      await act(() => new Promise((r) => setTimeout(r, 200)));
      expect(container.innerHTML).toBe(before);
      unmount();
    }
  });

  it('counts at 32: a pill with the figures, 99+ at ninety-nine and over by default, 9+ with max 9', () => {
    const at = (n: number, max?: 9 | 99) => {
      const { container, unmount } = render(
        <Chat count={n} max={max} animated={false} />
      );
      const v = d(container, 'status-count');
      unmount();
      return v;
    };
    expect(at(3)).toMatch(/^M/);
    expect(at(12)).not.toBe(at(9));
    expect(at(120)).toBe(at(99));
    expect(at(12, 9)).toBe(at(9, 9));
    expect(at(0)).toBeUndefined(); // no count, no status: the plain icon
  });

  it('counts below 32px show the plain pip, no number, the same cut; 0 shows nothing', () => {
    for (const size of [16, 20, 24] as const) {
      const n = render(<Chat size={size} count={7} animated={false} />);
      const pip = render(
        <Chat size={size} status="notification" animated={false} />
      );
      expect(d(n.container, 'status-count'), `${size}`).toBe('');
      expect(n.container.innerHTML, `${size}`).toBe(pip.container.innerHTML);
      cleanup();
    }
    const none = render(<Chat size={16} count={0} animated={false} />);
    expect(none.container.querySelector('[data-k^="status-"]')).toBeNull();
  });

  it('the pip ⇄ number change with size is not animated: it redraws at rest', () => {
    const { container, rerender } = render(
      <Chat size={32} count={5} animated />
    );
    const at32 = d(container, 'status-count');
    act(() => rerender(<Chat size={16} count={5} animated />));
    expect(d(container, 'status-count')).toBe('');
    expect(d(container, 'status-pip')).not.toBe('');
    const pipAt16 = render(<Chat size={16} status="notification" animated />);
    expect(container.innerHTML).toBe(pipAt16.container.innerHTML);
    act(() => rerender(<Chat size={32} count={5} animated />));
    expect(d(container, 'status-count')).toBe(at32);
  });

  it('Email: its pip and count sit top right, as every other', () => {
    const pip = render(<Email status="notification" animated={false} />);
    const dd = d(pip.container, 'status-pip')!;
    // The pip's path starts at its left (cx − r, cy): Carbon's notification--new spot, (22, 8).
    expect(dd.startsWith('M22 8A4 4')).toBe(true);
  });

  it("overhang (the default): the pill hangs off the frame's corner, its end cap's centre 1 in from it, the svg's box unchanged", () => {
    const P: Placement = { corner: 'tr', inset: [2, 4], countAt: 'overhang' };
    // One figure: a disc centred (31, 1); wider counts grow inwards from the same right end (38).
    expect(countCentre(P, COUNT.h)).toEqual([31, 1]);
    expect(countCentre(P, 22)[0] + 11).toBe(38);
    const box = (ys: number[]) => [Math.min(...ys), Math.max(...ys)];
    expect(box(statusZone(P, 'count', 22).map((q) => q[1]))[1]).toBeLessThan(
      12.1
    ); // the cut reaches y 12, 6 less than inside
    const inside = render(
      <Chat count={3} countPlacement="inside" animated={false} />
    );
    const over = render(
      <Chat count={3} countPlacement="overhang" animated={false} />
    );
    const dflt = render(<Chat count={3} animated={false} />);
    expect(d(over.container, 'status-count')).not.toBe(
      d(inside.container, 'status-count')
    );
    expect(d(dflt.container, 'status-count')).toBe(
      d(over.container, 'status-count')
    ); // overhang is the default
    // The placement doesn't change with the count: 3 hangs off the corner too.
    const three = render(<Chat count={3} animated={false} />);
    expect(d(three.container, 'status-count')).toBe(
      render(<Chat count={3} countPlacement="overhang" animated={false} />)
        .container.querySelector('[data-k="status-count"]')!
        .getAttribute('d')
    );
    const svg = over.container.querySelector('svg')!;
    expect([
      svg.getAttribute('viewBox'),
      svg.getAttribute('width'),
      svg.style.overflow,
    ]).toEqual(['0 0 32 32', '32', 'visible']);
  });

  it('tone: a named tone colours the pip and the count; process marks keep their own colours; true keeps the pip red', () => {
    const fill = (el: React.ReactElement, k: string) => {
      const { container, unmount } = render(el);
      const v = container
        .querySelector(`[data-k="${k}"]`)!
        .getAttribute(k === 'status-check' ? 'stroke' : 'fill');
      unmount();
      return v;
    };
    for (const t of ['error', 'warning', 'success', 'info'] as const) {
      expect(
        fill(
          <Chat status="notification" tone={t} animated={false} />,
          'status-pip'
        ),
        t
      ).toBe(TONE[t]);
      expect(
        fill(<Chat count={4} tone={t} animated={false} />, 'status-count'),
        t
      ).toBe(TONE[t]);
      expect(
        fill(
          <Save status="success" tone={t} animated={false} />,
          'status-check'
        ),
        t
      ).toBe(TONE.success);
    }
    expect(
      fill(<Chat status="notification" tone animated={false} />, 'status-pip')
    ).toBe(TONE.error);
    expect(
      fill(<Chat status="notification" animated={false} />, 'status-pip')
    ).toBe('currentColor');
    const pip = render(<StatusPip count={3} tone="success" animated={false} />);
    expect(
      pip.container.querySelector('[data-k="pip"]')!.getAttribute('fill')
    ).toBe(TONE.success);
  });

  it('User, User avatar and Shopping cart keep counts overhanging: inside would erase the head, or most of the basket', () => {
    for (const I of [User, UserAvatar, ShoppingCart]) {
      for (const n of [3, 12, 150]) {
        const inside = render(
          <I count={n} countPlacement="inside" animated={false} />
        );
        const over = render(
          <I count={n} countPlacement="overhang" animated={false} />
        );
        expect(inside.container.innerHTML, `${I.displayName} ${n}`).toBe(
          over.container.innerHTML
        );
        cleanup();
      }
    }
    // Others take one figure inside, as asked.
    const a = render(
      <Chat count={3} countPlacement="inside" animated={false} />
    );
    const b = render(<Chat count={3} animated={false} />);
    expect(a.container.innerHTML).not.toBe(b.container.innerHTML);
    expect(countAt({ insideMax: '9' }, 'inside', '7')).toBe('inside');
    expect(countAt({ insideMax: '9' }, 'inside', '12')).toBe('overhang');
    expect(countAt({ insideMax: '' }, 'inside', '3')).toBe('overhang');
    expect(countAt({}, undefined, '3')).toBe('overhang');
  });

  it('inside takes one figure on every count icon: 12, 9+ and 99+ overhang whatever was asked', () => {
    for (const [name, I] of Object.entries({
      Chat,
      Calendar,
      Email,
      Notification,
    })) {
      expect(I.status.placement.insideMax, name).toBe('9');
      for (const n of [12, 150]) {
        const inside = render(
          <I count={n} countPlacement="inside" animated={false} />
        );
        const over = render(<I count={n} animated={false} />);
        expect(inside.container.innerHTML, `${name} ${n}`).toBe(
          over.container.innerHTML
        );
        cleanup();
      }
    }
  });

  it('every count icon hangs its count at the one standard spot (no per-icon moves)', () => {
    const spot = countCentre(
      { corner: 'tr', inset: [2, 4], countAt: 'overhang' },
      countWidth('3')
    );
    for (const [name, I] of Object.entries({
      Calendar,
      Chat,
      Email,
      Notification,
      ShoppingCart,
      User,
      UserAvatar,
    })) {
      expect(
        countCentre(
          { ...I.status.placement, countAt: 'overhang' },
          countWidth('3')
        ),
        name
      ).toEqual(spot);
    }
  });

  it('tone colours the mark only', () => {
    const { container } = render(
      <Settings status="error" tone animated={false} />
    );
    expect(
      container.querySelector('[data-k="status-err"]')!.getAttribute('fill')
    ).toBe('var(--cds-support-error, #da1e28)');
    expect(
      container.querySelector('[data-k="gear"]')!.getAttribute('fill')
    ).toBe('currentColor');
  });
});

describe('the status checkmarks and their Carbon names', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LIB = Lib as unknown as Record<string, React.ComponentType<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CARBON = CarbonReact as unknown as Record<
    string,
    React.ComponentType<any>
  >;
  const html = (el: React.ReactElement) => {
    const { container, unmount } = render(el);
    const out = container.innerHTML.replace(/«[^»]*»|:r[0-9a-z]+:/g, '#id');
    unmount();
    return out;
  };
  const paths = (el: React.ReactElement) => {
    const { container, unmount } = render(el);
    const out = [...container.querySelectorAll('path')]
      .map((p) => p.getAttribute('d'))
      .join('|');
    unmount();
    return out;
  };

  it('InProgress and Incomplete take the process statuses; CheckmarkOutline and CheckmarkFilled all but success (the icon already says it)', () => {
    expect(STATUS_ICONS.InProgress.status.statuses).toEqual(PROCESS_STATUSES);
    expect(STATUS_ICONS.Incomplete.status.statuses).toEqual(PROCESS_STATUSES);
    expect(STATUS_ICONS.CheckmarkOutline.status.statuses).toEqual(
      CHECK_STATUSES
    );
    expect(STATUS_ICONS.CheckmarkFilled.status.statuses).toEqual(
      CHECK_STATUSES
    );
    for (const n of CHECKMARK_ICONS) expect(LIB[n], n).toBe(STATUS_ICONS[n]);
    expect(STATUS_ICONS.CheckmarkOutline.status.placement.mode).toBe('box');
    expect(STATUS_ICONS.Incomplete.status.placement.mode).toBe('box');
    expect(STATUS_ICONS.CheckmarkFilled.status.placement).toMatchObject({
      mode: 'offset',
      gap: 3,
    });
    expect(STATUS_ICONS.InProgress.status.placement).toMatchObject({
      mode: 'offset',
      gap: 3,
    });
    // @ts-expect-error a check takes no success
    void (<CheckmarkOutline status="success" />);
    // @ts-expect-error a check takes no success
    void (<CheckmarkFilled status="success" />);
  });

  it('a check given success draws the plain icon and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const Any = CheckmarkFilled as unknown as React.ComponentType<{
      status?: string;
    }>;
    expect(html(<Any status="success" />)).toBe(html(<CheckmarkFilled />));
    html(<Any status="success" />);
    const said = warn.mock.calls.filter(([m]) =>
      String(m).includes('CheckmarkFilled takes no "success"')
    );
    expect(said).toHaveLength(1);
    expect(String(said[0][0])).toContain('the icon is a check already');
    warn.mockRestore();
  });

  it.each(Object.entries(STATUS_ALIASES))(
    "%s: its base with the status fixed, and Carbon's art with motion off",
    (alias, { base, status }) => {
      const [A, B] = [LIB[alias], LIB[base]];
      expect(A, alias).toBeDefined();
      for (const size of [16, 20, 24, 32]) {
        expect(html(<A size={size} />), `${alias} @${size}`).toBe(
          html(<B size={size} status={status} />)
        );
        // animated={false}: Carbon's own drawing.
        expect(
          paths(<A size={size} animated={false} />),
          `${alias} still @${size}`
        ).toBe(paths(React.createElement(CARBON[alias], { size })));
      }
      expect(html(<A status="pending" />)).toBe(html(<B status={status} />));
      expect(html(<A tone />)).toBe(html(<B status={status} tone />));
      expect(html(<A tone />)).not.toBe(html(<A />));
    }
  );

  it('an alias hovers on its mark (the base holds); the base with the same status holds still', async () => {
    const clock = manualScheduler();
    setScheduler(clock);
    try {
      const d = (c: HTMLElement, k: string) =>
        c.querySelector(`[data-k="${k}"]`)?.getAttribute('d');
      for (const [alias, base, status, key] of [
        ['CheckmarkFilledWarning', 'CheckmarkFilled', 'warning', 'status-warn'],
        ['InProgressError', 'InProgress', 'error', 'status-err'],
      ] as const) {
        const a = render(React.createElement(LIB[alias]));
        const b = render(React.createElement(LIB[base], { status }));
        const [restA, restB] = [a.container.innerHTML, b.container.innerHTML];
        const markA = d(a.container, key);
        fireEvent.mouseEnter(a.container.querySelector('svg')!);
        fireEvent.mouseEnter(b.container.querySelector('svg')!);
        for (let i = 0; i < 20; i++) {
          clock.advance(1000 / 60);
          await act(async () => {
            await Promise.resolve();
          });
        }
        expect(d(a.container, key), `${alias} mark grows`).not.toBe(markA);
        expect(a.container.innerHTML).not.toBe(restA);
        expect(b.container.innerHTML, `${base} holds`).toBe(restB);
        fireEvent.mouseLeave(a.container.querySelector('svg')!);
        for (let i = 0; i < 20; i++) {
          clock.advance(1000 / 60);
          await act(async () => {
            await Promise.resolve();
          });
        }
        expect(a.container.innerHTML, `${alias} back at rest`).toBe(restA);
        a.unmount();
        b.unmount();
      }
    } finally {
      setScheduler(null);
    }
  });

  it('no Carbon name for incomplete--cancel or data--error (their mark is a cancel ×, not the error mark)', () => {
    expect(LIB).not.toHaveProperty('IncompleteCancel');
    expect(LIB).not.toHaveProperty('DataError');
  });
});
