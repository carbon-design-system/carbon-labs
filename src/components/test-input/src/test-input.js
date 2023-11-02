/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { SearchTypeaheadAPI } from '../../../services/SearchTypeahead/index.js';

/**
 * Input component using search typeahead api
 */
export default class testInput extends LitElement {
  /**
   * Properties object for Lit
   *
   * @type {{searchResults: {attribute: boolean}}}
   */
  static properties = {
    searchResults: { attribute: false },
  };

  /**
   * Class Constructor
   */
  constructor() {
    super();
    this.searchResults;
  }

  /**
   * Fetches the results from the SearchTypeaheadAPI
   *
   * @param {string} searchQuery query to pass into the API
   * @returns {Promise<*>}
   */
  async getResults(searchQuery) {
    const response = await SearchTypeaheadAPI.getResults(searchQuery);
    return response.map((res) => res[0]);
  }

  /**
   * Input event handler that is attached to the search input
   *
   * @param {object} event Event object of the search form
   * @private
   */
  _handleInput(event) {
    const { value } = event.target;
    this.getResults(value).then((res) => {
      this.searchResults = res;
    });
  }
}
