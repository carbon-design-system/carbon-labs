/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
// Tooltip removed: it called useId() which generated dynamic aria-labelledby
// IDs that differed between server and client, causing hydration mismatches.
// The aria-label on <h1> already provides the same accessible text.
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { AriaLabels } from '../AnimatedHeader/types';

const NAME_FIRST_LANGS = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Farsi/Persian
  'ur', // Urdu
  'ja', // Japanese
  'zh', // Chinese
];

export type HeaderTitleProps = {
  userName?: string;
  welcomeText?: string;
  headerExpanded?: boolean;
  ariaLabels?: AriaLabels;
};

const HeaderTitle: React.FC<HeaderTitleProps> = ({
  userName,
  welcomeText,
  headerExpanded,
  ariaLabels,
}: HeaderTitleProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__title`;

  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    setCurrentLang(
      (typeof document !== 'undefined' && document.documentElement.lang) || 'en'
    );
  }, []);

  const isNameFirst = NAME_FIRST_LANGS.includes(currentLang.slice(0, 2));

  return (
    <h1
      className={blockClass}
      data-expanded={headerExpanded}
      aria-label={ariaLabels?.welcome ?? `${welcomeText}, ${userName}`}
      title={`${welcomeText}, ${userName}`}>
      {isNameFirst ? (
        <>
          <span className={`${blockClass}-first`}>{userName}, </span>
          <span className={`${blockClass}-second`}>{welcomeText}</span>
        </>
      ) : (
        <>
          <span className={`${blockClass}-first`}>{welcomeText}, </span>
          <span className={`${blockClass}-second`}>{userName}</span>
        </>
      )}
    </h1>
  );
};

export default HeaderTitle;
