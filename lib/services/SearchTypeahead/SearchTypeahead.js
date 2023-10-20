"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.promise.js");
var _axios = _interopRequireDefault(require("axios"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @constant {string | string} Host for the API calls
 * @private
 */
const _host = import.meta.env && import.meta.env.VITE_SEARCH_TYPEAHEAD_API || "https://www-api.ibm.com";
/**
 * Search endpoint
 *
 * @type {string}
 * @private
 */
const _endpoint = "".concat(_host, "/search/typeahead/v1");
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
    let appid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    const urlQuery = ["lang=en&cc=us", "query=".concat(encodeURIComponent(query))].filter(item => item).join("&");
    const url = "".concat(_endpoint, "?").concat(urlQuery);
    return await _axios.default.get(url, {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }).then(response => response.data.response);
  }
}
var _default = exports.default = SearchTypeaheadAPI;