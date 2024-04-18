/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { LinkObject, type NodeObject } from 'force-graph';

export type CustomNode = NodeObject & {
  x: number;
  y: number;
  color?: string;
  bgColor?: string;
  borderAccent?: string;
};

export type CustomLinks = LinkObject & {
  source: {
    x: number;
    y: number;
  };
  target: {
    x: number;
    y: number;
  };
};
