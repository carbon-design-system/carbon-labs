/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button, IconButton } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { HeaderActionConfig } from './header-action.types';

const HeaderAction: React.FC<{
  config: HeaderActionConfig;
  headerExpanded: boolean;
}> = ({ config, headerExpanded }) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__header-action`;

  // ICON
  if (config.type === 'icon-button') {
    const { icon: Icon, iconLabel, onClick, disabled, ariaLabel } = config;
    return (
      <div
        className={blockClass}
        aria-label={ariaLabel}
        aria-hidden={!headerExpanded}
        data-expanded={headerExpanded}>
        <IconButton
          kind="ghost"
          size="lg"
          label={iconLabel}
          onClick={onClick}
          disabled={disabled}>
          {Icon && <Icon fill={`var(--cds-icon-secondary)`} size={16} />}
        </IconButton>
      </div>
    );
  }

  // GHOST
  if (config.type === 'ghost-button') {
    const { label, icon, onClick, disabled, ariaLabel } = config;
    return (
      <div
        className={blockClass}
        aria-label={ariaLabel}
        aria-hidden={!headerExpanded}
        data-expanded={headerExpanded}>
        <Button
          kind="ghost"
          size="lg"
          onClick={onClick}
          disabled={disabled}
          renderIcon={icon}>
          {label}
        </Button>
      </div>
    );
  }
};

export default HeaderAction;
