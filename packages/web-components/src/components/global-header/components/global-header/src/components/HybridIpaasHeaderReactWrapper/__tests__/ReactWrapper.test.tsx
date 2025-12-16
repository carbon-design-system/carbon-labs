/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { expect } from '@open-wc/testing';
import sinon from 'sinon';

import { HybridIpaasHeaderReactWrapper } from '../HybridIpaasHeaderReactWrapper';

describe('ReactWrapper', () => {
  it('calls ai callback', () => {
    const mockAiCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      aiCallback: mockAiCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onaiCallback();
    expect(mockAiCallback).to.be.calledOnce;
  });

  it('calls notification callback', () => {
    const mockNotificationOpenCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      notificationOpenCallback: mockNotificationOpenCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onNotificationOpenCallback();
    expect(mockNotificationOpenCallback).to.be.calledOnce;
  });

  it('calls logout callback', () => {
    const mockLogoutCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      logoutCallback: mockLogoutCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onLogoutCallback();
    expect(mockLogoutCallback).to.be.calledOnce;
  });

  it('calls search callback', () => {
    const mockSearchCallback = sinon.spy();
    const mockValue = 'x';
    const mockEvent = {
      detail: {
        value: mockValue,
      },
    };
    const options = {
      productKey: 'my product',
      searchCallback: mockSearchCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onSearchCallback(mockEvent);
    expect(mockSearchCallback).to.be.calledOnce;
    expect(mockSearchCallback.calledWith(mockValue)).to.be.true;
  });

  it('calls search submit callback', () => {
    const mockOnSearchSubmitCallback = sinon.spy();
    const mockValue = 'xy';
    const mockEvent = {
      detail: {
        value: mockValue,
      },
    };
    const options = {
      productKey: 'my product',
      searchSubmitCallback: mockOnSearchSubmitCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onSearchSubmitCallback(mockEvent);
    expect(mockOnSearchSubmitCallback).to.be.calledOnce;
    expect(mockOnSearchSubmitCallback.calledWith(mockValue)).to.be.true;
  });
});
