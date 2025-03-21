/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React, { useEffect, createRef, useState } from 'react';
import {
  Grid,
  Column,
  Button,
  Dropdown,
  IconButton,
  Tooltip,
  ButtonKind,
  ButtonKinds,
} from '@carbon/react';
import {
  ChevronUp,
  ChevronDown,
  PlayFilledAlt,
  PauseFilled,
} from '@carbon/icons-react';
import lottie from 'lottie-web';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

import { BaseTile } from '../Tiles/index';

/** Animated Header */

export interface SelectedWorkspace {
  id: string;
  text: string;
}

export interface Tile {
  href: string | null;
  id: string;
  mainIcon: string | null;
  secondaryIcon?: string | null;
  subtitle?: string | null;
  title: string | null;
}

export interface TileGroup {
  id: number;
  name: string;
  tiles: Tile[];
}

export interface AnimatedHeaderProps {
  allTiles: TileGroup[];
  allWorkspaces?: SelectedWorkspace[];
  buttonIcon?: any;
  buttonText?: string;
  buttonType?: ButtonKind;
  description?: string;
  headerAnimation?: object;
  headerDropdown?: boolean;
  headerStatic?: React.JSX.Element;
  productName?: string;
  selectedTileGroup: TileGroup[] | any;
  selectedWorkspace?: SelectedWorkspace[] | any;
  setSelectedTileGroup: (e) => void;
  setSelectedWorkspace: (e) => void;
  userName?: string;
  welcomeText?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  allTiles,
  allWorkspaces,
  buttonIcon = null,
  buttonText,
  buttonType = 'tertiary',
  description,
  headerAnimation,
  headerDropdown = false,
  headerStatic,
  productName = '[Product name]',
  selectedTileGroup,
  selectedWorkspace,
  setSelectedTileGroup,
  setSelectedWorkspace,
  userName,
  welcomeText,
}: AnimatedHeaderProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  const animationContainer = createRef<HTMLDivElement>();
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [headingTextAnimation, setHeadingTextAnimation] = useState('');
  const isReduced = window.matchMedia('(prefers-reduced-motion)').matches;

  const collapsed = `${blockClass}--collapsed`;
  const contentCollapsed = `${blockClass}__content--collapsed`;
  const descriptionCollapsed = `${blockClass}__left-area-container--collapsed`;
  const headingCollapsed = `${blockClass}__heading--collapsed`;
  const headingExpanded = `${blockClass}__heading--expanded`;
  const lottieCollapsed = `${blockClass}__lottie-animation--collapsed`;

  const handleButtonCollapseClick = () => {
    setOpen(!open);

    open
      ? setHeadingTextAnimation(headingCollapsed)
      : setHeadingTextAnimation(headingExpanded);
  };

  const handleLottieAnimationClick = () => {
    if (playing) {
      lottie.pause();
    } else {
      lottie.play();
    }

    setPlaying(!playing);
  };

  useEffect(() => {
    let animation = lottie.loadAnimation({
      container: animationContainer.current as HTMLDivElement,
      animationData: headerAnimation,
      renderer: 'svg',
      loop: false,
      autoplay: false,
    });

    const lottieLoadSpeed = 1;
    const lottieLoopSpeed = 1;
    const animationData = animation['animationData'];

    function reducedMotion() {
      animation.goToAndStop(5000);
    }

    function load() {
      animation.setSpeed(lottieLoadSpeed);
      animation.playSegments(
        [animationData.markers.at(0).tm, animationData.markers.at(1).tm],
        true
      );
    }

    function loop() {
      animation.setSpeed(lottieLoopSpeed);
      animation.playSegments(
        [animationData.markers.at(1).tm, animationData.op],
        true
      );
    }

    if (isReduced) {
      // reduced motion on
      animation.addEventListener('DOMLoaded', reducedMotion);
    } else {
      // reduced motion off

      // Run Start Animation
      animation.addEventListener('DOMLoaded', load);

      // Run Looped Animation
      animation.addEventListener('complete', loop);
    }
  }, [animationContainer, headerAnimation, isReduced]);

  return (
    <section className={`${blockClass} ${!open && collapsed}`}>
      <Grid>
        <div className={`${blockClass}__gradient--overlay`} />

        <div className={`${blockClass}__container--gradient`} />

        {!headerAnimation && headerStatic && (
          <div className={`${blockClass}__static--container`}>
            <div
              className={`${blockClass}__static`}
              style={{ backgroundImage: `url(${headerStatic})` }}
            />
          </div>
        )}

        <div className={`${blockClass}__lottie-animation--container`}>
          <div
            ref={animationContainer}
            className={`${blockClass}__lottie-animation ${
              !open && lottieCollapsed
            }`}></div>
        </div>

        <Column sm={4} md={8} lg={16}>
          <Tooltip align="bottom" label={`${welcomeText}, ${userName}`}>
            <h1 className={`${blockClass}__heading ${headingTextAnimation}`}>
              <span className={`${blockClass}__heading-welcome`}>
                {welcomeText},{' '}
              </span>
              <span className={`${blockClass}__heading-name`}>{userName}</span>
            </h1>
          </Tooltip>
        </Column>

        {(description || buttonText || headerDropdown) && (
          <Column
            sm={4}
            md={8}
            lg={4}
            className={`${blockClass}__left-area-container ${
              !open && descriptionCollapsed
            }`}>
            {description && (
              <Tooltip align="bottom" label={description}>
                <h2 className={`${blockClass}__description`}>{description}</h2>
              </Tooltip>
            )}

            {buttonText && (
              <Button
                className={`${blockClass}__button`}
                kind={buttonType}
                renderIcon={buttonIcon}>
                {buttonText}
              </Button>
            )}

            {!buttonText && headerDropdown && allTiles && (
              <div className={`${blockClass}__header-dropdown--container`}>
                <Dropdown
                  id={`${blockClass}__header-dropdown`}
                  className={`${blockClass}__header-dropdown`}
                  size="md"
                  titleText="Label"
                  initialSelectedItem={allTiles[0]}
                  label={allTiles[0].name || 'Select an option below'}
                  hideLabel
                  type="inline"
                  items={allTiles}
                  itemToString={(item) => (item ? item.name : '')}
                  onChange={(e) => setSelectedTileGroup(e)}
                />
              </div>
            )}
          </Column>
        )}

        {selectedTileGroup && (
          <Column sm={4} md={8} lg={12} className={`${blockClass}__content`}>
            {allWorkspaces && (
              <div
                className={`${blockClass}__workspace--container ${
                  !open && contentCollapsed
                }`}>
                <Dropdown
                  id={`${blockClass}__workspace`}
                  className={`${blockClass}__workspace`}
                  size="sm"
                  titleText="Label"
                  label={
                    `Open in: ${userName}'s workspace` || 'Select a workspace'
                  }
                  hideLabel
                  type="inline"
                  items={allWorkspaces}
                  itemToString={(item) => (item ? item['text'] : '')}
                  onChange={(e) => setSelectedWorkspace(e)}
                />
              </div>
            )}
            <div className={`${blockClass}__tiles-container`}>
              {selectedTileGroup.tiles.map((tile) => {
                return (
                  <BaseTile
                    key={tile.id}
                    id={tile.id}
                    open={open}
                    href={tile.href}
                    mainIcon={tile.mainIcon}
                    secondaryIcon={tile.secondaryIcon}
                    title={tile.title}
                    subtitle={tile.subtitle}
                    productName={productName}></BaseTile>
                );
              })}
            </div>
          </Column>
        )}

        <div className={`${blockClass}__button-collapse--gradient`} />

        <div className={`${blockClass}__button-collapse--container`}>
          {headerAnimation && !isReduced && (
            <IconButton
              className={`${blockClass}__icon-button`}
              label={playing ? 'Pause' : 'Play'}
              kind="ghost"
              type="button"
              onClick={handleLottieAnimationClick}>
              {playing ? (
                <PauseFilled size={16} fill={`var(--cds-icon-secondary)`} />
              ) : (
                <PlayFilledAlt size={16} fill={`var(--cds-icon-secondary)`} />
              )}
            </IconButton>
          )}
          <Button
            id={`${blockClass}__button-collapse`}
            kind="ghost"
            renderIcon={open ? ChevronUp : ChevronDown}
            onClick={handleButtonCollapseClick}>
            {open ? `Collapse` : `Expand`}
          </Button>
        </div>
      </Grid>
    </section>
  );
};

(AnimatedHeader as React.FC).displayName = 'Animated Header';
(AnimatedHeader as React.FC).propTypes = {
  /**
   * Array of each tile group setup
   */
  allTiles: PropTypes.arrayOf(PropTypes.object),

  /**
   * Array of all workspace options
   */
  allWorkspaces: PropTypes.arrayOf(PropTypes.object),

  /**
   * (optional), Provide the renderIcon used in the button
   * ex. Launch, Add, ect.
   */
  buttonIcon: PropTypes.any,

  /**
   * (optional), Provide content that needs highest attention from
   * the user or content that triggers an action and allow users to
   * directly start working and gain value (within one click)
   */
  buttonText: PropTypes.string,

  /**
   * Specify the carbon button type
   */
  buttonType: ButtonKinds,

  /**
   * Specify an optional className to be added to your Animated Header
   */
  className: PropTypes.string,

  /**
   * Provide short sentence in max. 3 lines related to product context
   */
  description: PropTypes.string,

  /**
   * In-product imagery / lottie animation (.json) dim. 1312 x 738
   * (to update headerAnimation content storybook requires remount in toolbar)
   */
  headerAnimation: PropTypes.object,

  /**
   * Header dropdown menu when button/buttonText is not in use
   */
  headerDropdown: PropTypes.bool,

  /**
   * In-product imagery / static imagery dim. 1312 x 738
   * Only active when headerAnimation is not in use
   */
  headerStatic: PropTypes.object,

  /**
   * Specify the current username of active user
   */
  name: PropTypes.string,

  /**
   * Provide current product name
   */
  productName: PropTypes.string,

  /**
   * The tile group that is active in the header
   * ex. "AI Chat Tile w/ two glass tiles", "Four glass tiles", ect.
   */
  selectedTileGroup: PropTypes.object,

  /**
   * Object containing workspace selection
   * `Open in: "_"`
   */
  selectedWorkspace: PropTypes.object,

  /**
   * Provide function to be called when switching selected tile group
   */
  setSelectedTileGroup: PropTypes.func,

  /**
   * Provide function to be called when switching workspace selection
   */
  setSelectedWorkspace: PropTypes.func,
};

export default AnimatedHeader;
