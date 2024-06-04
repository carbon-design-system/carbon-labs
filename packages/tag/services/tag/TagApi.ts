/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @constant {string | string} Host for the API calls
 * @private
 */
const _host =
  //@ts-ignore
  (import.meta.env && import.meta.env.VITE_TAG_API) || 'http://0.0.0.0:8000';

/**
 * Class for calling tag Api Endpoints
 */
class TagApi {
  private static instance: TagApi;
  private BASE_URL: string;

  /**
   * Constructor of TagApi Class
   */
  constructor() {
    this.BASE_URL = _host;
  }

  /**
   * Wrapper function for fetch api call
   *
   * @param {string} endpoint Endpoint to call
   * @param {any} data Payload data send to endpoint
   * @returns {Promise<any>} Response data from endpoint
   *
   */
  protected async _post(endpoint: string, data) {
    const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    return this._handleResponse(response);
  }

  /**
   * Handles the response get from api
   *
   * @param {string} response Endpoint to call
   * @returns {Promise<any>} Response data from endpoint
   *
   */
  protected async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || errorData?.message || 'Something went wrong'
      );
    }
    return await response.json();
  }

  /**
   * Record Generated data from AI Model
   *
   * @param {object} data Payload data send to endpoint
   * @returns {Promise<any>} Response data from endpoint
   *
   */
  async recordGeneration(data) {
    const response = await this._post('generated_content', data);
    return response;
  }

  /**
   * Record Tag data given for generated content on AI Model
   *
   * @param {object} data Payload data send to endpoint
   * @returns {Promise<any>} Response data from endpoint
   *
   */
  async recordTag(data) {
    const response = await this._post('tag', data);
    return response;
  }

  /**
   * Get the existing instance of this class if available
   */
  public static getInstance(): TagApi {
    if (!TagApi.instance) {
      TagApi.instance = new TagApi();
    }
    return TagApi.instance;
  }
}

export default TagApi;
