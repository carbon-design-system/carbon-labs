/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../chat';
import { html } from 'lit';
import '@carbon/web-components/es/components/code-snippet/index.js';
import '@carbon/web-components/es/components/button/index.js';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Chat',
};

export const Default = {
  /**
   * Renders the template for Default Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <div style="height:calc(100vh - 84px); overflow:hidden;">
      <clabs-chat
        user-name="user"
        agent-name="bot"
        .conversation="${[
          {
            text: 'Greetings, how may I help you?',
            origin: 'bot',
            hasError: false,
            time: '4:56pm',
            index: 0,
            disableButtons: true,
            elements: [
              {
                content: 'Greetings, how may I help you?',
                type: 'text',
              },
            ],
          },
        ]}"
        @on-submit="${(event) => {
          console.log(event);
        }}"
        @on-regeneration-request="${(event) => {
          console.log(event);
        }}"
        @on-update-request="${(event) => {
          console.log(event);
        }}"></clabs-chat>
    </div>
  `,
};

const apiArgs = {
  chosenHost: 'Local',
  userPrompt:
    'You are Watson, a helpful and polite assistant. You will answer all my questions to the best of your knowledge.',
  apiUrl: 'http://localhost:5002/generate',
  model: 'llama-2',
  temperature: '',
  feedbackUrl: 'http://localhost:5001/feedback',
};

const apiControls = {
  userPrompt: {
    control: { type: 'text' },
    description: 'Specify additional system prompt for model',
  },
  apiUrl: {
    control: { type: 'text' },
    description: 'Specify custom API url',
  },
  model: {
    control: { type: 'select' },
    description: 'Select model',
    options: ['llama-2'],
  },
  temperature: {
    control: { type: 'text' },
    description: 'Specify Model temperature',
  },
  feedbackUrl: {
    control: { type: 'text' },
    description: 'Specify API url for feeback buttons',
  },
};

export const APIPlayground = {
  argTypes: apiControls,
  args: apiArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.apiUrl - api url provided in playground
   * @param {string} args.feedbackUrl - feedback api url for buttons provided in playground
   * @param {string} args.userPrompt - user specific prompt provided in playground
   * @param {string} args.temperature - model temperature
   * @returns {TemplateResult<1>}
   */
  render: ({ apiUrl, feedbackUrl, userPrompt, temperature }) => html`
    <div style="height:calc(100vh - 84px);">
      <clabs-chat
        model="llama-2"
        auto-update
        user-prompt="${userPrompt}"
        api-url="${apiUrl}"
        feedback-url="${feedbackUrl}"
        temperature="${temperature}"
        user-name="user"
        agent-name="bot">
      </clabs-chat>
    </div>
  `,
};

const slottingArgs = {
  userName: 'user',
  agentName: 'bot',
  conversation: [
    {
      origin: 'user',
      hasError: false,
      time: '2:06pm',
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
      origin: 'bot',
      hasError: false,
      time: '2:07pm',
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
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm',
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
  ],
};

const slottingControls = {
  userName: {
    control: { type: 'text' },
    description: 'Specify user name',
  },
  agentName: {
    control: { type: 'text' },
    description: 'Specify agent name',
  },
  conversation: {
    control: { type: 'object' },
    description: 'Specify message object',
  },
};

export const Slotting = {
  argTypes: slottingControls,
  args: slottingArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Default Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.userName - set user name
   * @param {string} args.agentName - set chat bot name
   * @param {Object} args.conversation - array of message object to render
   * @returns {TemplateResult<1>}
   */
  render: ({ userName, agentName, conversation }) => html`
    <div style="height:calc(100vh - 84px); overflow:hidden;">
      <clabs-chat user-name="${userName}" agent-name="${agentName}" conversation="${conversation}">
        <clabs--chat-messages slot="messages" user-name="user" agent-name="bot">
          <clabs--chat-message slot="message-list" origin="user" time-stamp="9:02pm" index="0">
              <clabs--chat-text slot="message-content" content="Showcase every type of Element available in this Chat component."> <clabs--chat-text/>
          </clabs--chat-message>

          <clabs--chat-message slot="message-list" origin="bot" time-stamp="9:04pm" index="1">

              <clabs--chat-text slot="message-content" content='This is a textElement, displays text following Carbon design guidelines.'></clabs--chat-text>
              <clabs--chat-text slot="message-content" content='TextElement can also render simple HTML as such:\n <h2>This is using a h2 tag</h2>\n'></clabs--chat-text>

              <clabs--chat-text slot="message-content" content='You can also specify a simple slotted div with any content: (Youtube embed example)\n'></clabs--chat-text>
              <div slot="message-content">
                <iframe width="256" height="256" src="https://www.youtube.com/embed/oSCX78-8-q0?si=kCcIHjehhVn-4PSO" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              </div>
              
              <clabs--chat-text slot="message-content" content='You can also show files, tables, code, action buttons or lists:'></clabs--chat-text>
              <clabs--chat-card slot="message-content" type="file" content='https://arxiv.org/pdf/2312.05688.pdf'></clabs--chat-card>
              <clabs--chat-table slot="message-content" content='Name,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY'></clabs--chat-table>
      
              <clabs--chat-code slot="message-content" content='from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n'></clabs--chat-code>
   
              <clabs--chat-tags slot="message-content" content='["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]'></<clabs--chat-tags>
      
              <clabs--chat-list slot="message-content" content='1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)'></clabs--chat-list>
              <clabs--chat-text slot="message-content" content='And finally any chart you wish!'></clabs--chat-text>

              <clabs--chat-chart container-height="400px" slot="message-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'></clabs--chat-chart>
              <clabs--chat-chart container-height="600px" slot="message-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'></clabs--chat-chart>
              <clabs--chat-chart container-height="200px" slot="message-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'></clabs--chat-chart>
              <clabs--chat-chart container-height="350px" slot="message-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'></clabs--chat-chart>              
              <clabs--chat-chart container-height="250px" slot="message-content" content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'></clabs--chat-chart>
          </clabs--chat-message>
        </clabs--chat-messages>
      </clabs-chat>
    </div>
    
  `,
};

const textPlaygroundArgs = {
  sampleQuery: 'None',
  queryMode: 'Examples',
  rawText: 'Hello, how can I help you?',
};

const rawTextExamples = {
  None: '',
  'List of flowers':
    'user:Can you give me a list of flower images?\n\nbot:Of course, here is a list of flowers:\nCosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
  'Chessboard in HTML/CSS':
    'user:How do I make a Chessboard in HTML/CSS ?\n\nbot:You can make a chessboard in HTML/CSS by using a table element and applying CSS styling to it. Here is an example of how you can create a chessboard using these methods:\n \nHTML:\n```html\n<table>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n```\nCSS:\n```css\ntable {\n\tborder-collapse: collapse;\n}\n \ntd {\n\twidth: 50px;\n\theight: 50px;\n}\n \n.black {\n\tbackground-color: #000;\n}\n \n.white {\n\tbackground-color: #fff;\n}\n```\nThis will create a table with 8 rows and 8 columns, with each cell alternating between black and white. You can adjust the width and height of the cells as needed.\n \nNote: The `border-collapse: collapse;` property is used to remove the spacing between the table cells.',
  'Moon landing':
    "user:I'd like to learn about the Apollo 11 moon landing, please provide me a short description, a video of the event and three images.\n\nbot:Apollo 11 (July 16–24, 1969) was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC. Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing. Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit, and were on the Moon's surface for 21 hours, 36 minutes before lifting off to rejoin Columbia.\n Source:\n https://www.wikipedia.org/wiki/Apollo_11 \n Here is a video of the event:\nhttps://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm\n And here are three images from the article cited:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/520px-Aldrin_Apollo_11_original.jpg\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Apollo_11_insignia.png/360px-Apollo_11_insignia.png\n https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Apollo_11_Crew.jpg/440px-Apollo_11_Crew.jpg\n What else can I help you with?",
  'Python code with images':
    "user:Give me a function in python to find if a number is prime, then show me two Ulam spirals and annotate them.\n\nbot:Certainly, here's how to check if a number is prime in Python:\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n```Source:\nhttps://www.geeksforgeeks.org/python-program-to-check-whether-a-number-is-prime-or-not/\nAnd here some sample images using Prime numbers to display Ulam Spirals taken from Wikipedia:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ulam_spiral_10x.png/402px-Ulam_spiral_10x.png\nUlam spiral of size 201×201. Black dots represent prime numbers. Diagonal, vertical, and horizontal lines with a high density of prime numbers are clearly visible.\nhttps://upload.wikimedia.org/wikipedia/commons/e/e0/Randomly_black_odd_numbers.png\nFor comparison, a spiral with random odd numbers colored black (at the same density of primes in a 200x200 spiral).\n\nWhat else may I do for you?",
  'Top Websites':
    'user:Give me a list of the top websites by traffic bot:Here are the top websites in the world based on traffic:\n\nbot:1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)\n6. TikTok.com (US)\n7. QQ.com (China)\n8. Reddit.com (US)\n9. Weibo.com (China)\n10. Twitter.com (US)\n11. Instagram.com (US)\n12. Yahoo.com (US)\n13. Amazon.com (US)\n14. LinkedIn.com (US)\n15. Imgur.com (US)\nSource:\nhttp://www.alexa.org\nWhat else can I help you with?',
  'Showcase 2':
    'user:Explain to me how your streaming capabilities work, then give me.\nbot:<b>Streaming test for various complex components:</b>\nMethodology: data is sent in token by token into the Chat. With each token, the stream is automatically parsed. Blocks are detected depending on a variety of LLM conventions to denote in order:\n1. Code blocks delimited by a custom delimiter\n2. JSON objects displayed as code\n3. Unless they contain $schema then recategorized as charts\n4. Array elements containing text or URLs\n5. CSV table objects with predefined newline/seperator strings\n6. List elements starting with - * or numbered lists (such as this)\n7.URLs of any kind, classified as files/videos/urls/images post-hoc\nHere is an element of type "img" using the Image element (Picture of a Dahlia from bougs.com):\nhttps://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg\nHere is an element of type "url" using the Card element (Wikipedia article):\nhttps://en.wikipedia.org/wiki/Fireworks\nHere is an element of type "video" using the Card element (Paris streets from Wikimedia):\nhttps://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm\nImage Carousel example:\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]\nFile Carousel example:\n["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]\nVideo Carousel example:\n["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]\nAudio Carousel example:\n["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]\nURL example:\n["https://www.wikipedia.org","https://www.ibm.com","https://www.google.com","https://www.reddit.com","https://www.github.com","https://www.arxiv.org","https://www.archive.org","https://www.instagram.com"]\nCode example:\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True```\nChart component with US map of unemployment:\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}\nHeatmap Chart:\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}\nBubble Plot chart:\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}\nTable example:\nName,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY\nWhat else would you like to see?',
  Showcase:
    'user:Show me all types of elements available in this Chat with examples.\nbot: Here is an element of type "carousel" using the Carousel element (Pictures from bougs.com):\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]\nHere is an element of type "img" using the Image element (Picture of a Dahlia from bougs.com):\nhttps://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg\nHere is an element of type "url" using the Card element (Wikipedia article):\nhttps://en.wikipedia.org/wiki/Fireworks\nHere is an element of type "video" using the Card element (Apollo moon landing from Wikimedia):\nhttps://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm\nHere is an element of type "file" using the Card element:\nhttps://github.com/vega/vega-datasets/blob/main/data/co2-concentration.csv\nHere is an element of type "table" using the Table element (Seinfeld characters):\nName,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY\nHere is an element of type "code" using the Code element (Prime function in Python):\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True```\nHere is an element of type "tags" using the TagList element (French philosophers):\n["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]\nHere is an element of type "list" using the List element (Top 5 websites):\n1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)\nHere is an element of type "chart" using the Chart element (Box plot):{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}\nHere is an element of type "chart" using the Chart element (US unemployment):\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',
  Charts:
    'user:Show me charts!\nbot:<b>Box Plot</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}\n<b>Map</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}\n<b>Bar Chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}\n<b>Horizontal Multi Bar Chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}\n<b>Pie Chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}\n<b>Donut Chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}\n<b>Heatmap</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}\n<b>Scatter Plot</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}\n<b>Bubble Plot</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}\n<b>Multi-series line chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}\n<b>Candle stick chart</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#06982d"},"value":"#ae1325"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}\n<b>Orthographic world map</b>\n{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}\n<b>Stream Graph</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}\n<b>Multi histogram</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}\n<b>Interactive multi-scatter plot</b>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}\n',
  'Table Test':
    'user:Give two 10x6 tables with random data\nbot:Table 1:\na,b,c,d,e,f,g,h,i,j\n1,2,3,4,5,6,7,8,9,10\n11,12,13,14,15,16,17,18,19,20\n21,22,23,24,25,26,27,28,29\n30,31,32,33,34,35,36,37,38,39\n40,41,42,43,44,45,46,47,48,49\n50,51,52,53,54,55,56,57,58,59\nTable 2:\nk,l,m,n,o,p,q,r,s,t\n9001,9002,9003,9004,9005,9006,9007,9008,9009,90010\n90011,90012,90013,90014,90015,90016,90017,90018,90019,90020\n90021,90022,90023,90024,90025,90026,90027,90028,90029\n90030,90031,90032,90033,90034,90035,90036,90037,90038,90039\n90040,90041,90042,90043,90044,90045,90046,90047,90048,90049\n90050,90051,90052,90053,90054,90055,90056,90057,90058,90059\n',
  'Carousel Test':
    'user:Show me some carousels:\nbot:["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]\n["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]\n["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]\n["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://vega.github.io/vega-lite/examples/data/disasters.csv","https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg"]\n',
};

const textPlaygroundControls = {
  sampleQuery: {
    control: { type: 'select' },
    description: 'Premade rawText',
    options: [
      'None',
      'Showcase',
      'Showcase 2',
      'Moon landing',
      'Top Websites',
      'Python code with images',
      'List of flowers',
      'Charts',
      'Chessboard in HTML/CSS',
      'Table Test',
      'Carousel Test',
    ],
  },
  queryMode: {
    control: { type: 'select' },
    description: 'Select mode',
    options: ['Examples', 'Custom'],
  },
  rawText: {
    control: { type: 'text' },
    description: 'Render with a raw LLM string',
  },
};

export const LLMTextPlayground = {
  argTypes: textPlaygroundControls,
  args: textPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - textPlayground preset arguments
   * @param {string} args.queryMode - set between premade examples and text input from user in story
   * @param {string} args.sampleQuery - preset name of example
   * @param {Object} args.rawText - raw text from user
   * @returns {TemplateResult<1>}
   */
  render: ({ queryMode, sampleQuery, rawText }) => html`
    <div
      style="height:calc(100vh - 132px); overflow:hidden; display:inline-flex;max-width:100%;">
      <div style="height:calc(100vh - 132px); flex:1;">
        ${queryMode == 'Examples'
          ? html` <clabs-chat
              sample-query="${rawTextExamples[sampleQuery]}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>`
          : html` <clabs-chat
              sample-query="${rawText}"
              user-name="user"
              agent-name="bot">
            </clabs-chat>`}
      </div>
      ${sampleQuery !== 'None' && queryMode == 'Examples'
        ? html`
            <div
              style="height:calc(100vh - 132px); flex:1; padding-left:20px;max-width:100%;overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=${200}
                type="multi"
                >${rawTextExamples[sampleQuery]}</cds-code-snippet
              >
            </div>
          `
        : html``}
    </div>
  `,
};

export const StreamTextPlayground = {
  argTypes: textPlaygroundControls,
  args: textPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - textPlayground preset arguments
   * @param {string} args.queryMode - set between premade examples and text input from user in story
   * @param {string} args.sampleQuery - preset name of example
   * @param {Object} args.rawText - raw text from user
   * @returns {TemplateResult<1>}
   */
  render: ({ queryMode, sampleQuery, rawText }) => html`
    <div
      style="height:calc(100vh - 132px); overflow:hidden; display:inline-flex;width:100%;max-width:100%;">
      <div style="height:calc(100vh - 132px); flex:1;">
        ${queryMode == 'Examples'
          ? html` <clabs-chat
              sample-query="${rawTextExamples[sampleQuery]}"
              user-name="user"
              stream-responses
              agent-name="bot">
            </clabs-chat>`
          : html` <clabs-chat
              sample-query="${rawText}"
              user-name="user"
              stream-responses
              agent-name="bot">
            </clabs-chat>`}
      </div>
      ${sampleQuery !== 'None' && queryMode == 'Examples'
        ? html`
            <div
              style="height:calc(100vh - 132px); flex:1; padding-left:20px;max-width:100%;overflow-y:auto;">
              <h4>Raw LLM text</h4>
              <cds-code-snippet
                wrap-text
                minCollapsedNumberOfRows=${200}
                type="multi"
                >${rawTextExamples[sampleQuery]}</cds-code-snippet
              >
            </div>
          `
        : html``}
    </div>
  `,
};

const objectPlaygroundArgs = {
  testMode: 'Examples',
  sampleConversation: 'Conversation tutorial',
  conversationJSON: [],
};

const objectPlaygroundControls = {
  testMode: {
    control: { type: 'select' },
    description: 'Select mode',
    options: ['Examples', 'Custom'],
  },
  sampleConversation: {
    control: { type: 'select' },
    description: 'Premade conversation objects',
    options: [
      'None',
      'Agents',
      'Conversation tutorial',
      'Showcase',
      'Nature of art',
      'Flowers',
      'Hello',
      'Visualization',
    ],
  },
  conversationJSON: {
    control: { type: 'object' },
    description: 'JSON conversation',
  },
};

const conversationExamples = {
  'Conversation tutorial': [
    {
      origin: 'bot',
      hasError: false,
      time: '4:51pm',
      index: 0,
      elements: [
        {
          type: 'text',
          content:
            "Welcome!\nHere's how to make a JSON conversation object to display data in this Chat component.\nHere is an example of a message object:",
        },
        {
          type: 'code',
          content:
            '{\n\t//bot or user name specified in Chat parent component\n\torigin: "user",\n\t//list of sub-elements to display inside the message\n\telements: [\n\t\t//render a plain text element\n\t\t{ type: "text", content: "Generate images like so:"},\n\t\t//then a code block\n\t\t{ type: "code", content: "func(){...}"},\n\t\t//then another text message\n\t\t{ type: "text", content: "Here is an example image:"},\n\t\t//then an image Card\n\t\t{ type: "img", content: "http://www.site.org/image.png"},\n\t\t//more text\n\t\t{ type: "text", content: "Source:"},\n\t\t//then a URL Card\n\t\t{ type: "url", content: "http://www.site.org/tutorial"},\n\t],\n\t//timeStamp of message (default: auto-generated)\n\ttime: "10:08am",\n\t//remove interaction buttons (default: false)\n\tdisableButtons: false,\n\t//remove interaction buttons (default: user/bot name)\n\tdisplayName: "Watsonx",\n\t//rank in message order (default: auto-generated)\n\tindex: 0\n}',
        },
        {
          type: 'text',
          content:
            'Each item in elements will invoke and render a corresponding component. Here are all the sub-elements available to display:',
        },
        {
          type: 'table',
          content:
            'Component,Type,Auto-detection\nText,text,Any normal text\nImage,img,URLs ending in png/jpeg/bmp/...\nCard (video),video,URLs ending in mp4/webm/mov/...\nCard (file),file,URLs/paths ending in csv/pdf/xls/...\nCard (url),url,URLs ending in com/org/net/...\nTable,table,Csv-type text using commas and linebreaks\nCode,code,Text between a predefined delimiter\nCarousel,carousel,Array of image URLs\nTagList,tags,Array of any non-image text\nList,list,Text blocks with any markers like bullets/numbers\nChart,chart,JSON object beginning with {"$schema"...\nError,error,Error text\nLoading,loading,None (empty)\nEditableText,editable-text,Any text',
        },
        {
          type: 'text',
          content:
            'If unspecified, rawText can be used to auto-generate the sub-elements:',
        },
        {
          type: 'code',
          content:
            '{\n\t//message originator\n\torigin: "bot",\n\t//raw text string to be parsed:\n\trawText: "Generated image: http://www.host.com/image.png Source: http://www.site.org",\n}',
        },
        { type: 'text', content: 'Which results in:' },
        {
          type: 'code',
          content:
            '{\n\torigin: "bot",\n\telements: [\n\t\t{ type: "text", content: "Generated image:"},\n\t\t{ type: "img", content: "http://www.host.com/image.png"},\n\t\t{ type: "text", content: "Source:"},\n\t\t{ type: "url", content: "http://www.site.org"},\n}',
        },
        {
          type: 'text',
          content:
            'If both are specified, elements will always supercede rawText\n',
        },
      ],
    },
  ],
  Showcase: [
    {
      origin: 'user',
      hasError: false,
      time: '0:00am',
      index: 0,
      elements: [
        {
          content:
            'Showcase every type of element available in this Chat component.',
          type: 'text',
        },
      ],
    },
    {
      text: '',
      origin: 'bot',
      hasError: false,
      time: '0:00am',
      index: 1,
      elements: [
        {
          content:
            'Here is an element of type "carousel" using the Carousel element (Pictures from bougs.com):\n',
          type: 'text',
        },
        {
          content:
            '["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]',
          type: 'carousel',
        },
        {
          content:
            'Here is an element of type "img" using the Image element (Picture of a Dahlia from bougs.com):\n',
          type: 'text',
        },
        {
          content:
            'https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg',
          type: 'img',
        },
        {
          content:
            'Here is an element of type "url" using the Card element (Apollo 11 Wikipedia article):\n',
          type: 'text',
        },
        {
          content: 'https://www.wikipedia.org/wiki/Apollo_11',
          type: 'url',
        },
        {
          content:
            'Here is an element of type "video" using the Card element (Apollo moon landing from Wikimedia):\n',
          type: 'text',
        },
        {
          content:
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm',
          type: 'video',
        },
        {
          content:
            'Here is an element of type "file" using the Card element:\n',
          type: 'text',
        },
        {
          content:
            'https://github.com/vega/vega-datasets/blob/main/data/co2-concentration.csv',
          type: 'file',
        },
        {
          content:
            'Here is an element of type "table" using the Table element (Seinfeld characters):\n',
          type: 'text',
        },
        {
          content:
            'Name,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY',
          type: 'table',
        },
        {
          content:
            'Here is an element of type "code" using the Code element (Prime function in Python):\n',
          type: 'text',
        },
        {
          content:
            'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n',
          type: 'code',
        },
        {
          content:
            'Here is an element of type "error" using the Error element\n',
          type: 'text',
        },
        {
          content:
            'SEGMENTATION ERROR: Failed to render the content provided. (example)',
          type: 'error',
        },
        {
          content:
            'Here is an element of type "loading" using the Loading element\n',
          type: 'text',
        },
        {
          content: '',
          type: 'loading',
        },
        {
          content:
            'Here is an element of type "tags" using the TagList element (French philosophers):\n',
          type: 'text',
        },
        {
          content:
            '["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]',
          type: 'tags',
        },
        {
          content:
            'Here is an element of type "list" using the List element (Top 5 websites):\n',
          type: 'text',
        },
        {
          content:
            '1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)',
          type: 'list',
        },
        {
          content:
            'Here is an element of type "chart" using the Chart element (Gradiented price line of IBMs stock price):\n',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}',
          type: 'chart',
        },
        {
          content:
            'Here is an element of type "chart" using the Chart element (Boxplot of Penguin weights):\n',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}',
          type: 'chart',
        },
        {
          content:
            'Here is an element of type "chart" using the Chart element (US unemployment):\n',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',
          type: 'chart',
        },
      ],
    },
  ],
  Visualization: [
    {
      origin: 'user',
      hasError: false,
      time: '0:00am',
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
      origin: 'bot',
      hasError: false,
      time: '0:00am',
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
  ],
  'Nature of art': [
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
  ],
  Hello: [
    {
      text: 'Hello friend',
      origin: 'user',
      hasError: false,
      time: '4:51pm',
      index: 0,
      elements: [{ content: 'Hello friend', type: 'text' }],
    },
  ],
  Flowers: [
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
  ],
  Agents: [
    {
      text: 'Find me a dataset about the weather in Ohio circa 2015',
      origin: 'user',
      time: '4:56pm',
      index: 0,
    },
    {
      origin: 'bot',
      displayName: 'Agent: George',
      displayColor: '#a3fffc',
      time: '4:57pm',
      index: 1,
      elements: [
        { content: 'I found the relevent file for you:', type: 'text' },
        {
          content:
            'temp_cst_var,hhf,llf,dr_date_mv2,zip\n77987,4059,4904,66777,3345\n234334,6743,4354,3453,2345\n234334,6743,4354,3453,2345\n234334,6743,4354,3453,2345',
          type: 'table',
        },
        { content: 'http://www.file.com/weather.csv', type: 'file' },
      ],
    },
    {
      origin: 'bot',
      displayName: 'Agent: Micheal',
      displayColor: '#d0b2fe',
      time: '5:07pm',
      index: 2,
      elements: [
        {
          content:
            'Hello, I can edit the column titles or offer you a better title for your file...',
          type: 'text',
        },
        {
          content:
            '<span style="font-size:20px; font-style:bold;"> Update file title:</span>',
          type: 'text',
        },
        {
          content:
            '["2015_ohio_temperatures.csv","2015_cleveland_heatwave.csv","daily_temperatures_suffolk_county_may_2015.csv"]',
          type: 'tags',
        },
        { content: 'I can also update your column names:', type: 'text' },
        {
          content:
            '<span style="font-size:20px; font-style:bold;">Before:</span>',
          type: 'text',
        },
        { content: 'temp_cst_var,hhf,llf,dr_date_mv2,zip', type: 'table' },
        {
          content:
            '<span style="font-size:20px; font-style:bold;">After:</span>',
          type: 'text',
        },
        { content: 'temperature,highs,lows,mm/dd/yyyy,zipcode', type: 'table' },
        { content: '["Apply"]', type: 'tags' },
      ],
    },
    {
      origin: 'bot',
      displayName: 'Agent: Sophia',
      displayColor: '#ade0ff',
      time: '5:09pm',
      index: 3,
      elements: [
        {
          content: 'And I can visualize your data however you want!',
          type: 'text',
        },
        {
          type: 'chart',
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}',
        },
      ],
    },
  ],
};

export const Playground = {
  argTypes: objectPlaygroundControls,
  args: objectPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.testMode - switch between user input JSONs and premade examples
   * @param {Object} args.sampleConversation - array of message object to render
   * @param {Object} args.conversationJSON - user defined JSON conversation set in story
   * @returns {TemplateResult<1>}
   */
  render: ({ testMode, sampleConversation, conversationJSON }) => html`
    <div
      style="height:calc(100vh - 84px); overflow:hidden; display:inline-flex;max-width:100%;width:100%;">
      <div style="height:calc(100vh - 84px); flex:1;">
        <clabs-chat
          user-name="user"
          agent-name="bot"
          input-field-placeholder="What can I assist you with today?"
          .conversation="${testMode === 'Examples'
            ? conversationExamples[sampleConversation]
            : conversationJSON}"
          @on-user-message-update-request="${(e) => {
            console.log(e);
          }}"
          @on-user-regeneration-request="${(e) => {
            console.log(e);
          }}"
          @on-user-feedback-request="${(e) => {
            console.log(e);
          }}"
          @on-user-text-input="${(e) => {
            console.log(e);
          }}"
          @on-message-element-tag-selected="${(e) => {
            console.log(e);
          }}"
          @on-message-element-selected="${(e) => {
            console.log(e);
          }}">
        </clabs-chat>
      </div>
      ${testMode === 'Examples' &&
      sampleConversation !== 'None' &&
      sampleConversation !== 'Conversation tutorial'
        ? html` <div
            style="height:calc(100vh - 84px); flex:1; padding-left:20px;max-width:100%;overflow-y:auto;">
            <h4>JSON conversation object</h4>
            <cds-code-snippet
              wrap-text
              minCollapsedNumberOfRows=${200}
              type="multi"
              >${JSON.stringify(
                conversationExamples[sampleConversation],
                null,
                2
              )}</cds-code-snippet
            >
          </div>`
        : html``}
    </div>
  `,
};
