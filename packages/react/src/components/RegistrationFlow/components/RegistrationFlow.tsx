/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { useTheme } from '@carbon/react';
import lightBg from './media/lightBackground.svg';
import darkBg from './media/darkBackground.svg';
/** Primary UI component for user interaction */

interface RegistrationFlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  backgroundImage?: string;
}

export const RegistrationFlow = ({
  children,
  backgroundImage,
  ...rest
}: RegistrationFlowProps) => {
  const prefix = usePrefix();
  const [bgImg, setBgImg] = useState('');
  const { theme } = useTheme();
  useEffect(() => {
    const themeType: 'dark' | 'light' =
      theme === 'g100' || theme === 'g90' ? 'dark' : 'light';
    if (!backgroundImage) {
      setBgImg(themeType === 'dark' ? darkBg : lightBg);
    } else {
      setBgImg(backgroundImage);
    }
  }, [theme]);

  return (
    <div
      className={`${prefix}--registration-flow__container`}
      style={bgImg ? { backgroundImage: `url(${bgImg})` } : undefined}
      {...rest}>
      {children}
    </div>
  );
};
