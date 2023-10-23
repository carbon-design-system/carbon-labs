import settings from '../../globals/settings.js';
import { LitElement, html } from 'lit';
import { SearchTypeaheadAPI } from '../../services/SearchTypeahead/index.js';

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Input component using search typeahead api
 */
export default class C4AITestInput extends LitElement {
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

  render() {
    const { _handleInput: handleInput } = this;
    return html`<div>
      <label>Search typeahead</label>
      <input type="text" @input="${handleInput}" />
      ${this.searchResults
        ? this.searchResults.map((result) => html`<p>${result}</p>`)
        : undefined}
    </div>`;
  }
}

customElements.define(`${c4aiPrefix}-test-input`, C4AITestInput);
