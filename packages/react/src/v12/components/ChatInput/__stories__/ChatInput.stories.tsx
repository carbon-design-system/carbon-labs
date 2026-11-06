/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-webpack5';
import {
  ChatInput,
  type ChatInputConnection,
  type ChatInputProps,
  type ChatInputSetting,
} from '../components/ChatInput';
import { FileChip, type FileChipStatus } from '../../FileChip';
import '../components/chat-input.scss';
// Every button is a MegaButton, and attachments are FileChips; their styles
// come with them in a product's bundle.
import '../../MegaButton/components/mega-button.scss';
import '../../KeyboardShortcut/components/keyboard-shortcut.scss';
import '../../FileChip/components/file-chip.scss';
import './ChatInput.stories.scss';
import proposals from '../proposals/tokens.json';
import fileChipProposals from '../../FileChip/proposals/tokens.json';
import mdx from './ChatInput.mdx';

type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';
type Theme = CarbonTheme | 'v12-light' | 'v12-dark';
type TokenFile = Record<string, Record<string, unknown>>;

// The v12 Storybook's v12 themes read the proposals' light and dark values.
const proposalTheme: Record<Theme, CarbonTheme> = {
  white: 'white',
  g10: 'g10',
  g90: 'g90',
  g100: 'g100',
  'v12-light': 'white',
  'v12-dark': 'g100',
};

/**
 * One theme's proposed values, as the custom properties the stylesheets read
 * through get-var. A DTCG alias, `{layer-03}`, is Carbon's own token.
 *
 * @param {TokenFile} file A proposals/tokens.json.
 * @param {CarbonTheme} theme The Carbon theme.
 * @returns {string} The declarations.
 */
function declarations(file: TokenFile, theme: CarbonTheme): string {
  return Object.entries(file)
    .filter(([group]) => !group.startsWith('$'))
    .flatMap(([group, tokens]) =>
      Object.entries(tokens).map(([role, token]) => {
        const themes = (
          token as {
            $extensions: { 'carbon.themes': Record<CarbonTheme, string> };
          }
        ).$extensions['carbon.themes'];
        const value = themes[theme].replace(/^\{(.+)\}$/, 'var(--cds-$1)');
        return `--cds-${group}-${role}: ${value};`;
      })
    )
    .join(' ');
}

/**
 * The proposed values for the page's theme, scoped to one class, and again for
 * each Carbon zone inside it, because the menus render in the inverse zone and
 * must read that zone's values. Without them the component renders on stock
 * Carbon (each get-var's fallback), which is what `proposals` off shows.
 *
 * @param {Theme} theme The Storybook theme.
 * @param {string} scope The class the values are scoped to.
 * @returns {string} The CSS rules.
 */
function proposedValues(theme: Theme, scope: string): string {
  const files = [proposals, fileChipProposals] as unknown as TokenFile[];
  const page = files.map((file) => declarations(file, proposalTheme[theme]));
  const zones = (['white', 'g10', 'g90', 'g100'] as CarbonTheme[]).map(
    (zone) =>
      `.${scope} .cds--${zone} { ${files
        .map((file) => declarations(file, zone))
        .join(' ')} }`
  );
  return [`.${scope} { ${page.join(' ')} }`, ...zones].join('\n');
}

const withProposals: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'white') as Theme;
  const on = context.args.proposals !== false;
  const scope = 'chat-input-story-proposals';
  return (
    // The composer sits at the foot of a conversation, so the stories put it
    // there: on the page, with room above for the menus to open into.
    <div
      className={
        on ? `chat-input-story__page ${scope}` : 'chat-input-story__page'
      }>
      {on && <style>{proposedValues(theme, scope)}</style>}
      <Story />
    </div>
  );
};

const commands = [
  { id: 'summarize', name: 'summarize', description: 'Summarize the thread' },
  { id: 'translate', name: 'translate', description: 'Translate a passage' },
  { id: 'explain', name: 'explain', description: 'Explain the selection' },
  { id: 'search', name: 'search', description: 'Search connected sources' },
  { id: 'clear', name: 'clear', description: 'Start a new conversation' },
];

const models = [
  { id: 'granite-4', label: 'Granite 4' },
  { id: 'granite-4-tiny', label: 'Granite 4 Tiny' },
  { id: 'llama-4', label: 'Llama 4 Maverick' },
];

const modes = [
  { id: 'ask', label: 'Ask' },
  { id: 'plan', label: 'Plan' },
  { id: 'agent', label: 'Agent' },
];

const seedConnections: ChatInputConnection[] = [
  { id: 'box', label: 'Box', enabled: true },
  { id: 'github', label: 'GitHub', enabled: false },
  {
    id: 'slack',
    label: 'Slack',
    enabled: false,
    unavailableReason: 'Your administrator has turned Slack off',
  },
];

const seedSettings: ChatInputSetting[] = [
  { id: 'web', label: 'Search the web', selected: true },
  { id: 'memory', label: 'Use memory', selected: false },
];

interface Attachment {
  id: number;
  name: string;
  mimeType: string;
  status: FileChipStatus;
}

type StoryArgs = ChatInputProps & {
  proposals?: boolean;
  withFiles?: boolean;
};

/**
 * A working composer: menus that change what they show, files that upload,
 * and a reply that takes a moment, so every state can be reached by hand.
 *
 * @param {StoryArgs} props The story's args.
 * @returns {React.ReactElement} The composer.
 */
function Composer({ withFiles, ...args }: Omit<StoryArgs, 'proposals'>) {
  const [connections, setConnections] = useState(seedConnections);
  const [settings, setSettings] = useState(seedSettings);
  const [modelId, setModelId] = useState(models[0].id);
  const [modeId, setModeId] = useState(modes[0].id);
  const [speech, setSpeech] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const [files, setFiles] = useState<Attachment[]>(
    withFiles
      ? [
          {
            id: 1,
            name: 'Quarterly-business-review.pdf',
            mimeType: 'application/pdf',
            status: 'idle',
          },
          {
            id: 2,
            name: 'Notes.docx',
            mimeType: 'application/msword',
            status: 'uploading',
          },
        ]
      : []
  );
  const nextId = useRef(10);
  const fileInput = useRef<HTMLInputElement>(null);

  // Uploads finish after a moment.
  useEffect(() => {
    if (!files.some((file) => file.status === 'uploading')) {
      return;
    }
    const timer = setTimeout(
      () =>
        setFiles((current) =>
          current.map((file) =>
            file.status === 'uploading' ? { ...file, status: 'complete' } : file
          )
        ),
      1500
    );
    return () => clearTimeout(timer);
  }, [files]);

  // A reply takes a moment, and can be stopped.
  useEffect(() => {
    if (!busy) {
      return;
    }
    const timer = setTimeout(() => setBusy(false), 4000);
    return () => clearTimeout(timer);
  }, [busy]);

  const addFiles = (added: File[]) =>
    setFiles((current) => [
      ...current,
      ...added.map((file) => ({
        id: nextId.current++,
        name: file.name,
        mimeType: file.type,
        status: 'uploading' as FileChipStatus,
      })),
    ]);

  return (
    <>
      {sent.length > 0 ? (
        <ol className="chat-input-story__sent" aria-label="Sent">
          {sent.map((prompt, index) => (
            <li key={index}>{prompt}</li>
          ))}
        </ol>
      ) : null}
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <ChatInput
        {...args}
        busy={busy || args.busy}
        commands={commands}
        connections={connections}
        models={models}
        modes={modes}
        settings={settings}
        selectedModelId={modelId}
        selectedModeId={modeId}
        speechActive={speech}
        attachments={files.map((file) => (
          <FileChip
            key={file.id}
            name={file.name}
            mimeType={file.mimeType}
            status={file.status}
            onSuccessEnd={() =>
              setFiles((current) =>
                current.map((other) =>
                  other.id === file.id ? { ...other, status: 'idle' } : other
                )
              )
            }
            onRemove={() =>
              setFiles((current) =>
                current.filter((other) => other.id !== file.id)
              )
            }
          />
        ))}
        onAddFile={() => fileInput.current?.click()}
        onFilesAdded={addFiles}
        onToggleConnection={(id, enabled) =>
          setConnections((current) =>
            current.map((connection) =>
              connection.id === id ? { ...connection, enabled } : connection
            )
          )
        }
        onNewConnection={() => undefined}
        onModelChange={setModelId}
        onModeChange={setModeId}
        onSettingChange={(id, selected) =>
          setSettings((current) =>
            current.map((setting) =>
              setting.id === id ? { ...setting, selected } : setting
            )
          )
        }
        onSpeechToggle={setSpeech}
        onCommand={(command) =>
          setSent((current) => [...current, `/${command.name}`])
        }
        onSubmit={(prompt) => {
          setSent((current) => [...current, prompt]);
          setFiles([]);
          setBusy(true);
        }}
        onStop={() => setBusy(false)}
      />
    </>
  );
}

const meta: Meta<StoryArgs> = {
  title: 'V12/ChatInput',
  tags: ['squad', 'incubating'],
  component: ChatInput,
  decorators: [withProposals],
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    proposals: true,
    withFiles: false,
    actionsPlacement: 'below',
    busy: false,
    disabled: false,
    label: 'Ask anything',
    maxRows: 8,
    submitOn: 'enter',
  },
  argTypes: {
    proposals: {
      control: 'boolean',
      description:
        'Story only: set the proposed tokens (proposals/tokens.json, ChatInput and FileChip). Off shows ChatInput on stock Carbon.',
      table: { category: 'Story' },
    },
    withFiles: {
      control: 'boolean',
      description: 'Story only: start with two attached files.',
      table: { category: 'Story' },
    },
    actionsPlacement: { control: 'radio', options: ['below', 'inside'] },
    busy: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    maxRows: { control: 'number' },
    menuTheme: {
      control: 'radio',
      options: [undefined, 'white', 'g10', 'g90', 'g100'],
    },
    submitOn: { control: 'radio', options: ['enter', 'mod-enter'] },
    attachments: { control: false },
    className: { control: false },
    commands: { control: false },
    connections: { control: false },
    defaultValue: { control: false },
    models: { control: false },
    modes: { control: false },
    selectedModeId: { control: false },
    selectedModelId: { control: false },
    settings: { control: false },
    speechActive: { control: false },
    value: { control: false },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

/**
 * The primary composer: a 48px pill, its actions below. Type `/` for
 * commands; `+` and the settings button open the menus, inverse to the page.
 */
export const Default: Story = {
  // `proposals` is the decorator's, not the composer's.
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
};

/**
 * Files grow the box to its 16 radius, with the send corner at 20.
 */
export const WithFiles: Story = {
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
  args: { withFiles: true },
};

/**
 * The secondary layout: every control inside the box.
 */
export const ActionsInside: Story = {
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
  args: { actionsPlacement: 'inside' },
};

/**
 * A long prompt grows the box a row at a time, to `maxRows`, then scrolls.
 */
export const Grown: Story = {
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
  args: {
    defaultValue:
      'Draft a reply to the vendor that accepts the revised delivery date, asks them to confirm the new invoice terms in writing, and copies procurement.\n\nKeep it short.',
  },
};

/**
 * While a reply is generating, send becomes Stop.
 */
export const Busy: Story = {
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
  args: { busy: true, defaultValue: 'What changed in the last release?' },
};

/**
 * Nothing can be typed, attached or sent.
 */
export const Disabled: Story = {
  render: ({ proposals: _proposals, ...args }) => <Composer {...args} />,
  args: { disabled: true },
};
