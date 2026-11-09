/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What holds an icon's hover (bindHover): a mouse or pen, keyboard focus on
 * the frame or the icon's own button, and how they combine: the hover plays in when the first starts and out when the
 * last ends, never twice.
 *
 * jsdom matches `:focus-visible` like `:focus` (every focus is "keyboard"),
 * so a mouse-click focus is modelled by making `:focus-visible` not match.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let core: typeof import('../src/engine/index');
beforeAll(async () => {
  core = await import('../src/engine/index');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  vi.restoreAllMocks();
});

/** `<tag data-motion-icon-frame><span icon/></tag>` in the document. */
function framed(tag = 'button') {
  const frame = document.createElement(tag);
  frame.setAttribute('data-motion-icon-frame', '');
  const icon = document.createElement('span');
  frame.append(icon);
  document.body.append(frame);
  made.push(frame);
  return { frame, icon };
}

function bind(icon: Element) {
  const seen: string[] = [];
  const off = core.bindHover(icon, {
    enter: () => seen.push('enter'),
    leave: () => seen.push('leave'),
  });
  return { seen, off };
}

const enter = (el: Element) => el.dispatchEvent(new MouseEvent('mouseenter'));
const leave = (el: Element) => el.dispatchEvent(new MouseEvent('mouseleave'));
/** A focus that isn't keyboard focus (a mouse click on a button): `:focus-visible` doesn't match. */
function mouseFocus(el: HTMLElement) {
  const matches = Element.prototype.matches;
  const spy = vi
    .spyOn(Element.prototype, 'matches')
    .mockImplementation(function (this: Element, s: string) {
      return s === ':focus-visible' ? false : matches.call(this, s);
    });
  el.focus();
  spy.mockRestore();
}

describe('keyboard focus plays the hover', () => {
  it('on the frame: focus plays in, blur plays out', () => {
    const { frame, icon } = framed();
    const { seen, off } = bind(icon);
    frame.focus();
    expect(seen).toEqual(['enter']);
    frame.blur();
    expect(seen).toEqual(['enter', 'leave']);
    off();
    frame.focus();
    expect(seen).toHaveLength(2);
  });

  it('a mouse-click focus is not keyboard focus: it does not hold the hover', () => {
    const { frame, icon } = framed();
    const { seen } = bind(icon);
    enter(frame);
    mouseFocus(frame);
    leave(frame);
    expect(seen).toEqual(['enter', 'leave']);
    mouseFocus(frame);
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('hover then focus: plays once; leaves only when both have ended (pointer out first)', () => {
    const { frame, icon } = framed();
    const { seen } = bind(icon);
    enter(frame);
    frame.focus();
    expect(seen).toEqual(['enter']);
    leave(frame);
    expect(seen, 'still focused').toEqual(['enter']);
    frame.blur();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('focus then hover: plays once; leaves only when both have ended (blur first)', () => {
    const { frame, icon } = framed();
    const { seen } = bind(icon);
    frame.focus();
    enter(frame);
    expect(seen).toEqual(['enter']);
    frame.blur();
    expect(seen, 'pointer still over it').toEqual(['enter']);
    leave(frame);
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('a focusable icon (as-button) is its own frame', () => {
    const icon = document.createElement('span');
    icon.tabIndex = 0;
    document.body.append(icon);
    made.push(icon);
    const { seen } = bind(icon);
    icon.focus();
    icon.blur();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it("the icon's own button (React's asButton: <button aria-pressed><svg/></button>)", () => {
    const button = document.createElement('button');
    button.setAttribute('aria-pressed', 'false');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    button.append(svg);
    document.body.append(button);
    made.push(button);
    const { seen } = bind(svg);
    button.focus();
    expect(seen).toEqual(['enter']);
    button.blur();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it("an icon-only button that isn't the icon's own (no aria-pressed) is not the icon: opt in with the frame", () => {
    const button = document.createElement('button');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    button.append(svg);
    document.body.append(button);
    made.push(button);
    const { seen } = bind(svg);
    button.focus();
    expect(seen).toEqual([]);
  });

  it('focus on something else inside the frame (a link in a card) does not play', () => {
    const { frame, icon } = framed('div');
    const link = document.createElement('a');
    link.href = '#x';
    link.textContent = 'x';
    frame.append(link);
    const { seen } = bind(icon);
    link.focus();
    link.blur();
    expect(seen).toEqual([]);
  });

  it("across a shadow root: focus inside a component's shadow DOM (delegated) plays its hosted icon", () => {
    const host = document.createElement('div');
    host.setAttribute('data-motion-icon-frame', '');
    const root = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('button');
    root.append(inner, document.createElement('slot'));
    const icon = document.createElement('span');
    host.append(icon);
    document.body.append(host);
    made.push(host);
    const { seen } = bind(icon);
    // jsdom matches :focus only against document.activeElement (the host); a browser matches the inner button.
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      s: string
    ) {
      return s === ':focus-visible' ? this === inner : matches.call(this, s);
    });
    inner.focus();
    expect(seen).toEqual(['enter']);
    inner.blur();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('touch still never hovers (keyboard focus after a tap is still keyboard focus only if :focus-visible says so)', () => {
    const { frame, icon } = framed();
    const { seen } = bind(icon);
    const e = new Event('pointerenter');
    Object.defineProperty(e, 'pointerType', { value: 'touch' });
    frame.dispatchEvent(e);
    enter(frame);
    mouseFocus(frame);
    expect(seen).toEqual([]);
  });
});

describe('a bare svg icon gets no focus listener (Chrome would make it focusable: a click outlines it)', () => {
  const SVG = 'http://www.w3.org/2000/svg';
  const FOCUS = ['focus', 'blur', 'focusin', 'focusout'];
  /** Every focus-family listener added to an svg element while `fn` runs. */
  function svgFocusListeners(fn: () => void): string[] {
    const add = EventTarget.prototype.addEventListener;
    const seen: string[] = [];
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
      function (this: EventTarget, type: string, ...rest) {
        if (
          this instanceof Element &&
          this.namespaceURI === SVG &&
          FOCUS.includes(type)
        ) {
          seen.push(type);
        }
        return add.call(this, type, ...(rest as [EventListener]));
      }
    );
    fn();
    return seen;
  }
  function bareSvg(parent: Node = document.body) {
    const svg = document.createElementNS(SVG, 'svg');
    parent.appendChild(svg);
    made.push(svg);
    return svg;
  }

  it('bare (no frame, no own button): nothing on the svg; pointer hover still binds to it', () => {
    let svg!: SVGSVGElement;
    let seen!: string[];
    expect(
      svgFocusListeners(() => {
        svg = bareSvg();
        seen = bind(svg).seen;
      })
    ).toEqual([]);
    enter(svg);
    leave(svg);
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('in a marked frame, or as an asButton button, nothing on the svg either', () => {
    const { frame } = framed();
    const button = document.createElement('button');
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
    made.push(button);
    expect(
      svgFocusListeners(() => {
        bind(bareSvg(frame));
        bind(bareSvg(button));
      })
    ).toEqual([]);
  });

  it('a bare svg given a tabindex still plays on keyboard focus (heard from its document), and only its own', () => {
    const [a, b] = [bareSvg(), bareSvg()];
    a.setAttribute('tabindex', '0');
    const [x, y] = [bind(a), bind(b)];
    a.focus();
    expect(document.activeElement).toBe(a);
    a.blur();
    expect(x.seen).toEqual(['enter', 'leave']);
    expect(y.seen).toEqual([]);
    x.off();
    a.focus();
    a.blur();
    expect(x.seen).toHaveLength(2);
  });

  it.each(['open', 'closed'] as const)(
    'inside a %s shadow root, heard from that root',
    (mode) => {
      const host = document.createElement('div');
      document.body.append(host);
      made.push(host);
      const root = host.attachShadow({ mode });
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('tabindex', '0');
      root.append(svg);
      let seen!: string[];
      expect(svgFocusListeners(() => (seen = bind(svg).seen))).toEqual([]);
      // jsdom matches :focus only against document.activeElement (the host); a browser matches the svg.
      const matches = Element.prototype.matches;
      vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
        this: Element,
        s: string
      ) {
        return s === ':focus-visible' ? this === svg : matches.call(this, s);
      });
      svg.focus();
      svg.blur();
      expect(seen).toEqual(['enter', 'leave']);
    }
  );

  it('a mouse-click focus on it still adds nothing', () => {
    const svg = bareSvg();
    svg.setAttribute('tabindex', '0');
    const { seen } = bind(svg);
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      s: string
    ) {
      return s === ':focus-visible' ? false : matches.call(this, s);
    });
    svg.focus();
    expect(seen).toEqual([]);
  });
});

describe('play()', () => {
  /** Handlers whose hover-in lands when the test says so. */
  function controlled(icon: Element) {
    const seen: string[] = [];
    let land: (() => void) | null = null;
    const b = core.bindHover(icon, {
      enter: () => {
        seen.push('enter');
        return new Promise<void>((r) => (land = r));
      },
      leave: () => seen.push('leave'),
    });
    const landIn = async () => {
      land?.();
      land = null;
      await Promise.resolve();
      await Promise.resolve();
    };
    return { seen, b, landIn };
  }

  it('plays in, then out once the hover-in lands', async () => {
    const { icon } = framed();
    const { seen, b, landIn } = controlled(icon);
    b.play();
    expect(seen).toEqual(['enter']);
    await landIn();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('does not restart: mid-hover (pointer), mid-focus, or mid-play it is a no-op', async () => {
    const { frame, icon } = framed();
    const { seen, b, landIn } = controlled(icon);
    enter(frame);
    b.play();
    expect(seen).toEqual(['enter']);
    leave(frame);
    frame.focus();
    b.play();
    frame.blur();
    expect(seen).toEqual(['enter', 'leave', 'enter', 'leave']);
    b.play();
    b.play();
    expect(seen.filter((s) => s === 'enter')).toHaveLength(3);
    await landIn();
    expect(seen.at(-1)).toBe('leave');
  });

  it('a pointer arriving mid-play keeps the hover until it leaves; one leaving before the landing waits for it', async () => {
    const { frame, icon } = framed();
    const { seen, b, landIn } = controlled(icon);
    b.play();
    enter(frame);
    await landIn();
    expect(seen, 'held by the pointer').toEqual(['enter']);
    leave(frame);
    expect(seen).toEqual(['enter', 'leave']);
    b.play();
    enter(frame);
    leave(frame);
    expect(seen, 'the play still runs in').toEqual(['enter', 'leave', 'enter']);
    await landIn();
    expect(seen).toEqual(['enter', 'leave', 'enter', 'leave']);
  });

  it('focus arriving mid-play holds the hover until blur', async () => {
    const { frame, icon } = framed();
    const { seen, b, landIn } = controlled(icon);
    b.play();
    frame.focus();
    await landIn();
    expect(seen).toEqual(['enter']);
    frame.blur();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('an enter that returns no promise (nothing played) ends the play at once', async () => {
    const { icon } = framed();
    const { seen, off } = bind(icon);
    off.play();
    expect(seen).toEqual(['enter']);
    await Promise.resolve();
    await Promise.resolve();
    expect(seen).toEqual(['enter', 'leave']);
  });

  it('unbound, it does nothing', () => {
    const { icon } = framed();
    const { seen, off } = bind(icon);
    off();
    off.play();
    expect(seen).toEqual([]);
  });

  it('playHover(root) plays every icon bound inside root or framed by it, across shadow roots', () => {
    const a = framed();
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('span');
    root.append(inner);
    a.frame.append(host);
    const elsewhere = framed();
    const [x, y, z] = [
      controlled(a.icon),
      controlled(inner),
      controlled(elsewhere.icon),
    ];
    expect(core.playHover(a.frame)).toBe(2);
    expect(x.seen).toEqual(['enter']);
    expect(y.seen).toEqual(['enter']);
    expect(z.seen).toEqual([]);
    expect(core.playHover(document.createElement('div'))).toBe(0);
    [x, y, z].forEach((c) => c.b());
  });
});

describe('no hover inside a disabled button', () => {
  const play = (b: ReturnType<typeof core.bindHover>) => b.play();
  /** jsdom never matches :hover; a browser does while the pointer is over the frame. */
  function hoverIs(over: boolean) {
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      s: string
    ) {
      return s === ':hover' ? over : matches.call(this, s);
    });
  }

  it.each([
    [
      'a disabled <button>',
      () => {
        const f = framed();
        (f.frame as HTMLButtonElement).disabled = true;
        return f;
      },
    ],
    [
      'aria-disabled="true"',
      () => {
        const f = framed();
        f.frame.setAttribute('aria-disabled', 'true');
        return f;
      },
    ],
    [
      "Carbon's disabled attribute (cds-icon-button)",
      () => {
        const f = framed('cds-icon-button');
        f.frame.setAttribute('disabled', '');
        return f;
      },
    ],
    [
      'a button in a disabled fieldset',
      () => {
        const f = framed();
        const fs = document.createElement('fieldset');
        fs.disabled = true;
        f.frame.replaceWith(fs);
        fs.append(f.frame);
        made.push(fs);
        return f;
      },
    ],
  ])('%s: pointer, keyboard focus and play() do not animate', (_, make) => {
    const { frame, icon } = make();
    const { seen, off } = bind(icon);
    enter(frame);
    leave(frame);
    (frame as HTMLElement).focus();
    (frame as HTMLElement).blur();
    play(off);
    expect(core.isDisabledFrame(frame)).toBe(true);
    expect(seen).toEqual([]);
  });

  it('aria-disabled="false" and a custom element without disabled hover as usual', () => {
    const a = framed();
    a.frame.setAttribute('aria-disabled', 'false');
    const b = framed('cds-button');
    const [x, y] = [bind(a.icon), bind(b.icon)];
    enter(a.frame);
    enter(b.frame);
    expect(x.seen).toEqual(['enter']);
    expect(y.seen).toEqual(['enter']);
  });

  it('disabled mid-hover plays out; enabled again with the pointer still over it plays back in', async () => {
    const { frame, icon } = framed();
    const { seen } = bind(icon);
    enter(frame);
    (frame as HTMLButtonElement).disabled = true;
    await Promise.resolve();
    expect(seen).toEqual(['enter', 'leave']);
    hoverIs(true);
    (frame as HTMLButtonElement).disabled = false;
    await Promise.resolve();
    expect(seen).toEqual(['enter', 'leave', 'enter']);
  });

  it('enabled again after the pointer left unseen (a disabled control may not report it): stays at rest', async () => {
    const { frame, icon } = framed('cds-icon-button');
    const { seen } = bind(icon);
    enter(frame);
    frame.setAttribute('disabled', '');
    await Promise.resolve();
    hoverIs(false);
    frame.removeAttribute('disabled');
    await Promise.resolve();
    expect(seen).toEqual(['enter', 'leave']);
    enter(frame);
    expect(seen).toEqual(['enter', 'leave', 'enter']);
  });

  it('keyboard focus held while disabled plays in when enabled', async () => {
    const { frame, icon } = framed();
    frame.setAttribute('aria-disabled', 'true');
    const { seen } = bind(icon);
    frame.focus();
    expect(seen).toEqual([]);
    frame.setAttribute('aria-disabled', 'false');
    await Promise.resolve();
    expect(seen).toEqual(['enter']);
  });

  it('a play in flight when the frame is disabled plays out', async () => {
    const { frame, icon } = framed();
    const seen: string[] = [];
    const b = core.bindHover(icon, {
      enter: () => (seen.push('enter'), new Promise(() => {})),
      leave: () => seen.push('leave'),
    });
    b.play();
    (frame as HTMLButtonElement).disabled = true;
    await Promise.resolve();
    expect(seen).toEqual(['enter', 'leave']);
    (frame as HTMLButtonElement).disabled = false;
    await Promise.resolve();
    expect(seen, 'the play is over, not resumed').toEqual(['enter', 'leave']);
  });
});

describe('FrameController: the hover-in a play waits on', () => {
  const geo = (f: { h: number }) => ({ p: { d: `M0 ${f.h.toFixed(4)}` } });
  afterEach(() => core.setScheduler(null));

  it('hoverTo resolves true when h lands, false when another hover stops it first', async () => {
    const clock = core.manualScheduler();
    core.setScheduler(clock);
    const c = new core.FrameController(core.fromHover({ geo }), () => {});
    const first = c.enter();
    clock.advance(50);
    const second = c.leave();
    expect(await first).toBe(false);
    clock.advance(1000);
    expect(await second).toBe(true);
    expect(c.frame.h).toBe(0);
    const third = c.enter();
    c.destroy();
    expect(await third).toBe(false);
  });

  it('a bound controller plays the whole hover-in, then the whole leave, from one play()', async () => {
    const clock = core.manualScheduler();
    core.setScheduler(clock);
    const { icon } = framed();
    const hs: number[] = [];
    const c = new core.FrameController(core.fromHover({ geo }), () =>
      hs.push(c.frame.h)
    );
    const b = core.bindHover(icon, {
      enter: () => c.enter(),
      leave: () => c.leave(),
    });
    b.play();
    for (let i = 0; i < 40; i++) {
      clock.advance(1000 / 60);
      await Promise.resolve();
      await Promise.resolve();
    }
    const peak = hs.indexOf(1);
    expect(peak, 'reaches the hovered drawing').toBeGreaterThan(0);
    expect(
      hs.slice(0, peak + 1).every((h, i, a) => i === 0 || h >= a[i - 1]),
      'rises all the way first'
    ).toBe(true);
    expect(
      hs.slice(peak + 1).every((h, i, a) => i === 0 || h <= a[i - 1]),
      'then falls'
    ).toBe(true);
    expect(hs.at(-1)).toBe(0);
    b();
  });

  it('StatusController hands back the plain hover-in too', async () => {
    const clock = core.manualScheduler();
    core.setScheduler(clock);
    const spec = {
      statuses: ['success'],
      placement: {},
      geo,
    } as unknown as import('../src/engine/index').StatusIconSpec;
    const s = new core.StatusController(spec, () => {}, 32, {});
    const p = s.enter();
    expect(p).toBeInstanceOf(Promise);
    clock.advance(1000);
    expect(await p).toBe(true);
    s.destroy();
  });
});
