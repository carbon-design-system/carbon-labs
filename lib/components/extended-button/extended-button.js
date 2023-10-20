"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.C4AIExtendedButton = void 0;
require("core-js/modules/es.symbol.description.js");
var _settings = _interopRequireDefault(require("../../globals/settings.js"));
var _button = _interopRequireDefault(require("@carbon/web-components/es/components/button/button"));
var _extendedButton = _interopRequireDefault(require("./extended-button.scss?inline"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const {
  stablePrefix: c4aiPrefix
} = _settings.default;

/**
 * Component extending the @carbon/web-components' button
 */
class C4AIExtendedButton extends _button.default {}
exports.C4AIExtendedButton = C4AIExtendedButton;
_defineProperty(C4AIExtendedButton, "styles", _extendedButton.default);
customElements.define("".concat(c4aiPrefix, "-extended-button"), C4AIExtendedButton);