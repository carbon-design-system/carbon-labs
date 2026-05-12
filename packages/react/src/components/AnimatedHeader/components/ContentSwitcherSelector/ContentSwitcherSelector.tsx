/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  ContentSwitcher,
  Switch,
  SkeletonPlaceholder,
  type ContentSwitcherProps,
} from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

export type ContentSwitcherItem = {
  id?: string;
  text: string;
  onSelect?: () => void;
};

export type ContentSwitcherConfig = Omit<
  ContentSwitcherProps,
  'children' | 'onChange' | 'size' | 'lowContrast'
> & {
  items: ContentSwitcherItem[];
  ariaLabel?: string;
  isLoading?: boolean;
  lowContrast?: boolean;
  visibleCount?: 2 | 3;
  onChange?: ContentSwitcherProps['onChange'];
};

export type ContentSwitcherSelectorProps = {
  contentSwitcherConfig?: ContentSwitcherConfig | null;
  isLoading?: boolean;
  headerExpanded?: boolean;
};

const ContentSwitcherSelector: React.FC<ContentSwitcherSelectorProps> = ({
  contentSwitcherConfig,
  isLoading,
  headerExpanded,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__content-switcher`;

  if (!contentSwitcherConfig) {
    return null;
  }

  const {
    items = [],
    visibleCount,
    lowContrast,
    ariaLabel,
    onChange,
    selectedIndex,
    ...rest
  } = contentSwitcherConfig;

  const count: 2 | 3 = visibleCount === 3 ? 3 : 2;
  const visibleItems = items.slice(0, count);

  const selectedIndexSafe = Math.min(
    Math.max(selectedIndex, 0),
    visibleItems.length - 1
  );

  if (isLoading || contentSwitcherConfig.isLoading) {
    return <SkeletonPlaceholder className={`${blockClass}-skeleton`} />;
  }

  if (visibleItems.length < 2 || visibleItems.length > 3) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[ContentSwitcherSelector] contentSwitcherConfig.items must contain 2 or 3 items.'
      );
    }
    return null;
  }

  return (
    <div className={`${blockClass}--container`} data-expanded={headerExpanded}>
      <ContentSwitcher
        className={`${blockClass}`}
        aria-label={ariaLabel ?? 'Select a task group'}
        lowContrast={lowContrast}
        selectedIndex={selectedIndexSafe}
        size="md"
        onChange={(ev) => {
          onChange?.(ev);
          const idx = (ev as any).index ?? (ev as any).selectedIndex ?? 0;
          visibleItems[idx]?.onSelect?.();
        }}
        {...rest}>
        {visibleItems.map((item, idx) => {
          return (
            <Switch
              key={item.id ?? idx}
              name={`option-${idx}`}
              text={item.text}></Switch>
          );
        })}
      </ContentSwitcher>
    </div>
  );
};

export default ContentSwitcherSelector;
