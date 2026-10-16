/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '@carbon/web-components/es/components/notification/index.js';
import {
  focusRegionRegistry,
  attachGlobalF6Handler,
  getFirstTabbable,
  F6_NAVIGATION_EVENT,
} from '../../../src/focus-region-registry.js';

const PREFIX = 'clabs';
const HINT_SESSION_KEY = 'clabs-focus-region-hint-shown';

/**
 * Template class for the `clabs-focus-region` web component.
 *
 * Uses light DOM (no shadow root) so that children participate in normal Tab
 * order exactly as they would inside a plain <section>/<main>/etc.
 */
class FocusRegionTemplate extends LitElement {
  // Use light DOM — no shadow root
  createRenderRoot() {
    return this;
  }

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** Unique identifier for this region. */
  @property({ type: String, reflect: true }) regionId = '';

  /** Optional group ID for modal behaviour. */
  @property({ type: String, attribute: 'group-id' }) groupId = '';

  /** ARIA role for the region element. */
  @property({ type: String }) role = 'region';

  /** Accessible label for the region. */
  @property({ type: String, attribute: 'aria-label' }) ariaLabel = '';

  /** Labelled-by ID when an existing element names the region. */
  @property({ type: String, attribute: 'aria-labelledby' })
  ariaLabelledby = '';

  /** When true this region requests initial focus on page load. */
  @property({ type: Boolean, attribute: 'default-focus' })
  defaultFocus = false;

  /** When false this region is skipped in F6 navigation. */
  @property({ type: Boolean }) enabled = true;

  /** Show a one-time navigation hint on first keyboard focus. */
  @property({ type: Boolean, attribute: 'show-navigation-hint' })
  showNavigationHint = false;

  // -------------------------------------------------------------------------
  // Private fields (not reactive — managed manually)
  // -------------------------------------------------------------------------

  private _internalId = '';
  private _hasShownHint = false;
  private _focusedElementBeforeHint: HTMLElement | null = null;
  private _hintTimer: ReturnType<typeof setTimeout> | null = null;
  /** Portal element appended to document.body for the hint overlay. */
  private _hintPortal: HTMLDivElement | null = null;
  private _hintNotification: HTMLElement | null = null;

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  connectedCallback() {
    super.connectedCallback();

    this._internalId =
      this.regionId ||
      `clabs-focus-region-${Math.random().toString(36).slice(2, 11)}`;

    attachGlobalF6Handler();

    this._hasShownHint =
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(HINT_SESSION_KEY) === 'true';

    this.addEventListener('focusin', this._handleFocusIn);
    document.addEventListener(F6_NAVIGATION_EVENT, this._handleF6Nav);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    focusRegionRegistry.unregister(this._internalId);
    this.removeEventListener('focusin', this._handleFocusIn);
    document.removeEventListener(F6_NAVIGATION_EVENT, this._handleF6Nav);
    if (this._hintTimer) clearTimeout(this._hintTimer);
    this._removeHintPortal();
  }

  firstUpdated() {
    this._registerRegion();

    if (this.defaultFocus) {
      setTimeout(() => {
        const first = getFirstTabbable(this);
        if (first) {
          first.focus();
          focusRegionRegistry.setFocusLocation(this._internalId, first);
        } else {
          this.focus();
        }
      }, 0);
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('enabled') || changed.has('groupId')) {
      focusRegionRegistry.update(
        this._internalId,
        this.enabled,
        this.groupId ? [this.groupId] : []
      );
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _registerRegion() {
    focusRegionRegistry.register(
      this._internalId,
      this,
      this.enabled,
      this.groupId ? [this.groupId] : [],
      this.defaultFocus,
      this.role
    );

    this.setAttribute('data-focus-region', this._internalId);
    this.setAttribute('data-focus-region-id', this._internalId);
    if (this.groupId) {
      this.setAttribute('data-focus-region-group', this.groupId);
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
  }

  private _handleFocusIn = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target || !this.contains(target)) return;

    // Don't track when focus is inside a nested focus-region
    const closestRegion = target.closest('[data-focus-region]');
    if (closestRegion !== this) return;

    if (target !== this) {
      focusRegionRegistry.setFocusLocation(this._internalId, target);
    }

    if (!this.showNavigationHint || this._hasShownHint) return;

    // Re-check sessionStorage in case another region already showed the hint
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(HINT_SESSION_KEY) === 'true'
    ) {
      this._hasShownHint = true;
      return;
    }

    this._focusedElementBeforeHint = target;
    this._hasShownHint = true;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(HINT_SESSION_KEY, 'true');
    }

    this._showHintPortal();
  };

  private _handleF6Nav = () => {
    if (this._hintPortal) {
      this._dismissHint();
    }
  };

  private _dismissHint() {
    this._removeHintPortal();
    const el = this._focusedElementBeforeHint;
    if (el && document.contains(el)) {
      el.focus();
    }
  }

  // -------------------------------------------------------------------------
  // Hint portal — cds-actionable-notification appended to document.body
  // -------------------------------------------------------------------------

  private _showHintPortal() {
    if (this._hintPortal) return;

    this._hintPortal = document.createElement('div');
    this._hintPortal.className = `${PREFIX}--focus-region-hint-portal`;
    document.body.appendChild(this._hintPortal);

    // Build the cds-actionable-notification element
    const notification = document.createElement(
      'cds-actionable-notification'
    ) as HTMLElement;
    notification.setAttribute('kind', 'info');
    notification.setAttribute('title', 'Keyboard navigation');
    notification.setAttribute('subtitle', 'Press F6 to move to the next region, or Shift+F6 to move to the previous region.');
    notification.setAttribute('action-button-label', 'Got it');
    notification.setAttribute('inline', '');
    notification.setAttribute('low-contrast', '');
    notification.setAttribute('open', '');

    // Dismiss on the action button click or close button click
    const dismiss = () => this._dismissHint();
    notification.addEventListener('cds-notification-beingclosed', dismiss);
    notification.addEventListener(
      'cds-actionable-notification-clicked',
      dismiss
    );

    this._hintNotification = notification;
    this._hintPortal.appendChild(notification);
  }

  private _removeHintPortal() {
    if (this._hintPortal) {
      this._hintPortal.remove();
      this._hintPortal = null;
      this._hintNotification = null;
    }
    if (this._hintTimer) {
      clearTimeout(this._hintTimer);
      this._hintTimer = null;
    }
  }

  // -------------------------------------------------------------------------
  // Render — light DOM, children render directly into the host
  // -------------------------------------------------------------------------

  render() {
    return html`<slot></slot>`;
  }
}

export default FocusRegionTemplate;
