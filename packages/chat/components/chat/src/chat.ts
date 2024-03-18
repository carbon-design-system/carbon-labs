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
  private _messages: any[] = [];

  /**
   * string variable edited by textInput, auto-updates at every keystroke and is sent to the api url on 'enter' or 'send' button click
   */
  @state()
  _messageText = '';

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
  @property({ type: Boolean, attribute: 'loading' })
  loading;

  /**
   * boolean denoting when an api query has begun and returned to 'false' when it is received or an error occured, used to display an empty loading message
   */
  @state()
  _queryInProgress = false;

  /**
   * current string returned by the input dom object
   **/
  private _inputText = '';

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
   * string denoting whether to use a light of dark theme
   */
  @property({ type: String, attribute: 'theme' })
  theme;

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
    if (this.conversation !== null) {
      this._messages = this.conversation;
      this.requestUpdate();
    }
  }

  /** internal LIT function to detect updates to the DOM tree, used to auto scroll the compoent
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('loading')) {
      this._queryInProgress = this.loading;
    }

    if (changedProperties.has('conversation')) {
      if (this.conversation !== null) {
        this._messages = this.conversation;
        this._updateScroll();
        this.requestUpdate();
      }
    }

    if (changedProperties.has('conversationExample')) {
      this.initializeExamplesObject();
    }

    if (changedProperties.has('sampleQuery')) {
      this.initializeExamplesText();
    }
    if (changedProperties.has('apiURL')) {
      console.log('api change');
    }

    if (changedProperties.has('apiURL')) {
      console.log('url change');
    }
  }

  /**
   * Initialize examples Object for when stories send in a 'conversation' object
   */
  initializeExamplesObject() {
    switch (this.conversationExample) {
      case 'Visualization':
        this._messages = [
          {
            origin: this.userName,
            hasError: false,
            time: this._getCurrentTime(),
            index: 0,
            elements: [
              {content:"Hello, show me a simple table based on Seinfeld Characters then display the following charts with small mockup datasets: a bar chart, a pie chart then a matrix.",
              type:"text"}
            ]
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
                content: 'And here is a matrix:',
                type:"text"
              },
              {
                content:
                '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"values":[{"x":0,"y":0,"value":0.5},{"x":1,"y":0,"value":0.2},{"x":2,"y":0,"value":0.1},{"x":3,"y":0,"value":0.8},{"x":0,"y":1,"value":0.7},{"x":1,"y":1,"value":0.8},{"x":2,"y":1,"value":0.3},{"x":3,"y":1,"value":0.4},{"x":0,"y":2,"value":0.1},{"x":1,"y":2,"value":0.2},{"x":2,"y":2,"value":0.9},{"x":3,"y":2,"value":0.9},{"x":0,"y":3,"value":0.5},{"x":1,"y":3,"value":0.2},{"x":2,"y":3,"value":0.5},{"x":3,"y":3,"value":0.6}]},"title":"Matrix example","mark":"rect","encoding":{"x":{"field":"x","type":"ordinal","title":"x"},"y":{"field":"y","type":"ordinal","title":"y"},"color":{"field":"value","type":"quantitative"}}}',
                type: "chart"
              },
              {
                content:"And here is a wordcloud of business terms:",
                "type":"text"
              },
              {
                content:'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A word cloud","data":{"values":[{"word":"Synergy","value":72},{"word":"Agile","value":24},{"word":"Blockchain","value":52},{"word":"Innovation","value":82},{"word":"Disrupt","value":66},{"word":"AI","value":90},{"word":"Leverage","value":35},{"word":"Big data","value":22},{"word":"Growth","value":72},{"word":"Inclusivity","value":59},{"word":"Integration","value":44}]},"transform":{"calculate":"datum.value","as":"size"},"mark":"text","encoding":{"text":{"field":"word","type":"nominal"},"size":{"field":"value","type":"quantitative","scale":{"range":[20,90]}},"color":{"field":"size","type":"quantitative"}}}',
                type:"chart"
              },
              {
                content:"What else can I help you with?",
                "type":"text"
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

  /** handle user inputs inside the input field, trigger a search upon an 'enter' key down event
   * @param {event} event - lit event sent by the the text input object within the chat
   **/
  _handleInput(event) {
    const { value } = event.target;
    this._inputText = value;
    if (event.key == 'Enter') {
      this._sendInput();
    }
  }

  /** handle regeneration signal from message subcomponent, resend query and edit the message list
   * @param {event} event - custom regeneration event from message subcomponent
   */
  _handleRegenerate(event) {
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
      this._messages.length = deletionIndex;
      this._inputText = originalMessage;
      this.requestUpdate();
      this._sendInput();
    }
  }

  /** handle update signal from message subcomponent, only triggered when only text is supplied in parent conversation object
   * @param {event} event - custom update event from message subcomponent
   */
  _handleUpdate(event) {
    const selectedIndex = event.detail.index;
    const index = this._messages.findIndex(
      (obj) => obj.index === selectedIndex
    );
    if (index > -1 && event.detail.messageElements) {
      this._messages[index].messageElements = event.detail.messageElements;
    }
  }

  /** send in the latest user message to the api, package it within the messages array and update the DOM
   **/
  _sendInput() {
    const value = this._inputText;
    this._messageText = '';

    const newMessage = {
      text: value,
      origin: this.userName,
      hasError: false,
      time: this._getCurrentTime(),
      index: this._messages.length,
    };

    if (this.conversation !== undefined) {
      const onSubmitEvent = new CustomEvent('on-submit', {
        detail: { message: newMessage },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(onSubmitEvent);
    } else {
      this._messages.push(newMessage);

      this._queryInProgress = true;
      this.requestUpdate();
      this._updateScroll();

      this.getResults(value)
        .then((res) => {
          const errorState =
            Object.prototype.hasOwnProperty.call(res, 'failed') &&
            res['failed'] === true;
          this._messages.push({
            text: res.reply,
            origin: this.agentName,
            hasError: errorState,
            time: this._getCurrentTime(),
            index: this._messages.length,
          });
          this._queryInProgress = false;
          this.requestUpdate();
          this._updateScroll();
        })
        .catch((error) => {
          console.log(error);
          this._messages.push({
            text: 'Error reaching the model server, try again',
            origin: this.agentName,
            hasError: true,
            time: this._getCurrentTime(),
            index: this._messages.length,
          });
          this._queryInProgress = false;
          this.requestUpdate();
          this._updateScroll();
        });
    }
  }

  /**
   * Set the message text value on input
   * @param {Object} event - event object
   */
  _setMessageText(event) {
    this._messageText = event.target.value;
  }

  /** get time of message formatted as 1:23pm or 4:56am
   **/
  _getCurrentTime(): string {
    const now = new Date();
    let hours: number = now.getHours();
    const minutes: number = now.getMinutes();
    const amOrpm: string = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12;
    const formattedMinutes: string =
      minutes < 10 ? '0' + minutes : minutes.toString();

    const currentTime: string = hours + ':' + formattedMinutes + amOrpm;

    return currentTime;
  }

  /** auto-scroll chat-messages div when a new message has appeared
   **/
  _updateScroll() {
    const scrollDiv = this.shadowRoot?.querySelector('.c4ai--chat-messages');
    setTimeout(() => {
      scrollDiv?.scrollTo({
        top: scrollDiv?.scrollHeight,
        behavior: 'smooth',
      });
    }, 200);
  }
}
