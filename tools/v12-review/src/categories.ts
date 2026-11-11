/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The v12 components by category, shared by the catalog story and the review
// app. A component is named by its story title under V12/. One that isn't
// listed shows under "Not yet sorted" until it is given a category here.

export interface Category {
  id: string;
  title: string;
  summary: string;
  /** The components, by their story title under V12/. */
  names: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'actions',
    title: 'Actions',
    summary: 'Buttons and the controls that act.',
    names: ['Button', 'CopyButton', 'Link', 'Toolbar', 'ContextualBar'],
  },
  {
    id: 'inputs',
    title: 'Inputs',
    summary: 'Fields and choices.',
    names: [
      'TextInput',
      'TextArea',
      'NumberInput',
      'Search',
      'Select',
      'Dropdown',
      'Checkbox',
      'RadioButton',
      'Toggle',
      'Slider',
      'DatePicker',
      'DatePickerV2',
      'TimePicker',
      'FileUploader',
      'InlineEdit',
    ],
  },
  {
    id: 'navigation',
    title: 'Selection and navigation',
    summary: 'Moving between views and options.',
    names: [
      'ContentSwitcher',
      'Tabs',
      'SelectList',
      'Menu',
      'SideNav',
      'Breadcrumb',
      'Pagination',
      'PaginationNav',
      'TreeView',
      'JumpTo',
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    summary: 'Surfaces that open over the page.',
    names: [
      'Tooltip',
      'Toggletip',
      'Popover',
      'Modal',
      'SidePanel',
      'Tearsheet',
      'AboutModal',
    ],
  },
  {
    id: 'containers',
    title: 'Containers and layout',
    summary: 'What holds content.',
    names: [
      'Tile',
      'Card',
      'OptionsTile',
      'Accordion',
      'PageHeader',
      'FormLayout',
      'Scroller',
    ],
  },
  {
    id: 'data',
    title: 'Data display',
    summary: 'Tables, lists, tags and the rest of showing data.',
    names: [
      'DataTable',
      'StructuredList',
      'ContainedList',
      'List',
      'DescriptionList',
      'Tag',
      'TagSet',
      'CodeSnippet',
      'UserAvatar',
      'ActivityFeed',
      'Charts',
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback and status',
    summary: 'Telling people what happened.',
    names: [
      'Notification',
      'NotificationsPanel',
      'ProgressBar',
      'ProgressRing',
      'ProgressIndicator',
      'StatusIndicator',
      'Loading',
      'Processing',
      'ShimmerText',
      'TurnStatus',
      'StepList',
      'Feedback',
      'EmptyState',
      'FullPageError',
      'JobsTray',
    ],
  },
  {
    id: 'patterns',
    title: 'Shells and patterns',
    summary:
      'Whole screens built from the components, starting with a sample product.',
    names: [
      'Console',
      'AppShell',
      'Chat',
      'StepFlow',
      'FilterPanel',
      'Recipes',
    ],
  },
  {
    id: 'foundations',
    title: 'Motion and foundations',
    summary: 'What the components share.',
    names: [
      'Disclosure',
      'SelectionKit',
      'ListReflow',
      'RollText',
      'Snap',
      'IconMotion',
      'MotionIcons',
      'ThemeZone',
      'KitDefaults',
      'Illustrations',
      'EasingGraph',
      'DurationBar',
    ],
  },
];

/** Story titles that aren't components: never listed. */
export const LEFT_OUT = new Set([
  'Catalog',
  'Review',
  'Workbench',
  'Props',
  'Util',
]);

/** Components whose Default story opens over a page or fills one: each in a frame of its own. */
export const FRAMED = new Set([
  'Console',
  'AppShell',
  'SideNav',
  'Chat',
  'Recipes',
  'Modal',
  'Tearsheet',
  'SidePanel',
  'AboutModal',
  'NotificationsPanel',
  'JobsTray',
  'FullPageError',
]);

/**
 * Experiences: apps built only from the components, to try them together.
 * They have no docs page, so their text is here.
 */
export const EXPERIENCES: Record<
  string,
  {
    title: string;
    summary: string;
    sections: { title: string; text: string }[];
  }
> = {
  Console: {
    title: 'Console',
    summary:
      'A small cloud console built only from v12 components, to try them together as a product. It has three pages: Overview, Deployments and Settings. Open a deployment for its details, create one, change a setting and save it, check notifications, or ask the assistant about the failures. Each example starts on a different page of the same app.',
    sections: [],
  },
};
