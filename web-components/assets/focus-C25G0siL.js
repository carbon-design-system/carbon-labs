import{E as t}from"./lit-element-Cp85tzhC.js";import{s as o}from"./carbon-element-C2g4wRXe.js";/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const a=s=>s??t;/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const u=s=>class extends s{focus(){if(this.shadowRoot.delegatesFocus)super.focus();else{const e=this.shadowRoot.querySelector(o)||this.querySelector(o);e?e.focus():super.focus()}}};export{u as F,a as o};
