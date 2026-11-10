/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from '@carbon/react';
import {
  FileChip,
  fileChipKinds,
  fileChipStatuses,
  type FileChipKind,
  type FileChipProps,
  type FileChipStatus,
} from '../components/FileChip';
import '../components/file-chip.scss';
// Remove is a MegaButton; its styles come with it in a product's bundle.
import '../../MegaButton/components/mega-button.scss';
import '../../KeyboardShortcut/components/keyboard-shortcut.scss';
import './FileChip.stories.scss';
import proposals from '../proposals/tokens.json';
import thumbnail from './assets/thumbnail.jpg';
import mdx from './FileChip.mdx';

type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';
type Theme = CarbonTheme | 'v12-light' | 'v12-dark';

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
 * The proposed values, for one Carbon theme, as the custom properties the
 * stylesheet reads through get-var, scoped to one class. Without them the
 * component renders on stock Carbon (each get-var's fallback), which is what
 * the `proposals` control shows when it is off.
 *
 * @param {Theme} theme The Storybook theme.
 * @param {string} scope The class the values are scoped to.
 * @returns {string} A CSS rule with one custom property per proposed token.
 */
function proposedValues(theme: Theme, scope: string): string {
  const declarations = Object.entries(proposals['file-chip']).map(
    ([role, token]) => {
      const themes = (
        token as { $extensions: { 'carbon.themes': Record<Theme, string> } }
      ).$extensions['carbon.themes'];
      // A DTCG alias, `{layer-02}`, is Carbon's own token: read it as one.
      const value = themes[proposalTheme[theme] ?? 'white'].replace(
        /^\{(.+)\}$/,
        'var(--cds-$1)'
      );
      return `--cds-file-chip-${role}: ${value};`;
    }
  );
  return `.${scope} { ${declarations.join(' ')} }`;
}

const withProposals: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'white') as Theme;
  const on = context.args.proposals !== false;
  const scope = 'file-chip-story-proposals';
  return (
    // Every story sits on the chat input's surface, which is what the chip is
    // judged against.
    <div
      className={
        on ? `file-chip-story__surface ${scope}` : 'file-chip-story__surface'
      }>
      {on && <style>{proposedValues(theme, scope)}</style>}
      <Story />
    </div>
  );
};

type StoryArgs = FileChipProps & { proposals?: boolean };

const meta: Meta<StoryArgs> = {
  title: 'V12/FileChip',
  tags: ['squad', 'incubating'],
  component: FileChip,
  decorators: [withProposals],
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    proposals: true,
  },
  argTypes: {
    proposals: {
      control: 'boolean',
      description:
        'Story only: set the proposed tokens (proposals/tokens.json). Off shows FileChip on stock Carbon.',
      table: { category: 'Story' },
    },
    kind: { control: 'radio', options: fileChipKinds },
    status: { control: 'radio', options: fileChipStatuses },
    name: { control: 'text' },
    errorMessage: { control: 'text' },
    description: { control: 'text' },
    showName: { control: 'boolean' },
    successDelay: { control: 'number' },
    thumbnailSrc: { control: false },
    renderIcon: { control: false },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

/**
 * One chip, every prop on a control.
 */
export const Default: Story = {
  // `proposals` is the decorator's, not the chip's.
  render: ({ proposals: _proposals, ...args }) => <FileChip {...args} />,
  args: {
    kind: 'file',
    status: 'idle',
    name: 'Quarterly-business-review-final-2026.pdf',
    errorMessage: 'File is larger than 20 MB',
    showName: false,
    thumbnailSrc: thumbnail,
  },
};

const names: Record<FileChipKind, string> = {
  file: 'Filename.docx',
  image: 'Filename.jpg',
  video: 'Filename.mp4',
};

/**
 * Every kind in every status, as the Figma set lays them out. `complete` holds
 * its check here so it can be compared; in use it fades back to idle.
 */
export const Matrix: Story = {
  render: () => (
    <div className="file-chip-story__matrix">
      {fileChipKinds.map((kind) =>
        fileChipStatuses.map((status) => (
          <FileChip
            key={`${kind}-${status}`}
            kind={kind}
            status={status}
            name={names[kind]}
            errorMessage="Upload failed"
            thumbnailSrc={thumbnail}
            successDelay={Infinity}
          />
        ))
      )}
    </div>
  ),
};

interface Attachment {
  id: number;
  name: string;
  mimeType: string;
  status: FileChipStatus;
  errorMessage?: string;
}

const seed: Attachment[] = [
  {
    id: 1,
    name: 'Filename.docx',
    mimeType: 'application/msword',
    status: 'idle',
  },
  {
    id: 2,
    name: 'Filename.pdf',
    mimeType: 'application/pdf',
    status: 'uploading',
  },
  {
    id: 3,
    name: 'Filename.pdf',
    mimeType: 'application/pdf',
    status: 'error',
    errorMessage: 'File is larger than 20 MB',
  },
  {
    id: 4,
    name: 'Quarterly-business-review-final-2026.pdf',
    mimeType: 'application/pdf',
    status: 'idle',
  },
  { id: 5, name: 'Filename.jpg', mimeType: 'image/jpeg', status: 'idle' },
  { id: 6, name: 'Clip.mp4', mimeType: 'video/mp4', status: 'uploading' },
];

function InputBarDemo() {
  const [attachments, setAttachments] = useState(seed);
  const [round, setRound] = useState(0);

  // Each round, the uploads finish after a moment.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAttachments((current) =>
        current.map((item) =>
          item.status === 'uploading' ? { ...item, status: 'complete' } : item
        )
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, [round]);

  return (
    <div className="file-chip-story__bar">
      <div className="file-chip-story__row">
        {attachments.map((item) => (
          <FileChip
            key={item.id}
            name={item.name}
            mimeType={item.mimeType}
            status={item.status}
            errorMessage={item.errorMessage}
            thumbnailSrc={thumbnail}
            onSuccessEnd={() =>
              setAttachments((current) =>
                current.map((other) =>
                  other.id === item.id ? { ...other, status: 'idle' } : other
                )
              )
            }
            onRemove={() =>
              setAttachments((current) =>
                current.filter((other) => other.id !== item.id)
              )
            }
          />
        ))}
      </div>
      <Button
        kind="ghost"
        size="sm"
        onClick={() => {
          setAttachments(seed);
          setRound((value) => value + 1);
        }}>
        Reset
      </Button>
    </div>
  );
}

/**
 * A row of chips as the chat input bar will hold them. Uploads finish after a
 * moment, the check fades, and Remove takes a chip out after its exit. Moving
 * focus after a removal is the input bar's job, not the chip's.
 */
export const InTheInputBar: Story = {
  render: () => <InputBarDemo />,
};
