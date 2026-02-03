/**
 * Copyright IBM Corp. 2020, 2021
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { html } from 'lit';
import { v4 as uuidv4 } from 'uuid';
import { classMap } from 'lit/directives/class-map.js';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

/**
 * Generates an error illustration SVG based on the specified theme and size.
 *
 * @param {string} [theme='light'] - The theme of the illustration, either 'light' or 'dark'.
 * @param {string} [size='large'] - The size of the illustration, such as 'large' or other predefined sizes.
 * @returns {import('lit').TemplateResult} The SVG illustration as a Lit template result.
 */
const noTagsIllustration = (theme = 'light', size = 'large') => {
  const svgId = uuidv4();
  const svgClasses = classMap({
    [`${clabsPrefix}--empty-state__illustration`]: true,
    [`${clabsPrefix}--empty-state__illustration-noTags`]: true,
    [`${clabsPrefix}--empty-state__illustration--${size}`]: true,
  });
  const svgImage =
    theme === 'dark'
      ? html`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            class="${svgClasses}">
            <defs>
              <linearGradient
                id="prefix__c_dark_${svgId}"
                x1="34.96"
                y1="5.37"
                x2="48.48"
                y2="28.8"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#525252" />
                <stop offset="1" stop-color="#393939" />
              </linearGradient>
              <linearGradient
                id="prefix__a_dark_${svgId}"
                x1="45.47"
                y1="46.54"
                x2="55.21"
                y2="46.54"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#262626" />
                <stop offset="1" stop-color="#393939" />
              </linearGradient>
              <linearGradient
                id="prefix__d_dark_${svgId}"
                x1="38.25"
                y1="70.94"
                x2="38.25"
                y2="-3.31"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#262626" />
                <stop offset="1" stop-color="#393939" />
              </linearGradient>
              <linearGradient
                id="prefix__e_dark_${svgId}"
                x1="28.77"
                y1="9.54"
                x2="48.15"
                y2="40.79"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.42" stop-color="#6f6f6f" />
                <stop offset="0.51" stop-color="#6e6e6e" stop-opacity="0.98" />
                <stop offset="0.56" stop-color="#6c6c6c" stop-opacity="0.9" />
                <stop offset="0.61" stop-color="#686868" stop-opacity="0.77" />
                <stop offset="0.65" stop-color="#636363" stop-opacity="0.58" />
                <stop offset="0.69" stop-color="#5c5c5c" stop-opacity="0.34" />
                <stop offset="0.72" stop-color="#545454" stop-opacity="0.05" />
                <stop offset="0.73" stop-color="#525252" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__b_dark_${svgId}"
                x1="51.28"
                y1="68.32"
                x2="51.34"
                y2="68.35"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__f_dark_${svgId}"
                x1="51.09"
                y1="68.25"
                x2="51.22"
                y2="68.33"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__g_dark_${svgId}"
                x1="51.41"
                y1="68.32"
                x2="51.46"
                y2="68.35"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__h_dark_${svgId}"
                x1="33.94"
                y1="119.46"
                x2="42.79"
                y2="119.46"
                gradientTransform="translate(0 -100)"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#262626" />
                <stop offset="1" stop-color="#161616" />
              </linearGradient>
              <linearGradient
                id="prefix__i_dark_${svgId}"
                x1="35.3"
                y1="23.46"
                x2="38.85"
                y2="17.31"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#6f6f6f" />
                <stop offset="0.09" stop-color="#6f6f6f" stop-opacity="0.9" />
                <stop offset="0.24" stop-color="#6f6f6f" stop-opacity="0.63" />
                <stop offset="0.44" stop-color="#6f6f6f" stop-opacity="0.19" />
                <stop offset="0.52" stop-color="#6f6f6f" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path fill="none" d="M0 0h80v80H0z" />
            <path
              opacity="0.25"
              d="M51.59 78.34l-26.8-15.48 3.62-2.09 26.8 15.48-3.62 2.09z" />
            <path
              fill="url(#prefix__c_dark_${svgId})"
              d="M45.47 30.38l6.58-3.76 3.12-1.85v.15a1.28 1.28 0 00-.17-.47L42.19 2.21c-.24-.42-.63-.65-.88-.51L28.47 9.12a.44.44 0 00-.18.4l13.88 3a1.38 1.38 0 00.62 1.07z" />
            <path
              fill="url(#prefix__a_dark_${svgId})"
              d="M55 66.29a.46.46 0 00.18-.41V25.06a1 1 0 000-.29l-3.12 1.85-6.58 3.76 6.06 37.92z" />
            <path
              fill="url(#prefix__d_dark_${svgId})"
              d="M51.53 26.47L38.69 4.23c-.25-.42-.64-.64-.88-.5L25 11.14a.43.43 0 00-.18.4v40.82a1.35 1.35 0 00.62 1.07l25.65 14.83c.34.2.62 0 .62-.36V27.08a1.33 1.33 0 00-.18-.61zM37.08 24a6.93 6.93 0 01-3.14-5.44c0-2 1.4-2.81 3.14-1.81a7 7 0 013.13 5.44c0 2.01-1.4 2.81-3.13 1.81z" />
            <path
              fill="url(#prefix__e_dark_${svgId})"
              d="M39.05 4a1.71 1.71 0 00-.64-.64l-.6.34a.3.3 0 01.16 0 1 1 0 01.72.55l12.84 22.22a1.33 1.33 0 01.18.61V67.9a.41.41 0 01-.19.4l.58-.34V27.08a1.75 1.75 0 00-.24-.82z" />
            <path d="M51.28 68.33z" fill="url(#prefix__b_dark_${svgId})" />
            <path
              d="M51.23 68.32a.42.42 0 01-.14-.06.42.42 0 00.14.06z"
              fill="url(#prefix__f_dark_${svgId})" />
            <path d="M51.48 68.32h-.08z" fill="url(#prefix__g_dark_${svgId})" />
            <path
              fill="url(#prefix__h_dark_${svgId})"
              d="M39.66 22.17a6.93 6.93 0 01-3.14-5.44 1.36 1.36 0 010-.21c-1.48-.56-2.6.27-2.6 2.05A6.93 6.93 0 0037.08 24c1.66 1 3 .24 3.11-1.6a3.49 3.49 0 01-.53-.23z" />
            <path
              fill="url(#prefix__i_dark_${svgId})"
              d="M35.67 16.33a2.88 2.88 0 011.41.43 7 7 0 013.13 5.44c0 1.42-.7 2.24-1.73 2.24a2.82 2.82 0 01-1.4-.43 6.93 6.93 0 01-3.14-5.44c0-1.42.7-2.24 1.73-2.24m0-.41c-1.3 0-2.15 1-2.15 2.65a7.3 7.3 0 003.35 5.8 3.23 3.23 0 001.61.48c1.3 0 2.15-1 2.15-2.65a7.29 7.29 0 00-3.35-5.8 3.2 3.2 0 00-1.61-.48z" />
          </svg>
        `
      : html`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            class="${svgClasses}">
            <defs>
              <linearGradient
                id="prefix__b_${svgId}"
                x1="634.81"
                y1="667.18"
                x2="644.85"
                y2="684.56"
                gradientTransform="matrix(.87 .5 -1 .58 161.49 -640.11)"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#525252" stop-opacity="0.05" />
                <stop offset="1" stop-opacity="0.1" />
              </linearGradient>
              <linearGradient
                id="prefix__c_${svgId}"
                x1="29.21"
                y1="7.75"
                x2="56.14"
                y2="23.3"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#f4f4f4" />
                <stop offset="0.78" stop-color="#e0e0e0" />
                <stop offset="1" stop-color="#c6c6c6" />
              </linearGradient>
              <linearGradient
                id="prefix__d_${svgId}"
                x1="45.47"
                y1="46.54"
                x2="55.21"
                y2="46.54"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#a8a8a8" />
                <stop offset="1" stop-color="#c6c6c6" />
              </linearGradient>
              <linearGradient
                id="prefix__e_${svgId}"
                x1="38.25"
                y1="59.31"
                x2="38.25"
                y2="2.99"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#c6c6c6" />
                <stop offset="0.78" stop-color="#e0e0e0" />
              </linearGradient>
              <linearGradient
                id="prefix__f_${svgId}"
                x1="28.77"
                y1="9.54"
                x2="48.15"
                y2="40.79"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.42" stop-color="#fff" />
                <stop offset="0.49" stop-color="#fff" stop-opacity="0.99" />
                <stop offset="0.53" stop-color="#fdfdfd" stop-opacity="0.96" />
                <stop offset="0.56" stop-color="#fafafa" stop-opacity="0.9" />
                <stop offset="0.59" stop-color="#f6f6f6" stop-opacity="0.82" />
                <stop offset="0.62" stop-color="#f2f2f2" stop-opacity="0.71" />
                <stop offset="0.65" stop-color="#ebebeb" stop-opacity="0.59" />
                <stop offset="0.67" stop-color="#e4e4e4" stop-opacity="0.43" />
                <stop offset="0.7" stop-color="#dcdcdc" stop-opacity="0.25" />
                <stop offset="0.72" stop-color="#d3d3d3" stop-opacity="0.06" />
                <stop offset="0.73" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__a_${svgId}"
                x1="51.28"
                y1="68.32"
                x2="51.34"
                y2="68.35"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__g_${svgId}"
                x1="51.09"
                y1="68.25"
                x2="51.22"
                y2="68.33"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__h_${svgId}"
                x1="51.41"
                y1="68.32"
                x2="51.46"
                y2="68.35"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.87" stop-color="#fff" />
                <stop offset="0.89" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.9" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.92" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.94" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.95" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.97" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.99" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="1" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
              <linearGradient
                id="prefix__i_${svgId}"
                x1="33.94"
                y1="19.46"
                x2="42.79"
                y2="19.46"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#a4a4a4" />
                <stop offset="1" stop-color="#8c8c8c" />
              </linearGradient>
              <linearGradient
                id="prefix__j_${svgId}"
                x1="35.3"
                y1="23.46"
                x2="38.85"
                y2="17.31"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff" />
                <stop offset="0.04" stop-color="#fdfdfd" stop-opacity="0.96" />
                <stop offset="0.12" stop-color="#f7f7f7" stop-opacity="0.84" />
                <stop offset="0.23" stop-color="#eee" stop-opacity="0.64" />
                <stop offset="0.36" stop-color="#e2e2e2" stop-opacity="0.38" />
                <stop offset="0.5" stop-color="#d2d2d2" stop-opacity="0.04" />
                <stop offset="0.52" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path fill="none" d="M0 0h80v80H0z" />
            <path
              fill="url(#prefix__b_${svgId})"
              d="M51.59 78.34l-26.8-15.48 3.62-2.09 26.8 15.48-3.62 2.09z" />
            <path
              fill="url(#prefix__c_${svgId})"
              d="M45.47 30.38l6.58-3.76 3.12-1.85v.15a1.28 1.28 0 00-.17-.47L42.19 2.21c-.24-.42-.63-.65-.88-.51L28.47 9.12a.44.44 0 00-.18.4l13.88 3a1.38 1.38 0 00.62 1.07z" />
            <path
              fill="url(#prefix__d_${svgId})"
              d="M55 66.29a.46.46 0 00.18-.41V25.06a1 1 0 000-.29l-3.12 1.85-6.58 3.76 6.06 37.92z" />
            <path
              fill="url(#prefix__e_${svgId})"
              d="M51.53 26.47L38.69 4.23c-.25-.42-.64-.64-.88-.5L25 11.14a.43.43 0 00-.18.4v40.82a1.35 1.35 0 00.62 1.07l25.65 14.83c.34.2.62 0 .62-.36V27.08a1.33 1.33 0 00-.18-.61zM37.08 24a6.93 6.93 0 01-3.14-5.44c0-2 1.4-2.81 3.14-1.81a7 7 0 013.13 5.44c0 2.01-1.4 2.81-3.13 1.81z" />
            <path
              fill="url(#prefix__f_${svgId})"
              d="M39.05 4a1.71 1.71 0 00-.64-.64l-.6.34a.3.3 0 01.16 0 1 1 0 01.72.55l12.84 22.22a1.33 1.33 0 01.18.61V67.9a.41.41 0 01-.19.4l.58-.34V27.08a1.75 1.75 0 00-.24-.82z" />
            <path d="M51.28 68.33z" fill="url(#prefix__a_${svgId})" />
            <path
              d="M51.23 68.32a.42.42 0 01-.14-.06.42.42 0 00.14.06z"
              fill="url(#prefix__g_${svgId})" />
            <path d="M51.48 68.32h-.08z" fill="url(#prefix__h_${svgId})" />
            <path
              fill="url(#prefix__i_${svgId})"
              d="M39.66 22.17a6.93 6.93 0 01-3.14-5.44 1.36 1.36 0 010-.21c-1.48-.56-2.6.27-2.6 2.05A6.93 6.93 0 0037.08 24c1.66 1 3 .24 3.11-1.6a3.49 3.49 0 01-.53-.23z" />
            <path
              fill="url(#prefix__j_${svgId})"
              d="M35.67 16.33a2.88 2.88 0 011.41.43 7 7 0 013.13 5.44c0 1.42-.7 2.24-1.73 2.24a2.82 2.82 0 01-1.4-.43 6.93 6.93 0 01-3.14-5.44c0-1.42.7-2.24 1.73-2.24m0-.41c-1.3 0-2.15 1-2.15 2.65a7.3 7.3 0 003.35 5.8 3.23 3.23 0 001.61.48c1.3 0 2.15-1 2.15-2.65a7.29 7.29 0 00-3.35-5.8 3.2 3.2 0 00-1.61-.48z" />
          </svg>
        `;
  return svgImage;
};
export default noTagsIllustration;
