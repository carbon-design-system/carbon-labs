/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import editableTextElement from './src/editableTextElement.js';
import { editableTextElementTemplate } from './src/editableTextElement.template.js';
const {
  stablePrefix: clabsPrefix
} = settings;
/**
 * Constructed class functionality for the test input custom element
 */
let CLABSEditableTextElement = class CLABSEditableTextElement extends editableTextElement {
  /**
   * Renders the template while passing in class functionality
   *
   * @returns {TemplateResult<1>}
   */
  render() {
    return editableTextElementTemplate(this);
  }
};
CLABSEditableTextElement = __decorate([customElement(`${clabsPrefix}-chat-editable-text`)], CLABSEditableTextElement);
export default CLABSEditableTextElement;
//# sourceMappingURL=editableTextElement.js.map
