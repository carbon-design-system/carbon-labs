/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from '@open-wc/testing';
import * as utils from '../utils';

describe('util functions', () => {
  describe('render carbon icon', () => {
    it('should return error if icon is not valid', () => {
      const icon = utils.renderCarbonIcon('not-valid-icon', 32);
      expect(icon).to.be.an('object');

      // Check that the return value contains the message that the Icon is not found
      expect(icon).to.deep.include({
        strings: ['<div class="icon-container">Icon not found</div>'],
      });
    });

    it('should return svg if icon is valid', () => {
      const icon = utils.renderCarbonIcon('Carbon', 32);
      expect(icon).to.exist; // there does not seem to be a nice way to check the svg has returned so we're just checking that it exists.
    });
  });

  describe('isValidObject function', () => {
    it('should be false for an invalid object', () => {
      const isValidObject = utils.isValidObject('');
      expect(isValidObject).to.be.false;
    });

    it('should be true for a valid object', () => {
      const trialConfigs = {
        trialCount: 1,
        warning: false,
        trialLabel: 'Trial days left',
        description: `Your trial ends today`,
        actionText: 'Buy',
        actionLink: '#',
      };

      const isValidObject = utils.isValidObject(trialConfigs);
      expect(isValidObject).to.be.true;
    });
  });

  describe('getAssistMe URL function', () => {
    it('handles staging call', () => {
      const url = utils.getAssistMeUrl('staging');
      expect(url).to.equal(utils.ASSIST_ME_SCRIPT_DEV);
    });

    it('handles production call', () => {
      const url = utils.getAssistMeUrl('production');
      expect(url).to.equal(utils.ASSIST_ME_SCRIPT_PROD);
    });

    it('handles development call', () => {
      const url = utils.getAssistMeUrl('development');
      expect(url).to.equal(utils.ASSIST_ME_SCRIPT_DEV);
    });
  });
});
