import axios from 'axios';

/**
 * @constant {string | string} Host for the API calls
 * @private
 */
const _host =
  (import.meta.env && import.meta.env.VITE_SEARCH_TYPEAHEAD_API) ||
  'https://www-api.ibm.com';
/**
 * Search endpoint
 *
 * @type {string}
 * @private
 */
const _endpoint = `${_host}/search/typeahead/v1`;

class SearchTypeaheadAPI {
  /**
   * Gets search results
   *
   * @param {string} query Query string to pass to the service
   * @returns {Promise<any>} Response data from ibm search
   * @example
   * import { SearchTypeaheadAPI } from '@carbon/ibmdotcom-services';
   *
   * async function getResults(query) {
   *   const response = await SearchTypeaheadAPI.getResults(query);
   *   return response;
   * }
   */
  static async getResults(query) {
    const urlQuery = [`lang=en&cc=us`, `query=${encodeURIComponent(query)}`]
      .filter((item) => item)
      .join('&');
    const url = `${_endpoint}?${urlQuery}`;
    return await axios
      .get(url, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
      .then((response) => response.data.response);
  }
}
export default SearchTypeaheadAPI;
