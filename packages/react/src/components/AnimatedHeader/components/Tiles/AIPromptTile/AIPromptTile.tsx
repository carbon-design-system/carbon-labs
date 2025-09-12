/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ElementType, useState } from 'react';
import {
  AILabel,
  Button,
  IconButton,
  SkeletonPlaceholder,
  TextInput,
} from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { Send } from '@carbon/react/icons';

export type AIPromptTileProps = {
  tileId: string | null;
  href?: string | null;
  title?: string | null;
  disabledTaskLabel?: string | null;
  productName?: string;
  promptPlaceholder?: string;
  primaryIcon?: ElementType | null;
  onClick?: (() => void) | null;
  ariaLabel?: string;
  open?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
} & Record<string, unknown>;

export const AIPromptTile: React.FC<AIPromptTileProps> = ({
  tileId,
  href,
  title,
  disabledTaskLabel,
  productName,
  promptPlaceholder = 'Start chatting...',
  primaryIcon: PrimaryIcon,
  onClick,
  ariaLabel,
  open,
  isLoading,
  isDisabled,
}: AIPromptTileProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__ai-prompt-tile`;
  const collapsed = `${blockClass}--collapsed`;
  const disabled = `${blockClass}--disabled`;

  const [textInput, setTextInput] = useState('');

  const handleTextInput = (e) => {
    setTextInput(e.target.value);
  };

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  const handleTextInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      openInNewTab(`${href}&primed_chat=${textInput}`);
    }
  };

  return (
    <div
      id={`${blockClass}`}
      className={`${prefix}--animated-header__tile ${blockClass}${
        isDisabled ? ' ' + disabled : ''
      }`}
      aria-label={ariaLabel ?? title ?? 'AI Tile'}
      role="listitem"
      title={isDisabled ? disabledTaskLabel ?? '' : ''}
      key={tileId}>
      {isLoading ? (
        <SkeletonPlaceholder className={`${blockClass}--loading-skeleton`} />
      ) : (
        <div className={`${blockClass}--body${!open ? ` ${collapsed}` : ''}`}>
          <div className={`${blockClass}--body-background`} />
          <div className={`${blockClass}--body-gradient`} />
          <div className={`${blockClass}--icons`}>
            {PrimaryIcon && (
              <PrimaryIcon fill={`var(--cds-icon-secondary)`} size={24} />
            )}
            <AILabel autoAlign aiText="AI" size="xs" />
          </div>
          <div className={`${blockClass}--title`}>{title}</div>

          <div
            className={`${blockClass}--text-input-container ${
              textInput && `${blockClass}--text-input-container__active`
            }`}>
            <TextInput
              id={`${blockClass}--text-input`}
              className={`${blockClass}--text-input`}
              type="text"
              labelText="AI Chat Input"
              hideLabel
              placeholder={promptPlaceholder}
              size="sm"
              onChange={handleTextInput}
              onKeyDown={handleTextInputKeyDown}
              value={textInput}
            />

            <IconButton
              className={`${blockClass}--icon-button ${
                textInput && `${blockClass}--icon-button__active`
              }`}
              label={`Chat in ${productName}`}
              kind="ghost"
              size="sm"
              disabled={!textInput}
              align="top-end"
              onClick={() => {
                onClick?.();
                openInNewTab(`${href}&primed_chat=${textInput}`);
              }}
              onKeyDown={handleTextInputKeyDown}>
              <Send />
            </IconButton>
          </div>

          {/* Prompt Lab - >  https://dataplatform.cloud.ibm.com/wx/prompts?project_id=437e0304-9168-43b9-93ef-88a8dc5e649c&context=wx&primed_chat=drew */}

          <div className={`${blockClass}--footer`}>
            <Button kind="ghost" size="sm" href={href ?? undefined}>
              Open {productName}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
