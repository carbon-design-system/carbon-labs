/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

/** Primary UI component for user interaction */

interface TextHighlighterProps {
  children?: React.ReactNode;
  kind: string;
  type?: string;
  reference?: string;
}

export const TextHighlighter = ({
  children,
  kind = 'mark',
  type = 'default',
  reference,
  ...rest
}: TextHighlighterProps) => {
  const prefix = usePrefix();
  let containerClass = '';
  let BaseTag: React.ElementType = 'mark';
  switch (kind) {
    case 'ins':
      containerClass = `${prefix}--text-highlighter__container ${prefix}--text-highlighter__container__ins`;
      BaseTag = 'ins';
      break;
    case 'del':
      containerClass = `${prefix}--text-highlighter__container ${prefix}--text-highlighter__container__del`;
      BaseTag = 'del';
      break;
    default:
      containerClass = `${prefix}--text-highlighter__container ${prefix}--text-highlighter-${type}`;
  }

  return (
    <div className={containerClass}>
      <BaseTag>{children}</BaseTag>
      {kind === 'mark' && reference && <sup>{reference}</sup>}
    </div>
  );
};
