/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../molecularElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Molecule',
  tags: ['autodocs'],
};

const examples = [
  {
    title: 'Bergenin',
    width: 126,
    height: 126,
    thumbnail: true,
    smiles:
      'OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2',
  },
  {
    title: 'Custom Molecule',
    width: 126,
    height: 126,
    thumbnail: true,
    smiles:
      'OC(C(=O)O[C@H]1C[N+]2(CCC0C3=CC=CC=C3)CCC1CC2)(C1=CC=CS1)C1=CC=CS1',
  },
  {
    title: 'Cephalostatin-1',
    width: 126,
    height: 126,
    thumbnail: true,
    smiles:
      'CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO',
  },
  {
    title: 'Bergenin',
    width: 246,
    height: 246,
    smiles:
      'OC[C@@H](O1)[C@@H](O)[C@H](O)[C@@H]2[C@@H]1c3c(O)c(OC)c(O)cc3C(=O)O2',
  },
  {
    title: 'Custom Molecule',
    width: 446,
    height: 446,
    smiles:
      'OC(C(=O)O[C@H]1C[N+]2(CCC0C3=CC=CC=C3)CCC1CC2)(C1=CC=CS1)C1=CC=CS1',
  },
  {
    title: 'Cephalostatin-1',
    smiles:
      'CC(C)(O1)C[C@@H](O)[C@@]1(O2)[C@@H](C)[C@@H]3CC=C4[C@]3(C2)C(=O)C[C@H]5[C@H]4CC[C@@H](C6)[C@]5(C)Cc(n7)c6nc(C[C@@]89(C))c7C[C@@H]8CC[C@@H]%10[C@@H]9C[C@@H](O)[C@@]%11(C)C%10=C[C@H](O%12)[C@]%11(O)[C@H](C)[C@]%12(O%13)[C@H](O)C[C@@]%13(C)CO',
  },
  { title: 'Acetate', width: 200, height: 200, smiles: 'CC(=O)[O-]' },
  { title: 'Benzene (C6H6)', width: 200, height: 200, smiles: 'C1=CC=CC=C1' },
  {
    title: '5-amino-4-methylpentanamide',
    width: 496,
    height: 496,
    smiles: 'CC(CCC(=O)N)CN',
  },
  { title: 'Bromobenzene', width: 200, height: 200, smiles: 'C1=CC=C(C=C1)Br' },
  {
    title: 'Caffeine',
    width: 496,
    height: 496,
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
  },
  {
    title: 'Thyroxine',
    width: 496,
    height: 496,
    smiles: 'C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N',
  },
  {
    title: 'Cholesterol',
    smiles: 'CC(C)CCCC(C)C1CCC2C1(CCCC2=CC=C3CC4CC(CC(C4)O)C(O)C3(C)C)C',
  },
  {
    title: 'Chlorine',
    smiles:
      'CCC1=C(C2=NC1=CC3=C(C4=C(C(C(=C4[N-]3)C5=NC(=CC6=NC(=C2)C(=C6C)C=C)C(C5CCC(=O)OCC=C(C)CCCC(C)CCCC(C)CCCC(C)C)C)C(=O)OC)[O-])C)C.[Mg+2]',
  },
  {
    title: 'Paclitaxel (Taxol)',
    smiles:
      'CC1=C2C(C(=O)C3(C(CC4C(C3C(C(C2(C)C)(CC1OC(=O)C(C(C5=CC=CC=C5)NC(=O)C6=CC=CC=C6)O)O)OC(=O)C7=CC=CC=C7)(CO4)OC(=O)C)O)C)OC(=O)C',
  },
  {
    title: 'ATP (Adenosine Triphosphate)',
    smiles:
      'C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N.C1=NC(=C2C(=N1)N(C=N2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N',
  },
  {
    title: 'Cyclosporine',
    smiles:
      'CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C',
  },
  {
    title: 'Vitamin B12',
    smiles:
      'CC1=CC2=C(C=C1C)N(C=N2)C3C(C(C(O3)CO)OP(=O)([O-])OC(C)CNC(=O)CCC4(C(C5C6(C(C(C(=C(C7=NC(=CC8=NC(=C(C4=N5)C)C(C8(C)C)CCC(=O)N)C(C7(C)CC(=O)N)CCC(=O)N)C)[N-]6)CCC(=O)N)(C)CC(=O)N)C)CC(=O)N)C)O.[C-]#N.[Co+3]',
  },
  {
    title: 'Insulin',
    smiles:
      'CCC(C)C1C(=O)NC2CSSCC(C(=O)NC(CSSCC(C(=O)NCC(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(C(=O)NC(CSSCC(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC(=O)C(NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)NC(CC(=O)N)C(=O)O)C(=O)NCC(=O)NC(CCC(=O)O)C(=O)NC(CCCNC(=N)N)C(=O)NCC(=O)NC(CC5=CC=CC=C5)C(=O)NC(CC6=CC=CC=C6)C(=O)NC(CC7=CC=C(C=C7)O)C(=O)NC(C(C)O)C(=O)N8CCCC8C(=O)NC(CCCCN)C(=O)NC(C(C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)C(CC(C)C)NC(=O)C(CC2=CNC=N2)NC(=O)C(CCC(=O)N)NC(=O)C(C(=O)N)NC(=O)C(C(C)C)NC(=O)C(CC2=CC=CC=C2)N)C(=O)NC(C(=O)NC(C(=O)N1)CO)C(C)O)NC(=O)C(CCC(=O)N)NC(=O)C(CCC(=O)O)NC(=O)C(C(C)C)NC(=O)C(C(C)CC)NC(=O)CN',
  },
];

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <clabs-chat-molecule content="CC(CCC(=O)N)CN">
    </clabs-chat-molecule>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` ${examples.map(
      (example) =>
        html`
          ${example.width && example.height
            ? html`<p style="font-style:italic;font-size:14px;">
                (${example.width}px x ${example.height}px)
                ${example.thumbnail ? '- thumbail-mode enabled' : ''}
              </p>`
            : ``}
          <br />
          <clabs-chat-code
            ?disable-line-ticks="${true}"
            ?disable-copy-button="${true}"
            content="SMILES String: ${example.smiles}">
          </clabs-chat-code>

          <clabs-chat-molecule
            title="${example.title}"
            width="${example.width}"
            height="${example.height}"
            ?thumbnail-mode=${example.thumbnail}
            content="${example.smiles}">
          </clabs-chat-molecule>
          <br />
        `
    )}`,
};
