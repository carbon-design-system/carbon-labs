/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  PauseOutline,
  PauseOutlineFilled,
  PlayOutline,
  PlayOutlineFilled,
} from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { Children, ReactNode, useState } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

type Color = 'light' | 'dark';

interface GifPlayerProps {
  children: ReactNode;
  className?: string | null;
  color?: Color | null;
  isInDialog?: boolean | null;
}

const Pause = ({ hovering }: { hovering: boolean }) =>
  hovering ? <PauseOutlineFilled size={24} /> : <PauseOutline size={24} />;

const Play = ({ hovering }: { hovering: boolean }) =>
  hovering ? <PlayOutlineFilled size={24} /> : <PlayOutline size={24} />;

const ToggleIcon = ({
  paused,
  hovering,
}: {
  hovering: boolean;
  paused: boolean;
}) => (paused ? <Play hovering={hovering} /> : <Pause hovering={hovering} />);
/**
 * The `<GifPlayer>` component is used to pause and play images that are gif’s.
 * It works by replacing the gif with a static image on pause.
 */
export const GifPlayer: MdxComponent<GifPlayerProps> = ({
  children,
  color,
  className,
  isInDialog,
}) => {
  const [paused, setPaused] = useState(false);

  const [hovering, setHovering] = useState(false);
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPaused(!paused);
  };

  const controlsClassNames = clsx(withPrefix('controls'), {
    [withPrefix('dark')]: color === 'dark',
  });

  const containerClassNames = clsx(
    className,
    withPrefix('gif-player-container'),
    {
      [withPrefix('gif-in-dialog')]: isInDialog,
    }
  );

  const staticImageClassNames = clsx(withPrefix('img-hidden'), {
    [withPrefix('img-displayed')]: paused,
  });

  const gifClassNames = clsx(withPrefix('gif-displayed'), {
    [withPrefix('gif-hidden')]: paused,
  });

  const childrenArray = Children.toArray(children);

  const labelText = paused
    ? 'Toggleable animation paused'
    : 'Toggleable animation playing';

  return (
    <div className={containerClassNames}>
      <div className={gifClassNames} aria-hidden={paused ? 'true' : false}>
        {childrenArray[0]}
      </div>
      <div
        className={staticImageClassNames}
        aria-hidden={paused ? false : 'true'}>
        {childrenArray[1]}
      </div>
      <button
        aria-pressed={paused ? 'true' : 'false'}
        type="button"
        aria-label={labelText}
        className={controlsClassNames}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={onClick}
        onKeyDown={(e) => {
          // Stop keyDown event from propagating to ImageGalleryImage component.
          e.stopPropagation();
        }}>
        <ToggleIcon hovering={hovering} paused={paused} />
      </button>
    </div>
  );
};

GifPlayer.propTypes = {
  /**
   * Only pass in the 2 images to be rendered, first must be gif, second must be static image
   */
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.arrayOf(PropTypes.element.isRequired),
  ]).isRequired,
  /**
   * Specify optional className
   */
  className: PropTypes.string,
  /**
   * Specify if icon color should be "dark" or "light"
   */
  color: PropTypes.oneOf<Color>(['light', 'dark']),
  /**
   * Specify if the gifPlayer is inside the expanded ImageGallery
   */
  isInDialog: PropTypes.bool,
};

GifPlayer.defaultProps = {
  color: 'light',
  isInDialog: false,
};
