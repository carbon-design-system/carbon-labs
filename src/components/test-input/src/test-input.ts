/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { SearchTypeaheadAPI } from '../../../services/SearchTypeahead/index';

/**
 * Input component using search typeahead api
 */
export default class testInput extends LitElement {
  /**
   * Array of search results from typeahead API
   */
  @property({ type: Array, attribute: false })
  searchResults: string[] = [];

  /**
   * Fetches the results from the SearchTypeaheadAPI
   *
   * @param {string} searchQuery query to pass into the API
   * @returns {Promise<*>}
   */
  async getResults(searchQuery: string) {
    const response = await SearchTypeaheadAPI.getResults(searchQuery);
    return response.map((res: Array<string>) => res[0]);
  }

  /**
   * Input event handler that is attached to the search input
   *
   * @param {object} event Event object of the search form
   * @param {object} event.target input element
   * @private
   */
  _handleInput({ target }: Event) {
    const { value } = target as HTMLInputElement;
    this.getResults(value).then((res) => {
      this.searchResults = res;
    });
  }
}
