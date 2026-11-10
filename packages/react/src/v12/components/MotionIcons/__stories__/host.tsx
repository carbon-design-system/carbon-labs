/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The pages' controls on the v12 components (GalleryUIContext,
 * statusControls.tsx): the content switcher; the Button, ghost, for the
 * pages' one-shot buttons (Trigger, +5, a card's code Copy); and the number
 * input for a notification's count. Without them the pages fall back to
 * Carbon's class names.
 */
import React, { useMemo, useRef } from 'react';
import { Button } from '@carbon-labs/react-button';
import { ContentSwitcher, Switch } from '@carbon-labs/react-content-switcher';
import { NumberInput } from '@carbon-labs/react-number-input';
import {
  GalleryUIContext,
  useGalleryUI,
  type GalleryUI,
} from './statusControls';

type SwitcherProps = React.ComponentProps<NonNullable<GalleryUI['Switcher']>>;
type ButtonProps = React.ComponentProps<NonNullable<GalleryUI['Button']>>;
type NumberProps = React.ComponentProps<NonNullable<GalleryUI['NumberInput']>>;

function HostSwitcher({
  labels,
  selectedIndex,
  onSelect,
  size,
  label,
}: SwitcherProps) {
  return (
    <ContentSwitcher
      size={size}
      selectedIndex={selectedIndex}
      aria-label={label}
      onChange={({ index }) =>
        index != null && index !== selectedIndex && onSelect(index)
      }>
      {labels.map((l) => (
        <Switch key={l} name={l} text={l} />
      ))}
    </ContentSwitcher>
  );
}

function HostButton({
  children,
  onClick,
  disabled,
  title,
  kind = 'ghost',
  'aria-label': ariaLabel,
}: ButtonProps) {
  // An icon button draws its icon through `renderIcon`: one component for the
  // button's life, so the icon (and its ref) isn't remounted on each render.
  const icon = useRef(children);
  icon.current = children;
  const Icon = useMemo(
    () =>
      function HostButtonIcon() {
        return <>{icon.current}</>;
      },
    []
  );
  return kind === 'icon' ? (
    <Button
      frame="ghost"
      size="sm"
      hasIconOnly
      renderIcon={Icon}
      iconDescription={ariaLabel ?? title}
      onClick={onClick}
      disabled={disabled}
    />
  ) : (
    <Button
      frame="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      data-motion-icon-frame="">
      {children}
    </Button>
  );
}

function HostNumberInput({ value, onChange, label }: NumberProps) {
  const id = React.useId();
  return (
    <div style={{ inlineSize: '8.5rem' }}>
      <NumberInput
        id={id}
        label={label}
        hideLabel
        size="sm"
        min={0}
        step={1}
        value={value}
        onChange={(_, { value: v }) => {
          const n = Number.parseInt(String(v), 10);
          onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
        }}
      />
    </div>
  );
}

/** A story decorator: the pages' controls on the v12 components. */
export function WithV12Controls(Story: React.ComponentType) {
  const ui = useGalleryUI();
  const value = useMemo<GalleryUI>(
    () => ({
      ...ui,
      Switcher: HostSwitcher,
      Button: HostButton,
      NumberInput: HostNumberInput,
    }),
    [ui]
  );
  return (
    <GalleryUIContext.Provider value={value}>
      <Story />
    </GalleryUIContext.Provider>
  );
}
