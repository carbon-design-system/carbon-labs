/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment node
/**
 * SSR safety: in plain Node (no DOM), every module imports without touching
 * `window` / `document` (pure exports: importing a class defines nothing),
 * and `renderIconHTML` produces a declarative shadow root holding the
 * resting drawing, the same drawing the element paints first in a browser
 * (the parity suite checks that one against React).
 */
import { describe, expect, it } from 'vitest';

describe('in Node, with no DOM', () => {
  it('imports the core, the classes and the per-icon entry points without throwing', async () => {
    expect(typeof (globalThis as { document?: unknown }).document).toBe(
      'undefined'
    );
    await import('@carbon-labs/motion-icons-core/engine');
    const wc = await import('../src/index');
    expect(wc.ClabsMotionIconSettings.is).toBe('clabs-motion-icon-settings');
    // A registering entry point: with no registry (or Lit's server shim), defining is a no-op, not a crash.
    await import('../src/define-all');
  });

  it('renders a declarative shadow root with the rest frame', async () => {
    const { renderIconHTML, restShapes } = await import('../src/ssr');
    const {
      ClabsMotionIconNotification,
      ClabsMotionIconSettings,
      ClabsMotionIconPlayPauseToggle,
      ClabsMotionIconBookmarkToggle,
      ClabsMotionStatusPip,
    } = await import('../src/index');
    const { shapesMarkup } =
      await import('@carbon-labs/motion-icons-core/engine');

    const html = renderIconHTML(ClabsMotionIconNotification, {
      size: 24,
      count: 3,
      'aria-label': 'Notifications, 3 new',
    });
    expect(
      html.startsWith(
        '<clabs-motion-icon-notification size="24" count="3" aria-label="Notifications, 3 new" role="img"><template shadowrootmode="open"><style>'
      )
    ).toBe(true);
    expect(html).toContain('<g data-mc-ink>');
    expect(html).toContain('data-k="status-count"');
    expect(html).toContain(
      shapesMarkup(
        restShapes(ClabsMotionIconNotification, { size: 24, count: 3 })
      )
    );
    expect(html.endsWith('</template></clabs-motion-icon-notification>')).toBe(
      true
    );

    // Decorative: hidden from assistive tech before upgrade too.
    expect(
      renderIconHTML(ClabsMotionIconSettings, { status: 'pending' })
    ).toContain('aria-hidden="true"><template');
    // Pending at rest on the server is the still drawing (three dots), as under reduced motion.
    expect(
      renderIconHTML(ClabsMotionIconSettings, { status: 'pending' })
    ).toContain('data-k="status-dots"');
    // Toggles pick their drawing and state from the attributes.
    const pp = renderIconHTML(ClabsMotionIconPlayPauseToggle, {
      value: 'pause',
      filled: true,
      variant: 'outline',
    });
    expect(pp).toContain(' filled variant="outline"');
    expect(
      renderIconHTML(ClabsMotionIconBookmarkToggle, { toggled: true })
    ).not.toEqual(renderIconHTML(ClabsMotionIconBookmarkToggle, {}));
    expect(renderIconHTML(ClabsMotionStatusPip, { count: 7 })).toContain(
      'data-k="pip"'
    );
  });

  it('with animated="false", the still: Carbon\'s art, as the element draws it; in an icon slot, 16', async () => {
    const { renderIconHTML } = await import('../src/ssr');
    const {
      ClabsMotionIconAdd,
      ClabsMotionIconBookmarkToggle,
      ClabsMotionIconSettings,
    } = await import('../src/index');
    const add = renderIconHTML(ClabsMotionIconAdd, { animated: 'false' });
    expect(add).not.toContain('data-k=');
    expect(add).toMatch(
      /<svg part="svg"[^>]*viewBox="0 0 32 32"[^>]*><path d="/
    );
    expect(
      renderIconHTML(ClabsMotionIconBookmarkToggle, {
        animated: 'false',
        value: 'on',
      })
    ).not.toEqual(
      renderIconHTML(ClabsMotionIconBookmarkToggle, { animated: 'false' })
    );
    // A status shows its still frame, not the plain icon's art.
    expect(
      renderIconHTML(ClabsMotionIconSettings, {
        animated: 'false',
        status: 'success',
      })
    ).toContain('data-k="status-');
    expect(renderIconHTML(ClabsMotionIconAdd, { slot: 'icon' })).toContain(
      'width="16"'
    );
  });
});
