/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';
import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs.js';
import ColorPalette16 from '@carbon/web-components/es/icons/color-palette/16.js';
import * as carbonColors from '@carbon/colors';
import Apple16 from '@carbon/web-components/es/icons/apple/16.js';
import Corn16 from '@carbon/web-components/es/icons/corn/16.js';
import Fish16 from '@carbon/web-components/es/icons/fish/16.js';
// import AmsterdamWindmill from '@carbon/pictograms/es/amsterdam--windmill/index.js';
// import Barcelona from '@carbon/pictograms/es/barcelona/index.js';
// import BerlinBrandenburgGate from '@carbon/pictograms/es/berlin--brandenburg-gate/index.js';
// import Atlanta from '@carbon/pictograms/es/atlanta/index.js';
// import Austin from '@carbon/pictograms/es/austin/index.js';
// import BostonZakimBridge from '@carbon/pictograms/es/boston--zakim-bridge/index.js';
import '../es/index.js';
// import { renderCarbonPictogram } from '../es/utilities/renderCarbonPictogram.js';

// export const pictograms = [
//   [
//     'Europe',
//     [
//       ['Amsterdam', AmsterdamWindmill],
//       ['Barcelona', Barcelona],
//       ['Berlin', BerlinBrandenburgGate],
//     ],
//   ],
//   [
//     'North America',
//     [
//       ['Atlanta', Atlanta],
//       ['Austin', Austin],
//       ['Boston', BostonZakimBridge],
//     ],
//   ],
// ].map(([label, cities]) => ({
//   label,
//   items: cities.map(([name, pictogram]) => ({
//     value: name.toLowerCase().split(' ').join('-'),
//     label: name,
//     pictogram,
//   })),
// }));

export const icons = [
  ['Apple', Apple16],
  ['Corn', Corn16],
  ['Fish', Fish16],
].map(([label, icon]) => ({
  value: label?.toString().toLowerCase().split(' ').join('-'),
  label,
  renderIcon: icon,
}));

const colors = [
  ['Yellow', carbonColors.yellow],
  ['Orange', carbonColors.orange],
  ['Red', carbonColors.red],
  ['Magenta', carbonColors.magenta],
  ['Purple', carbonColors.purple],
  ['Blue', carbonColors.blue],
  ['Cyan', carbonColors.cyan],
  ['Teal', carbonColors.teal],
  ['Green', carbonColors.green],
  ['Cool gray', carbonColors.coolGray],
  ['Gray', carbonColors.gray],
  ['Warm gray', carbonColors.warmGray],
  [
    'Others',
    {
      white: carbonColors.white,
      black: carbonColors.black,
    },
  ],
].map(([label, swatch]) => ({
  label,
  items: Object.entries(swatch).map(([step, color]) => ({
    value: `${label.toLowerCase()}-${step}`,
    label: `${label} ${step}`,
    color,
  })),
}));

const defaultProps = {
  align: POPOVER_ALIGNMENT.BOTTOM,
  open: true,
  heading: 'Choose color',
};

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const colorTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}>
    <cds-icon-button slot="trigger" kind=${BUTTON_KIND.GHOST}>
      ${ColorPalette16({ slot: 'icon' })}
      <span slot="tooltip-content">Color palette</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Colors">
      ${colors.map(
        (group) =>
          html`<clabs-style-picker-group heading=${group.label}>
            ${group.items.map(
              (item) => html`
                <clabs-style-picker-option
                  value=${item.color}
                  label=${item.label}
                  ?selected=${item.label === 'Blue 60'}>
                  <clabs-style-picker-color
                    color=${item.color}
                    label=${item.label}></clabs-style-picker-color>
                </clabs-style-picker-option>
              `
            )}
          </clabs-style-picker-group> `
      )}
    </clabs-style-picker-section>
  </clabs-style-picker>
`;

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const iconTemplate = (props = defaultProps) => html`
  <clabs-style-picker
    align=${props.align}
    ?open=${props.open}
    heading=${props.heading}>
    <cds-icon-button slot="trigger" kind=${BUTTON_KIND.GHOST}>
      ${ColorPalette16({ slot: 'icon' })}
      <span slot="tooltip-content">Icon picker</span>
    </cds-icon-button>
    <clabs-style-picker-section heading="Icons">
      ${icons.map(
        (item) =>
          html`
            <clabs-style-picker-option
              value=${item.value}
              label=${item.label}
              ?selected=${item.value === 'apple'}>
              <clabs-style-picker-icon>
                ${item.renderIcon()}
              </clabs-style-picker-icon>
            </clabs-style-picker-option>
          `
      )}
    </clabs-style-picker-section>
  </clabs-style-picker>
`;

// TODO: Moving to later
// /**
//  *
//  * @param {object} props - Default props for test component
//  * @returns {TemplateResult} The Lit template result.
//  */
// const pictogramTemplate = (props = defaultProps) => html`
//   <clabs-style-picker
//     align=${props.align}
//     ?open=${props.open}
//     heading=${props.heading}>
//     <cds-icon-button slot="trigger" kind=${BUTTON_KIND.GHOST}>
//       ${ColorPalette16({ slot: 'icon' })}
//       <span slot="tooltip-content">Pictogram picker</span>
//     </cds-icon-button>
//     <clabs-style-picker-section size="lg">
//       ${pictograms.map(
//         (group) =>
//           html`<clabs-style-picker-group heading=${group.label}>
//             ${group.items.map(
//               (item) => html`
//                 <clabs-style-picker-option
//                   value=${item.value}
//                   label=${item.label}
//                   ?selected=${item.label === 'Bangalore'}>
//                   ${renderCarbonPictogram({
//                     ...item.pictogram,
//                     attrs: {
//                       ...item.pictogram.attrs,
//                       width: '3rem',
//                       height: '3rem',
//                       'aria-label': item.label,
//                     },
//                   })}
//                 </clabs-style-picker-option>
//               `
//             )}
//           </clabs-style-picker-group> `
//       )}
//     </clabs-style-picker-section>
//   </clabs-style-picker>
// `;

describe('clabs-style-picker', function () {
  it('should render single variant with color picker options', async () => {
    const el = await fixture(
      colorTemplate({ ...defaultProps, heading: 'Choose color' })
    );

    expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should render single variant with icon picker options', async () => {
    const el = await fixture(
      iconTemplate({ ...defaultProps, heading: 'Choose icon' })
    );

    expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  // it('should render single variant with pictogram picker options', async () => {
  //   const el = await fixture(
  //     pictogramTemplate({ ...defaultProps, heading: 'Choose pictogram' })
  //   );

  //   expect(el).dom.to.equalSnapshot();
  //   await expect(el).shadowDom.to.be.accessible();
  // });
});
