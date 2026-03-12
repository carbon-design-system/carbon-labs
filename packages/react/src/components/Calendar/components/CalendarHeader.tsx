/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useMemo } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type {
  CalendarView,
  CalendarHeaderProps,
} from '../components/Calendar.types';

import {
  ContentSwitcher,
  Switch,
  Tooltip,
  Button,
  IconButton,
  Dropdown,
} from '@carbon/react';

import {
  ChevronLeft,
  ChevronRight,
  Add,
  SidePanelClose,
  SidePanelCloseFilled,
} from '@carbon/icons-react';

type ViewItem = { text: string; value: CalendarView };

const formatViewText = (view: CalendarView): string => {
  switch (view) {
    case 'month':
      return 'Month';
    case 'week':
      return 'Week';
    case 'day':
      return 'Day';
    case 'threeDays':
      return 'Three days';
    case 'workWeek':
      return 'Work week';
    default:
      return 'Month';
  }
};

const cls = (...tokens: Array<string | false | null | undefined>) =>
  tokens.filter(Boolean).join(' ');

export const CalendarHeader = forwardRef<HTMLDivElement, CalendarHeaderProps>(
  (
    {
      blockClass: blockClassProp,
      formatDate,
      viewDateRange,
      view,
      onToday,
      onNext,
      onPrevious,
      onViewChange,
      onToggleDatePickerPanel,
      toggleDatePicker,
      calendarViews,
      toolbarSize,
      calendarTableRef,
      calendarHeaderRightRef,
      onCalendarScroll,
      smallDeviceSize,
    },
    ref
  ) => {
    const prefix = usePrefix();
    const blockClass = blockClassProp ?? `${prefix}--calendar`;

    const viewItems: ViewItem[] = useMemo(
      () =>
        (calendarViews ?? []).map((v) => ({
          text: formatViewText(v),
          value: v,
        })),
      [calendarViews]
    );

    const selectedIndex = useMemo(() => {
      const idx = viewItems.findIndex((i) => i.value === view);
      return Math.max(0, idx);
    }, [viewItems, view]);

    const selectedItem = useMemo(
      () => viewItems.find((i) => i.value === view) ?? null,
      [viewItems, view]
    );

    const isSmallToolbar = toolbarSize === 'xsm' || toolbarSize === 'sm';
    const isSmallSwitcher =
      toolbarSize === 'xsm' || toolbarSize === 'sm' || toolbarSize === 'md';

    const showContentSwitcher =
      calendarViews.length >= 2 &&
      calendarViews.length <= 3 &&
      !isSmallSwitcher;

    const showDropdown =
      calendarViews.length > 3 ||
      (calendarViews.length >= 2 && !showContentSwitcher);

    return (
      <div
        role="toolbar"
        ref={ref}
        aria-label="Calendar Controls"
        className={cls(
          `${blockClass}__toolbar`,
          toggleDatePicker &&
            !smallDeviceSize &&
            `${blockClass}__toolbar-datepicker`,
          toolbarSize === 'xsm' && `${blockClass}__toolbar-sm`,
          toolbarSize === 'sm' && `${blockClass}__toolbar-small`
        )}>
        <div
          className={cls(
            `${blockClass}__toolbar-left`,
            toolbarSize === 'xsm' && `${blockClass}__toolbar-left-sm`
          )}>
          <div className={`${blockClass}__date-picker`}>
            <IconButton
              kind="ghost"
              label="Date picker"
              size="md"
              align="bottom"
              closeOnActivation={false}
              onClick={onToggleDatePickerPanel}
              className={`${blockClass}__date-picker-icon`}>
              {toggleDatePicker ? <SidePanelCloseFilled /> : <SidePanelClose />}
            </IconButton>
          </div>
        </div>

        <div
          className={cls(
            `${blockClass}__toolbar-right`,
            toolbarSize === 'xsm' && `${blockClass}__toolbar-right-sm`
          )}
          ref={calendarHeaderRightRef}
          onScroll={(e) => onCalendarScroll?.(e, calendarTableRef)}>
          <div className={`${blockClass}__toolbar-right-start`}>
            <div
              className={cls(
                `${blockClass}__today-btn`,
                isSmallToolbar && `${blockClass}__today-btn-sm`
              )}>
              <Tooltip
                label={formatDate()}
                closeOnActivation
                align="bottom-left">
                <Button
                  kind="ghost"
                  onClick={onToday}
                  className={`${blockClass}__link ${blockClass}__today sb-tooltip-trigger`}
                  size="md">
                  Today
                </Button>
              </Tooltip>
            </div>

            <div
              className={cls(
                `${blockClass}__arrows`,
                isSmallToolbar && `${blockClass}__arrows-sm`
              )}>
              <IconButton
                kind="ghost"
                label="Previous"
                size="md"
                align="bottom"
                onClick={onPrevious}>
                <ChevronLeft />
              </IconButton>
              <IconButton
                kind="ghost"
                label="Next"
                size="md"
                align="bottom"
                onClick={onNext}>
                <ChevronRight />
              </IconButton>
            </div>

            <div
              id="calendar-caption"
              className={cls(
                `${blockClass}__toolbar-title`,
                isSmallToolbar && `${blockClass}__toolbar-title-sm`
              )}
              aria-label={viewDateRange(view)}>
              <span>
                <span>{viewDateRange(view)}</span>
              </span>
            </div>
          </div>

          <div className={`${blockClass}__toolbar-right-end`}>
            {showContentSwitcher ? (
              <div className={`${blockClass}__switcher`}>
                <ContentSwitcher
                  size="sm"
                  selectionMode="automatic"
                  selectedIndex={selectedIndex}
                  onChange={(value) => onViewChange(value.name as CalendarView)}
                  lowContrast={true}>
                  {calendarViews.map((v) => (
                    <Switch key={v} name={v} text={formatViewText(v)} />
                  ))}
                </ContentSwitcher>
              </div>
            ) : showDropdown ? (
              <div
                className={cls(
                  `${blockClass}__dropdown-view`,
                  isSmallToolbar && `${blockClass}__dropdown-view-sm`
                )}>
                <Dropdown
                  id="calendar-view-dropdown"
                  size="md"
                  titleText=""
                  helperText=""
                  items={viewItems}
                  label={selectedItem?.text ?? ''}
                  initialSelectedItem={selectedItem ?? undefined}
                  itemToString={(item) => item?.text ?? ''}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) onViewChange(selectedItem.value);
                  }}
                  type="inline"
                  autoAlign={true}
                  aria-label={selectedItem?.text ?? ''}
                />
              </div>
            ) : null}

            {!isSmallToolbar ? (
              <Button
                renderIcon={Add}
                iconDescription="New event"
                kind="primary"
                size="md"
                onClick={() => {}}
                className={`${blockClass}__create-event`}>
                New event
              </Button>
            ) : (
              <IconButton
                label="New event"
                kind="primary"
                size="md"
                onClick={() => {}}
                className={`${blockClass}__create-event`}>
                <Add />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CalendarHeader.displayName = 'CalendarHeader';
