import"./codeElement-BAR8enjB.js";import{b as t}from"./iframe-CklRD_a7.js";import"./button-BFHOK1Jb.js";import"./button-skeleton-VQRUfe8G.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const I={title:"Components/AI Components/Code",component:"clabs-chat-code"},n={render:()=>t` <clabs-chat-code
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
	return True`}">
  </clabs-chat-code>`},w={content:`from math import sqrt
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
	return True`,editable:!1,disableLineTicks:!1,disableEditButton:!0,disableCopyButton:!0},F={"code-copypaste-button":"Copier le code","code-copypaste-success":"Copié!","code-estimated-warning":"(estimé)","code-editing-validation":"Appliquer","code-editing-cancelled":"Annuler","code-line-descriptor":"lignes"},e={cmd:"node -v",bash:"$ npm install --save carbon-components","console multi":`user@Macbook-Air server % npm run build
user@Macbook-Air server % npm run lint:styles --fix
user@Macbook-Air server % npm format:write
user@Macbook-Air server % python3 server.py`,html:`<!doctype html>
<html>
	<head>
		<title>This is the title of the webpage</title>
	<script src="myscripts.js"><\/script>
	</head>
	<body>
		<p>This is an example paragraph. Anything in the <strong>body</strong> tag will appear on the page, just like this <strong>p</strong> tag and its contents.</p>
	</body>
</html>`,CSS:`@import url('style.css');
@media(min-width:760px) {
	.box {
		grid-template-rows: auto 1fr;
	}
body {
	--main-color: #ff0;
	margin:0;
	animation: spin 3s infinite;
}
.container {
	content:"test";
	display: flex;
	padding: 10px;
}
.item[data-id="1"]:hover::after {
	content: attr(data-id);
	color:red !important;
}`,"python code":`from math import sqrt
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
	return True`,"C++":`#include <iostream>
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

	return 0;}`,"SQL example":`-- Simple SQL file example
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
(3, 'Jim', 'Smith', 'jim.smith@example.com', 3, '2021-02-20');`,COBOL:`IDENTIFICATION DIVISION.
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
}`,JavaScript:`// A simple JavaScript function to calculate the area of a rectangle
function calculateRectangleArea(length, width) {
	return length * width;
}

// Example usage:
let area = calculateRectangleArea(5, 10);
console.log("Area:", area); // Output: Area: 50`,R:`# Fibonacci sequence function in R
fibonacci <- function(n) {
  if (n <= 0) {
    return(NULL)
  } else if (n == 1) {
    return(0)
  } else if (n == 2) {
    return(1)
  } else {
    a <- 0
    b <- 1
    for (i in 3:n) {
      c <- a + b
      a <- b
      b <- c
    }
    return(b)
  }
}
cat("Fibonacci(10): ", fibonacci(10), "
")`,Lisp:`; Fibonacci sequence function in Lisp
(defun fibonacci (n)
(cond ((< n 1) nil)
((= n 1) 0)
((= n 2) 1)
(t (let ((a 0)
(b 1))
(loop for i from 3 to n
do (let ((c (+ a b)))
(setf a b)
(setf b c)))
b)))))
(print (fibonacci 10))`,"C#":`// Fibonacci sequence function in C#
using System;
class Program
{
  static void Main()
  {
  Console.WriteLine("Fibonacci(10): " + Fibonacci(10));
  }
  static int Fibonacci(int n)
  {
  if (n <= 0)
  {
  return -1;
  }
  else if (n == 1)
  {
  return 0;
  }
  else if (n == 2)
  {
  return 1;
  }
  else
  {
  int a = 0;
  int b = 1;
  for (int i = 3; i <= n; i++)
  {
  int c = a + b;
  a = b;
  b = c;
  }
  return b;
  }
  }
}`,PHP:`<?php
// Fibonacci sequence function in PHP
function fibonacci($n)
{
	if ($n <= 0) {
		return null;
	} elseif ($n == 1) {
		return 0;
	} elseif ($n == 2) {
		return 1;
	} else {
		$a = 0;
		$b = 1;
		for ($i = 3; $i <= $n; $i++) {
			$c = $a + $b;
			$a = $b;
			$b = $c;
		}
		return $b;
	}
}
echo "Fibonacci(10): " . fibonacci(10) . PHP_EOL;`,GO:`package main
import (
	"fmt"
	"math/rand"
)
func main() {
	rand.Seed(time.Now().UnixNano())
	fmt.Println("My favorite number is", rand.Intn(100))
}`,Rust:`fn main() {
	let mut rng = rand::thread_rng();
	let favorite_number = rng.gen_range(1..100);
	println!("My favorite number is {}", favorite_number);
}`,GraphQL:`type Query {
	favoriteNumber: Int!
}
type Mutation {
	randomizeFavoriteNumber: Int!
}
schema {
	query: Query
	mutation: Mutation
}`,JSON:`{
  "favoriteNumber": {
    "min": 1,
    "max": 100,
    "number": 73,
    "attempts": [12,34,56,67,73]
  }
}`,MATLAB:`function favoriteNumber = getFavoriteNumber()
favoriteNumber = randi([1, 100]);
end
favoriteNumber = getFavoriteNumber();
while favoriteNumber < 10
favoriteNumber = getFavoriteNumber();
end
disp(favoriteNumber)`,Dockerfile:`FROM golang:1.17 as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN go build -o main .
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main ./
EXPOSE 8080
CMD ["./main"]`,FORTRAN:`C AREA OF A TRIANGLE - HERON'S FORMULA
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
`,Malbolge:"(=<`$9]7<5YXz7wT.3,+O/o'K%$H'~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^][ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm",TypeScript:`import React from "react";
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
};`},a={render:()=>t`
    <h4>Single line code without copy</h4>
    <br />
    <clabs-chat-code
      content="${e.cmd}"
      ?disable-line-ticks="${!0}"
      ?disable-copy-button="${!0}">
    </clabs-chat-code>
    <br />
    <h4>Single line command with copy</h4>
    <br />
    <clabs-chat-code
      content="${e.bash}"
      ?disable-line-ticks="${!0}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Maximum height</h3>
    <br />
    <h4>C++ with no height set</h4>
    <clabs-chat-code content="${e["C++"]}"> </clabs-chat-code>
    <br />
    <h4>C++ with no height set and collapsable</h4>
    <clabs-chat-code enable-block-collapse content="${e["C++"]}">
    </clabs-chat-code>
    <br />
    <h4>C++ with max-height 200px</h4>
    <clabs-chat-code max-height="200px" content="${e["C++"]}">
    </clabs-chat-code>
    <br />

    <h3>Coloring and Ticks</h3>
    <br />
    <h4>Python example with no coloring or ticks</h4>
    <clabs-chat-code
      disable-line-ticks
      disable-coloring
      content="${e["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>SQL example without ticks</h4>
    <clabs-chat-code
      content="${e["SQL example"]}"
      ?disable-line-ticks="${!0}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Info display (language and count)</h3>
    <br />
    <h4>Python code example with language name: user language</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      displayed-language="user language"
      content="${e["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>C++ example with guessed language from highlight js</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      enable-estimated-language
      content="${e["C++"]}">
    </clabs-chat-code>
    <br />
    <br />
    <h4>C++ example with line count (no ticks)</h4>
    <br />
    <clabs-chat-code
      disable-line-ticks
      display-line-count
      content="${e["C++"]}">
    </clabs-chat-code>
    <br />
    <br />
    <h4>C++ example with both</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      enable-estimated-language
      display-line-count
      content="${e["C++"]}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Tab sizing</h3>
    <br />
    <h4>HTML example with default tab-size</h4>
    <br />
    <clabs-chat-code content="${e.html}"> </clabs-chat-code>
    <br />
    <h4>HTML example with tab-size=6</h4>
    <br />
    <clabs-chat-code tab-size="6" content="${e.html}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Localization</h3>
    <br />
    <h4>HTML example with customLabels in french</h4>
    <br />
    <clabs-chat-code
      .customLabels="${F}"
      enable-language-display
      displayed-language="HTML"
      display-line-count
      editable
      content="${e.html}">
    </clabs-chat-code>
  `},i={render:()=>t` ${Object.keys(e).map(c=>t`
          <clabs-chat-code
            max-height="300px"
            enable-language-display
            enable-estimated-language
            display-line-count
            displayed-language=${c}
            content="${e[c]}">
          </clabs-chat-code>
          <br />
        `)}`},r={render:()=>t`
      <h3>Comparison</h3>
      <br />
      <clabs-chat-code
        enable-edit-button
        show-content-differences
        disable-edit-button
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
	return True`}"
        new-content="${`from math import sqrt
#hey

#added lines here
#prime function to check any number and see if  prime or not:
def Prime(number,itr):
	#base condition


	if !number % itr == 1:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		print("number is not prime")
		return False
	print("number is prime")
	return True`}">
      </clabs-chat-code>
      <br /><br />
      <h3>Source code</h3>
      <br />
      <clabs-chat-code
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
	return True`}">
      </clabs-chat-code>
      <br />
      <br />
      <h3>Edited Code</h3>
      <br />
      <clabs-chat-code
        content="${`from math import sqrt
#hey
#added lines here
#prime function to check any number and see if  prime or not:
def Prime(number,itr):
	#base condition


	if !number % itr == 1:
		return False
	#Recursive function Call
	if Prime(number,itr-1) == False:
		print("number is not prime")
		return False
	print("number is prime")
	return True`}">
      </clabs-chat-code>
    `},o={render:()=>t` <h4>
      JSON example without newlines/tabs and ticks, coloring & collapse
    </h4>
    <clabs-chat-code
      ?editable="${!0}"
      max-height="246px"
      auto-indent
      disable-line-ticks
      content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"fields":[{"name":"Country name","num_values":165,"sample_values":["Afghanistan","Albania","Algeria","Angola","Argentina"]},{"max":2023,"min":2005,"name":"year"},{"max":8.019,"min":1.281,"name":"Life Ladder"},{"max":11.676,"min":5.527,"name":"Log GDP per capita"},{"max":0.987,"min":0.228,"name":"Social support"},{"max":74.6,"min":6.72,"name":"Healthy life expectancy at birth"},{"max":0.985,"min":0.228,"name":"Freedom to make life choices"},{"max":0.7,"min":-0.34,"name":"Generosity"},{"max":0.983,"min":0.035,"name":"Perceptions of corruption"},{"max":0.884,"min":0.179,"name":"Positive affect"},{"max":0.705,"min":0.083,"name":"Negative affect"}],"file":"Happiness.csv"},"encoding":{"x":{"field":"Healthy life expectancy at birth","type":"quantitative"},"y":{"field":"Life Ladder","type":"quantitative"}},"mark":"point"}'>
    </clabs-chat-code>
    <br />

    <h4>JSON example with ticks, coloring & collapse</h4>
    <clabs-chat-code
      ?editable="${!0}"
      max-height="246px"
      render-language="json"
      content='{
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "fields": [
            {
                "name": "Country name",
                "num_values": 165,
                "sample_values": [
                    "Afghanistan",
                    "Albania",
                    "Algeria",
                    "Angola",
                    "Argentina"
                ]
            },
            {
                "max": 2023,
                "min": 2005,
                "name": "year"
            },
            {
                "max": 8.019,
                "min": 1.281,
                "name": "Life Ladder"
            },
            {
                "max": 11.676,
                "min": 5.527,
                "name": "Log GDP per capita"
            },
            {
                "max": 0.987,
                "min": 0.228,
                "name": "Social support"
            },
            {
                "max": 74.6,
                "min": 6.72,
                "name": "Healthy life expectancy at birth"
            },
            {
                "max": 0.985,
                "min": 0.228,
                "name": "Freedom to make life choices"
            },
            {
                "max": 0.7,
                "min": -0.34,
                "name": "Generosity"
            },
            {
                "max": 0.983,
                "min": 0.035,
                "name": "Perceptions of corruption"
            },
            {
                "max": 0.884,
                "min": 0.179,
                "name": "Positive affect"
            },
            {
                "max": 0.705,
                "min": 0.083,
                "name": "Negative affect"
            }
        ],
        "file": "Happiness.csv"
    },
    "encoding": {
        "x": {
            "field": "Healthy life expectancy at birth",
            "type": "quantitative"
        },
        "y": {
            "field": "Life Ladder",
            "type": "quantitative"
        }
    },
    "mark": "point"
}'>
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring or ticks)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      max-height="246px"
      enable-block-collapse
      disable-line-ticks
      disable-coloring
      content="${e["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no ticks)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      enable-block-collapse
      disable-line-ticks
      max-height="246px"
      content="${e["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring)</h4>
    <clabs-chat-code
      ?editable="${!0}"
      disable-coloring
      enable-block-collapse
      max-height="246px"
      content="${e["python code"]}">
    </clabs-chat-code>
    <br />
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="${!0}"
      enable-block-collapse
      max-height="500px"
      content="${e["SQL example"]}">
    </clabs-chat-code>
    <br />
    <h4>FORTRAN example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${!0}"
      content="${e.FORTRAN}">
    </clabs-chat-code>
    <br />
    <h4>MATLAB example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${!0}"
      content="${e.MATLAB}">
    </clabs-chat-code>
    <br />
    <h4>Dockerfile example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="${!0}"
      content="${e.Dockerfile}">
    </clabs-chat-code>`},N={CodeExample:{control:{type:"select"},description:"Code examples",options:Object.keys(e),table:{category:"Code examples"}},DisableLineTicks:{control:{type:"boolean"},description:"Show/Hide line count ticks when displaying code",table:{category:"Disable line ticks"}},Editable:{control:{type:"boolean"},description:"Allow editing of content",table:{category:"Editable"}},DisableEditButton:{control:{type:"boolean"},description:"Show/Hide edit controls",table:{category:"Disable edit button"}},DisableCopyButton:{control:{type:"boolean"},description:"Show/Hide copy button",table:{category:"Disable copy button"}}},l={argTypes:N,args:w,parameters:{controls:{expanded:!0},layout:"fullscreen",viewport:{defaultViewport:"storybook-default"}},render:({CodeExample:c,DisableLineTicks:S,Editable:L,DisableEditButton:E,DisableCopyButton:P})=>t`
    <clabs-chat-code
      content="${e[c]}"
      ?editable="${L}"
      ?disable-line-ticks="${S}"
      ?disable-copy-button="${P}"
      ?disable-edit-button="${E}">
    </clabs-chat-code>
  `};var s,m,d;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-code
    content="\${'from math import sqrt\\n#prime function to check given number prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif itr == 1:\\n\\t\\treturn True\\n\\t#if given number divided by itr or not\\n\\tif number % itr == 0:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\treturn False\\n\\treturn True'}">
  </clabs-chat-code>\`
}`,...(d=(m=n.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var b,u,h;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
    <h4>Single line code without copy</h4>
    <br />
    <clabs-chat-code
      content="\${codeExamples['cmd']}"
      ?disable-line-ticks="\${true}"
      ?disable-copy-button="\${true}">
    </clabs-chat-code>
    <br />
    <h4>Single line command with copy</h4>
    <br />
    <clabs-chat-code
      content="\${codeExamples['bash']}"
      ?disable-line-ticks="\${true}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Maximum height</h3>
    <br />
    <h4>C++ with no height set</h4>
    <clabs-chat-code content="\${codeExamples['C++']}"> </clabs-chat-code>
    <br />
    <h4>C++ with no height set and collapsable</h4>
    <clabs-chat-code enable-block-collapse content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <h4>C++ with max-height 200px</h4>
    <clabs-chat-code max-height="200px" content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />

    <h3>Coloring and Ticks</h3>
    <br />
    <h4>Python example with no coloring or ticks</h4>
    <clabs-chat-code
      disable-line-ticks
      disable-coloring
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>SQL example without ticks</h4>
    <clabs-chat-code
      content="\${codeExamples['SQL example']}"
      ?disable-line-ticks="\${true}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Info display (language and count)</h3>
    <br />
    <h4>Python code example with language name: user language</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      displayed-language="user language"
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>C++ example with guessed language from highlight js</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      enable-estimated-language
      content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <br />
    <h4>C++ example with line count (no ticks)</h4>
    <br />
    <clabs-chat-code
      disable-line-ticks
      display-line-count
      content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <br />
    <h4>C++ example with both</h4>
    <br />
    <clabs-chat-code
      enable-language-display
      enable-estimated-language
      display-line-count
      content="\${codeExamples['C++']}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Tab sizing</h3>
    <br />
    <h4>HTML example with default tab-size</h4>
    <br />
    <clabs-chat-code content="\${codeExamples['html']}"> </clabs-chat-code>
    <br />
    <h4>HTML example with tab-size=6</h4>
    <br />
    <clabs-chat-code tab-size="6" content="\${codeExamples['html']}">
    </clabs-chat-code>
    <br />
    <br />
    <h3>Localization</h3>
    <br />
    <h4>HTML example with customLabels in french</h4>
    <br />
    <clabs-chat-code
      .customLabels="\${frenchLocalized}"
      enable-language-display
      displayed-language="HTML"
      display-line-count
      editable
      content="\${codeExamples['html']}">
    </clabs-chat-code>
  \`
}`,...(h=(u=a.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var p,g,f;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` \${Object.keys(codeExamples).map(key => html\`
          <clabs-chat-code
            max-height="300px"
            enable-language-display
            enable-estimated-language
            display-line-count
            displayed-language=\${key}
            content="\${codeExamples[key]}">
          </clabs-chat-code>
          <br />
        \`)}\`
}`,...(f=(g=i.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var y,x,A;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`
      <h3>Comparison</h3>
      <br />
      <clabs-chat-code
        enable-edit-button
        show-content-differences
        disable-edit-button
        content="\${'from math import sqrt\\n#prime function to check given number prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif itr == 1:\\n\\t\\treturn True\\n\\t#if given number divided by itr or not\\n\\tif number % itr == 0:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\treturn False\\n\\treturn True'}"
        new-content="\${'from math import sqrt\\n#hey\\n\\n#added lines here\\n#prime function to check any number and see if  prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\n\\n\\tif !number % itr == 1:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\tprint("number is not prime")\\n\\t\\treturn False\\n\\tprint("number is prime")\\n\\treturn True'}">
      </clabs-chat-code>
      <br /><br />
      <h3>Source code</h3>
      <br />
      <clabs-chat-code
        content="\${'from math import sqrt\\n#prime function to check given number prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\tif itr == 1:\\n\\t\\treturn True\\n\\t#if given number divided by itr or not\\n\\tif number % itr == 0:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\treturn False\\n\\treturn True'}">
      </clabs-chat-code>
      <br />
      <br />
      <h3>Edited Code</h3>
      <br />
      <clabs-chat-code
        content="\${'from math import sqrt\\n#hey\\n#added lines here\\n#prime function to check any number and see if  prime or not:\\ndef Prime(number,itr):\\n\\t#base condition\\n\\n\\n\\tif !number % itr == 1:\\n\\t\\treturn False\\n\\t#Recursive function Call\\n\\tif Prime(number,itr-1) == False:\\n\\t\\tprint("number is not prime")\\n\\t\\treturn False\\n\\tprint("number is prime")\\n\\treturn True'}">
      </clabs-chat-code>
    \`
}`,...(A=(x=r.parameters)==null?void 0:x.docs)==null?void 0:A.source}}};var T,R,$;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <h4>
      JSON example without newlines/tabs and ticks, coloring & collapse
    </h4>
    <clabs-chat-code
      ?editable="\${true}"
      max-height="246px"
      auto-indent
      disable-line-ticks
      content='{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"fields":[{"name":"Country name","num_values":165,"sample_values":["Afghanistan","Albania","Algeria","Angola","Argentina"]},{"max":2023,"min":2005,"name":"year"},{"max":8.019,"min":1.281,"name":"Life Ladder"},{"max":11.676,"min":5.527,"name":"Log GDP per capita"},{"max":0.987,"min":0.228,"name":"Social support"},{"max":74.6,"min":6.72,"name":"Healthy life expectancy at birth"},{"max":0.985,"min":0.228,"name":"Freedom to make life choices"},{"max":0.7,"min":-0.34,"name":"Generosity"},{"max":0.983,"min":0.035,"name":"Perceptions of corruption"},{"max":0.884,"min":0.179,"name":"Positive affect"},{"max":0.705,"min":0.083,"name":"Negative affect"}],"file":"Happiness.csv"},"encoding":{"x":{"field":"Healthy life expectancy at birth","type":"quantitative"},"y":{"field":"Life Ladder","type":"quantitative"}},"mark":"point"}'>
    </clabs-chat-code>
    <br />

    <h4>JSON example with ticks, coloring & collapse</h4>
    <clabs-chat-code
      ?editable="\${true}"
      max-height="246px"
      render-language="json"
      content='{
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "fields": [
            {
                "name": "Country name",
                "num_values": 165,
                "sample_values": [
                    "Afghanistan",
                    "Albania",
                    "Algeria",
                    "Angola",
                    "Argentina"
                ]
            },
            {
                "max": 2023,
                "min": 2005,
                "name": "year"
            },
            {
                "max": 8.019,
                "min": 1.281,
                "name": "Life Ladder"
            },
            {
                "max": 11.676,
                "min": 5.527,
                "name": "Log GDP per capita"
            },
            {
                "max": 0.987,
                "min": 0.228,
                "name": "Social support"
            },
            {
                "max": 74.6,
                "min": 6.72,
                "name": "Healthy life expectancy at birth"
            },
            {
                "max": 0.985,
                "min": 0.228,
                "name": "Freedom to make life choices"
            },
            {
                "max": 0.7,
                "min": -0.34,
                "name": "Generosity"
            },
            {
                "max": 0.983,
                "min": 0.035,
                "name": "Perceptions of corruption"
            },
            {
                "max": 0.884,
                "min": 0.179,
                "name": "Positive affect"
            },
            {
                "max": 0.705,
                "min": 0.083,
                "name": "Negative affect"
            }
        ],
        "file": "Happiness.csv"
    },
    "encoding": {
        "x": {
            "field": "Healthy life expectancy at birth",
            "type": "quantitative"
        },
        "y": {
            "field": "Life Ladder",
            "type": "quantitative"
        }
    },
    "mark": "point"
}'>
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring or ticks)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      max-height="246px"
      enable-block-collapse
      disable-line-ticks
      disable-coloring
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no ticks)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      enable-block-collapse
      disable-line-ticks
      max-height="246px"
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>Python example (no coloring)</h4>
    <clabs-chat-code
      ?editable="\${true}"
      disable-coloring
      enable-block-collapse
      max-height="246px"
      content="\${codeExamples['python code']}">
    </clabs-chat-code>
    <br />
    <h4>SQL example</h4>
    <clabs-chat-code
      ?editable="\${true}"
      enable-block-collapse
      max-height="500px"
      content="\${codeExamples['SQL example']}">
    </clabs-chat-code>
    <br />
    <h4>FORTRAN example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="\${true}"
      content="\${codeExamples['FORTRAN']}">
    </clabs-chat-code>
    <br />
    <h4>MATLAB example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="\${true}"
      content="\${codeExamples['MATLAB']}">
    </clabs-chat-code>
    <br />
    <h4>Dockerfile example</h4>
    <clabs-chat-code
      max-height="492px"
      ?editable="\${true}"
      content="\${codeExamples['Dockerfile']}">
    </clabs-chat-code>\`
}`,...($=(R=o.parameters)==null?void 0:R.docs)==null?void 0:$.source}}};var v,C,k;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(k=(C=l.parameters)==null?void 0:C.docs)==null?void 0:k.source}}};const D=["Default","OptionShowcase","ColorTesting","Comparison","Editing","Playground"],V=Object.freeze(Object.defineProperty({__proto__:null,ColorTesting:i,Comparison:r,Default:n,Editing:o,OptionShowcase:a,Playground:l,__namedExportsOrder:D,default:I},Symbol.toStringTag,{value:"Module"}));export{V as C};
