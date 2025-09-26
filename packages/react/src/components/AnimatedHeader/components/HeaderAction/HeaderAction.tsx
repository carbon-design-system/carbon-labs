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
//import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import type { HeaderActionConfig } from './header-action.types';

const HeaderAction: React.FC<{ config: HeaderActionConfig }> = ({ config }) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__header-action`;

  // ICON
  if (config.type === 'icon-button') {
    const { icon: Icon, iconLabel, onClick, disabled, ariaLabel } = config;
    return (
      <div className={blockClass} aria-label={ariaLabel}>
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
      <div className={blockClass} aria-label={ariaLabel}>
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

  // // CAROUSEL
  // const {
  //   page,
  //   total,
  //   onSelectPage,
  //   onStep,
  //   renderLeading,
  //   ariaLabel,
  //   smartDisableArrows = true,
  // } = config;

  // const canUseArrows = total > 1 || !smartDisableArrows;
  // const go = (dir: -1 | 1) => {
  //   if (total < 1) return;
  //   const next = (page + dir + total) % total;
  //   onStep?.(dir, next);
  //   onSelectPage(next);
  // };

  // return (
  //   <div
  //     className={`${blockClass} ${blockClass}__carousel`}
  //     aria-label={ariaLabel ?? 'Tile pager'}>
  //     {renderLeading ? (
  //       <div className={`${blockClass}__carousel-leading`}>{renderLeading}</div>
  //     ) : null}

  //     <div
  //       className={`${blockClass}__carousel-pager`}
  //       role="group"
  //       aria-label="Tile pages">
  //       <IconButton
  //         kind="ghost"
  //         size="lg"
  //         label="Previous page"
  //         onClick={() => go(-1)}
  //         disabled={!canUseArrows}>
  //         <ChevronLeft />
  //       </IconButton>

  //       <ul
  //         className={`${blockClass}__carousel-dots`}
  //         role="tablist"
  //         aria-label="Tile page dots">
  //         {Array.from({ length: total }).map((_, i) => {
  //           const selected = i === page;
  //           return (
  //             <li key={i} role="presentation">
  //               <button
  //                 type="button"
  //                 role="tab"
  //                 aria-selected={selected}
  //                 aria-controls={`tile-page-${i}`}
  //                 tabIndex={selected ? 0 : -1}
  //                 className={`${blockClass}__carousel-dot`}
  //                 data-expanded={selected}
  //                 title={`Page ${i + 1} of ${total}`}
  //                 onClick={() => onSelectPage(i)}>
  //                 <span className="cds--visually-hidden">Page {i + 1}</span>
  //               </button>
  //             </li>
  //           );
  //         })}
  //       </ul>

  //       <IconButton
  //         kind="ghost"
  //         size="lg"
  //         label="Next page"
  //         onClick={() => go(1)}
  //         disabled={!canUseArrows}>
  //         <ChevronRight />
  //       </IconButton>
  //     </div>
  //   </div>
  // );
};

export default HeaderAction;
