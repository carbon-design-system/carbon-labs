/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React, {
  ElementType,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Grid, Column, Button, Tooltip } from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/icons-react';
import lottie from 'lottie-web';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

import { BaseTile } from '../Tiles/index';
import TasksController, {
  TasksControllerProps,
} from '../TasksController/TasksController';
import WorkspaceSelector, {
  WorkspaceSelectorProps,
} from '../WorkspaceSelector/WorkspaceSelector';

/** Animated Header */

export interface Tile {
  href?: string | null;
  id: string;
  mainIcon?: ElementType | null;
  secondaryIcon?: ElementType | null;
  subtitle?: string | null;
  title?: string | null;
  customContent?: ReactNode | null;
  isLoading?: boolean;
  isDisabled?: boolean;
  isInteractive?: boolean;
}

export interface TileGroup {
  id: number;
  label: string;
  tiles: Tile[];
}

export type AnimatedHeaderProps = {
  allTileGroups?: TileGroup[];
  selectedTileGroup?: TileGroup;
  setSelectedTileGroup: (e) => void;
  description?: string;
  headerAnimation?: object;
  headerStatic?: React.JSX.Element;
  productName?: string;
  userName?: string;
  welcomeText?: string;
  isLoading?: boolean;
  disabledTaskLabel?: string;
  expandButtonLabel?: string;
  collapseButtonLabel?: string;
  tileClickHandler?: (tile: Tile) => void;
} & TasksControllerProps &
  WorkspaceSelectorProps;

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  allTileGroups,
  selectedTileGroup,
  setSelectedTileGroup,
  description,
  headerAnimation,
  headerStatic,
  productName = '[Product name]',
  userName,
  welcomeText,
  tasksControllerConfig,
  workspaceSelectorConfig,
  isLoading,
  disabledTaskLabel,
  expandButtonLabel = 'Expand',
  collapseButtonLabel = 'Collapse',
  tileClickHandler,
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
              // eslint-disable-next-line react/forbid-dom-props
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

        {(description || tasksControllerConfig) && (
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
            <TasksController
              tasksControllerConfig={tasksControllerConfig}
              isLoading={isLoading}
              allTileGroups={allTileGroups}
              selectedTileGroup={selectedTileGroup}
              setSelectedTileGroup={setSelectedTileGroup}
            />
          </Column>
        )}

        {selectedTileGroup && (
          <Column sm={4} md={8} lg={12} className={`${blockClass}__content`}>
            {workspaceSelectorConfig?.allWorkspaces?.length && (
              <div
                className={`${blockClass}__workspace--container${
                  !open ? ` ${contentCollapsed}` : ''
                }`}>
                <WorkspaceSelector
                  workspaceSelectorConfig={workspaceSelectorConfig}
                  userName={userName}
                  isLoading={isLoading}
                />
              </div>
            )}
            <div className={`${blockClass}__tiles-container`}>
              {selectedTileGroup.tiles.map((tile) => {
                return (
                  <BaseTile
                    onClick={() => tileClickHandler?.(tile)}
                    key={tile.id}
                    id={tile.id}
                    open={open}
                    href={tile.href}
                    mainIcon={tile.mainIcon}
                    secondaryIcon={tile.secondaryIcon}
                    title={tile.title}
                    subtitle={tile.subtitle}
                    productName={productName}
                    customContent={tile.customContent}
                    isLoading={isLoading || tile.isLoading}
                    isDisabled={tile.isDisabled}
                    disabledTaskLabel={disabledTaskLabel}
                    isInteractive={tile.isInteractive}
                  />
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
            {open ? collapseButtonLabel : expandButtonLabel}
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
  allTileGroups: PropTypes.arrayOf(PropTypes.object),

  /**
   * Specify an optional className to be added to your Animated Header
   */
  className: PropTypes.string,

  /**
   * Custom collapse button label
   */
  collapseButtonLabel: PropTypes.string,

  /**
   * Provide short sentence in max. 3 lines related to product context
   */
  description: PropTypes.string,

  /**
   * Custom expand button label
   */
  expandButtonLabel: PropTypes.string,

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
   * Check if is loading
   */
  isLoading: PropTypes.bool,

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
   * Provide function to be called when switching selected tile group
   */
  setSelectedTileGroup: PropTypes.func,

  /**
   * Configuration for Carbon button or dropdown menu in header. Customized
   * tasks are used to allow users that have multiple roles and permissions
   * to experience better tailored content based on their need.
   * It also allows to override Carbon Button props by specifying them in tasksConfig.button.propsOverrides
   * or to override Carbon Dropdown props by specifying them in tasksConfig.dropdown.propsOverrides.
   */
  tasksControllerConfig: PropTypes.shape({
    type: PropTypes.oneOf(['button', 'dropdown']).isRequired,
    button: PropTypes.shape({
      text: PropTypes.string.isRequired,
      // Override Carbon Button props
      propsOverrides: PropTypes.object,
    }),
    dropdown: PropTypes.shape({
      allTileGroups: PropTypes.arrayOf(PropTypes.object),
      selectedTileGroup: PropTypes.object,
      setSelectedTileGroup: PropTypes.func.isRequired,
      // Override Carbon Dropdown props
      propsOverrides: PropTypes.object,
    }),
  }),

  /**
   * Handler for tile clicks
   */
  tileClickHandler: PropTypes.func,

  /**
   * Specify the current username of active user
   */
  userName: PropTypes.string,

  /**
   * Specify the current welcome text on the header
   */
  welcomeText: PropTypes.string,

  /**
   * Configuration for Carbon dropdown for workspace selection. To override Carbon Dropdown props use workspaceSelectorConfig.propsOverride
   */
  workspaceSelectorConfig: PropTypes.shape({
    // Override Carbon Dropdown props
    propsOverrides: PropTypes.object,
    allWorkspaces: PropTypes.arrayOf(PropTypes.object),
    selectedWorkspace: PropTypes.object,
    setSelectedWorkspace: PropTypes.func.isRequired,
  }),
};

export default AnimatedHeader;
