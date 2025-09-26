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

// export type HeaderActionCarouselItem = {
//   id: string;
//   label: string;
// };

// export type HeaderActionCarousel = Base & {
//   type: 'carousel';
//   page: number;
//   total: number;
//   onSelectPage: (page: number) => void;
//   onStep?: (direction: -1 | 1, nextPage: number) => void;
//   renderLeading?: ReactNode;
//   /** Hide arrows if total ≤ 1 (default true) */
//   smartDisableArrows?: boolean;
// };

export type HeaderActionConfig = HeaderActionIcon | HeaderActionGhost;
//| HeaderActionCarousel;

export type HeaderActionProps = {
  headerActionConfig?: HeaderActionConfig | null;
};
