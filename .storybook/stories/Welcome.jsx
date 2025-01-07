import { Meta, Unstyled } from '@storybook/blocks';
import React from 'react';
import './welcome.scss';

// export const RightArrow = () => (
//   <svg
//     viewBox="0 0 14 14"
//     width="8px"
//     height="14px"
//     style={{
//       marginLeft: '4px',
//       display: 'inline-block',
//       shapeRendering: 'inherit',
//       verticalAlign: 'middle',
//       fill: 'currentColor',
//       'path fill': 'currentColor',
//     }}>
//     <path d="m11.1 7.35-5.5 5.5a.5.5 0 0 1-.7-.7L10.04 7 4.9 1.85a.5.5 0 1 1 .7-.7l5.5 5.5c.2.2.2.5 0 .7Z" />
//   </svg>
// );

export const Welcome = () => {
  return (
    <div className="welcome__container">
      <h2 className="welcome__heading">@carbon/labs</h2>
    </div>
  );
};
