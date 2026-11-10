/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  useContext,
  useId,
  type CSSProperties,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { FormStateContext } from '@carbon-labs/react-util';
import './form-layout.scss';
import { cx } from '@carbon-labs/react-util';

/* ============================================================================
 * FormLayout, FormSection, FormRow: one layout for settings, create and edit
 * forms.
 *
 *   layout    sections 48px apart, at most the size's width
 *   section   a title and description 8px apart, the fields 24px below
 *   fields    32px apart, the room each field's message line opens into
 *   row       side by side from a 480px form, 16px apart; stacked under it
 *   state     a section's disabled and read-only reach every field in it
 *   motion    none: a form holds still while it is filled in
 *
 * API: Carbon's Form, FormGroup and Stack in one, plus size, columns.
 * ========================================================================== */

export type FormLayoutSize = 'narrow' | 'medium' | 'wide' | 'full';

export interface FormLayoutProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'children'
> {
  children?: ReactNode;
  /** `form` (default) or `div`, for a layout inside another form. */
  as?: 'form' | 'div';
  /** Its widest: narrow 320px, medium 640px (default), wide 960px or full. */
  size?: FormLayoutSize;
  /** Every field in it disabled. */
  disabled?: boolean;
  /** Every field in it read-only. */
  readOnly?: boolean;
}

export function FormLayout({
  children,
  as = 'form',
  size = 'medium',
  disabled = false,
  readOnly = false,
  className,
  ...rest
}: FormLayoutProps) {
  const outer = useContext(FormStateContext);
  const state = {
    disabled: disabled || outer.disabled,
    readOnly: readOnly || outer.readOnly,
  };
  const props = {
    ...rest,
    className: cx('cds-form-layout', `cds-form-layout--${size}`, className),
    'data-disabled': state.disabled || undefined,
    'data-readonly': state.readOnly || undefined,
  };
  return (
    <FormStateContext.Provider value={state}>
      {as === 'form' ? (
        <form {...props}>{children}</form>
      ) : (
        <div {...(props as HTMLAttributes<HTMLDivElement>)}>{children}</div>
      )}
    </FormStateContext.Provider>
  );
}

export interface FormSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'children'
> {
  children?: ReactNode;
  /** The section's title. */
  title?: ReactNode;
  /** A line under the title, 8px below it. */
  description?: ReactNode;
  /** The title's heading level. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Every field in the section disabled. */
  disabled?: boolean;
  /** Every field in the section read-only. */
  readOnly?: boolean;
}

export function FormSection({
  children,
  title,
  description,
  headingLevel = 3,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}: FormSectionProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-description`;
  const outer = useContext(FormStateContext);
  const state = {
    disabled: disabled || outer.disabled,
    readOnly: readOnly || outer.readOnly,
  };
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      {...rest}
      className={cx('cds-form-section', className)}
      aria-labelledby={title ? titleId : rest['aria-labelledby']}
      data-disabled={state.disabled || undefined}
      data-readonly={state.readOnly || undefined}>
      {(title || description) && (
        <header className="cds-form-section__header">
          {title && (
            <Heading id={titleId} className="cds-form-section__title">
              {title}
            </Heading>
          )}
          {description && (
            <p id={descId} className="cds-form-section__description">
              {description}
            </p>
          )}
        </header>
      )}
      {/* A fieldset, so a disabled section disables any control in it, the kit's or not. */}
      <fieldset
        className="cds-form-section__fields"
        disabled={state.disabled}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}>
        <FormStateContext.Provider value={state}>
          {children}
        </FormStateContext.Provider>
      </fieldset>
    </section>
  );
}

export interface FormRowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** How many columns side by side. Default: one per child. */
  columns?: number;
}

export function FormRow({
  children,
  columns,
  className,
  style,
  ...rest
}: FormRowProps) {
  const n = columns ?? Math.max(1, Children.toArray(children).length);
  return (
    <div
      {...rest}
      className={cx('cds-form-row', className)}
      style={{ ...style, '--cds-form-row-columns': n } as CSSProperties}>
      {children}
    </div>
  );
}
