/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../codeElement';
import { html } from 'lit';
import '@carbon/web-components/es/components/button/index.js';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Experimental/Code',
  component: 'clabs-chat-code',
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-code
    content="${'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n'}">
  </clabs-chat-code>`,
};

const defaultPlaygroundArgs = {
  content:
    'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n',
  editable: false,
  disableLineTicks: false,
  disableEditButton: true,
  disableCopyButton: true,
};

const codeExamples = {
  'single command': 'node -v',
  'npm command': '$ npm install --save carbon-components',
  'console multi':
    'user@Macbook-Air server % npm run build\nuser@Macbook-Air server % npm run lint:styles --fix\nuser@Macbook-Air server % npm format:write\nuser@Macbook-Air server % python3 server.py',
  'html example':
    '<!doctype html>\n<html>\n\t<head>\n\t\t<title>This is the title of the webpage</title>\n\t<script src="myscripts.js"></script>\n\t</head>\n\t<body>\n\t\t<p>This is an example paragraph. Anything in the <strong>body</strong> tag will appear on the page, just like this <strong>p</strong> tag and its contents.</p>\n\t</body>\n</html>',
  'python code':
    'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n\tif itr == 1:\n\t\treturn True\n\t#if given number divided by itr or not\n\tif number % itr == 0:\n\t\treturn False\n\t#Recursive function Call\n\tif Prime(number,itr-1) == False:\n\t\treturn False\n\treturn True\n',
  'carbon datatable': `import React from "react";\nimport { DataTable } from "..";\nconst {\n\tTable,\n\tTableBody,\n\tTableCell,\n\tTableContainer,\n\tTableHead,\n\tTableHeader,\n\tTableRow\n} = DataTable;\nimport mdx from "../DataTable.mdx";\nimport "./datatable-story.scss";\nexport default {\n\ttitle: "Components/DataTable/Basic",\n\tcomponent: DataTable,\n\tsubcomponents: {\n\t\tTableContainer,\n\t\tTable,\n\t\tTableHead,\n\t\tTableRow,\n\t\tTableHeader,\n\t\tTableBody,\n\t\tTableCell\n\t},\n\tparameters: {\n\t\tdocs: {\n\t\t\tpage: mdx\n\t\t}\n\t}\n};\nexport const Default = () => {\n\tconst rows = [{\n\t\tid: "load-balancer-1",\n\t\tname: "Load Balancer 1",\n\t\trule: "Round robin",\n\t\tStatus: "Starting",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-2",\n\t\tname: "Load Balancer 2",\n\t\trule: "DNS delegation",\n\t\tstatus: "Active",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-3",\n\t\tname: "Load Balancer 3",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-4",\n\t\tname: "Load Balancer 4",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-5",\n\t\tname: "Load Balancer 5",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-6",\n\t\tname: "Load Balancer 6",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}, {\n\t\tid: "load-balancer-7",\n\t\tname: "Load Balancer 7",\n\t\trule: "Round robin",\n\t\tstatus: "Disabled",\n\t\tother: "Test",\n\t\texample: "22"\n\t}];\n\tconst headers = ["Name", "Rule", "Status", "Other", "Example"];\n\treturn <Table size="lg" useZebraStyles={false} aria-label="sample table">\n\t\t\t<TableHead>\n\t\t\t\t<TableRow>\n\t\t\t\t\t{headers.map(header => <TableHeader id={header.key} key={header}>\n\t\t\t\t\t\t\t{header}\n\t\t\t\t\t\t</TableHeader>)}\n\t\t\t\t</TableRow>\n\t\t\t</TableHead>\n\t\t\t<TableBody>\n\t\t\t\t{rows.map(row => <TableRow key={row.id}>\n\t\t\t\t\t\t{Object.keys(row).filter(key => key !== "id").map(key => {\n\t\t\t\t\treturn <TableCell key={key}>{row[key]}</TableCell>;\n\t\t\t\t})}\n\t\t\t\t\t</TableRow>)}\n\t\t\t</TableBody>\n\t\t</Table>;\n};`,
  'SQL example': `-- Simple SQL file example\n-- Creating a table named 'employees'\nCREATE TABLE employees (\nid INT PRIMARY KEY,\nfirst_name VARCHAR(50),\nlast_name VARCHAR(50),\nemail VARCHAR(100),\ndepartment_id INT,\nhire_date DATE\n);\n-- Creating a table named 'departments'\nCREATE TABLE departments (\nid INT PRIMARY KEY,\nname VARCHAR(50)\n);\n-- Inserting data into the 'departments' table\nINSERT INTO departments (id, name) VALUES\n(1, 'Human Resources'),\n(2, 'Marketing'),\n(3, 'Sales'),\n(4, 'IT');\n-- Inserting data into the 'employees' table\nINSERT INTO employees (id, first_name, last_name, email, department_id, hire_date) VALUES\n(1, 'John', 'Doe', 'john.doe@example.com', 3, '2020-01-01'),\n(2, 'Jane', 'Doe', 'jane.doe@example.com', 2, '2019-06-15'),\n(3, 'Jim', 'Smith', 'jim.smith@example.com', 3, '2021-02-20');\n`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Single line code</h4>
    <br />
    <clabs-chat-code
      content="${codeExamples['single command']}"
      ?disable-line-ticks="${true}"
      ?disable-copy-button="${true}">
    </clabs-chat-code>
    <br />
    <h4>Single line command with copy</h4>
    <br />
    <clabs-chat-code
      content="${codeExamples['npm command']}"
      ?disable-line-ticks="${true}">
    </clabs-chat-code>
    <br />
    <h4>Multi line command</h4>
    <br />
    <clabs-chat-code
      content="${codeExamples['console multi']}"
      ?disable-line-ticks="${true}">
    </clabs-chat-code>
    <br />
    <h4>Python code example with language name</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>HTML with ticks</h4>
    <br />
    <clabs-chat-code content="${codeExamples['html example']}">
    </clabs-chat-code>`,
};

export const Editing = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Python example</h4>
    <clabs-chat-code
      ?editable="${true}"
      max-height="246px"
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="${true}"
      max-height="246px"
      content="${codeExamples['SQL example']}">
    </clabs-chat-code>
    <h4>JS carbon example</h4>
    <br />
    <clabs-chat-code
      max-height="492px"
      ?editable="${true}"
      content="${codeExamples['carbon datatable']}">
    </clabs-chat-code>`,
};

const playgroundControls = {
  CodeExample: {
    control: { type: 'select' },
    description: 'Code examples',
    options: Object.keys(codeExamples),
    table: { category: 'Code examples' },
  },
  DisableLineTicks: {
    control: { type: 'boolean' },
    description: 'Show/Hide line count ticks when displaying code',
    table: { category: 'Disable line ticks' },
  },
  Editable: {
    control: { type: 'boolean' },
    description: 'Allow editing of content',
    table: { category: 'Editable' },
  },
  DisableEditButton: {
    control: { type: 'boolean' },
    description: 'Show/Hide edit controls',
    table: { category: 'Disable edit button' },
  },
  DisableCopyButton: {
    control: { type: 'boolean' },
    description: 'Show/Hide copy button',
    table: { category: 'Disable copy button' },
  },
};

export const Playground = {
  argTypes: playgroundControls,
  args: defaultPlaygroundArgs,
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
   * @param {string} args.CodeExample - card type
   * @param {boolean} args.DisableLineTicks - Remove line numbers from lines
   * @param {boolean} args.Editable - Make code editable
   * @param {boolean} args.DisableEditButton - Remove editor button
   * @param {boolean} args.DisableCopyButton - Remove copy button
   */
  render: ({
    CodeExample,
    DisableLineTicks,
    Editable,
    DisableEditButton,
    DisableCopyButton,
  }) => html`
    <clabs-chat-code
      content="${codeExamples[CodeExample]}"
      ?editable="${Editable}"
      ?disable-line-ticks="${DisableLineTicks}"
      ?disable-copy-button="${DisableCopyButton}"
      ?disable-edit-button="${DisableEditButton}">
    </clabs-chat-code>
  `,
};
