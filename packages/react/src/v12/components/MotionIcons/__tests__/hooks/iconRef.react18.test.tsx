/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Icon refs on React 18 (the peer is `react >=18`): React 18 strips `ref`
 * from a function component's props, so there the icons are forwardRef
 * components. This suite makes the package see React 18 (`version`), so
 * every icon module builds its components the React 18 way, and checks the
 * handle, the markup and the statics on that path (rendered by the test's
 * React 19, which runs forwardRef components as 18 does).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createRef, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, render } from '@testing-library/react';
import type { MotionIconHandle } from '../../types';

type Pkg = typeof import('../../index');
let pkg: Pkg;
let latest: Pkg;
const FORWARD_REF = Symbol.for('react.forward_ref');

beforeAll(async () => {
  latest = await import('../../index');
  vi.resetModules();
  vi.doMock('react', async (importOriginal) => {
    const actual = await importOriginal<
      typeof import('react') & { default: typeof import('react') }
    >();
    return {
      ...actual,
      version: '18.3.1',
      default: { ...actual.default, version: '18.3.1' },
    };
  });
  pkg = await import('../../index');
}, 60_000);
afterAll(() => {
  vi.doUnmock('react');
  vi.resetModules();
});

describe('on React 18', () => {
  it('every kind of icon is a forwardRef, with its statics and name', () => {
    const {
      Settings,
      BookmarkToggle,
      PlayPauseToggle,
      VolumeLevelToggle,
      SkillLevelToggle,
      ChevronDownUpToggle,
      SidePanelFilledToggle,
      Save,
      StatusPip,
    } = pkg;
    for (const C of [
      Settings,
      BookmarkToggle,
      PlayPauseToggle,
      VolumeLevelToggle,
      SkillLevelToggle,
      ChevronDownUpToggle,
      SidePanelFilledToggle,
      Save,
      StatusPip,
    ]) {
      expect(
        (C as unknown as { $$typeof: symbol }).$$typeof,
        C.displayName
      ).toBe(FORWARD_REF);
    }
    expect(Settings.displayName).toBe('Settings');
    expect(typeof (Settings as unknown as { geo: unknown }).geo).toBe(
      'function'
    );
    expect(BookmarkToggle.states).toEqual(latest.BookmarkToggle.states);
    // A variant's statics are its default drawing's, not its forwardRef internals.
    expect(PlayPauseToggle.states).toEqual(latest.PlayPauseToggle.states);
    expect(typeof PlayPauseToggle.pick).toBe('function');
    expect((PlayPauseToggle as unknown as { render: unknown }).render).not.toBe(
      (PlayPauseToggle.pick({}) as unknown as { render: unknown }).render
    );
    expect(Save.status.statuses).toEqual(latest.Save.status.statuses);
    expect((Save as unknown as { render: unknown }).render).not.toBe(
      (Save.status.plain as unknown as { render: unknown }).render
    );
  });

  it('draws the same markup as on React 19', () => {
    const pairs: [string, Record<string, unknown>][] = [
      ['Settings', {}],
      ['Add', { animated: false }],
      ['BookmarkToggle', { toggled: true }],
      ['BookmarkToggle', { asButton: true, 'aria-label': 'B' }],
      ['PlayPauseToggle', { variant: 'outline', filled: true }],
      ['VolumeLevelToggle', {}],
      ['SkillLevelToggle', { toggled: true }],
      ['ChevronDownUpToggle', {}],
      ['Save', { status: 'pending' }],
      ['Notification', { count: 4 }],
      ['StatusPip', { count: 3 }],
    ];
    for (const [name, props] of pairs) {
      const Old = (
        pkg as unknown as Record<string, ComponentType<Record<string, unknown>>>
      )[name];
      const New = (
        latest as unknown as Record<
          string,
          ComponentType<Record<string, unknown>>
        >
      )[name];
      expect(
        renderToStaticMarkup(<Old {...props} ref={createRef()} />),
        name
      ).toBe(renderToStaticMarkup(<New {...props} />));
    }
  });

  it('the ref gets the handle: svg, and play()', async () => {
    const { Settings, BookmarkToggle, PlayPauseToggle, Save, StatusPip } = pkg;
    for (const [Icon, props] of [
      [Settings, {}],
      [Settings, { animated: false }],
      [BookmarkToggle, {}],
      [BookmarkToggle, { animated: false }],
      [PlayPauseToggle, {}],
      [Save, {}],
      [Save, { status: 'error' }],
      [StatusPip, { count: 2 }],
    ] as [ComponentType<Record<string, unknown>>, Record<string, unknown>][]) {
      const ref = createRef<MotionIconHandle>();
      const { container, unmount } = render(<Icon {...props} ref={ref} />);
      expect(ref.current!.svg).toBe(container.querySelector('svg'));
      let done = false;
      await act(async () => {
        await ref.current!.play().then(() => (done = true));
      });
      // Real timers: the hover plays out in about a quarter second.
      expect(done).toBe(true);
      unmount();
    }
    cleanup();
  });
});
