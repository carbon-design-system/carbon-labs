/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Column, Dropdown, FluidDropdown, Grid, Link } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { Caption } from '../caption/caption';
import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface StorybookDemoProps {
  tall?: boolean | null;
  themeSelector?: boolean | null;
  wide?: boolean | null;
  fluid?: boolean | null;
  url: string;
  variants?: Array<{
    label: string;
    variant: string;
    /**
     * Defer loading this variant's iframe until it enters the viewport.
     * Use for stories that steal focus or cause scroll jank on mount
     * (e.g. ActionableNotification, Popover with autoAlign, Menu).
     */
    lazy?: boolean | null;
  }> | null;
}

/**
 * The `<StorybookDemo>` component displays an iframe embed for the storybook story
 * for a component. It has the option to show different variants and themes. It also has a
 * `wide` prop to span the full width, and `tall` for larger components. If you would like
 * to use the theme selector, please use the Carbon React Storybook url,
 * https://react.carbondesignsystem.com/?path=/story/components-button--default&globals=theme:g10
 *  as an example. The `themeSelector` appends `&globals=theme:g10` to the url.
 */
export const StorybookDemo: MdxComponent<StorybookDemoProps> = ({
  tall,
  themeSelector,
  wide,
  fluid,
  url,
  variants,
}) => {
  const themeItems = [
    {
      id: 'white',
      label: 'White',
      src: 'white',
    },
    {
      id: 'g10',
      label: 'Gray 10',
      src: 'g10',
    },
    {
      id: 'g90',
      label: 'Gray 90',
      src: 'g90',
    },
    {
      id: 'g100',
      label: 'Gray 100',
      src: 'g100',
    },
  ];

  const columnWidth = wide ? 12 : 8;

  const demoClassNames = clsx(withPrefix('storybook-demo'), {
    [withPrefix('tall')]: tall,
    [withPrefix('wide')]: wide,
  });

  const [theme, setTheme] = useState(themeItems[0]?.src ?? 'white');
  const onThemeChange = (item: {
    selectedItem: { src: React.SetStateAction<string> };
  }) => {
    setTheme(item.selectedItem.src);
  };

  const multipleVariants = variants && variants.length > 1;

  const [variant, setVariant] = useState(variants?.[0]?.variant);
  const currentVariantDef = variants?.find((v) => v.variant === variant);

  // A variant ID ending with "--lazy" (e.g. "components-menu--default--lazy")
  // opts that variant into deferred iframe loading. The suffix is stripped
  // before building the Storybook URL so the actual story ID is unaffected.
  // This lets Payload CMS authors opt in via the existing Variant ID field
  // without needing a separate field in the content schema.
  const isLazy =
    variant?.endsWith('--lazy') || currentVariantDef?.lazy === true;
  const storyId = variant?.endsWith('--lazy')
    ? variant.slice(0, -'--lazy'.length)
    : variant;

  const onVariantChange = (item: {
    selectedItem: { label: string; variant: string; lazy?: boolean | null };
  }) => {
    setVariant(item.selectedItem.variant);
  };

  const iframeUrl =
    url + '/iframe.html?id=' + storyId + '&globals=theme:' + theme;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Tracks whether the iframe has entered the viewport at least once.
  // Reset to false when switching to a new lazy variant so it waits again.
  const [isVisible, setIsVisible] = useState(!isLazy);

  useEffect(() => {
    // Non-lazy variants load immediately — no observer needed.
    if (!isLazy) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);

    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0 }
    );

    observer.observe(iframe);
    return () => {
      observer.disconnect();
    };
  }, [isLazy, variant]);

  // Only add border separator when BOTH theme and variant selectors are displayed
  const border = clsx({
    [withPrefix('theme-selector')]: themeSelector && multipleVariants,
  });

  // Use FluidDropdown (condensed) when fluid prop is true, otherwise use regular Dropdown
  const DropdownComponent = fluid ? FluidDropdown : Dropdown;
  const fluidProps = fluid ? { isCondensed: true } : {};

  return (
    <>
      <Grid condensed className={withPrefix('demo-dropdowns')}>
        {themeSelector && (
          <Column sm={2} md={4}>
            <DropdownComponent
              id="theme-selector"
              titleText="Theme selector"
              label="theme"
              items={themeItems}
              itemToString={(item) => item?.label || ''}
              onChange={onThemeChange}
              initialSelectedItem={themeItems[0]}
              className={border}
              {...fluidProps}
            />
          </Column>
        )}
        {multipleVariants && (
          <Column sm={2} md={4}>
            <DropdownComponent
              id="variant-selector"
              titleText="Variant selector"
              label="variant"
              items={variants}
              itemToString={(item) => item?.label || ''}
              initialSelectedItem={variants[0]}
              onChange={onVariantChange}
              {...fluidProps}
            />
          </Column>
        )}
      </Grid>
      <Grid condensed>
        <Column sm={4} md={8} lg={columnWidth} className={demoClassNames}>
          <iframe
            ref={iframeRef}
            title="Component demo"
            className={withPrefix('iframe')}
            src={isVisible ? iframeUrl : undefined}
            frameBorder="no"
            sandbox="allow-forms allow-scripts"
          />
        </Column>
      </Grid>
      <Grid>
        <Column sm={4} md={7}>
          <Caption>
            This live demo contains only a preview of functionality and styles
            available for this component. View the{' '}
            <Link
              href={`${url}/?path=/story/${variant}&globals=theme:${theme}`}>
              full demo
            </Link>{' '}
            on Storybook for additional information such as its version,
            controls, and API documentation.
          </Caption>
        </Column>
      </Grid>
    </>
  );
};

StorybookDemo.propTypes = {
  /**
   * Use FluidDropdown instead of regular Dropdown for selectors
   */
  fluid: PropTypes.bool,
  /**
   * Storybook demo height
   */
  tall: PropTypes.bool,
  /**
   * Storybook demo display or hide theme selector
   */
  themeSelector: PropTypes.bool,
  /**
   * Storybook demo url to change themes and variants
   */
  url: PropTypes.string.isRequired,
  /**
   * Storybook demo variants for the specified component
   */
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      lazy: PropTypes.bool,
      variant: PropTypes.string.isRequired,
    }).isRequired
  ),
  /**
   * Storybook demo width
   */
  wide: PropTypes.bool,
};
