/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { html, nothing } from 'lit';
import { TrialTooltipProps } from './TrialContent.types';
import { AUTOMATION_HEADER_BASE_CLASS } from '../../constant';
import { renderCarbonIcon, trackEvent } from '../../globals/utils';
import '@carbon/web-components/es-custom/components/button/index.js';
import { TrialLinkType } from '../../types/Header.types';

// emit an event (does nothing if analytics has not been configured)
const _clickEventAnalytics = (label: string, cta: string) => {
  trackEvent('UI Interaction', {
    action: 'clicked',
    CTA: cta,
    elementId: `common header - ${label}`,
  });
};

export const TrialContent = ({
  description,
  links,
  actionText,
  actionLink,
}: TrialTooltipProps) => {
  return html`
    <div class="automation-header__tooltip">
      <div class="${AUTOMATION_HEADER_BASE_CLASS}__tooltip-caret"></div>
      <div class="automation-header__tooltip-body">
        ${description
          ? html`<p
              tabindex="{0}"
              role="tabpanel"
              class="${AUTOMATION_HEADER_BASE_CLASS}__tooltip-description"
              aria-label="${description}">
              ${description}
            </p>`
          : nothing}
        <div class="${AUTOMATION_HEADER_BASE_CLASS}__tooltip-links">
          ${links?.map(
            (link) => html`
              <cds-custom-button
                size="sm"
                kind="ghost"
                href="${link.href}"
                @click="${() => _clickEventAnalytics('trial link', link.label)}"
                class="${AUTOMATION_HEADER_BASE_CLASS}__tooltip-link">
                ${link.label}
                <span slot="icon"
                  >${getIconFromType(link.type as unknown as string)}</span
                >
              </cds-custom-button>
            `
          )}
        </div>
        ${actionText && actionLink
          ? html`
              <cds-custom-button
                size="sm"
                href=${actionLink}
                @click="${() =>
                  _clickEventAnalytics('trial button', actionText)}"
                class="${AUTOMATION_HEADER_BASE_CLASS}__trial-button">
                ${actionText}
                <span slot="icon">${renderCarbonIcon('Email', 16)}</span>
              </cds-custom-button>
            `
          : nothing}
      </div>
    </div>
  `;
};

function getIconFromType(type: string | TrialLinkType) {
  switch (type) {
    case 'invite':
    case TrialLinkType['invite']:
      return renderCarbonIcon('Share', 16);
    case 'requestQuote':
    case TrialLinkType['requestQuote']:
      return renderCarbonIcon('RequestQuote', 16);
    default:
      return renderCarbonIcon('User', 16);
  }
}
