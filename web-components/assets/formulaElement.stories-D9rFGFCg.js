import"./formulaElement-DY7djF18.js";import{b as e}from"./iframe-CWxIaTBF.js";/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */const s={title:"Components/AI Components/Formula"},f=[{title:"Cauchy-Schwarz Inequality",math:"\\(\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq    \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)\\)"},{title:"An Identity of Ramanujan",math:"\\(\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} = \\\\ 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} \\\\ {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }\\)"},{title:"Maxwell's Equations",math:"\\(\\begin{align}    \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\   \\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\   \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\\\   \\nabla \\cdot \\vec{\\mathbf{B}} & = 0    \\end{align}\\)"},{title:"Rogers-Ramanujan Identity",math:"\\(1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =    \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},     \\quad\\quad \\text{for $|q| < 1$}.\\)"},{title:"Cross Product Formula",math:"\\(\\mathbf{V}_1 \\times \\mathbf{V}_2 =    \\begin{vmatrix}     \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\     \\frac{\\partial X}{\\partial u} & \\frac{\\partial Y}{\\partial u} & 0 \\\\     \\frac{\\partial X}{\\partial v} & \\frac{\\partial Y}{\\partial v} & 0 \\\\    \\end{vmatrix}\\)"},{title:"String Theory Action",math:"\\( S = -\\frac{1}{2}\\int d^2\\sigma \\sqrt{-h} h^{ab}\\partial_a X^\\mu \\partial_b X^\\mu \\\\ \\frac{1}{4 \\pi \\alpha'} \\int d^2\\sigma \\sqrt{-h} \\left( h^{ab} \\partial_a X^\\mu \\partial_b X_\\mu + \\alpha' R \\Phi(X) \\right  \\\\ [\\alpha_m^\\mu, \\alpha_n^\\nu] = m \\delta_{m+n,0} \\eta^{\\mu \\nu}  \\)"},{title:"Custom: Tex stress test",math:"\\(\\begin{align}    \\int_{0}^{\\infty} e^{-x^2} \\, dx & = \\frac{\\sqrt{\\pi}}{2} \\\\    \\sum_{n=1}^{\\infty} \\frac{1}{n^2} & = \\frac{\\pi^2}{6} \\\\    \\mathbf{A} \\mathbf{x} & = \\left[ \\begin{array}{ccc}        a_{11} & a_{12} & a_{13} \\\\        a_{21} & a_{22} & a_{23} \\\\        a_{31} & a_{32} & a_{33}    \\end{array} \\right]     \\left[ \\begin{array}{c}        x_1 \\\\        x_2 \\\\        x_3    \\end{array} \\right] \\\\    e^{i \\pi} + 1 & = 0 \\\\    \\lim_{x \\to 0} \\frac{\\sin x}{x} & = 1 \\\\    \\left( \\sum_{k=1}^n a_k b_k \\right)^2 & \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right) \\\\    \\begin{bmatrix}        1 & 2 & 3 \\\\        4 & 5 & 6 \\\\        7 & 8 & 9    \\end{bmatrix}    \\begin{bmatrix}        x \\\\        y \\\\        z    \\end{bmatrix} & =     \\begin{bmatrix}        1 \\cdot x + 2 \\cdot y + 3 \\cdot z \\\\        4 \\cdot x + 5 \\cdot y + 6 \\cdot z \\\\        7 \\cdot x + 8 \\cdot y + 9 \\cdot z    \\end{bmatrix} \\\\    \\frac{d}{dx} \\left( \\frac{1}{x} \\right) & = -\\frac{1}{x^2}\\end{align}\\)"}],a={render:()=>e` <clabs-chat-formula
      content="\\(x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\\)">
    </clabs-chat-formula>`},t={render:()=>e`<div style="display:flex; flex-wrap:wrap;">
      ${f.map(r=>e` <div>
          <h4>${r.title}</h4>
          <clabs-chat-formula content="${r.math}"> </clabs-chat-formula>
        </div>`)}
    </div>`};var i,n,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\` <clabs-chat-formula
      content="\\\\(x = {-b \\\\pm \\\\sqrt{b^2-4ac} \\\\over 2a}.\\\\)">
    </clabs-chat-formula>\`
}`,...(l=(n=a.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var c,m,o;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html\`<div style="display:flex; flex-wrap:wrap;">
      \${mathExamples.map(example => html\` <div>
          <h4>\${example.title}</h4>
          <clabs-chat-formula content="\${example.math}"> </clabs-chat-formula>
        </div>\`)}
    </div>\`
}`,...(o=(m=t.parameters)==null?void 0:m.docs)==null?void 0:o.source}}};const h=["Default","Showcase"],b=Object.freeze(Object.defineProperty({__proto__:null,Default:a,Showcase:t,__namedExportsOrder:h,default:s},Symbol.toStringTag,{value:"Module"}));export{b as e};
