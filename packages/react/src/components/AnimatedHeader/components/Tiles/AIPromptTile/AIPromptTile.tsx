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

/** Primary UI component for user interaction */

interface AIPromptTileProps {
  href?: string | null;
  id?: string;
  mainIcon?: ElementType | null;
  open?: boolean;
  productName?: string;
  title?: string | null;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledTaskLabel?: string;
  onClick?: (() => void) | null;
  ariaLabel?: string;
}

export const AIPromptTile: React.FC<AIPromptTileProps> = ({
  href,
  id,
  mainIcon: MainIcon,
  open,
  productName,
  title,
  isLoading,
  isDisabled,
  disabledTaskLabel,
  onClick,
  ariaLabel,
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
      key={id}>
      {isLoading ? (
        <SkeletonPlaceholder className={`${blockClass}--loading-skeleton`} />
      ) : (
        <div className={`${blockClass}--body${!open ? ` ${collapsed}` : ''}`}>
          <div className={`${blockClass}--body-background`} />
          <div className={`${blockClass}--body-gradient`} />
          <div className={`${blockClass}--icons`}>
            {MainIcon && (
              <MainIcon fill={`var(--cds-icon-secondary)`} size={24} />
            )}
            <AILabel autoAlign aiText="AI" size="mini" />
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
              placeholder="Start chatting..."
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
