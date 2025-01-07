import"./codeElement-BTI6nZTI.js";import{x as l}from"./lit-element-CKvUdWNz.js";import"./button-BQSJpxOj.js";import"./16-DiV1dIgx.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const f={title:"Components/AI Components/Code",component:"clabs-chat-code"},e={render:()=>l` <clabs-chat-code
    content="${`from math import sqrt
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
`}">
  </clabs-chat-code>`},E={content:`from math import sqrt
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
`,editable:!1,disableLineTicks:!1,disableEditButton:!0,disableCopyButton:!0},t={"single command":"node -v","npm command":"$ npm install --save carbon-components","console multi":`user@Macbook-Air server % npm run build
user@Macbook-Air server % npm run lint:styles --fix
user@Macbook-Air server % npm format:write
user@Macbook-Air server % python3 server.py`,"html example":`<!doctype html>
<html>
	<head>
		<title>This is the title of the webpage</title>
	<script src="myscripts.js"><\/script>
	</head>
	<body>
		<p>This is an example paragraph. Anything in the <strong>body</strong> tag will appear on the page, just like this <strong>p</strong> tag and its contents.</p>
	</body>
</html>`,"python code":`from math import sqrt
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
`,"carbon datatable":`import React from "react";
import { DataTable } from "..";
const {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow
} = DataTable;
import mdx from "../DataTable.mdx";
import "./datatable-story.scss";
export default {
	title: "Components/DataTable/Basic",
	component: DataTable,
	subcomponents: {
		TableContainer,
		Table,
		TableHead,
		TableRow,
		TableHeader,
		TableBody,
		TableCell
	},
	parameters: {
		docs: {
			page: mdx
		}
	}
};
export const Default = () => {
	const rows = [{
		id: "load-balancer-1",
		name: "Load Balancer 1",
		rule: "Round robin",
		Status: "Starting",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-2",
		name: "Load Balancer 2",
		rule: "DNS delegation",
		status: "Active",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-3",
		name: "Load Balancer 3",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-4",
		name: "Load Balancer 4",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-5",
		name: "Load Balancer 5",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-6",
		name: "Load Balancer 6",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}, {
		id: "load-balancer-7",
		name: "Load Balancer 7",
		rule: "Round robin",
		status: "Disabled",
		other: "Test",
		example: "22"
	}];
	const headers = ["Name", "Rule", "Status", "Other", "Example"];
	return <Table size="lg" useZebraStyles={false} aria-label="sample table">
			<TableHead>
				<TableRow>
					{headers.map(header => <TableHeader id={header.key} key={header}>
							{header}
						</TableHeader>)}
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map(row => <TableRow key={row.id}>
						{Object.keys(row).filter(key => key !== "id").map(key => {
					return <TableCell key={key}>{row[key]}</TableCell>;
				})}
					</TableRow>)}
			</TableBody>
		</Table>;
};`,"SQL example":`-- Simple SQL file example
-- Creating a table named 'employees'
CREATE TABLE employees (
id INT PRIMARY KEY,
first_name VARCHAR(50),
last_name VARCHAR(50),
email VARCHAR(100),
department_id INT,
hire_date DATE
);
-- Creating a table named 'departments'
CREATE TABLE departments (
id INT PRIMARY KEY,
name VARCHAR(50)
);
-- Inserting data into the 'departments' table
INSERT INTO departments (id, name) VALUES
(1, 'Human Resources'),
(2, 'Marketing'),
(3, 'Sales'),
(4, 'IT');
-- Inserting data into the 'employees' table
INSERT INTO employees (id, first_name, last_name, email, department_id, hire_date) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 3, '2020-01-01'),
(2, 'Jane', 'Doe', 'jane.doe@example.com', 2, '2019-06-15'),
(3, 'Jim', 'Smith', 'jim.smith@example.com', 3, '2021-02-20');
`,COBOL:`IDENTIFICATION DIVISION.
PROGRAM-ID. VARS.
DATA DIVISION.
	*> working storage defines variables
	WORKING-STORAGE SECTION.
	*> define a number with a sign, 3 numbers, a decimal, and then
	*> two numbers aafter the decimal. by default it should be 0 filled
	01 FIRST-VAR PIC S9(3)V9(2).
	*> do the same thing as above but actually initialize
	*> to a number -123.45
	01 SECOND-VAR PIC S9(3)V9(2) VALUE -123.45.
	*> defines an alphabetic string and initialize it to abcdef
	01 THIRD-VAR PIC A(6) VALUE 'ABCDEF'.
	*> define an alphanumeric string and initialize it to a121$
	01 FOURTH-VAR PIC X(5) VALUE 'A121$'.
	*> create a grouped variable
	01 GROUP-VAR.
		05 SUBVAR-1 PIC 9(3) VALUE 337.
		*> create 3 alphanumerics, but use less than
		*> the allocated space for each of them
		05 SUBVAR-2 PIC X(15) VALUE 'LALALALA'.
		05 SUBVAR-3 PIC X(15) VALUE 'LALALA'.
		05 SUBVAR-4 PIC X(15) VALUE 'LALALA'.
*> print our variables
PROCEDURE DIVISION.
	DISPLAY "1ST VAR :"FIRST-VAR.
	DISPLAY "2ND VAR :"SECOND-VAR.
	DISPLAY "3RD VAR :"THIRD-VAR.
	DISPLAY "4TH VAR :"FOURTH-VAR.
	DISPLAY "GROUP VAR :"GROUP-VAR.
	STOP RUN.`,Java:`public class BinaryConverter {
	
	public static void main(String[] args){
		for(int i = -5; i < 33; i++){
			System.out.println(i + ": " + toBinary(i));
			System.out.println(i);
			//always another way
			System.out.println(i + ": " + Integer.toBinaryString(i));
		}
	}
	
	/*
	 * pre: none
	 * post: returns a String with base10Num in base 2
	 */
	public static String toBinary(int base10Num){
		boolean isNeg = base10Num < 0;
		base10Num = Math.abs(base10Num);
		String result = "";
		
		while(base10Num > 1){
			result = (base10Num % 2) + result;
			base10Num /= 2;
		}
		assert base10Num == 0 || base10Num == 1 : "value is not <= 1: " + base10Num;
		
		result = base10Num + result;
		assert all0sAnd1s(result);
		
		if( isNeg )
			result = "-" + result;
		return result;
	}
	
	/*
	 * pre: cal != null
	 * post: return true if val consists only of characters 1 and 0, false otherwise
	 */
	public static boolean all0sAnd1s(String val){
		assert val != null : "Failed precondition all0sAnd1s. parameter cannot be null";
		boolean all = true;
		int i = 0;
		char c;
		
		while(all && i < val.length()){
			c = val.charAt(i);
			all = c == '0' || c == '1';
			i++;
		}
		return all;
	}
}`,"C++":`#include <iostream>
using namespace std;


int main() {
	int x = 5;
	int y = 6;
	int sum = x + y;
	cout << sum;
	return 0;
}
`,JavaScript:`// A simple JavaScript function to calculate the area of a rectangle
function calculateRectangleArea(length, width) {
	return length * width;
}

// Example usage:
let area = calculateRectangleArea(5, 10);
console.log("Area:", area); // Output: Area: 50`,FORTRAN:`C AREA OF A TRIANGLE - HERON'S FORMULA
C INPUT - CARD READER UNIT 5, INTEGER INPUT
C OUTPUT -
C INTEGER VARIABLES START WITH I,J,K,L,M OR N
			READ(5,501) IA,IB,IC
	501 FORMAT(3I5)
			IF (IA) 701, 777, 701
	701 IF (IB) 702, 777, 702
	702 IF (IC) 703, 777, 703
	777 STOP 1
	703 S = (IA + IB + IC) / 2.0
			AREA = SQRT( S * (S - IA) * (S - IB) * (S - IC) )
			WRITE(6,801) IA,IB,IC,AREA
	801 FORMAT(4H A= ,I5,5H  B= ,I5,5H  C= ,I5,8H  AREA= ,F10.2, $13H SQUARE UNITS)
			STOP
			END
`,Malbolge:"(=<`$9]7<5YXz7wT.3,+O/o'K%$H'~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^][ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm","C++ 2":`#include <iostream>
#include "llama.cpp/llama.h"

int main() {
	llama_model *model = llama_load_model_from_file("path/to/model.bin"); 

	if (model == nullptr) {
		std::cerr << "Failed to load model.";
		return 1;
	}

	std::string prompt = "Hello, how are you today?";
	llama_context *ctx = llama_new_context_with_model(model, 512); 

	std::cout << "Prompt: " << prompt << std::endl;
	std::cout << "Response: ";

	for (int i = 0; i < 100; ++i) {
		llama_token token = llama_sample_token(ctx, nullptr);
		std::cout << llama_token_to_str(model, token);
	}

	std::cout << std::endl;

	llama_free_context(ctx);
	llama_free_model(model);

	return 0;
}`},n={render:()=>l`
    <h4>Single line code</h4>
    <br />
    <clabs-chat-code
      content="${t["single command"]}"
      ?disable-line-ticks="${!0}"
      ?disable-copy-button="${!0}">
    </clabs-chat-code>
    <br />
    <h4>Single line command with copy</h4>
    <br />
    <clabs-chat-code
      content="${t["npm command"]}"
      ?disable-line-ticks="${!0}">
    </clabs-chat-code>
    <br />
    <h4>Multi line command</h4>
    <br />
    <clabs-chat-code
      content="${t["console multi"]}"
      ?disable-line-ticks="${!0}">
    </clabs-chat-code>
    <br />
    <h4>Python example with no coloring or ticks</h4>
    <clabs-chat-code
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="${t["python code"]}">
    </clabs-chat-code>
    <h4>SQL example with ticks</h4>
    <clabs-chat-code
      content="${t["SQL example"]}"
      ?disable-line-ticks="${!0}">
    </clabs-chat-code>
    <br />
    <h4>Python code example with language name</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      content="${t["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>C++ example</h4>
    <br />
    <clabs-chat-code content="${t["C++"]}"> </clabs-chat-code>
    <br />
    <h4>HTML with ticks</h4>
    <br />
    <clabs-chat-code content="${t["html example"]}">
    </clabs-chat-code>
    <br />
    <h4>COBOL example</h4>
    <br />
    <clabs-chat-code content="${t.COBOL}"> </clabs-chat-code>
    <br />
    <h4>Java example</h4>
    <br />
    <clabs-chat-code content="${t.Java}"> </clabs-chat-code>
    <br />
    <h4>JS example</h4>
    <clabs-chat-code content="${t.JavaScript}"> </clabs-chat-code>
    <br />
    <h4>FORTRAN example</h4>
    <clabs-chat-code content="${t.FORTRAN}"> </clabs-chat-code>
    <br />
    <h4>Malbolge example</h4>
    <br />
    <clabs-chat-code content="${t.Malbolge}"> </clabs-chat-code>
  `},a={render:()=>l`<h4>Python example (no coloring or ticks)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="${t["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no ticks)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      disable-line-ticks
      max-height="246px"
      content="${t["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      disable-coloring
      max-height="246px"
      content="${t["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="${!0}"
      max-height="246px"
      content="${t["SQL example"]}">
    </clabs-chat-code>
    <br />
    <h4>C++ example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${!0}"
      content="${t["C++"]}">
    </clabs-chat-code>
    <br />
    <h4>JS carbon example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${!0}"
      content="${t["carbon datatable"]}">
    </clabs-chat-code>`},I={CodeExample:{control:{type:"select"},description:"Code examples",options:Object.keys(t),table:{category:"Code examples"}},DisableLineTicks:{control:{type:"boolean"},description:"Show/Hide line count ticks when displaying code",table:{category:"Disable line ticks"}},Editable:{control:{type:"boolean"},description:"Allow editing of content",table:{category:"Editable"}},DisableEditButton:{control:{type:"boolean"},description:"Show/Hide edit controls",table:{category:"Disable edit button"}},DisableCopyButton:{control:{type:"boolean"},description:"Show/Hide copy button",table:{category:"Disable copy button"}}},o={argTypes:I,args:E,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({CodeExample:y,DisableLineTicks:A,Editable:R,DisableEditButton:T,DisableCopyButton:S})=>l`
    <clabs-chat-code
      content="${t[y]}"
      ?editable="${R}"
      ?disable-line-ticks="${A}"
      ?disable-copy-button="${S}"
      ?disable-edit-button="${T}">
    </clabs-chat-code>
  `};var r,c,i;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-code
    content="\${'from math import sqrt\\n#prime function to check given number prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif itr == 1:\\n\\t\\treturn True\\n\\t#if given number divided by itr or not\\n\\tif number % itr == 0:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\treturn False\\n\\treturn True\\n'}">
  </clabs-chat-code>\`
}`,...(i=(c=e.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var s,d,b;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <h4>Single line code</h4>
    <br />
    <clabs-chat-code
      content="\${codeExamples['single command']}"
      ?disable-line-ticks="\${true}"
      ?disable-copy-button="\${true}">
    </clabs-chat-code>
    <br />
    <h4>Single line command with copy</h4>
    <br />
    <clabs-chat-code
      content="\${codeExamples['npm command']}"
      ?disable-line-ticks="\${true}">
    </clabs-chat-code>
    <br />
    <h4>Multi line command</h4>
    <br />
    <clabs-chat-code
      content="\${codeExamples['console multi']}"
      ?disable-line-ticks="\${true}">
    </clabs-chat-code>
    <br />
    <h4>Python example with no coloring or ticks</h4>
    <clabs-chat-code
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <h4>SQL example with ticks</h4>
    <clabs-chat-code
      content="\${codeExamples['SQL example']}"
      ?disable-line-ticks="\${true}">
    </clabs-chat-code>
    <br />
    <h4>Python code example with language name</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>C++ example</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['C++']}"> </clabs-chat-code>
    <br />
    <h4>HTML with ticks</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['html example']}">
    </clabs-chat-code>
    <br />
    <h4>COBOL example</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['COBOL']}"> </clabs-chat-code>
    <br />
    <h4>Java example</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['Java']}"> </clabs-chat-code>
    <br />
    <h4>JS example</h4>
    <clabs-chat-code content="\${codeExamples['JavaScript']}"> </clabs-chat-code>
    <br />
    <h4>FORTRAN example</h4>
    <clabs-chat-code content="\${codeExamples['FORTRAN']}"> </clabs-chat-code>
    <br />
    <h4>Malbolge example</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['Malbolge']}"> </clabs-chat-code>
  \`
}`,...(b=(d=n.parameters)==null?void 0:d.docs)==null?void 0:b.source}}};var m,h,p;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`<h4>Python example (no coloring or ticks)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      max-height="246px"
      disable-line-ticks
      disable-coloring
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no ticks)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      disable-line-ticks
      max-height="246px"
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      disable-coloring
      max-height="246px"
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="\${true}"
      max-height="246px"
      content="\${codeExamples['SQL example']}">
    </clabs-chat-code>
    <br />
    <h4>C++ example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="\${true}"
      content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <h4>JS carbon example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="\${true}"
      content="\${codeExamples['carbon datatable']}">
    </clabs-chat-code>\`
}`,...(p=(h=a.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var u,g,x;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  argTypes: playgroundControls,
  args: defaultPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default'
    }
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
    DisableCopyButton
  }) => html\`
    <clabs-chat-code
      content="\${codeExamples[CodeExample]}"
      ?editable="\${Editable}"
      ?disable-line-ticks="\${DisableLineTicks}"
      ?disable-copy-button="\${DisableCopyButton}"
      ?disable-edit-button="\${DisableEditButton}">
    </clabs-chat-code>
  \`
}`,...(x=(g=o.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};const C=["Default","Showcase","Editing","Playground"],O=Object.freeze(Object.defineProperty({__proto__:null,Default:e,Editing:a,Playground:o,Showcase:n,__namedExportsOrder:C,default:f},Symbol.toStringTag,{value:"Module"}));export{O as C};
