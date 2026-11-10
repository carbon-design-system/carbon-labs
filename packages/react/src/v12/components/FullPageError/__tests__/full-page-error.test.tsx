/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { evaluateCurve } from '@carbon-labs/v12-motion';
import { describe, expect, it } from 'vitest';
import { ARROW, arrowDraw, FullPageError } from '../components/FullPageError';
import { FullPageErrorArt } from '../components/art';

describe('FullPageError arrow', () => {
  const draw = arrowDraw(1.75);

  it('draws the line first; the head starts before the line ends', () => {
    expect(draw.head.delay).toBeGreaterThan(0);
    expect(draw.head.delay).toBeLessThan(draw.line.duration);
    expect(draw.ride.delay + draw.ride.duration).toBeCloseTo(
      draw.line.duration,
      6
    );
    expect(draw.done).toBe(draw.head.delay + draw.head.duration);
  });

  it('fades the error in while the head still draws, fast-01 before it lands', () => {
    expect(draw.fadeIn).toBe(draw.done - 80);
    expect(draw.fadeIn).toBeGreaterThan(draw.head.delay);
    expect(arrowDraw(1.75, 4).fadeIn).toBe(draw.fadeIn * 4);
  });

  it('keeps the head on the line end while it rides', () => {
    for (const f of draw.ride.frames) {
      const t = draw.ride.delay + f.offset * draw.ride.duration;
      const drawn =
        ARROW.length * evaluateCurve(draw.line.easing, t / draw.line.duration);
      expect(drawn, 'the end is on the horizontal run').toBeGreaterThanOrEqual(
        ARROW.corner
      );
      expect(f.dx).toBeCloseTo(drawn - ARROW.length, 6);
    }
    expect(draw.ride.frames.at(-1)!.dx).toBeCloseTo(0, 6);
  });

  it('scales with the time scale', () => {
    const slow = arrowDraw(1.75, 4);
    expect(slow.line.duration).toBe(draw.line.duration * 4);
    expect(slow.done).toBe(draw.done * 4);
  });

  it('hides the arrow from assistive tech and keeps the label in the heading', () => {
    const html = renderToStaticMarkup(
      <FullPageError
        label="Error 404"
        title="Page not found"
        description="Gone."
      />
    );
    expect(html).toMatch(
      /<h1[^>]*>.*<svg[^>]*aria-hidden="true".*Error 404.*Page not found.*<\/h1>/
    );
  });
});

describe('illustrations are line only', () => {
  it('draws paths only, no filled shapes', () => {
    const all = (['403', '404', 'custom'] as const).map((k) =>
      renderToStaticMarkup(<FullPageErrorArt kind={k} />)
    );
    for (const html of all) {
      expect(html).toContain('<path');
      expect(html).not.toMatch(/<(polygon|circle|rect|ellipse)\b|fill="/);
    }
  });
});
