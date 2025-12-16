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
  it('calls ai callback', async () => {
    const mockAiCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      aiCallback: mockAiCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onaiCallback();
    expect(mockAiCallback).to.be.calledOnce;
  });

  it('calls notification callback', async () => {
    const mockNotificationOpenCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      onNotificationOpenCallback: mockNotificationOpenCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onNotificationOpenCallback();
    expect(mockNotificationOpenCallback).to.be.calledOnce;
  });

  it('calls logout callback', async () => {
    const mockLogoutCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      onLogoutCallback: mockLogoutCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onLogoutCallback();
    expect(mockLogoutCallback).to.be.calledOnce;
  });

  it('calls search callback', async () => {
    const mockSearchCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      onSearchCallback: mockSearchCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onSearchCallback();
    expect(mockSearchCallback).to.be.calledOnce;
  });

  it('calls search submit callback', async () => {
    const mockOnSearchSubmitCallback = sinon.spy();
    const options = {
      productKey: 'my product',
      onSearchSubmitCallback: mockOnSearchSubmitCallback,
    };
    const wrapper = HybridIpaasHeaderReactWrapper(options);
    wrapper.props.onSearchSubmitCallback();
    expect(mockOnSearchSubmitCallback).to.be.calledOnce;
  });
});
