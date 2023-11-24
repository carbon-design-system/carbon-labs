export class FeedbackApi {
  private static instance: FeedbackApi;
  private BASE_URL: string;

  constructor() {
    this.BASE_URL = 'http://0.0.0.0:8000';
  }

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

  protected async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.detail || errorData?.message || 'Something went wrong'
      );
    }
    return await response.json();
  }

  async recordGeneration(data) {
    // console.log("🚀 ~ file: api.ts:31 ~ RecordGeneration:", data)
    const response = await this._post('generated_content', data);
    return response;
  }

  async recordFeedback(data) {
    // console.log("🚀 ~ file: api.ts:37 ~ RecordFeedback:", data)
    const response = await this._post('feedback', data)
    return response
  }

  public static getInstance(): FeedbackApi {
    if (!FeedbackApi.instance) {
      FeedbackApi.instance = new FeedbackApi();
    }
    return FeedbackApi.instance;
  }
}
