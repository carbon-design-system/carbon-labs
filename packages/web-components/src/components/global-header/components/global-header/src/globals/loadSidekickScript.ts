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
  const isSolisSidekickEnabled = props?.sidekickConfig?.isEnabled;

  let status = isSolisSidekickEnabled ? 'loading' : 'idle';
  if (!isSolisSidekickEnabled) {
    return 'idle';
  }

  let script = document?.querySelector(
    `script[src="${sidekickUrl}"]`
  ) as HTMLScriptElement;

  if (!script && sidekickUrl && props.solisConfig && props.sidekickConfig) {
    script = document.createElement('script');
    script.src = sidekickUrl;
    script.type = 'module';
    script.defer = true;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-status', 'loading');

    document?.head?.appendChild(script);

    window._solis = {
      product_id: props.solisConfig.product_id,
      is_prod: props.solisConfig.is_prod,
      cdn_hostname: props.solisConfig.cdn_hostname,
      deployment_environment: props.solisConfig.deployment_environment,
      backend_proxy: props.solisConfig.backendProxy,
    };
    window._solis.sidekick = {
      correlation_id: props.sidekickConfig.correlationId,
      title: props.sidekickConfig.title,
      context: props.sidekickConfig.context,
      insights_enabled: props.sidekickConfig.insights_enabled,
      chat_enabled: props.sidekickConfig.chat_enabled,
      overview_enabled: props.sidekickConfig.overview_enabled,
      tell_me_more_enabled: props.sidekickConfig.tell_me_more_enabled,
    };

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
