/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The base every motion icon element extends (Lit).
 *
 * The element is thin on purpose: a controller from the framework-free core
 * owns the icon's numbers, tweens and painting; the element turns attributes
 * into controller calls, binds hover (pointer, keyboard focus, `play()`),
 * and sets the host's semantics.
 *
 * Rendering: an open shadow root holding one `<svg part="svg">` with an empty
 * `<g data-mc-ink>` that the controller paints into (Lit never re-renders
 * the shapes; a frame is an attribute write). A status icon that takes
 * pending stacks a second svg over it in a grid cell, where the spinner's
 * arc turns on the compositor (StatusIconElement). A declarative shadow root
 * from the server (`ssr.ts`) is replaced on upgrade with the identical
 * drawing, in the same task, so there is no flash.
 *
 * Colour: `:host { fill: currentColor }` in the shadow styles, so the icon is
 * the text colour, and a consumer's `fill` on the element (Carbon's way of
 * colouring icons) wins; the ink sync (the React package's `attachInk`)
 * makes strokes follow that fill.
 *
 * Semantics (ElementInternals, as Carbon v12): `role="img"` when the element
 * has an accessible name (`aria-label`, `aria-labelledby` or `title`),
 * otherwise hidden from assistive tech; toggles with `as-button` are a
 * focusable button with `aria-pressed` (`disabled`: no tab stop, no
 * toggling, `aria-disabled`).
 */
import {
  LitElement,
  css,
  html,
  unsafeCSS,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { attachInk } from '@carbon-labs/motion-icons-core/ink';
import { FORCED_COLORS_CSS } from '@carbon-labs/motion-icons-core/forcedColors';
import {
  bindHover,
  bindPress,
  mayPress,
  observeVisibility,
  onReducedMotionChange,
  paint,
  prefersReducedMotion,
  type HoverBinding,
  type Shapes,
} from '@carbon-labs/motion-icons-core/engine';
import type { Still } from '@carbon-labs/motion-icons-core/static/index';
import {
  noAction,
  type ActionOptions,
} from '@carbon-labs/motion-icons-core/engine/action';
import { stillSVG } from './stills';

/** What an element drives: a core controller (FrameController, StatusController, PipEngine). */
export interface Controller {
  size: number;
  shapes(): Shapes;
  repaint(): void;
  destroy(): void;
  /** May return a promise for the end of the hover-in (see the core's HoverHandlers). */
  enter?(): unknown;
  leave?(): void;
  /** On or off screen: loops and a pending spinner hold while it can't be seen (FrameController, StatusController). */
  setVisible?(visible: boolean): void;
}

/** `animated` is three-way, as the React prop: absent follows reduced motion, "false" is still, anything else animates. */
export const animatedConverter = {
  fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false'),
  toAttribute: (v: boolean | undefined) => (v === undefined ? null : String(v)),
};

/** `press` is three-way: absent follows the icon (it presses when it is the control), `"none"` (or `"false"`) never, anything else always. */
export const pressConverter = {
  fromAttribute: (v: string | null) =>
    v === null ? undefined : v !== 'none' && v !== 'false',
  toAttribute: (v: boolean | undefined) =>
    v === undefined ? null : v ? '' : 'none',
};

export const SIZES = [16, 20, 24, 32] as const;

/** The properties that name the host (its accessible name picks its role). */
export const NAMING = ['label', 'labelledBy', 'hostTitle'] as const;

/** One of `sizes` (SIZES unless an element draws at more), as a number, or undefined: anything else (a typo, markup set as a property) is never drawn or interpolated. */
export function sizeOf(
  v: unknown,
  sizes: readonly number[] = SIZES
): number | undefined {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string' && v.trim() !== ''
        ? Number(v)
        : NaN;
  return sizes.includes(n) ? n : undefined;
}

export const iconStyles = css`
  :host {
    display: inline-block;
    box-sizing: content-box;
    inline-size: 32px;
    block-size: 32px;
    line-height: 0;
    fill: currentColor;
    overflow: visible;
  }
  :host([size='16']) {
    inline-size: 16px;
    block-size: 16px;
  }
  :host([size='20']) {
    inline-size: 20px;
    block-size: 20px;
  }
  :host([size='24']) {
    inline-size: 24px;
    block-size: 24px;
  }
  /* In a Carbon button's icon slot with no size of its own: Carbon's 16px icon (its slot box is 1rem). */
  :host([slot='icon']:not([size])) {
    inline-size: 16px;
    block-size: 16px;
  }
  :host([hidden]) {
    display: none;
  }
  :host([as-button]) {
    cursor: pointer;
  }
  :host([as-button]:focus-visible) {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 1px;
  }
  svg {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
  }
  /* Forced colors: toned marks and pills take the user's palette. */
  ${unsafeCSS(FORCED_COLORS_CSS)}
`;

export abstract class MotionIconElement extends LitElement {
  static styles: CSSResultGroup = iconStyles;
  static properties = {
    size: { type: Number, reflect: true },
    animated: { converter: animatedConverter },
    label: { attribute: 'aria-label' },
    labelledBy: { attribute: 'aria-labelledby' },
    hostTitle: { attribute: 'title' },
    press: { converter: pressConverter },
  };

  // Reactive fields are `declare`d (defaults in the constructor), so a build with `useDefineForClassFields: true`
  // doesn't shadow Lit's accessors with own properties.
  /** 16, 20, 24 or 32 (Carbon's sizes). Unset: 32, or 16 in a Carbon button's icon slot (see `drawSize`). */
  declare size?: number;
  /** Unset: animated unless the user prefers reduced motion. */
  declare animated?: boolean;
  /** The host's `aria-label` (read here only to pick the role). */
  declare label?: string | null;
  /** The host's `aria-labelledby` (read here only to pick the role). */
  declare labelledBy?: string | null;
  /** The host's `title` (read here only to pick the role). */
  declare hostTitle?: string | null;
  /**
   * Whether the icon shrinks while pressed (the core's press.ts). Unset: when
   * it is the control (`as-button`, `action-on="click"`, or a frame marked
   * `data-motion-icon-frame="press"`) and not inside another. `press` always,
   * `press="none"` never.
   */
  declare press?: boolean;

  /** Whether the icon is its own control (an `as-button` toggle, an action on click): it presses by default. */
  protected get ownControl(): boolean {
    return false;
  }

  /**
   * Whether the icon has something to hold off screen (a loop, an action, a
   * pending spinner): only those are observed (subclasses). A hover-only
   * icon has nothing to pause.
   */
  protected get holdsOffScreen(): boolean {
    return false;
  }

  /** Whether the host has an accessible name of its own: `aria-label`, `aria-labelledby` or `title`. */
  protected get named(): boolean {
    return !!(this.label || this.labelledBy || this.hostTitle);
  }

  protected controller?: Controller;
  protected internals?: ElementInternals;
  private unbind: (() => void)[] = [];
  /**
   * The size the icon draws at: `size`, or 16 in a Carbon button's icon slot
   * when the author set none (Carbon's buttons size their icon at 1rem).
   */
  get drawSize(): number {
    // Only the sizes the icons draw at: anything else (a typo, a string set as a property) is the default.
    return (
      sizeOf(this.size) ?? (this.getAttribute('slot') === 'icon' ? 16 : 32)
    );
  }

  /**
   * The still drawing for `animated="false"` (Carbon's art, decision 5), if
   * the icon has one (subclasses). Under reduced motion with `animated`
   * unset, icons draw their rest geometry instead, as the React package.
   */
  protected still(): Still | undefined {
    return undefined;
  }

  /** The still shown now: only with an explicit `animated="false"`. */
  protected get shownStill(): Still | undefined {
    return this.animated === false ? this.still() : undefined;
  }

  /** Whether the last render drew a still, and whether the controller last painted onto one. */
  private drawnStill = false;
  private paintedStill = false;

  /** The hover binding (pointer, keyboard focus, play()), while connected. */
  private hover?: HoverBinding;
  private unInk?: () => void;

  constructor() {
    super();
    try {
      this.internals = this.attachInternals();
    } catch {
      /* no ElementInternals: attributes are used instead */
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  // The same API on every element; the code that plays one (and its attributes: action-key, action-on, loop,
  // action-then) only in the elements of icons with an action (base/action-element.ts).

  /**
   * Play the icon's action: the one-shot motion it makes when the thing it
   * stands for happens (Copy copies, Send sends, Renew renews). This icon
   * has none: it resolves at once (and warns, once).
   */
  trigger(options?: ActionOptions): Promise<void> {
    void options;
    return noAction(`<${this.localName}>`);
  }

  /** Ends a looping action (none here). */
  stop(): void {}

  /** Whether the icon moves right now. */
  get isAnimated(): boolean {
    return this.animated ?? !prefersReducedMotion();
  }

  /**
   * Play the hover once, in then out, as a pointer passing over it would:
   * for hover-only icons on touch, or emphasis the app asks for. A no-op
   * while the icon doesn't animate (reduced motion, `animated="false"`),
   * before it is connected and painted, inside a disabled button frame
   * (`disabled`, `aria-disabled="true"`, Carbon's `disabled` on cds-button /
   * cds-icon-button, which also silence pointer hover and keyboard focus),
   * and while a hover already shows (a pointer, keyboard focus, or a play in
   * flight: it doesn't restart).
   */
  play(): void {
    if (!this.isAnimated || !this.controller) {
      return;
    }
    this.hover?.play();
  }

  /** The controller for this icon (subclasses): it hands each frame to `painter`. */
  protected abstract createController(
    painter: (shapes: Shapes) => void
  ): Controller;

  /** Paint a frame into the shadow root's ink group. */
  protected painter = (shapes: Shapes) => {
    // While a still shows, the controller keeps its state but paints nothing.
    if (!this.drawnStill) {
      paint(this.ink, shapes);
    }
  };

  /** The painted group in the shadow root. */
  protected get ink(): Element | null {
    return this.renderRoot?.querySelector?.('g[data-mc-ink]') ?? null;
  }

  /** The svg the controller paints: a steady cycle (Renew's loop) turns it on the compositor (the core's turn.ts). */
  protected readonly drawnSvg = (): Element | null =>
    this.renderRoot?.querySelector?.('svg[part="svg"]') ?? null;

  protected createRenderRoot() {
    // A declarative shadow root from the server: clear it; the first render repaints the same drawing before the next paint.
    this.shadowRoot?.replaceChildren();
    return super.createRenderRoot();
  }

  render() {
    const still = this.shownStill;
    this.drawnStill = !!still;
    if (still) {
      return html`${unsafeHTML(stillSVG(still, this.drawSize))}`;
    }
    return this.frames();
  }

  /** What the controller paints into: the icon's svg (a status icon with a spinner stacks its layer over it). */
  protected frames(): TemplateResult {
    return html`<svg
      part="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width=${this.drawSize}
      height=${this.drawSize}
      aria-hidden="true"
      focusable="false">
      <g data-mc-ink></g>
    </svg>`;
  }

  connectedCallback() {
    super.connectedCallback();
    // Connected again (moved in the DOM, into another shadow root): a fresh controller at rest, the binding on the new frame.
    if (this.hasUpdated && !this.controller) {
      this.build();
    }
    this.hover = bindHover(this, {
      enter: () => (this.isAnimated ? this.controller?.enter?.() : undefined),
      leave: () => this.isAnimated && this.controller?.leave?.(),
      frameClick: () => this.onFrameClick(),
    });
    this.unbind.push(this.hover);
    this.syncPress();
    this.unbind.push(onReducedMotionChange(() => this.onMotionChange()));
    // One IntersectionObserver per document: off screen, a loop or a pending spinner holds where it is.
    if (this.holdsOffScreen) {
      this.unbind.push(
        observeVisibility(this, (v) => {
          this.visible = v;
          this.controller?.setVisible?.(v);
        })
      );
    }
    if (this.hasUpdated) {
      this.attachInkSync();
    }
  }

  /** The press, while bound. */
  private unpress?: () => void;

  /**
   * Bind the press while connected and the icon may press (`press`, or by
   * default: its own control, or any frame, whose attribute may turn "press"
   * later); unbind it when it can't. An icon that never presses outside a
   * frame (inside a plain button, or a menu item that isn't a frame) binds
   * nothing; one in a frame that never presses (a rollover button, the kit's
   * menu rows) binds the press's two start listeners, which do nothing.
   * Checked on connect and after every update.
   */
  private syncPress() {
    const can = this.isConnected && mayPress(this, this.press, this.ownControl);
    if (can === !!this.unpress) {
      return;
    }
    this.unpress?.();
    this.unpress = can
      ? bindPress(this, {
          force: () => this.press,
          own: () => this.ownControl,
          animated: () =>
            this.isAnimated && !!this.controller && !this.shownStill,
          // The icon's drawing only: a pending spinner's layer stays unscaled (its compositor turn is about the mark).
          groups: () =>
            [this.drawnSvg()?.querySelector(':scope > g[data-mc-ink]')].filter(
              (g): g is Element => !!g
            ),
          size: () => this.drawSize,
        })
      : undefined;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbind.forEach((u) => u());
    this.unbind = [];
    this.syncPress();
    this.hover = undefined;
    this.unInk?.();
    this.unInk = undefined;
    // Nothing runs while it is out of the document (a spinner, a loop, a hover in flight): the controller stops and goes,
    // so the shared frame loop lets go of the element. Connected again, it is built afresh at rest.
    this.controller?.destroy();
    this.controller = undefined;
  }

  protected firstUpdated() {
    this.painted = true;
    this.build();
  }

  /** A controller for the current attributes, at rest, painted. */
  private build() {
    this.paintedStill = this.drawnStill;
    this.controller = this.createController(this.painter);
    this.controller.size = this.drawSize;
    this.controller.setVisible?.(this.visible);
    this.controller.repaint();
    this.attachInkSync();
  }

  /** On screen, as the document's IntersectionObserver last said (true until it says). */
  private visible = true;

  /** Whether the semantics have been set (the first update sets them, whatever changed). */
  private semantic = false;

  protected updated(changed: PropertyValues) {
    this.syncPress();
    if (
      !this.semantic ||
      NAMING.some((k) => changed.has(k)) ||
      changed.has('size')
    ) {
      this.semantic = true;
      this.updateSemantics();
    }
    // A size the controller doesn't draw at yet (from unset too: unset draws at 32); the first update's is already its.
    if (
      this.controller &&
      changed.has('size') &&
      this.controller.size !== this.drawSize
    ) {
      const c = this.controller as Controller & {
        setSize?: (size: number) => void;
      };
      if (c.setSize) {
        c.setSize(this.drawSize);
      } else {
        c.size = this.drawSize;
        c.repaint();
      }
    }
    if (
      this.controller &&
      changed.has('animated') &&
      changed.get('animated') !== undefined
    ) {
      this.onMotionChange();
    }
    if (this.controller && this.drawnStill !== this.paintedStill) {
      // Between a still and the frames: the svg is new, so paint it (and follow its fill).
      this.paintedStill = this.drawnStill;
      this.controller.repaint();
      this.unInk?.();
      this.unInk = undefined;
      this.attachInkSync();
    }
  }

  /** True after the first paint (property changes before it are the initial state, not changes to animate). */
  protected get hasPainted() {
    return this.painted;
  }
  private painted = false;

  /** The reduced-motion preference or `animated` changed: settle at rest. */
  protected onMotionChange() {}

  /** A click in the interactive frame's padding (toggles). */
  protected onFrameClick() {}

  protected updateSemantics() {
    const named = this.named;
    this.setAria({
      role: named ? 'img' : null,
      ariaHidden: named ? null : 'true',
      ariaPressed: null,
      ariaDisabled: null,
    });
  }

  /**
   * Default semantics through ElementInternals (author attributes on the host
   * still win); host attributes where ElementInternals ARIA is missing or
   * broken (jsdom throws clearing a value). With `hostAttributes` the values
   * go on the host as attributes (marked as ours, so an author's own value is
   * never overwritten or removed): an `as-button` toggle, so tools that read
   * attributes (Testing Library's `getByRole`, some audits) see the button.
   */
  protected setAria(
    values: {
      role: string | null;
      ariaHidden: string | null;
      ariaPressed: string | null;
      ariaDisabled: string | null;
    },
    hostAttributes = false
  ) {
    const i = this.internals as
      | (ElementInternals & Record<string, unknown>)
      | undefined;
    const attr = {
      role: 'role',
      ariaHidden: 'aria-hidden',
      ariaPressed: 'aria-pressed',
      ariaDisabled: 'aria-disabled',
    } as const;
    for (const k of Object.keys(attr) as (keyof typeof attr)[]) {
      const v = values[k];
      let internal = false;
      if (i && k in i) {
        try {
          i[k] = hostAttributes ? null : v;
          internal = !hostAttributes;
        } catch {
          /* fall through to the attribute */
        }
      }
      const ours = !!this.dataset[`mc${k}`];
      if (internal || v === null) {
        if (ours) {
          this.removeAttribute(attr[k]);
          delete this.dataset[`mc${k}`];
        }
      } else if (!this.hasAttribute(attr[k]) || ours) {
        this.setAttribute(attr[k], v);
        this.dataset[`mc${k}`] = '1';
      }
    }
  }

  /** Strokes follow a consumer's `fill`, in every svg drawn (the icon's, and a spinner layer's). */
  private attachInkSync() {
    const svgs = [...(this.renderRoot?.querySelectorAll?.('svg') ?? [])];
    if (!svgs.length || this.unInk) {
      return;
    }
    const offs = svgs.map((svg) => attachInk(svg as SVGSVGElement));
    this.unInk = () => offs.forEach((off) => off());
  }
}
