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
  static properties = {
    searchResults: { attribute: false },
  };

  constructor() {
    super();
    this.searchResults;
  }

  async getResults(searchQuery) {
    const response = await SearchTypeaheadAPI.getResults(searchQuery);
    return response.map((res) => res[0]);
  }

  _handleInput(event) {
    const { value } = event.target;
    this.getResults(value).then((res) => {
      this.searchResults = res;
    });
  }
}
