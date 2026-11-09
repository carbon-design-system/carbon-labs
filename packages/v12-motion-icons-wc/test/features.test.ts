/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The stage-4 behaviours the harness asked for, in jsdom:
 *  - in a Carbon button's icon slot with no `size`, the icon draws at 16;
 *  - `as-button` puts role, tabindex and aria-pressed on the host as
 *    attributes (so getByRole finds it), never over an author's own;
 *  - `as-button` inside a button or link warns and stays a plain icon;
 *  - `animated="false"` draws Carbon's art (decision 5), and back;
 *  - `<clabs-motion-icon name>` loads the named icon, passes attributes through.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

type IconEl = HTMLElement & {
  updateComplete: Promise<unknown>;
  drawSize: number;
  value?: string;
};

beforeAll(async () => {
  await import('../src/define-all');
  await import('../src/motion-icon');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  vi.restoreAllMocks();
});

async function mount<T extends HTMLElement = IconEl>(
  html: string,
  sel = '[data-icon]'
): Promise<{ root: HTMLElement; icon: T }> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  made.push(root);
  const icon = root.querySelector<T>(sel)!;
  await (icon as unknown as IconEl).updateComplete;
  return { root, icon };
}

describe("Carbon's icon slot", () => {
  it('with no size, the icon draws at 16; a size of its own wins', async () => {
    const { icon } = await mount(
      '<div><clabs-motion-icon-add data-icon slot="icon"></clabs-motion-icon-add></div>'
    );
    expect(icon.drawSize).toBe(16);
    expect(icon.shadowRoot!.querySelector('svg')!.getAttribute('width')).toBe(
      '16'
    );
    const { icon: sized } = await mount(
      '<div><clabs-motion-icon-add data-icon slot="icon" size="20"></clabs-motion-icon-add></div>'
    );
    expect(sized.drawSize).toBe(20);
  });
});

describe('as-button', () => {
  it('puts role, tabindex and aria-pressed on the host, and keeps them current', async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark"></clabs-motion-icon-bookmark-toggle>'
    );
    expect(icon.getAttribute('role')).toBe('button');
    expect(icon.getAttribute('tabindex')).toBe('0');
    expect(icon.getAttribute('aria-pressed')).toBe('false');
    icon.click();
    await icon.updateComplete;
    expect(icon.getAttribute('aria-pressed')).toBe('true');
  });

  it("never overwrites an author's own role or tabindex", async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-bookmark-toggle data-icon as-button role="switch" tabindex="-1"></clabs-motion-icon-bookmark-toggle>'
    );
    expect(icon.getAttribute('role')).toBe('switch');
    expect(icon.getAttribute('tabindex')).toBe('-1');
  });

  it('inside a button or link: warns, and drops its own role and tab stop', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { icon } = await mount(
      '<button><clabs-motion-icon-bookmark-toggle data-icon as-button></clabs-motion-icon-bookmark-toggle></button>'
    );
    expect(warn).toHaveBeenCalled();
    expect(icon.getAttribute('role')).toBeNull();
    expect(icon.hasAttribute('tabindex')).toBe(false);
  });
});

describe('animated="false"', () => {
  it("draws Carbon's art, the state's; animated again, the frames", async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-bookmark-toggle data-icon animated="false" value="on"></clabs-motion-icon-bookmark-toggle>'
    );
    const svg = () => icon.shadowRoot!.querySelector('svg')!;
    expect(svg().querySelector('[data-k]')).toBeNull();
    expect(svg().querySelector('path')).not.toBeNull();
    const on = svg().innerHTML;
    icon.value = 'off';
    await icon.updateComplete;
    expect(svg().innerHTML).not.toBe(on);
    icon.removeAttribute('animated');
    await icon.updateComplete;
    expect(svg().querySelector('[data-k]')).not.toBeNull();
  });
});

describe('<clabs-motion-icon name>', () => {
  it('draws the named icon with the attributes passed through, and follows them', async () => {
    const { icon } = await mount<HTMLElement & { icon?: HTMLElement }>(
      '<clabs-motion-icon data-icon name="settings" size="24" status="success"></clabs-motion-icon>'
    );
    await vi.waitFor(() => expect(icon.icon).toBeTruthy());
    const inner = icon.icon as IconEl;
    expect(inner.localName).toBe('clabs-motion-icon-settings');
    expect(inner.getAttribute('size')).toBe('24');
    expect(inner.getAttribute('status')).toBe('success');
    icon.setAttribute('size', '16');
    await vi.waitFor(() => expect(inner.getAttribute('size')).toBe('16'));
    icon.setAttribute('name', 'add');
    await vi.waitFor(() =>
      expect(icon.icon?.localName).toBe('clabs-motion-icon-add')
    );
  });

  it('an unknown name draws nothing and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { icon } = await mount<HTMLElement & { icon?: HTMLElement }>(
      '<clabs-motion-icon data-icon name="no-such-icon"></clabs-motion-icon>'
    );
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    expect(icon.icon).toBeUndefined();
  });
});

describe('muted (VolumeLevelToggle)', () => {
  type Volume = IconEl & { muted: boolean };
  const drawn = (el: HTMLElement) =>
    el.shadowRoot!.querySelector('svg')!.innerHTML;
  it('mutes from any level and comes back to it, kept in step with value both ways', async () => {
    for (const level of ['quiet', 'loud']) {
      const { icon } = await mount<Volume>(
        `<clabs-motion-icon-volume-level-toggle data-icon animated="false" value="${level}"></clabs-motion-icon-volume-level-toggle>`
      );
      const { icon: muteRef } = await mount<Volume>(
        '<clabs-motion-icon-volume-level-toggle data-icon animated="false" value="mute"></clabs-motion-icon-volume-level-toggle>'
      );
      const atLevel = drawn(icon);
      icon.muted = true;
      await icon.updateComplete;
      expect(icon.value).toBe('mute');
      expect(icon.hasAttribute('muted')).toBe(true);
      expect(drawn(icon)).toBe(drawn(muteRef));
      icon.muted = false;
      await icon.updateComplete;
      expect(icon.value).toBe(level);
      expect(drawn(icon)).toBe(atLevel);
      // A click from loud goes to mute, and sets muted.
      icon.value = 'loud';
      await icon.updateComplete;
      icon.click();
      await icon.updateComplete;
      expect([icon.value, icon.muted]).toEqual(['mute', true]);
    }
  });

  it('in HTML, muted wins over value and remembers it; none, down and up are mute, quiet and loud (deprecated, with a note)', async () => {
    const { icon } = await mount<Volume>(
      '<clabs-motion-icon-volume-level-toggle data-icon value="loud" muted></clabs-motion-icon-volume-level-toggle>'
    );
    expect(icon.value).toBe('mute');
    icon.muted = false;
    await icon.updateComplete;
    expect(icon.value).toBe('loud');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { icon: old } = await mount<Volume>(
      '<clabs-motion-icon-volume-level-toggle data-icon value="none"></clabs-motion-icon-volume-level-toggle>'
    );
    expect([old.value, old.muted]).toEqual(['mute', true]);
    expect(warn).toHaveBeenCalled();
    old.click();
    await old.updateComplete;
    expect(old.value).toBe('quiet');
    // down and up are quiet and loud's old names.
    for (const [was, now] of [
      ['down', 'quiet'],
      ['up', 'loud'],
    ]) {
      const { icon: renamed } = await mount<Volume>(
        `<clabs-motion-icon-volume-level-toggle data-icon value="${was}"></clabs-motion-icon-volume-level-toggle>`
      );
      expect(renamed.value).toBe(now);
    }
  });
});
