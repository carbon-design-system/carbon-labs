/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderCarbonIcon } from '../../globals/utils';

/* c8 ignore next */
import cx from 'classnames';

import styles from './UserProfileImage.scss?inline' assert { type: 'css' };
import { AUTOMATION_HEADER_BASE_CLASS } from '../../constant';
const blockClass = `${AUTOMATION_HEADER_BASE_CLASS}__user-profile-image`;

@customElement('apaas-user-profile-image')
export class SideNavItem extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: String }) kind: string = '';
  @property({ type: String }) size: string = 'lg';
  @property({ type: String }) image: string = '';
  @property({ type: String }) initials: string = '';
  @property({ type: String }) className: string = '';
  @property({ type: String }) backgroundColor: string = 'light-cyan';

  icons = {
    user: {
      md: renderCarbonIcon('User', 20),
      lg: renderCarbonIcon('User', 24),
      xlg: renderCarbonIcon('User', 32),
    },
  };

  formatInitials = () => {
    if (this.initials?.length === 2) {
      return this.initials.toUpperCase();
    }

    return this.initials
      ?.match(/(^\S\S?|\b\S)?/g)
      ?.join('')
      ?.match(/(^\S|\S$)?/g)
      ?.join('')
      .toUpperCase();
  };

  getFillItem = () => {
    if (this.image) {
      return html`<img
        alt="profile image"
        src="${this.image}"
        class="${blockClass}__photo ${blockClass}__photo--${this.size}" />`;
    }
    if (this.initials) {
      return this.formatInitials();
    }
    if (this.kind && this.size) {
      return renderCarbonIcon(this.kind, +this.size);
    }

    return this.icons.user.md;
  };

  render() {
    return html`
      <div class="${blockClass}">
        <div
          class="${cx([
            blockClass,
            this.className,
            `${blockClass}--${this.size}`,
            `${blockClass}--${'light'}`,
            `${blockClass}--${this.backgroundColor}`,
          ])}">
          ${this.getFillItem()}
        </div>
      </div>
    `;
  }
}
