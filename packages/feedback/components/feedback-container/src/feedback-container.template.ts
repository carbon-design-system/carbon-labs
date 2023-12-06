/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/button/index.js';

export class FeedbackContainer extends LitElement {
  static styles = css`
    .carbon-feedback-wrapper {
      position: relative;
    }

    .feedback_dialog {
      position: absolute;
      max-width: 300px;
      border: 1px dashed lightcoral;
      background: white;
      color: black;
      padding: 16px;
    }

    #selected-text > text-area {
      background-color: red;
    }

    .bulb-icon {
      position: absolute;
    }
  `;

  @property({ attribute: 'api-key' })
  private _api_key: string = '';

  @property({ attribute: 'user' })
  private _user_id: string = '';

  @property({ attribute: 'ai-model' })
  private _model_id: string = '';

  get api_key() {
    return this._api_key;
  }

  get user_id() {
    return this._user_id;
  }

  get model_id() {
    return this._model_id;
  }

  @state()
  generation_id?: string = '';

  @state()
  app_id?: number;

  render() {
    return html`
      <div class="carbon-feedback-wrapper">
        <slot></slot>
      </div>
    `;
  }
}
