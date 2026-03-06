/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { lazy, Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column, Button } from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/icons-react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { BaseTile } from '../Tiles/index';
import TasksController, {
  TasksControllerProps,
} from '../TasksController/TasksController';
import WorkspaceSelector, {
  WorkspaceSelectorProps,
} from '../WorkspaceSelector/WorkspaceSelector';
import HeaderTitle from '../HeaderTitle/HeaderTitle';
import StaticBackground from '../StaticBackground/StaticBackground';
import { Tile, TileGroup, AriaLabels } from './types';
import ContentSwitcherSelector, {
  type ContentSwitcherConfig,
} from '../ContentSwitcherSelector/ContentSwitcherSelector';
import HeaderAction from '../HeaderAction/HeaderAction';
import type { HeaderActionProps } from '../HeaderAction/header-action.types';

const AnimatedBackground = lazy(
  () => import('../AnimatedBackground/AnimatedBackground')
);

/** Animated Header */

export type AnimatedHeaderProps = {
  allTileGroups?: TileGroup[];
  ariaLabels?: AriaLabels;
  selectedTileGroup?: TileGroup;
  setSelectedTileGroup?: (e) => void;
  contentSwitcherConfig?: ContentSwitcherConfig;
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
  WorkspaceSelectorProps &
  HeaderActionProps;

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
  contentSwitcherConfig,
  headerActionConfig,
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

  const [isOpen, setIsOpen] = useState(true);

  const handleButtonCollapseClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className={blockClass} data-expanded={isOpen}>
      <Grid className={`${blockClass}__grid`}>
        <div className={`${blockClass}__gradient--overlay`} />

        <div className={`${blockClass}__container--gradient`} />

        {headerAnimation ? (
          typeof window !== 'undefined' && (
            <Suspense fallback={null}>
              <AnimatedBackground
                headerAnimation={headerAnimation}
                isOpen={isOpen}
              />
            </Suspense>
          )
        ) : (
          <StaticBackground headerStatic={headerStatic} />
        )}

        <Column sm={4} md={8} lg={16} className={`${blockClass}__title-row`}>
          <div className={`${blockClass}__title-and-actions`}>
            <HeaderTitle
              userName={userName}
              welcomeText={welcomeText}
              headerExpanded={isOpen}
              ariaLabels={ariaLabels}
            />

            {/* When using the ContentSwitcher, render it here (top row) */}
            {contentSwitcherConfig ? (
              <div className={`${blockClass}__actions`}>
                <ContentSwitcherSelector
                  contentSwitcherConfig={contentSwitcherConfig}
                  isLoading={isLoading || contentSwitcherConfig.isLoading}
                  headerExpanded={isOpen}
                />
              </div>
            ) : null}
          </div>
        </Column>

        {(description || tasksControllerConfig) && (
          <Column
            sm={4}
            md={8}
            lg={4}
            id={`${blockClass}-content`}
            className={`${blockClass}__left-area-container`}
            data-expanded={isOpen}>
            {description && (
              <h2
                className={`${blockClass}__description`}
                aria-label={ariaLabels?.description ?? `Header description`}>
                {description}
              </h2>
            )}
            {tasksControllerConfig && (
              <TasksController
                tasksControllerConfig={tasksControllerConfig}
                isLoading={isLoading}
                allTileGroups={allTileGroups}
                selectedTileGroup={selectedTileGroup}
                setSelectedTileGroup={setSelectedTileGroup}
              />
            )}
          </Column>
        )}

        {selectedTileGroup && (
          <Column sm={4} md={8} lg={12} className={`${blockClass}__content`}>
            {!!workspaceSelectorConfig?.allWorkspaces?.length && (
              <div
                className={`${blockClass}__workspace--container`}
                data-expanded={isOpen}>
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
              {selectedTileGroup.tiles.map((tile, index) => {
                const { tileId, ...rest } = tile as any;
                const legacyId = (tile as any).id; // old configs
                const resolvedTileId = tileId ?? legacyId;
                const key = resolvedTileId ?? `tile-${index}`;
                const hasAction =
                  tile.href || typeof tile.onClick === 'function';

                return (
                  <BaseTile
                    key={key}
                    tileId={resolvedTileId}
                    {...rest}
                    open={isOpen}
                    productName={productName}
                    isLoading={isLoading || tile.isLoading}
                    disabledTaskLabel={disabledTaskLabel}
                    onClick={
                      hasAction
                        ? (event: React.MouseEvent<HTMLElement>) => {
                            tileClickHandler?.(tile);
                            tile.onClick?.(event);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </Column>
        )}

        <div className={`${blockClass}__button-collapse--gradient`} />

        <div className={`${blockClass}__button-collapse--container`}>
          {headerActionConfig ? (
            <HeaderAction config={headerActionConfig} headerExpanded={isOpen} />
          ) : null}

          <Button
            id={`${blockClass}__button-collapse`}
            kind="ghost"
            renderIcon={isOpen ? ChevronUp : ChevronDown}
            onClick={handleButtonCollapseClick}
            aria-expanded={isOpen}
            aria-controls={`${blockClass}-content`}
            aria-label={
              isOpen
                ? ariaLabels?.collapseButton ?? 'Collapse header details'
                : ariaLabels?.expandButton ?? 'Expand header details'
            }>
            {isOpen ? collapseButtonLabel : expandButtonLabel}
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
   *  Configuration for Carbon Content Switcher in header.
   * Customized tasks are used to allow users that have multiple roles and
   * permissions to experience better tailored content based on their need.
   */
  contentSwitcherConfig: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string.isRequired,
        onSelect: PropTypes.func,
      }).isRequired
    ).isRequired,
    ariaLabel: PropTypes.string,
    isLoading: PropTypes.bool,
    lowContrast: PropTypes.bool,
    headerExpanded: PropTypes.bool,
    visibleCount: PropTypes.oneOf([2, 3]),
    onChange: PropTypes.func,
  }),

  /**
   * Provide short sentence in max. 3 lines related to product context
   */
  description: PropTypes.string,

  /**
   * Custom expand button label
   */
  expandButtonLabel: PropTypes.string,

  /**
   * Configuration for the header action control (icon button / ghost button / carousel - *coming soon*).
   * This sits to the left of the Collapse button and can trigger generic actions
   * (open modal/panel) or page through tiles.
   */
  headerActionConfig: PropTypes.shape({
    type: PropTypes.oneOf(['icon-button', 'ghost-button']).isRequired,

    // Carbon IconButton variant
    iconButton: PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      iconLabel: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      ariaLabel: PropTypes.string,
      // Override Carbon IconButton props if needed
      propsOverrides: PropTypes.object,
    }),

    // Carbon Ghost Button variant
    ghostButton: PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      ariaLabel: PropTypes.string,
      // Override Carbon Button props if needed
      propsOverrides: PropTypes.object,
    }),
  }),

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
   * Configuration for Carbon button / dropdown in header.
   * Customized tasks are used to allow users that have multiple roles and
   * permissions to experience better tailored content based on their need.
   */
  tasksControllerConfig: PropTypes.shape({
    type: PropTypes.oneOf(['button', 'dropdown']).isRequired,
    isLoading: PropTypes.bool,

    button: PropTypes.shape({
      text: PropTypes.string.isRequired,
      // Override Carbon Button props
      propsOverrides: PropTypes.object,
    }),

    dropdown: PropTypes.shape({
      label: PropTypes.string,
      ariaLabel: PropTypes.string,
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
