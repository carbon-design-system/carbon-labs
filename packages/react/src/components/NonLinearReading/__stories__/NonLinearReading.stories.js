/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './NonLinearReading.mdx';
import { NonLinearReading } from '../components/NonLinearReading';
import '../components/non-linear-reading.scss';
import './storybook.scss';

export default {
  title: 'Components/NonLinearReading',
  component: NonLinearReading,
  parameters: {
    layout: 'padded',
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    definition: {
      table: {
        disable: true,
      },
    },
    theme: {
      control: { type: null },
    },
  },
};

// As a standalone component, each "story" is meaningless:
// just a pill for a keyword, expanding to show its definition.
// Should always be shown in context with surrounding text.

/**
 * A keyword pill that expands to reveal a single definition.
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
export const SingleLevel = (args) => {
  return (
    <div className="non-linear-reading-stories__viewport">
      XDR Connect’s correlation
      <NonLinearReading
        definition={
          <>
            This is a technical component that uses a set of rules to process
            alerts from your{' '}
            <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">
              sources
            </a>
            , and streamline threat analysis.
          </>
        }
        {...args}>
        engine,
      </NonLinearReading>{' '}
      creates a case by processing data from alerts across multiple security
      tools.
    </div>
  );
};

/**
 * Keywords can be nested so that a definition itself contains
 * further expandable keywords.
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
export const MultipleLevel = (args) => {
  return (
    <div className="non-linear-reading-stories__viewport">
      Findings are created by the alerts{' '}
      <NonLinearReading
        definition={
          <>
            We examine the alerts from each source, and{' '}
            <NonLinearReading
              definition="Correlation allows us to identify connections between common
                observables, tactics, and techniques, and to remove any
                duplicate data, thereby streamlining the investigation for you.">
              correlate
            </NonLinearReading>{' '}
            them together with{' '}
            <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">
              rules
            </a>
            . While a case can contain multiple alerts, a single finding can
            only be created from a single alert. So, when you select a finding,
            you can drill right down to the raw data behind it: the payload. We
            also use our{' '}
            <NonLinearReading
              definition="Our threat intelligence service contains an enrichment
                capability. During the enrichment process, we add context that
                is used to establish the severity of artifacts associated with
                a finding. This is what determines the severity of the finding
                itself. Bear in mind that each case can have multiple
                findings, and every finding will have its own severity.">
              threat intelligence service
            </NonLinearReading>{' '}
            to establish the severity of the artifacts.
          </>
        }
        {...args}>
        ingested
      </NonLinearReading>{' '}
      from your own security systems. The findings here are confirmed findings
      that have been created from alerts ingested from your own sources, before
      being enriched to create cases.
    </div>
  );
};

/**
 * Use `theme="dark"` on gradient or dark backgrounds.
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
export const WithGradientBackground = (args) => {
  return (
    <div className="non-linear-reading-stories__viewport">
      <div className="non-linear-reading-stories__gradient-bg">
        XDR Connect’s correlation
        <NonLinearReading
          definition={
            <>
              This is a technical component that uses a set of rules to process
              alerts from your{' '}
              <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">
                sources
              </a>
              , and streamline threat analysis.
            </>
          }
          theme="dark"
          {...args}>
          engine,
        </NonLinearReading>{' '}
        creates a case by processing data from alerts across multiple security
        tools.
      </div>
    </div>
  );
};
