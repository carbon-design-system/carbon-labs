/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { HeaderProps } from '../types/Header.types';

export default function loadSidekickScript(props: HeaderProps) {
  const sidekickUrl = props?.sidekickConfig?.scriptUrl;
  const isSidekickEnabled = props?.sidekickConfig?.isEnabled;

  let status = isSidekickEnabled ? 'loading' : 'idle';
  if (!isSidekickEnabled) {
    return 'idle';
  }

  let script = document?.querySelector(
    `script[src="${sidekickUrl}"]`
  ) as HTMLScriptElement;

  if (!script && sidekickUrl) {
    script = document.createElement('script');
    script.src = sidekickUrl;
    script.type = 'module';
    script.defer = true;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-status', 'loading');


    document?.head?.appendChild(script);

    const setAttributeFromEvent = (event: { type: string }) => {
      script?.setAttribute(
        'data-status',
        event.type === 'load' ? 'ready' : 'error'
      );

      document.dispatchEvent(
        new CustomEvent('sidekick-script-status', {
          detail: { message: event.type },
          bubbles: true,
          composed: true,
        })
      );
    };

    script.addEventListener('load', setAttributeFromEvent);
    script.addEventListener('error', setAttributeFromEvent);
  } else {
    status = script.getAttribute('data-status') as string;
  }
  return status;
}