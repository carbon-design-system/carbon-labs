/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Column, Grid } from '@carbon/react';
import { Pause, Play } from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface VideoProps {
  autoPlay?: boolean | null;
  children?: ReactNode | null;
  muted?: boolean | null;
  poster?: string | { src: string } | null;
  src?: string | null;
  title?: string | null;
  vimeoId?: string | null;
}

interface VideoWithSrcProps extends VideoProps {
  src: string;
}

interface VideoWithVimeoIdProps extends VideoProps {
  vimeoId: string;
}

/**
 * The `<Video>` component can render a Vimeo player or a html video player.
 */
export const Video: MdxComponent<VideoWithSrcProps | VideoWithVimeoIdProps> = ({
  autoPlay,
  children,
  vimeoId,
  title,
  src,
  poster,
  muted,
  ...rest
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const buttonClassName = clsx(withPrefix('video-button'), {
    [withPrefix('video--is-playing')]: isPlaying,
  });

  // React doesn't handle the muted attribute well
  // https://github.com/facebook/react/issues/10389#issuecomment-605689475
  useEffect(() => {
    if (muted && videoRef.current) {
      videoRef.current.setAttribute('muted', '');
    }
  }, [muted]);

  if (vimeoId) {
    return (
      <Grid>
        <Column sm={4} md={8} lg={12}>
          <div className={withPrefix('video-container')}>
            <div className={clsx(withPrefix('video'), withPrefix('vimeo'))}>
              <div className="embedVideo-container">
                <iframe
                  allow="autoplay"
                  title={title || undefined}
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  ref={iframeRef}
                  width="640"
                  height="360"
                  frameBorder="0"
                  allowFullScreen
                  sandbox="allow-forms allow-scripts  allow-same-origin"
                />
              </div>
            </div>
          </div>
        </Column>
      </Grid>
    );
  }

  function onClick(event: MouseEvent) {
    event.stopPropagation();
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
      return undefined;
    }

    return videoRef.current
      ?.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function onEnded() {
    setIsPlaying(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
        return undefined;
      }
      return videoRef.current
        ?.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return undefined;
  }

  if (src) {
    return (
      <Grid>
        <Column sm={4} md={8} lg={12}>
          <div className={withPrefix('video-container')}>
            <div
              className={buttonClassName}
              role="button"
              onClick={onClick}
              onKeyDown={onKeyDown}
              tabIndex={0}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              <span className="cds--assistive-text">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </div>
            <video
              muted // TODO: Do we want to allow a captions <track> to be provided? This is the only
              // way to avoid having to mark the video as muted for a11y compliance.
              autoPlay={!!autoPlay}
              className={withPrefix('video')}
              ref={videoRef}
              onEnded={onEnded}
              poster={typeof poster === 'object' ? poster?.src : poster}
              {...rest}>
              <source src={src} type="video/mp4" />
              {children}
            </video>
          </div>
        </Column>
      </Grid>
    );
  }

  return null;
};

Video.propTypes = {
  /**
   * Set video autoplay.
   */
  autoPlay: PropTypes.bool,
  /**
   * Provide optional caption track.
   * `<track kind="captions" default src="/videos/hero-video.vtt" srcLang="en" />`
   */
  children: PropTypes.element,
  /**
   * Mute video by default.
   */
  muted: PropTypes.bool,
  /**
   * Set poster image for local video.
   */
  poster: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.shape({ src: PropTypes.string.isRequired }),
  ]),
  /**
   * set video source for local video.
   */
  src: (props) => {
    const typedProps = props as VideoProps;

    if (!typedProps.src && !typedProps.vimeoId) {
      return new Error(
        "The Video component requires either a 'vimeoId' Or a 'src' prop"
      );
    }

    if (typedProps.src && typedProps.vimeoId) {
      return new Error(
        "You can only specify one source for the Video component. Use either the 'vimeoId' OR the 'src' prop."
      );
    }

    return null;
  },
  /**
   * Set video title.
   */
  title: PropTypes.string,
  /**
   * Set Vimeo ID for Vimeo video.
   */
  vimeoId: (props) => {
    const typedProps = props as VideoProps;

    if (!typedProps.src && !typedProps.vimeoId) {
      return new Error(
        "The Video component requires either a 'vimeoId' Or a 'src' prop"
      );
    }

    if (typedProps.src && typedProps.vimeoId) {
      return new Error(
        "You can only specify one source for the Video component. Use either the 'vimeoId' OR the 'src' prop."
      );
    }

    return null;
  },
};

Video.defaultProps = {
  autoPlay: false,
};
