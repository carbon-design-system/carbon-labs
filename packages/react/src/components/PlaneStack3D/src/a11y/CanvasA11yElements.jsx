/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, useCallback } from 'react';
import {
  DEFAULT_A11Y_COPY,
  SR_ONLY_STYLE,
  resolveI18nMessage,
} from './messages';

function CanvasA11yElements({
  enableA11y,
  instructionsId,
  i18n,
  a11yItems,
  activeLayer,
  registerGroupButton,
  registerA11yButton,
  onGroupFocus,
  onGroupActivate,
  onItemFocus,
  onItemClick,
}) {
  const getA11yItemLabel = useCallback(
    (item, index, total) => {
      const baseParams = {
        label: item.label,
        index,
        position: index + 1,
        total,
        layer: item.layer,
      };

      if (item.layer === 'primary') {
        return resolveI18nMessage(
          i18n,
          'primaryItemLabel',
          `Primary item ${index + 1} of ${total}: ${item.label}`,
          baseParams
        );
      }
      if (item.layer === 'core') {
        return resolveI18nMessage(
          i18n,
          'coreItemLabel',
          `Core item ${index + 1} of ${total}: ${item.label}`,
          baseParams
        );
      }
      return resolveI18nMessage(
        i18n,
        'foundationItemLabel',
        `Foundation item ${index + 1} of ${total}: ${item.label}`,
        baseParams
      );
    },
    [i18n]
  );

  if (!enableA11y) return null;

  const isLayerActive = (layer) => activeLayer === layer;

  const renderLayer = (layerKey, labelKey, fallbackLabel, items) => {
    if (!items.length) return null;

    return (
      <div
        role="group"
        aria-label={resolveI18nMessage(i18n, labelKey, fallbackLabel)}>
        <button
          ref={(node) => registerGroupButton(layerKey, node)}
          type="button"
          tabIndex={0}
          onFocus={() => onGroupFocus(layerKey)}
          onClick={() => onGroupActivate(layerKey)}
          aria-label={resolveI18nMessage(
            i18n,
            `${layerKey}LayerEntryLabel`,
            `${fallbackLabel}. Press Enter to browse ${fallbackLabel.toLowerCase()} items.`
          )}>
          {fallbackLabel}
        </button>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => registerA11yButton(item.id, node)}
            type="button"
            tabIndex={isLayerActive(layerKey) ? 0 : -1}
            onFocus={() => onItemFocus(layerKey, item.id)}
            onClick={() => onItemClick?.(item.id)}
            aria-label={getA11yItemLabel(item, index, items.length)}>
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <p id={instructionsId} style={SR_ONLY_STYLE}>
        {resolveI18nMessage(
          i18n,
          'canvasInstructions',
          DEFAULT_A11Y_COPY.canvasInstructions
        )}
      </p>
      <div style={SR_ONLY_STYLE}>
        {renderLayer(
          'primary',
          'primaryLayerGroupLabel',
          DEFAULT_A11Y_COPY.primaryLayerGroupLabel,
          a11yItems.primaryItems
        )}
        {renderLayer(
          'core',
          'coreLayerGroupLabel',
          DEFAULT_A11Y_COPY.coreLayerGroupLabel,
          a11yItems.coreItems
        )}
        {renderLayer(
          'foundation',
          'foundationLayerGroupLabel',
          DEFAULT_A11Y_COPY.foundationLayerGroupLabel,
          a11yItems.foundationItems
        )}
      </div>
    </>
  );
}

export default memo(CanvasA11yElements);
