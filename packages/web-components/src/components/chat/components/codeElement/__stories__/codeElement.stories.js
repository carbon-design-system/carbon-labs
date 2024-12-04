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
  COBOL: `IDENTIFICATION DIVISION.\nPROGRAM-ID. VARS.\nDATA DIVISION.\n\t*> working storage defines variables\n\tWORKING-STORAGE SECTION.\n\t*> define a number with a sign, 3 numbers, a decimal, and then\n\t*> two numbers aafter the decimal. by default it should be 0 filled\n\t01 FIRST-VAR PIC S9(3)V9(2).\n\t*> do the same thing as above but actually initialize\n\t*> to a number -123.45\n\t01 SECOND-VAR PIC S9(3)V9(2) VALUE -123.45.\n\t*> defines an alphabetic string and initialize it to abcdef\n\t01 THIRD-VAR PIC A(6) VALUE 'ABCDEF'.\n\t*> define an alphanumeric string and initialize it to a121$\n\t01 FOURTH-VAR PIC X(5) VALUE 'A121$'.\n\t*> create a grouped variable\n\t01 GROUP-VAR.\n\t\t05 SUBVAR-1 PIC 9(3) VALUE 337.\n\t\t*> create 3 alphanumerics, but use less than\n\t\t*> the allocated space for each of them\n\t\t05 SUBVAR-2 PIC X(15) VALUE 'LALALALA'.\n\t\t05 SUBVAR-3 PIC X(15) VALUE 'LALALA'.\n\t\t05 SUBVAR-4 PIC X(15) VALUE 'LALALA'.\n*> print our variables\nPROCEDURE DIVISION.\n\tDISPLAY "1ST VAR :"FIRST-VAR.\n\tDISPLAY "2ND VAR :"SECOND-VAR.\n\tDISPLAY "3RD VAR :"THIRD-VAR.\n\tDISPLAY "4TH VAR :"FOURTH-VAR.\n\tDISPLAY "GROUP VAR :"GROUP-VAR.\n\tSTOP RUN.`,
  Java: `public class BinaryConverter {\n\t\n\tpublic static void main(String[] args){\n\t\tfor(int i = -5; i < 33; i++){\n\t\t\tSystem.out.println(i + ": " + toBinary(i));\n\t\t\tSystem.out.println(i);\n\t\t\t//always another way\n\t\t\tSystem.out.println(i + ": " + Integer.toBinaryString(i));\n\t\t}\n\t}\n\t\n\t/*\n\t * pre: none\n\t * post: returns a String with base10Num in base 2\n\t */\n\tpublic static String toBinary(int base10Num){\n\t\tboolean isNeg = base10Num < 0;\n\t\tbase10Num = Math.abs(base10Num);\n\t\tString result = "";\n\t\t\n\t\twhile(base10Num > 1){\n\t\t\tresult = (base10Num % 2) + result;\n\t\t\tbase10Num /= 2;\n\t\t}\n\t\tassert base10Num == 0 || base10Num == 1 : "value is not <= 1: " + base10Num;\n\t\t\n\t\tresult = base10Num + result;\n\t\tassert all0sAnd1s(result);\n\t\t\n\t\tif( isNeg )\n\t\t\tresult = "-" + result;\n\t\treturn result;\n\t}\n\t\n\t/*\n\t * pre: cal != null\n\t * post: return true if val consists only of characters 1 and 0, false otherwise\n\t */\n\tpublic static boolean all0sAnd1s(String val){\n\t\tassert val != null : "Failed precondition all0sAnd1s. parameter cannot be null";\n\t\tboolean all = true;\n\t\tint i = 0;\n\t\tchar c;\n\t\t\n\t\twhile(all && i < val.length()){\n\t\t\tc = val.charAt(i);\n\t\t\tall = c == '0' || c == '1';\n\t\t\ti++;\n\t\t}\n\t\treturn all;\n\t}\n}`,
  'C++':
    '#include <iostream>\nusing namespace std;\n\n\nint main() {\n\tint x = 5;\n\tint y = 6;\n\tint sum = x + y;\n\tcout << sum;\n\treturn 0;\n}\n',
  JavaScript:
    '// A simple JavaScript function to calculate the area of a rectangle\nfunction calculateRectangleArea(length, width) {\n\treturn length * width;\n}\n\n// Example usage:\nlet area = calculateRectangleArea(5, 10);\nconsole.log("Area:", area); // Output: Area: 50',
  FORTRAN: `C AREA OF A TRIANGLE - HERON'S FORMULA\nC INPUT - CARD READER UNIT 5, INTEGER INPUT\nC OUTPUT -\nC INTEGER VARIABLES START WITH I,J,K,L,M OR N\n\t\t\tREAD(5,501) IA,IB,IC\n\t501 FORMAT(3I5)\n\t\t\tIF (IA) 701, 777, 701\n\t701 IF (IB) 702, 777, 702\n\t702 IF (IC) 703, 777, 703\n\t777 STOP 1\n\t703 S = (IA + IB + IC) / 2.0\n\t\t\tAREA = SQRT( S * (S - IA) * (S - IB) * (S - IC) )\n\t\t\tWRITE(6,801) IA,IB,IC,AREA\n\t801 FORMAT(4H A= ,I5,5H  B= ,I5,5H  C= ,I5,8H  AREA= ,F10.2, $13H SQUARE UNITS)\n\t\t\tSTOP\n\t\t\tEND\n`,
  Malbolge:
    "(=<`$9]7<5YXz7wT.3,+O/o'K%$H'~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^][ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm",
  'C++ 2':
    '#include <iostream>\n#include "llama.cpp/llama.h"\n\nint main() {\n\tllama_model *model = llama_load_model_from_file("path/to/model.bin"); \n\n\tif (model == nullptr) {\n\t\tstd::cerr << "Failed to load model.";\n\t\treturn 1;\n\t}\n\n\tstd::string prompt = "Hello, how are you today?";\n\tllama_context *ctx = llama_new_context_with_model(model, 512); \n\n\tstd::cout << "Prompt: " << prompt << std::endl;\n\tstd::cout << "Response: ";\n\n\tfor (int i = 0; i < 100; ++i) {\n\t\tllama_token token = llama_sample_token(ctx, nullptr);\n\t\tstd::cout << llama_token_to_str(model, token);\n\t}\n\n\tstd::cout << std::endl;\n\n\tllama_free_context(ctx);\n\tllama_free_model(model);\n\n\treturn 0;\n}',
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>Single line code</h4>
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
    <h4>Python example with no coloring or ticks</h4>
    <clabs-chat-code
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <h4>SQL example with ticks</h4>
    <clabs-chat-code
      content="${codeExamples['SQL example']}"
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
    <h4>C++ example</h4>
    <br />
    <clabs-chat-code content="${codeExamples['C++']}"> </clabs-chat-code>
    <br />
    <h4>HTML with ticks</h4>
    <br />
    <clabs-chat-code content="${codeExamples['html example']}">
    </clabs-chat-code>
    <br />
    <h4>COBOL example</h4>
    <br />
    <clabs-chat-code content="${codeExamples['COBOL']}"> </clabs-chat-code>
    <br />
    <h4>Java example</h4>
    <br />
    <clabs-chat-code content="${codeExamples['Java']}"> </clabs-chat-code>
    <br />
    <h4>JS example</h4>
    <clabs-chat-code content="${codeExamples['JavaScript']}"> </clabs-chat-code>
    <br />
    <h4>FORTRAN example</h4>
    <clabs-chat-code content="${codeExamples['FORTRAN']}"> </clabs-chat-code>
    <br />
    <h4>Malbolge example</h4>
    <br />
    <clabs-chat-code content="${codeExamples['Malbolge']}"> </clabs-chat-code>
  `,
};

export const Editing = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`<h4>Python example (no coloring or ticks)</h4>
    <clabs-chat-code
      ?editable="${true}"
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no ticks)</h4>
    <clabs-chat-code
      ?editable="${true}"
      disable-line-ticks
      max-height="246px"
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring)</h4>
    <clabs-chat-code
      ?editable="${true}"
      disable-coloring
      max-height="246px"
      content="${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="${true}"
      max-height="246px"
      content="${codeExamples['SQL example']}">
    </clabs-chat-code>
    <br />
    <h4>C++ example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${true}"
      content="${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <h4>JS carbon example</h4>
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
