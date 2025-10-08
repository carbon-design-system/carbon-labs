/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ElementType } from 'react';
type Base = {
  ariaLabel?: string;
  headerExpanded?: boolean;
};

export type HeaderActionIcon = Base & {
  type: 'icon-button';
  icon: ElementType;
  iconLabel: string;
  onClick: () => void;
  disabled?: boolean;
};

export type HeaderActionGhost = Base & {
  type: 'ghost-button';
  label: string;
  icon?: ElementType;
  onClick: () => void;
  disabled?: boolean;
};

export type HeaderActionConfig = HeaderActionIcon | HeaderActionGhost;

export type HeaderActionProps = {
  headerActionConfig?: HeaderActionConfig | null;
};
