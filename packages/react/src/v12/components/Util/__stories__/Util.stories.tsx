/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  FormStateContext,
  inertProps,
  parseCssColor,
  useFormFieldState,
} from '../index';
import mdx from './Util.mdx';

// The kit's shared helpers, not a component: they have no motion of their
// own. The reduced-motion getter and the loop visibility they hand the
// components read the viewer's preference and the page.
export default {
  title: 'V12/Util',
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: { motion: [], reduced: {}, states: ['rest'] },
  },
};

/** What a field inside reads: its own state, or its section's. */
function Field({ label, disabled }: { label: string; disabled?: boolean }) {
  const state = useFormFieldState(disabled);
  return (
    <tr>
      <td>{label}</td>
      <td>
        <code>{JSON.stringify(state)}</code>
      </td>
    </tr>
  );
}

const COLORS = ['#0f62fe', '#0f62fe80', 'rgb(36 161 72)'];

/** Form state from nested sections, colours as CSS writes them, and inert. */
export const Default = {
  render: () => (
    <>
      <table>
        <caption>Form state</caption>
        <tbody>
          <Field label="Outside a section" />
          <Field label="Its own disabled" disabled />
          <FormStateContext.Provider
            value={{ disabled: false, readOnly: true }}>
            <Field label="In a read-only section" />
          </FormStateContext.Provider>
        </tbody>
      </table>
      <table>
        <caption>Colours</caption>
        <tbody>
          {COLORS.map((c) => (
            <tr key={c}>
              <td>
                <code>{c}</code>
              </td>
              <td>
                <code>{JSON.stringify(parseCssColor(c))}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <caption>Inert</caption>
        <tbody>
          {[true, false].map((on) => (
            <tr key={String(on)}>
              <td>
                <code>inertProps({String(on)})</code>
              </td>
              <td>
                <code>{JSON.stringify(inertProps(on))}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ),
};
