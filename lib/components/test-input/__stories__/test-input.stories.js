"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Default = void 0;
require("../test-input");
var _lit = require("lit");
var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
var _default = exports.default = {
  title: "Components/Test input",
  tags: ["autodocs"]
};
const Default = exports.Default = {
  render: () => (0, _lit.html)(_templateObject || (_templateObject = _taggedTemplateLiteral([" <c4ai-test-input> </c4ai-test-input>"])))
};