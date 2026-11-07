/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import {
  useChannel,
  useParameter,
  useStorybookState,
} from 'storybook/manager-api';
import { Placeholder } from 'storybook/internal/components';
import { styled } from 'storybook/theming';
import { EVENTS, type V12Parameters } from './constants';
import type { MotionEntry, MotionReport } from './motion';

const Wrap = styled.div(({ theme }) => ({
  padding: 16,
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
}));

const Heading = styled.h3(({ theme }) => ({
  margin: '0 0 4px',
  fontSize: theme.typography.size.s2,
  fontWeight: theme.typography.weight.bold,
}));

const Note = styled.p(({ theme }) => ({
  margin: '0 0 12px',
  color: theme.textMutedColor,
}));

const Table = styled.table(({ theme }) => ({
  width: '100%',
  marginBottom: 20,
  borderCollapse: 'collapse',
  'th, td': {
    padding: '4px 8px 4px 0',
    textAlign: 'left',
    verticalAlign: 'top',
    borderBottom: `1px solid ${theme.appBorderColor}`,
  },
  th: { fontWeight: theme.typography.weight.bold },
  code: { fontFamily: theme.typography.fonts.mono },
}));

/**
 * The declared reduced behaviour as a sentence, with the clock it means.
 *
 * @param entry The motion item.
 * @param report Its report, for the reduced clock and the floor.
 * @returns The text.
 */
function reducedText(entry: MotionEntry, report: MotionReport): string {
  switch (entry.reduced) {
    case 'shorter-clock':
      return `the shorter clock, fades at ${report.reducedClock}x of the full duration`;
    case 'at-once':
      return `at once, on the floor (${report.floorMs}ms)`;
    case 'full':
      return 'the full clock';
    default:
      return 'not declared';
  }
}

/**
 * The Motion panel: what a story declares in `parameters.v12`, each motion
 * item with its tokens and values (read from the seam in the preview) and
 * its reduced behaviour.
 */
export function MotionPanel() {
  const params = useParameter<V12Parameters | undefined>('v12');
  const { storyId } = useStorybookState();
  const [report, setReport] = useState<MotionReport | null>(null);
  const emit = useChannel({
    [EVENTS.motion]: (next: MotionReport) => setReport(next),
  });
  useEffect(() => {
    emit(EVENTS.request);
  }, [storyId, emit]);

  if (!params) {
    return (
      <Placeholder>
        <>
          No <code>parameters.v12</code> on this story.
        </>
        <>
          Declare <code>motion</code> (the items it uses), <code>reduced</code>{' '}
          (each item's reduced behaviour) and <code>states</code> to see the
          motion, its tokens and their values here.
        </>
      </Placeholder>
    );
  }

  const current = report?.storyId === storyId ? report : null;
  if (!current) {
    return <Placeholder>Reading the story's motion.</Placeholder>;
  }

  return (
    <Wrap>
      {current.entries.length === 0 && (
        <Note>This story declares no motion.</Note>
      )}
      {current.entries.map((entry) => (
        <section key={entry.item}>
          <Heading>
            <code>{entry.item}</code>
          </Heading>
          <Note>Reduced motion: {reducedText(entry, current)}.</Note>
          {entry.rows.length === 0 ? (
            <Note>No seam export or registry token carries this name.</Note>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entry.rows.map((row) => (
                  <tr key={`${entry.item}-${row.name}`}>
                    <td>
                      <code>{row.name}</code>
                    </td>
                    <td>{row.value}</td>
                    <td>{row.status ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      ))}
      {current.states.length > 0 && (
        <Note>States: {current.states.join(', ')}.</Note>
      )}
      <Note>
        Shorter clock: fades at {current.reducedClock}x of the full duration, no
        travel. At once: every duration on the floor, {current.floorMs}ms.
      </Note>
    </Wrap>
  );
}
