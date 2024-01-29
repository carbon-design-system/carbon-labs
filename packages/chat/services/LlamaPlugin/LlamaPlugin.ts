/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @constant {string | string} key for the API calls
 * @private
 */
const _bam_key =
  //@ts-ignore
  import.meta.env && import.meta.env.VITE_BAM_KEY;

const _watsonxai_key =
  //@ts-ignore
  import.meta.env && import.meta.env.VITE_WATSONXAI_KEY;

/**
 * LlamaPlugin piece to fetch data from user defined api url
 */
class LlamaPluginAPI {
  /**
   * Gets WatsonX payload
   * @param {string} API_URL - user defined url for query
   * @param {string} model - selected model within the API
   * @param {string} temperature - floating number ranging from 0 to 1, dictates how creative the response will be,
   * @param {string} userPrompt - additional behvaior prompt appended to the system prompt, given by the user as a component parameter
   * @param {Object[]} messages - previous message history array for context
   * @param {string} message - current message sent by the user
   * @param {string} session -  unique ID to differentiate calls within the API
   * @param {string} eventNumber - message count provided as an inner parameter of the chat component
   * @returns {Promise<any>} Response data from the api
   * @example
   * import { LlamaPluginAPI } from '@carbon/ibmdotcom-services';
   */
  static async sendMessageWatsonX(
    API_URL,
    model,
    temperature,
    userPrompt,
    messages,
    message,
    session,
    eventNumber
  ) {
    console.log('sending to WatsonX...');
    console.log(userPrompt);
    console.log(temperature);
    console.log(message);
    console.log(eventNumber);
    console.log(session);
    if (!_watsonxai_key) {
      return {
        reply:
          'Error: No Watsonx-ai API key specified, please append your key to your .env root file in order to access the Watson service',
      };
    }
    const max_tokens = 10000;
    const user_name = 'user';
    const agent_name = 'bot';
    const initial_prompt = `[INST] <<SYS>> You are Watson, you'll answer all my questions. <</SYS>> [/INST]
    `;
    let model_id = 'meta-llama/llama-2-70b-chat';
    if (model == 'granite') {
      model_id = 'granite';
    }

    const parameters = {
      decoding_method: 'greedy',
      max_new_tokens: max_tokens,
      min_new_tokens: 0,
      stop_sequences: [user_name, agent_name],
      repetition_penalty: 1,
    };

    const project_id = '89ba2198-b548-4b26-99f9-50d171e091a2';

    const history = messages
      .map((conv) => {
        return conv.origin + ':' + conv.text;
      })
      .join('\n');

    const watsonxPayload = {
      b64_encoded_inputs: true,
      hapEnabled: true,
      hapText: initial_prompt,
      locale: 'en',
      projectId: project_id,
      promptData: {
        imput: history,
        modelId: model_id,
        modelParameters: parameters,
      },
    };

    console.log(watsonxPayload);
    console.log(_watsonxai_key);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + _watsonxai_key,
      },
      body: JSON.stringify(watsonxPayload),
    };

    try {
      return await fetch(API_URL, requestOptions)
        .then((response) => response.json())
        .then((response) => response);
    } catch (error) {
      return { reply: 'Error reaching: ' + API_URL };
    }
  }

  /**
   * Gets BAM internal research resource payload
   * @param {string} API_URL - user defined url for query
   * @param {string} model - selected model within the API
   * @param {string} temperature - floating number ranging from 0 to 1, dictates how creative the response will be,
   * @param {string} userPrompt - additional behvaior prompt appended to the system prompt, given by the user as a component parameter
   * @param {Object[]} messages - previous message history array for context
   * @param {string} message - current message sent by the user
   * @param {string} session -  unique ID to differentiate calls within the API
   * @param {string} eventNumber - message count provided as an inner parameter of the chat component
   * @returns {Promise<any>} Response data from the api
   * @example
   * import { LlamaPluginAPI } from '@carbon/ibmdotcom-services';
   */
  static async sendMessageBAM(
    API_URL,
    model,
    temperature,
    userPrompt,
    messages,
    message,
    session,
    eventNumber
  ) {
    console.log('sending to BAM...');
    console.log(userPrompt);
    console.log(message);
    console.log(eventNumber);
    console.log(session);

    if (!_bam_key) {
      return {
        reply:
          'Error: No API key specified, please append your key to your .env root file in order to access the BAM service',
      };
    }
    const user_name = 'user';
    const agent_name = 'bot';
    const initial_prompt = `[INST] <<SYS>> You are Watson, you'll answer all my questions. <</SYS>> [/INST]`;

    const history = messages
      .map((conv) => {
        return conv.origin + ':' + conv.text;
      })
      .join('\n');

    const model_id = 'meta-llama/' + model + '-70b-chat';

    const completePrompt = initial_prompt + '\n' + history;

    const top_k = 50;
    const top_p = 1.0;

    const parameters = {
      decoding_method: 'sample',
      stream: false,
      temperature: temperature,
      top_k: top_k,
      top_p: top_p,
      max_new_tokens: 1024,
      stop_sequences: [user_name, agent_name],
    };

    const bam_payload = {
      model_id: model_id,
      inputs: [completePrompt],
      parameters: parameters,
    };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + _bam_key,
      },
      body: JSON.stringify(bam_payload),
    };

    try {
      return await fetch(API_URL, requestOptions)
        .then((response) => response.json())
        .then((response) => response);
    } catch (error) {
      return { reply: 'Error reaching: ' + API_URL };
    }
  }

  /**
   * Gets Static url payload
   * @param {string} API_URL - user defined url for query
   * @param {string} model - selected model within the API
   * @param {string} temperature - floating number ranging from 0 to 1, dictates how creative the response will be,
   * @param {string} userPrompt - additional behvaior prompt appended to the system prompt, given by the user as a component parameter
   * @param {Object[]} messages - previous message history array for context
   * @param {string} message - current message sent by the user
   * @param {string} session -  unique ID to differentiate calls within the API
   * @param {string} eventNumber - message count provided as an inner parameter of the chat component
   * @returns {Promise<any>} Response data from the api
   * @example
   * import { LlamaPluginAPI } from '@carbon/ibmdotcom-services';
   */
  static async sendMessageLocal(
    API_URL,
    model,
    temperature,
    userPrompt,
    messages,
    message,
    session,
    eventNumber
  ) {
    console.log('sending to local...');
    const max_tokens = 1000;
    const user_name = 'user';
    const agent_name = 'bot';
    const initial_prompt =
      '[INST] <<SYS>> ' +
      userPrompt +
      ' If returning code of any kind you must use "```" delimiters<</SYS>> [/INST]';

    let prompt =
      initial_prompt +
      messages
        .map((message) => {
          return message.type == 'bot'
            ? '[INST]' + message.text + '[/INST]'
            : message.text;
        })
        .join('\n');

    const history = messages
      .map((conv) => {
        return conv.type + ':' + conv.text;
      })
      .join('\n');

    prompt = initial_prompt;

    const reminder = '';
    const context = history;
    const entry = message;
    const top_p = 0.0;
    const frequency_penalty = 1.0;
    const presence_penalty = 0.0;
    const n = 1;
    const user_id = 'o.cornec@ibm.com';

    const payload = {
      user_id: user_id,
      session: session,
      event: eventNumber,
      prompt: prompt,
      reminder: reminder,
      context: context,
      entry: entry,
      temperature: temperature,
      max_tokens: max_tokens,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty,
      n: n,
      user_name: user_name,
      agent_name: agent_name,
      max_tries: 3,
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    try {
      return await fetch(API_URL + '/generate', requestOptions)
        .then((response) => response.json())
        .then((response) => response);
    } catch (error) {
      return { reply: 'Error reaching: ' + API_URL };
    }
  }
}
export default LlamaPluginAPI;
