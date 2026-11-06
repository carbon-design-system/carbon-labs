/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ElementType } from 'react';
import {
  Accordion,
  AccordionItem,
  ActionableNotification,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonSet,
  Checkbox,
  CheckboxGroup,
  CodeSnippet,
  ComboBox,
  ContainedList,
  ContainedListItem,
  Dropdown,
  Form,
  FormGroup,
  Grid,
  Heading,
  preview_Text,
  InlineLoading,
  InlineNotification,
  Layer,
  Link,
  ListItem,
  Loading,
  MenuButton,
  MenuItem,
  NumberInput,
  OrderedList,
  ProgressBar,
  ProgressIndicator,
  ProgressStep,
  RadioButton,
  RadioButtonGroup,
  Search,
  Section,
  Select,
  SelectItem,
  Stack,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TextArea,
  TextInput,
  Theme,
  Tile,
  Toggle,
  UnorderedList,
} from '@carbon/react';
import { ChatThread, ChatMessage } from '@carbon-labs/react-chat-thread';
import { ChatInput } from '@carbon-labs/react-chat-input';
import {
  ReasoningTrace,
  ReasoningStep,
  ThinkingIndicator,
} from '@carbon-labs/react-reasoning-trace';
import { HistoryRail } from '@carbon-labs/react-history-rail';
import { SystemMessage } from '@carbon-labs/react-system-message';
import {
  CodeSnippet as LabsCodeSnippet,
  InlineCode,
} from '@carbon-labs/react-code-snippet';
import { MegaButton } from '@carbon-labs/react-mega-button';
import { SessionSwitcher } from '@carbon-labs/react-session-switcher';
import { ChatsPanel } from '@carbon-labs/react-chats-panel';
import {
  ChatPanels,
  ChatPanelToggles,
  ChatPanelArea,
} from '@carbon-labs/react-chat-panels';

// Carbon's components are styled by the global `@carbon/styles`; a labs component
// ships its own sheet and renders unstyled without it. The registry is the only
// place that knows which labs components a recipe can reach, so the sheets are
// imported here rather than in each story — anything consuming the registry gets
// them. Jest maps `.scss` to a style mock, so tests are unaffected.
// Each is the sheet the package publishes under its own `./scss/*` export, not a
// reach into a sibling folder: every v12 component is its own npm package, so a
// relative path would break this package's build.
import '@carbon-labs/react-chat-thread/scss/chat-thread.scss';
import '@carbon-labs/react-chat-input/scss/chat-input.scss';
import '@carbon-labs/react-reasoning-trace/scss/reasoning-trace.scss';
import '@carbon-labs/react-history-rail/scss/history-rail.scss';
import '@carbon-labs/react-system-message/scss/system-message.scss';
import '@carbon-labs/react-code-snippet/scss/code-snippet.scss';
import '@carbon-labs/react-mega-button/scss/mega-button.scss';
import '@carbon-labs/react-session-switcher/scss/session-switcher.scss';
import '@carbon-labs/react-chats-panel/scss/chats-panel.scss';
import '@carbon-labs/react-chat-panels/scss/chat-panels.scss';

/**
 * Every component a recipe can name, written out. A recipe's "component" string
 * is looked up here and nowhere else, so a recipe can render exactly what this
 * object holds. To add one: import it, add its line, and recipe-lint (rule
 * "unregistered") stops refusing recipes that use it. Column is absent on
 * purpose: a recipe reaches it only through grid.span.
 */
export const registry: Record<string, ElementType> = {
  '@carbon/react:Accordion': Accordion,
  '@carbon/react:AccordionItem': AccordionItem,
  '@carbon/react:ActionableNotification': ActionableNotification,
  '@carbon/react:Breadcrumb': Breadcrumb,
  '@carbon/react:BreadcrumbItem': BreadcrumbItem,
  '@carbon/react:Button': Button,
  '@carbon/react:ButtonSet': ButtonSet,
  '@carbon/react:Checkbox': Checkbox,
  '@carbon/react:CheckboxGroup': CheckboxGroup,
  '@carbon/react:CodeSnippet': CodeSnippet,
  '@carbon/react:ComboBox': ComboBox,
  '@carbon/react:ContainedList': ContainedList,
  '@carbon/react:ContainedListItem': ContainedListItem,
  '@carbon/react:Dropdown': Dropdown,
  '@carbon/react:Form': Form,
  '@carbon/react:FormGroup': FormGroup,
  '@carbon/react:Grid': Grid,
  '@carbon/react:Heading': Heading,
  // Carbon's text primitive, for words beside a component in one turn.
  '@carbon/react:preview_Text': preview_Text,
  '@carbon/react:InlineLoading': InlineLoading,
  '@carbon/react:InlineNotification': InlineNotification,
  '@carbon/react:Layer': Layer,
  '@carbon/react:Link': Link,
  '@carbon/react:ListItem': ListItem,
  '@carbon/react:Loading': Loading,
  '@carbon/react:MenuButton': MenuButton,
  '@carbon/react:MenuItem': MenuItem,
  '@carbon/react:NumberInput': NumberInput,
  '@carbon/react:OrderedList': OrderedList,
  '@carbon/react:ProgressBar': ProgressBar,
  '@carbon/react:ProgressIndicator': ProgressIndicator,
  '@carbon/react:ProgressStep': ProgressStep,
  '@carbon/react:RadioButton': RadioButton,
  '@carbon/react:RadioButtonGroup': RadioButtonGroup,
  '@carbon/react:Search': Search,
  '@carbon/react:Section': Section,
  '@carbon/react:Select': Select,
  '@carbon/react:SelectItem': SelectItem,
  '@carbon/react:Stack': Stack,
  '@carbon/react:StructuredListBody': StructuredListBody,
  '@carbon/react:StructuredListCell': StructuredListCell,
  '@carbon/react:StructuredListHead': StructuredListHead,
  '@carbon/react:StructuredListRow': StructuredListRow,
  '@carbon/react:StructuredListWrapper': StructuredListWrapper,
  '@carbon/react:Tab': Tab,
  '@carbon/react:TabList': TabList,
  '@carbon/react:TabPanel': TabPanel,
  '@carbon/react:TabPanels': TabPanels,
  // Carbon types Tabs as a component with static members, which ElementType
  // does not admit; it renders as one.
  '@carbon/react:Tabs': Tabs as ElementType,
  '@carbon/react:Tag': Tag,
  '@carbon/react:TextArea': TextArea,
  '@carbon/react:TextInput': TextInput,
  '@carbon/react:Theme': Theme,
  '@carbon/react:Tile': Tile,
  '@carbon/react:Toggle': Toggle,
  '@carbon/react:UnorderedList': UnorderedList,
  '@carbon-labs/react-chat-thread:ChatThread': ChatThread,
  '@carbon-labs/react-chat-thread:ChatMessage': ChatMessage,
  '@carbon-labs/react-chat-input:ChatInput': ChatInput,
  '@carbon-labs/react-reasoning-trace:ReasoningTrace': ReasoningTrace,
  '@carbon-labs/react-reasoning-trace:ReasoningStep': ReasoningStep,
  '@carbon-labs/react-reasoning-trace:ThinkingIndicator': ThinkingIndicator,
  '@carbon-labs/react-history-rail:HistoryRail': HistoryRail,
  '@carbon-labs/react-system-message:SystemMessage': SystemMessage,
  '@carbon-labs/react-code-snippet:CodeSnippet': LabsCodeSnippet,
  '@carbon-labs/react-code-snippet:InlineCode': InlineCode,
  '@carbon-labs/react-mega-button:MegaButton': MegaButton,
  '@carbon-labs/react-session-switcher:SessionSwitcher': SessionSwitcher,
  '@carbon-labs/react-chats-panel:ChatsPanel': ChatsPanel,
  '@carbon-labs/react-chat-panels:ChatPanels': ChatPanels,
  '@carbon-labs/react-chat-panels:ChatPanelToggles': ChatPanelToggles,
  '@carbon-labs/react-chat-panels:ChatPanelArea': ChatPanelArea,
};
