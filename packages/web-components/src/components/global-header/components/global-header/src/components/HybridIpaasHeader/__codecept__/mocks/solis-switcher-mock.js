/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Mock Solis Switcher Custom Element
 *
 * This mock replaces the external Solis switcher script from IBM CDN
 * (https://cdn.dev.saas.ibm.com/switcher/solis-switcher.es.js)
 * to make E2E tests reliable and independent of external dependencies.
 *
 * The mock:
 * - Registers a custom element 'solis-switcher' that mimics the real component
 * - Uses Shadow DOM for proper encapsulation
 * - Listens for 'solis-nav-item-click' custom events
 * - Toggles a panel with test content (Observability, Community, Integration)
 *
 * This approach matches the real Solis component's architecture:
 * - Custom element registration
 * - Shadow DOM usage
 * - Event-driven panel toggling
 */

/**
 * Register the mock solis-switcher custom element
 */
export function registerMockSolisSwitcher() {
  // Only register if not already registered
  if (!customElements.get('solis-switcher')) {
    /**
     * Mock Solis Switcher custom element for testing
     */
    class MockSolisSwitcher extends HTMLElement {
      /**
       * Constructor
       */
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isPanelOpen = false;
      }

      /**
       * Connected callback
       */
      connectedCallback() {
        this.render();
        this.setupEventListeners();
      }

      /**
       * Render the component
       */
      render() {
        // Render styles in shadow DOM
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
            }
          </style>
          <slot></slot>
        `;
    
        // Render panel content in light DOM so tests can access it
        this.innerHTML = `
          <div class="switcher">
            <div id="solis-switcher" class="switcher-panel" style="
              position: fixed;
              top: 50px;
              right: 10px;
              background: white;
              border: 1px solid #ccc;
              padding: 20px;
              z-index: 9999;
              display: none;
              min-width: 200px;
            ">
              <div class="switcher-item" style="padding: 8px 0;">Observability</div>
              <div class="switcher-item" style="padding: 8px 0;">Community</div>
              <div class="switcher-item" style="padding: 8px 0;">Integration</div>
            </div>
          </div>
        `;
      }

      /**
       * Setup event listeners
       */
      setupEventListeners() {
        // Listen for the custom event that the real Solis uses
        window.addEventListener('solis-nav-item-click', (e) => {
          if (e.detail?.id === 'switcher') {
            this.togglePanel();
          }
        });
      }

      /**
       * Toggle panel visibility
       */
      togglePanel() {
        this._isPanelOpen = !this._isPanelOpen;
        const panel = this.querySelector('#solis-switcher');
        if (panel) {
          panel.style.display = this._isPanelOpen ? 'block' : 'none';
        }
      }
    }

    customElements.define('solis-switcher', MockSolisSwitcher);
  }
}
