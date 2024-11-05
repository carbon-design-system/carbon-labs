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
import { Tag } from './src/tag.js';
import { tagTemplate } from './src/tag.template.js';
const {
  stablePrefix: clabsPrefix
} = settings;
/**
 * Component extending the Tag component
 *
 * @element clabs-tag
 */
let CLABSTag = class CLABSTag extends Tag {
  /**
   * Renders the template while passing in class functionality
   */
  render() {
    return tagTemplate(this);
  }
};
CLABSTag = __decorate([customElement(`${clabsPrefix}-tag`)], CLABSTag);
export default CLABSTag;
//# sourceMappingURL=tag.js.map
