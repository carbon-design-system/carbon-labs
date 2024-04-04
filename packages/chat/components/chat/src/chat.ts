/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { APIPlugin } from '../../../services/APIPlugin/index.js';
// @ts-ignore
import styles from './chat.scss?inline';

/**
 * Input component using search typeahead api
 */
export default class C4AIChat extends LitElement {
  static styles = styles;

  /**
   * Core array of message objects to display and interact with, invidual messages are currently described as:
   * {"message":"displayed text", "origin":"can be bot or user, depending on user-defined role names"}
   */
  @state()
  _messages: any[] = [];

  /**
   * server side integer denoting the number of messages sent in total
   */
  private _eventNumber = 0;

  /**
   * session ID to ensure no two conversations collide within the server
   */
  private _session = '' + Math.random();

  /**
   * user-assigned boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @property({ type: Boolean, attribute: 'loading', reflect: true })
  loading;

  /**
   * user-assigned boolean denoting if the conversation object is user-updated or automatically updated using the api system
   */
  @property({ type: Boolean, attribute: 'auto-update', reflect: true })
  autoUpdate;

  /**
   * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @state()
  _queryInProgress = false;

  /**
   * conversation object to display messages straight from the 'message' attribute, overrides any api_url system
   */
  @property({ type: Object, attribute: 'conversation', reflect: true })
  conversation;

  /**
   * string url denoting where the message query will be sent, either BAM or watsonx.ai or any other service
   */
  @property({ type: String, attribute: 'api-url' })
  apiURL;

  /**
   * conversation string that preselects a sample conversation
   */
  @property({ type: String, attribute: 'conversation-example' })
  conversationExample;

  /**
   * string denoting which model to use, only 'llama-2' is available currently
   */
  @property({ type: String, attribute: 'feedback-url' })
  feedbackURL;

  /**
   * string denoting which model to use, only 'llama-2' is available currently
   */
  @property({ type: String, attribute: 'model' })
  model;

  /**
   * float varying from 0.0 to 1.0, denotes how 'creative' the model's response will be. 0.0 (default) is the most safe and predictable while 1.0 is hightly creative but unpredictable (not advised for operations returning code or JSON objects)
   */
  @property({ type: Number, attribute: 'temperature' })
  temperature;

  /**
   * string denoting the user name, used for internal logic in the server to differentiate bot responses and user reseponses. default: 'user' but should be the user's real name based on IBM ID or any other data available
   */
  @property({ type: String, attribute: 'user-name' })
  userName;

  /**
   * string denoting the bot name, default: 'bot' but can be changed to 'Watson' or 'client assistant' or any other name
   */
  @property({ type: String, attribute: 'agent-name' })
  agentName;

  /**
   * string denoting the unique behavior of the model designated by the user, appended to the private system prompt
   */
  @property({ type: String, attribute: 'user-prompt' })
  userPrompt;

  /**
   * string denoting Watsonx.ai project ID
   */
  @property({ type: String, attribute: 'project-id' })
  projectId;

  /**
   * string denoting selected querying method
   */
  private chosenHost = 'Local';

  /**
   * TESTING: case number to trigger auto generation
   */
  @property({ type: String, attribute: 'sample-query' })
  sampleQuery;

  /** detect when component is rendered to process rawtext
   */
  firstUpdated() {
    this._messages = this.hasAttribute('conversation') ? this.conversation : [];
    this._queryInProgress = this.hasAttribute('loading') ? this.loading : false;
    console.log(this.autoUpdate);
  }

  /** internal LIT function to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    console.log('loading ' + this.loading + '  query ' + this._queryInProgress);

    if (changedProperties.has('apiURL')) {
    }

    if (changedProperties.has('apiURL')) {
    }

    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
    }

    if (changedProperties.has('conversation')) {
      if (this.conversation !== null) {
        this._messages = this.conversation;
        this.requestUpdate();
      }
    }

    if (changedProperties.has('_messages')) {
      this.requestUpdate();
    }

    if (changedProperties.has('conversationExample')) {
      this.initializeExamplesObject();
    }

    if (changedProperties.has('sampleQuery')) {
      this.initializeExamplesText();
    }
  }

  /**
   * Initialize examples Object for when stories send in a 'conversation' object
   */
  initializeExamplesObject() {
    switch (this.conversationExample) {
      case 'Showcase':
        this._messages = [
          {
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
            elements: [
              {
                content:
                  'Showcase every type of Element available in this Chat component.',
                type: 'text',
              },
            ],
          },
          {
            text: '',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
            elements: [
              {
                content:
                  'Here is an element of type "img" using the CardElement \n(Picture of a Dahlia from bougs.com):\n',
                type: 'text',
              },
              {
                content:
                  'https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg',
                type: 'img',
              },
              {
                content:
                  'Here is an element of type "url" using the CardElement \n(Apollo 11 Wikipedia Article):\n',
                type: 'text',
              },
              {
                content: 'https://www.wikipedia.org/wiki/Apollo_11',
                type: 'url',
              },
              {
                content:
                  'Here is an element of type "video" using the CardElement \n(Apollo moon landing from Wikimedia):\n',
                type: 'text',
              },
              {
                content:
                  'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm',
                type: 'video',
              },
              {
                content:
                  'Here is an element of type "table" using the TableElement \n(Seinfeld characters):\n',
                type: 'text',
              },
              {
                content:
                  'Name,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY',
                type: 'table',
              },
              {
                content:
                  'Here is an element of type "code" using the CodeElement \n(Prime function in Python):\n',
                type: 'text',
              },
              {
                content:
                  'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n',
                type: 'code',
              },
              {
                content:
                  'Here is an element of type "error" using the ErrorElement\n',
                type: 'text',
              },
              {
                content:
                  'SEGMENTATION ERROR: Failed to render the content provided. (example)',
                type: 'error',
              },
              {
                content:
                  'Here is an element of type "loading" using the LoadingElement\n',
                type: 'text',
              },
              {
                content: '',
                type: 'loading',
              },
              {
                content:
                  'Here is an element of type "tags" using the TagListElement \n(French philosophers):\n',
                type: 'text',
              },
              {
                content:
                  '["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]',
                type: 'tags',
              },
              {
                content:
                  'Here is an element of type "list" using the ListElement \n(Top 5 websites):\n',
                type: 'text',
              },
              {
                content:
                  '1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)',
                type: 'list',
              },
              {
                content:
                  'Here is an element of type "chart" using the ChartElement \n(Gradiented price line of IBMs stock price):\n',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content:
                  'Here is an element of type "chart" using the ChartElement \n(US unemployment):\n',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',
                type: 'chart',
              },
            ],
          },
        ];
        break;
      case 'Visualization':
        this._messages = [
          {
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
            elements: [
              {
                content:
                  'Hello, show me a simple table based on Seinfeld Characters then display the following charts with small mockup datasets: a bar chart, a scatter plot, a pie chart, a boxplot, a map, a matrix and a line chart.',
                type: 'text',
              },
            ],
          },
          {
            text: '',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
            elements: [
              {
                content: 'Here is your table:\n',
                type: 'text',
              },
              {
                content:
                  'Name,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY',
                type: 'table',
              },
              {
                content: 'Here is your bar chart:\n',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28},{"x axis value":"B","y axis value":55},{"x axis value":"C","y axis value":43},{"x axis value":"D","y axis value":91},{"x axis value":"E","y axis value":81},{"x axis value":"F","y axis value":53},{"x axis value":"G","y axis value":19},{"x axis value":"H","y axis value":87},{"x axis value":"I","y axis value":52}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content: 'And here is your scatter plot:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Scatter plot example","data":{"values":[{"x":46,"y":15,"c":1},{"x":24,"y":16,"c":1},{"x":12,"y":77,"c":1},{"x":54,"y":45,"c":2},{"x":44,"y":12,"c":2},{"x":22,"y":66,"c":2},{"x":25,"y":34,"c":3},{"x":28,"y":31,"c":4},{"x":38,"y":68,"c":5}]},"mark":"point","encoding":{"x":{"field":"x","type":"quantitative"},"y":{"field":"y","type":"quantitative"},"color":{"field":"c","type":"nominal"}}}',
                type: 'chart',
              },
              {
                content: 'And here is your pie chart:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}',
                type: 'chart',
              },
              {
                content: 'And here is a Boxplot:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content: 'And here is a Map:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content: 'And here is a matrix:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[{"x":0,"y":0,"value":0.5},{"x":1,"y":0,"value":0.2},{"x":2,"y":0,"value":0.1},{"x":3,"y":0,"value":0.8},{"x":0,"y":1,"value":0.7},{"x":1,"y":1,"value":0.8},{"x":2,"y":1,"value":0.3},{"x":3,"y":1,"value":0.4},{"x":0,"y":2,"value":0.1},{"x":1,"y":2,"value":0.2},{"x":2,"y":2,"value":0.9},{"x":3,"y":2,"value":0.9},{"x":0,"y":3,"value":0.5},{"x":1,"y":3,"value":0.2},{"x":2,"y":3,"value":0.5},{"x":3,"y":3,"value":0.6}]},"title":"Matrix example","mark":"rect","encoding":{"x":{"field":"x","type":"ordinal","title":"x"},"y":{"field":"y","type":"ordinal","title":"y"},"color":{"field":"value","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content: 'And here is an example of a gradiented price line:',
                type: 'text',
              },
              {
                content:
                  '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}',
                type: 'chart',
              },
              {
                content: 'What else can I help you with?',
                type: 'text',
              },
            ],
          },
        ];
        break;
      case 'Nature of art':
        this._messages = [
          {
            text: 'what is the nature of art?',
            origin: 'user',
            hasError: false,
            time: '8:51am',
            index: 0,
            elements: [{ content: 'what is the nature of art?', type: 'text' }],
          },
          {
            text: 'the nature of art is a complex and multifaceted topic that has been debated by philosophers, critics, and scholars for centuries. at its core, art is the creation of aesthetic objects or experiences that are intended to elicit an emotional response from the viewer. this can take many forms, including painting, sculpture, photography, music, and literature.\n\nart can serve a variety of purposes, including the expression of the artists personal vision, the exploration of complex social or political issues, or the simple enjoyment of beauty. the nature of art is also influenced by cultural and historical context, and can evolve over time as new techniques and materials are developed.\n\n',
            origin: 'bot',
            hasError: false,
            time: '8:51am',
            index: 1,
            elements: [
              {
                content:
                  'the nature of art is a complex and multifaceted topic that has been debated by philosophers, critics, and scholars for centuries. at its core, art is the creation of aesthetic objects or experiences that are intended to elicit an emotional response from the viewer. this can take many forms, including painting, sculpture, photography, music, and literature.\n\nart can serve a variety of purposes, including the expression of the artists personal vision, the exploration of complex social or political issues, or the simple enjoyment of beauty. the nature of art is also influenced by cultural and historical context, and can evolve over time as new techniques and materials are developed.',
                type: 'text',
              },
            ],
          },
          {
            text: 'how much do aesthetics play into it?',
            origin: 'user',
            hasError: false,
            time: '8:52am',
            index: 2,
            elements: [
              {
                content: 'how much do aesthetics play into it?',
                type: 'text',
              },
            ],
          },
          {
            text: 'aesthetics play a significant role in the creation and appreciation of art. the aesthetic qualities of a piece of art, such as its form, color, and composition, are often a key factor in determining its overall effectiveness and appeal. in addition, the aesthetic principles that underlie a work of art can influence its interpretation and meaning.\n\n\n',
            origin: 'bot',
            hasError: false,
            time: '8:52am',
            index: 3,
            elements: [
              {
                content:
                  'aesthetics play a significant role in the creation and appreciation of art. the aesthetic qualities of a piece of art, such as its form, color, and composition, are often a key factor in determining its overall effectiveness and appeal. in addition, the aesthetic principles that underlie a work of art can influence its interpretation and meaning.',
                type: 'text',
              },
            ],
          },
          {
            text: 'Should aesthetics not matter if its a purely subjective interpretation?',
            origin: 'user',
            hasError: false,
            time: '8:53am',
            index: 4,
            elements: [
              {
                content:
                  'Should aesthetics not matter if its a purely subjective interpretation?',
                type: 'text',
              },
            ],
          },
          {
            text: 'while aesthetic evaluations are subjective, they can still provide valuable insights into the ways in which art can be appreciated and understood. the aesthetic qualities of a piece of art can influence how it is experienced and interpreted, and can also reflect the cultural and historical context in which it was created.\n\n\n\n',
            origin: 'bot',
            hasError: false,
            time: '8:53am',
            index: 5,
            elements: [
              {
                content:
                  'while aesthetic evaluations are subjective, they can still provide valuable insights into the ways in which art can be appreciated and understood. the aesthetic qualities of a piece of art can influence how it is experienced and interpreted, and can also reflect the cultural and historical context in which it was created.',
                type: 'text',
              },
            ],
          },
        ];
        break;
      case 'Hello':
        this._messages = [
          {
            text: 'Hello friend',
            origin: 'user',
            hasError: false,
            time: '4:51pm',
            index: 0,
            elements: [{ content: 'Hello friend', type: 'text' }],
          },
        ];
        break;
      case 'None':
        this._messages = [];
        break;
      case 'Flowers':
        this._messages = [
          {
            text: 'Can you give me a list of flower images?',
            origin: 'user',
            hasError: false,
            time: '4:56pm',
            index: 0,
          },
          {
            text: 'Of course, here is a list of flowers:\nCosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
            origin: 'bot',
            hasError: false,
            time: '4:57pm',
            index: 1,
          },
        ];
        break;
      default:
        this._messages = [];
        break;
    }
    this.requestUpdate();
  }

  /** Initialize examples for when stories send in a 'sampleQuery' string
   */
  initializeExamplesText() {
    switch (this.sampleQuery) {
      case 'Greetings':
        this._messages = [
          {
            text: 'Greetings, how may I help you today?',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
        ];
        break;
      case 'Top Websites':
        this._messages = [
          {
            text: "Give me a list of the world's top websites by traffic",
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
          {
            text: 'Here are the top websites in the world based on traffic:\n1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)\n6. TikTok.com (US)\n7. QQ.com (China)\n8. Reddit.com (US)\n9. Weibo.com (China)\n10. Twitter.com (US)\n11. Instagram.com (US)\n12. Yahoo.com (US)\n13. Amazon.com (US)\n14. LinkedIn.com (US)\n15. Imgur.com (US)\nSource:\nhttp://www.alexa.org\nWhat else can I help you with?',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
          },
        ];

        break;
      case 'List of flowers':
        this._messages = [
          {
            text: 'Can you give me a list of flower images?',
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
          {
            text: 'Of course, here is a list of flowers:\nCosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
          },
        ];
        break;
      case 'Chessboard in HTML/CSS':
        this._messages = [
          {
            text: 'How do I make a Chessboard in HTML/CSS ?',
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
          {
            text: 'You can make a chessboard in HTML/CSS by using a table element and applying CSS styling to it. Here is an example of how you can create a chessboard using these methods:\n \nHTML:\n```html\n<table>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n```\nCSS:\n```css\ntable {\n\tborder-collapse: collapse;\n}\n \ntd {\n\twidth: 50px;\n\theight: 50px;\n}\n \n.black {\n\tbackground-color: #000;\n}\n \n.white {\n\tbackground-color: #fff;\n}\n```\nThis will create a table with 8 rows and 8 columns, with each cell alternating between black and white. You can adjust the width and height of the cells as needed.\n \nNote: The `border-collapse: collapse;` property is used to remove the spacing between the table cells.',
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
          },
        ];
        break;
      case 'Moon landing':
        this._messages = [
          {
            text: "I'd like to learn about the Apollo 11 moon landing, please provide me a short description, a video of the event and three images.",
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
          {
            text: "Apollo 11 (July 16–24, 1969) was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC. Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing. Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit, and were on the Moon's surface for 21 hours, 36 minutes before lifting off to rejoin Columbia.\n Source:\n https://www.wikipedia.org/wiki/Apollo_11 \n Here is a video of the event: https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm\n And here are three images from the article cited:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/520px-Aldrin_Apollo_11_original.jpg\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Apollo_11_insignia.png/360px-Apollo_11_insignia.png\n https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Apollo_11_Crew.jpg/440px-Apollo_11_Crew.jpg\n What else can I help you with?",
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
          },
        ];

        break;
      case 'Python code with images':
        this._messages = [
          {
            text: 'Give me a function in python to find if a number is prime, then show me two Ulam spirals and annotate them.',
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
          },
          {
            text: "Certainly, here's how to check if a number is prime in Python:\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n```Source: https://www.geeksforgeeks.org/python-program-to-check-whether-a-number-is-prime-or-not/\nAnd here some sample images using Prime numbers to display Ulam Spirals taken from Wikipedia:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ulam_spiral_10x.png/402px-Ulam_spiral_10x.png\nUlam spiral of size 201×201. Black dots represent prime numbers. Diagonal, vertical, and horizontal lines with a high density of prime numbers are clearly visible.\nhttps://upload.wikimedia.org/wikipedia/commons/e/e0/Randomly_black_odd_numbers.png\nFor comparison, a spiral with random odd numbers colored black (at the same density of primes in a 200x200 spiral).\n\nWhat else may I do for you?",
            origin: this.agentName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 1,
          },
        ];
        break;
      default:
        this._messages = [];
        this._messages.length = 0;
        break;
    }

    this._queryInProgress = false;
    this.requestUpdate();
    this.requestUpdate();
  }

  /** trigger API call upon text input
   * @param {string} searchQuery - current message being sent
   **/
  async getResults(searchQuery) {
    let response;
    if (this.chosenHost == 'Local') {
      response = await APIPlugin.sendMessageLocal(
        this.apiURL,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this.chosenHost == 'BAM') {
      response = await APIPlugin.sendMessageBAM(
        this.apiURL,
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    if (this.chosenHost == 'Watsonx.ai') {
      response = await APIPlugin.sendMessageWatsonX(
        'https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29',
        this.model,
        this.temperature,
        this.userPrompt,
        this._messages,
        searchQuery,
        this._session,
        this._eventNumber
      );
    }
    return response;
  }

  /** handle regeneration signal from message subcomponent, resend query and edit the message list
   * @param {event} event - custom regeneration event from message subcomponent
   */
  _handleUserRegenerationRequest(event) {
    console.log('chat: regen');
    console.log(event);
    const cutIndex = event.detail.index;
    let deletionIndex = this._messages.findIndex(
      (obj) => obj.index === cutIndex
    );

    const originalMessage =
      event.detail.message !== null
        ? event.detail.message
        : this._messages[deletionIndex - 1].text;
    if (event.detail.message == null) {
      deletionIndex--;
    }

    if (deletionIndex > -1) {
      if (!this.autoUpdate) {
        const onRegenerationEvent = new CustomEvent('on-regeneration-request', {
          detail: {
            action: 'User requested regeneration of AI response',
            deletionIndex: deletionIndex,
            originalUserQuery: originalMessage,
            originalObject: event.detail,
            time: this._getCurrentTime(),
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(onRegenerationEvent);
      } else {
        this._messages.length = deletionIndex;
        const inputEvent = new CustomEvent('user-input', {
          detail: { textInputValue: originalMessage },
          bubbles: true,
          composed: true,
        });
        this.requestUpdate();
        this.sendInput(inputEvent);
      }
    }
  }

  /** handle update signal from message subcomponent, only triggered when only text is supplied in parent conversation object
   * @param {event} event - custom update event from message subcomponent
   */
  _handleUserUpdateRequest(event) {
    console.log('chat: update');
    console.log(event);
    const selectedIndex = event.detail.index;
    const index = this._messages.findIndex(
      (obj) => obj.index === selectedIndex
    );
    if (index > -1 && event.detail.messageElements) {
      if (!this.autoUpdate) {
        const onUpdateEvent = new CustomEvent('on-update-request', {
          detail: {
            action: 'User updated query message.',
            messageIndex: index,
            messageObject: event.detail.messageElements,
            time: this._getCurrentTime(),
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(onUpdateEvent);
      } else {
        this._messages[index].messageElements = event.detail.messageElements;
      }
    }
  }

  /** send in the latest user message to the api, package it within the messages array and update the DOM
   **/
  sendInput(event) {
    let value = event.detail.textInputValue;

    const newMessage = {
      text: value,
      origin: this.userName,
      hasError: false,
      time: this._getCurrentTime(),
      index: this._messages.length,
    };

    if (!this.autoUpdate) {
      const onSubmitEvent = new CustomEvent('on-submit', {
        detail: { message: newMessage },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(onSubmitEvent);
    } else {
      this._messages = [...this._messages, newMessage];

      this._queryInProgress = true;
      this.requestUpdate();

      this.getResults(value)
        .then((res) => {
          console.log(res);
          const errorState =
            Object.prototype.hasOwnProperty.call(res, 'failed') &&
            res['failed'] === true;

          this._messages = [
            ...this._messages,
            {
              text: res.reply,
              origin: this.agentName,
              hasError: errorState,
              time: this._getCurrentTime(),
              index: this._messages.length,
            },
          ];
          this._queryInProgress = false;
          this.requestUpdate();
        })
        .catch(() => {
          this._messages = [
            ...this._messages,
            {
              text: 'Error reaching the model server, try again',
              origin: this.agentName,
              hasError: true,
              time: this._getCurrentTime(),
              index: this._messages.length,
            },
          ];
          this._queryInProgress = false;
          this.requestUpdate();
        });
    }
  }

  /** get time of message formatted as 1:23pm or 4:56am
   **/
  _getCurrentTime(): string {
    const now = new Date();
    let hours: number = now.getHours();
    const minutes: number = now.getMinutes();

    const militaryTime = true;
    if (militaryTime) {
      const formattedMinutes: string =
        minutes < 10 ? '0' + minutes : minutes.toString();

      const currentTime: string = hours + ':' + formattedMinutes;

      return currentTime;
    } else {
      const amOrpm: string = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12 || 12;
      const formattedMinutes: string =
        minutes < 10 ? '0' + minutes : minutes.toString();

      const currentTime: string = hours + ':' + formattedMinutes + amOrpm;

      return currentTime;
    }
  }
}
