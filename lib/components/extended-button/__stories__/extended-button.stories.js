"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Default = void 0;
require("../extended-button");
var _lit = require("lit");
var _ = _interopRequireDefault(require("@carbon/web-components/es/icons/arrow--right/16"));
var _templateObject;
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
var _default = exports.default = {
  title: "Components/Extended button",
  tags: ["autodocs"]
}; // More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
const Default = exports.Default = {
  args: {
    label: "Extended button"
  },
  render: args => (0, _lit.html)(_templateObject || (_templateObject = _taggedTemplateLiteral([" <c4ai-extended-button>\n      ", "", "\n    </c4ai-extended-button>"])), args.label, (0, _.default)({
    slot: "icon"
  }))
};