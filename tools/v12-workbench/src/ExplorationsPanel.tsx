/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { Placeholder } from 'storybook/internal/components';
import { styled } from 'storybook/theming';
import { explorationsFor, markPlace } from './explorations';

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

const List = styled.ul(({ theme }) => ({
  margin: '0 0 20px',
  padding: 0,
  listStyle: 'none',
  li: {
    padding: '4px 0',
    borderBottom: `1px solid ${theme.appBorderColor}`,
  },
  code: { fontFamily: theme.typography.fonts.mono },
}));

const Place = styled.code(({ theme }) => ({
  display: 'block',
  color: theme.textMutedColor,
}));

/**
 * A mark's text, its backticked names as code.
 *
 * @param {{ text: string }} props The text.
 * @returns {React.ReactNode} The text.
 */
function MarkText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/)
        .map((part, i) =>
          part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
            <code key={i}>{part.slice(1, -1)}</code>
          ) : (
            part
          )
        )}
    </>
  );
}

/**
 * The Explorations panel: the story's component's `@carbon-explore` and
 * `@carbon-proposal` marks, from the committed map, grouped by kind.
 */
export function ExplorationsPanel() {
  const api = useStorybookApi();
  // Read the state so the panel renders again when the story changes.
  const { storyId } = useStorybookState();
  const title = storyId ? api.getCurrentStoryData()?.title : undefined;
  const groups = explorationsFor(title);

  if (groups.length === 0) {
    return <Placeholder>No explorations or proposals.</Placeholder>;
  }

  return (
    <Wrap>
      {groups.map((group) => (
        <section key={group.kind}>
          <Heading>{group.heading}</Heading>
          <List>
            {group.marks.map((mark) => (
              <li key={`${mark.file}:${mark.line}`}>
                <MarkText text={mark.text} />
                <Place>{markPlace(mark)}</Place>
              </li>
            ))}
          </List>
        </section>
      ))}
    </Wrap>
  );
}
