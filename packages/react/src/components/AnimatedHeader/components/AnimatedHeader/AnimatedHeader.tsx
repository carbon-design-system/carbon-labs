/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Grid,
  Column,
  Button,
  Dropdown,
  Tooltip,
  ButtonKind,
} from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/icons-react';
import lottie from 'lottie-web';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

import { BaseTile } from '../Tiles/index';

/** Animated Header */

export interface TasksConfig {
  type: 'button' | 'dropdown' | string;
  button?: {
    href?: string;
    icon?: any;
    text?: string;
    type?: ButtonKind;
  };
  dropdown?: {
    label?: string;
  };
}

export interface SelectedWorkspace {
  id: string;
  label: string;
}

export interface Tile {
  href?: string | null;
  id: string;
  mainIcon?: string | null;
  secondaryIcon?: string | null;
  subtitle?: string | null;
  title?: string | null;
  customContent?: ReactNode | null;
}

export interface TileGroup {
  id: number;
  label: string;
  tiles: Tile[];
}

export interface AnimatedHeaderProps {
  allTiles: TileGroup[];
  allWorkspaces?: SelectedWorkspace[];
  description?: string;
  handleHeaderItemsToString?: (item: TileGroup | null) => string;
  renderHeaderSelectedItem?: (item: TileGroup | null) => ReactNode;
  handleWorkspaceItemsToString?: (item: SelectedWorkspace | null) => string;
  renderWorkspaceSelectedItem?: (item: SelectedWorkspace | null) => ReactNode;
  headerAnimation?: object;
  headerStatic?: React.JSX.Element;
  productName?: string;
  selectedTileGroup: TileGroup[] | any;
  selectedWorkspace?: SelectedWorkspace | any;
  setSelectedTileGroup: (e) => void;
  setSelectedWorkspace: (e) => void;
  tasksConfig?: TasksConfig;
  userName?: string;
  welcomeText?: string;
  workspaceLabel?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  allTiles,
  allWorkspaces,
  description,
  handleHeaderItemsToString,
  handleWorkspaceItemsToString,
  headerAnimation,
  headerStatic,
  productName = '[Product name]',
  renderHeaderSelectedItem,
  renderWorkspaceSelectedItem,
  selectedTileGroup,
  selectedWorkspace,
  setSelectedTileGroup,
  setSelectedWorkspace,
  tasksConfig,
  userName,
  welcomeText,
  workspaceLabel = `Open in: ${userName}'s workspace` || `Select a workspace`,
}: AnimatedHeaderProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  const animationContainer = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
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

  useEffect(() => {
    if (!animationContainer.current) {
      return;
    }

    const animation = lottie.loadAnimation({
      container: animationContainer.current as HTMLDivElement,
      animationData: headerAnimation,
      renderer: 'svg',
      loop: false,
      autoplay: false,
    });

    const lottieLoadSpeed = 1;
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

    if (isReduced) {
      // reduced motion on
      animation.addEventListener('DOMLoaded', reducedMotion);
    } else {
      // reduced motion off

      // Run Start Animation
      animation.addEventListener('DOMLoaded', load);
    }
    return () => {
      animation?.removeEventListener('DOMLoaded', reducedMotion);
      animation?.removeEventListener('DOMLoaded', load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReduced]);

  return (
    <section className={`${blockClass}${!open ? ` ${collapsed}` : ''}`}>
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
            className={`${blockClass}__lottie-animation${
              !open ? ` ${lottieCollapsed}` : ''
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

        {(description ||
          (tasksConfig &&
            tasksConfig.type === 'button' &&
            tasksConfig.button?.text) ||
          (tasksConfig &&
            tasksConfig.type === 'dropdown' &&
            tasksConfig.dropdown?.label)) && (
          <Column
            sm={4}
            md={8}
            lg={4}
            className={`${blockClass}__left-area-container${
              !open ? ` ${descriptionCollapsed}` : ''
            }`}>
            {description && (
              <h2 className={`${blockClass}__description`}>{description}</h2>
            )}

            {tasksConfig?.button?.text && (
              <Button
                className={`${blockClass}__button`}
                kind={tasksConfig.button.type}
                renderIcon={tasksConfig.button.icon}
                href={tasksConfig.button.href}>
                {tasksConfig.button.text}
              </Button>
            )}

            {!tasksConfig?.button?.text &&
              tasksConfig &&
              tasksConfig.type === 'dropdown' &&
              allTiles && (
                <div className={`${blockClass}__header-dropdown--container`}>
                  <Dropdown
                    id={`${blockClass}__header-dropdown`}
                    className={`${blockClass}__header-dropdown`}
                    size="md"
                    titleText="Label"
                    label={tasksConfig.dropdown?.label || allTiles[0].label}
                    hideLabel
                    type="inline"
                    items={allTiles}
                    onChange={(e) => setSelectedTileGroup(e)}
                    {...(handleHeaderItemsToString
                      ? { itemToString: handleHeaderItemsToString }
                      : {})}
                    {...(renderHeaderSelectedItem
                      ? { renderSelectedItem: renderHeaderSelectedItem }
                      : {})}
                  />
                </div>
              )}
          </Column>
        )}

        {selectedTileGroup && (
          <Column sm={4} md={8} lg={12} className={`${blockClass}__content`}>
            {allWorkspaces && (
              <div
                className={`${blockClass}__workspace--container${
                  !open ? ` ${contentCollapsed}` : ''
                }`}>
                <Dropdown
                  id={`${blockClass}__workspace`}
                  className={`${blockClass}__workspace`}
                  size="sm"
                  titleText="Label"
                  label={workspaceLabel}
                  hideLabel
                  type="inline"
                  items={allWorkspaces}
                  onChange={(e) => setSelectedWorkspace(e)}
                  {...(handleWorkspaceItemsToString
                    ? { itemToString: handleWorkspaceItemsToString }
                    : {})}
                  {...(renderWorkspaceSelectedItem
                    ? { renderSelectedItem: renderWorkspaceSelectedItem }
                    : {})}
                  {...(selectedWorkspace
                    ? { selectedItem: selectedWorkspace }
                    : {})}
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
                    productName={productName}
                    customContent={tile.customContent}></BaseTile>
                );
              })}
            </div>
          </Column>
        )}

        <div className={`${blockClass}__button-collapse--gradient`} />

        <div className={`${blockClass}__button-collapse--container`}>
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
   * Specify an optional className to be added to your Animated Header
   */
  className: PropTypes.string,

  /**
   * Provide short sentence in max. 3 lines related to product context
   */
  description: PropTypes.string,

  /**
   * Helper function passed to downshift that allows the library to render a
   * given item to a string label. By default, it extracts the `label` field
   * from a given item to serve as the item label in the list. (Dropdown
   * under description in header).
   */
  handleHeaderItemsToString: PropTypes.func,

  /**
   * Helper function passed to downshift that allows the library to render a
   * given item to a string label. By default, it extracts the `label` field
   * from a given item to serve as the item label in the list. (Dropdown
   * related to workspace selection).
   */
  handleWorkspaceItemsToString: PropTypes.func,

  /**
   * In-product imagery / lottie animation (.json) dim. 1312 x 738
   * (to update headerAnimation content storybook requires remount in toolbar)
   */
  headerAnimation: PropTypes.object,

  /**
   * In-product imagery / static imagery dim. 1312 x 738
   * Only active when headerAnimation is not in use
   */
  headerStatic: PropTypes.object,

  /**
   * Provide current product name
   */
  productName: PropTypes.string,

  /**
   * Helper function passed to downshift that allows the library to render a
   * selected item to as an arbitrary ReactNode. By default it uses standard Carbon renderer that renders only item.label text
   * (Dropdown under description in header)
   */
  renderHeaderSelectedItem: PropTypes.func,

  /**
   * Helper function passed to downshift that allows the library to render a
   * selected item to as an arbitrary ReactNode. By default it uses standard Carbon renderer that renders only item.label text
   * (Dropdown related to workspace selection)
   */
  renderWorkspaceSelectedItem: PropTypes.func,

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

  /**
   * Configuration for Carbon button or dropdown menu in header. Customized
   * tasks are used to allow users that have multiple roles and permissions
   * to experience better tailored content based on their need.
   */
  tasksConfig: PropTypes.object,

  /**
   * Specify the current username of active user
   */
  userName: PropTypes.string,

  /**
   * Specify the current welcome text on the header
   */
  welcomeText: PropTypes.string,

  /**
   * Specify the default workspace label above the tiles
   */
  workspaceLabel: PropTypes.string,
};

export default AnimatedHeader;
