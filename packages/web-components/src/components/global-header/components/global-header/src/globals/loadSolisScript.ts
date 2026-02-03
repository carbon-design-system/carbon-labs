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

export default function loadSolisScript(props: HeaderProps) {
  const solisUrl = props?.solisConfig?.scriptUrl;
  const isSolisSwitcherEnabled = props?.solisConfig?.isEnabled;

  let status = isSolisSwitcherEnabled ? 'loading' : 'idle';
  if (!isSolisSwitcherEnabled) {
    return 'idle';
  }

  let script = document?.querySelector(
    `script[src="${solisUrl}"]`
  ) as HTMLScriptElement;

  if (!script && solisUrl && props.solisConfig) {
    script = document.createElement('script');
    script.src = solisUrl;
    script.type = 'module';
    script.defer = true;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-status', 'loading');

    document?.head?.appendChild(script);

    if (!window._solis) {
      window._solis = {
        product_id: props.solisConfig.product_id,
        is_prod: props.solisConfig.is_prod,
        cdn_hostname: props.solisConfig.cdn_hostname,
        deployment_environment: props.solisConfig.deployment_environment,
        backend_proxy: props.solisConfig.backendProxy,
      };
    }

    const setAttributeFromEvent = (event: { type: string }) => {
      script?.setAttribute(
        'data-status',
        event.type === 'load' ? 'ready' : 'error'
      );

      document.dispatchEvent(
        new CustomEvent('solis-script-status', {
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
