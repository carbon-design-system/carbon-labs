/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

export interface AnimatedBackgroundProps {
  headerAnimation?: object;
  isOpen: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  headerAnimation,
  isOpen,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__lottie-animation`;

  const animationContainer = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const isReduced = window.matchMedia('(prefers-reduced-motion)').matches;

  useEffect(() => {
    // Make sure any prior instance is destroyed before creating a new one
    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
    }
    if (!animationContainer.current || !headerAnimation) {
      return;
    }

    const animation = lottie.loadAnimation({
      container: animationContainer.current as HTMLDivElement,
      animationData: headerAnimation as any,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    });
    animRef.current = animation;
    animation.setSpeed(1);

    const onDomLoaded = () => {
      const totalFrames = animation.getDuration(true);

      if (isReduced) {
        animation.goToAndStop(totalFrames, true);
      } else {
        animation.play();
      }
    };

    animation.addEventListener('DOMLoaded', onDomLoaded);

    return () => {
      animation.removeEventListener('DOMLoaded', onDomLoaded);
      animation.destroy();
      animRef.current = null;
    };
    // Re-init when the JSON or reduced-motion preference changes
  }, [headerAnimation, isReduced]);

  return (
    <div className={`${blockClass}--container`}>
      <div
        ref={animationContainer}
        className={`${blockClass}`}
        data-expanded={isOpen}
        aria-hidden="true"></div>
    </div>
  );
};

export default AnimatedBackground;
