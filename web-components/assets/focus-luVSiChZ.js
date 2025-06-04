import{s}from"./carbon-element-CIUZhCzP.js";/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const c=o=>class extends o{focus(){if(this.shadowRoot.delegatesFocus)super.focus();else{const e=this.shadowRoot.querySelector(s)||this.querySelector(s);e?e.focus():super.focus()}}};export{c as F};
