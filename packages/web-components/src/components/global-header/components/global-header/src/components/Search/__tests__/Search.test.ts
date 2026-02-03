/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import sinon from 'sinon';
import { SearchConfigs } from '../../../types/Header.types';
import '../Search';

import { fixture, html, expect } from '@open-wc/testing';
import { Search } from '../Search';

describe('Search Component', () => {
  it('renders component', async () => {
    const el = await fixture<HTMLElement>(
      html` <clabs-global-header-search></clabs-global-header-search>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.shadowRoot?.querySelector('cds-custom-search')).to.exist;
  });

  it('sets callback as an empty function if props are not set', async () => {
    /**
     * Purpose:
     * To check that the callback will default to a function that logs the value entered
     * In the case that an empty object is passed in as a prop.
     */

    const consoleLogStub = sinon.stub(console, 'log');
    const el = await fixture<Search>(
      html` <clabs-global-header-search .props=""></clabs-global-header-search>`
    );
    expect(el.shadowRoot).not.to.be.null;

    expect(el.props.callback).not.to.be.null;
    expect(typeof el.props.callback).to.equal('function');

    el._handleSearchInput('test');
    expect(consoleLogStub.calledWith('value: test'));

    consoleLogStub.restore;
  });

  it('handles search input', async () => {
    const callbackSpy = sinon.spy();

    const props: SearchConfigs = {
      callback: callbackSpy,
    };

    const el = await fixture<Search>(
      html` <clabs-global-header-search
        .props="${props}"></clabs-global-header-search>`
    );
    expect(el.shadowRoot).not.to.be.null;

    el?._handleSearchInput('test');

    expect(callbackSpy).to.have.been.calledOnce;
    expect(el.searchValue).to.equal('test');
  });

  describe('handles keydown for pressing ENTER', () => {
    it('ENTER key submits entered value', async () => {
      const callbackSpy = sinon.spy();
      const submitCallbackSpy = sinon.spy();

      const props: SearchConfigs = {
        callback: callbackSpy,
        submitCallback: submitCallbackSpy,
      };

      const el = await fixture<Search>(
        html` <clabs-global-header-search
          .props="${props}"></clabs-global-header-search>`
      );
      expect(el.shadowRoot).not.to.be.null;

      // Find the input field within the cds-search component
      const cdsSearch = el.shadowRoot.querySelector('cds-custom-search');
      expect(cdsSearch).not.to.be.null;
      const inputNode = cdsSearch.shadowRoot.querySelector('input');
      expect(inputNode).not.to.be.null;

      // Set the input value
      inputNode.value = 'mockSearch';
      inputNode.dispatchEvent(
        new CustomEvent('input', {
          bubbles: true,
        })
      );

      // Submit the search
      const event = new KeyboardEvent('keypress', {
        bubbles: true,
        key: 'Enter',
      });
      el._handleKeydown(event);

      // Check for both typing and submission callbacks
      expect(callbackSpy).to.have.been.calledWith('mockSearch');
      expect(submitCallbackSpy).to.have.been.calledWith('mockSearch');
    });

    it('ENTER key', async () => {
      const submitCallbackSpy = sinon.spy();

      const props: SearchConfigs = {
        callback: () => {},
        submitCallback: submitCallbackSpy,
      };

      const el = await fixture<Search>(
        html` <clabs-global-header-search
          .props="${props}"></clabs-global-header-search>`
      );
      expect(el.shadowRoot).not.to.be.null;

      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Enter',
      });
      el._handleKeydown(event);
      expect(submitCallbackSpy).to.have.been.calledOnce;
    });

    it('ENTER code', async () => {
      const submitCallbackSpy = sinon.spy();

      const props: SearchConfigs = {
        callback: () => {},
        submitCallback: submitCallbackSpy,
      };

      const el = await fixture<Search>(
        html` <clabs-global-header-search
          .props="${props}"></clabs-global-header-search>`
      );
      expect(el.shadowRoot).not.to.be.null;

      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        code: 'Enter',
      });
      el._handleKeydown(event);
      expect(submitCallbackSpy).to.have.been.calledOnce;
    });
  });
});
