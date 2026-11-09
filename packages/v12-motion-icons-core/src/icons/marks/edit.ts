/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AssetEdit32 from '@carbon/icons/es/asset--edit/32.js';
import SettingsEdit32 from '@carbon/icons/es/settings--edit/32.js';
import TaskEdit32 from '@carbon/icons/es/task--edit/32.js';
import {
  makeStatusMarkIcon,
  type MarkType,
  type StatusMarkSpec,
} from '../../utils/statusMark';
import { movePath, pathPoints, type Pt } from '../../geometry';
import { carbonArt, withStatic } from '../../engine';
import { assetArc, assetCalm } from './bases';
import { GEAR_TIMING, settingsEditBase as settingsEditBaseOf } from './gear';

/**
 * The edit family: Carbon's `<base>--edit` badges on the status-mark system
 * (utils/statusMark.ts), as the add family. Carbon has one drawing of each
 * for every size.
 *
 * The mark is Carbon's small pencil (its tip at the lower left). Its hover: the pencil
 * pushes 2px along its own axis, towards its tip, as one rigid piece (the
 * set's 2px for a glyph on a mark). Moving along its axis, its long sides keep
 * their distance to whatever runs beside them, so only the walls by its tip
 * make room.
 *
 * The base plays its own hover (Asset's, Task's; Settings' gear turns under a
 * window that moves with the pencil: gear.ts), and its open ends draw back
 * along their walls (round their ring, for the asset) just enough to keep
 * their resting space to the pencil.
 *
 * Outside this system: Filter edit and Tag edit
 * (their own reference motions). Contour edit (watson-health) has no pencil: it's a
 * contour being drawn, not an edit badge.
 */

/** Where a pencil sits: Carbon's drawing of it (its outline first, then its two knockouts). */
export interface PencilPlace {
  d: string;
}
/** How far the pencil pushes, along its axis towards its tip. */
export const PENCIL_REACH = 2;
/** The pencil's axis, towards its tip (lower left). */
export const PENCIL_AXIS: Pt = [-Math.SQRT1_2, Math.SQRT1_2];
const pencilAt = (p: PencilPlace, h: number) =>
  movePath(
    p.d,
    PENCIL_AXIS[0] * PENCIL_REACH * h,
    PENCIL_AXIS[1] * PENCIL_REACH * h
  );

/** The edit mark: the pencil pushes 2px along its axis, down and to the left. */
export const PENCIL: MarkType<PencilPlace> = {
  d: pencilAt,
  // Its outline (the first subpath).
  ink: (p, h) => [pathPoints(pencilAt(p, h), 0.25)],
};

type Spec = StatusMarkSpec<PencilPlace>;
const UP: Pt = [0, -1];
const LEFT: Pt = [-1, 0];
const norm = ([x, y]: Pt): Pt => [x / Math.hypot(x, y), y / Math.hypot(x, y)];

// The asset: its small ring and its body (rings about (12, 20)), and its socket.
export const ASSET_EDIT: Spec = {
  base: {
    // Asset's hover: every radius grows 1px.
    calm: assetCalm,
    calmArc: assetArc,
    d:
      'M12 24C11.2983 24 10.6064 23.8145 9.9995 23.4639C9.3931 23.1143 8.8867 22.6075 8.5356 22C8.185 21.3926 8 20.7012 8 20S8.1851 18.6074 8.5356 18C8.8872 17.3926 9.393 16.8867 10 16.5356C11.2183 15.8335 12.7876 15.8349 14.001 16.5366C14.6084 16.8877 15.1148 17.3945 15.4649 18.001L13.7325 19.001C13.5577 18.6973 13.3043 18.4444 13.0001 18.2686C12.3937 17.917 11.608 17.918 10.9996 18.2676C10.6969 18.4424 10.4434 18.6963 10.2677 19.001C10.0929 19.3037 10.0001 19.6494 10.0001 20S10.0929 20.6963 10.2682 21S10.6959 21.5566 10.9992 21.7314C11.3039 21.9072 11.6496 22 12.0002 22V24Z' +
      'M30 6C30 6.72 29.81 7.4 29.46 7.99L29.43 8.05L26.35 14H24.1L26.18 9.99C26.12 10 26.06 10 26 10C23.79 10 22 8.21 22 6C22 5.94 22 5.89 22.01 5.83L13.63 10.16C14.81 10.34 15.96 10.74 17 11.34C18.52 12.22 19.78 13.48 20.66 15L18.93 16C18.23 14.79 17.21 13.77 16 13.07C13.57 11.67 10.43 11.67 8 13.07C6.79 13.77 5.77 14.79 5.07 16C4.37 17.21 4 18.6 4 20S4.37 22.79 5.07 24C5.77 25.21 6.79 26.23 8 26.93S10.6 28 12 28V30C10.25 30 8.52 29.54 7 28.66S4.22 26.52 3.34 25C2.46 23.48 2 21.75 2 20S2.46 16.52 3.34 15C4.2199 13.48 5.48 12.22 7 11.34C7.3 11.17 7.6 11.01 7.92 10.88V10.87L23.92 2.58V2.59C24.53 2.21 25.24 2 26 2C28.21 2 30 3.79 30 6Z' +
      'M27.69 7.07C27.89 6.76 28 6.39 28 6C28 4.9 27.1 4 26 4S24 4.9 24 6S24.9 8 26 8C26.69 8 27.3 7.65 27.66 7.12L27.69 7.07Z',
    ends: [
      {
        at: [
          [12, 24],
          [12.0002, 22],
        ],
        back: { c: [12, 20], turn: 1 },
      },
      {
        at: [
          [15.4649, 18.001],
          [13.7325, 19.001],
        ],
        back: { c: [12, 20], turn: -1 },
      },
      {
        at: [
          [12, 28],
          [12, 30],
        ],
        back: { c: [12, 20], turn: 1 },
      },
      {
        at: [
          [20.66, 15],
          [18.93, 16],
        ],
        back: { c: [12, 20], turn: -1 },
      },
      {
        at: [
          [26.35, 14],
          [24.1, 14],
        ],
        back: /* @__PURE__ */ norm([0.46, -0.888]),
      },
    ],
  },
  baseMotion: 'calm',
  mark: PENCIL,
  place: {
    d:
      'M29.71 20.71L23.71 26.71L20.41 30H16V25.59L19.29 22.29L25.29 16.29C25.68 15.9 26.32 15.9 26.71 16.29L29.71 19.29C30.1 19.68 30.1 20.32 29.71 20.71Z' +
      'M24.59 23L23 21.41L20.71 23.71L18 26.41V28H19.59L22.29 25.29L24.59 23Z' +
      'M27.59 20L26 18.41L24.41 20L26 21.59L27.59 20Z',
  },
};
export const AssetEditSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('AssetEdit', ASSET_EDIT),
  /* @__PURE__ */ carbonArt(AssetEdit32)
);

// Settings' gear as the badge draws it (cut at the bottom and at its upper
// right tooth), the hub whole. On hover the gear turns as Settings' does under
// a window that moves with the pencil, and the hub's cut follows the pencil if
// it ever comes within its resting space (gear.ts).
const SETTINGS_PENCIL: PencilPlace = {
  d:
    'M31.707 19.2929L28.707 16.2929C28.3164 15.9023 27.6836 15.9023 27.2929 16.2929L17.9999 25.5859V30H22.414L31.707 20.707C32.0976 20.3164 32.0976 19.6836 31.707 19.2929Z' +
    'M21.5859 27.9999H20V26.414L25 21.414L26.5859 22.9999L21.5859 27.9999Z' +
    'M28 21.5858L26.4141 19.9999L28 18.414L29.5859 19.9999L28 21.5858Z',
};
const SETTINGS_EDIT_REST = /* @__PURE__ */ PENCIL.ink(SETTINGS_PENCIL, 0);
/** Settings edit's base at hover h (the gear turned under its window, the hub's cut open), and how far the hub's cut has opened. */
export const settingsEditBase = (h: number) =>
  settingsEditBaseOf(
    h,
    PENCIL.ink(SETTINGS_PENCIL, h),
    SETTINGS_EDIT_REST,
    PENCIL_AXIS[0] * PENCIL_REACH * h,
    PENCIL_AXIS[1] * PENCIL_REACH * h
  );
export const SETTINGS_EDIT: Spec = {
  base: {
    d:
      'M27.5474 12.0005L29.2796 11.0005L26.9442 6.9561C26.579 6.3233 25.9108 5.9556 25.212 5.9556C24.9986 5.9556 24.7826 5.9898 24.5714 6.0616L22.1373 6.8848C21.7193 6.6036 21.2813 6.3496 20.8253 6.1265L20.3216 3.6079C20.1346 2.6728 19.3138 2 18.3604 2H13.6397C12.6863 2 11.8655 2.6729 11.6785 3.6079L11.1748 6.1265C10.7158 6.3511 10.2686 6.5957 9.8481 6.8799L7.4287 6.0615C7.2175 5.9897 7.0015 5.9555 6.7881 5.9555C6.0894 5.9555 5.4212 6.3232 5.0559 6.956L2.6953 11.0439C2.2187 11.8696 2.3911 12.9169 3.1072 13.5463L5.0381 15.2431C5.021 15.4946 5 15.7446 5 15.9999C5 16.2577 5.0103 16.5126 5.0278 16.7655L3.1071 18.4535C2.391 19.0829 2.2187 20.1303 2.6952 20.9559L5.0558 25.0438C5.421 25.6766 6.0892 26.0443 6.788 26.0443C7.0014 26.0443 7.2177 26.0101 7.4286 25.9383L9.8627 25.1151C10.2807 25.3968 10.7187 25.6503 11.1747 25.8734L11.6784 28.392C11.8654 29.3271 12.6862 29.9999 13.6396 29.9999H16V27.9999H13.6396L12.9294 24.4491C11.9541 24.0931 11.0268 23.5429 10.2346 22.8778L6.7878 24.0438L4.4274 19.9559L7.1527 17.5609C6.9689 16.5179 6.9613 15.4779 7.1456 14.433L4.4273 12.0438L6.7884 7.9559L10.2152 9.1151C11.0184 8.4388 11.9447 7.91 12.9293 7.5506L13.6395 3.9998H18.3602L19.0704 7.5506C20.0457 7.9066 20.9727 8.4568 21.7652 9.1219L25.212 7.9559L27.5472 12.0003Z' +
      'M16 22C12.6357 22 10 19.3643 10 16S12.6357 10 16 10S22 12.6357 22 16S19.3643 22 16 22ZM16 12C13.7197 12 12 13.7197 12 16S13.7197 20 16 20S20 18.2803 20 16S18.2803 12 16 12Z',
    at: (h) => settingsEditBase(h).d,
  },
  mark: PENCIL,
  place: SETTINGS_PENCIL,
  timing: GEAR_TIMING,
};
export const SettingsEditSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('SettingsEdit', SETTINGS_EDIT),
  /* @__PURE__ */ carbonArt(SettingsEdit32)
);

export const TASK_EDIT: Spec = {
  base: {
    d: 'M25 5H22V4C22 2.9 21.1 2 20 2H12C10.9 2 10 2.9 10 4V5H7C5.9 5 5 5.9 5 7V28C5 29.1 5.9 30 7 30H12V28H7V7H10V10H22V7H25V13H27V7C27 5.9 26.1 5 25 5ZM20 8H12V4H20V8Z',
    // The right wall's end follows the pencil's top down, keeping the space above the pencil
    // consistent, holding Carbon's 3px; the bottom wall's end draws back from its tip.
    ends: [
      {
        at: [
          [25, 13],
          [27, 13],
        ],
        back: UP,
        follow: 3,
      },
      {
        at: [
          [12, 30],
          [12, 28],
        ],
        back: LEFT,
      },
    ],
  },
  mark: PENCIL,
  place: {
    d:
      'M29.71 19.29L26.71 16.29C26.32 15.9 25.68 15.9 25.29 16.29L22.29 19.29L16 25.59V30H20.41L26.71 23.71L29.71 20.71C30.1 20.32 30.1 19.68 29.71 19.29Z' +
      'M19.59 28H18V26.41L23 21.42L24.58 23L19.59 28Z' +
      'M26 21.59L24.41 20L26 18.41L27.59 20L26 21.59Z',
  },
};
export const TaskEditSpec = /* @__PURE__ */ withStatic(
  makeStatusMarkIcon('TaskEdit', TASK_EDIT),
  /* @__PURE__ */ carbonArt(TaskEdit32)
);
