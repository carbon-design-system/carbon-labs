/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LIGHTNESS_STEPS } from '@carbon-labs/v12-motion';
import {
  ClickableTile,
  ExpandableTile,
  RadioTile,
  SelectableTile,
  Tile,
} from '../index';
import {
  TileAboveTheFoldContent,
  TileBelowTheFoldContent,
} from '../components/ExpandableTile';
import { tileSteps } from '../components/Tile';

describe('Tile family', () => {
  it('steps a quiet hover half the house step on light themes and three quarters on dark', () => {
    expect(tileSteps('quiet')).toEqual({
      ...LIGHTNESS_STEPS,
      hoverLight: LIGHTNESS_STEPS.hoverLight / 2,
      hoverDark: (LIGHTNESS_STEPS.hoverDark * 3) / 4,
    });
    expect(tileSteps('standard')).toBeUndefined();
  });

  it('renders static, clickable, selectable, radio and expandable tiles with their base and modifier classes', () => {
    expect(renderToStaticMarkup(<Tile>Static</Tile>)).toContain(
      'cds-kit-tile cds-kit-tile--static'
    );
    expect(
      renderToStaticMarkup(<ClickableTile href="#a">Link</ClickableTile>)
    ).toContain('cds-kit-tile cds-kit-tile--clickable');
    const selected = renderToStaticMarkup(
      <SelectableTile id="s1" selected>
        Pick
      </SelectableTile>
    );
    expect(selected).toContain('cds-kit-tile--selectable');
    expect(selected).toContain('cds-kit-tile--selected');
    expect(selected).toContain('checked=""');

    const radio = renderToStaticMarkup(
      <RadioTile id="r1" name="group" value="a" checked>
        Choice
      </RadioTile>
    );
    expect(radio).toContain('cds-kit-tile--radio');
    expect(radio).toContain('cds-kit-tile--selected');

    const expandable = renderToStaticMarkup(
      <ExpandableTile expanded>
        <TileAboveTheFoldContent>Above</TileAboveTheFoldContent>
        <TileBelowTheFoldContent>Below</TileBelowTheFoldContent>
      </ExpandableTile>
    );
    expect(expandable).toContain('cds-kit-tile--expandable');
    expect(expandable).toContain('cds-kit-tile--expanded');
  });

  it("marks every interactive tile a surface, and a caller's ring or fill overrides the content's choice", () => {
    expect(
      renderToStaticMarkup(<ClickableTile href="#a">Link</ClickableTile>)
    ).toContain('data-rollover-surface=""');
    expect(
      renderToStaticMarkup(<SelectableTile id="s2">Pick</SelectableTile>)
    ).toContain('data-rollover-surface=""');
    expect(
      renderToStaticMarkup(
        <SelectableTile id="s3" data-rollover-surface="fill">
          Pick
        </SelectableTile>
      )
    ).toContain('data-rollover-surface="fill"');
    expect(
      renderToStaticMarkup(
        <ClickableTile href="#a" data-rollover-surface="ring">
          Link
        </ClickableTile>
      )
    ).toContain('data-rollover-surface="ring"');
  });
});
