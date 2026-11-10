/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  composePress,
  type ProgressReach,
  useProgressReach,
} from '../components/ProgressIndicator';

function reachOf(): ProgressReach {
  let out: ProgressReach | undefined;
  const Probe = () => {
    out = useProgressReach();
    return null;
  };
  renderToStaticMarkup(<Probe />);
  return out!;
}

describe('useProgressReach press', () => {
  it("keeps a control's own handlers: both run, its own first", () => {
    const reach = reachOf();
    const order: string[] = [];
    const onPointerDown = vi.fn(() => order.push('own'));
    const onKeyDown = vi.fn();
    const props = reach.press(1, { onPointerDown, onKeyDown });
    props.onPointerDown!({ button: 0 } as never);
    props.onKeyDown!({ key: 'Enter', repeat: false } as never);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['own']);
  });

  it('gives every press handler without its own', () => {
    const props = reachOf().press(0);
    expect(Object.keys(props).sort()).toEqual(
      [
        'onBlur',
        'onKeyDown',
        'onKeyUp',
        'onPointerCancel',
        'onPointerDown',
        'onPointerLeave',
        'onPointerUp',
      ].sort()
    );
  });
});

describe('composePress', () => {
  const recorder = (order: string[], name: string) =>
    Object.fromEntries(
      [
        'onPointerDown',
        'onPointerUp',
        'onPointerLeave',
        'onPointerCancel',
        'onKeyDown',
        'onKeyUp',
        'onBlur',
      ].map((k) => [k, () => order.push(`${name} ${k}`)])
    ) as never;

  it('runs the control’s own handler, then the reach', () => {
    const order: string[] = [];
    const props = composePress(
      { onPointerDown: () => order.push('own onPointerDown') },
      recorder(order, 'reach')
    );
    props.onPointerDown!({ defaultPrevented: false } as never);
    props.onKeyDown!({ defaultPrevented: false } as never);
    expect(order).toEqual([
      'own onPointerDown',
      'reach onPointerDown',
      'reach onKeyDown',
    ]);
  });

  it('skips the reach when the control’s own handler prevents the event', () => {
    const order: string[] = [];
    const props = composePress(
      {
        onPointerDown: (e) => {
          order.push('own onPointerDown');
          e.preventDefault();
        },
      },
      recorder(order, 'reach')
    );
    const e = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    props.onPointerDown!(e as never);
    expect(order).toEqual(['own onPointerDown']);
  });
});
