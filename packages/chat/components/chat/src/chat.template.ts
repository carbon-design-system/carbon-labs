/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import Edit16 from '@carbon/web-components/es/icons/edit/16';
import ThumbsUp16 from '@carbon/web-components/es/icons/thumbs-up/16';
import ThumbsDown16 from '@carbon/web-components/es/icons/thumbs-down/16';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16';
import User24 from '@carbon/web-components/es/icons/user/24';
import Search24 from '@carbon/web-components/es/icons/search/24';

/**
 * Lit template for test-input
 *
 * @param {object} customElementClass Class functionality for the custom element
 * @returns {TemplateResult<1>} Lit html template
 */
export function chatTemplate(customElementClass) {
  const { 
    _handleInput: handleInput, 
    _sendInput: sendInput,
    _setMessageText: setMessageText,
    _messages: messages,
    _messageText: messageText,
    _queryInProgress: queryInProgress,
    _handleHoverIn: handleHoverIn,
    _handleHoverOut: handleHoverOut,
    _handleEdit: handleEdit,
    _handleFeedback: handleFeedback,
    _handleAPIselection: handleAPIselection 
  } = customElementClass;

    return html`<div class="chat-container">
        <div class="chat-messages">
        &nbsp;
          ${messages.map(
            (message,index) => html` 
              <div class="${message.origin}-message subtype-${message.style}" @mouseout="${(e) => handleHoverOut(index,e,message.origin)}">
                
                <div class='message-container'  @mouseover="${(e) => handleHoverIn(index,e,message.origin)}" >
                <div class='message-time'>${message.time}</div>
                <div class='message-icon'>
                    <div class='${message.origin}-icon'>
                      ${message.origin == "user"
                        ? User24() : "AI"}
                    </div>
                </div>
                <div class='message-text'>
                ${message.text}
                </div>

                </div>
                <div class="${message.origin}-dropdown">
                  <div class='small-button'  @click="${(e) => {handleEdit(e,index)}}">
                     ${Edit16()}
                  </div>
                  <div class='small-button' @click="${(e) => {handleFeedback(e,index,"like",message.text)}}">
                    ${ThumbsUp16()}
                  </div>
                  <div class='small-button' @click="${(e) => {handleFeedback(e,index,"dislike",message.text)}}">
                     ${ThumbsDown16()}
                  </div>
                </div>
              </div>`
          )}
          <div class="bot-message ${queryInProgress? '':'hidden'}">
             <div class='message-container'>
                    <div class="loading-container">
                      <div class="loading-bar"></div>
                    </div>
             </div>
          </div>
        </div>
         <div class="input-container">
          <div class='search-icon'>${Search24()}</div>
           <input type="text"
           .value="${messageText}"
           @input="${setMessageText}"
           @keyup="${handleInput}" />
            <span class="send-button" @click="${() => sendInput(messageText)}"> ${ArrowRight16()} </span>
         </div>
      </div>
      <div class="test-section">
        <div class="test-options-container">
          <h2>Test target url</h2>
          <form id="target-urls">
            <label><input type="radio" name="option" value="local" checked @input="${handleAPIselection}">Local server</label>
            <label><input type="radio" name="option" value="bam" @input="${handleAPIselection}">BAM Reasearch service</label>
            <label><input type="radio" name="option" value="watsonx-ai" @input="${handleAPIselection}">Watsonx-ai API</label>
          </form>
        </div>
      </div>`;
}
