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
const notificationsIllustration = (theme = 'light', size = 'large') => {
  const svgId = uuidv4();
  const svgClasses = classMap({
    [`${clabsPrefix}--empty-state__illustration`]: true,
    [`${clabsPrefix}--empty-state__illustration-notification`]: true,
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
                id="prefix__a_dark_${svgId}"
                x1="30.05"
                y1="54.31"
                x2="35.5"
                y2="54.31"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#161616" />
                <stop offset="1" stop-color="#262626" />
              </linearGradient>
              <linearGradient
                id="prefix__b_dark_${svgId}"
                x1="28.61"
                y1="-3.97"
                x2="70.69"
                y2="68.92"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#525252" />
                <stop offset="0.52" stop-color="#393939" />
                <stop offset="0.61" stop-color="#393939" />
                <stop offset="1" stop-color="#161616" />
              </linearGradient>
              <linearGradient
                id="prefix__c_dark_${svgId}"
                x1="38.01"
                y1="69.51"
                x2="38.01"
                y2="-0.42"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#262626" />
                <stop offset="1" stop-color="#393939" />
              </linearGradient>
              <linearGradient
                id="prefix__d_dark_${svgId}"
                x1="15.14"
                y1="5.72"
                x2="63.06"
                y2="33.52"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.78" stop-color="#6f6f6f" />
                <stop offset="0.81" stop-color="#6c6c6c" stop-opacity="0.96" />
                <stop offset="0.85" stop-color="#636363" stop-opacity="0.84" />
                <stop offset="0.89" stop-color="#545454" stop-opacity="0.64" />
                <stop offset="0.93" stop-color="#404040" stop-opacity="0.35" />
                <stop offset="0.97" stop-color="#262626" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path fill="none" d="M0 0h80v80H0z" />
            <path
              opacity="0.25"
              d="M15.13 52.11l45.5 26.28 4.25-2.51L19.4 49.63l-4.27 2.48z" />
            <path
              d="M32.66 52.85l-2.25 4.22a1.08 1.08 0 01-.36.35l2.83-1.65a1.08 1.08 0 00.36-.35l2.26-4.22z"
              fill="url(#prefix__a_dark_${svgId})" />
            <path
              d="M63.45 26.58L20.63 1.86a1 1 0 00-1-.1l-4 2.3a1 1 0 011 .1l42.85 24.72a3.17 3.17 0 011.42 2.47l-.1 36.08a1 1 0 01-.42.91l4-2.3a1 1 0 00.42-.91L64.88 29a3.14 3.14 0 00-1.43-2.42z"
              fill="url(#prefix__b_dark_${svgId})" />
            <path
              d="M59.48 28.88a3.17 3.17 0 011.42 2.47l-.1 36.08c0 .9-.65 1.26-1.42.81l-26.7-15.4-2.26 4.22a.9.9 0 01-1.33.28 3.07 3.07 0 01-1.22-1.53l-2.33-7.09-9-5.2a3.15 3.15 0 01-1.43-2.46L15.23 5c0-.9.64-1.27 1.43-.81z"
              fill="url(#prefix__c_dark_${svgId})" />
            <path
              fill="#525252"
              d="M57.99 37.07l-.01 3.9L18.03 17.9l.01-3.9 39.95 23.07zM57.99 45.11l-.01 3.91-39.95-23.07.01-3.9 39.95 23.06zM44.62 45.04l-.01 3.9L18.03 33.6l.01-3.9 26.58 15.34z" />
            <path
              d="M60.76 30.55a2.54 2.54 0 01.14.8v3.95l.41-.13v-3.82a3.54 3.54 0 00-1.63-2.82L16.86 3.8a2.09 2.09 0 00-.44-.19l-.78.45a1 1 0 01.21-.06h.48l.27.12 21.47 12.4 21.41 12.36a3.19 3.19 0 011.28 1.67z"
              fill="url(#prefix__d_dark_${svgId})" />
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
                id="prefix__a_${svgId}"
                x1="61.44"
                y1="66.99"
                x2="61.44"
                y2="60.01"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#c6c6c6" />
                <stop offset="0.78" stop-color="#e0e0e0" />
              </linearGradient>
              <linearGradient
                id="prefix__b_${svgId}"
                x1="28.49"
                y1="44.06"
                x2="53.04"
                y2="86.58"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#525252" stop-opacity="0.05" />
                <stop offset="1" stop-opacity="0.1" />
              </linearGradient>
              <linearGradient
                id="prefix__c_${svgId}"
                x1="30.05"
                y1="54.31"
                x2="35.5"
                y2="54.31"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#a4a4a4" />
                <stop offset="1" stop-color="#bebebe" />
              </linearGradient>
              <linearGradient
                id="prefix__d_${svgId}"
                x1="28.61"
                y1="-3.97"
                x2="70.69"
                y2="68.92"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#f4f4f4" />
                <stop offset="0.52" stop-color="#e0e0e0" />
                <stop offset="0.56" stop-color="#d8d8d8" />
                <stop offset="0.61" stop-color="#c6c6c6" />
                <stop offset="0.89" stop-color="#a8a8a8" />
                <stop offset="0.96" stop-color="#8d8d8d" />
              </linearGradient>
              <linearGradient
                id="prefix__e_${svgId}"
                x1="38.01"
                y1="59.43"
                x2="38.01"
                y2="3.27"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#c6c6c6" />
                <stop offset="0.78" stop-color="#e0e0e0" />
              </linearGradient>
              <linearGradient
                id="prefix__f_${svgId}"
                x1="21.52"
                y1="36.2"
                x2="61.39"
                y2="36.2"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#e0e0e0" />
                <stop offset="1" stop-color="#c6c6c6" />
              </linearGradient>
              <linearGradient
                id="prefix__h_${svgId}"
                x1="17.68"
                y1="15.75"
                x2="55.37"
                y2="37.5"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff" />
                <stop offset="0.05" stop-color="#fdfdfd" />
                <stop offset="0.3" stop-color="#f6f6f6" />
                <stop offset="1" stop-color="#f4f4f4" />
              </linearGradient>
              <linearGradient
                id="prefix__i_${svgId}"
                x1="14.24"
                y1="21.81"
                x2="51.92"
                y2="43.56"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff" />
                <stop offset="0.05" stop-color="#fdfdfd" />
                <stop offset="0.3" stop-color="#f6f6f6" />
                <stop offset="1" stop-color="#f4f4f4" />
              </linearGradient>
              <linearGradient
                id="prefix__j_${svgId}"
                x1="10.96"
                y1="27.56"
                x2="48.66"
                y2="49.33"
                gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fff" />
                <stop offset="0.05" stop-color="#fdfdfd" />
                <stop offset="0.3" stop-color="#f6f6f6" />
                <stop offset="1" stop-color="#f4f4f4" />
              </linearGradient>
              <linearGradient
                id="prefix__k_${svgId}"
                x1="15.14"
                y1="5.72"
                x2="63.06"
                y2="33.52"
                gradientUnits="userSpaceOnUse">
                <stop offset="0.78" stop-color="#fff" />
                <stop offset="0.8" stop-color="#fefefe" stop-opacity="0.98" />
                <stop offset="0.82" stop-color="#fcfcfc" stop-opacity="0.93" />
                <stop offset="0.85" stop-color="#f8f8f8" stop-opacity="0.84" />
                <stop offset="0.87" stop-color="#f2f2f2" stop-opacity="0.72" />
                <stop offset="0.9" stop-color="#eaeaea" stop-opacity="0.56" />
                <stop offset="0.93" stop-color="#e1e1e1" stop-opacity="0.37" />
                <stop offset="0.95" stop-color="#d7d7d7" stop-opacity="0.14" />
                <stop offset="0.97" stop-color="#d0d0d0" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path fill="none" d="M0 0h80v80H0z" />
            <path
              d="M61.3 68.11a.67.67 0 00.09-.14.67.67 0 01-.09.14zm.22-.46a1.58 1.58 0 000-.32v-7.24 7.24a1.58 1.58 0 010 .32zm-.09.26a1.18 1.18 0 00.07-.2 1.18 1.18 0 01-.07.2z"
              fill="url(#prefix__a_${svgId})" />
            <path
              fill="url(#prefix__b_${svgId})"
              d="M15.13 52.11l45.5 26.28 4.25-2.51L19.4 49.63l-4.27 2.48z" />
            <path
              d="M32.66 52.85l-2.25 4.22a1.08 1.08 0 01-.36.35l2.83-1.65a1.08 1.08 0 00.36-.35l2.26-4.22z"
              fill="url(#prefix__c_${svgId})" />
            <path
              d="M63.45 26.58L20.63 1.86a1 1 0 00-1-.1l-4 2.3a1 1 0 011 .1l42.85 24.72a3.17 3.17 0 011.42 2.47l-.1 36.08a1 1 0 01-.42.91l4-2.3a1 1 0 00.42-.91L64.88 29a3.14 3.14 0 00-1.43-2.42z"
              fill="url(#prefix__d_${svgId})" />
            <path
              fill="url(#prefix__e_${svgId})"
              d="M59.48 28.88a3.17 3.17 0 011.42 2.47l-.1 36.08c0 .9-.65 1.26-1.42.81l-26.7-15.4-2.26 4.22a.9.9 0 01-1.33.28 3.07 3.07 0 01-1.22-1.53l-2.33-7.09-9-5.2a3.15 3.15 0 01-1.43-2.46L15.23 5c0-.9.64-1.27 1.43-.81z" />
            <path
              d="M59.48 28.88a3.17 3.17 0 011.42 2.47l-.1 36.08c0 .9-.65 1.26-1.42.81l-26.7-15.4-2.26 4.22a.9.9 0 01-1.33.28 3.07 3.07 0 01-1.22-1.53l-2.33-7.09-9-5.2a3.15 3.15 0 01-1.43-2.46L15.23 5c0-.9.64-1.27 1.43-.81z"
              fill="url(#prefix__f_${svgId})" />
            <path
              fill="url(#prefix__e_${svgId})"
              d="M59.48 28.88a3.17 3.17 0 011.42 2.47l-.1 36.08c0 .9-.65 1.26-1.42.81l-26.7-15.4-2.26 4.22a.9.9 0 01-1.33.28 3.07 3.07 0 01-1.22-1.53l-2.33-7.09-9-5.2a3.15 3.15 0 01-1.43-2.46L15.23 5c0-.9.64-1.27 1.43-.81z" />
            <path
              fill="url(#prefix__h_${svgId})"
              d="M57.99 37.07l-.01 3.9L18.03 17.9l.01-3.9 39.95 23.07z" />
            <path
              fill="url(#prefix__i_${svgId})"
              d="M57.99 45.11l-.01 3.91-39.95-23.07.01-3.9 39.95 23.06z" />
            <path
              fill="url(#prefix__j_${svgId})"
              d="M44.62 45.04l-.01 3.9L18.03 33.6l.01-3.9 26.58 15.34z" />
            <path
              d="M60.76 30.55a2.54 2.54 0 01.14.8v3.95l.41-.13v-3.82a3.54 3.54 0 00-1.63-2.82L16.86 3.8a2.09 2.09 0 00-.44-.19l-.78.45a1 1 0 01.21-.06h.48l.27.12 21.47 12.4 21.41 12.36a3.19 3.19 0 011.28 1.67z"
              fill="url(#prefix__k_${svgId})" />
          </svg>
        `;
  return svgImage;
};
export default notificationsIllustration;
