/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `<clabs-motion-icon name="settings">`: any icon by name, for authoring tools
 * that pick an icon by a string (AEM dialogs, CMS fields).
 *
 * OPT-IN: importing this entry registers `clabs-motion-icon` and makes every
 * icon reachable, each behind a lazy import (one chunk per icon, loaded on
 * first use). Pages that know their icons import per-icon entry points
 * instead.
 *
 * The element draws the named icon's own element in its shadow root and
 * passes every other attribute through (size, animated, aria-label, value,
 * status, …), so it behaves as that element: events bubble out of it
 * (composed), and `play()` plays it. Its host is `display: contents`.
 * An unknown name draws nothing and warns once.
 */
import { DEV } from '@carbon-labs/motion-icons-core/dev';
import { defineCustomElement, prefix } from './globals/register';
import { MOTION_ICONS } from './motion-icon-map';

/** Loads an icon's element class. */
export type IconLoader = () => Promise<
  CustomElementConstructor & { is: string }
>;

const Base = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as typeof HTMLElement;

export class ClabsMotionIcon extends Base {
  static readonly is = `${prefix}-icon`;
  static readonly icons: Record<string, IconLoader> = MOTION_ICONS;
  static get observedAttributes() {
    return ['name'];
  }

  private inner?: HTMLElement & { play?: () => void };
  /** The name `inner` is loaded for. */
  private innerName?: string;
  private loading = 0;
  private sync?: MutationObserver;

  /** The drawn icon element, once loaded. */
  get icon(): HTMLElement | undefined {
    return this.inner;
  }

  /** Plays the icon's hover once (see the icon elements' `play()`). */
  play() {
    this.inner?.play?.();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = ':host { display: contents; }';
      root.append(style);
    }
    this.sync ??= new MutationObserver((records) => {
      for (const r of records) {
        if (r.attributeName && r.attributeName !== 'name') {
          this.copy(r.attributeName);
        }
      }
    });
    this.sync.observe(this, { attributes: true });
    // Moved in the DOM: the icon already drawn stays (its attributes kept in step while it is out); only a new name loads.
    if (this.inner && this.innerName === (this.getAttribute('name') ?? '')) {
      return;
    }
    void this.load();
  }

  // Disconnected, the attribute observer stays on (it goes with the element), so a move keeps the drawn icon in step.

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ) {
    if (name === 'name' && old !== value && this.isConnected) {
      void this.load();
    }
  }

  private copy(attr: string) {
    if (!this.inner) {
      return;
    }
    const v = this.getAttribute(attr);
    if (v === null) {
      this.inner.removeAttribute(attr);
    } else {
      this.inner.setAttribute(attr, v);
    }
  }

  private async load() {
    const name = this.getAttribute('name') ?? '';
    const icons = (this.constructor as typeof ClabsMotionIcon).icons;
    // Own names only: `toString` and the like aren't icons.
    const loader = Object.hasOwn(icons, name) ? icons[name] : undefined;
    const ticket = ++this.loading;
    if (!loader) {
      this.inner?.remove();
      this.inner = undefined;
      this.innerName = undefined;
      if (DEV && name) {
        console.warn(
          `[motion-icons] <${ClabsMotionIcon.is} name="${name}">: no icon by that name.`
        );
      }
      return;
    }
    const Ctor = await loader();
    if (ticket !== this.loading) {
      return;
    } // a newer name won
    const defined = defineCustomElement(Ctor);
    const tag = customElements.getName?.(defined) ?? Ctor.is;
    const el = document.createElement(tag) as HTMLElement & {
      play?: () => void;
    };
    for (const a of this.getAttributeNames()) {
      if (a !== 'name') {
        el.setAttribute(a, this.getAttribute(a)!);
      }
    }
    this.inner?.remove();
    this.shadowRoot!.append(el);
    this.inner = el;
    this.innerName = name;
  }
}

// The opt-in entry registers its element on import (as the per-icon entry points do).
defineCustomElement(ClabsMotionIcon);
