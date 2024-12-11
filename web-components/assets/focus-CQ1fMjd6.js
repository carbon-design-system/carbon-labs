import{E as t}from"./directive-Bp-AemGL.js";import{s as o}from"./carbon-element-ZG_lSGav.js";/**
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
