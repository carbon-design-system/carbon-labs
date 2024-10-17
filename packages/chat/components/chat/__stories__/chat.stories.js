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

export default {
  title: 'Components/Chat/Chat',
  component: 'clabs-chat',
};

/*
  [
    'text',
    '<b>Abraham Lincoln was an American lawyer</b>, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865. Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)\n [Many more links are available in this article](https://en.wikipedia.org/wiki/Log_cabin,https://en.wikipedia.org/wiki/Kentucky,https://en.wikipedia.org/wiki/American_frontier,https://en.wikipedia.org/wiki/Indiana). ',
    'annotated-text',
    'Abraham Lincoln article on Wikipedia',
  ],
*/

const coreExamples = [
  [
    'text',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  ],
  [
    'carousel',
    '["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]',
    '',
    'Flower images from bouqs.com',
  ],
  [
    'text',
    "<strong>Galileo di Vincenzo Bonaiuti de' Galilei</strong> (15 February 1564 – 8 January 1642), commonly referred to as <strong>Galileo Galilei</strong> (<i>ɡælɪˈleɪoʊ ɡælɪˈleɪ GAL-il-AY-oh GAL-il-AY</i>) or simply <strong>Galileo</strong>, was an Italian [astronomer](https://en.wikipedia.org/wiki/Astronomer), [physicist](https://en.wikipedia.org/wiki/Physicist) and [engineer](https://en.wikipedia.org/wiki/Engineer), sometimes described as a [polymath](https://en.wikipedia.org/wiki/Polymath). He was born in the city of [Pisa](https://en.wikipedia.org/wiki/Pisa), then part of the [Duchy of Florence](https://en.wikipedia.org/wiki/Duchy_of_Florence). Galileo has been called the father of [observational astronomy](https://en.wikipedia.org/wiki/Observational_astronomy), modern-era classical physics, the [scientific method](https://en.wikipedia.org/wiki/Scientific_method), and [modern science](https://en.wikipedia.org/wiki/Modern_science).",
    'summarized-text',
    'Galileo Galilei article on Wikipedia',
  ],
  [
    'code',
    '```from math import sqrt\n# n is the number to be check whether it is prime or not\nn = 1\n\n# this flag maintains status whether the n is prime or not\nprime_flag = 0\n\nif(n > 1):\n\tfor i in range(2, int(sqrt(n)) + 1):\n\t\tif (n % i == 0):\n\t\t\tprime_flag = 1\n\t\t\tbreak\n\tif (prime_flag == 0):\n\t\tprint("True")\n\telse:\n\t\tprint("False")\nelse:\n\tprint("False")\n```',
    '',
    'Prime function in python',
  ],
  [
    'code',
    '```<clabs-chat \n\tuser-name="Owen" \n\tagent-name="Watson"\n\tconversation={conversationJSON}\n\tstream-responses={streamEnabled}\n\tloading={loading}\n\tdefault-viewing-mode="docked"\n\ton:on-user-message-update-request={handleUpdatedMessage}\n\ton:on-user-regeneration-request={handleRegeneration}\n\ton:on-user-text-input={handleNewMessage}\n\ton:on-message-element-selected={handleElementClicked}\n\ton:on-user-feedback-request={handleUserFeedback}\n\ton:on-message-element-tag-selected={handleTagClicked}>\n</clabs-chat>```',
    '',
    'Carbon Chat example',
  ],
  [
    'link-list',
    '[IBM Cloud Home](https://www.ibm.com/cloud),[Cloud Solutions](https://www.ibm.com/cloud/solutions),[Cloud products](https://www.ibm.com/cloud/products),[Cloud Docs](https://cloud.ibm.com/docs)',
    '',
    'List of links in IBM Cloud',
  ],
  [
    'formula',
    "\\( S = -\\frac{1}{2}\\int d^2\\sigma \\sqrt{-h} h^{ab}\\partial_a X^\\mu \\partial_b X^\\mu \\\\ \\frac{1}{4 \\pi \\alpha'} \\int d^2\\sigma \\sqrt{-h} \\left( h^{ab} \\partial_a X^\\mu \\partial_b X_\\mu + \\alpha' R \\Phi(X) \\right  \\\\ [\\alpha_m^\\mu, \\alpha_n^\\nu] = m \\delta_{m+n,0} \\eta^{\\mu \\nu}  \\)",
    '',
    'String Theory Action',
  ],
  [
    'formula',
    '\\(\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} = \\\\ 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} \\\\ {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }\\)',
    '',
    'An Identity of Ramanujan',
  ],
  [
    'table',
    'Name,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY',
    '',
    'Seinfeld characters',
  ],
  [
    'text',
    '[International Business Machines Corporation](https://en.wikipedia.org/wiki/IBM) (using the trademark IBM), nicknamed [Big Blue](https://en.wikipedia.org/wiki/Big_Blue), is an American [multinational](https://en.wikipedia.org/wiki/Multinational_corporation) [technology company](https://en.wikipedia.org/wiki/Technology_company) headquartered in [Armonk, New York](https://en.wikipedia.org/wiki/Armonk,_New_York) and present in over 175 countries. IBM is the largest industrial [research organization](https://en.wikipedia.org/wiki/Research_institute) in the world, with 19 research facilities across a dozen countries, having held the record for most annual [U.S.](https://en.wikipedia.org/wiki/United_States) [patents](https://en.wikipedia.org/wiki/Patent) generated by a business for 29 consecutive years from 1993 to 2021',
    'highlight-text',
    'IBM article from wikipedia.com',
  ],
  ['file-upload', 'Test_file.pdf'],
  [
    'card',
    'https://dhjhkxawhe8q4.cloudfront.net/yup-wp/wp-content/uploads/2022/11/04134700/31_426_WMAA_Early-Sunday-Morning.jpg',
    'img',
    'Edward Hopper, Early Sunday Morning, 1930. Oil on canvas',
  ],
  [
    'card',
    'https://www.wikipedia.org/wiki/Apollo_11',
    'url',
    'Apollo 11 article on wikipedia.com',
  ],
  [
    'card',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm',
    'video',
    'Paris lockdown video from Wikipedia Commons',
  ],
  [
    'card',
    'https://github.com/vega/vega-datasets/blob/main/data/co2-concentration.csv',
    'file',
    'C02 concentration spreadsheet from Github',
  ],
  [
    'card',
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg',
    'audio',
    'Audio file from Wikipedia commons',
  ],
  [
    'error',
    'SEGMENTATION ERROR: Failed to render the content provided. (example)',
  ],
  ['loading', ''],
  [
    'html-text',
    "<p style=\"font-family: 'Comic Sans MS', 'Comic Sans', cursive; font-size:20px; color: GoldenRod;\"> This is using a p tag, styled with Comic Sans, sized at 20px and colored in GoldenRod</p>",
  ],
  [
    'list',
    '1. Google.com (United States)\n2. YouTube.com (US)\n3. Facebook.com (US)\n4. Baidu.com (China)\n5. Wikipedia.org (US)',
    '',
    'Top sites in the United States',
  ],
  [
    'tags',
    '["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]',
    '',
    'List of famous french philosophers',
  ],
  [
    'molecule',
    '```CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO```',
    '',
    'Smiles representation of Cephalostatin-1 from PubChem',
  ],
  [
    'molecule',
    '```C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N```',
    '',
    'Smiles representation of Thyroxine from PubChem',
  ],
  [
    'diagram',
    `sequenceDiagram
    participant web as Web Browser
    participant blog as Blog Service
    participant account as Account Service
    participant mail as Mail Service
    participant db as Storage

    Note over web,db: The user must be logged in to submit blog posts
    web->>+account: Logs in using credentials
    account->>db: Query stored accounts
    db->>account: Respond with query result

    alt Credentials not found
        account->>web: Invalid credentials
    else Credentials found
        account->>-web: Successfully logged in

        Note over web,db: When the user is authenticated, they can now submit new posts
        web->>+blog: Submit new post
        blog->>db: Store post data

        par Notifications
            blog--)mail: Send mail to blog subscribers
            blog--)db: Store in-site notifications
        and Response
            blog-->>-web: Successfully posted
        end
    end`,
    '',
    'Architecture Diagram example',
  ],
  [
    'chart',
    '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}',
    '',
    'Scatter plot example from vega-lite',
  ],
  [
    'chart',
    '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}',
    '',
    'Scatter plot example from vega-lite',
  ],
  [
    'chart',
    '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}',
    '',
    'Stream graph example from vega-lite',
  ],
  [
    'chart',
    '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}',
    '',
    'Map example from vega-lite',
  ],
];

const slugText = `
<p style="margin-top: 0.75rem;">AI Explained</p>
<p style="margin-top: 0.5rem; margin-bottom:0.75rem; font-size:1.5rem; font-weight:600;">IBM Cloud example text</p>
<p style="margin-top: 0.75rem;">
The AI assistant is designed as a retrieval-augmented generation (RAG) that is running against IBM© large language models
</p>
<hr>
<p style="margin-bottom:0px;">How it works</p>
<ul style="list-style: none;list-style-type: decimal; padding-left:1rem;margin-top:0px">
  <li style="list-style-type: decimal;"><strong>Globalize</strong>. You can ask your questions and get an answer in any of the 10 languages supported by IBM Cloud</li>
  <li style="list-style-type: decimal;"><strong>Query</strong>. The IBM Cloud docs are searched to find topics with facts about your question</li>
  <li style="list-style-type: decimal;"><strong>Generate</strong>. Answers are generated ground in the IBM Cloud Docs</li>
  <li style="list-style-type: decimal;"><strong>Verify</strong>. With each question you ask, source citations from the IBM Cloud docs are provided to verify responses</li>
</ul>
<hr>
 <p style="margin-bottom:0px;">AI model</p>
<a style="text-decoration:none;color:#4589ff;" target="_blank" href="https://www.google.com">granite.13.chat.v2</a>`;

const slugContent = {
  title: 'AI explainability',
  prompt: 'IBM Cloud AI assistant',
  responsePlaceholder: 'Describe issues with this response',
  showTextArea: false,
  description:
    'The AI assistant is designed as a retrieval-augmented generation (RAG) that is running against IBM© large language models',
  showList: true,
  listTitle: 'How it works',
  listItems: [
    {
      tilte: 'Globalize',
      text: 'You can ask your questions and get an answer in any of the 10 languages supported by IBM Cloud',
    },
    {
      title: 'Query',
      text: 'The IBM Cloud docs are searched to find topics with facts about your question',
    },
    {
      title: 'Generate',
      text: 'Answers are generated ground in the IBM Cloud Docs',
    },
    {
      title: 'Verify',
      text: 'With each question you ask, sorce citations from the IBM Cloud docs are provided to verify responses',
    },
  ],
  model: { name: 'granite.13.chat.v2', url: 'https://www.google.com' },
};

const headerMenuItems = [
  { title: 'Clear history', action: 'clear-chat-history' },
  { title: 'Save history', action: 'save-chat-history' },
  { title: 'Report issue', action: 'report-issue' },
];

const feedbackFormOptions = {
  'thumbs-down': {
    title: 'Unsatisfactory Response',
    tags: [
      'Inaccurate',
      'Incomplete',
      'Missing links',
      'Privacy violations',
      'Hate speech',
    ],
    prompt: 'What was unsatisfactory about this response?',
    responsePlaceholder: 'Describe issues with this response',
    disclaimer:
      'Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.',
  },
  'thumbs-up': {
    title: 'Feedback',
    tags: ['Accurate', 'Comprehensive', 'Consice', 'Easy to Understand'],
    prompt: 'Why did you choose this rating?',
    responsePlaceholder: 'Add a comment',
    disclaimer:
      'Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed doeiusmod tempor incididunt ut fsil labore et dolore magna aliqua.',
  },
};

const customLabels = {
  'header-close-chat': 'Close',
  'header-enable-fullscreen': 'Fullscreen',
  'header-disable-fullscreen': 'Exit fullscreen',
  'header-popout-chat': 'Pop out chat',
  'header-expand-chat': 'Expand chat',
  'header-move-chat': 'Move chat',
  'header-move-chat-done': 'Set chat',
  'header-open-menu': 'Open',
  'header-close-menu': 'Close',
  'header-open-slug': 'Open',
  'header-close-slug': 'Close',
  'message-regenerate-button': 'Regenerate',
  'message-like-button': 'Like',
  'message-undo-like-button': 'Remove like',
  'message-dislike-button': 'Dislike',
  'message-undo-dislike-button': 'Remove dislike',
  'message-enable-editing': 'Edit',
  'message-undo-edit': 'Undo edit',
  'message-validate-edit': 'Validate edit',
  'feedback-submit-button': 'Submit',
  'feedback-submit-button-unavailable': 'Submit unavailable',
  'feedback-close': 'Close',
  'link-list-view-all-button': 'View all',
  'link-list-collapse-button': 'Collapse list',
  'link-list-reference-title': 'References',
  'code-copypaste-button': 'Copy code',
  'code-copypaste-success': 'Copied!',
  'prompt-start-listening': 'Start listening',
  'prompt-stop-listening': 'Stop listening',
  'prompt-microphone-unavailable': 'Microphone unavailable',
  'prompt-loading-state-placeholder': 'Thinking...',
  'prompt-entry-placeholder': 'Type something...',
  'prompt-send-button': 'Send response',
  'prompt-send-blocked-button': 'Send unavailable',
  'prompt-cancel-button': 'Cancel request',
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
        .headerMenuItems="${headerMenuItems}"
        @on-header-menu-item-selected="${(e) => {
          console.log(e);
        }}"
        model="llama-2"
        auto-update
        .customLabels="${customLabels}"
        ai-slug-content="${slugText}"
        user-prompt="${userPrompt}"
        enable-feedback-form
        .feedbackDefinitions="${feedbackFormOptions}"
        api-url="${apiUrl}"
        feedback-url="${feedbackUrl}"
        temperature="${temperature || 0.2}"
        user-name="Sherlock"
        agent-name="Dr Watson">
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
      time: '14:06',
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
      time: '14:07',
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
      <clabs-chat
        user-name="${userName}"
        agent-name="${agentName}"
        conversation="${conversation}">
        <clabs-chat-messages slot="messages" user-name="user" agent-name="bot">
          <clabs-chat-message
            slot="message-items"
            origin="user"
            user-submitted
            time-stamp="9:02"
            index="0">
            <clabs-chat-text
              slot="message-item-content"
              content="Showcase every type of Element available in this Chat component.">
            </clabs-chat-text>
          </clabs-chat-message>

          <clabs-chat-message
            slot="message-items"
            origin="bot"
            time-stamp="9:04"
            index="1">
            <clabs-chat-text
              slot="message-item-content"
              content="This is a textElement, displays text following Carbon design guidelines."></clabs-chat-text>
            <clabs-chat-text
              slot="message-item-content"
              enable-html-rendering
              content="TextElement can also render simple HTML as such:
 <h2>This is using a h2 tag</h2>
"></clabs-chat-text>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also specify a simple slotted div with any content: (Youtube embed example)
"></clabs-chat-text>
            <div slot="message-item-content">
              <iframe
                width="256"
                height="256"
                src="https://www.youtube.com/embed/oSCX78-8-q0?si=kCcIHjehhVn-4PSO"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen></iframe>
            </div>

            <clabs-chat-text
              slot="message-item-content"
              content="You can also show files, tables, code, action buttons or lists:"></clabs-chat-text>
            <clabs-chat-card
              slot="message-item-content"
              type="file"
              content="https://arxiv.org/pdf/2312.05688.pdf"></clabs-chat-card>
            <clabs-chat-table
              slot="message-item-content"
              content="Name,Age,Occupation,Location,State
Jerry,35,Comedian,Upper east side,NY
George,35,Unemployed,Queens,NY
Elaine,32,Publisher,Midtown,NY
Kramer,36,Unknown,Upper east side,NY"></clabs-chat-table>

            <clabs-chat-code
              slot="message-item-content"
              content="from math import sqrt
#prime function to check given number prime or not:
def Prime(number,itr):
	#base condition
	if itr == 1:
		return True
	#if given number divided by itr or not
	if number % itr == 0:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		return False
	return True
"></clabs-chat-code>

            <clabs-chat-tag-list
              slot="message-item-content"
              content='["Simone de Beauvoir","René Descartes","Jean-Paul Sartre","Voltaire","Michel Foucault","Albert Camus"]'></clabs-chat-tag-list>

            <clabs-chat-list
              slot="message-item-content"
              content="1. Google.com (United States)
2. YouTube.com (US)
3. Facebook.com (US)
4. Baidu.com (China)
5. Wikipedia.org (US)"></clabs-chat-list>
            <clabs-chat-text
              slot="message-item-content"
              content="And finally any chart you wish!"></clabs-chat-text>

            <clabs-chat-chart
              container-height="400px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="600px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="200px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="350px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'></clabs-chat-chart>
            <clabs-chat-chart
              container-height="250px"
              slot="message-item-content"
              content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}'></clabs-chat-chart>
          </clabs-chat-message>
        </clabs-chat-messages>
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
  ShowAll:
    'user:Show me examples for the following components in this chat: ' +
    coreExamples.map((item) => item[0]).join(', ') +
    '\nbot:' +
    coreExamples.reduce((acc, item, index) => {
      if (
        item[2] === 'highlight-text' ||
        item[0] === 'error' ||
        item[0] === 'loading' ||
        item[0] === 'file-upload'
      ) {
        return acc;
      }
      acc +=
        '<b>' +
        (index + 1) +
        '.</b> Here is a <b>&lt;clabs-chat-' +
        item[0] +
        '&gt;</b> element' +
        (item[2] ? ' of type <i><b>' + item[2] + '</b></i>' : '') +
        ':<br/> ' +
        (item[3]
          ? '<span style="font-size:12px;font-style:italic;">' +
            item[3] +
            '</span>\n'
          : '\n') +
        item[1] +
        '\n';
      return acc;
    }, ''),
  RandAll:
    'user:Show me random examples for all components in this chat\nbot:' +
    coreExamples
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .reduce((acc, item, index) => {
        if (
          item[2] === 'highlight-text' ||
          item[0] === 'error' ||
          item[0] === 'loading' ||
          item[0] === 'file-upload'
        ) {
          return acc;
        }
        acc +=
          '<b>' +
          (index + 1) +
          '.</b> Here is a <b>&lt;clabs-chat-' +
          item[0] +
          '&gt;</b> element' +
          (item[2] ? ' of type <i><b>' + item[2] + '</b></i>' : '') +
          ':<br/> ' +
          (item[3]
            ? '<span style="font-size:12px;font-style:italic;">' +
              item[3] +
              '</span>\n'
            : '\n') +
          item[1] +
          '\n';
        return acc;
      }, ''),
  Formulas:
    "user:Give me a dozen math formulas as latex strings:\nbot:Cauchy-Schwarz Inequality\n \\(\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq    \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)\\)\n Maxwell's Equations\n \\(\\begin{align}    \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\    \\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\    \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\    \\nabla \\cdot \\vec{\\mathbf{B}} & = 0    \\end{align}\\)\n Rogers-Ramanujan Identity\n \\(1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =    \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},     \\quad\\quad \\text{for $|q| < 1$}.\\)\n Cross Product Formula\n \\(\\mathbf{V}_1 \\times \\mathbf{V}_2 =    \\begin{vmatrix}     \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\     \\frac{\\partial X}{\\partial u} & \\frac{\\partial Y}{\\partial u} & 0 \\     \\frac{\\partial X}{\\partial v} & \\frac{\\partial Y}{\\partial v} & 0 \\    \\end{vmatrix}\\)\n String Theory Action\n \\( S = -\\frac{1}{2}\\int d^2\\sigma \\sqrt{-h} h^{ab}\\partial_a X^\\mu \\partial_b X^\\mu \\\\ \\frac{1}{4 \\pi \\alpha'} \\int d^2\\sigma \\sqrt{-h} \\left( h^{ab} \\partial_a X^\\mu \\partial_b X_\\mu + \\alpha' R \\Phi(X) \\right  \\\\ [\\alpha_m^\\mu, \\alpha_n^\\nu] = m \\delta_{m+n,0} \\eta^{\\mu \\nu}  \\)\n Custom: Tex stress test\n \\(\\begin{align}    \\int_{0}^{\\infty} e^{-x^2} \\, dx & = \\frac{\\sqrt{\\pi}}{2} \\\\    \\sum_{n=1}^{\\infty} \\frac{1}{n^2} & = \\frac{\\pi^2}{6} \\\\    \\mathbf{A} \\mathbf{x} & = \\left[ \\begin{array}{ccc}        a_{11} & a_{12} & a_{13} \\\\        a_{21} & a_{22} & a_{23} \\\\        a_{31} & a_{32} & a_{33}    \\end{array} \\right]     \\left[ \\begin{array}{c}        x_1 \\\\        x_2 \\\\        x_3    \\end{array} \\right] \\\\    e^{i \\pi} + 1 & = 0 \\\\    \\lim_{x \\to 0} \\frac{\\sin x}{x} & = 1 \\\\    \\left( \\sum_{k=1}^n a_k b_k \\right)^2 & \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right) \\\\    \\begin{bmatrix}        1 & 2 & 3 \\\\        4 & 5 & 6 \\\\        7 & 8 & 9    \\end{bmatrix}    \\begin{bmatrix}        x \\\\        y \\\\        z    \\end{bmatrix} & =     \\begin{bmatrix}        1 \\cdot x + 2 \\cdot y + 3 \\cdot z \\\\        4 \\cdot x + 5 \\cdot y + 6 \\cdot z \\\\        7 \\cdot x + 8 \\cdot y + 9 \\cdot z    \\end{bmatrix} \\\\    \\frac{d}{dx} \\left( \\frac{1}{x} \\right) & = -\\frac{1}{x^2}\\end{align}\\)\nHow else can I help you today?",
  'List of flowers':
    'user:Can you give me a list of flower images?\n\nbot:Of course, here is a list of flowers:\nCosmos:\nhttps://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg\nDahlia:\nhttps://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg\nZinnia:\nhttps://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg\nChrysanthemum:\nhttps://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg\nCelosia:\nhttps://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg\nSun flower:\nhttps://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg\nSnapdragon:\nhttps://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg\nStrawflower:\nhttps://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg\nSource:\nhttps://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
  'Chessboard in HTML/CSS':
    'user:How do I make a Chessboard in HTML/CSS ?\n\nbot:You can make a chessboard in HTML/CSS by using a table element and applying CSS styling to it. Here is an example of how you can create a chessboard using these methods:\n \nHTML:\n```html\n<table>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t\t<td class="white"></td>\n\t\t\t<td class="black"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n```\nCSS:\n```css\ntable {\n\tborder-collapse: collapse;\n}\n \ntd {\n\twidth: 50px;\n\theight: 50px;\n}\n \n.black {\n\tbackground-color: #000;\n}\n \n.white {\n\tbackground-color: #fff;\n}\n```\nThis will create a table with 8 rows and 8 columns, with each cell alternating between black and white. You can adjust the width and height of the cells as needed.\n \nNote: The `border-collapse: collapse;` property is used to remove the spacing between the table cells.',
  'Plain text':
    "user:Give me the abstract to the IBM Wikipedia article\n\nbot:International Business Machines Corporation (using the trademark IBM), nicknamed Big Blue, is an American multinational technology company headquartered in Armonk, New York and present in over 175 countries. IBM is the largest industrial research organization in the world, with 19 research facilities across a dozen countries, having held the record for most annual U.S. patents generated by a business for 29 consecutive years from 1993 to 2021.\nIBM was founded in 1911 as the Computing-Tabulating-Recording Company (CTR), a holding company of manufacturers of record-keeping and measuring systems. It was renamed International Business Machines in 1924 and soon became the leading manufacturer of punch-card tabulating systems. During the 1960s and 1970s, the IBM mainframe, exemplified by the System/360, was the world's dominant computing platform, with the company producing 80 percent of computers in the U.S. and 70 percent of computers worldwide.\nIBM entered the microcomputer market in the 1980s with the IBM Personal Computer, which soon became known as PC, one of IBM's best selling products. Due to a lack of foresight by IBM, the PC was not well protected by intellectual property laws. As a consequence, IBM quickly began losing its market dominance to emerging competitors in the PC market, while at the same time the openness of the PC platform has ensured PC's longevity as the most popular microcomputer standard.\nBeginning in the 1990s, the company began downsizing its operations and divesting from commodity production, most notably selling its personal computer division to the Lenovo Group in 2005. IBM has since concentrated on computer services, software, supercomputers, and scientific research. Since 2000, its supercomputers have consistently ranked among the most powerful in the world, and in 2001 it became the first company to generate more than 3,000 patents in one year, beating this record in 2008 with over 4,000 patents. As of 2022, the company held 150,000 patents.\nAs one of the world's oldest and largest technology companies, IBM has been responsible for several technological innovations, including the automated teller machine (ATM), dynamic random-access memory (DRAM), the floppy disk, the hard disk drive, the magnetic stripe card, the relational database, the SQL programming language, and the UPC barcode. The company has made inroads in advanced computer chips, quantum computing, artificial intelligence, and data infrastructure. IBM employees and alumni have won various recognitions for their scientific research and inventions, including six Nobel Prizes and six Turing Awards.\nIBM is a publicly traded company and one of 30 companies in the Dow Jones Industrial Average. It is among the world's largest employers, with over 297,900 employees worldwide in 2022. Despite its relative decline within the technology sector, IBM remains the seventh largest technology company by revenue, and 67th largest overall company by revenue in the United States. It is also consistently ranked among the world's most recognizable, valuable, and admired brands.\n Source:\nhttps://en.wikipedia.org/wiki/IBM",
  'Annotated text':
    'user:Who is Abraham Lincoln? Add wikipedia links please.\nbot:Abraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.\n Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).\nLincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).\n He was self-educated and became a lawyer, Whig Party leader, Illinois state legislator, and U.S. representative from Illinois. In 1849, he returned to his successful law practice in Springfield, Illinois.\n',
  'Moon landing':
    "user:I'd like to learn about the Apollo 11 moon landing, please provide me a short description, a video of the event and three images.\n\nbot:Apollo 11 (July 16–24, 1969) was the American spaceflight that first landed humans on the Moon.\n Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC.\n Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing.\n Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit, and were on the Moon's surface for 21 hours, 36 minutes before lifting off to rejoin Columbia.\n Source:\n https://www.wikipedia.org/wiki/Apollo_11 \n Here is a video of the event:\nhttps://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm\n And here are three images from the article cited:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/520px-Aldrin_Apollo_11_original.jpg\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Apollo_11_insignia.png/360px-Apollo_11_insignia.png\n https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Apollo_11_Crew.jpg/440px-Apollo_11_Crew.jpg\n What else can I help you with?",
  'Python code with images':
    "user:Give me a function in python to find if a number is prime, then show me two Ulam spirals and annotate them.\n\nbot:Certainly, here's how to check if a number is prime in Python:\n```from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n```Source:\nhttps://www.geeksforgeeks.org/python-program-to-check-whether-a-number-is-prime-or-not/\nAnd here some sample images using Prime numbers to display Ulam Spirals taken from Wikipedia:\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ulam_spiral_10x.png/402px-Ulam_spiral_10x.png\nUlam spiral of size 201×201. Black dots represent prime numbers. Diagonal, vertical, and horizontal lines with a high density of prime numbers are clearly visible.\nhttps://upload.wikimedia.org/wikipedia/commons/e/e0/Randomly_black_odd_numbers.png\nFor comparison, a spiral with random odd numbers colored black (at the same density of primes in a 200x200 spiral).\n\nWhat else may I do for you?",
  'Showcase 2':
    'user:Explain to me how your streaming capabilities work, then give me an example of every component you have available.\nbot:<h4>Methodology:</h4>\n data is sent in token by token into the Chat. With each token, the stream is automatically parsed. Blocks are detected depending on a variety of LLM conventions to denote in order:\n1. Text blocks with link/annotation markdowns\n2. Text blocks containing html components\n3. Code blocks delimited by a custom delimiter\n4. JSON objects displayed as code\n5. Unless they contain $schema then recategorized as charts\n6. Array elements containing text or URLs\n7. CSV table objects with predefined newline/seperator strings\n8. List elements starting with - * or numbered lists (such as this)\n9. Molecules defined by a SMILES string\n10.URLs of any kind, classified as files/videos/urls/images post-hoc\n<h4>Here is a simple piece using the Code component:</h4>\n```$ npm install --save carbon-components```\n<h4>Here is text using annotations:</h4>\nAbraham Lincoln was an American lawyer, politician, and statesman who served as the 16th [president of the United States](https://en.wikipedia.org/wiki/President_of_the_United_States) from 1861 until his [assassination](https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln) in 1865.\n Lincoln led the United States through the [American Civil War](https://en.wikipedia.org/wiki/American_Civil_War), defending the nation as a constitutional [union](https://en.wikipedia.org/wiki/Union_(American_Civil_War)), defeating the insurgent [Confederacy](https://en.wikipedia.org/wiki/Confederate_States_of_America), playing a major role in the [abolition of slavery](https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States), expanding the power of the [federal government](https://en.wikipedia.org/wiki/Federal_government_of_the_United_States), and modernizing the [U.S. economy](https://en.wikipedia.org/wiki/Economy_of_the_United_States).\nLincoln was born into poverty in a [log cabin](https://en.wikipedia.org/wiki/Log_cabin) in [Kentucky](https://en.wikipedia.org/wiki/Kentucky) and was raised on the [frontier](https://en.wikipedia.org/wiki/American_frontier), mainly in [Indiana](https://en.wikipedia.org/wiki/Indiana).\n<b<Here is text multiple annotations:</h4>\nHere are [all links available in this article](https://en.wikipedia.org/wiki/President_of_the_United_States,https://en.wikipedia.org/wiki/Assassination_of_Abraham_Lincoln,https://en.wikipedia.org/wiki/American_Civil_War,https://en.wikipedia.org/wiki/Confederate_States_of_America,https://en.wikipedia.org/wiki/Abolitionism_in_the_United_States,https://en.wikipedia.org/wiki/Federal_government_of_the_United_States,https://en.wikipedia.org/wiki/Log_cabin,https://en.wikipedia.org/wiki/Kentucky,https://en.wikipedia.org/wiki/American_frontier,https://en.wikipedia.org/wiki/Indiana)\n<h4>Here is an element of type "img" using the Image element (Picture of a Dahlia from bougs.com):</h4>\nhttps://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg\n<h4>Here are Card elements of type "url" and "video":</h4>\nhttps://en.wikipedia.org/wiki/Fireworks\nhttps://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm\nImage Carousel example:\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]\n<h4>File Carousel example:</h4>\n["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]\n<h4>Video Carousel example:</h4>\n["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]\n<h4>Audio Carousel example:</h4>\n["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]\n<h4>URL example:</h4>\n["https://www.wikipedia.org","https://www.ibm.com","https://www.google.com","https://www.reddit.com","https://www.github.com","https://www.arxiv.org","https://www.archive.org","https://www.instagram.com"]\nCephalostatin-1 in a SMILES format using the molecule component:\nCC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO\n<h4>Code example:</h4>\n````/**\n * Copyright IBM Corp. 2016, 2023\n * This source code is licensed under the Apache-2.0 license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\nimport React from "react";\nimport { DataTable } from "..";\nconst {\n\tTable,\n\tTableBody,\n\tTableCell,\n\tTableContainer,\n\tTableHead,\n\tTableHeader,\n\tTableRow\n} = DataTable;\nimport mdx from "../DataTable.mdx";\nimport "./datatable-story.scss";\nexport default {\n\ttitle: "Components/DataTable/Basic",\n\tcomponent: DataTable,\n\tsubcomponents: {\n\t\tTableContainer,\n\t\tTable,\n\t\tTableHead,\n\t\tTableRow,\n\t\tTableHeader,\n\t\tTableBody,\n\t\tTableCell\n\t},\n\tparameters: {\n\t\tdocs: {\n\t\t\tpage: mdx\n\t\t}\n\t}\n};\nexport const Default = () => {\n\tconst rows = [{\n\t\tid: "load-balancer-1",\n\t\tname: "Load Balancer 1",\n\t\trule: "Round robin",\n\t\tStatus: "Starting",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-2",\n\t\tname: "Load Balancer 2",\n\t\trule: "DNS delegation",\n\t\tstatus: "Active",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-3",\n\t\tname: "Load Balancer 3",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-4",\n\t\tname: "Load Balancer 4",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-5",\n\t\tname: "Load Balancer 5",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-6",\n\t\tname: "Load Balancer 6",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-7",\n\t\tname: "Load Balancer 7",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}];\n\tconst headers = ["Name", "Rule", "Status", "Other", "Example"];\n\treturn <Table size="lg" useZebraStyles={false} aria-label="sample table">\n\t\t\t<TableHead>\n\t\t\t\t<TableRow>\n\t\t\t\t\t{headers.map(header => <TableHeader id={header.key} key={header}>\n\t\t\t\t\t\t\t{header}\n\t\t\t\t\t\t</TableHeader>)}\n\t\t\t\t</TableRow>\n\t\t\t</TableHead>\n\t\t\t<TableBody>\n\t\t\t\t{rows.map(row => <TableRow key={row.id}>\n\t\t\t\t\t\t{Object.keys(row).filter(key => key !== "id").map(key => {\n\t\t\t\t\treturn <TableCell key={key}>{row[key]}</TableCell>;\n\t\t\t\t})}\n\t\t\t\t\t</TableRow>)}\n\t\t\t</TableBody>\n\t\t</Table>;```\n<h4>Chart component with US map of unemployment:</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}\nHeatmap Chart:\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}\n<h4>Bubble Plot chart:</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}\n<h4>Table example:</h4>\nName,Age,Occupation,Location,State\nJerry,35,Comedian,Upper east side,NY\nGeorge,35,Unemployed,Queens,NY\nElaine,32,Publisher,Midtown,NY\nKramer,36,Unknown,Upper east side,NY\nWhat else would you like to see?',
  Molecules:
    'user:Show me 5 molecules and their SMILES string representation:\nbot:Of course, here are the SMILES representations of each item you requested using the MolecularElement Component:\n<b>Bergenin</b>\n```OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2```\n<b>custom</b>\n```OC(C(=O)O[C@H]1C[N+]2(CCC0C3=CC=CC=C3)CCC1CC2)(C1=CC=CS1)C1=CC=CS1```\n<b>Cephalostatin-1</b>\n```CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO```\n<b>Acetate</b>\n```CC(=O)[O-]```\n<b>Benzene (C6H6)</b>\n```C1=CC=CC=C1```\n<b>5-amino-4-methylpentanamide</b>\n```CC(CCC(=O)N)CN```\n<b>Bromobenzene</b>\n```C1=CC=C(C=C1)Br```\n<b>Caffeine</b>\n```CN1C=NC2=C1C(=O)N(C(=O)N2C)C```\n<b>Thyroxine</b>\n```C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N```\n<b>Cholesterol</b>\n```CC(C)CCCC(C)C1CCC2C1(CCCC2=CC=C3CC4CC(CC(C4)O)C(O)C3(C)C)C```\n<b>Chlorine</b>\n```CCC1=C(C2=NC1=CC3=C(C4=C(C(C(=C4[N-]3)C5=NC(=CC6=NC(=C2)C(=C6C)C=C)C(C5CCC(=O)OCC=C(C)CCCC(C)CCCC(C)CCCC(C)C)C)C(=O)OC)[O-])C)C.[Mg+2]```\n<b>Paclitaxel (Taxol)</b>\n```CC1=C2C(C(=O)C3(C(CC4C(C3C(C(C2(C)C)(CC1OC(=O)C(C(C5=CC=CC=C5)NC(=O)C6=CC=CC=C6)O)O)OC(=O)C7=CC=CC=C7)(CO4)OC(=O)C)O)C)OC(=O)C```\n<b>ATP (Adenosine Triphosphate)</b>\n```C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N.C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N```\n<b>Cyclosporine</b>\n```CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C```\n<b>Vitamin B12</b>\n```CC1=CC2=C(C=C1C)N(C=N2)C3C(C(C(O3)CO)OP(=O)([O-])OC(C)CNC(=O)CCC4(C(C5C6(C(C(C(=C(C7=NC(=CC8=NC(=C(C4=N5)C)C(C8(C)C)CCC(=O)N)C(C7(C)CC(=O)N)CCC(=O)N)C)[N-]6)CCC(=O)N)(C)CC(=O)N)C)CC(=O)N)C)O.[C-]#N.[Co+3]```\n<b>Insulin</b>\n```CCC(C)C1C(=O)NC2CSSCC(C(=O)NC(CSSCC(C(=O)NCC(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(CSSCC(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)NC(CC(=O)N)C(=O)O)C(=O)NCC(=O)NC(CCC(=O)O)C(=O)NC(CCCNC(=N)N)C(=O)NCC(=O)NC(CC5=CC=CC=C5)C(=O)NC(CC6=CC=CC=C6)C(=O)NC(CC7=CC=C(C=C7)O)C(=O)NC(C(C)O)C(=O)N8CCCC8C(=O)NC(CCCCN)C(=O)NC(C(C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)C(CC(C)C)NC(=O)C(CC2=CNC=N2)NC(=O)C(CCC(=O)N)NC(=O)C(C(=O)N)NC(=O)C(C(C)C)NC(=O)C(CC2=CC=CC=C2)N)C(=O)NC(C(=O)NC(C(=O)N1)CO)C(C)O)NC(=O)C(CCC(=O)N)NC(=O)C(CCC(=O)O)NC(=O)C(C(C)C)NC(=O)C(C(C)CC)NC(=O)CN```\n',
  Charts:
    'user:Show me charts!\nbot:<h4>Box Plot</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}\n<h4>Map</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}\n<h4>Bar Chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}\n<h4>Horizontal Multi Bar Chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}\n<h4>Pie Chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}\n<h4>Donut Chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}\n<h4>Heatmap</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}\n<h4>Scatter Plot</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}\n<h4>Bubble Plot</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}\n<h4>Multi-series line chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Stock prices of 5 Tech Companies over Time.","data":{"url":"https://vega.github.io/vega-lite/examples/data/stocks.csv"},"mark":"line","encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"},"color":{"field":"symbol","type":"nominal"}}}\n<h4>Candle stick chart</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#06982d"},"value":"#ae1325"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}\n<h4>Orthographic world map</h4>\n{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}\n<h4>Stream Graph</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":300,"height":200,"data":{"url":"https://vega.github.io/vega-lite/data/unemployment-across-industries.json"},"mark":"area","encoding":{"x":{"timeUnit":"yearmonth","field":"date","axis":{"domain":false,"format":"%Y","tickSize":0}},"y":{"aggregate":"sum","field":"count","axis":null,"stack":"center"},"color":{"field":"series","scale":{"scheme":"category20b"}}}}\n<h4>Multi histogram</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}\n<h4>Interactive multi-scatter plot</h4>\n{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}\n',
  'Table Test':
    'user:Give two 10x6 tables with random data\nbot:Table 1:\na,b,c,d,e,f,g,h,i,j\n1,2,3,4,5,6,7,8,9,10\n11,12,13,14,15,16,17,18,19,20\n21,22,23,24,25,26,27,28,29\n30,31,32,33,34,35,36,37,38,39\n40,41,42,43,44,45,46,47,48,49\n50,51,52,53,54,55,56,57,58,59\nCars.csv:\nName,Miles_per_Gallon,Cylinders,Displacement,Horsepower,Weight_in_lbs,Acceleration,Year,Origin\nchevrolet_chevelle_malibu,18,8,307,130,3504,12,1970-01-01,USA\nbuick_skylark_320,15,8,350,165,3693,11.5,1970-01-01,USA\nplymouth satellite,18,8,318,150,3436,11,1970-01-01,USA\namc rebel sst,16,8,304,150,3433,12,1970-01-01,USA\nford torino,17,8,302,140,3449,10.5,1970-01-01,USA\nford galaxie 500,15,8,429,198,4341,10,1970-01-01,USA\nchevrolet impala,14,8,454,220,4354,9,1970-01-01,USA\nplymouth fury iii,14,8,440,215,4312,8.5,1970-01-01,USA\npontiac catalina,14,8,455,225,4425,10,1970-01-01,USA\namc ambassador dpl,15,8,390,190,3850,8.5,1970-01-01,USA\ncitroen ds-21 pallas,null,4,133,115,3090,17.5,1970-01-01,Europe\nchevrolet chevelle concours (sw),null,8,350,165,4142,11.5,1970-01-01,USA\nford torino (sw),null,8,351,153,4034,11,1970-01-01,USA\nplymouth satellite (sw),null,8,383,175,4166,10.5,1970-01-01,USA\namc rebel sst (sw),null,8,360,175,3850,11,1970-01-01,USA\ndodge challenger se,15,8,383,170,3563,10,1970-01-01,USA\nplymouth cuda 340,14,8,340,160,3609,8,1970-01-01,USA\nford mustang boss 302,null,8,302,140,3353,8,1970-01-01,USA\nchevrolet monte carlo,15,8,400,150,3761,9.5,1970-01-01,USA\nbuick estate wagon (sw),14,8,455,225,3086,10,1970-01-01,USA\ntoyota corona mark ii,24,4,113,95,2372,15,1970-01-01,Japan\nplymouth duster,22,6,198,95,2833,15.5,1970-01-01,USA\namc hornet,18,6,199,97,2774,15.5,1970-01-01,USA\nford maverick,21,6,200,85,2587,16,1970-01-01,USA\ndatsun pl510,27,4,97,88,2130,14.5,1970-01-01,Japan\nvolkswagen 1131 deluxe sedan,26,4,97,46,1835,20.5,1970-01-01,Europe\npeugeot 504,25,4,110,87,2672,17.5,1970-01-01,Europe\naudi 100 ls,24,4,107,90,2430,14.5,1970-01-01,Europe\nsaab 99e,25,4,104,95,2375,17.5,1970-01-01,Europe\nbmw 2002,26,4,121,113,2234,12.5,1970-01-01,Europe\namc gremlin,21,6,199,90,2648,15,1970-01-01,USA\nford f250,10,8,360,215,4615,14,1970-01-01,USA\nchevy c20,10,8,307,200,4376,15,1970-01-01,USA\ndodge d200,11,8,318,210,4382,13.5,1970-01-01,USA\nhi 1200d,9,8,304,193,4732,18.5,1970-01-01,USA\ndatsun pl510,27,4,97,88,2130,14.5,1971-01-01,Japan\nchevrolet vega 2300,28,4,140,90,2264,15.5,1971-01-01,USA\ntoyota corona,25,4,113,95,2228,14,1971-01-01,Japan\nford pinto,25,4,98,null,2046,19,1971-01-01,USA\nvolkswagen super beetle 117,null,4,97,48,1978,20,1971-01-01,Europe\namc gremlin,19,6,232,100,2634,13,1971-01-01,USA\nplymouth satellite custom,16,6,225,105,3439,15.5,1971-01-01,USA\nchevrolet chevelle malibu,17,6,250,100,3329,15.5,1971-01-01,USA\nford torino 500,19,6,250,88,3302,15.5,1971-01-01,USA\namc matador,18,6,232,100,3288,15.5,1971-01-01,USA\nchevrolet impala,14,8,350,165,4209,12,1971-01-01,USA\npontiac catalina brougham,14,8,400,175,4464,11.5,1971-01-01,USA\nford galaxie 500,14,8,351,153,4154,13.5,1971-01-01,USA\nplymouth fury iii,14,8,318,150,4096,13,1971-01-01,USA\ndodge monaco (sw),12,8,383,180,4955,11.5,1971-01-01,USA\nford country squire (sw),13,8,400,170,4746,12,1971-01-01,USA\npontiac safari (sw),13,8,400,175,5140,12,1971-01-01,USA\namc hornet sportabout (sw),18,6,258,110,2962,13.5,1971-01-01,USA\nchevrolet vega (sw),22,4,140,72,2408,19,1971-01-01,USA\npontiac firebird,19,6,250,100,3282,15,1971-01-01,USA\nford mustang,18,6,250,88,3139,14.5,1971-01-01,USA\nmercury capri 2000,23,4,122,86,2220,14,1971-01-01,USA\nopel 1900,28,4,116,90,2123,14,1971-01-01,Europe\npeugeot 304,30,4,79,70,2074,19.5,1971-01-01,Europe\nfiat 124b,30,4,88,76,2065,14.5,1971-01-01,Europe\ntoyota corolla 1200,31,4,71,65,1773,19,1971-01-01,Japan\ndatsun 1200,35,4,72,69,1613,18,1971-01-01,Japan\nvolkswagen model 111,27,4,97,60,1834,19,1971-01-01,Europe\nplymouth cricket,26,4,91,70,1955,20.5,1971-01-01,USA\ntoyota corona hardtop,24,4,113,95,2278,15.5,1972-01-01,Japan\ndodge colt hardtop,25,4,97.5,80,2126,17,1972-01-01,USA\nvolkswagen type 3,23,4,97,54,2254,23.5,1972-01-01,Europe\nchevrolet vega,20,4,140,90,2408,19.5,1972-01-01,USA\nford pinto runabout,21,4,122,86,2226,16.5,1972-01-01,USA\nchevrolet impala,13,8,350,165,4274,12,1972-01-01,USA\npontiac catalina,14,8,400,175,4385,12,1972-01-01,USA\nplymouth fury iii,15,8,318,150,4135,13.5,1972-01-01,USA\nford galaxie 500,14,8,351,153,4129,13,1972-01-01,USA\namc ambassador sst,17,8,304,150,3672,11.5,1972-01-01,USA\nmercury marquis,11,8,429,208,4633,11,1972-01-01,USA\nbuick lesabre custom,13,8,350,155,4502,13.5,1972-01-01,USA\noldsmobile delta 88 royale,12,8,350,160,4456,13.5,1972-01-01,USA\nchrysler newport royal,13,8,400,190,4422,12.5,1972-01-01,USA\nmazda rx2 coupe,19,3,70,97,2330,13.5,1972-01-01,Japan\namc matador (sw),15,8,304,150,3892,12.5,1972-01-01,USA\nchevrolet chevelle concours (sw),13,8,307,130,4098,14,1972-01-01,USA\nford gran torino (sw),13,8,302,140,4294,16,1972-01-01,USA\nplymouth satellite custom (sw),14,8,318,150,4077,14,1972-01-01,USA\nvolvo 145e (sw),18,4,121,112,2933,14.5,1972-01-01,Europe\nvolkswagen 411 (sw),22,4,121,76,2511,18,1972-01-01,Europe\npeugeot 504 (sw),21,4,120,87,2979,19.5,1972-01-01,Europe\nrenault 12 (sw),26,4,96,69,2189,18,1972-01-01,Europe\nford pinto (sw),22,4,122,86,2395,16,1972-01-01,USA\ndatsun 510 (sw),28,4,97,92,2288,17,1972-01-01,Japan\ntoyouta corona mark ii (sw),23,4,120,97,2506,14.5,1972-01-01,Japan\ndodge colt (sw),28,4,98,80,2164,15,1972-01-01,USA\ntoyota corolla 1600 (sw),27,4,97,88,2100,16.5,1972-01-01,Japan\nbuick century 350,13,8,350,175,4100,13,1973-01-01,USA\namc matador,14,8,304,150,3672,11.5,1973-01-01,USA\nchevrolet malibu,13,8,350,145,3988,13,1973-01-01,USA\nford gran torino,14,8,302,137,4042,14.5,1973-01-01,USA\ndodge coronet custom,15,8,318,150,3777,12.5,1973-01-01,USA\nmercury marquis brougham,12,8,429,198,4952,11.5,1973-01-01,USA\nchevrolet caprice classic,13,8,400,150,4464,12,1973-01-01,USA\nford ltd,13,8,351,158,4363,13,1973-01-01,USA\nplymouth fury gran sedan,14,8,318,150,4237,14.5,1973-01-01,USA\nchrysler new yorker brougham,13,8,440,215,4735,11,1973-01-01,USA\nbuick electra 225 custom,12,8,455,225,4951,11,1973-01-01,USA\namc ambassador brougham,13,8,360,175,3821,11,1973-01-01,USA\nplymouth valiant,18,6,225,105,3121,16.5,1973-01-01,USA\nchevrolet nova custom,16,6,250,100,3278,18,1973-01-01,USA\namc hornet,18,6,232,100,2945,16,1973-01-01,USA\nford maverick,18,6,250,88,3021,16.5,1973-01-01,USA\nplymouth duster,23,6,198,95,2904,16,1973-01-01,USA\nvolkswagen super beetle,26,4,97,46,1950,21,1973-01-01,Europe\nchevrolet impala,11,8,400,150,4997,14,1973-01-01,USA\nford country,12,8,400,167,4906,12.5,1973-01-01,USA\nplymouth custom suburb,13,8,360,170,4654,13,1973-01-01,USA\noldsmobile vista cruiser,12,8,350,180,4499,12.5,1973-01-01,USA\namc gremlin,18,6,232,100,2789,15,1973-01-01,USA\ntoyota carina,20,4,97,88,2279,19,1973-01-01,Japan\nchevrolet vega,21,4,140,72,2401,19.5,1973-01-01,USA\ndatsun 610,22,4,108,94,2379,16.5,1973-01-01,Japan\nmaxda rx3,18,3,70,90,2124,13.5,1973-01-01,Japan\nford pinto,19,4,122,85,2310,18.5,1973-01-01,USA\nmercury capri v6,21,6,155,107,2472,14,1973-01-01,USA\nfiat 124 sport coupe,26,4,98,90,2265,15.5,1973-01-01,Europe\nchevrolet monte carlo s,15,8,350,145,4082,13,1973-01-01,USA\npontiac grand prix,16,8,400,230,4278,9.5,1973-01-01,USA\nfiat 128,29,4,68,49,1867,19.5,1973-01-01,Europe\nopel manta,24,4,116,75,2158,15.5,1973-01-01,Europe\naudi 100ls,20,4,114,91,2582,14,1973-01-01,Europe\nvolvo 144ea,19,4,121,112,2868,15.5,1973-01-01,Europe\ndodge dart custom,15,8,318,150,3399,11,1973-01-01,USA\nsaab 99le,24,4,121,110,2660,14,1973-01-01,Europe\ntoyota mark ii,20,6,156,122,2807,13.5,1973-01-01,Japan\noldsmobile omega,11,8,350,180,3664,11,1973-01-01,USA\nplymouth duster,20,6,198,95,3102,16.5,1974-01-01,USA\nford maverick,21,6,200,null,2875,17,1974-01-01,USA\namc hornet,19,6,232,100,2901,16,1974-01-01,USA\nchevrolet nova,15,6,250,100,3336,17,1974-01-01,USA\ndatsun b210,31,4,79,67,1950,19,1974-01-01,Japan\nford pinto,26,4,122,80,2451,16.5,1974-01-01,USA\ntoyota corolla 1200,32,4,71,65,1836,21,1974-01-01,Japan\nchevrolet vega,25,4,140,75,2542,17,1974-01-01,USA\nchevrolet chevelle malibu classic,16,6,250,100,3781,17,1974-01-01,USA\namc matador,16,6,258,110,3632,18,1974-01-01,USA\nplymouth satellite sebring,18,6,225,105,3613,16.5,1974-01-01,USA\nford gran torino,16,8,302,140,4141,14,1974-01-01,USA\nbuick century luxus (sw),13,8,350,150,4699,14.5,1974-01-01,USA\ndodge coronet custom (sw),14,8,318,150,4457,13.5,1974-01-01,USA\nford gran torino (sw),14,8,302,140,4638,16,1974-01-01,USA\namc matador (sw),14,8,304,150,4257,15.5,1974-01-01,USA\naudi fox,29,4,98,83,2219,16.5,1974-01-01,Europe\nvolkswagen dasher,26,4,79,67,1963,15.5,1974-01-01,Europe\nopel manta,26,4,97,78,2300,14.5,1974-01-01,Europe\ntoyota corona,31,4,76,52,1649,16.5,1974-01-01,Japan\ndatsun 710,32,4,83,61,2003,19,1974-01-01,Japan\ndodge colt,28,4,90,75,2125,14.5,1974-01-01,USA\nfiat 128,24,4,90,75,2108,15.5,1974-01-01,Europe\nfiat 124 tc,26,4,116,75,2246,14,1974-01-01,Europe\nhonda civic,24,4,120,97,2489,15,1974-01-01,Japan\nsubaru,26,4,108,93,2391,15.5,1974-01-01,Japan\nfiat x1.9,31,4,79,67,2000,16,1974-01-01,Europe\nplymouth valiant custom,19,6,225,95,3264,16,1975-01-01,USA\nchevrolet nova,18,6,250,105,3459,16,1975-01-01,USA\nmercury monarch,15,6,250,72,3432,21,1975-01-01,USA\nford maverick,15,6,250,72,3158,19.5,1975-01-01,USA\npontiac catalina,16,8,400,170,4668,11.5,1975-01-01,USA\nchevrolet bel air,15,8,350,145,4440,14,1975-01-01,USA\nplymouth grand fury,16,8,318,150,4498,14.5,1975-01-01,USA\nford ltd,14,8,351,148,4657,13.5,1975-01-01,USA\nbuick century,17,6,231,110,3907,21,1975-01-01,USA\nchevroelt chevelle malibu,16,6,250,105,3897,18.5,1975-01-01,USA\namc matador,15,6,258,110,3730,19,1975-01-01,USA\nplymouth fury,18,6,225,95,3785,19,1975-01-01,USA\nbuick skyhawk,21,6,231,110,3039,15,1975-01-01,USA\nchevrolet monza 2+2,20,8,262,110,3221,13.5,1975-01-01,USA\nford mustang ii,13,8,302,129,3169,12,1975-01-01,USA\ntoyota corolla,29,4,97,75,2171,16,1975-01-01,Japan\nford pinto,23,4,140,83,2639,17,1975-01-01,USA\namc gremlin,20,6,232,100,2914,16,1975-01-01,USA\npontiac astro,23,4,140,78,2592,18.5,1975-01-01,USA\ntoyota corona,24,4,134,96,2702,13.5,1975-01-01,Japan\nvolkswagen dasher,25,4,90,71,2223,16.5,1975-01-01,Europe\ndatsun 710,24,4,119,97,2545,17,1975-01-01,Japan\nford pinto,18,6,171,97,2984,14.5,1975-01-01,USA\nvolkswagen rabbit,29,4,90,70,1937,14,1975-01-01,Europe\namc pacer,19,6,232,90,3211,17,1975-01-01,USA\naudi 100ls,23,4,115,95,2694,15,1975-01-01,Europe\npeugeot 504,23,4,120,88,2957,17,1975-01-01,Europe\nvolvo 244dl,22,4,121,98,2945,14.5,1975-01-01,Europe\nsaab 99le,25,4,121,115,2671,13.5,1975-01-01,Europe\nhonda civic cvcc,33,4,91,53,1795,17.5,1975-01-01,Japan\nfiat 131,28,4,107,86,2464,15.5,1976-01-01,Europe\nopel 1900,25,4,116,81,2220,16.9,1976-01-01,Europe\ncapri ii,25,4,140,92,2572,14.9,1976-01-01,USA\ndodge colt,26,4,98,79,2255,17.7,1976-01-01,USA\nrenault 12tl,27,4,101,83,2202,15.3,1976-01-01,Europe\nchevrolet chevelle malibu classic,17.5,8,305,140,4215,13,1976-01-01,USA\ndodge coronet brougham,16,8,318,150,4190,13,1976-01-01,USA\namc matador,15.5,8,304,120,3962,13.9,1976-01-01,USA\nford gran torino,14.5,8,351,152,4215,12.8,1976-01-01,USA\nplymouth valiant,22,6,225,100,3233,15.4,1976-01-01,USA\nchevrolet nova,22,6,250,105,3353,14.5,1976-01-01,USA\nford maverick,24,6,200,81,3012,17.6,1976-01-01,USA\namc hornet,22.5,6,232,90,3085,17.6,1976-01-01,USA\nchevrolet chevette,29,4,85,52,2035,22.2,1976-01-01,USA\nchevrolet woody,24.5,4,98,60,2164,22.1,1976-01-01,USA\nvw rabbit,29,4,90,70,1937,14.2,1976-01-01,Europe\nhonda civic,33,4,91,53,1795,17.4,1976-01-01,Japan\ndodge aspen se,20,6,225,100,3651,17.7,1976-01-01,USA\nford granada ghia,18,6,250,78,3574,21,1976-01-01,USA\npontiac ventura sj,18.5,6,250,110,3645,16.2,1976-01-01,USA\namc pacer d/l,17.5,6,258,95,3193,17.8,1976-01-01,USA\nvolkswagen rabbit,29.5,4,97,71,1825,12.2,1976-01-01,Europe\ndatsun b-210,32,4,85,70,1990,17,1976-01-01,Japan\ntoyota corolla,28,4,97,75,2155,16.4,1976-01-01,Japan\nford pinto,26.5,4,140,72,2565,13.6,1976-01-01,USA\nvolvo 245,20,4,130,102,3150,15.7,1976-01-01,Europe\nplymouth volare premier v8,13,8,318,150,3940,13.2,1976-01-01,USA\npeugeot 504,19,4,120,88,3270,21.9,1976-01-01,Europe\ntoyota mark ii,19,6,156,108,2930,15.5,1976-01-01,Japan\nmercedes-benz 280s,16.5,6,168,120,3820,16.7,1976-01-01,Europe\ncadillac seville,16.5,8,350,180,4380,12.1,1976-01-01,USA\nchevy c10,13,8,350,145,4055,12,1976-01-01,USA\nford f108,13,8,302,130,3870,15,1976-01-01,USA\ndodge d100,13,8,318,150,3755,14,1976-01-01,USA\nhonda Accelerationord cvcc,31.5,4,98,68,2045,18.5,1977-01-01,Japan\nbuick opel isuzu deluxe,30,4,111,80,2155,14.8,1977-01-01,USA\nrenault 5 gtl,36,4,79,58,1825,18.6,1977-01-01,Europe\nplymouth arrow gs,25.5,4,122,96,2300,15.5,1977-01-01,USA\ndatsun f-10 hatchback,33.5,4,85,70,1945,16.8,1977-01-01,Japan\nchevrolet caprice classic,17.5,8,305,145,3880,12.5,1977-01-01,USA\noldsmobile cutlass supreme,17,8,260,110,4060,19,1977-01-01,USA\ndodge monaco brougham,15.5,8,318,145,4140,13.7,1977-01-01,USA\nmercury cougar brougham,15,8,302,130,4295,14.9,1977-01-01,USA\nchevrolet concours,17.5,6,250,110,3520,16.4,1977-01-01,USA\nbuick skylark,20.5,6,231,105,3425,16.9,1977-01-01,USA\nplymouth volare custom,19,6,225,100,3630,17.7,1977-01-01,USA\nford granada,18.5,6,250,98,3525,19,1977-01-01,USA\npontiac grand prix lj,16,8,400,180,4220,11.1,1977-01-01,USA\nchevrolet monte carlo landau,15.5,8,350,170,4165,11.4,1977-01-01,USA\nchrysler cordoba,15.5,8,400,190,4325,12.2,1977-01-01,USA\nford thunderbird,16,8,351,149,4335,14.5,1977-01-01,USA\nvolkswagen rabbit custom,29,4,97,78,1940,14.5,1977-01-01,Europe\npontiac sunbird coupe,24.5,4,151,88,2740,16,1977-01-01,USA\ntoyota corolla liftback,26,4,97,75,2265,18.2,1977-01-01,Japan\nford mustang ii 2+2,25.5,4,140,89,2755,15.8,1977-01-01,USA\nchevrolet chevette,30.5,4,98,63,2051,17,1977-01-01,USA\ndodge colt m/m,33.5,4,98,83,2075,15.9,1977-01-01,USA\nsubaru dl,30,4,97,67,1985,16.4,1977-01-01,Japan\nvolkswagen dasher,30.5,4,97,78,2190,14.1,1977-01-01,Europe\ndatsun 810,22,6,146,97,2815,14.5,1977-01-01,Japan\nbmw 320i,21.5,4,121,110,2600,12.8,1977-01-01,Europe\nmazda rx-4,21.5,3,80,110,2720,13.5,1977-01-01,Japan\nvolkswagen rabbit custom diesel,43.1,4,90,48,1985,21.5,1978-01-01,Europe\nford fiesta,36.1,4,98,66,1800,14.4,1978-01-01,USA\nmazda glc deluxe,32.8,4,78,52,1985,19.4,1978-01-01,Japan\ndatsun b210 gx,39.4,4,85,70,2070,18.6,1978-01-01,Japan\nhonda civic cvcc,36.1,4,91,60,1800,16.4,1978-01-01,Japan\noldsmobile cutlass salon brougham,19.9,8,260,110,3365,15.5,1978-01-01,USA\ndodge diplomat,19.4,8,318,140,3735,13.2,1978-01-01,USA\nmercury monarch ghia,20.2,8,302,139,3570,12.8,1978-01-01,USA\npontiac phoenix lj,19.2,6,231,105,3535,19.2,1978-01-01,USA\nchevrolet malibu,20.5,6,200,95,3155,18.2,1978-01-01,USA\nford fairmont (auto),20.2,6,200,85,2965,15.8,1978-01-01,USA\nford fairmont (man),25.1,4,140,88,2720,15.4,1978-01-01,USA\nplymouth volare,20.5,6,225,100,3430,17.2,1978-01-01,USA\namc concord,19.4,6,232,90,3210,17.2,1978-01-01,USA\nbuick century special,20.6,6,231,105,3380,15.8,1978-01-01,USA\nmercury zephyr,20.8,6,200,85,3070,16.7,1978-01-01,USA\ndodge aspen,18.6,6,225,110,3620,18.7,1978-01-01,USA\namc concord d/l,18.1,6,258,120,3410,15.1,1978-01-01,USA\nchevrolet monte carlo landau,19.2,8,305,145,3425,13.2,1978-01-01,USA\nbuick regal sport coupe (turbo),17.7,6,231,165,3445,13.4,1978-01-01,USA\nford futura,18.1,8,302,139,3205,11.2,1978-01-01,USA\ndodge magnum xe,17.5,8,318,140,4080,13.7,1978-01-01,USA\nchevrolet chevette,30,4,98,68,2155,16.5,1978-01-01,USA\ntoyota corona,27.5,4,134,95,2560,14.2,1978-01-01,Japan\ndatsun 510,27.2,4,119,97,2300,14.7,1978-01-01,Japan\ndodge omni,30.9,4,105,75,2230,14.5,1978-01-01,USA\ntoyota celica gt liftback,21.1,4,134,95,2515,14.8,1978-01-01,Japan\nplymouth sapporo,23.2,4,156,105,2745,16.7,1978-01-01,USA\noldsmobile starfire sx,23.8,4,151,85,2855,17.6,1978-01-01,USA\ndatsun 200-sx,23.9,4,119,97,2405,14.9,1978-01-01,Japan\naudi 5000,20.3,5,131,103,2830,15.9,1978-01-01,Europe\nvolvo 264gl,17,6,163,125,3140,13.6,1978-01-01,Europe\nsaab 99gle,21.6,4,121,115,2795,15.7,1978-01-01,Europe\npeugeot 604sl,16.2,6,163,133,3410,15.8,1978-01-01,Europe\nvolkswagen scirocco,31.5,4,89,71,1990,14.9,1978-01-01,Europe\nhonda Accelerationord lx,29.5,4,98,68,2135,16.6,1978-01-01,Japan\npontiac lemans v6,21.5,6,231,115,3245,15.4,1979-01-01,USA\nmercury zephyr 6,19.8,6,200,85,2990,18.2,1979-01-01,USA\nford fairmont 4,22.3,4,140,88,2890,17.3,1979-01-01,USA\namc concord dl 6,20.2,6,232,90,3265,18.2,1979-01-01,USA\ndodge aspen 6,20.6,6,225,110,3360,16.6,1979-01-01,USA\nchevrolet caprice classic,17,8,305,130,3840,15.4,1979-01-01,USA\nford ltd landau,17.6,8,302,129,3725,13.4,1979-01-01,USA\nmercury grand marquis,16.5,8,351,138,3955,13.2,1979-01-01,USA\ndodge st. regis,18.2,8,318,135,3830,15.2,1979-01-01,USA\nbuick estate wagon (sw),16.9,8,350,155,4360,14.9,1979-01-01,USA\nford country squire (sw),15.5,8,351,142,4054,14.3,1979-01-01,USA\nchevrolet malibu classic (sw),19.2,8,267,125,3605,15,1979-01-01,USA\nchrysler lebaron town @ country (sw),18.5,8,360,150,3940,13,1979-01-01,USA\nvw rabbit custom,31.9,4,89,71,1925,14,1979-01-01,Europe\nmaxda glc deluxe,34.1,4,86,65,1975,15.2,1979-01-01,Japan\ndodge colt hatchback custom,35.7,4,98,80,1915,14.4,1979-01-01,USA\namc spirit dl,27.4,4,121,80,2670,15,1979-01-01,USA\nmercedes benz 300d,25.4,5,183,77,3530,20.1,1979-01-01,Europe\ncadillac eldorado,23,8,350,125,3900,17.4,1979-01-01,USA\npeugeot 504,27.2,4,141,71,3190,24.8,1979-01-01,Europe\noldsmobile cutlass salon brougham,23.9,8,260,90,3420,22.2,1979-01-01,USA\nplymouth horizon,34.2,4,105,70,2200,13.2,1979-01-01,USA\nplymouth horizon tc3,34.5,4,105,70,2150,14.9,1979-01-01,USA\ndatsun 210,31.8,4,85,65,2020,19.2,1979-01-01,Japan\nfiat strada custom,37.3,4,91,69,2130,14.7,1979-01-01,Europe\nbuick skylark limited,28.4,4,151,90,2670,16,1979-01-01,USA\nchevrolet citation,28.8,6,173,115,2595,11.3,1979-01-01,USA\noldsmobile omega brougham,26.8,6,173,115,2700,12.9,1979-01-01,USA\npontiac phoenix,33.5,4,151,90,2556,13.2,1979-01-01,USA\nvw rabbit,41.5,4,98,76,2144,14.7,1980-01-01,Europe\ntoyota corolla tercel,38.1,4,89,60,1968,18.8,1980-01-01,Japan\nchevrolet chevette,32.1,4,98,70,2120,15.5,1980-01-01,USA\ndatsun 310,37.2,4,86,65,2019,16.4,1980-01-01,Japan\nchevrolet citation,28,4,151,90,2678,16.5,1980-01-01,USA\nford fairmont,26.4,4,140,88,2870,18.1,1980-01-01,USA\namc concord,24.3,4,151,90,3003,20.1,1980-01-01,USA\ndodge aspen,19.1,6,225,90,3381,18.7,1980-01-01,USA\naudi 4000,34.3,4,97,78,2188,15.8,1980-01-01,Europe\ntoyota corona liftback,29.8,4,134,90,2711,15.5,1980-01-01,Japan\nmazda 626,31.3,4,120,75,2542,17.5,1980-01-01,Japan\ndatsun 510 hatchback,37,4,119,92,2434,15,1980-01-01,Japan\ntoyota corolla,32.2,4,108,75,2265,15.2,1980-01-01,Japan\nmazda glc,46.6,4,86,65,2110,17.9,1980-01-01,Japan\ndodge colt,27.9,4,156,105,2800,14.4,1980-01-01,USA\ndatsun 210,40.8,4,85,65,2110,19.2,1980-01-01,Japan\nvw rabbit c (diesel),44.3,4,90,48,2085,21.7,1980-01-01,Europe\nvw dasher (diesel),43.4,4,90,48,2335,23.7,1980-01-01,Europe\naudi 5000s (diesel),36.4,5,121,67,2950,19.9,1980-01-01,Europe\nmercedes-benz 240d,30,4,146,67,3250,21.8,1980-01-01,Europe\nhonda civic 1500 gl,44.6,4,91,67,1850,13.8,1980-01-01,Japan\nrenault lecar deluxe,40.9,4,85,null,1835,17.3,1980-01-01,Europe\nsubaru dl,33.8,4,97,67,2145,18,1980-01-01,Japan\nvokswagen rabbit,29.8,4,89,62,1845,15.3,1980-01-01,Europe\ndatsun 280-zx,32.7,6,168,132,2910,11.4,1980-01-01,Japan\nmazda rx-7 gs,23.7,3,70,100,2420,12.5,1980-01-01,Japan\ntriumph tr7 coupe,35,4,122,88,2500,15.1,1980-01-01,Europe\nford mustang cobra,23.6,4,140,null,2905,14.3,1980-01-01,USA\nhonda Accelerationord,32.4,4,107,72,2290,17,1980-01-01,Japan\nplymouth reliant,27.2,4,135,84,2490,15.7,1982-01-01,USA\nbuick skylark,26.6,4,151,84,2635,16.4,1982-01-01,USA\ndodge aries wagon (sw),25.8,4,156,92,2620,14.4,1982-01-01,USA\nchevrolet citation,23.5,6,173,110,2725,12.6,1982-01-01,USA\nplymouth reliant,30,4,135,84,2385,12.9,1982-01-01,USA\ntoyota starlet,39.1,4,79,58,1755,16.9,1982-01-01,Japan\nplymouth champ,39,4,86,64,1875,16.4,1982-01-01,USA\nhonda civic 1300,35.1,4,81,60,1760,16.1,1982-01-01,Japan\nsubaru,32.3,4,97,67,2065,17.8,1982-01-01,Japan\ndatsun 210,37,4,85,65,1975,19.4,1982-01-01,Japan\ntoyota tercel,37.7,4,89,62,2050,17.3,1982-01-01,Japan\nmazda glc 4,34.1,4,91,68,1985,16,1982-01-01,Japan\nplymouth horizon 4,34.7,4,105,63,2215,14.9,1982-01-01,USA\nford escort 4w,34.4,4,98,65,2045,16.2,1982-01-01,USA\nford escort 2h,29.9,4,98,65,2380,20.7,1982-01-01,USA\nvolkswagen jetta,33,4,105,74,2190,14.2,1982-01-01,Europe\nrenault 18i,34.5,4,100,null,2320,15.8,1982-01-01,Europe\nhonda prelude,33.7,4,107,75,2210,14.4,1982-01-01,Japan\ntoyota corolla,32.4,4,108,75,2350,16.8,1982-01-01,Japan\ndatsun 200sx,32.9,4,119,100,2615,14.8,1982-01-01,Japan\nmazda 626,31.6,4,120,74,2635,18.3,1982-01-01,Japan\npeugeot 505s turbo diesel,28.1,4,141,80,3230,20.4,1982-01-01,Europe\nsaab 900s,null,4,121,110,2800,15.4,1982-01-01,Europe\nvolvo diesel,30.7,6,145,76,3160,19.6,1982-01-01,Europe\ntoyota cressida,25.4,6,168,116,2900,12.6,1982-01-01,Japan\ndatsun 810 maxima,24.2,6,146,120,2930,13.8,1982-01-01,Japan\nbuick century,22.4,6,231,110,3415,15.8,1982-01-01,USA\noldsmobile cutlass ls,26.6,8,350,105,3725,19,1982-01-01,USA\nford granada gl,20.2,6,200,88,3060,17.1,1982-01-01,USA\nchrysler lebaron salon,17.6,6,225,85,3465,16.6,1982-01-01,USA\nchevrolet cavalier,28,4,112,88,2605,19.6,1982-01-01,USA\nchevrolet cavalier wagon,27,4,112,88,2640,18.6,1982-01-01,USA\nchevrolet cavalier 2-door,34,4,112,88,2395,18,1982-01-01,USA\npontiac j2000 se hatchback,31,4,112,85,2575,16.2,1982-01-01,USA\ndodge aries se,29,4,135,84,2525,16,1982-01-01,USA\npontiac phoenix,27,4,151,90,2735,18,1982-01-01,USA\nford fairmont futura,24,4,140,92,2865,16.4,1982-01-01,USA\namc concord dl,23,4,151,null,3035,20.5,1982-01-01,USA\nvolkswagen rabbit l,36,4,105,74,1980,15.3,1982-01-01,Europe\nmazda glc custom l,37,4,91,68,2025,18.2,1982-01-01,Japan\nmazda glc custom,31,4,91,68,1970,17.6,1982-01-01,Japan\nplymouth horizon miser,38,4,105,63,2125,14.7,1982-01-01,USA\nmercury lynx l,36,4,98,70,2125,17.3,1982-01-01,USA\nnissan stanza xe,36,4,120,88,2160,14.5,1982-01-01,Japan\nhonda Accelerationord,36,4,107,75,2205,14.5,1982-01-01,Japan\ntoyota corolla,34,4,108,70,2245,16.9,1982-01-01,Japan\nhonda civic,38,4,91,67,1965,15,1982-01-01,Japan\nhonda civic (auto),32,4,91,67,1965,15.7,1982-01-01,Japan\ndatsun 310 gx,38,4,91,67,1995,16.2,1982-01-01,Japan\nbuick century limited,25,6,181,110,2945,16.4,1982-01-01,USA\noldsmobile cutlass ciera (diesel),38,6,262,85,3015,17,1982-01-01,USA\nchrysler lebaron medallion,26,4,156,92,2585,14.5,1982-01-01,USA\nford granada l,22,6,232,112,2835,14.7,1982-01-01,USA\ntoyota celica gt,32,4,144,96,2665,13.9,1982-01-01,Japan\ndodge charger 2.2,36,4,135,84,2370,13,1982-01-01,USA\nchevrolet camaro,27,4,151,90,2950,17.3,1982-01-01,USA\nford mustang gl,27,4,140,86,2790,15.6,1982-01-01,USA\nvw pickup,44,4,97,52,2130,24.6,1982-01-01,Europe\ndodge rampage,32,4,135,84,2295,11.6,1982-01-01,USA\nford ranger,28,4,120,79,2625,18.6,1982-01-01,USA\nchevy s-10,31,4,119,82,2720,19.4,1982-01-01,USA\n',
  'Lists Test':
    'user:Show me lists of random countries in any format an LLM can return.\n1.Canada\n2.Zimbabwe\n3.Qatar\n4.New-zealand\n- Kenya\n- Morrocco\n- Iceland\n- Laos\n- Fiji\n',
  'Carousel Test':
    'user:Show me some carousels:\nbot:Here are some carousel elements:\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]\n["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]\n["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]\n["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]\n["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://vega.github.io/vega-lite/examples/data/disasters.csv","https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg"]\n',
};

const textPlaygroundControls = {
  sampleQuery: {
    control: { type: 'select' },
    description: 'Premade rawText',
    options: Object.keys(rawTextExamples),
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
      style="height:calc(100vh - 84px); overflow:hidden; display:inline-flex; width:100%;">
      <div style="height:calc(100vh - 84px); flex:2;">
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
              style="height:calc(100vh - 84px); width:400px; padding-left:20px;overflow-y:auto;">
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
      style="height:calc(100vh - 44px); display:flex; max-width:100%; overflow:hidden; gap:20px;">
      <div style="flex:2;">
        ${queryMode == 'Examples'
          ? html` <clabs-chat
              sample-query="${rawTextExamples[sampleQuery]}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>`
          : html` <clabs-chat
              sample-query="${rawText}"
              user-name="user"
              stream-responses
              default-viewing-mode="fullscreen"
              agent-name="bot">
            </clabs-chat>`}
      </div>
      ${sampleQuery === 'None' && queryMode == 'Examples'
        ? html`
            <div style="width:400px; overflow-y:auto;">
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
  sampleConversation: 'ShowAll',
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
      'ShowAll',
      'None',
      'Chart creation',
      'Molecules',
      'Conversation tutorial',
      'Nature of art',
      'Flowers',
      'Visualization',
      'Cloud',
    ],
  },
  conversationJSON: {
    control: { type: 'object' },
    description: 'JSON conversation',
  },
};

const conversationExamples = {
  ShowAll: [
    {
      origin: 'user',
      hasError: false,
      time: '16:51',
      index: 0,
      elements: [
        {
          type: 'text',
          content:
            'Show me examples for the following components in this chat: ' +
            coreExamples.map((item) => item[0]).join(', '),
        },
      ],
    },
    {
      origin: 'bot',
      hasError: false,
      time: '16:55',
      index: 1,
      elements: coreExamples.reduce((acc, item, index) => {
        acc.push({
          type: 'html-text',
          content:
            '<b>' +
            (index + 1) +
            '.</b> Here is a <b>&lt;clabs-chat-' +
            item[0] +
            '&gt;</b> element' +
            (item[2] ? ' of type <i><b>' + item[2] + '</b></i>' : '') +
            ':' +
            (item[3]
              ? '<br/><span style="font-size:12px;font-style:italic;">' +
                item[3] +
                '</span>'
              : ''),
        });
        acc.push({ type: item[2] ? item[2] : item[0], content: item[1] });
        //acc.push({"type":"html-text","content":item[3]?'\n<p style="font-size:12px;font-style:italic;">'+item[3]+'</p>':''})
        return acc;
      }, []),
    },
  ],
  'Conversation tutorial': [
    {
      origin: 'bot',
      hasError: false,
      time: '16:51',
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
            'Component,Type,Auto-detection\nText,text,Any normal text\nImage,img,URLs ending in png/jpeg/bmp/...\nCard (video),video,URLs ending in mp4/webm/mov/...\nCard (file),file,URLs/paths ending in csv/pdf/xls/...\nCard (url),url,URLs ending in com/org/net/...\nTable,table,Csv-type text using commas and linebreaks\nCode,code,Text between a predefined delimiter\nCarousel,carousel,Array of image URLs\nTagList,tags,Array of any non-image text\nList,list,Text blocks with any markers like bullets/numbers\nText,html-text,valid closed HTML markers included\nText,annotated-text,markdowns with such as [link](http://..)\nLinkList,link-list,multi-link markdowns\nChart,chart,JSON object beginning with {"$schema"...\nFormula,formula,Code with Tex markdown markers\nError,error,Error text\nMolecule,molecule,code block with ``` and SMILES strings\nLoading,loading,None (empty)\nEditableText,editable-text,Any text',
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
  Cloud: [
    {
      origin: 'user',
      hasError: false,
      time: '14:06',
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
      time: '14:07',
      index: 1,
      elements: [
        {
          content: 'Here is your answer',
          type: 'text',
        },
        {
          content:
            '```<clabs-chat \n\tuser-name="Owen" \n\tagent-name="Watson"\n\tconversation={conversationJSON}\n\tstream-responses={streamEnabled}\n\tloading={loading}\n\tdefault-viewing-mode="docked"\n\ton:on-user-message-update-request={handleUpdatedMessage}\n\ton:on-user-regeneration-request={handleRegeneration}\n\ton:on-user-text-input={handleNewMessage}\n\ton:on-message-element-selected={handleElementClicked}\n\ton:on-user-feedback-request={handleUserFeedback}\n\ton:on-message-element-tag-selected={handleTagClicked}>\n</clabs-chat>```',
          type: 'code',
        },
        {
          content: 'Here are the sources:',
          type: 'text',
        },
        {
          content:
            '[IBM Cloud Home](https://www.ibm.com/cloud),[Cloud Solutions](https://www.ibm.com/cloud/solutions),[Cloud products](https://www.ibm.com/cloud/products),[Cloud Docs](https://cloud.ibm.com/docs)',
          type: 'link-list',
        },
      ],
    },
    {
      origin: 'user',
      hasError: false,
      time: '14:06',
      index: 0,
      elements: [
        {
          content: 'ok cool now more examples',
          type: 'text',
        },
      ],
    },
    {
      text: '',
      origin: 'bot',
      hasError: false,
      time: '14:07',
      index: 1,
      elements: [
        {
          content: 'Here is your answer',
          type: 'text',
        },
        {
          content:
            'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n',
          type: 'code',
        },
      ],
    },
  ],
  Molecules: [
    {
      origin: 'user',
      hasError: false,
      time: '3:51',
      index: 0,
      elements: [
        {
          content:
            'Give me the SMILES string for bergenin, cephalostatin-1, acetate, benzene, 5-amino-4-methylpentanamide, bromobenzene, caffeine, thyroxine, cholesterol, chlorine, taxol, ATP, cyclosporine, vit B12, insulin',
          type: 'text',
        },
      ],
    },
    {
      origin: 'bot',
      hasError: false,
      time: '3:54',
      index: 1,
      elements: [
        {
          content: '<b>Bergenin</b>',
          type: 'html-text',
        },
        {
          content:
            'OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2',
          type: 'molecule',
        },
        {
          content: '<b>Cephalostatin-1</b>',
          type: 'html-text',
        },
        {
          content:
            'CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO',
          type: 'molecule',
        },
        {
          content: '<b>Acetate</b>',
          type: 'html-text',
        },
        {
          content: 'CC(=O)[O-]',
          type: 'molecule',
        },
        {
          content: '<b>Benzene (C6H6)</b>',
          type: 'html-text',
        },
        {
          content: 'C1=CC=CC=C1',
          type: 'molecule',
        },
        {
          content: '<b>5-amino-4-methylpentanamide</b>',
          type: 'html-text',
        },
        {
          content: 'CC(CCC(=O)N)CN',
          type: 'molecule',
        },
        {
          content: '<b>Bromobenzene</b>',
          type: 'html-text',
        },
        {
          content: 'C1=CC=C(C=C1)Br',
          type: 'molecule',
        },
        {
          content: '<b>Caffeine</b>',
          type: 'html-text',
        },
        {
          content: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
          type: 'molecule',
        },
        {
          content: '<b>Thyroxine</b>',
          type: 'html-text',
        },
        {
          content: 'C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N',
          type: 'molecule',
        },
        {
          content: '<b>Cholesterol</b>',
          type: 'html-text',
        },
        {
          content: 'CC(C)CCCC(C)C1CCC2C1(CCCC2=CC=C3CC4CC(CC(C4)O)C(O)C3(C)C)C',
          type: 'molecule',
        },
        {
          content: '<b>Chlorine</b>',
          type: 'html-text',
        },
        {
          content:
            'CCC1=C(C2=NC1=CC3=C(C4=C(C(C(=C4[N-]3)C5=NC(=CC6=NC(=C2)C(=C6C)C=C)C(C5CCC(=O)OCC=C(C)CCCC(C)CCCC(C)CCCC(C)C)C)C(=O)OC)[O-])C)C.[Mg+2]',
          type: 'molecule',
        },
        {
          content: '<b>Paclitaxel (Taxol)</b>',
          type: 'html-text',
        },
        {
          content:
            'CC1=C2C(C(=O)C3(C(CC4C(C3C(C(C2(C)C)(CC1OC(=O)C(C(C5=CC=CC=C5)NC(=O)C6=CC=CC=C6)O)O)OC(=O)C7=CC=CC=C7)(CO4)OC(=O)C)O)C)OC(=O)C',
          type: 'molecule',
        },
        {
          content: '<b>ATP (Adenosine Triphosphate)</b>',
          type: 'html-text',
        },
        {
          content:
            'C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N.C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N',
          type: 'molecule',
        },
        {
          content: '<b>Cyclosporine</b>',
          type: 'html-text',
        },
        {
          content:
            'CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C',
          type: 'molecule',
        },
        {
          content: '<b>Vitamin B12</b>',
          type: 'html-text',
        },
        {
          content:
            'CC1=CC2=C(C=C1C)N(C=N2)C3C(C(C(O3)CO)OP(=O)([O-])OC(C)CNC(=O)CCC4(C(C5C6(C(C(C(=C(C7=NC(=CC8=NC(=C(C4=N5)C)C(C8(C)C)CCC(=O)N)C(C7(C)CC(=O)N)CCC(=O)N)C)[N-]6)CCC(=O)N)(C)CC(=O)N)C)CC(=O)N)C)O.[C-]#N.[Co+3]',
          type: 'molecule',
        },
        {
          content: '<b>Insulin</b>',
          type: 'html-text',
        },
        {
          content:
            'CCC(C)C1C(=O)NC2CSSCC(C(=O)NC(CSSCC(C(=O)NCC(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(CSSCC(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)NC(CC(=O)N)C(=O)O)C(=O)NCC(=O)NC(CCC(=O)O)C(=O)NC(CCCNC(=N)N)C(=O)NCC(=O)NC(CC5=CC=CC=C5)C(=O)NC(CC6=CC=CC=C6)C(=O)NC(CC7=CC=C(C=C7)O)C(=O)NC(C(C)O)C(=O)N8CCCC8C(=O)NC(CCCCN)C(=O)NC(C(C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)C(CC(C)C)NC(=O)C(CC2=CNC=N2)NC(=O)C(CCC(=O)N)NC(=O)C(C(=O)N)NC(=O)C(C(C)C)NC(=O)C(CC2=CC=CC=C2)N)C(=O)NC(C(=O)NC(C(=O)N1)CO)C(C)O)NC(=O)C(CCC(=O)N)NC(=O)C(CCC(=O)O)NC(=O)C(C(C)C)NC(=O)C(C(C)CC)NC(=O)CN',
          type: 'molecule',
        },
      ],
    },
  ],
  'Chart creation': [
    {
      origin: 'bot',
      time: '6:05pm',
      index: 0,
      elements: [
        {
          content:
            'Hello, I am Watson, your data visualization assistant. Upload a .CSV or .XLS file to create any chart you wish!',
          type: 'text',
        },
      ],
      disableButtons: true,
    },
    {
      origin: 'user',
      time: '6:25pm',
      index: 1,
      elements: [
        {
          content: 'File "disasters.csv" sent',
          type: 'text',
        },
        {
          content: 'disasters.csv',
          type: 'file',
        },
      ],
      disableButtons: true,
    },
    {
      origin: 'bot',
      time: '6:25pm',
      index: 2,
      elements: [
        {
          content:
            'File "disasters.csv" was successfully uploaded! Here is a preview:',
          type: 'text',
        },
        {
          content:
            'Entity,Year,Deaths\nAll natural disasters,1900,1267360\nAll natural disasters,1901,200018\nAll natural disasters,1902,46037\nAll natural disasters,1903,6506\nAll natural disasters,1905,22758\nAll natural disasters,1906,42970\nAll natural disasters,1907,1325641\nAll natural disasters,1908,75033\nAll natural disasters,1909,1511524\nAll natural disasters,1910,148233\nAll natural disasters,1911,102408\nAll natural disasters,1912,52093\nAll natural disasters,1913,882\nAll natural disasters,1914,289\nAll natural disasters,1915,32167\nAll natural disasters,1916,300\nAll natural disasters,1917,2523507\nAll natural disasters,1918,461113\nAll natural disasters,1919,5500\nAll natural disasters,1920,3204224\nAll natural disasters,1921,1200000\nAll natural disasters,1922,101243\nAll natural disasters,1923,255701\nAll natural disasters,1924,303009\nAll natural disasters,1925,5832\nAll natural disasters,1926,427852\nAll natural disasters,1927,215160\nAll natural disasters,1928,3004895\nAll natural disasters,1929,8377\nAll natural disasters,1930,10572\nAll natural disasters,1931,3706227\nAll natural disasters,1932,73296\nAll natural disasters,1933,34296\nAll natural disasters,1934,21087\nAll natural disasters,1935,272817\nAll natural disasters,1936,5301\nAll natural disasters,1937,12025\nAll natural disasters,1938,2225\nAll natural disasters,1939,563178\nAll natural disasters,1940,23023\nAll natural disasters,1941,10195\nAll natural disasters,1942,1608235\nAll natural disasters,1943,1910322\nAll natural disasters,1944,15906\nAll natural disasters,1945,10376\nAll natural disasters,1946,35490\nAll natural disasters,1947,17647\nAll natural disasters,1948,120131\nAll natural disasters,1949,120370\nAll natural disasters,1950,6728\nAll natural disasters,1951,15042\nAll natural disasters,1952,8965\nAll natural disasters,1953,12956\nAll natural disasters,1954,41872\nAll natural disasters,1955,6026\nAll natural disasters,1956,7737\nAll natural disasters,1957,10603\nAll natural disasters,1958,3950\nAll natural disasters,1959,2013242\nAll natural disasters,1960,39188\nAll natural disasters,1961,17341\nAll natural disasters,1962,17370\nAll natural disasters,1963,37746\nAll natural disasters,1964,12892\nAll natural disasters,1965,1565517\nAll natural disasters,1966,17181\nAll natural disasters,1967,10103\nAll natural disasters,1968,21461\nAll natural disasters,1969,11687\nAll natural disasters,1970,387507\nAll natural disasters,1971,18086\nAll natural disasters,1972,20045\nAll natural disasters,1973,110555\nAll natural disasters,1974,87504\nAll natural disasters,1975,14858\nAll natural disasters,1976,280469\nAll natural disasters,1977,22406\nAll natural disasters,1978,38096\nAll natural disasters,1979,7341\nAll natural disasters,1980,23089\nAll natural disasters,1981,119697\nAll natural disasters,1982,13973\nAll natural disasters,1983,461561\nAll natural disasters,1984,16273\nAll natural disasters,1985,60232\nAll natural disasters,1986,10349\nAll natural disasters,1987,21533\nAll natural disasters,1988,57464\nAll natural disasters,1989,12611\nAll natural disasters,1990,53141\nAll natural disasters,1991,189707\nAll natural disasters,1992,18911\nAll natural disasters,1993,21821\nAll natural disasters,1994,15590\nAll natural disasters,1995,27166\nAll natural disasters,1996,31595\nAll natural disasters,1997,30124\nAll natural disasters,1998,62672\nAll natural disasters,1999,76886\nAll natural disasters,2000,16667\nAll natural disasters,2001,39493\nAll natural disasters,2002,21342\nAll natural disasters,2003,113558\nAll natural disasters,2004,244772\nAll natural disasters,2005,93566\nAll natural disasters,2006,29893\nAll natural disasters,2007,22422\nAll natural disasters,2008,242236\nAll natural disasters,2009,16037\nAll natural disasters,2010,329900\nAll natural disasters,2011,34143\nAll natural disasters,2012,11619\nAll natural disasters,2013,22225\nAll natural disasters,2014,20882\nAll natural disasters,2015,23893\nAll natural disasters,2016,10201\nAll natural disasters,2017,2087\nDrought,1900,1261000\nDrought,1910,85000\nDrought,1920,524000\nDrought,1921,1200000\nDrought,1928,3000000\nDrought,1940,20000\nDrought,1942,1500000\nDrought,1943,1900000\nDrought,1946,30000\nDrought,1964,50\nDrought,1965,1502000\nDrought,1966,8000\nDrought,1967,600\nDrought,1973,100000\nDrought,1974,19000\nDrought,1978,63\nDrought,1979,18\nDrought,1981,103000\nDrought,1982,280\nDrought,1983,450520\nDrought,1984,230\nDrought,1986,84\nDrought,1987,1317\nDrought,1988,1600\nDrought,1989,237\nDrought,1991,2000\nDrought,1997,732\nDrought,1998,20\nDrought,1999,361\nDrought,2000,80\nDrought,2001,99\nDrought,2002,588\nDrought,2003,9\nDrought,2004,80\nDrought,2005,149\nDrought,2006,134\nDrought,2008,8\nDrought,2010,20000\nDrought,2015,35\nEarthquake,1901,18\nEarthquake,1902,6747\nEarthquake,1903,6000\nEarthquake,1905,22500\nEarthquake,1906,31966\nEarthquake,1907,25641\nEarthquake,1908,75000\nEarthquake,1909,5146\nEarthquake,1910,1762\nEarthquake,1912,923\nEarthquake,1913,150\nEarthquake,1914,149\nEarthquake,1915,29986\nEarthquake,1917,19450\nEarthquake,1918,10379\nEarthquake,1920,180000\nEarthquake,1922,1100\nEarthquake,1923,152362\nEarthquake,1924,767\nEarthquake,1925,5013\nEarthquake,1926,12\nEarthquake,1927,206142\nEarthquake,1928,635\nEarthquake,1929,3317\nEarthquake,1930,5081\nEarthquake,1931,1537\nEarthquake,1932,70006\nEarthquake,1933,16180\nEarthquake,1934,15496\nEarthquake,1935,66110\nEarthquake,1936,26\nEarthquake,1938,166\nEarthquake,1939,63094\nEarthquake,1940,1275\nEarthquake,1941,189\nEarthquake,1942,7235\nEarthquake,1943,4332\nEarthquake,1944,14984\nEarthquake,1945,5961\nEarthquake,1946,5153\nEarthquake,1947,633\nEarthquake,1948,115618\nEarthquake,1949,6486\nEarthquake,1950,1833\nEarthquake,1951,1554\nEarthquake,1952,2432\nEarthquake,1953,2717\nEarthquake,1954,3344\nEarthquake,1955,959\nEarthquake,1956,763\nEarthquake,1957,6993\nEarthquake,1958,227\nEarthquake,1959,103\nEarthquake,1960,19395\nEarthquake,1961,60\nEarthquake,1962,12209\nEarthquake,1963,1700\nEarthquake,1964,335\nEarthquake,1965,683\nEarthquake,1966,2752\nEarthquake,1967,1013\nEarthquake,1968,10858\nEarthquake,1969,3353\nEarthquake,1970,78599\nEarthquake,1971,1107\nEarthquake,1972,15170\nEarthquake,1973,552\nEarthquake,1974,24808\nEarthquake,1975,12632\nEarthquake,1976,276994\nEarthquake,1977,3098\nEarthquake,1978,25162\nEarthquake,1979,2100\nEarthquake,1980,7730\nEarthquake,1981,4206\nEarthquake,1982,2120\nEarthquake,1983,2148\nEarthquake,1984,57\nEarthquake,1985,9853\nEarthquake,1986,1181\nEarthquake,1987,5160\nEarthquake,1988,27049\nEarthquake,1989,650\nEarthquake,1990,42853\nEarthquake,1991,2454\nEarthquake,1992,4033\nEarthquake,1993,10088\nEarthquake,1994,1242\nEarthquake,1995,7739\nEarthquake,1996,576\nEarthquake,1997,3159\nEarthquake,1998,9573\nEarthquake,1999,21869\nEarthquake,2000,217\nEarthquake,2001,21348\nEarthquake,2002,1639\nEarthquake,2003,29617\nEarthquake,2004,227290\nEarthquake,2005,76241\nEarthquake,2006,6692\nEarthquake,2007,780\nEarthquake,2008,87918\nEarthquake,2009,1893\nEarthquake,2010,226733\nEarthquake,2011,20946\nEarthquake,2012,711\nEarthquake,2013,1120\nEarthquake,2014,774\nEarthquake,2015,9550\nEarthquake,2016,1311\nEarthquake,2017,49\nEpidemic,1900,30\nEpidemic,1901,200000\nEpidemic,1907,1300000\nEpidemic,1909,1500040\nEpidemic,1910,60000\nEpidemic,1917,2500000\nEpidemic,1918,449700\nEpidemic,1920,2500000\nEpidemic,1923,100000\nEpidemic,1924,300000\nEpidemic,1926,423000\nEpidemic,1932,16\nEpidemic,1935,2000\nEpidemic,1940,1500\nEpidemic,1947,10276\nEpidemic,1953,481\nEpidemic,1963,1000\nEpidemic,1964,617\nEpidemic,1965,816\nEpidemic,1966,200\nEpidemic,1967,3137\nEpidemic,1968,177\nEpidemic,1969,3520\nEpidemic,1970,939\nEpidemic,1971,2313\nEpidemic,1972,35\nEpidemic,1974,1500\nEpidemic,1976,396\nEpidemic,1977,1184\nEpidemic,1978,3060\nEpidemic,1979,486\nEpidemic,1980,1685\nEpidemic,1981,2497\nEpidemic,1982,2912\nEpidemic,1983,1219\nEpidemic,1984,7016\nEpidemic,1985,5854\nEpidemic,1986,3046\nEpidemic,1987,2592\nEpidemic,1988,15216\nEpidemic,1989,1870\nEpidemic,1990,2207\nEpidemic,1991,30682\nEpidemic,1992,6675\nEpidemic,1993,651\nEpidemic,1994,2505\nEpidemic,1995,4428\nEpidemic,1996,16887\nEpidemic,1997,10674\nEpidemic,1998,12931\nEpidemic,1999,6293\nEpidemic,2000,6980\nEpidemic,2001,8515\nEpidemic,2002,8762\nEpidemic,2003,3522\nEpidemic,2004,3245\nEpidemic,2005,3909\nEpidemic,2006,6402\nEpidemic,2007,5484\nEpidemic,2008,6904\nEpidemic,2009,4895\nEpidemic,2010,12143\nEpidemic,2011,3174\nEpidemic,2012,1887\nEpidemic,2013,529\nEpidemic,2014,12911\nEpidemic,2015,1032\nEpidemic,2016,1520\nEpidemic,2017,386\nExtreme temperature,1936,1693\nExtreme temperature,1951,69\nExtreme temperature,1953,669\nExtreme temperature,1955,107\nExtreme temperature,1958,651\nExtreme temperature,1961,400\nExtreme temperature,1962,50\nExtreme temperature,1963,162\nExtreme temperature,1965,100\nExtreme temperature,1966,262\nExtreme temperature,1968,153\nExtreme temperature,1971,400\nExtreme temperature,1972,110\nExtreme temperature,1973,283\nExtreme temperature,1975,140\nExtreme temperature,1978,150\nExtreme temperature,1979,470\nExtreme temperature,1980,1389\nExtreme temperature,1981,300\nExtreme temperature,1982,400\nExtreme temperature,1983,205\nExtreme temperature,1984,290\nExtreme temperature,1985,456\nExtreme temperature,1986,50\nExtreme temperature,1987,1220\nExtreme temperature,1988,644\nExtreme temperature,1989,381\nExtreme temperature,1990,979\nExtreme temperature,1991,835\nExtreme temperature,1992,388\nExtreme temperature,1993,106\nExtreme temperature,1994,341\nExtreme temperature,1995,1730\nExtreme temperature,1996,300\nExtreme temperature,1997,604\nExtreme temperature,1998,3269\nExtreme temperature,1999,771\nExtreme temperature,2000,941\nExtreme temperature,2001,1787\nExtreme temperature,2002,3369\nExtreme temperature,2003,74698\nExtreme temperature,2004,255\nExtreme temperature,2005,1550\nExtreme temperature,2006,4826\nExtreme temperature,2007,1086\nExtreme temperature,2008,1688\nExtreme temperature,2009,1386\nExtreme temperature,2010,57188\nExtreme temperature,2011,435\nExtreme temperature,2012,1834\nExtreme temperature,2013,1821\nExtreme temperature,2014,1168\nExtreme temperature,2015,7425\nExtreme temperature,2016,490\nExtreme temperature,2017,130\nExtreme weather,1900,6000\nExtreme weather,1902,600\nExtreme weather,1903,163\nExtreme weather,1905,240\nExtreme weather,1906,10298\nExtreme weather,1909,713\nExtreme weather,1910,30\nExtreme weather,1911,1000\nExtreme weather,1912,51170\nExtreme weather,1913,732\nExtreme weather,1915,2125\nExtreme weather,1916,300\nExtreme weather,1917,4057\nExtreme weather,1918,34\nExtreme weather,1919,500\nExtreme weather,1920,224\nExtreme weather,1922,100000\nExtreme weather,1923,3139\nExtreme weather,1924,2242\nExtreme weather,1925,819\nExtreme weather,1926,3568\nExtreme weather,1927,5772\nExtreme weather,1928,4224\nExtreme weather,1930,4082\nExtreme weather,1931,3200\nExtreme weather,1932,3244\nExtreme weather,1933,63\nExtreme weather,1934,5091\nExtreme weather,1935,62707\nExtreme weather,1936,3309\nExtreme weather,1937,11231\nExtreme weather,1938,905\nExtreme weather,1939,3\nExtreme weather,1940,123\nExtreme weather,1941,5006\nExtreme weather,1942,101000\nExtreme weather,1943,5000\nExtreme weather,1944,726\nExtreme weather,1945,4415\nExtreme weather,1946,337\nExtreme weather,1947,4738\nExtreme weather,1948,2971\nExtreme weather,1949,2804\nExtreme weather,1950,873\nExtreme weather,1951,2861\nExtreme weather,1952,6277\nExtreme weather,1953,1814\nExtreme weather,1954,2969\nExtreme weather,1955,3895\nExtreme weather,1956,3114\nExtreme weather,1957,1139\nExtreme weather,1958,2620\nExtreme weather,1959,9695\nExtreme weather,1960,9164\nExtreme weather,1961,12852\nExtreme weather,1962,1860\nExtreme weather,1963,29965\nExtreme weather,1964,10655\nExtreme weather,1965,59932\nExtreme weather,1966,2327\nExtreme weather,1967,2255\nExtreme weather,1968,1669\nExtreme weather,1969,3252\nExtreme weather,1970,304495\nExtreme weather,1971,10811\nExtreme weather,1972,1427\nExtreme weather,1973,4344\nExtreme weather,1974,11861\nExtreme weather,1975,1041\nExtreme weather,1976,1763\nExtreme weather,1977,15298\nExtreme weather,1978,3676\nExtreme weather,1979,2623\nExtreme weather,1980,1379\nExtreme weather,1981,3790\nExtreme weather,1982,2782\nExtreme weather,1983,3656\nExtreme weather,1984,5468\nExtreme weather,1985,17165\nExtreme weather,1986,1939\nExtreme weather,1987,2900\nExtreme weather,1988,3335\nExtreme weather,1989,4256\nExtreme weather,1990,4604\nExtreme weather,1991,146297\nExtreme weather,1992,1342\nExtreme weather,1993,2965\nExtreme weather,1994,4239\nExtreme weather,1995,3763\nExtreme weather,1996,4581\nExtreme weather,1997,6150\nExtreme weather,1998,24935\nExtreme weather,1999,12270\nExtreme weather,2000,1354\nExtreme weather,2001,1911\nExtreme weather,2002,1382\nExtreme weather,2003,1049\nExtreme weather,2004,6547\nExtreme weather,2005,5251\nExtreme weather,2006,4329\nExtreme weather,2007,6035\nExtreme weather,2008,140985\nExtreme weather,2009,3287\nExtreme weather,2010,1564\nExtreme weather,2011,3103\nExtreme weather,2012,3105\nExtreme weather,2013,8603\nExtreme weather,2014,1424\nExtreme weather,2015,1270\nExtreme weather,2016,1760\nExtreme weather,2017,394\nFlood,1900,300\nFlood,1903,250\nFlood,1906,6\nFlood,1909,72\nFlood,1910,1379\nFlood,1911,100000\nFlood,1926,1000\nFlood,1927,3246\nFlood,1928,36\nFlood,1931,3700000\nFlood,1933,18053\nFlood,1935,142000\nFlood,1936,200\nFlood,1937,248\nFlood,1938,954\nFlood,1939,500010\nFlood,1940,125\nFlood,1943,990\nFlood,1947,2000\nFlood,1948,917\nFlood,1949,97000\nFlood,1950,3808\nFlood,1951,5666\nFlood,1952,199\nFlood,1953,7125\nFlood,1954,34436\nFlood,1955,584\nFlood,1956,3613\nFlood,1957,2471\nFlood,1958,400\nFlood,1959,2003396\nFlood,1960,10577\nFlood,1961,3863\nFlood,1962,1180\nFlood,1963,1031\nFlood,1964,1123\nFlood,1965,1401\nFlood,1966,1923\nFlood,1967,2446\nFlood,1968,7306\nFlood,1969,1544\nFlood,1970,3246\nFlood,1971,2404\nFlood,1972,2548\nFlood,1973,1835\nFlood,1974,29431\nFlood,1975,848\nFlood,1976,960\nFlood,1977,2568\nFlood,1978,5897\nFlood,1979,1038\nFlood,1980,10466\nFlood,1981,5283\nFlood,1982,4648\nFlood,1983,2082\nFlood,1984,2930\nFlood,1985,4376\nFlood,1986,1782\nFlood,1987,6766\nFlood,1988,8504\nFlood,1989,4716\nFlood,1990,2251\nFlood,1991,5852\nFlood,1992,5315\nFlood,1993,6150\nFlood,1994,6771\nFlood,1995,7956\nFlood,1996,8047\nFlood,1997,7685\nFlood,1998,10653\nFlood,1999,34807\nFlood,2000,6025\nFlood,2001,5014\nFlood,2002,4236\nFlood,2003,3910\nFlood,2004,6982\nFlood,2005,5754\nFlood,2006,5843\nFlood,2007,8607\nFlood,2008,4007\nFlood,2009,3627\nFlood,2010,8356\nFlood,2011,6163\nFlood,2012,3544\nFlood,2013,9836\nFlood,2014,3532\nFlood,2015,3495\nFlood,2016,4720\nFlood,2017,648\nLandslide,1909,53\nLandslide,1922,100\nLandslide,1923,200\nLandslide,1926,128\nLandslide,1930,40\nLandslide,1931,190\nLandslide,1932,30\nLandslide,1934,500\nLandslide,1936,73\nLandslide,1938,200\nLandslide,1941,5000\nLandslide,1948,525\nLandslide,1949,12000\nLandslide,1950,130\nLandslide,1951,92\nLandslide,1952,28\nLandslide,1954,1086\nLandslide,1955,478\nLandslide,1956,236\nLandslide,1958,52\nLandslide,1959,48\nLandslide,1960,52\nLandslide,1961,166\nLandslide,1962,71\nLandslide,1963,2033\nLandslide,1964,108\nLandslide,1965,204\nLandslide,1966,604\nLandslide,1967,590\nLandslide,1968,1196\nLandslide,1969,18\nLandslide,1970,186\nLandslide,1971,1020\nLandslide,1972,755\nLandslide,1973,3541\nLandslide,1974,904\nLandslide,1975,195\nLandslide,1976,315\nLandslide,1977,40\nLandslide,1978,86\nLandslide,1979,338\nLandslide,1980,300\nLandslide,1981,421\nLandslide,1982,640\nLandslide,1983,1159\nLandslide,1984,228\nLandslide,1985,377\nLandslide,1986,501\nLandslide,1987,1204\nLandslide,1988,952\nLandslide,1989,445\nLandslide,1990,98\nLandslide,1991,728\nLandslide,1992,712\nLandslide,1993,1418\nLandslide,1994,307\nLandslide,1995,1521\nLandslide,1996,1155\nLandslide,1997,801\nLandslide,1998,1141\nLandslide,1999,445\nLandslide,2000,1012\nLandslide,2001,786\nLandslide,2002,1100\nLandslide,2003,706\nLandslide,2004,313\nLandslide,2005,664\nLandslide,2006,1638\nLandslide,2007,271\nLandslide,2008,504\nLandslide,2009,723\nLandslide,2010,3427\nLandslide,2011,309\nLandslide,2012,501\nLandslide,2013,235\nLandslide,2014,943\nLandslide,2015,1006\nLandslide,2016,361\nLandslide,2017,405\nMass movement (dry),1903,76\nMass movement (dry),1905,18\nMass movement (dry),1908,33\nMass movement (dry),1910,62\nMass movement (dry),1915,56\nMass movement (dry),1937,40\nMass movement (dry),1955,3\nMass movement (dry),1962,2000\nMass movement (dry),1963,150\nMass movement (dry),1965,26\nMass movement (dry),1970,42\nMass movement (dry),1971,31\nMass movement (dry),1980,50\nMass movement (dry),1982,59\nMass movement (dry),1983,466\nMass movement (dry),1985,300\nMass movement (dry),1987,183\nMass movement (dry),1988,157\nMass movement (dry),1989,55\nMass movement (dry),1990,116\nMass movement (dry),1991,86\nMass movement (dry),1992,323\nMass movement (dry),1993,341\nMass movement (dry),2000,11\nMass movement (dry),2002,60\nMass movement (dry),2004,44\nMass movement (dry),2006,11\nMass movement (dry),2008,120\nMass movement (dry),2009,36\nMass movement (dry),2012,16\nMass movement (dry),2013,46\nMass movement (dry),2015,13\nVolcanic activity,1900,30\nVolcanic activity,1902,38690\nVolcanic activity,1903,17\nVolcanic activity,1906,700\nVolcanic activity,1909,5500\nVolcanic activity,1911,1335\nVolcanic activity,1914,140\nVolcanic activity,1919,5000\nVolcanic activity,1926,144\nVolcanic activity,1929,5000\nVolcanic activity,1930,1369\nVolcanic activity,1931,1300\nVolcanic activity,1937,506\nVolcanic activity,1944,26\nVolcanic activity,1948,100\nVolcanic activity,1949,2000\nVolcanic activity,1950,84\nVolcanic activity,1951,4800\nVolcanic activity,1952,29\nVolcanic activity,1953,150\nVolcanic activity,1954,37\nVolcanic activity,1963,1705\nVolcanic activity,1964,4\nVolcanic activity,1965,355\nVolcanic activity,1966,1088\nVolcanic activity,1968,90\nVolcanic activity,1975,2\nVolcanic activity,1976,41\nVolcanic activity,1977,215\nVolcanic activity,1979,268\nVolcanic activity,1980,90\nVolcanic activity,1981,192\nVolcanic activity,1982,130\nVolcanic activity,1984,37\nVolcanic activity,1985,21800\nVolcanic activity,1986,1746\nVolcanic activity,1988,7\nVolcanic activity,1990,33\nVolcanic activity,1991,683\nVolcanic activity,1992,1\nVolcanic activity,1993,99\nVolcanic activity,1994,101\nVolcanic activity,1996,4\nVolcanic activity,1997,53\nVolcanic activity,2002,200\nVolcanic activity,2004,2\nVolcanic activity,2005,3\nVolcanic activity,2006,5\nVolcanic activity,2007,11\nVolcanic activity,2008,16\nVolcanic activity,2010,323\nVolcanic activity,2011,3\nVolcanic activity,2014,102\nWildfire,1911,73\nWildfire,1918,1000\nWildfire,1922,43\nWildfire,1929,60\nWildfire,1939,71\nWildfire,1944,170\nWildfire,1949,80\nWildfire,1956,11\nWildfire,1966,25\nWildfire,1967,62\nWildfire,1968,12\nWildfire,1977,3\nWildfire,1978,2\nWildfire,1981,8\nWildfire,1982,2\nWildfire,1983,106\nWildfire,1984,17\nWildfire,1985,51\nWildfire,1986,20\nWildfire,1987,191\nWildfire,1989,1\nWildfire,1991,90\nWildfire,1992,122\nWildfire,1993,3\nWildfire,1994,84\nWildfire,1995,29\nWildfire,1996,45\nWildfire,1997,266\nWildfire,1998,150\nWildfire,1999,70\nWildfire,2000,47\nWildfire,2001,33\nWildfire,2002,6\nWildfire,2003,47\nWildfire,2004,14\nWildfire,2005,45\nWildfire,2006,13\nWildfire,2007,148\nWildfire,2008,86\nWildfire,2009,190\nWildfire,2010,166\nWildfire,2011,10\nWildfire,2012,21\nWildfire,2013,35\nWildfire,2014,16\nWildfire,2015,67\nWildfire,2016,39\nWildfire,2017,75',
          type: 'table',
        },
        {
          content: 'What would you like to visualize?',
          type: 'text',
        },
      ],
      disableButtons: true,
    },
    {
      origin: 'user',
      time: '6:25pm',
      index: 3,
      elements: [
        {
          content:
            'Make a bubble blot of entity vs years, size bubbles by death count',
          type: 'text',
        },
      ],
    },
    {
      origin: 'bot',
      time: '6:26pm',
      index: 4,
      elements: [
        {
          content:
            'This is a bubble plot chart of Entitiy by Year sized by Deaths, What do you think?',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}',
          type: 'chart',
        },
      ],
    },
    {
      origin: 'user',
      time: '6:33pm',
      index: 5,
      elements: [
        {
          content:
            'add title "Deaths by natural disasters", make points smaller then add tooltips, hovering and brush selections',
          type: 'text',
        },
      ],
    },
    {
      origin: 'bot',
      time: '6:33pm',
      index: 6,
      elements: [
        {
          content: 'I think I can do that.',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":-300},"scale":{"rangeMax":2000}},"color":{"field":"Entity","type":"nominal","legend":null}}}',
          type: 'chart',
        },
      ],
    },
  ],
  Visualization: [
    {
      origin: 'user',
      hasError: false,
      time: '10:32',
      index: 0,
      elements: [
        {
          content:
            'Hello, show me a simple table based on Seinfeld Characters then display the following charts with small mockup datasets: a horizontal bar chart, a scatter plot, a pie chart, a boxplot, a map, a matrix and a line chart.',
          type: 'text',
        },
      ],
    },
    {
      text: '',
      origin: 'bot',
      hasError: false,
      time: '10:34',
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
          content: 'Here is your horizontal layered bar chart:\n',
          type: 'text',
        },
        {
          content:
            '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}',
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
      time: '8:51',
      index: 0,
    },
    {
      text: 'the nature of art is a complex and multifaceted topic that has been debated by philosophers, critics, and scholars for centuries. at its core, art is the creation of aesthetic objects or experiences that are intended to elicit an emotional response from the viewer. this can take many forms, including painting, sculpture, photography, music, and literature.\n\nart can serve a variety of purposes, including the expression of the artists personal vision, the exploration of complex social or political issues, or the simple enjoyment of beauty. the nature of art is also influenced by cultural and historical context, and can evolve over time as new techniques and materials are developed.\n\n',
      origin: 'bot',
      hasError: false,
      time: '8:51',
      index: 1,
    },
    {
      text: 'how much do aesthetics play into it?',
      origin: 'user',
      hasError: false,
      time: '8:52',
      index: 2,
    },
    {
      text: 'aesthetics play a significant role in the creation and appreciation of art. the aesthetic qualities of a piece of art, such as its form, color, and composition, are often a key factor in determining its overall effectiveness and appeal. in addition, the aesthetic principles that underlie a work of art can influence its interpretation and meaning.\n\n\n',
      origin: 'bot',
      hasError: false,
      time: '8:52',
      index: 3,
    },
    {
      text: 'Should aesthetics not matter if its a purely subjective interpretation?',
      origin: 'user',
      hasError: false,
      time: '8:53',
      index: 4,
    },
    {
      text: 'while aesthetic evaluations are subjective, they can still provide valuable insights into the ways in which art can be appreciated and understood. the aesthetic qualities of a piece of art can influence how it is experienced and interpreted, and can also reflect the cultural and historical context in which it was created.\n\n\n\n',
      origin: 'bot',
      hasError: false,
      time: '8:53',
      index: 5,
    },
  ],
  Hello: [
    {
      text: 'Hello friend',
      origin: 'user',
      hasError: false,
      time: '16:51',
      index: 0,
      elements: [{ content: 'Hello friend', type: 'text' }],
    },
  ],
  Flowers: [
    {
      text: 'Can you give me a list of flower images?',
      origin: 'user',
      hasError: false,
      time: '16:56',
      index: 0,
    },
    {
      text: 'Of course, here is a list of flowers:\nCosmos: https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg Dahlia: https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg Zinnia: https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg Chrysanthemum: https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg Celosia: https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg Sun flower: https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg Snapdragon: https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg Strawflower: https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg Source: https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/',
      origin: 'bot',
      hasError: false,
      time: '16:57',
      index: 1,
    },
  ],
  Agents: [
    {
      text: 'Find me a dataset about the weather in Ohio circa 2015',
      origin: 'user',
      time: '16:56',
      index: 0,
    },
    {
      origin: 'bot',
      displayName: 'Agent: George',
      displayColor: '#a3fffc',
      time: '16:57',
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
      time: '17:07',
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
      time: '17:09',
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
  component: 'clabs-chat',
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
      style="height:calc(100vh - 84px); display:flex; max-width:100%; gap:20px;">
      <div style="flex:2;">
        <clabs-chat
          user-name="user"
          agent-name="bot"
          enable-feedback-form
          enable-launcher
          .feedbackDefinitions="${feedbackFormOptions}"
          .headerMenuItems="${headerMenuItems}"
          .customLabels="${customLabels}"
          ai-slug-content="${slugText}"
          .aiSlugObject="${slugContent}"
          input-field-placeholder="${'What can I assist you with today?'}"
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
          @on-header-menu-item-selected="${(e) => {
            console.log(e);
          }}"
          @on-user-complex-feedback-request="${(e) => {
            console.log(e);
          }}"
          @on-message-element-selected="${(e) => {
            console.log(e);
          }}">
        </clabs-chat>
      </div>
      ${testMode === 'Examples' &&
      sampleConversation !== 'None' &&
      sampleConversation !== 'ShowAll'
        ? html` <div style="width:400px; overflow-y:auto;">
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
