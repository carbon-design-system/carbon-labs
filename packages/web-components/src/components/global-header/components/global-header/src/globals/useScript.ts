/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HeaderProps } from '../types/Header.types';
import { getAssistMeUrl } from './utils';

export default function useScript(props: HeaderProps) {
  const assistMeUrl = getAssistMeUrl(props?.environment ?? '');
  const isAssistMeEnabled = props?.assistMeConfigs?.productId;

  let status = isAssistMeEnabled ? 'loading' : 'idle';
  if (!isAssistMeEnabled) {
    return 'idle';
  }

  let script = document?.querySelector(
    `script[src="${assistMeUrl}"]`
  ) as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.src = assistMeUrl;
    script.defer = true;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-status', 'loading');

    document?.body?.appendChild(script);

    const setAttributeFromEvent = (event: { type: string }) => {
      script?.setAttribute(
        'data-status',
        event.type === 'load' ? 'ready' : 'error'
      );

      document.dispatchEvent(
        new CustomEvent('assist-me-script-status', {
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
