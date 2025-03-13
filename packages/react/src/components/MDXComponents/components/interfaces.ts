/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Validator } from 'prop-types';
import { ReactElement, ReactPortal } from 'react';

interface MdxComponent<Props> {
  (props: Props): ReactElement<Props> | null;
  propTypes: { [prop in keyof Props]: Validator<Props[prop]> };
  defaultProps?: { [prop in keyof Props]?: Props[prop] };
  displayName?: string;
}

type NonScalarNode =
  | ReactElement
  | ReactPortal
  | Array<ReactElement | ReactPortal>;

export type { MdxComponent, NonScalarNode };
