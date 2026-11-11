/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from '@open-wc/testing';

describe('date picker beside @carbon/web-components', () => {
  it('defines only clabs- tags and never redefines a Carbon tag', async () => {
    const defined = [];
    const nativeDefine = customElements.define.bind(customElements);
    /**
     * Records each tag, then defines it.
     *
     * @param {string} name - The tag name
     * @param {Function} ctor - The element class
     * @param {object} [options] - Define options
     * @returns {void}
     */
    customElements.define = (name, ctor, options) => {
      defined.push(name);
      return nativeDefine(name, ctor, options);
    };

    try {
      // `define` throws when a tag is registered twice, so a clash fails here.
      await import('@carbon/web-components/es/components/date-picker/index.js');
      const carbonTags = defined.splice(0);
      await import('../es/index.js');
      const labsTags = defined.splice(0);

      expect(carbonTags).to.include('cds-date-picker');
      expect(carbonTags).to.include('cds-date-picker-input');
      expect(labsTags.sort()).to.deep.equal([
        'clabs-date-picker',
        'clabs-date-picker-calendar',
        'clabs-date-picker-input',
        'clabs-date-picker-input-skeleton',
      ]);
      labsTags.forEach((tag) => {
        expect(carbonTags).to.not.include(tag);
        expect(customElements.get(tag)).to.not.equal(
          customElements.get(tag.replace('clabs-', 'cds-'))
        );
      });
    } finally {
      customElements.define = nativeDefine;
    }
  });
});
