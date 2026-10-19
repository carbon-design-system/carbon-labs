/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { settings } from '@carbon-labs/utilities';
import CheckmarkOutline16 from '@carbon/icons/es/checkmark--outline/16.js';
import CircleDash16 from '@carbon/icons/es/circle-dash/16.js';
import Incomplete16 from '@carbon/icons/es/incomplete/16.js';
import Warning16 from '@carbon/icons/es/warning/16.js';
import '@carbon/web-components/es/components/icon/index.js';

// @ts-ignore
import styles from './checklist.scss?inline';
import { Kinds } from './checklist.types.js';

const { stablePrefix: clabsPrefix } = settings;
const blockClass = `${clabsPrefix}--checklist__icon`;

/**
 * Icon that represents the state of a checklist task.
 *
 * @element clabs-checklist-icon
 */
@customElement(`${clabsPrefix}-checklist-icon`)
class CLABSChecklistIcon extends LitElement {
  /**
   * The icon kind.
   * One of `unchecked`, `indeterminate`, `checked`, `disabled`, `error`.
   */
  @property({ type: String })
  kind: string = Kinds.unchecked;

  /** @override */
  render() {
    const icon: object =
      this.kind === Kinds.checked
        ? CheckmarkOutline16
        : this.kind === Kinds.indeterminate
          ? Incomplete16
          : this.kind === Kinds.error
            ? Warning16
            : CircleDash16;

    const classes = classMap({
      [`${blockClass}`]: true,
      [`${blockClass}--${this.kind}`]: true,
    });

    return html`
      <span class="${classes}">
        <cds-icon .icon=${icon} size="16" ariaLabel=${this.kind}></cds-icon>
      </span>
    `;
  }

  static styles = styles;
}

export default CLABSChecklistIcon;
