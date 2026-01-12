/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import mdx from './Calendar.mdx';
import { Calendar } from '../components/Calendar';
import type { CalendarView } from '../components/Calendar.types';
import '../components/calendar.scss';

const defaultViews: CalendarView[] = ['month', 'week', 'workWeek', 'day', 'threeDays'];


const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  globals: {
    backgrounds: { value: '#f4f4f4' },
    theme: 'g10',
  },
  argTypes: {
    views: {
      control: {
        type: 'check',
        options: defaultViews,
      },
      description: 'Select enabled views (at least one required)',
    },
    defaultView: {
      control: { type: 'select' },
      options: defaultViews,
    },
    weekStartsOn: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6], // 0=Sun, 1=Mon...
      description: 'Force start of week day (overrides locale)',
    },
    region: {
      control: 'text',
      description: 'Locale (e.g. en-US, fr-FR)',
    },
    initialDate: {
      control: 'date',
    },
    toolbar: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    rtl: { control: 'boolean' },
    scrollToCurrentTime: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: { page: mdx },
  },
};

export default meta;

type Story = StoryObj<typeof Calendar>;

const renderCalendar: Story['render'] = (args) => {

const currentViews = args.views && args.views.length > 0 
    ? (args.views as CalendarView[]) 
    : (['month'] as CalendarView[]);

  const dateValue = args.initialDate 
    ? new Date(args.initialDate as any) 
    : new Date();

  return (
    <div style={{ height: '100vh' }}>
      <Calendar
        {...args}
        views={currentViews}
        initialDate={dateValue}
        key={`${args.defaultView}-${args.weekStartsOn}`}
      />
    </div>
  );
};

export const Default: Story = {
  render: renderCalendar,
  args: {
    views: ['month', 'week', 'day'],
    defaultView: 'month',
    toolbar: true,
    stickyHeader: true,
    region: 'en-US',
    weekStartsOn: 0,
  },
};

export const WeekStartsMonday: Story = {
  render: renderCalendar,
  args: {
    ...Default.args,
    views: ['month', 'week'],
    weekStartsOn: 1,
  },
};

export const AllViews: Story = {
  render: renderCalendar,
  args: {
    ...Default.args,
    views: defaultViews,
  },
};
