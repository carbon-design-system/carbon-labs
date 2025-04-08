/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '@carbon/web-components/es/components/stack/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toolbar cds-dropdown').forEach((component) => {
    if (component.shadowRoot) {
      const style = document.createElement('style');
      style.textContent = `
        .cds--list-box {
          border-block-end: none !important;
        }
      `;
      component.shadowRoot.appendChild(style);
    }
  });
});

// roving keyboard navigation utility
function initRovingTabindex(container) {
  const buttons = Array.from(container.children).flatMap((el) =>
    Array.from(el.children)
  );
  if (buttons.length === 0) return;

  buttons.forEach((btn, index) =>
    btn.setAttribute('tabindex', index === 0 ? '0' : '-1')
  );

  function updateActiveIndex(newIndex) {
    buttons.forEach((btn, i) =>
      btn.setAttribute('tabindex', i === newIndex ? '0' : '-1')
    );
    buttons[newIndex].focus();
  }

  container.addEventListener('keydown', (event) => {
    const currentIndex = buttons.findIndex(
      (btn) => btn.getAttribute('tabindex') === '0'
    );

    let newIndex = currentIndex;
    if (event.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else {
      return;
    }

    updateActiveIndex(newIndex);
    event.preventDefault();
  });

  container.addEventListener('click', (event) => {
    const clickedIndex = buttons.indexOf(event.target);
    if (clickedIndex !== -1) {
      updateActiveIndex(clickedIndex);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toolbar').forEach(initRovingTabindex);
});
