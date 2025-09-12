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
import { Grid, Column, Button } from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/icons-react';
import lottie, { AnimationItem } from 'lottie-web';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

import { BaseTile } from '../Tiles/index';
import TasksController, {
  TasksControllerProps,
} from '../TasksController/TasksController';
import WorkspaceSelector, {
  WorkspaceSelectorProps,
} from '../WorkspaceSelector/WorkspaceSelector';
import HeaderTitle from '../HeaderTitle/HeaderTitle';

/** Animated Header */

export interface AriaLabels {
  welcome?: string;
  description?: string;
  collapseButton?: string;
  expandButton?: string;
  tilesContainer?: string;
}

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
  onClick?: () => void;
  ariaLabel?: string;
}

export interface TileGroup {
  id: number;
  label: string;
  tiles: Tile[];
}

export type AnimatedHeaderProps = {
  allTileGroups?: TileGroup[];
  ariaLabels?: AriaLabels;
  selectedTileGroup?: TileGroup;
  setSelectedTileGroup: (e) => void;
  description?: string;
  headerAnimation?: object;
  headerStatic?: React.JSX.Element | string;
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
  ariaLabels = {},
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
  const animRef = useRef<AnimationItem | null>(null);
  const [open, setOpen] = useState(true);
  const isReduced = window.matchMedia('(prefers-reduced-motion)').matches;

  const collapsed = `${blockClass}--collapsed`;
  const contentCollapsed = `${blockClass}__content--collapsed`;
  const descriptionCollapsed = `${blockClass}__left-area-container--collapsed`;
  const lottieCollapsed = `${blockClass}__lottie-animation--collapsed`;

  const handleButtonCollapseClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    // Make sure any prior instance is destroyed before creating a new one
    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
    }
    if (!animationContainer.current || !headerAnimation) return;

    const animation = lottie.loadAnimation({
      container: animationContainer.current as HTMLDivElement,
      animationData: headerAnimation as any,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    });
    animRef.current = animation;

    const onDomLoaded = () => {
      const data: any = (animation as any).animationData;
      const markers = data?.markers ?? [];
      const first = markers?.[0]?.tm ?? 0;

      const totalFrames = animation.getDuration(true);
      const second = markers?.[1]?.tm ?? totalFrames;

      if (isReduced) {
        // Respect reduced motion
        const restFrame =
          (typeof second === 'number' ? second : totalFrames * 0.5) | 0;
        animation.goToAndStop(restFrame, true);
        return;
      }

      animation.setSpeed(1);
      requestAnimationFrame(() => {
        if (typeof first === 'number' && typeof second === 'number') {
          animation.playSegments([first, second], true);
        } else {
          animation.play();
        }
      });
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
    <header className={`${blockClass}${!open ? ` ${collapsed}` : ''}`}>
      <Grid>
        <div className={`${blockClass}__gradient--overlay`} />

        <div className={`${blockClass}__container--gradient`} />

        {!headerAnimation && headerStatic && (
          <div className={`${blockClass}__static--container`}>
            <div
              className={`${blockClass}__static`}
              // eslint-disable-next-line react/forbid-dom-props
              style={{ backgroundImage: `url(${headerStatic})` }}
              aria-hidden="true"
            />
          </div>
        )}

        <div className={`${blockClass}__lottie-animation--container`}>
          <div
            ref={animationContainer}
            className={`${blockClass}__lottie-animation${
              !open ? ` ${lottieCollapsed}` : ''
            }`}
            aria-hidden="true"></div>
        </div>

        <Column sm={4} md={8} lg={16}>
          <HeaderTitle
            userName={userName}
            welcomeText={welcomeText}
            headerExpanded={open}
            ariaLabels={ariaLabels}
          />
        </Column>

        {(description || tasksControllerConfig) && (
          <Column
            sm={4}
            md={8}
            lg={4}
            id={`${blockClass}-content`}
            className={`${blockClass}__left-area-container${
              !open ? ` ${descriptionCollapsed}` : ''
            }`}>
            {description && (
              <h2
                className={`${blockClass}__description`}
                aria-label={ariaLabels?.description ?? `Header description`}>
                {description}
              </h2>
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
            {!!workspaceSelectorConfig?.allWorkspaces?.length && (
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
            <div
              className={`${blockClass}__tiles-container`}
              aria-label={ariaLabels?.tilesContainer ?? `Feature tiles`}
              role="list">
              {selectedTileGroup.tiles.map((tile) => {
                return (
                  <BaseTile
                    onClick={
                      tile.href || tile.onClick
                        ? () => {
                            tileClickHandler?.(tile);
                            tile.onClick?.();
                          }
                        : null
                    }
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
                    ariaLabel={tile.ariaLabel}
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
            onClick={handleButtonCollapseClick}
            aria-expanded={open}
            aria-controls={`${blockClass}-content`}
            aria-label={
              open
                ? ariaLabels?.collapseButton ?? 'Collapse header details'
                : ariaLabels?.expandButton ?? 'Expand header details'
            }>
            {open ? collapseButtonLabel : expandButtonLabel}
          </Button>
        </div>
      </Grid>
    </header>
  );
};

(AnimatedHeader as React.FC).displayName = 'Animated Header';
(AnimatedHeader as React.FC).propTypes = {
  /**
   * Array of each tile group setup
   */
  allTileGroups: PropTypes.arrayOf(PropTypes.object),

  /**
   * Provide custom aria labels for each part of the header.
   */
  ariaLabels: PropTypes.object,

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
